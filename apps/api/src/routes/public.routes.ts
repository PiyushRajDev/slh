import { Router, Request, Response } from "express";
import prisma from "../db";
import { 
    computeTier, 
    computeArchetype, 
    computeDeveloperAttributes, 
    tierColor, 
    clamp, 
    round 
} from "../utils/jri-logic";

const router = Router();

// ───────────────────────────────────────────────────────────────────
// GET /api/public/profile/:username
// Public, no auth required — returns shareable student profile
// ───────────────────────────────────────────────────────────────────

router.get("/profile/:username", async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        const student = await prisma.student.findFirst({
            where: {
                githubUsername: {
                    equals: username as string,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                batch: true,
                githubUsername: true,
                isPlaced: true,
                dsaProfiles: {
                    where: { isVerified: true },
                    select: {
                        platform: true,
                        username: true,
                        profileUrl: true,
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
                        rawScores: true,
                        algorithmVersion: true,
                        createdAt: true,
                    },
                },
                projectAnalyses: {
                    where: { status: "COMPLETED", overallScore: { not: null } },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        repoUrl: true,
                        overallScore: true,
                        profileId: true,
                        confidenceLevel: true,
                        reliabilityLevel: true,
                        createdAt: true,
                    },
                },
            },
        }) as any;

        if (!student) {
            res.status(404).json({ error: "Profile not found" });
            return;
        }

        // Compute tier and archetype from latest JRI
        const latestJri = student.jriCalculations[0];
        const jriScore = latestJri?.jriScore ?? 0;
        const dsaScore = latestJri?.dsaScore ?? 0;
        const projectScore = latestJri?.githubScore ?? 0;

        const tier = computeTier(jriScore);
        const archetype = computeArchetype(dsaScore, projectScore);

        // Compute developer attributes
        const leetcodeProfile = student.dsaProfiles.find((p: any) => p.platform === "LEETCODE");
        const codeforcesProfile = student.dsaProfiles.find((p: any) => p.platform === "CODEFORCES");
        const projectScores = student.projectAnalyses.map((a: any) => (a.overallScore ?? 0) as number);
        const avgProjectScore = projectScores.length > 0
            ? projectScores.reduce((s: number, v: number) => s + v, 0) / projectScores.length
            : 0;

        const attributes = computeAttributes(dsaScore, avgProjectScore, leetcodeProfile, codeforcesProfile, projectScores);

        res.status(200).json({
            student: {
                name: `${student.firstName} ${student.lastName}`,
                department: student.department,
                batch: student.batch,
                githubUsername: student.githubUsername,
                isPlaced: student.isPlaced,
            },
            card: {
                jriScore: Math.round(jriScore * 100) / 100,
                tier,
                archetype,
                dsaScore: Math.round(dsaScore * 100) / 100,
                projectScore: Math.round(projectScore * 100) / 100,
                attributes,
            },
            platforms: {
                leetcode: leetcodeProfile ?? null,
                codeforces: codeforcesProfile ?? null,
            },
            topProjects: (student.projectAnalyses || []).map((a: any) => ({
                id: a.id,
                repoUrl: a.repoUrl,
                score: a.overallScore,
                profile: a.profileId,
                confidence: a.confidenceLevel,
                analyzedAt: a.createdAt,
            })),
            lastUpdated: latestJri?.createdAt ?? null,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch profile";
        res.status(500).json({ error: message });
    }
});

// ───────────────────────────────────────────────────────────────────
// GET /api/public/badge/:username
// Returns an SVG badge showing JRI score and tier
// ───────────────────────────────────────────────────────────────────

router.get("/badge/:username", async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const style = (req.query.style as string) || "flat";

        const student = await prisma.student.findFirst({
            where: {
                githubUsername: {
                    equals: username as string,
                    mode: "insensitive",
                },
            },
            select: {
                firstName: true,
                lastName: true,
                jriCalculations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        jriScore: true,
                        dsaScore: true,
                        githubScore: true,
                    },
                },
            },
        }) as any;

        if (!student || student.jriCalculations.length === 0) {
            res.setHeader("Content-Type", "image/svg+xml");
            res.setHeader("Cache-Control", "public, max-age=3600");
            res.status(200).send(generateBadgeSvg("SLH JRI", "N/A", "#6b7280", style));
            return;
        }

        const jriScore = Math.round(student.jriCalculations[0].jriScore);
        const tier = computeTier(jriScore);
        const color = tierColor(tier);

        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.status(200).send(generateBadgeSvg(`SLH ${tier}`, `${jriScore}`, color, style));
    } catch (error: unknown) {
        res.setHeader("Content-Type", "image/svg+xml");
        res.status(200).send(generateBadgeSvg("SLH JRI", "Error", "#ef4444", "flat"));
    }
});

// ───────────────────────────────────────────────────────────────────
// GET /api/public/badge/:username/dsa
// Returns an SVG badge showing DSA solve count
// ───────────────────────────────────────────────────────────────────

