import type { WeightConfig, NormalizedWeights } from './types';

/**
 * Default weights.
 *
 * DSA      (40%) — problem-solving depth across platforms
 * Projects (35%) — static analysis of actual code (most concrete evidence)
 * Academic (15%) — CGPA + coursework
 * Hackathon(10%) — participation and awards
 */
export const DEFAULT_WEIGHTS: NormalizedWeights = {
    dsa: 0.40,
    projects: 0.35,
    academic: 0.15,
    hackathon: 0.10,
};

/**
 * Normalize a partial weight config so all active components sum to 1.0.
 * Zero-valued weights stay zero. Missing keys fall back to defaults.
 */
export function normalizeWeights(input?: WeightConfig): NormalizedWeights {
    const raw: NormalizedWeights = {
        dsa: Math.max(0, input?.dsa ?? DEFAULT_WEIGHTS.dsa),
        projects: Math.max(0, input?.projects ?? DEFAULT_WEIGHTS.projects),
        academic: Math.max(0, input?.academic ?? DEFAULT_WEIGHTS.academic),
        hackathon: Math.max(0, input?.hackathon ?? DEFAULT_WEIGHTS.hackathon),
    };

    const sum = raw.dsa + raw.projects + raw.academic + raw.hackathon;

    if (sum <= 0) {
        return { ...DEFAULT_WEIGHTS };
    }

    return {
        dsa: raw.dsa / sum,
        projects: raw.projects / sum,
        academic: raw.academic / sum,
        hackathon: raw.hackathon / sum,
    };
}
