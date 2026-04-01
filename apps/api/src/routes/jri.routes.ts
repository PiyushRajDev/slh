import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { jriService } from "../services/jriService";

const router = Router();

router.use(authenticate);

router.get("/profile", async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const profile = await jriService.getProfile(req.user.userId);
        res.status(200).json(profile);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch JRI profile";

        if (message === "Student record not found for user") {
            res.status(403).json({ error: message });
            return;
        }

        res.status(500).json({ error: message });
    }
});

router.post("/recalculate", async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const payload = req.body ?? {};
        const profile = await jriService.recalculate(req.user.userId, {
            leetcodeUsername: typeof payload.leetcodeUsername === "string" ? payload.leetcodeUsername : undefined,
            codeforcesHandle: typeof payload.codeforcesHandle === "string" ? payload.codeforcesHandle : undefined,
            weights: payload.weights && typeof payload.weights === "object"
                ? {
                    dsa: typeof payload.weights.dsa === "number" ? payload.weights.dsa : undefined,
                    projects: typeof payload.weights.projects === "number" ? payload.weights.projects : undefined
                }
                : undefined
        });

        res.status(200).json(profile);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to recalculate JRI";

        if (message === "Student record not found for user") {
            res.status(403).json({ error: message });
            return;
        }

        res.status(500).json({ error: message });
    }
});

router.get("/verify/:platform/:username", async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { platform, username } = req.params;
        const token = req.query.token as string;

        if (!token) {
            res.status(400).json({ error: "Verification token is required" });
            return;
        }

        if (platform !== "leetcode" && platform !== "codeforces") {
            res.status(400).json({ error: "Invalid platform. Must be leetcode or codeforces" });
            return;
        }

        const verified = await jriService.verifyPlatformAccount(req.user.userId, platform as any, username as string, token);
        res.status(200).json({ verified });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to verify account";
        res.status(500).json({ error: message });
    }
});

export default router;