router.get("/badge/:username/dsa", async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const style = (req.query.style as string) || "flat";

        const student = await prisma.student.findFirst({
            where: {
                githubUsername: { equals: username as string, mode: "insensitive" },
            },
            select: {
                dsaProfiles: {
                    where: { isVerified: true, platform: "LEETCODE" },
                    select: { totalSolved: true },
                },
            },
        }) as any;

        const solved = student?.dsaProfiles[0]?.totalSolved ?? 0;
        const color = solved >= 300 ? "#10b981" : solved >= 100 ? "#3b82f6" : "#6b7280";

        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.status(200).send(generateBadgeSvg("LeetCode", `${solved} solved`, color, style));
    } catch {
        res.setHeader("Content-Type", "image/svg+xml");
        res.status(200).send(generateBadgeSvg("LeetCode", "Error", "#ef4444", "flat"));
    }
});

// ───────────────────────────────────────────────────────────────────
// GET /api/public/leaderboard/:collegeShortName
// No auth — top students by JRI for a college
// Query params: ?limit=25&batch=&department=
// ───────────────────────────────────────────────────────────────────

router.get("/leaderboard/:collegeShortName", async (req: Request, res: Response) => {
    try {
        const { collegeShortName } = req.params;
        const limit = Math.min(Number(req.query.limit ?? 25), 100);
        const batch = req.query.batch as string | undefined;
        const department = req.query.department as string | undefined;

        const college = await prisma.college.findUnique({
            where: { shortName: collegeShortName as string },
            select: { id: true, name: true, shortName: true },
        });

        if (!college) {
            res.status(404).json({ error: "College not found" });
            return;
        }

        const where: Record<string, unknown> = { collegeId: college.id };
        if (batch) where.batch = batch;
        if (department) where.department = department;

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
                jriCalculations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        jriScore: true,
                        dsaScore: true,
                        githubScore: true,
                    },
                },
            },
        });

        const ranked = students
            .filter((s) => s.jriCalculations.length > 0)
            .map((s) => {
                const jri = s.jriCalculations[0];
                const jriScore = jri.jriScore;
                return {
                    name: `${s.firstName} ${s.lastName}`,
                    department: s.department,
                    batch: s.batch,
                    githubUsername: s.githubUsername,
                    isPlaced: s.isPlaced,
                    jriScore: Math.round(jriScore * 10) / 10,
                    tier: computeTier(jriScore),
                };
            })
            .sort((a, b) => b.jriScore - a.jriScore)
            .slice(0, limit)
            .map((s, idx) => ({ rank: idx + 1, ...s }));

        res.status(200).json({
            college: { name: college.name, shortName: college.shortName },
            total: ranked.length,
            leaderboard: ranked,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch leaderboard";
        res.status(500).json({ error: message });
    }
});

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

function computeAttributes(
    dsaScore: number,
    projectScore: number,
    leetcode: any,
    codeforces: any,
    projectScores: number[]
): Record<string, number> {
    const projects = {
        analysesCount: projectScores.length,
        growth: 0, // Simplified for public view
        consistency: 50, // Simplified for public view
    };

    return computeDeveloperAttributes({
        dsaScore,
        projectScore,
        projects,
        leetcode: {
            totalSolved: leetcode?.totalSolved ?? 0,
            hardSolved: leetcode?.hardSolved ?? 0,
            contestsCount: 0,
        },
        codeforces: {
            contestsCount: 0,
        },
    });
}

function generateBadgeSvg(label: string, value: string, color: string, style: string): string {
    const labelWidth = Math.max(60, label.length * 7.5 + 12);
    const valueWidth = Math.max(40, value.length * 7.5 + 12);
    const totalWidth = labelWidth + valueWidth;

    if (style === "for-the-badge") {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" viewBox="0 0 ${totalWidth} 28">
  <g>
    <rect width="${labelWidth}" height="28" fill="#1f2937" rx="4"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="28" fill="${color}" rx="4"/>
    <rect x="${labelWidth}" width="4" height="28" fill="${color}"/>
    <rect width="4" height="28" fill="#1f2937" rx="4"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Inter,Segoe UI,Verdana,sans-serif" font-size="11" font-weight="600" letter-spacing="0.5">
    <text x="${labelWidth / 2}" y="18" textLength="${labelWidth - 14}">${escapeXml(label.toUpperCase())}</text>
    <text x="${labelWidth + valueWidth / 2}" y="18">${escapeXml(value)}</text>
  </g>
</svg>`;
    }

    // Default: flat style
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" viewBox="0 0 ${totalWidth} 20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#374151"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Inter,DejaVu Sans,Verdana,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14">${escapeXml(label)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" font-weight="bold">${escapeXml(value)}</text>
  </g>
</svg>`;
}

function escapeXml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default router;
