import { Router, Response } from "express";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { analysisQueue } from "../lib/queue";

const router = Router();

const GITHUB_URL_REGEX =
    /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/;

// ---------------------------------------------------------------------------
// POST /analysis/submit
// ---------------------------------------------------------------------------

router.post(
    "/submit",
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Not authenticated" });
                return;
            }

            const { repoUrl } = req.body;

            // 1. Validate repoUrl present
            if (!repoUrl || typeof repoUrl !== "string") {
                res.status(400).json({ error: "repoUrl is required" });
                return;
            }

            // 2. Validate GitHub URL format
            const match = repoUrl.match(GITHUB_URL_REGEX);
            if (!match) {
                res.status(400).json({ error: "Invalid GitHub repository URL" });
                return;
            }

            // 3. Extract owner
            const owner = match[1];

            // 4. Find student
            const student = await prisma.student.findUnique({
                where: { userId: req.user.userId },
            });

            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            // 5. Check GitHub connected
            if (!student.githubUsername) {
                res.status(403).json({
                    error:
                        "GitHub account not connected. Please connect your GitHub account first.",
                });
                return;
            }

            // 6. Ownership check — case-insensitive, never reveal stored username
            if (owner.toLowerCase() !== student.githubUsername.toLowerCase()) {
                res.status(403).json({
                    error: "Repository does not belong to your connected GitHub account",
                });
                return;
            }

            // 7. Enqueue analysis job
            const jobId = `analysis:${student.id}:${Date.now()}`;

            await analysisQueue.add(
                "analyze-repo",
                {
                    studentId: student.id,
                    repoUrl,
                    userId: req.user.userId,
                    submittedAt: new Date().toISOString(),
                },
                { jobId }
            );

            // 8. Return 202
            res.status(202).json({
                success: true,
                data: {
                    jobId,
                    message: "Analysis queued successfully",
                    repoUrl,
                },
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to submit analysis";
            res.status(500).json({ error: message });
        }
    }
);

export default router;
