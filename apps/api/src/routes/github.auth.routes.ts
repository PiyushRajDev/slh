import { Router, Response } from "express";
import * as jwt from "jsonwebtoken";
import axios from "axios";
import prisma from "../db";
import {
    authenticate,
    AuthRequest,
    Permission,
    requirePermission,
    hasRequestPermission
} from "../middleware/auth.middleware";
import { encryptToken } from "../utils/crypto";

const router = Router();

function resolveFrontendRedirect(pathname: string): string {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    
    try {
        const url = new URL(pathname, frontendUrl);
        return url.toString();
    } catch {
        // Fallback in case of malformed environment variable or path
        return `http://localhost:3001${pathname.startsWith("/") ? "" : "/"}${pathname}`;
    }
}

// ---------------------------------------------------------------------------
// GET /auth/github — initiate OAuth (protected)
// ---------------------------------------------------------------------------

router.get(
    "/github",
    authenticate,
    (req: AuthRequest, res: Response) => {
        if (!req.auth?.principal) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        if (!hasRequestPermission(req, Permission.GITHUB_CONNECT_SELF)) {
            const role = req.auth.principal.role;
            const redirectPath = (role === "ADMIN" || role === "SUPER_ADMIN") ? "/admin" : "/dashboard";
            return res.redirect(resolveFrontendRedirect(`${redirectPath}?denied=1`));
        }

        const state = jwt.sign(
            { userId: req.auth.principal.userId },
            process.env.GITHUB_STATE_SECRET!,
            { expiresIn: "10m" }
        );

        const params = new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID!,
            redirect_uri: process.env.GITHUB_CALLBACK_URL!,
            scope: "read:user repo",
            state,
        });

        res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
    }
);

// ---------------------------------------------------------------------------
// GET /auth/github/callback — GitHub redirects here (no auth middleware)
// ---------------------------------------------------------------------------

router.get(
    "/github/callback",
    async (req: AuthRequest, res: Response) => {
        try {
            const code = req.query.code as string | undefined;
            const state = req.query.state as string | undefined;

            if (!code || !state) {
                res.status(400).json({ error: "Missing code or state" });
                return;
            }

            // Verify state JWT
            let userId: string;
            try {
                const decoded = jwt.verify(
                    state,
                    process.env.GITHUB_STATE_SECRET!
                ) as { userId: string };
                userId = decoded.userId;
            } catch {
                res.status(400).json({ error: "Invalid or expired state" });
                return;
            }

            // Exchange code for access token
            const tokenResponse = await axios.post<{
                access_token?: string;
                error?: string;
            }>(
                "https://github.com/login/oauth/access_token",
                {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                },
                {
                    headers: { Accept: "application/json" },
                }
            );

            if (tokenResponse.data.error || !tokenResponse.data.access_token) {
                res.status(400).json({ error: "GitHub OAuth failed" });
                return;
            }

            const accessToken = tokenResponse.data.access_token;

            // Fetch GitHub user profile
            const userResponse = await axios.get<{ login: string }>(
                "https://api.github.com/user",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "User-Agent": "SLH-App",
                    },
                }
            );

            const githubUsername = userResponse.data.login.toLowerCase();

            // Encrypt access token before storing
            const encryptedToken = encryptToken(accessToken);

            // Find student by userId
            const student = await prisma.student.findUnique({
                where: { userId },
            });

            if (!student) {
                res.status(404).json({ error: "Student not found" });
                return;
            }

            const conflictingStudent = await prisma.student.findFirst({
                where: {
                    githubUsername,
                    NOT: {
                        userId,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (conflictingStudent) {
                res.status(409).json({
                    error: "This GitHub account is already connected to another SLH profile.",
                    code: "GITHUB_USERNAME_TAKEN",
                });
                return;
            }

            // Update student with GitHub info — silently overwrites on re-connect
            await prisma.student.update({
                where: { userId },
                data: {
                    githubUsername,
                    githubAccessToken: encryptedToken,
                    githubConnectedAt: new Date(),
                },
            });

            res.redirect(resolveFrontendRedirect("/github-connected?success=true"));
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "GitHub OAuth failed";
            res.status(500).json({ error: message });
        }
    }
);

export default router;
