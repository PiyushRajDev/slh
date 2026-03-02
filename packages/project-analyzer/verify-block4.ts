import { extractRawMetrics } from './src/metrics/metrics';
import { deriveSignals } from './src/signals/signals';
import { evaluateProfiles } from './src/profiles/profiles';
import { calculateScore } from './src/scoring/scoring';
import { withClonedRepo } from './src/git/git';
import { decryptToken } from '../../apps/api/src/utils/crypto.ts';
import prisma from '../../apps/api/src/db.ts';

async function main() {
    // We mock metrics to exactly match the prompt's request for verification:
    // Total LOC ~34k, 0 tests, 0 CI/Docker
    const mockedMetrics: any = {
        // Code Quality
        complexity_avg: 5, // logicDensity = 10
        long_functions_count: 2, // functionHealth = 10 - 4 = 6
        duplication_percent: 4, // dryness = 5 - 2 = 3

        // Architecture
        folder_count: 20, // modularization = 10
        max_depth: 8, // structuralDepth = 10

        // Testing
        test_file_count: 0,
        test_to_code_ratio: 0,

        // Git Discipline
        commit_count: 100, // effort = 10
        commit_span_days: 90, // persistence = 10

        // DevOps
        ci_config_present: false,
        deploy_config_present: false,

        // Meta
        total_loc: 34000
    };

    console.log("Mocking RawMetrics with 0 tests and 0 DevOps setup...");

    // We need a profileId, let's just pick one
    const profileId = 'production_web_app';
    const scoreReport = calculateScore(mockedMetrics, profileId);

    console.log("Overall Score:", scoreReport.overallScore);
    console.log("Testing Score:", scoreReport.dimensions.testing.score);
    console.log("DevOps Score:", scoreReport.dimensions.devops.score);

    if (scoreReport.dimensions.testing.score !== 0) {
        throw new Error("Testing score should be exactly 0");
    }

    if (scoreReport.dimensions.devops.score !== 0) {
        throw new Error("DevOps score should be exactly 0");
    }

    const expectedTotal = scoreReport.dimensions.codeQuality.score +
        scoreReport.dimensions.architecture.score +
        scoreReport.dimensions.git.score;

    if (scoreReport.overallScore !== expectedTotal) {
        throw new Error("Overall score should only represent Code Quality, Architecture, and Git");
    }

    console.log("✅ Verification passed: Math is bounded, additive and returns expected values.");
}

main().catch(console.error);
