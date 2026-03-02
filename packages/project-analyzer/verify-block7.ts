import { calculateConfidence } from './src/confidence/confidence';
import { RawMetrics } from './src/metrics/metrics';
import { SelectionResult } from './src/selection/selection';

const mockMetrics = {
    commit_count: 2,
    commit_span_days: 1,
    total_loc: 500
} as RawMetrics;

const mockSelection = {
    profileId: 'backend_api',
    displayName: 'Backend API',
    rawScore: 80,
    reliabilityScore: 1.0,
    reliabilityLevel: 'HIGH',
    defensibleScore: 80,
    fitnessScore: 0.90 // 90% match
} as SelectionResult;

const report = calculateConfidence(mockMetrics, mockSelection);

console.log("Evaluating Confidence for 90% match, but only 2 commits & 1 day history:");
console.log(`Overall Confidence: ${report.overallConfidence.toFixed(2)}`);
console.log(`Level: ${report.level}`);
console.log(`Score Range: ±${report.scoreRange}`);
console.log(`Factors:`, report.factors);

if (report.level !== 'LOW') {
    throw new Error('Expected Confidence Level to be LOW for small sample size.');
}

if (report.scoreRange !== 15) {
    throw new Error('Expected Score Range to be ±15 for LOW confidence.');
}

console.log('✅ Verification passed! The system successfully protected itself against over-valuing small evidence.');
