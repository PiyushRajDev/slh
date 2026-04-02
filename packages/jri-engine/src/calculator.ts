import type {
    JRIInput,
    JRIResult,
    NormalizedWeights,
    ComponentBreakdown,
    ProjectsSnapshot,
} from './types';
import { round, clamp } from './utils';
import { normalizeWeights } from './weights';
import { computeTier } from './tiers';
import { computeArchetype } from './archetypes';
import { computeDeveloperAttributes, extractPlatformStats } from './attributes';
import { scoreDSA } from './scorers/dsa.scorer';
import { scoreProjects, computeProjectsSnapshot } from './scorers/project.scorer';
import { scoreAcademic } from './scorers/academic.scorer';
import { scoreHackathon } from './scorers/hackathon.scorer';

export const ALGORITHM_VERSION = 'jri-v2.0';

/**
 * Deterministic JRI calculator.
 * Same input always produces the same output — no network calls, no randomness.
 *
 * Formula:
 *   JRI = (W_github * S_github) + (W_dsa * S_dsa) + (W_projects * S_projects)
 *       + (W_academic * S_academic) + (W_hackathon * S_hackathon)
 *
 * All component scores are 0–100. Weights are normalized to sum to 1.0.
 */
export function calculateJRI(input: JRIInput): JRIResult {
    // ── Score each component ──
    const dsaResult = input.dsaProfiles?.length
        ? scoreDSA(input.dsaProfiles)
        : emptyBreakdown();

    const projectResult = input.projectAnalyses?.length
        ? scoreProjects(input.projectAnalyses)
        : emptyBreakdown();

    const academicResult = scoreAcademic(input.academic);

    const hackathonResult = input.hackathons?.length
        ? scoreHackathon(input.hackathons)
        : emptyBreakdown();

    // ── Normalize weights ──
    const weights = resolveWeights(input);

    // ── Weighted aggregation ──
    const jriRaw =
        weights.dsa * dsaResult.score +
        weights.projects * projectResult.score +
        weights.academic * academicResult.score +
        weights.hackathon * hackathonResult.score;

    const jriScore = round(clamp(jriRaw));

    // ── Derived metrics ──
    const tier = computeTier(jriScore);
    const archetype = computeArchetype(dsaResult.score, projectResult.score);

    // ── Projects snapshot ──
    const projectsSnapshot = input.projectAnalyses?.length
        ? computeProjectsSnapshot(input.projectAnalyses)
        : { analysesCount: 0, latestScore: 0, averageScore: 0, bestScore: 0, growth: 0, consistency: 40 };

    // ── Developer attributes ──
    const platformStats = extractPlatformStats(input.dsaProfiles ?? []);
    const attributes = computeDeveloperAttributes({
        dsaScore: dsaResult.score,
        projectScore: projectResult.score,
        projects: projectsSnapshot,
        leetcode: platformStats.leetcode,
        codeforces: platformStats.codeforces,
    });

    return {
        jriScore,
        tier,
        archetype,
        algorithmVersion: ALGORITHM_VERSION,
        components: {
            dsa: dsaResult,
            projects: projectResult,
            academic: academicResult,
            hackathon: hackathonResult,
        },
        weights,
        attributes,
        projects: projectsSnapshot,
    };
}

/**
 * Batch-calculate JRI for multiple students.
 */
export function calculateJRIBatch(inputs: JRIInput[]): JRIResult[] {
    return inputs.map(calculateJRI);
}

// ─── Helpers ───────────────────────────────────────────────────

function emptyBreakdown(): ComponentBreakdown {
    return { score: 0, max: 100, details: {} };
}

/**
 * Resolve weights, auto-redistributing when components are missing data.
 * If a component has no input data, its weight is redistributed proportionally.
 */
function resolveWeights(input: JRIInput): NormalizedWeights {
    const base = normalizeWeights(input.weights);

    const hasDsa = (input.dsaProfiles?.length ?? 0) > 0;
    const hasProjects = (input.projectAnalyses?.length ?? 0) > 0;
    const hasAcademic = !!input.academic;
    const hasHackathons = (input.hackathons?.length ?? 0) > 0;

    // If all present or all absent, use base weights directly
    const allPresent = hasDsa && hasProjects && hasAcademic && hasHackathons;
    const nonePresent = !hasDsa && !hasProjects && !hasAcademic && !hasHackathons;
    if (allPresent || nonePresent) return base;

    // Zero out missing components and redistribute
    const adjusted: NormalizedWeights = {
        dsa: hasDsa ? base.dsa : 0,
        projects: hasProjects ? base.projects : 0,
        academic: hasAcademic ? base.academic : 0,
        hackathon: hasHackathons ? base.hackathon : 0,
    };

    const activeSum = adjusted.dsa + adjusted.projects + adjusted.academic + adjusted.hackathon;

    if (activeSum <= 0) return base;

    return {
        dsa: adjusted.dsa / activeSum,
        projects: adjusted.projects / activeSum,
        academic: adjusted.academic / activeSum,
        hackathon: adjusted.hackathon / activeSum,
    };
}
