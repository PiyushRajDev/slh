import { RawMetrics } from '../metrics/metrics';
import { NormalizedMetrics } from '../metrics/metrics-normalization';
import { CapabilityVector } from '../profiles/profiles';
import { AuthenticityMetrics } from '../authenticity/authenticity';

export interface DimensionScore {
    score: number;
    max: number;
    breakdown: Record<string, number>;
}

export interface FinalScoreReportV4 {
    overallScore: number;
    evaluation_confidence: number;
    confidence_status: 'HIGH' | 'MEDIUM' | 'LOW';
    dimensions: {
        codeQuality: DimensionScore;
        architecture: DimensionScore;
        testing: DimensionScore;
        git: DimensionScore;
        devops: DimensionScore;
        consistency: DimensionScore; // NEW V4 DIMENSION
    };
    percentileRank: number;
}

function safeNum(val: number | null | undefined, fallback = 0): number {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// V4 Probabilistic Engine
export function calculateScoreV4(
    metrics: NormalizedMetrics,
    capabilityVector: CapabilityVector,
    antiGamingPenalty: number = 0, // Soft penalty scaler representing consistency drops
    authenticity?: AuthenticityMetrics
): FinalScoreReportV4 {
    // ------------------------------------------------------------------------
    // DIMENSION 1: Code Quality (Max 25)
    // ------------------------------------------------------------------------
    // 1.0 means exactly P75 expectations. >2.0 is highly complex (bad).
    let logicDensity = 0;
    const cNorm = metrics.complexity_normalized;
    if (cNorm === 0) logicDensity = 0; // fallback
    else if (cNorm <= 0.8) logicDensity = 10;
    else if (cNorm <= 1.2) logicDensity = 8;
    else if (cNorm <= 1.5) logicDensity = 5;
    else logicDensity = 0;

    const longCodePenalty = safeNum(metrics.long_functions_count) + safeNum(metrics.long_files_count) * 2;
    const functionHealth = Math.max(0, 5 - Math.log2(longCodePenalty + 1)); // Logarithmic decay

    const dupPercent = safeNum(metrics.duplication_percent, -1);
    const dryness = dupPercent < 0 ? 5 : dupPercent < 5 ? 5 : Math.max(0, 5 - (dupPercent / 4));

    const lintScore = 5; // Placeholder
    const styleBonus = authenticity?.style_consistency != null ? Math.round(authenticity.style_consistency * 3) : 0;
    
    // Confidence Net: 0.7 + 0.3 * MetricConfidence
    const astConf = metrics.confidence_scores?.ast_complexity ?? 1.0;
    const cqBase = Math.min(25, logicDensity + functionHealth + dryness + lintScore + styleBonus);
    const codeQualityScore = cqBase * (0.7 + 0.3 * astConf);

    // ------------------------------------------------------------------------
    // DIMENSION 2: Architecture (Max 20)
    // ------------------------------------------------------------------------
    const folderCount = safeNum(metrics.folder_count, 1);
    const structureScore = Math.min(8, Math.log2(folderCount + 1) * 2);

    const circularDeps = safeNum(metrics.circular_dependencies_count);
    const circDepScore = circularDeps === 0 ? 5 : Math.max(0, 5 - Math.log2(circularDeps + 1));

    const avgFanOut = safeNum(metrics.avg_fan_out);
    const fanOutScore = avgFanOut <= 6 ? 3 : Math.max(0, 3 - (avgFanOut - 6) / 2);

    const orphanRatio = safeNum(metrics.file_count, 1) > 0 ? safeNum(metrics.orphan_module_count) / metrics.file_count : 0;
    const orphanScore = orphanRatio <= 0.1 ? 2 : 0;

    const archBase = Math.min(20, structureScore + circDepScore + fanOutScore + orphanScore);
    const archConf = metrics.confidence_scores?.architecture ?? 1.0;
    const archScore = archBase * (0.7 + 0.3 * archConf);

    // ------------------------------------------------------------------------
    // DIMENSION 3: Testing (Max 25)
    // ------------------------------------------------------------------------
    // Normalized assertion density relies on expectations
    const aNorm = metrics.assertion_density_normalized;
    let testRigor = 0;
    if (aNorm > 1.5) testRigor = 15;
    else if (aNorm > 0.8) testRigor = 10;
    else if (aNorm > 0.3) testRigor = 5;

    const testIntegrations = metrics.ci_runs_tests ? 5 : metrics.ci_config_present ? 2 : 0;
    
    const testConf = metrics.confidence_scores?.test_parsing ?? 1.0;
    const testBase = Math.min(25, testRigor + testIntegrations + 5); 
    const testingScore = testBase * (0.7 + 0.3 * testConf);

    // ------------------------------------------------------------------------
    // DIMENSION 4: Git Discipline (Max 20)
    // ------------------------------------------------------------------------
    const avgCommitSize = safeNum(metrics.avg_commit_size);
    const gitAtomicity = (avgCommitSize > 20 && avgCommitSize < 250) ? 6 : avgCommitSize > 0 ? 3 : 0;

    const spanNorm = metrics.commit_span_normalized;
    const gitSpread = spanNorm > 0.8 ? 6 : spanNorm * 6; // linear scale

    const msgQuality = authenticity?.commit_message_quality != null ? authenticity.commit_message_quality * 6 : 0;
    
    let gitBranching = safeNum(metrics.feature_branch_count) >= 2 ? 2 : 0;

    const gitConf = metrics.confidence_scores?.git_history ?? 1.0;
    const gitBase = Math.min(20, gitAtomicity + gitSpread + msgQuality + gitBranching);
    const gitScore = gitBase * (0.7 + 0.3 * gitConf);

    // ------------------------------------------------------------------------
    // DIMENSION 5: DevOps (Max 10)
    // ------------------------------------------------------------------------
    const ciQuality = safeNum(metrics.ci_config_quality);
    const devopsCI = ciQuality >= 4 ? 6 : ciQuality >= 2 ? 4 : metrics.ci_config_present ? 2 : 0;
    const devopsDeploy = safeNum(metrics.deploy_config_types?.length) >= 1 ? 4 : 0;

    const devopsScore = Math.min(10, devopsCI + devopsDeploy);

    // ------------------------------------------------------------------------
    // DIMENSION 6: Consistency (Max 10) - THE NEW V4 SAFEGUARD
    // ------------------------------------------------------------------------
    const consistencyBase = 10;
    const consistencyScore = Math.max(0, consistencyBase - antiGamingPenalty);

    // ------------------------------------------------------------------------
    // FINAL ABSOLUTE SCORE
    // ------------------------------------------------------------------------
    const sumMaxes = 25 + 20 + 25 + 20 + 10 + 10; // 110 max points
    const absoluteScoreSum = codeQualityScore + archScore + testingScore + gitScore + devopsScore + consistencyScore;
    let absoluteScore = (absoluteScoreSum / sumMaxes) * 100;

    // ------------------------------------------------------------------------
    // V5 ADAPTIVE ANCHORS & RELATIVE SCORING
    // ------------------------------------------------------------------------
    // Mapped historical baselines against live evaluation weights
    const HARD_ANCHOR_TOY = 20;
    const ORIGINAL_ELITE_BASELINE = 95;
    const P99_ECOSYSTEM_LIVE = 97; // Mocked dynamic fetch representing current ecosystem peak
    
    // Adaptive Elite Anchor calculation (0.7 * Original + 0.3 * Live)
    const adaptiveEliteAnchor = (0.7 * ORIGINAL_ELITE_BASELINE) + (0.3 * P99_ECOSYSTEM_LIVE);
    
    // Smooth the absolute score between the Hard Bottom and the Adaptive Top
    let benchmarkAlignment = absoluteScore;
    if (absoluteScore < 30) {
        benchmarkAlignment = Math.min(absoluteScore, HARD_ANCHOR_TOY);
    } else {
        benchmarkAlignment = Math.min(absoluteScore, adaptiveEliteAnchor);
    }
    
    // Percentile rank (Historical Mock)
    const mockHistoricalPercentile = absoluteScore > 80 ? 95 : absoluteScore > 60 ? 65 : 30;

    const finalScore = Math.round((0.6 * absoluteScore) + (0.2 * mockHistoricalPercentile) + (0.2 * benchmarkAlignment));

    // ------------------------------------------------------------------------
    // V5 GLOBAL EVALUATION CONFIDENCE
    // ------------------------------------------------------------------------
    const confScore = (astConf + archConf + testConf + gitConf) / 4;
    const global_evaluation_confidence = Number(confScore.toFixed(2));
    let global_confidence_status: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (global_evaluation_confidence < 0.6) global_confidence_status = 'LOW';
    else if (global_evaluation_confidence < 0.85) global_confidence_status = 'MEDIUM';


    return {
        overallScore: Math.min(100, Math.max(0, finalScore)),
        evaluation_confidence: global_evaluation_confidence,
        confidence_status: global_confidence_status,
        percentileRank: mockHistoricalPercentile,
        dimensions: {
            codeQuality: { score: codeQualityScore, max: 25, breakdown: { logicDensity, functionHealth, dryness } },
            architecture: { score: archScore, max: 20, breakdown: { structureScore, circDepScore, fanOutScore, orphanScore } },
            testing: { score: testingScore, max: 25, breakdown: { testRigor, testIntegrations } },
            git: { score: gitScore, max: 20, breakdown: { gitAtomicity, gitSpread, msgQuality } },
            devops: { score: devopsScore, max: 10, breakdown: { devopsCI, devopsDeploy } },
            consistency: { score: consistencyScore, max: 10, breakdown: { base: consistencyBase, penalty: antiGamingPenalty } }
        }
    };
}
