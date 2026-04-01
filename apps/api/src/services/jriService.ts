import axios from "axios";
import prisma from "../db";
import { leetcodeService } from "../bootstrap/leetcode";
import { 
    computeTier, 
    computeArchetype, 
    computeDeveloperAttributes, 
    clamp, 
    round,
    computeLeetCodeScore,
    computeCodeforcesScore,
    computeProjectSnapshot,
    normalizeWeights,
    NormalizedWeights,
    ProjectsSnapshot
} from "../utils/jri-logic";

type PlatformKey = "leetcode" | "codeforces";

type RecalculateInput = {
    leetcodeUsername?: string;
    codeforcesHandle?: string;
    weights?: {
        dsa?: number;
        projects?: number;
    };
};

type PlatformStats = {
    platform: PlatformKey;
    username: string | null;
    profileUrl: string | null;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    rating: number | null;
    contestsCount: number;
    fetchStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
    errorMessage: string | null;
    lastFetchedAt: string | null;
};

// ProjectsSnapshot moved to src/utils/jri-logic.ts

// Weights types moved to src/utils/jri-logic.ts

function extractLeetCodeUsername(input: string): string {
    const raw = input.trim();
    if (!raw) {
        return "";
    }

    const urlMatch = raw.match(/leetcode\.com\/(?:u\/)?([^\/\?#]+)/i);
    if (urlMatch?.[1]) {
        return decodeURIComponent(urlMatch[1].trim());
    }

    return raw.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
}

function extractCodeforcesHandle(input: string): string {
    const raw = input.trim();
    if (!raw) {
        return "";
    }

    const urlMatch = raw.match(/codeforces\.com\/profile\/([^\/\?#]+)/i);
    if (urlMatch?.[1]) {
        return decodeURIComponent(urlMatch[1].trim());
    }

    return raw.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
}

function normalizePlatformError(error: unknown, platform: "LeetCode" | "Codeforces"): string {
    if (!(error instanceof Error)) {
        return `Failed to fetch ${platform} profile`;
    }

    const message = error.message.trim();
    if (/user not found/i.test(message)) {
        return `${platform} profile was not found. Check the username or profile URL.`;
    }

    if (/fetch in progress/i.test(message)) {
        return `${platform} profile fetch is already in progress. Please retry in a few seconds.`;
    }

    if (/HTTP 429|too many requests|rate limit/i.test(message)) {
        return `${platform} rate limited the request. Please retry shortly.`;
    }

    if (/HTTP 4\d\d|HTTP 5\d\d/i.test(message)) {
        return `${platform} temporarily rejected the request (${message}).`;
    }

    return message || `Failed to fetch ${platform} profile`;
}

// Logic functions moved to src/utils/jri-logic.ts

function buildInitialPlatform(platform: PlatformKey, row?: {
    username: string;
    profileUrl: string;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    rating: number | null;
    fetchStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
    errorMessage: string | null;
    lastFetchedAt: Date | null;
}): PlatformStats {
    return {
        platform,
        username: row?.username ?? null,
        profileUrl: row?.profileUrl ?? null,
        totalSolved: row?.totalSolved ?? 0,
        easySolved: row?.easySolved ?? 0,
        mediumSolved: row?.mediumSolved ?? 0,
        hardSolved: row?.hardSolved ?? 0,
        rating: row?.rating ?? null,
        contestsCount: 0,
        fetchStatus: row?.fetchStatus ?? "PENDING",
        errorMessage: row?.errorMessage ?? null,
        lastFetchedAt: row?.lastFetchedAt?.toISOString() ?? null
    };
}

async function fetchLeetCodeStats(username: string): Promise<PlatformStats> {
    const profile = await leetcodeService.getUser(username);
    const difficulty = profile?.difficultyStats ?? {};
    const contestCount = Number(profile?.contest?.attendedContestsCount ?? 0);
    const contestRating = profile?.contest?.rating == null ? null : Number(profile.contest.rating);
    const normalizedUsername = String(profile?.profile?.username ?? username).trim();

    return {
        platform: "leetcode",
        username: normalizedUsername,
        profileUrl: `https://leetcode.com/u/${encodeURIComponent(normalizedUsername)}/`,
        totalSolved: Number(difficulty.total ?? 0),
        easySolved: Number(difficulty.easy ?? 0),
        mediumSolved: Number(difficulty.medium ?? 0),
        hardSolved: Number(difficulty.hard ?? 0),
        rating: contestRating,
        contestsCount: contestCount,
        fetchStatus: "SUCCESS",
        errorMessage: null,
        lastFetchedAt: new Date().toISOString()
    };
}

async function fetchCodeforcesStats(handle: string): Promise<PlatformStats> {
    const normalized = handle.toLowerCase();

    const [infoResponse, ratingResponse, statusResponse] = await Promise.all([
        axios.get("https://codeforces.com/api/user.info", { params: { handles: normalized }, timeout: 12_000 }),
        axios.get("https://codeforces.com/api/user.rating", { params: { handle: normalized }, timeout: 12_000 }),
        axios.get("https://codeforces.com/api/user.status", { params: { handle: normalized, from: 1, count: 5000 }, timeout: 15_000 })
    ]);

    const profile = infoResponse.data?.result?.[0];
    const ratings = Array.isArray(ratingResponse.data?.result) ? ratingResponse.data.result : [];
    const submissions = Array.isArray(statusResponse.data?.result) ? statusResponse.data.result : [];

    const acceptedProblemSet = new Set<string>();
    for (const submission of submissions) {
        if (submission?.verdict !== "OK") {
            continue;
        }

        const contestId = submission?.problem?.contestId ?? "na";
        const index = submission?.problem?.index ?? "na";
        const name = submission?.problem?.name ?? "na";
        acceptedProblemSet.add(`${contestId}:${index}:${name}`);
    }

    return {
        platform: "codeforces",
        username: normalized,
        profileUrl: `https://codeforces.com/profile/${normalized}`,
        totalSolved: acceptedProblemSet.size,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        rating: profile?.rating == null ? null : Number(profile.rating),
        contestsCount: ratings.length,
        fetchStatus: "SUCCESS",
        errorMessage: null,
        lastFetchedAt: new Date().toISOString()
    };
}

async function persistPlatformStats(studentId: string, platform: PlatformStats): Promise<void> {
    await prisma.dSAProfile.upsert({
        where: {
            studentId_platform: {
                studentId,
                platform: platform.platform === "leetcode" ? "LEETCODE" : "CODEFORCES"
            }
        },
        create: {
            studentId,
            platform: platform.platform === "leetcode" ? "LEETCODE" : "CODEFORCES",
            username: platform.username ?? "",
            profileUrl: platform.profileUrl ?? "",
            totalSolved: platform.totalSolved,
            easySolved: platform.easySolved,
            mediumSolved: platform.mediumSolved,
            hardSolved: platform.hardSolved,
            rating: platform.rating,
            fetchStatus: platform.fetchStatus,
            errorMessage: platform.errorMessage,
            lastFetchedAt: platform.lastFetchedAt ? new Date(platform.lastFetchedAt) : null
        },
        update: {
            username: platform.username ?? "",
            profileUrl: platform.profileUrl ?? "",
            totalSolved: platform.totalSolved,
            easySolved: platform.easySolved,
            mediumSolved: platform.mediumSolved,
            hardSolved: platform.hardSolved,
            rating: platform.rating,
            fetchStatus: platform.fetchStatus,
            errorMessage: platform.errorMessage,
            lastFetchedAt: platform.lastFetchedAt ? new Date(platform.lastFetchedAt) : null
        }
    });
}

async function getDSAProfile(studentId: string, platform: "LEETCODE" | "CODEFORCES") {
    return await prisma.dSAProfile.findUnique({
        where: {
            studentId_platform: {
                studentId,
                platform
            }
        }
    });
}

export const jriService = {
    async getProfile(userId: string) {
        const student = await prisma.student.findUnique({
            where: { userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                dsaProfiles: true
            }
        });

        if (!student) {
            throw new Error("Student record not found for user");
        }

        const [latestCalculation, calculationHistory, recentAnalyses] = await Promise.all([
            prisma.jRICalculation.findFirst({
                where: { studentId: student.id },
                orderBy: { createdAt: "desc" }
            }),
            prisma.jRICalculation.findMany({
                where: { studentId: student.id },
                orderBy: { createdAt: "desc" },
                take: 8,
                select: {
                    id: true,
                    jriScore: true,
                    createdAt: true
                }
            }),
            prisma.projectAnalysis.findMany({
                where: { studentId: student.id, status: "COMPLETED", overallScore: { not: null } },
                orderBy: { createdAt: "desc" },
                take: 8,
                select: {
                    overallScore: true,
                    reliabilityLevel: true,
                    createdAt: true
                }
            })
        ]);

        const projectScores = recentAnalyses
            .map((analysis) => analysis.overallScore ?? 0)
            .filter((score) => Number.isFinite(score));

        const projects = computeProjectSnapshot(projectScores);

        const leetcodeRow = student.dsaProfiles.find((row) => row.platform === "LEETCODE");
        const codeforcesRow = student.dsaProfiles.find((row) => row.platform === "CODEFORCES");

        const latestRawScores = (latestCalculation?.rawScores ?? {}) as {
            leetcode?: {
                username?: string;
                easySolved?: number;
                mediumSolved?: number;
                totalSolved?: number;
                hardSolved?: number;
                contestsCount?: number;
                fetchStatus?: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
                errorMessage?: string | null;
                lastFetchedAt?: string | null;
            };
            codeforces?: {
                username?: string;
                totalSolved?: number;
                rating?: number | null;
                contestsCount?: number;
                fetchStatus?: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
                errorMessage?: string | null;
                lastFetchedAt?: string | null;
            };
        };

        const leetcode = {
            ...buildInitialPlatform("leetcode", leetcodeRow),
            username: latestRawScores.leetcode?.username ?? leetcodeRow?.username ?? null,
            easySolved: latestRawScores.leetcode?.easySolved ?? leetcodeRow?.easySolved ?? 0,
            mediumSolved: latestRawScores.leetcode?.mediumSolved ?? leetcodeRow?.mediumSolved ?? 0,
            totalSolved: latestRawScores.leetcode?.totalSolved ?? leetcodeRow?.totalSolved ?? 0,
            hardSolved: latestRawScores.leetcode?.hardSolved ?? leetcodeRow?.hardSolved ?? 0,
            contestsCount: latestRawScores.leetcode?.contestsCount ?? 0,
            fetchStatus: latestRawScores.leetcode?.fetchStatus ?? leetcodeRow?.fetchStatus ?? "PENDING",
            errorMessage: latestRawScores.leetcode?.errorMessage ?? leetcodeRow?.errorMessage ?? null,
            isVerified: leetcodeRow?.isVerified ?? false,
            lastFetchedAt: latestRawScores.leetcode?.lastFetchedAt ?? leetcodeRow?.lastFetchedAt?.toISOString() ?? null
        };

        const codeforces = {
            ...buildInitialPlatform("codeforces", codeforcesRow),
            username: latestRawScores.codeforces?.username ?? codeforcesRow?.username ?? null,
            totalSolved: latestRawScores.codeforces?.totalSolved ?? codeforcesRow?.totalSolved ?? 0,
            rating: latestRawScores.codeforces?.rating ?? codeforcesRow?.rating ?? null,
            contestsCount: latestRawScores.codeforces?.contestsCount ?? 0,
            fetchStatus: latestRawScores.codeforces?.fetchStatus ?? codeforcesRow?.fetchStatus ?? "PENDING",
            errorMessage: latestRawScores.codeforces?.errorMessage ?? codeforcesRow?.errorMessage ?? null,
            isVerified: codeforcesRow?.isVerified ?? false,
            lastFetchedAt: latestRawScores.codeforces?.lastFetchedAt ?? codeforcesRow?.lastFetchedAt?.toISOString() ?? null
        };

        const leetcodeScore = leetcode.fetchStatus === "SUCCESS" ? computeLeetCodeScore(leetcode) : 0;
        const codeforcesScore = codeforces.fetchStatus === "SUCCESS" ? computeCodeforcesScore(codeforces) : 0;
        const hasLeetcode = leetcode.fetchStatus === "SUCCESS";
        const hasCodeforces = codeforces.fetchStatus === "SUCCESS";

        const dsaScore = hasLeetcode && hasCodeforces
            ? round((leetcodeScore + codeforcesScore) / 2)
            : hasLeetcode
                ? round(leetcodeScore)
                : hasCodeforces
                    ? round(codeforcesScore)
                    : latestCalculation?.dsaScore ?? 0;

        const weights = latestCalculation?.weights as NormalizedWeights | null;
        const normalizedWeights = normalizeWeights(weights ?? undefined);
        const projectScore = projects.averageScore;
        const jriScore = latestCalculation?.jriScore ?? round(dsaScore * normalizedWeights.dsa + projectScore * normalizedWeights.projects);
        const attributes = computeDeveloperAttributes({
            dsaScore,
            projectScore,
            projects,
            leetcode,
            codeforces
        });

        return {
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                department: student.department
            },
            card: {
                jriScore: round(jriScore),
                tier: computeTier(jriScore),
                archetype: computeArchetype(dsaScore, projectScore),
                importance: {
                    dsa: round(normalizedWeights.dsa * 100),
                    projects: round(normalizedWeights.projects * 100)
                },
                components: {
                    dsaScore: round(dsaScore),
                    projectScore: round(projectScore)
                },
                attributes
            },
            platforms: {
                leetcode,
                codeforces
            },
            projects,
            history: calculationHistory.map((entry) => ({
                id: entry.id,
                jriScore: round(entry.jriScore),
                createdAt: entry.createdAt
            }))
        };
    },

    async recalculate(userId: string, input: RecalculateInput) {
        const student = await prisma.student.findUnique({
            where: { userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                dsaProfiles: true
            }
        });

        if (!student) {
            throw new Error("Student record not found for user");
        }

        const leetcodeStored = student.dsaProfiles.find((row) => row.platform === "LEETCODE");
        const codeforcesStored = student.dsaProfiles.find((row) => row.platform === "CODEFORCES");

        const leetcodeHandleInput = extractLeetCodeUsername(input.leetcodeUsername || "");
        const codeforcesHandleInput = extractCodeforcesHandle(input.codeforcesHandle || "");

        // Only allow updating handles if they are already verified in the DB for this student
        const leetcodeHandle = (leetcodeHandleInput && leetcodeStored?.isVerified && leetcodeStored.username.toLowerCase() === leetcodeHandleInput.toLowerCase())
            ? leetcodeHandleInput 
            : (leetcodeStored?.isVerified ? leetcodeStored.username : "");
            
        const codeforcesHandle = (codeforcesHandleInput && codeforcesStored?.isVerified && codeforcesStored.username.toLowerCase() === codeforcesHandleInput.toLowerCase())
            ? codeforcesHandleInput 
            : (codeforcesStored?.isVerified ? codeforcesStored.username : "");

        let leetcode = buildInitialPlatform("leetcode", leetcodeStored);
        let codeforces = buildInitialPlatform("codeforces", codeforcesStored);

        if (leetcodeHandle) {
            try {
                leetcode = await fetchLeetCodeStats(leetcodeHandle);
                await persistPlatformStats(student.id, leetcode);
            } catch (error) {
                leetcode = {
                    ...leetcode,
                    username: leetcodeHandle,
                    profileUrl: `https://leetcode.com/u/${encodeURIComponent(leetcodeHandle)}/`,
                    fetchStatus: "FAILED",
                    errorMessage: normalizePlatformError(error, "LeetCode"),
                    lastFetchedAt: new Date().toISOString()
                };
            }
        }

        if (codeforcesHandle) {
            try {
                codeforces = await fetchCodeforcesStats(codeforcesHandle);
                await persistPlatformStats(student.id, codeforces);
            } catch (error) {
                codeforces = {
                    ...codeforces,
                    username: codeforcesHandle.toLowerCase(),
                    profileUrl: `https://codeforces.com/profile/${codeforcesHandle.toLowerCase()}`,
                    fetchStatus: "FAILED",
                    errorMessage: normalizePlatformError(error, "Codeforces"),
                    lastFetchedAt: new Date().toISOString()
                };
            }
        }

        const recentAnalyses = await prisma.projectAnalysis.findMany({
            where: { studentId: student.id, status: "COMPLETED", overallScore: { not: null } },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                overallScore: true
            }
        });

        const projectScores = recentAnalyses
            .map((analysis) => analysis.overallScore ?? 0)
            .filter((score) => Number.isFinite(score));
        const projects = computeProjectSnapshot(projectScores);

        const leetcodeScore = leetcode.fetchStatus === "SUCCESS" ? computeLeetCodeScore(leetcode) : 0;
        const codeforcesScore = codeforces.fetchStatus === "SUCCESS" ? computeCodeforcesScore(codeforces) : 0;

        const dsaSources = [leetcode.fetchStatus === "SUCCESS" ? leetcodeScore : null, codeforces.fetchStatus === "SUCCESS" ? codeforcesScore : null]
            .filter((value): value is number => value !== null);
        const dsaScore = dsaSources.length > 0
            ? round(dsaSources.reduce((sum, score) => sum + score, 0) / dsaSources.length)
            : 0;

        const projectScore = round(projects.averageScore);
        const weights = normalizeWeights(input.weights);
        const jriScore = round(dsaScore * weights.dsa + projectScore * weights.projects);

        await prisma.jRICalculation.create({
            data: {
                studentId: student.id,
                jriScore,
                githubScore: projectScore,
                dsaScore,
                academicScore: 0,
                hackathonScore: 0,
                weights,
                rawScores: {
                    leetcode: {
                        username: leetcode.username,
                        score: round(leetcodeScore),
                        totalSolved: leetcode.totalSolved,
                        easySolved: leetcode.easySolved,
                        mediumSolved: leetcode.mediumSolved,
                        hardSolved: leetcode.hardSolved,
                        contestsCount: leetcode.contestsCount,
                        fetchStatus: leetcode.fetchStatus,
                        errorMessage: leetcode.errorMessage,
                        lastFetchedAt: leetcode.lastFetchedAt
                    },
                    codeforces: {
                        username: codeforces.username,
                        score: round(codeforcesScore),
                        totalSolved: codeforces.totalSolved,
                        rating: codeforces.rating,
                        contestsCount: codeforces.contestsCount,
                        fetchStatus: codeforces.fetchStatus,
                        errorMessage: codeforces.errorMessage,
                        lastFetchedAt: codeforces.lastFetchedAt
                    },
                    projects
                },
                algorithmVersion: "jri-v1.0"
            }
        });

        return this.getProfile(userId);
    },

    async verifyPlatformAccount(userId: string, platform: PlatformKey, username: string, token: string): Promise<boolean> {
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { id: true }
        });
        if (!student) return false;

        if (platform === "leetcode") {
            const handle = extractLeetCodeUsername(username);
            if (!handle) return false;
            
            const verified = await leetcodeService.verify(handle, token);
            if (verified) {
                const normalized = handle.trim();
                await prisma.dSAProfile.upsert({
                    where: {
                        studentId_platform: {
                            studentId: student.id,
                            platform: "LEETCODE"
                        }
                    },
                    create: {
                        studentId: student.id,
                        platform: "LEETCODE",
                        username: normalized,
                        profileUrl: `https://leetcode.com/u/${encodeURIComponent(normalized)}/`,
                        isVerified: true,
                        verifiedAt: new Date()
                    },
                    update: {
                        username: normalized,
                        profileUrl: `https://leetcode.com/u/${encodeURIComponent(normalized)}/`,
                        isVerified: true,
                        verifiedAt: new Date()
                    }
                });
            }
            return verified;
        }

        if (platform === "codeforces") {
            const handle = extractCodeforcesHandle(username);
            if (!handle) return false;
            
            try {
                const normalized = handle.toLowerCase();
                const infoResponse = await axios.get("https://codeforces.com/api/user.info", { 
                    params: { handles: normalized }, 
                    timeout: 10_000 
                });
                const profile = infoResponse.data?.result?.[0];
                if (!profile) return false;

                const textToCheck = `${profile.firstName || ""} ${profile.lastName || ""} ${profile.organization || ""}`;
                const verified = textToCheck.includes(token);
                
                if (verified) {
                    await prisma.dSAProfile.upsert({
                        where: {
                            studentId_platform: {
                                studentId: student.id,
                                platform: "CODEFORCES"
                            }
                        },
                        create: {
                            studentId: student.id,
                            platform: "CODEFORCES",
                            username: normalized,
                            profileUrl: `https://codeforces.com/profile/${normalized}`,
                            isVerified: true,
                            verifiedAt: new Date()
                        },
                        update: {
                            username: normalized,
                            profileUrl: `https://codeforces.com/profile/${normalized}`,
                            isVerified: true,
                            verifiedAt: new Date()
                        }
                    });
                }
                
                return verified;
            } catch (error) {
                console.error("Codeforces verification failed:", error);
                return false;
            }
        }

        return false;
    }
};
