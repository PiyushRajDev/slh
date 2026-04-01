import { Router, Response } from "express";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { computeTier, computeArchetype, tierColor } from "../utils/jri-logic";

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// ───────────────────────────────────────────────────────────────────
// GET /api/admin/analytics/batch
// Batch-level analytics for the admin dashboard
// Query params: ?batch=2025&department=CSE
// ───────────────────────────────────────────────────────────────────

router.get("/analytics/batch", async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")) {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const batch = req.query.batch as string | undefined;
        const department = req.query.department as string | undefined;

        const where: any = {};
        if (batch) where.batch = batch;
        if (department) where.department = department;
        // College-scoped: ADMIN can only see students in their college
        if (req.user.role === "ADMIN" && req.user.collegeId) {
            where.collegeId = req.user.collegeId;
        }

        // Fetch all students with their latest JRI and analyses
        const students = await prisma.student.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                batch: true,
                githubUsername: true,
                isPlaced: true,
                packageOffered: true,
                companyName: true,
                dsaProfiles: {
                    select: {
                        platform: true,
                        totalSolved: true,
                        easySolved: true,
                        mediumSolved: true,
                        hardSolved: true,
                        rating: true,
                        fetchStatus: true,
                    },
                },
                jriCalculations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        jriScore: true,
                        dsaScore: true,
                        githubScore: true,
                        createdAt: true,
                    },
                },
                projectAnalyses: {
                    where: { status: "COMPLETED", overallScore: { not: null } },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: {
                        overallScore: true,
                        profileId: true,
                        reliabilityLevel: true,
                        createdAt: true,
                    },
                },
            },
        });

        // Process each student into a summary row
        const studentSummaries = students.map((s) => {
            const latestJri = s.jriCalculations[0];
            const jriScore = latestJri?.jriScore ?? 0;
            const dsaScore = latestJri?.dsaScore ?? 0;
            const projectScore = latestJri?.githubScore ?? 0;

            const leetcode = s.dsaProfiles.find((p) => p.platform === "LEETCODE");
            const codeforces = s.dsaProfiles.find((p) => p.platform === "CODEFORCES");

            const projectScores = s.projectAnalyses.map((a) => a.overallScore ?? 0);
            const avgProjectScore = projectScores.length > 0
                ? projectScores.reduce((sum, v) => sum + v, 0) / projectScores.length
                : 0;
            const bestProjectScore = projectScores.length > 0 ? Math.max(...projectScores) : 0;

            return {
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                department: s.department,
                batch: s.batch,
                githubUsername: s.githubUsername,
                isPlaced: s.isPlaced,
                packageOffered: s.packageOffered,
                companyName: s.companyName,
                jriScore: Math.round(jriScore * 10) / 10,
                dsaScore: Math.round(dsaScore * 10) / 10,
                projectScore: Math.round(projectScore * 10) / 10,
                tier: computeTier(jriScore),
                leetcode: leetcode ? {
                    totalSolved: leetcode.totalSolved,
                    easySolved: leetcode.easySolved,
                    mediumSolved: leetcode.mediumSolved,
                    hardSolved: leetcode.hardSolved,
                    status: leetcode.fetchStatus,
                } : null,
                codeforces: codeforces ? {
                    totalSolved: codeforces.totalSolved,
                    rating: codeforces.rating,
                    status: codeforces.fetchStatus,
                } : null,
                projects: {
                    count: s.projectAnalyses.length,
                    avgScore: Math.round(avgProjectScore * 10) / 10,
                    bestScore: bestProjectScore,
                },
                lastJriUpdate: latestJri?.createdAt ?? null,
            };
        });

        // Compute batch-level aggregates
        const withJri = studentSummaries.filter((s) => s.jriScore > 0);
        const totalStudents = studentSummaries.length;
        const avgJri = withJri.length > 0
            ? withJri.reduce((sum, s) => sum + s.jriScore, 0) / withJri.length
            : 0;
        const placementReady = withJri.filter((s) => s.jriScore >= 70).length;
        const placementReadyPercent = withJri.length > 0
            ? Math.round((placementReady / withJri.length) * 100)
            : 0;

        // Tier distribution
        const tierDistribution: Record<string, number> = {
            Legend: 0, Elite: 0, Pro: 0, Rising: 0, Challenger: 0, Rookie: 0,
        };
        withJri.forEach((s) => { tierDistribution[s.tier] = (tierDistribution[s.tier] || 0) + 1; });

        // Department breakdown
        const departmentMap = new Map<string, { count: number; jriSum: number; placementReady: number }>();
        studentSummaries.forEach((s) => {
            const dept = s.department || "Unknown";
            const entry = departmentMap.get(dept) || { count: 0, jriSum: 0, placementReady: 0 };
            entry.count++;
            entry.jriSum += s.jriScore;
            if (s.jriScore >= 70) entry.placementReady++;
            departmentMap.set(dept, entry);
        });
        const departments = [...departmentMap.entries()].map(([name, data]) => ({
            name,
            count: data.count,
            avgJri: Math.round((data.jriSum / data.count) * 10) / 10,
            placementReadyPercent: Math.round((data.placementReady / data.count) * 100),
        }));

        // Risk analysis
        const withLeetcode = studentSummaries.filter((s) => s.leetcode?.status === "SUCCESS");
        const lowDsaCount = withLeetcode.filter((s) => (s.leetcode?.totalSolved ?? 0) < 50).length;
        const lowProjectCount = studentSummaries.filter((s) => s.projects.count > 0 && s.projects.avgScore < 30).length;
        const noProjectCount = studentSummaries.filter((s) => s.projects.count === 0).length;

        const risks = [
            {
                label: "Low DSA practice",
                count: lowDsaCount,
                total: withLeetcode.length,
                percent: withLeetcode.length > 0 ? Math.round((lowDsaCount / withLeetcode.length) * 100) : 0,
                description: `${lowDsaCount} students with LeetCode profiles have solved fewer than 50 problems`,
            },
            {
                label: "Weak project quality",
                count: lowProjectCount,
                total: studentSummaries.filter((s) => s.projects.count > 0).length,
                percent: studentSummaries.filter((s) => s.projects.count > 0).length > 0
                    ? Math.round((lowProjectCount / studentSummaries.filter((s) => s.projects.count > 0).length) * 100) : 0,
                description: `${lowProjectCount} students have an average project score below 30`,
            },
            {
                label: "No project analyzed",
                count: noProjectCount,
                total: totalStudents,
                percent: totalStudents > 0 ? Math.round((noProjectCount / totalStudents) * 100) : 0,
                description: `${noProjectCount} students haven't submitted any project for analysis`,
            },
        ];

        res.status(200).json({
            summary: {
                totalStudents,
                studentsWithJri: withJri.length,
                avgJri: Math.round(avgJri * 10) / 10,
                placementReady,
                placementReadyPercent,
                tierDistribution,
            },
            departments,
            risks,
            students: studentSummaries.sort((a, b) => b.jriScore - a.jriScore),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch batch analytics";
        res.status(500).json({ error: message });
    }
});

