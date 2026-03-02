"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateConfidence = calculateConfidence;
function calculateConfidence(metrics, selection) {
    // Gracefully handle NaN and negatives
    var countRaw = Number(metrics.commit_count);
    var spanRaw = Number(metrics.commit_span_days);
    var locRaw = Number(metrics.total_loc);
    var commitCount = Number.isFinite(countRaw) ? Math.max(0, countRaw) : 0;
    var commitSpanDays = Number.isFinite(spanRaw) ? Math.max(0, spanRaw) : 0;
    var totalLoc = Number.isFinite(locRaw) ? Math.max(0, locRaw) : 0;
    var matchRaw = Number(selection.fitnessScore);
    var relRaw = Number(selection.reliabilityScore);
    var profileMatch = Number.isFinite(matchRaw) ? Math.max(0, matchRaw) : 0;
    var reliability = Number.isFinite(relRaw) ? Math.max(0, relRaw) : 0;
    // 1. Data Completeness (0-1) - Continuous scale up to threshold
    var dataCompleteness = (Math.min(1, commitCount / 20) * 0.4) +
        (Math.min(1, commitSpanDays / 14) * 0.3) +
        (Math.min(1, totalLoc / 1000) * 0.3);
    // 2. Final Aggregation
    var overallConfidenceRaw = (dataCompleteness * 0.4) + (profileMatch * 0.3) + (reliability * 0.3);
    var overallConfidence = Math.max(0.0, Math.min(1.0, overallConfidenceRaw));
    // 3. Mathematical Caps protecting the system
    // "A genius with one commit has high capability but low confidence."
    if (commitSpanDays < 5 || commitCount < 5) {
        overallConfidence = Math.min(overallConfidence, 0.60); // Max LOW
    }
    else if (commitCount < 20) {
        overallConfidence = Math.min(overallConfidence, 0.85); // Max MEDIUM
    }
    var level = 'LOW';
    var scoreRange = 15;
    if (overallConfidence > 0.85) {
        level = 'HIGH';
        scoreRange = 3;
    }
    else if (overallConfidence > 0.60) {
        level = 'MEDIUM';
        scoreRange = 8;
    }
    return {
        overallConfidence: overallConfidence,
        level: level,
        factors: {
            dataCompleteness: dataCompleteness,
            profileMatch: profileMatch,
            reliability: reliability
        },
        scoreRange: scoreRange
    };
}
