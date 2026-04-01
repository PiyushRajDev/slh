import { NormalizedMetrics } from '../metrics/metrics-normalization';
import { CapabilityVector } from '../profiles/profiles';
import { StructuralSignals } from '../signals/signals';
import { AntiGamingReport, AntiGamingFlag } from './anti-gaming';

export interface V4AntiGamingResult {
    report: AntiGamingReport;
    consistencyPenalty: number;
}

export function detectGamingV4(
    metrics: NormalizedMetrics,
    signals: StructuralSignals,
    capability: CapabilityVector
): V4AntiGamingResult {
    const flags: AntiGamingFlag[] = [];
    let consistencyPenalty = 0;

    // BOOTSTRAP MODE: Probabilistic Consistency Heuristics
    // In Phase 3, these will be replaced by evaluation_feedback_log Bayesian lookups

    // 1. Ghost Tests (High Assertions, No CI)
    if (metrics.test_file_count > 5 && !metrics.ci_config_present) {
        flags.push({
            pattern: 'GHOST_TESTS',
            severity: 'low',
            description: 'Significant test coverage without continuous integration detected.',
            evidence: { mitigation: 'Applying minor statistical deviation penalty. Consistency Drops.' }
        });
        consistencyPenalty += 1.5; 
    }

    // 2. Hollow Boilerplate (Massive LOC, Minimal Complexity)
    if ((metrics.loc_tier === 'large' || metrics.loc_tier === 'medium') && metrics.complexity_normalized < 0.2) {
        flags.push({
            pattern: 'HOLLOW_BOILERPLATE',
            severity: 'high',
            description: 'Massive code volume with extremely low logical density (likely scaffolded framework).',
            evidence: { mitigation: 'Applying structural penalty. Consistency massively drops.' }
        });
        consistencyPenalty += 3.0;
    }

    // 3. SEMANTIC CHANGE ENTROPY (Anti-Scripted Commits)
    // Massive commit counts with virtually zero logical semantic density indicates padding via whitespace/variable renames
    const commits = metrics.commit_count || 0;
    if (commits > 50 && (metrics.commit_span_normalized < 0.1 || metrics.complexity_normalized < 0.3)) {
         flags.push({
            pattern: 'LOW_SEMANTIC_ENTROPY',
            severity: 'high', // No 'critical' available in legacy struct
            description: 'Unrealistically high commit volume with minimal semantic evolution (Scripted/Bottled activity).',
            evidence: { mitigation: 'Semantic Entropy validation failed. Hard capping maturity signals.' }
        });
        consistencyPenalty += 4.0;
    }

    // 4. Time Travel / Single Day Dumps
    if (commits > 10 && metrics.active_days_count === 1) {
        flags.push({
            pattern: 'SINGLE_DAY_DUMP',
            severity: 'medium',
            description: 'All commits pushed in a single active day.',
            evidence: { mitigation: 'Reducing git spread score proportionally.' }
        });
        consistencyPenalty += 1.0;
    }

    // Translate to V3 report struct for backwards compatibility in the UI
    let reliabilityScore = 1.0;
    for (const flag of flags) {
        if (flag.severity === 'high') reliabilityScore -= 0.30;
        if (flag.severity === 'medium') reliabilityScore -= 0.15;
        if (flag.severity === 'low') reliabilityScore -= 0.05;
    }
    reliabilityScore = Math.max(0, reliabilityScore);

    let reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    if (reliabilityScore >= 0.8) reliabilityLevel = 'HIGH';
    else if (reliabilityScore >= 0.5) reliabilityLevel = 'MEDIUM';
    else reliabilityLevel = 'LOW';

    return {
        consistencyPenalty: Math.min(10, consistencyPenalty),
        report: {
            flags,
            flagCount: flags.length,
            reliabilityScore,
            reliabilityLevel
        }
    };
}