// ───────────────────────────────────────────────────────────────────
// GET /api/admin/analytics/alerts
// Early warning system — identifies at-risk students
// ───────────────────────────────────────────────────────────────────

router.get("/analytics/alerts", async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")) {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const alerts: Array<{
            studentId: string;
            studentName: string;
            department: string;
            type: string;
            severity: "critical" | "high" | "medium";
            message: string;
        }> = [];

        // Find students — scoped to admin's college
        const studentWhere: any = {};
        if (req.user.role === "ADMIN" && req.user.collegeId) {
            studentWhere.collegeId = req.user.collegeId;
        }

        const studentsWithHistory = await prisma.student.findMany({
            where: studentWhere,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                jriCalculations: {
                    orderBy: { createdAt: "desc" },
                    take: 3,
                    select: {
                        jriScore: true,
                        createdAt: true,
                    },
                },
                dsaProfiles: {
                    select: {
                        platform: true,
                        totalSolved: true,
                        lastFetchedAt: true,
                        fetchStatus: true,
                    },
                },
                projectAnalyses: {
                    where: { status: "COMPLETED" },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        overallScore: true,
                        createdAt: true,
                    },
                },
            },
        });

        const now = new Date();

        for (const student of studentsWithHistory) {
            const name = `${student.firstName} ${student.lastName}`;

            // Check for declining JRI (3 consecutive decreases)
            const jriHistory = student.jriCalculations;
            if (jriHistory.length >= 3) {
                const [latest, prev, oldest] = jriHistory;
                if (latest.jriScore < prev.jriScore && prev.jriScore < oldest.jriScore) {
                    alerts.push({
                        studentId: student.id,
                        studentName: name,
                        department: student.department,
                        type: "JRI_DECLINING",
                        severity: "high",
                        message: `JRI declining: ${Math.round(oldest.jriScore)} → ${Math.round(prev.jriScore)} → ${Math.round(latest.jriScore)}`,
                    });
                }
            }

            // Check for very low JRI
            if (jriHistory.length > 0 && jriHistory[0].jriScore < 30) {
                alerts.push({
                    studentId: student.id,
                    studentName: name,
                    department: student.department,
                    type: "LOW_JRI",
                    severity: "critical",
                    message: `JRI score is only ${Math.round(jriHistory[0].jriScore)} — significantly below placement threshold (70)`,
                });
            }

            // Check for stale DSA data (no fetch in 30+ days)
            for (const dsa of student.dsaProfiles) {
                if (dsa.lastFetchedAt) {
                    const daysSince = Math.floor((now.getTime() - new Date(dsa.lastFetchedAt).getTime()) / (1000 * 60 * 60 * 24));
                    if (daysSince > 30 && dsa.fetchStatus === "SUCCESS") {
                        alerts.push({
                            studentId: student.id,
                            studentName: name,
                            department: student.department,
                            type: "STALE_DSA",
                            severity: "medium",
                            message: `${dsa.platform} data is ${daysSince} days old — may not reflect current practice`,
                        });
                    }
                }
            }

            // Check for low project scores
            const latestProject = student.projectAnalyses[0];
            if (latestProject && (latestProject.overallScore ?? 0) < 20) {
                alerts.push({
                    studentId: student.id,
                    studentName: name,
                    department: student.department,
                    type: "LOW_PROJECT",
                    severity: "high",
                    message: `Latest project scored only ${latestProject.overallScore}/100 — needs significant improvement`,
                });
            }

            // No JRI at all
            if (jriHistory.length === 0) {
                alerts.push({
                    studentId: student.id,
                    studentName: name,
                    department: student.department,
                    type: "NO_JRI",
                    severity: "medium",
                    message: "Student has never calculated their JRI",
                });
            }
        }

        // Sort by severity
        const severityOrder = { critical: 0, high: 1, medium: 2 };
        alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        res.status(200).json({
            totalAlerts: alerts.length,
            bySeverity: {
                critical: alerts.filter((a) => a.severity === "critical").length,
                high: alerts.filter((a) => a.severity === "high").length,
                medium: alerts.filter((a) => a.severity === "medium").length,
            },
            alerts,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to generate alerts";
        res.status(500).json({ error: message });
    }
});

