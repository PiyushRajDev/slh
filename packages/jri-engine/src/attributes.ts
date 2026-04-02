import { clamp, round } from './utils';
import type { ProjectsSnapshot, DSAProfileInput } from './types';

export interface AttributeInput {
    dsaScore: number;
    projectScore: number;
    projects: Pick<ProjectsSnapshot, 'analysesCount' | 'growth' | 'consistency'>;
    leetcode: { totalSolved: number; hardSolved: number; contestsCount: number };
    codeforces: { contestsCount: number };
}

/**
 * Compute five developer attributes (each 0–100) that give
 * a radar-chart view of the student's strengths.
 */
export function computeDeveloperAttributes(input: AttributeInput): Record<string, number> {
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
        'Problem Solving': round(clamp(dsaScore * 0.82 + hardDepth * 0.18)),
        'Code Quality': round(clamp(projectScore * 0.78 + projects.consistency * 0.22)),
        'Architecture': round(clamp(projectScore * 0.68 + growthMomentum * 0.2 + dsaScore * 0.12)),
        'Delivery': round(clamp(projects.consistency * 0.6 + analysisCadence * 0.25 + contestActivity * 0.15)),
        'Learning Velocity': round(clamp(growthMomentum * 0.5 + hardDepth * 0.25 + contestActivity * 0.25)),
    };
}

/**
 * Extract platform-level stats needed by the attribute calculator
 * from an array of DSA profile inputs.
 */
export function extractPlatformStats(profiles: DSAProfileInput[]) {
    const lc = profiles.find(p => p.platform === 'LEETCODE');
    const cf = profiles.find(p => p.platform === 'CODEFORCES');

    return {
        leetcode: {
            totalSolved: lc?.totalSolved ?? 0,
            hardSolved: lc?.hardSolved ?? 0,
            contestsCount: lc?.contestsCount ?? 0,
        },
        codeforces: {
            contestsCount: cf?.contestsCount ?? 0,
        },
    };
}
