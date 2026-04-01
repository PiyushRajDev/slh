import { RawMetrics } from '../metrics/metrics';
import { SelectionResult } from '../selection/selection';

export interface ConfidenceReport {
    overallConfidence: number; // 0.0 to 1.0
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    factors: {
        metricQuality: number;
        dataCompleteness: number;
        profileMatch: number;
        reliability: number;
    };
    scoreRange: number; // The "±" range for the score
}

export function calculateConfidence(metrics: RawMetrics, selection: SelectionResult): ConfidenceReport {
    // 1. Metric Quality (0-1) - ~35% Weight
    // How many of the core metric extraction layers succeeded?
    let metricQualityPoints = 0;
    let metricQualityMax = 0;

    metricQualityMax += 1;
    metricQualityPoints += metrics.total_loc != null ? 0.9 : 0.0;

    metricQualityMax += 1;
    metricQualityPoints += metrics.commit_count != null ? 0.95 : 0.0;

    metricQualityMax += 1;
    metricQualityPoints += metrics.complexity_avg != null ? 0.95 : 0.0;

    metricQualityMax += 1;
    metricQualityPoints += metrics.test_file_count != null ? 0.9 : 0.0;

    const metricQuality = metricQualityMax > 0 ? (metricQualityPoints / metricQualityMax) : 0.0;

    // 2. Data Completeness (0-1) - ~15% Weight
    // Starts at 0.5, gains boost based on evidence volume
    let dataCompleteness = 0.5;
    if ((metrics.commit_count || 0) >= 20) dataCompleteness += 0.1;
    if ((metrics.test_file_count || 0) > 0) dataCompleteness += 0.1;
    if (metrics.ci_config_present) dataCompleteness += 0.05;
    if ((metrics.markup_loc?.md || 0) > 0) dataCompleteness += 0.05; // has some docs
    if (Object.keys(metrics.languages || {}).length > 1) dataCompleteness += 0.05;
    if ((metrics.commit_span_days || 0) > 30) dataCompleteness += 0.1;
    dataCompleteness = Math.min(1.0, dataCompleteness);

    // 3. Profile Match (0-1) - ~25% Weight
    let profileMatch = selection.fitnessScore || 0;
    if (profileMatch >= 0.80) profileMatch = Math.min(1.0, profileMatch * 1.1); // Boost
    else if (profileMatch < 0.60) profileMatch = Math.max(0.0, profileMatch * 0.9); // Penalty
    else profileMatch = profileMatch; // Neutral

    // 4. Reliability (0-1) - ~25% Weight
    let reliability = selection.reliabilityScore || 0;

    // Calculate overall confidence using doc weights
    let overallConfidenceRaw = (metricQuality * 0.35) + (profileMatch * 0.25) + (reliability * 0.25) + (dataCompleteness * 0.15);
    let overallConfidence = Math.max(0.0, Math.min(1.0, overallConfidenceRaw));

    if (selection.missingGitMetrics) {
        overallConfidence = Math.min(overallConfidence, 0.68);
    }
    if (selection.isAmbiguous && (selection.profileId === 'academic' || selection.profileId === 'generic')) {
        overallConfidence = Math.min(overallConfidence, 0.64);
    }

    // Mathematical Caps
    if ((metrics.commit_span_days || 0) < 5 || (metrics.commit_count || 0) < 5) {
        overallConfidence = Math.min(overallConfidence, 0.60); // Max LOW
    } else if ((metrics.commit_count || 0) < 20) {
        overallConfidence = Math.min(overallConfidence, 0.84); // Max MEDIUM
    }

    let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let scoreRange = 15;

    if (overallConfidence >= 0.85) {
        level = 'HIGH';
        scoreRange = 3;
    } else if (overallConfidence >= 0.70) {
        level = 'MEDIUM';
        scoreRange = 8;
    }

    return {
        overallConfidence,
        level,
        factors: {
            metricQuality,
            dataCompleteness,
            profileMatch,
            reliability
        },
        scoreRange
    };
}
