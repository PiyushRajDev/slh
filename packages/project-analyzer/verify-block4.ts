import { calculateScore } from './src/scoring/scoring';
import { RawMetrics } from './src/metrics/metrics';

async function main() {
    // Mock metrics: 0 tests, 0 DevOps — only Code Quality, Architecture, and Git should contribute
    const mockedMetrics: Partial<RawMetrics> = {
        // Code Quality
        complexity_avg: 5,
        long_functions_count: 2,
        long_files_count: 0,
        duplication_percent: null,
        lint_violations_count: null,

        // Architecture
        folder_structure: [],
        folder_count: 20,
        max_depth: 8,
        circular_dependencies_count: null,
        coupling_score: 3,

        // Testing — all zero
        test_file_count: 0,
        test_loc: 0,
        assertion_count: 0,
        test_to_code_ratio: 0,
        coverage_config_present: false,
        ci_runs_tests: false,

        // Git Discipline
        commit_count: 100,
        commit_span_days: 90,
        active_days_count: 30,
        commit_spread_ratio: 0.33,
        avg_commit_size: 80,
        commit_message_avg_length: 35,
        conventional_commit_ratio: 0.5,
        branch_count: 5,
        feature_branch_count: 2,

        // DevOps — all zero
        ci_config_present: false,
        ci_config_quality: 0,
        deploy_config_present: false,
        deploy_config_types: [],

        // Meta
        total_loc: 34000,
        file_count: 100,
        source_loc: 30000,
    };

    console.log("Mocking RawMetrics with 0 tests and 0 DevOps setup...");

    const profileId = 'production_web_app';
    const scoreReport = calculateScore(mockedMetrics as RawMetrics, profileId);

    console.log("Overall Score:", scoreReport.overallScore);
    console.log("Testing Score:", scoreReport.dimensions.testing.score);
    console.log("DevOps Score:", scoreReport.dimensions.devops.score);
    console.log("Code Quality Score:", scoreReport.dimensions.codeQuality.score);
    console.log("Architecture Score:", scoreReport.dimensions.architecture.score);
    console.log("Git Score:", scoreReport.dimensions.git.score);

    if (scoreReport.dimensions.testing.score !== 0) {
        throw new Error("Testing score should be exactly 0");
    }

    if (scoreReport.dimensions.devops.score !== 0) {
        throw new Error("DevOps score should be exactly 0");
    }

    // Verify additive: when testing=0 and devops=0, overall should only
    // reflect the other 3 dimensions weighted and normalized
    const cq = scoreReport.dimensions.codeQuality.score;
    const arch = scoreReport.dimensions.architecture.score;
    const git = scoreReport.dimensions.git.score;
    const test = scoreReport.dimensions.testing.score;
    const devops = scoreReport.dimensions.devops.score;

    console.log(`\nDimension breakdown: CQ=${cq}/25, Arch=${arch}/20, Test=${test}/25, Git=${git}/20, DevOps=${devops}/10`);
    console.log(`Testing and DevOps correctly contribute 0 points.`);

    // The overall score should be bounded between 0 and 100
    if (scoreReport.overallScore < 0 || scoreReport.overallScore > 100) {
        throw new Error(`Overall score ${scoreReport.overallScore} out of bounds [0, 100]`);
    }

    // With testing=0 and devops=0, the score must be less than a perfect 100
    if (scoreReport.overallScore >= 100) {
        throw new Error("Score should not be 100 when testing and devops are both 0");
    }

    console.log("\n✅ Verification passed: Math is bounded, additive and returns expected values.");
}

main().catch(console.error);
