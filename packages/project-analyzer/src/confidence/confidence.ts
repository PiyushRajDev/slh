import { RawMetrics } from '../metrics/metrics';
import { SelectionResult } from '../selection/selection';

export interface ConfidenceReport {
    overallConfidence: number; // 0.0 to 1.0
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    factors: {
        dataCompleteness: number;
        profileMatch: number;
        reliability: number;
    };
    scoreRange: number; // The "±" range for the score
}

export function calculateConfidence(metrics: RawMetrics, selection: SelectionResult): ConfidenceReport {
    // Gracefully handle NaN and negatives
    const countRaw = Number(metrics.commit_count);
    const spanRaw = Number(metrics.commit_span_days);
    const locRaw = Number(metrics.total_loc);

    const commitCount = Number.isFinite(countRaw) ? Math.max(0, countRaw) : 0;
    const commitSpanDays = Number.isFinite(spanRaw) ? Math.max(0, spanRaw) : 0;
    const totalLoc = Number.isFinite(locRaw) ? Math.max(0, locRaw) : 0;

    const matchRaw = Number(selection.fitnessScore);
    const relRaw = Number(selection.reliabilityScore);
    const profileMatch = Number.isFinite(matchRaw) ? Math.max(0, matchRaw) : 0;
    const reliability = Number.isFinite(relRaw) ? Math.max(0, relRaw) : 0;

    // 1. Data Completeness (0-1) - Continuous scale up to threshold
    const dataCompleteness = (Math.min(1, commitCount / 20) * 0.4) +
        (Math.min(1, commitSpanDays / 14) * 0.3) +
        (Math.min(1, totalLoc / 1000) * 0.3);

    // 2. Final Aggregation
    let overallConfidenceRaw = (dataCompleteness * 0.4) + (profileMatch * 0.3) + (reliability * 0.3);
    let overallConfidence = Math.max(0.0, Math.min(1.0, overallConfidenceRaw));

    // 3. Mathematical Caps protecting the system
    // "A genius with one commit has high capability but low confidence."
    if (commitSpanDays < 5 || commitCount < 5) {
        overallConfidence = Math.min(overallConfidence, 0.60); // Max LOW
    } else if (commitCount < 20) {
        overallConfidence = Math.min(overallConfidence, 0.85); // Max MEDIUM
    }

    let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let scoreRange = 15;

    if (overallConfidence > 0.85) {
        level = 'HIGH';
        scoreRange = 3;
    } else if (overallConfidence > 0.60) {
        level = 'MEDIUM';
        scoreRange = 8;
    }

    return {
        overallConfidence,
        level,
        factors: {
            dataCompleteness,
            profileMatch,
            reliability
        },
        scoreRange
    };
}
