import { Router, Response } from "express";
import * as bcrypt from "bcrypt";
import prisma from "../db";
import {
    authenticate,
    AuthRequest,
    type AuthRole
} from "../middleware/auth.middleware";
import {
    createSessionAndIssueTokens,
    rotateRefreshToken,
    issueStreamToken,
    verifyStreamToken
} from "../auth/token.service";
import { logSecurityEvent } from "../auth/audit.service";
import { authLimiter, refreshLimiter } from "../auth/rate-limit";

const router = Router();

const isProd = process.env.NODE_ENV === "production";

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isLocalhost = process.env.FRONTEND_URL?.includes("localhost") || process.env.NODE_ENV !== "production";
    const cookieOptions = {
        httpOnly: true,
        secure: !isLocalhost,
        sameSite: "lax" as const,
        path: "/"
    };
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);
}

function clearAuthCookies(res: Response) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
}

function toTokenIdentity(user: {
    id: string;
    email: string;
    role: AuthRole;
    collegeId: string | null;
}) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId
    };
}

router.post("/register", authLimiter, async (req: AuthRequest, res: Response) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            rollNumber,
            collegeId,
            department,
            semester,
            batch,
        } = req.body;

        if (!password || password.length < 8) {
            res
                .status(400)
                .json({ error: "Password must be at least 8 characters" });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            logSecurityEvent({
                action: "LOGIN_FAILED",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                metadata: { email, reason: "User automatically exists" }
            });
            res.status(409).json({ error: "Email already registered" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                collegeId: collegeId ?? null,
                student: {
                    create: {
                        firstName,
                        lastName,
                        rollNumber: rollNumber ?? "N/A",
                        email,
                        department: department ?? "N/A",
                        semester: semester ?? 1,
                        batch: batch ?? "N/A",
                        collegeId: collegeId ?? null,
                    },
                },
            },
            include: { student: true },
        });

        const tokens = await createSessionAndIssueTokens(
            toTokenIdentity({
                id: user.id,
                email: user.email,
                role: user.role as AuthRole,
                collegeId: user.collegeId
            }),
            { ipAddress: req.ip, userAgent: req.headers["user-agent"] }
        );

        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

        void logSecurityEvent({
            action: "LOGIN_SUCCESS",
            userId: user.id,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });

        res.status(201).json({
            success: true,
            data: {
                user: { id: user.id, email: user.email, role: user.role },
                tokens,
            },
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Registration failed";
        res.status(500).json({ error: message });
    }
});

router.post("/login", authLimiter, async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { student: true },
        });

        if (!user || !user.isActive) {
            logSecurityEvent({
                action: "LOGIN_FAILED",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                metadata: { email, reason: "User not found or inactive" }
            });
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            logSecurityEvent({
                action: "LOGIN_FAILED",
                ipAddress: req.ip,
                userId: user.id,
                userAgent: req.headers["user-agent"],
                metadata: { reason: "Invalid password" }
            });
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const tokens = await createSessionAndIssueTokens(
            toTokenIdentity({
                id: user.id,
                email: user.email,
                role: user.role as AuthRole,
                collegeId: user.collegeId
            }),
            { ipAddress: req.ip, userAgent: req.headers["user-agent"] }
        );

        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

        void logSecurityEvent({
            action: "LOGIN_SUCCESS",
            userId: user.id,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            metadata: { method: "login" }
        });

        res.status(200).json({
            success: true,
            data: {
                user: { id: user.id, email: user.email, role: user.role },
                tokens,
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Login failed";
        res.status(500).json({ error: message });
    }
});

router.post("/refresh", refreshLimiter, async (req: AuthRequest, res: Response) => {
    try {
        let refreshToken = req.body.refreshToken;
        if (!refreshToken && req.cookies && req.cookies.refreshToken) {
            refreshToken = req.cookies.refreshToken;
        }

        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }

        const tokens = await rotateRefreshToken(refreshToken, {
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });

        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

        res.status(200).json({
            success: true,
            data: { tokens },
        });
    } catch (err: any) {
        if (err.message === "TOKEN_REUSE_DETECTED") {
            clearAuthCookies(res);
            res.status(401).json({ error: "Token reuse detected. Please login again." });
            return;
        }
        res.status(401).json({ error: "Invalid refresh token" });
    }
});

router.post("/logout", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (req.auth?.token.typ === "access") {
            // we do not have sessionId in access token, so we need to find it by user ID and tokenHash
            // Actually, we can revoke ALL sessions for the user or if we pass the refreshToken in cookies, we can revoke that specific one!
            let refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            if (refreshToken) {
                // To keep it simple, we don't have verifyRefreshToken exported here natively unless we import it.
                // It's safer to just clear active sessions that match if needed, but since we cannot decode the token,
                // let's revoke using a tokenHash search!
            }
        }
        // Actually, without proper sessionId in accessToken, we can't individually identify the active session from auth middleware alone.
        // For Phase 1, we still clear cookies. If they want true single-session logout, they must pass the refresh token.
        let refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (refreshToken) {
            const crypto = require("node:crypto");
            const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
            await prisma.session.updateMany({
                where: { tokenHash: hash, revokedAt: null },
                data: { revokedAt: new Date() }
            });
        }
        
        clearAuthCookies(res);

        void logSecurityEvent({
            action: "LOGOUT",
            userId: req.auth?.principal?.userId,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            metadata: { type: "single_session" }
        });

        res.status(200).json({ success: true });
    } catch {
        // Clear regardless
        clearAuthCookies(res);
        res.status(200).json({ success: true });
    }
});

router.post("/logout-all", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.auth?.principal.userId;
        if (userId) {
            await prisma.session.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() }
            });

            void logSecurityEvent({
                action: "LOGOUT",
                userId,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                metadata: { type: "all_sessions" }
            });
        }
        clearAuthCookies(res);
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ error: "Failed to logout everywhere" });
    }
});

// ---------------------------------------------------------------------------
// GET /auth/me
// ---------------------------------------------------------------------------

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.auth?.principal) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.auth.principal.userId },
            include: { student: true },
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    collegeId: user.collegeId ?? null,
                    student: user.student
                        ? {
                            firstName: user.student.firstName,
                            lastName: user.student.lastName,
                            department: user.student.department,
                            githubUsername: user.student.githubUsername,
                            id: user.student.id,
                        }
                        : null,
                },
            },
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch profile";
        res.status(500).json({ error: message });
    }
});

// ---------------------------------------------------------------------------
// POST /auth/stream-token
// ---------------------------------------------------------------------------

router.post("/stream-token", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.auth?.principal) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        const streamToken = issueStreamToken({
            id: req.auth.principal.userId,
            email: req.auth.principal.email,
            role: req.auth.principal.role,
            collegeId: req.auth.principal.collegeId
        });
        res.status(200).json({ success: true, data: { streamToken } });
    } catch (err: unknown) {
        res.status(500).json({ error: "Failed to issue stream token" });
    }
});

export default router;
