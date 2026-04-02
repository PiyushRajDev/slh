import { Router, Response } from "express";
import prisma from "../db";
import {
    authenticate,
    AuthRequest,
    Permission,
    requirePermission
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
    "/me/onboarding-status",
    requirePermission(Permission.ONBOARDING_READ_SELF),
    async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const student = await prisma.student.findFirst({
            where: { userId: principal.userId },
            select: {
                id: true,
                firstName: true,
                githubUsername: true,
                githubConnectedAt: true,
                dsaProfiles: {
                    select: {
                        platform: true,
                        isVerified: true,
                        fetchStatus: true,
                    },
                },
                jriCalculations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { jriScore: true, createdAt: true },
                },
                projectAnalyses: {
                    where: { status: "COMPLETED" },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { id: true, overallScore: true, createdAt: true },
                },
            },
        });

        if (!student) {
            res.status(404).json({ error: "Student profile not found" });
            return;
        }

        const githubConnected = !!student.githubUsername;
        const verifiedDsaProfiles = student.dsaProfiles.filter((p) => p.isVerified);
        const latestJri = student.jriCalculations[0] ?? null;
        const latestProject = student.projectAnalyses[0] ?? null;

        const steps = [
            {
                key: "account_created",
                label: "Account created",
                complete: true,
            },
            {
                key: "github_connected",
                label: "GitHub account connected",
                complete: githubConnected,
                connectedAt: student.githubConnectedAt ?? null,
            },
            {
                key: "dsa_profile_linked",
                label: "At least one DSA profile verified",
                complete: verifiedDsaProfiles.length > 0,
                platforms: verifiedDsaProfiles.map((p) => p.platform),
            },
            {
                key: "jri_calculated",
                label: "First JRI score calculated",
                complete: !!latestJri,
                jriScore: latestJri ? Math.round(latestJri.jriScore * 10) / 10 : null,
                calculatedAt: latestJri?.createdAt ?? null,
            },
            {
                key: "project_analyzed",
                label: "First project analyzed",
                complete: !!latestProject,
                projectScore: latestProject?.overallScore ?? null,
                analyzedAt: latestProject?.createdAt ?? null,
            },
        ];

        const completedCount = steps.filter((s) => s.complete).length;
        const percentComplete = Math.round((completedCount / steps.length) * 100);
        const isFullyOnboarded = completedCount === steps.length;

        res.status(200).json({
            studentId: student.id,
            firstName: student.firstName,
            percentComplete,
            isFullyOnboarded,
            steps,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch onboarding status";
        res.status(500).json({ error: message });
    }
});

export default router;
