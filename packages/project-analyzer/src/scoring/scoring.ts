import { RawMetrics } from '../metrics/metrics';
import { ProfileId, getProfileScoringWeights } from '../profiles/profiles';
import { AuthenticityMetrics } from '../authenticity/authenticity';

export interface DimensionScore {
    score: number;
    max: number;
    breakdown: Record<string, number>;
}

export interface FinalScoreReport {
    overallScore: number;
    dimensions: {
        codeQuality: DimensionScore;
        architecture: DimensionScore;
        testing: DimensionScore;
        git: DimensionScore;
        devops: DimensionScore;
    };
}

interface ComplexityThresholds { low: number; mid: number; high: number }

const COMPLEXITY_THRESHOLDS: Record<string, ComplexityThresholds> = {
    frontend_app: { low: 5, mid: 10, high: 15 },
    cli_tool: { low: 5, mid: 10, high: 15 },
    library: { low: 5, mid: 10, high: 15 },
    backend_api: { low: 7, mid: 12, high: 18 },
    production_web_app: { low: 7, mid: 12, high: 18 },
    academic: { low: 7, mid: 12, high: 18 },
    ml_pipeline: { low: 10, mid: 20, high: 30 },  // ML code is complex by nature
    generic: { low: 7, mid: 12, high: 18 }
};

