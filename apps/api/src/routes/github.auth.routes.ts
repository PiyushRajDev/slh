import { Router, Response } from "express";
import * as jwt from "jsonwebtoken";
import axios from "axios";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { encryptToken } from "../utils/crypto";

const router = Router();

// ---------------------------------------------------------------------------
// GET /auth/github — initiate OAuth (protected)
// ---------------------------------------------------------------------------

router.get("/github", authenticate, (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }

    const state = jwt.sign(
        { userId: req.user.userId },
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
});

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

            const githubUsername = userResponse.data.login;

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

            // Update student with GitHub info — silently overwrites on re-connect
            await prisma.student.update({
                where: { userId },
                data: {
                    githubUsername,
                    githubAccessToken: encryptedToken,
                    githubConnectedAt: new Date(),
                },
            });

            res.redirect(`${process.env.FRONTEND_URL}/github-connected?success=true`);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "GitHub OAuth failed";
            res.status(500).json({ error: message });
        }
    }
);

export default router;
