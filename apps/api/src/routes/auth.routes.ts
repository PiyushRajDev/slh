import { Router, Response } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// ---------------------------------------------------------------------------
// Helper — private to this file
// ---------------------------------------------------------------------------

function generateTokens(user: {
    id: string;
    email: string;
    role: string;
    collegeId: string | null;
}) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken, expiresIn: 900 };
}

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------

router.post("/register", async (req: AuthRequest, res: Response) => {
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

        // Validate minimum password length
        if (!password || password.length < 8) {
            res
                .status(400)
                .json({ error: "Password must be at least 8 characters" });
            return;
        }

        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: "Email already registered" });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User — nest Student only when collegeId is provided
        // (Student.collegeId is a required FK; college management comes later)
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                collegeId: collegeId ?? null,
                ...(true
                    ? {
                        student: {
                            create: {
                                firstName,
                                lastName,
                                rollNumber: rollNumber ?? "N/A",
                                email,
                                department: department ?? "N/A",
                                semester: semester ?? 1,
                                batch: batch ?? "N/A",
                            },
                        },
                    }
                    : {}),
            },
            include: { student: true },
        });

        const tokens = generateTokens(user);

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

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

router.post("/login", async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { student: true },
        });

        // Same message for wrong email OR wrong password — never reveal which
        if (!user || !user.isActive) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const tokens = generateTokens(user);

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

// ---------------------------------------------------------------------------
// POST /auth/refresh
// ---------------------------------------------------------------------------

router.post("/refresh", async (req: AuthRequest, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET!
        ) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || !user.isActive) {
            res.status(401).json({ error: "Invalid refresh token" });
            return;
        }

        const tokens = generateTokens(user);

        res.status(200).json({
            success: true,
            data: { tokens },
        });
    } catch {
        res.status(401).json({ error: "Invalid refresh token" });
    }
});

// ---------------------------------------------------------------------------
// GET /auth/me
// ---------------------------------------------------------------------------

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
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
                    student: user.student
                        ? {
                            firstName: user.student.firstName,
                            lastName: user.student.lastName,
                            department: user.student.department,
                            githubUsername: user.student.githubUsername,
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

export default router;