function safeNum(val: number | null | undefined, fallback = 0): number {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function calculateScore(metrics: RawMetrics, profileId: ProfileId, authenticity?: AuthenticityMetrics): FinalScoreReport {
    const weights = getProfileScoringWeights(profileId);
    const thresholds = COMPLEXITY_THRESHOLDS[profileId] ?? COMPLEXITY_THRESHOLDS['generic'];

    // -------------------------------------------------------
    // Dimension 1: Code Quality (Max 25)
    // Complexity score (0-10)
    // -------------------------------------------------------
    const complexityAvg = safeNum(metrics.complexity_avg, -1);
    let logicDensity: number;
    if (complexityAvg < 0) {
        logicDensity = 0; // null/missing — no evidence of logic density
    } else if (complexityAvg < thresholds.low) {
        logicDensity = 10;
    } else if (complexityAvg < thresholds.mid) {
        logicDensity = 6;
    } else if (complexityAvg < thresholds.high) {
        logicDensity = 3;
    } else {
        logicDensity = 0;
    }

    // Long code score (0-5): penalty = longFunctions + longFiles*2
    const longFunctions = safeNum(metrics.long_functions_count);
    const longFiles = safeNum(metrics.long_files_count);
    const longCodePenalty = longFunctions + longFiles * 2;
    const functionHealth = longCodePenalty <= 2 ? 5 : longCodePenalty <= 5 ? 3 : 0;

    // Duplication score (0-5): null treated as <5% (no evidence of duplication)
    const dupPercent = safeNum(metrics.duplication_percent, -1);
    const dryness = dupPercent < 0 ? 5 : dupPercent < 5 ? 5 : dupPercent < 10 ? 3 : dupPercent < 20 ? 1 : 0;

    // Lint score (0-5): null treated as no critical violations
    const lintViolations = safeNum(metrics.lint_violations_count, -1);
    const lintScore = lintViolations < 0 ? 5 : lintViolations === 0 ? 5 : lintViolations <= 5 ? 3 : lintViolations <= 15 ? 1 : 0;

    // Style consistency bonus (0-3): from authenticity analysis — additive on top of base
    const styleConsistencyRaw = authenticity?.style_consistency;
    const styleBonus = styleConsistencyRaw != null ? Math.round(styleConsistencyRaw * 3) : 0;

    // Nesting discipline bonus (0-3): additive on top of base
    const maxNestingDepth = safeNum(metrics.max_nesting_depth, -1);
    let nestingBonus = 0;
    if (maxNestingDepth >= 0 && maxNestingDepth !== null) {
        nestingBonus = maxNestingDepth <= 4 ? 3 : maxNestingDepth <= 6 ? 2 : maxNestingDepth <= 8 ? 1 : 0;
    }

    // Function size discipline bonus (0-2): additive on top of base
    let funcSizeBonus = 0;
    if (metrics.function_lengths && metrics.function_lengths.length > 0) {
        const shortCount = metrics.function_lengths.filter(len => len < 30).length;
        const shortRatio = shortCount / metrics.function_lengths.length;
        funcSizeBonus = shortRatio > 0.70 ? 2 : shortRatio > 0.50 ? 1 : 0;
    }

    let codeQualityScore = Math.min(25, Math.max(0, logicDensity + functionHealth + dryness + lintScore + styleBonus + nestingBonus + funcSizeBonus));

    // LOC-based CQ ceiling: toy projects can't max out code quality
    const totalLoc = safeNum(metrics.total_loc);
    if (totalLoc < 200) {
        codeQualityScore = Math.min(codeQualityScore, 10);
    } else if (totalLoc < 500) {
        codeQualityScore = Math.min(codeQualityScore, 17);
    }

    // -------------------------------------------------------
    // Dimension 2: Architecture (Max 20)
    // -------------------------------------------------------
    const folderCount = safeNum(metrics.folder_count);
    const circularDeps = safeNum(metrics.circular_dependencies_count);

    // Structure score (0-8): tiered on folder count
    const structureScore = folderCount <= 1 ? 1 : folderCount <= 3 ? 3 : folderCount <= 8 ? 5 : folderCount <= 15 ? 7 : 8;

    // Circular dependency score (0-5): now always computed (no more null/benefit-of-doubt)
    const circDepScore = circularDeps === 0 ? 5 : circularDeps <= 2 ? 3 : circularDeps <= 5 ? 1 : 0;

    // Fan-out discipline (0-3): penalize overly-coupled modules
    const avgFanOut = safeNum(metrics.avg_fan_out);
    const fanOutScore = avgFanOut <= 4 ? 3 : avgFanOut <= 8 ? 2 : avgFanOut <= 12 ? 1 : 0;

    // Orphan penalty (0-2): reward connected codebases
    const sourceFileCount = safeNum(metrics.file_count, 1);
    const orphanRatio = sourceFileCount > 0 ? safeNum(metrics.orphan_module_count) / sourceFileCount : 0;
    const orphanScore = orphanRatio <= 0.10 ? 2 : orphanRatio <= 0.25 ? 1 : 0;

    // Dependency usage ratio bonus (0-2): from authenticity analysis — additive on top of base
    const depUsageRaw = authenticity?.dependency_usage_ratio;
    const depUsageBonus = depUsageRaw != null ? Math.round(depUsageRaw * 2) : 0;

    const archScore = Math.min(20, Math.max(0, structureScore + circDepScore + fanOutScore + orphanScore + depUsageBonus));

    // -------------------------------------------------------
    // Dimension 3: Testing (Max 25)
    // -------------------------------------------------------
    const testFileCount = safeNum(metrics.test_file_count);
    const testToCodeRatio = safeNum(metrics.test_to_code_ratio);
    const assertionCount = safeNum(metrics.assertion_count);

    // Test rigor (0-15)
    let testRigor = 0;
    if (testFileCount > 0) testRigor += 5;
    testRigor += testToCodeRatio > 0.30 ? 8 : testToCodeRatio > 0.15 ? 5 : testToCodeRatio > 0.05 ? 2 : 0;
    testRigor += assertionCount > 50 ? 7 : assertionCount > 20 ? 4 : assertionCount > 5 ? 2 : 0;
    if (metrics.coverage_config_present) testRigor += 3;
    testRigor = Math.min(15, testRigor);

    // CI test integration (0-5)
    const ciIntegration = metrics.ci_runs_tests ? 5 : metrics.ci_config_present ? 2 : 0;

    // Test count quality (0-5)
    const testCountQuality = (testFileCount >= 10 && assertionCount >= 50) ? 5
        : (testFileCount >= 5 && assertionCount >= 20) ? 3
            : testFileCount >= 1 ? 1
                : 0;

    // Assertion density bonus (0-3): additive on top of base
    const assertionDensity = safeNum(metrics.assertion_density, -1);
    let densityBonus = 0;
    if (assertionDensity >= 0) {
        densityBonus = assertionDensity >= 5 ? 3 : assertionDensity >= 2 ? 2 : assertionDensity >= 0.5 ? 1 : 0;
    }

    const testingScore = Math.min(25, Math.max(0, testRigor + ciIntegration + testCountQuality + densityBonus));

    // -------------------------------------------------------
    // Dimension 4: Git Discipline (Max 20)
    // If GitHub API failed (commit_count === null), we simply give 0 points rather than crashing.
    // -------------------------------------------------------
    const commitCount = safeNum(metrics.commit_count);
    const spreadRatio = safeNum(metrics.commit_spread_ratio);
    const msgAvgLen = safeNum(metrics.commit_message_avg_length);
    const conventionalRatio = safeNum(metrics.conventional_commit_ratio);
    const featureBranches = safeNum(metrics.feature_branch_count);

    // Commit atomicity (0-6): based on avg lines changed per commit (doc spec)
    const avgCommitSize = safeNum(metrics.avg_commit_size);
    const gitAtomicity = (avgCommitSize >= 50 && avgCommitSize <= 200) ? 6
        : (avgCommitSize >= 20 && avgCommitSize <= 300) ? 4
            : avgCommitSize > 0 ? 1 : 0;

    // Commit spread ratio (0-6): active days / total days
    // Academic gets lower thresholds per doc
    let gitSpread: number;
    if (profileId === 'academic') {
        gitSpread = spreadRatio >= 0.20 ? 6 : spreadRatio >= 0.10 ? 4 : 1;
    } else {
        gitSpread = spreadRatio >= 0.30 ? 6 : spreadRatio >= 0.15 ? 4 : 1;
    }

    // Message quality (0-4): base from raw metrics, bonus from authenticity if available
    let gitMessage = (msgAvgLen >= 30 && conventionalRatio >= 0.5) ? 4 : msgAvgLen >= 20 ? 2 : 0;
    // Authenticity commit quality can give up to +2 bonus
    if (authenticity?.commit_message_quality != null) {
        gitMessage = Math.min(4, gitMessage + Math.round(authenticity.commit_message_quality * 2));
    }

    // Branch workflow (0-4)
    // Academic: max 2 pts per doc
    let gitBranching = featureBranches >= 2 ? 4 : featureBranches >= 1 ? 2 : 0;
    if (profileId === 'academic') gitBranching = Math.min(2, gitBranching);

    const gitScore = Math.min(20, Math.max(0, gitAtomicity + gitSpread + gitMessage + gitBranching));

    // -------------------------------------------------------
    // Dimension 5: DevOps (Max 10)
    // -------------------------------------------------------
    const deployConfigCount = safeNum(metrics.deploy_config_types?.length);

    // CI presence/quality (0-6) — uses ci_config_quality (0-5 scale) from metrics
    const ciQuality = safeNum(metrics.ci_config_quality);
    const devopsCI = ciQuality >= 4 ? 6 : ciQuality >= 2 ? 4 : metrics.ci_config_present ? 2 : 0;

    // Deployment configs (0-4)
    const devopsDeploy = deployConfigCount >= 2 ? 4 : deployConfigCount >= 1 ? 2 : 0;

    const devopsScore = Math.min(10, Math.max(0, devopsCI + devopsDeploy));

    // -------------------------------------------------------
    // Final: Profile-weighted overall score
    // Each dimension score is scaled to its max, then weighted
    // -------------------------------------------------------
    const weightedSum =
        (codeQualityScore / 25) * 25 * weights.codeQuality +
        (archScore / 20) * 20 * weights.architecture +
        (testingScore / 25) * 25 * weights.testing +
        (gitScore / 20) * 20 * weights.git +
        (devopsScore / 10) * 10 * weights.devops;

    // Normalize by the weighted max (weights sum to 1.0, dimensions sum to 100)
    // overallScore = weighted contribution, capped 0-100
    const overallScore = Math.min(100, Math.max(0, Math.round(weightedSum * 100 / (
        25 * weights.codeQuality +
        20 * weights.architecture +
        25 * weights.testing +
        20 * weights.git +
        10 * weights.devops
    ))));

    // Fix 5: Academic profile score ceiling — simple projects shouldn't score 70+
    let cappedScore = profileId === 'academic' ? Math.min(65, overallScore) : overallScore;

    // Entry point validity: soft penalty instead of hard cap
    // repos without a valid entry point lose up to 10 points, but aren't crushed
    if (authenticity && !authenticity.has_valid_entry_point) {
        cappedScore = Math.max(0, cappedScore - 10);
    }

    return {
        overallScore: cappedScore,
        dimensions: {
            codeQuality: {
                score: codeQualityScore,
                max: 25,
                breakdown: { logicDensity, functionHealth, dryness, lintScore }
            },
            architecture: {
                score: archScore,
                max: 20,
                breakdown: { structureScore, circDepScore, fanOutScore, orphanScore }
            },
            testing: {
                score: testingScore,
                max: 25,
                breakdown: { testRigor, ciIntegration, testCountQuality }
            },
            git: {
                score: gitScore,
                max: 20,
                breakdown: { gitAtomicity, gitSpread, gitMessage, gitBranching }
            },
            devops: {
                score: devopsScore,
                max: 10,
                breakdown: { devopsCI, devopsDeploy }
            }
        }
    };
}
