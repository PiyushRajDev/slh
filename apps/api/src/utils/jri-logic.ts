/**
 * Centralized logic for JRI (Job Readiness Index) calculations,
 * tiers, archetypes, and developer attributes.
 * This ensures consistency across Admin, Student, and Public dashboards.
 */

export function computeTier(score: number): string {
    if (score >= 90) return "Legend";
    if (score >= 80) return "Elite";
    if (score >= 70) return "Pro";
    if (score >= 60) return "Rising";
    if (score >= 45) return "Challenger";
    return "Rookie";
}

export function tierColor(tier: string): string {
    switch (tier) {
        case "Legend": return "#eab308";
        case "Elite": return "#8b5cf6";
        case "Pro": return "#3b82f6";
        case "Rising": return "#10b981";
        case "Challenger": return "#f59e0b";
        default: return "#6b7280";
    }
}

export function computeArchetype(dsaScore: number, projectScore: number): string {
    const delta = dsaScore - projectScore;
    if (delta >= 12) return "Algorithm Specialist";
    if (delta <= -12) return "Product Builder";
    return "Balanced Engineer";
}

export function clamp(value: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, value));
}

export function round(value: number): number {
    return Math.round(value * 100) / 100;
}

export type ProjectsSnapshot = {
    analysesCount: number;
    latestScore: number;
    averageScore: number;
    bestScore: number;
    growth: number;
    consistency: number;
};

export function computeLeetCodeScore(stats: { 
    totalSolved: number; 
    hardSolved: number; 
    contestsCount: number 
}): number {
    const solved = clamp((stats.totalSolved / 500) * 70);
    const hard = clamp((stats.hardSolved / 80) * 20);
    const contests = clamp((stats.contestsCount / 30) * 10);
    return clamp(solved + hard + contests);
}

export function computeCodeforcesScore(stats: { 
    totalSolved: number; 
    rating: number | null; 
    contestsCount: number 
}): number {
    const solved = clamp((stats.totalSolved / 2000) * 35);
    const rating = clamp(((stats.rating ?? 0) / 2100) * 55);
    const contests = clamp((stats.contestsCount / 120) * 10);
    return clamp(solved + rating + contests);
}

export function computeProjectSnapshot(scores: number[]): ProjectsSnapshot {
    if (scores.length === 0) {
        return {
            analysesCount: 0,
            latestScore: 0,
            averageScore: 0,
            bestScore: 0,
            growth: 0,
            consistency: 40
        };
    }

    const latestScore = scores[0];
    const bestScore = Math.max(...scores);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const oldestScore = scores[scores.length - 1];
    const growth = latestScore - oldestScore;

    let consistency = 50;
    if (scores.length >= 2) {
        const variance = scores.reduce((sum, score) => sum + (score - averageScore) ** 2, 0) / scores.length;
        const stdDev = Math.sqrt(variance);
        consistency = clamp(85 - stdDev * 1.2 + (growth > 0 ? Math.min(growth, 10) : growth * 0.3), 25, 98);
    } else {
        consistency = clamp(55 + latestScore * 0.2, 40, 90);
    }

    return {
        analysesCount: scores.length,
        latestScore,
        averageScore: round(averageScore),
        bestScore,
        growth: round(growth),
        consistency: round(consistency)
    };
}

export function computeDeveloperAttributes(input: {
    dsaScore: number;
    projectScore: number;
    projects: Pick<ProjectsSnapshot, "analysesCount" | "growth" | "consistency">;
    leetcode: { totalSolved: number; hardSolved: number; contestsCount: number };
    codeforces: { contestsCount: number };
}): Record<string, number> {
    const { dsaScore, projectScore, projects, leetcode, codeforces } = input;

    const hardDepth = leetcode.totalSolved > 0
        ? clamp((leetcode.hardSolved / leetcode.totalSolved) * 100)
        : 0;
    const contestActivity = clamp(((leetcode.contestsCount + codeforces.contestsCount) / 40) * 100);
    const analysisCadence = clamp((projects.analysesCount / 8) * 100);
    const growthMomentum = projects.analysesCount >= 2
        ? clamp((projects.growth + 15) * 3.3)
        : clamp(projectScore * 0.45);

    return {
        "Problem Solving": round(clamp(dsaScore * 0.82 + hardDepth * 0.18)),
        "Code Quality": round(clamp(projectScore * 0.78 + projects.consistency * 0.22)),
        "Architecture": round(clamp(projectScore * 0.68 + growthMomentum * 0.2 + dsaScore * 0.12)),
        "Delivery": round(clamp(projects.consistency * 0.6 + analysisCadence * 0.25 + contestActivity * 0.15)),
        "Learning Velocity": round(clamp(growthMomentum * 0.5 + hardDepth * 0.25 + contestActivity * 0.25)),
    };
}
export type NormalizedWeights = {
    dsa: number;
    projects: number;
};

export const DEFAULT_WEIGHTS: NormalizedWeights = {
    dsa: 0.55,
    projects: 0.45,
};

export function normalizeWeights(input?: { dsa?: number; projects?: number }): NormalizedWeights {
    const dsa = Math.max(0, input?.dsa ?? DEFAULT_WEIGHTS.dsa);
    const projects = Math.max(0, input?.projects ?? DEFAULT_WEIGHTS.projects);
    const sum = dsa + projects;

    if (sum <= 0) {
        return DEFAULT_WEIGHTS;
    }

    return {
        dsa: dsa / sum,
        projects: projects / sum,
    };
}