// ───────────────────────────────────────────────────────────────────
// GET /api/admin/analytics/export
// CSV export of student data for placement cells
// ───────────────────────────────────────────────────────────────────

router.get("/analytics/export", async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")) {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const batch = req.query.batch as string | undefined;
        const where: any = {};
        if (batch) where.batch = batch;
        // College-scoped: ADMIN can only export their own college
        if (req.user.role === "ADMIN" && req.user.collegeId) {
            where.collegeId = req.user.collegeId;
        }

        const students = await prisma.student.findMany({
            where,
            select: {
                firstName: true,
                lastName: true,
                rollNumber: true,
                email: true,
                department: true,
                batch: true,
                section: true,
                githubUsername: true,
                isPlaced: true,
                packageOffered: true,
                companyName: true,
                dsaProfiles: {
                    select: {
                        platform: true,
                        totalSolved: true,
                        hardSolved: true,
                        rating: true,
                    },
                },
                jriCalculations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { jriScore: true, dsaScore: true, githubScore: true },
                },
                projectAnalyses: {
                    where: { status: "COMPLETED", overallScore: { not: null } },
                    orderBy: { overallScore: "desc" },
                    take: 1,
                    select: { overallScore: true, repoUrl: true },
                },
            },
            orderBy: [{ department: "asc" }, { lastName: "asc" }],
        });

        const headers = [
            "Name", "Roll Number", "Email", "Department", "Batch", "Section",
            "GitHub", "JRI Score", "Tier", "DSA Score", "Project Score",
            "LC Solved", "LC Hard", "CF Rating", "Best Project Score", "Best Project URL",
            "Placed", "Package (LPA)", "Company",
        ];

        const rows = students.map((s) => {
            const jri = s.jriCalculations[0];
            const lc = s.dsaProfiles.find((p) => p.platform === "LEETCODE");
            const cf = s.dsaProfiles.find((p) => p.platform === "CODEFORCES");
            const bestProject = s.projectAnalyses[0];
            const jriScore = jri?.jriScore ?? 0;

            return [
                `${s.firstName} ${s.lastName}`,
                s.rollNumber,
                s.email,
                s.department,
                s.batch,
                s.section ?? "",
                s.githubUsername ?? "",
                Math.round(jriScore * 10) / 10,
                computeTier(jriScore),
                Math.round((jri?.dsaScore ?? 0) * 10) / 10,
                Math.round((jri?.githubScore ?? 0) * 10) / 10,
                lc?.totalSolved ?? "",
                lc?.hardSolved ?? "",
                cf?.rating ?? "",
                bestProject?.overallScore ?? "",
                bestProject?.repoUrl ?? "",
                s.isPlaced ? "Yes" : "No",
                s.packageOffered ?? "",
                s.companyName ?? "",
            ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
        });

        const csv = [headers.join(","), ...rows].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="slh-batch-report-${batch || "all"}.csv"`);
        res.status(200).send(csv);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to export data";
        res.status(500).json({ error: message });
    }
});

// ───────────────────────────────────────────────────────────────────
// PATCH /api/admin/students/:studentId/placement
// ADMIN — update placement outcome for a student
// Body: { isPlaced, companyName?, packageOffered?, placementYear? }
// ───────────────────────────────────────────────────────────────────

router.patch("/students/:studentId/placement", async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")) {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const studentId = req.params.studentId as string;
        const { isPlaced, companyName, packageOffered, placementYear } = req.body;

        if (typeof isPlaced !== "boolean") {
            res.status(400).json({ error: "isPlaced (boolean) is required" });
            return;
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { id: true, collegeId: true },
        });

        if (!student) {
            res.status(404).json({ error: "Student not found" });
            return;
        }

        // College-scoped: ADMIN can only update students in their college
        if (req.user.role === "ADMIN" && student.collegeId !== req.user.collegeId) {
            res.status(403).json({ error: "You can only update students in your college" });
            return;
        }

        const updated = await prisma.student.update({
            where: { id: studentId },
            data: {
                isPlaced,
                companyName: isPlaced ? (companyName ?? null) : null,
                packageOffered: isPlaced && packageOffered != null ? Number(packageOffered) : null,
                placementYear: isPlaced && placementYear != null ? Number(placementYear) : null,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                isPlaced: true,
                companyName: true,
                packageOffered: true,
                placementYear: true,
            },
        });

        res.status(200).json(updated);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to update placement";
        res.status(500).json({ error: message });
    }
});

// ───────────────────────────────────────────────────────────────────
// GET /api/admin/leaderboard
// ADMIN — top students ranked by JRI, scoped to admin's college
// Query params: ?batch=&department=&limit=50
// ───────────────────────────────────────────────────────────────────

router.get("/leaderboard", async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")) {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const batch = req.query.batch as string | undefined;
        const department = req.query.department as string | undefined;
        const limit = Math.min(Number(req.query.limit ?? 50), 200);

        const where: Record<string, unknown> = {};
        if (req.user.role === "ADMIN" && req.user.collegeId) {
            where.collegeId = req.user.collegeId;
        }
        if (batch) where.batch = batch;
        if (department) where.department = department;

        const students = await prisma.student.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                rollNumber: true,
                department: true,
                batch: true,
                githubUsername: true,
                isPlaced: true,
                companyName: true,
                jriCalculations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        jriScore: true,
                        githubScore: true,
                        dsaScore: true,
                        createdAt: true,
                    },
                },
                projectAnalyses: {
                    where: { status: "COMPLETED", overallScore: { not: null } },
                    orderBy: { overallScore: "desc" },
                    take: 1,
                    select: { overallScore: true },
                },
            },
        });

        const ranked = students
            .map((s) => {
                const jri = s.jriCalculations[0];
                const jriScore = jri?.jriScore ?? 0;
                return {
                    studentId: s.id,
                    name: `${s.firstName} ${s.lastName}`,
                    rollNumber: s.rollNumber,
                    department: s.department,
                    batch: s.batch,
                    githubUsername: s.githubUsername,
                    isPlaced: s.isPlaced,
                    companyName: s.companyName ?? null,
                    jriScore: Math.round(jriScore * 10) / 10,
                    dsaScore: Math.round((jri?.dsaScore ?? 0) * 10) / 10,
                    githubScore: Math.round((jri?.githubScore ?? 0) * 10) / 10,
                    bestProjectScore: s.projectAnalyses[0]?.overallScore ?? null,
                    tier: computeTier(jriScore),
                    lastUpdated: jri?.createdAt ?? null,
                };
            })
            .sort((a, b) => b.jriScore - a.jriScore)
            .slice(0, limit)
            .map((s, idx) => ({ rank: idx + 1, ...s }));

        res.status(200).json({
            total: ranked.length,
            leaderboard: ranked,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch leaderboard";
        res.status(500).json({ error: message });
    }
});

// computeTier moved to src/utils/jri-logic.ts

export default router;
