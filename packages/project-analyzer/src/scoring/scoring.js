"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
var COMPLEXITY_THRESHOLDS = {
    frontend_app: { low: 5, mid: 10, high: 15 },
    cli_tool: { low: 5, mid: 10, high: 15 },
    library: { low: 5, mid: 10, high: 15 },
    backend_api: { low: 7, mid: 12, high: 18 },
    production_web_app: { low: 7, mid: 12, high: 18 },
    academic: { low: 7, mid: 12, high: 18 },
    ml_pipeline: { low: 10, mid: 20, high: 30 },
    generic: { low: 7, mid: 12, high: 18 }
};
function calculateScore(metrics, profileId) {
    var _a;
    // --- Code Quality (Max 25) ---
    var complexityAvg = metrics.complexity_avg || 0;
    var longFunctionsCount = metrics.long_functions_count || 0;
    var duplicationPercent = metrics.duplication_percent || 0;
    var thresholds = (_a = COMPLEXITY_THRESHOLDS[profileId]) !== null && _a !== void 0 ? _a : COMPLEXITY_THRESHOLDS['generic'];
    var logicDensity;
    if (metrics.complexity_avg === null || metrics.complexity_avg === undefined) {
        logicDensity = 0;
    }
    else if (complexityAvg < thresholds.low) {
        logicDensity = 10;
    }
    else if (complexityAvg < thresholds.mid) {
        logicDensity = 6;
    }
    else if (complexityAvg < thresholds.high) {
        logicDensity = 3;
    }
    else {
        logicDensity = 0;
    }
    var functionHealth = Math.max(0, 10 - (longFunctionsCount * 2));
    var dryness = Math.max(0, 5 - (duplicationPercent / 2));
    // Ensure the dimension score is capped between 0 and 25
    var codeQualityScore = Math.min(25, Math.max(0, logicDensity + functionHealth + dryness));
    // --- Architecture (Max 20) ---
    var folderCount = metrics.folder_count || 0;
    var maxDepth = metrics.max_depth || 0;
    var modularization = Math.min(10, Math.max(0, folderCount / 2));
    var structuralDepth = Math.min(10, Math.max(0, maxDepth * 2));
    var archScore = Math.min(20, Math.max(0, modularization + structuralDepth));
    // --- Testing (Max 25) ---
    var testFileCount = metrics.test_file_count || 0;
    var testToCodeRatio = metrics.test_to_code_ratio || 0;
    var testEvidence = testFileCount > 0 ? 10 : 0;
    var testVolume = Math.min(15, Math.max(0, testToCodeRatio * 100));
    var testingScore = Math.min(25, Math.max(0, testEvidence + testVolume));
    // --- Git Discipline (Max 20) ---
    var commitCount = metrics.commit_count || 0;
    var commitSpanDays = metrics.commit_span_days || 0;
    var gitEffort = Math.min(10, Math.max(0, commitCount / 5));
    var gitPersistence = Math.min(10, Math.max(0, commitSpanDays / 3));
    var gitScore = Math.min(20, Math.max(0, gitEffort + gitPersistence));
    // --- DevOps (Max 10) ---
    var devopsAutomation = metrics.ci_config_present ? 5 : 0;
    var devopsPortability = metrics.deploy_config_present ? 5 : 0;
    var devopsScore = Math.min(10, Math.max(0, devopsAutomation + devopsPortability));
    // --- Overall Score ---
    // The sum of maximums is 25 + 20 + 25 + 20 + 10 = 100
    var overallScore = Math.min(100, Math.max(0, codeQualityScore + archScore + testingScore + gitScore + devopsScore));
    return {
        overallScore: overallScore,
        dimensions: {
            codeQuality: {
                score: codeQualityScore,
                max: 25,
                breakdown: {
                    logicDensity: logicDensity,
                    functionHealth: functionHealth,
                    dryness: dryness
                }
            },
            architecture: {
                score: archScore,
                max: 20,
                breakdown: {
                    modularization: modularization,
                    structuralDepth: structuralDepth
                }
            },
            testing: {
                score: testingScore,
                max: 25,
                breakdown: {
                    testEvidence: testEvidence,
                    testVolume: testVolume
                }
            },
            git: {
                score: gitScore,
                max: 20,
                breakdown: {
                    gitEffort: gitEffort,
                    gitPersistence: gitPersistence
                }
            },
            devops: {
                score: devopsScore,
                max: 10,
                breakdown: {
                    devopsAutomation: devopsAutomation,
                    devopsPortability: devopsPortability
                }
            }
        }
    };
}
