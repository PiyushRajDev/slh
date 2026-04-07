import { Router, Response } from "express";
import prisma from "../db";
import {
    authenticate,
    AuthRequest,
    Permission,
    requirePermission,
} from "../middleware/auth.middleware";
import { matchJobToStudent, computeQuickMatchScore } from "@slh/placement-engine";

const router = Router();

router.use(authenticate, requirePermission(Permission.PROFILE_READ_SELF));

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Fetches the student record and their latest capability profile. */
async function getStudentWithCapabilities(userId: string) {
    const student = await prisma.student.findFirst({
        where: { userId },
        select: {
            id: true,
            collegeId: true,
            userCapabilityProfiles: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                    id: true,
                    capabilities: {
                        select: {
                            capabilityId: true,
                            score: true,
                            confidence: true,
                            capability: {
                                select: { slug: true },
                            },
                        },
                    },
                },
            },
        },
    });
    return student;
}

// ─────────────────────────────────────────────────────────────────
// GET /api/jobs
// All jobs for the student's college with quick match scores
// ─────────────────────────────────────────────────────────────────
router.get("/", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const student = await getStudentWithCapabilities(principal.userId);
        if (!student?.collegeId) {
            res.status(404).json({ error: "Student profile not found" });
            return;
        }

        const latestProfile = student.userCapabilityProfiles[0];
        const studentSlugs = new Set<string>(
            latestProfile?.capabilities.map((c) => c.capability.slug) ?? []
        );

        const jobs = await prisma.job.findMany({
            where: { collegeId: student.collegeId },
            orderBy: { createdAt: "desc" },
            include: {
                company: { select: { id: true, name: true, logoUrl: true, industry: true } },
                _count: { select: { applications: true } },
            },
        });

        // Check which jobs the student has applied to
        const applications = await prisma.jobApplication.findMany({
            where: { studentId: student.id },
            select: { jobId: true, status: true },
        });
        const appliedMap = new Map(applications.map((a) => [a.jobId, a.status]));

        const result = jobs.map((job) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            ctc: job.ctc,
            deadline: job.deadline,
            location: job.location,
            jobType: job.jobType,
            skills: job.skills,
            applicantCount: job._count.applications,
            matchScore: computeQuickMatchScore(job.capabilitySlugs, studentSlugs),
            applicationStatus: appliedMap.get(job.id) ?? null,
            createdAt: job.createdAt,
        }));

        res.status(200).json({ jobs: result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch jobs";
        res.status(500).json({ error: message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/jobs/:id/match
// Full match report: matched, partial, missing skills + learning paths
// ─────────────────────────────────────────────────────────────────
router.get("/:id/match", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const id = String(req.params.id);

        const student = await getStudentWithCapabilities(principal.userId);
        if (!student?.collegeId) {
            res.status(404).json({ error: "Student profile not found" });
            return;
        }

        const job = await prisma.job.findFirst({
            where: { id, collegeId: student.collegeId },
            include: {
                company: { select: { id: true, name: true, logoUrl: true, website: true, industry: true, location: true } },
            },
        }) as any;

        if (!job) {
            res.status(404).json({ error: "Job not found" });
            return;
        }

        // Record view event (fire-and-forget analytics)
        prisma.jobView
            .create({ data: { studentId: student.id, jobId: job.id } })
            .catch(() => {
                // Non-critical
            });

        const latestProfile = student.userCapabilityProfiles[0];
        const studentCaps = latestProfile?.capabilities.map((c) => ({
            capabilityId: c.capabilityId,
            capabilitySlug: c.capability.slug,
            score: c.score,
            confidence: c.confidence,
        })) ?? [];

        // Fetch capability details for the job's slugs
        const capabilities = await prisma.capability.findMany({
            where: { slug: { in: job.capabilitySlugs } },
            select: {
                id: true,
                slug: true,
                name: true,
                category: true,
                recommendation: true,
                projectSuggestion: true,
            },
        });

        const jobDemand = capabilities.map((c) => ({
            capabilityId: c.id,
            capabilitySlug: c.slug,
            capabilityName: c.name,
            category: c.category,
            demandScore: 0.8, // uniform demand score for posted jobs
            recommendation: c.recommendation,
            projectSuggestion: c.projectSuggestion,
        }));

        const matchReport = matchJobToStudent(jobDemand, studentCaps);

        // Fetch similar jobs at the same company
        const similarJobs = await prisma.job.findMany({
            where: {
                companyId: job.companyId,
                id: { not: job.id },
                collegeId: student.collegeId,
            },
            take: 3,
            orderBy: { createdAt: "desc" },
            select: { id: true, title: true, ctc: true, deadline: true },
        });

        res.status(200).json({
            job: {
                id: job.id,
                title: job.title,
                description: job.description,
                company: job.company,
                ctc: job.ctc,
                eligibility: job.eligibility,
                deadline: job.deadline,
                location: job.location,
                jobType: job.jobType,
                skills: job.skills,
            },
            match: matchReport,
            similarJobs,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to compute match";
        res.status(500).json({ error: message });
    }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/jobs/:id/apply
// Track application (idempotent)
// ─────────────────────────────────────────────────────────────────
router.post("/:id/apply", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const id = String(req.params.id);

        const student = await prisma.student.findFirst({
            where: { userId: principal.userId },
            select: { id: true, collegeId: true },
        });
        if (!student?.collegeId) {
            res.status(404).json({ error: "Student profile not found" });
            return;
        }

        const job = await prisma.job.findFirst({
            where: { id, collegeId: student.collegeId },
            select: { id: true, capabilitySlugs: true },
        });
        if (!job) {
            res.status(404).json({ error: "Job not found" });
            return;
        }

        // Compute match score for the application record
        const latestProfile = await prisma.userCapabilityProfile.findFirst({
            where: { studentId: student.id },
            orderBy: { createdAt: "desc" },
            select: {
                capabilities: {
                    select: { capability: { select: { slug: true } } },
                },
            },
        });
        const studentSlugs = new Set<string>(
            latestProfile?.capabilities.map((c) => c.capability.slug) ?? []
        );
        const matchScore = computeQuickMatchScore(job.capabilitySlugs, studentSlugs);

        const application = await prisma.jobApplication.upsert({
            where: { studentId_jobId: { studentId: student.id, jobId: job.id } },
            update: {},
            create: {
                studentId: student.id,
                jobId: job.id,
                matchScore,
                status: "APPLIED",
            },
        });

        res.status(200).json({ application });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to apply";
        res.status(500).json({ error: message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/jobs/:id/similar
// Other jobs at the same company
// ─────────────────────────────────────────────────────────────────
router.get("/:id/similar", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const student = await prisma.student.findFirst({
            where: { userId: principal.userId },
            select: { id: true, collegeId: true },
        });
        if (!student?.collegeId) {
            res.status(404).json({ error: "Student profile not found" });
            return;
        }

        const id = String(req.params.id);
        const job = await prisma.job.findFirst({
            where: { id, collegeId: student.collegeId },
            select: { companyId: true },
        });
        if (!job) {
            res.status(404).json({ error: "Job not found" });
            return;
        }

        const similar = await prisma.job.findMany({
            where: {
                companyId: job.companyId,
                id: { not: id },
                collegeId: student.collegeId,
            },
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                ctc: true,
                deadline: true,
                jobType: true,
                skills: true,
                company: { select: { name: true, logoUrl: true } },
            },
        });

        res.status(200).json({ similar });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch similar jobs";
        res.status(500).json({ error: message });
    }
});

export default router;
