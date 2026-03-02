import { RawMetrics } from '../metrics/metrics';
import { ProfileId } from '../profiles/profiles';

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
    ml_pipeline: { low: 10, mid: 20, high: 30 },
    generic: { low: 7, mid: 12, high: 18 }
};

export function calculateScore(metrics: RawMetrics, profileId: ProfileId): FinalScoreReport {
    // --- Code Quality (Max 25) ---
    const complexityAvg = metrics.complexity_avg || 0;
    const longFunctionsCount = metrics.long_functions_count || 0;
    const duplicationPercent = metrics.duplication_percent || 0;

    const thresholds = COMPLEXITY_THRESHOLDS[profileId] ?? COMPLEXITY_THRESHOLDS['generic'];
    let logicDensity: number;
    if (metrics.complexity_avg === null || metrics.complexity_avg === undefined) {
        logicDensity = 0;
    } else if (complexityAvg < thresholds.low) {
        logicDensity = 10;
    } else if (complexityAvg < thresholds.mid) {
        logicDensity = 6;
    } else if (complexityAvg < thresholds.high) {
        logicDensity = 3;
    } else {
        logicDensity = 0;
    }
    const functionHealth = Math.max(0, 10 - (longFunctionsCount * 2));
    const dryness = Math.max(0, 5 - (duplicationPercent / 2));

    // Ensure the dimension score is capped between 0 and 25
    const codeQualityScore = Math.min(25, Math.max(0, logicDensity + functionHealth + dryness));

    // --- Architecture (Max 20) ---
    const folderCount = metrics.folder_count || 0;
    const maxDepth = metrics.max_depth || 0;

    const modularization = Math.min(10, Math.max(0, folderCount / 2));
    const structuralDepth = Math.min(10, Math.max(0, maxDepth * 2));

    const archScore = Math.min(20, Math.max(0, modularization + structuralDepth));

    // --- Testing (Max 25) ---
    const testFileCount = metrics.test_file_count || 0;
    const testToCodeRatio = metrics.test_to_code_ratio || 0;

    const testEvidence = testFileCount > 0 ? 10 : 0;
    const testVolume = Math.min(15, Math.max(0, testToCodeRatio * 100));

    const testingScore = Math.min(25, Math.max(0, testEvidence + testVolume));

    // --- Git Discipline (Max 20) ---
    const commitCount = metrics.commit_count || 0;
    const commitSpanDays = metrics.commit_span_days || 0;

    const gitEffort = Math.min(10, Math.max(0, commitCount / 5));
    const gitPersistence = Math.min(10, Math.max(0, commitSpanDays / 3));

    const gitScore = Math.min(20, Math.max(0, gitEffort + gitPersistence));

    // --- DevOps (Max 10) ---
    const devopsAutomation = metrics.ci_config_present ? 5 : 0;
    const devopsPortability = metrics.deploy_config_present ? 5 : 0;

    const devopsScore = Math.min(10, Math.max(0, devopsAutomation + devopsPortability));

    // --- Overall Score ---
    // The sum of maximums is 25 + 20 + 25 + 20 + 10 = 100
    const overallScore = Math.min(100, Math.max(0, codeQualityScore + archScore + testingScore + gitScore + devopsScore));

    return {
        overallScore,
        dimensions: {
            codeQuality: {
                score: codeQualityScore,
                max: 25,
                breakdown: {
                    logicDensity,
                    functionHealth,
                    dryness
                }
            },
            architecture: {
                score: archScore,
                max: 20,
                breakdown: {
                    modularization,
                    structuralDepth
                }
            },
            testing: {
                score: testingScore,
                max: 25,
                breakdown: {
                    testEvidence,
                    testVolume
                }
            },
            git: {
                score: gitScore,
                max: 20,
                breakdown: {
                    gitEffort,
                    gitPersistence
                }
            },
            devops: {
                score: devopsScore,
                max: 10,
                breakdown: {
                    devopsAutomation,
                    devopsPortability
                }
            }
        }
    };
}
