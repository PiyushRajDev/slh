import { RawMetrics } from './metrics';
import { ProfileId, CapabilityVector } from '../profiles/profiles';

export interface NormalizedMetrics extends RawMetrics {
    complexity_normalized: number;
    assertion_density_normalized: number;
    commit_span_normalized: number;
    loc_tier: 'toy' | 'small' | 'medium' | 'large';
}

// In a real system, these would be fetched from a rolling database (EvaluationLog).
// For v4, we use static Gold Dataset anchors as our P75 baselines.
const P75_BASELINES: Record<ProfileId, { complexity: number, assertion_density: number, target_loc: number }> = {
    frontend_app: { complexity: 12, assertion_density: 1.5, target_loc: 5000 },
    backend_api: { complexity: 15, assertion_density: 3.0, target_loc: 8000 },
    production_web_app: { complexity: 18, assertion_density: 3.5, target_loc: 12000 },
    cli_tool: { complexity: 12, assertion_density: 4.0, target_loc: 3000 },
    library: { complexity: 10, assertion_density: 5.0, target_loc: 2000 },
    ml_pipeline: { complexity: 25, assertion_density: 1.0, target_loc: 4000 },
    academic: { complexity: 12, assertion_density: 1.0, target_loc: 1500 },
    generic: { complexity: 15, assertion_density: 2.0, target_loc: 5000 }
};

export function normalizeMetrics(raw: RawMetrics, cap: CapabilityVector): NormalizedMetrics {
    let expectedComplexity = 0;
    let expectedDensity = 0;
    let totalEffectiveWeight = 0;

    for (const [id, tuple] of Object.entries(cap)) {
        const weight = tuple.value * tuple.confidence;
        if (weight > 0) {
            const baselines = P75_BASELINES[id as ProfileId];
            expectedComplexity += baselines.complexity * weight;
            expectedDensity += baselines.assertion_density * weight;
            totalEffectiveWeight += weight;
        }
    }

    if (totalEffectiveWeight === 0) {
        // Fallback to generic if no valid capabilities
        expectedComplexity = P75_BASELINES.generic.complexity;
        expectedDensity = P75_BASELINES.generic.assertion_density;
    } else {
        expectedComplexity /= totalEffectiveWeight;
        expectedDensity /= totalEffectiveWeight;
    }

    const complexityRaw = raw.complexity_avg ?? 0;
    const densityRaw = raw.assertion_density ?? 0;

    const totalLoc = raw.total_loc || 0;
    let loc_tier: 'toy' | 'small' | 'medium' | 'large' = 'toy';
    if (totalLoc > 10000) loc_tier = 'large';
    else if (totalLoc > 2000) loc_tier = 'medium';
    else if (totalLoc > 500) loc_tier = 'small';

    // Normalizations: 1.0 means exactly P75
    // Caps to avoid infinity, bounded between 0 and 3.0
    return {
        ...raw,
        complexity_normalized: Math.max(0, Math.min(3.0, complexityRaw / expectedComplexity)),
        assertion_density_normalized: Math.max(0, Math.min(3.0, densityRaw / expectedDensity)),
        commit_span_normalized: raw.commit_span_days ? Math.min(1.0, raw.commit_span_days / 14) : 0,
        loc_tier
    };
}
