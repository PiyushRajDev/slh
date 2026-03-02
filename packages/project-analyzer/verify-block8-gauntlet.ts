import { formatReport } from './src/report/report';

import { RawMetrics } from './src/metrics/metrics';
import { StructuralSignals } from './src/signals/signals';
import { SelectionResult } from './src/selection/selection';
import { FinalScoreReport } from './src/scoring/scoring';
import { AntiGamingReport } from './src/anti-gaming/anti-gaming';
import { ConfidenceReport } from './src/confidence/confidence';

function getMocks() {
    const metrics: RawMetrics = {
        complexity_avg: 5,
        complexity_max: 20,
        long_functions_count: 0,
        long_files_count: 0,
        duplication_percent: null,
        lint_violations_count: null,
        folder_structure: ['src', 'tests'],
        max_depth: 3,
        circular_dependencies_count: null,
        coupling_score: 1.5,
        test_file_count: 10,
        test_loc: 500,
        assertion_count: 100,
        test_to_code_ratio: 0.2,
        coverage_config_present: true,
        ci_runs_tests: true,
        commit_count: 50,
        commit_span_days: 30,
        active_days_count: 15,
        commit_spread_ratio: 0.5,
        avg_commit_size: 50,
        commit_message_avg_length: 20,
        conventional_commit_ratio: 0.8,
        branch_count: 5,
        feature_branch_count: 3,
        ci_config_present: true,
        deploy_config_present: true,
        deploy_config_types: ['docker'],
        file_count: 100,
        folder_count: 10,
        total_loc: 5000,
        source_loc: 4000,
        languages: { '.ts': 4000 },
        primary_language: 'ts',
        dependency_count: 20,
        dependencies: ['react'],
        is_fork: false,
        contributor_count: 2,
        top_contributor_percent: 80,
        extraction_timestamp: '2026-03-02T00:00:00.000Z',
        extraction_version: '1.0.0',
        commit_sha: 'abc123def456'
    };

    const signals: StructuralSignals = {
        has_frontend: true,
        has_backend: false,
        has_database: false,
        has_tests: true,
        has_ci: true,
        has_docker: true,
        is_monorepo: false,
        has_documentation: true,
        is_short_timeline: false,
        has_heavy_framework: false
    };

    const selection: SelectionResult = {
        profileId: 'production_web_app',
        displayName: 'Production Web App',
        rawScore: 85,
        reliabilityScore: 0.9,
        reliabilityLevel: 'HIGH',
        defensibleScore: 76.5,
        fitnessScore: 0.95
    };

    const scoreReport: FinalScoreReport = {
        overallScore: 85.1234,
        dimensions: {
            codeQuality: { score: 20, max: 25, breakdown: {} },
            architecture: { score: 15, max: 20, breakdown: {} },
            testing: { score: 20, max: 25, breakdown: {} },
            git: { score: 20, max: 20, breakdown: {} },
            devops: { score: 10, max: 10, breakdown: {} }
        }
    };

    const antiGaming: AntiGamingReport = {
        flags: [],
        flagCount: 0
    };

    const confidence: ConfidenceReport = {
        level: 'HIGH',
        overallConfidence: 0.85,
        factors: {
            dataCompleteness: 0.9,
            profileMatch: 0.8,
            reliability: 0.85
        },
        scoreRange: 3
    };

    return { metrics, signals, selection, scoreReport, antiGaming, confidence };
}


async function runGauntlet() {
    console.log("🔥 Executing SLH Brain Block 8 Gauntlet...\n");
    let passed = 0;
    const tests = [
        {
            name: "Test 1 — Structural Integrity",
            execute: () => {
                const { metrics, signals, selection, scoreReport, antiGaming, confidence } = getMocks();
                const report = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence);

                if (!report.details.metrics) return false;
                if (!report.details.signals) return false;
                if (!report.details.dimensions) return false;
                if (!report.details.confidence) return false;
                if (!report.details.antiGaming) return false;
                if (!report.summary.profileId) return false;
                if (!report.version) return false;

                return true;
            }
        },
        {
            name: "Test 2 — Immutability",
            execute: () => {
                const inputs = getMocks();
                const clone = JSON.parse(JSON.stringify(inputs));

                formatReport("https://github.com/foo/bar", inputs.metrics, inputs.signals, inputs.selection, inputs.scoreReport, inputs.antiGaming, inputs.confidence);

                const afterCall = JSON.parse(JSON.stringify(inputs));
                return JSON.stringify(clone) === JSON.stringify(afterCall);
            }
        },
        {
            name: "Test 3 — Serialization Round-trip",
            execute: () => {
                const { metrics, signals, selection, scoreReport, antiGaming, confidence } = getMocks();
                const report = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence);

                const serialized = JSON.stringify(report);
                const parsed = JSON.parse(serialized);
                return JSON.stringify(parsed) === JSON.stringify(report);
            }
        },
        {
            name: "Test 4 — Version Integrity",
            execute: () => {
                const { metrics, signals, selection, scoreReport, antiGaming, confidence } = getMocks();
                const report = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence);

                return typeof report.version === 'string' && report.version === "1.0.0";
            }
        },
        {
            name: "Test 5 — Precision Check",
            execute: () => {
                const { metrics, signals, selection, scoreReport, antiGaming, confidence } = getMocks();
                scoreReport.overallScore = 87.6423;
                const report = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence);

                return report.summary.overallScore === 88 && report.details.dimensions.overallScore === 87.6423;
            }
        },
        {
            name: "Test 6 — NaN Containment",
            execute: () => {
                const { metrics, signals, selection, scoreReport, antiGaming, confidence } = getMocks();
                (metrics as any).complexity_avg = NaN;
                (metrics as any).total_loc = NaN;
                (metrics as any).testMissingUndefined = undefined;

                const report = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence);
                const serialized = JSON.stringify(report);

                if (serialized.includes('"NaN"')) return false;
                if ((report.details.metrics as any).complexity_avg !== 0) return false;
                if ((report.details.metrics as any).total_loc !== 0) return false;

                return true;
            }
        },
        {
            name: "Test 7 — Determinism",
            execute: () => {
                const { metrics, signals, selection, scoreReport, antiGaming, confidence } = getMocks();
                const timestamp = "2026-03-02T12:00:00.000Z";
                const report1 = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence, { timestamp });
                const report2 = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence, { timestamp });

                return JSON.stringify(report1) === JSON.stringify(report2) && report1.timestamp === timestamp;
            }
        },
        {
            name: "Test 8 — Deep Freeze Mutability",
            execute: () => {
                const { metrics, signals, selection, scoreReport, antiGaming, confidence } = getMocks();
                const report = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence);

                try {
                    (report.details.metrics as any).total_loc = 999999;
                } catch (e) {
                    // Expected in strict mode
                }

                return report.details.metrics.total_loc !== 999999;
            }
        },
        {
            name: "Test 9 — Advanced JSON Sanitizer (BigInt & Symbols)",
            execute: () => {
                const { metrics, signals, selection, scoreReport, antiGaming, confidence } = getMocks();

                (metrics as any).bigIntValue = BigInt(9007199254740991);
                (metrics as any).symbolValue = Symbol("secret");

                const report = formatReport("https://github.com/foo/bar", metrics, signals, selection, scoreReport, antiGaming, confidence);

                const serialized = JSON.stringify(report);
                const parsed = JSON.parse(serialized);

                // BigInt should become a Number
                if (parsed.details.metrics.bigIntValue !== 9007199254740991) return false;

                // Symbol should be stripped entirely
                if ('symbolValue' in parsed.details.metrics) return false;

                return true;
            }
        }
    ];

    for (const test of tests) {
        try {
            const success = test.execute();
            if (success) {
                console.log(`✅ [PASS] ${test.name}`);
                passed++;
            } else {
                console.log(`❌ [FAIL] ${test.name}`);
            }
        } catch (e) {
            console.log(`💥 [CRASH] ${test.name}`);
            console.error(e);
        }
    }

    console.log(`\n📊 Block 8 Results: ${passed}/${tests.length}`);

    if (passed !== tests.length) {
        console.log("🚨 BLOCK 8 FAILURE. SYSTEM DOES NOT MEET GUARANTEES.");
        process.exit(1);
    } else {
        console.log("🟢 SLH Brain Block 8 passed all gauntlet tests.");
    }
}

runGauntlet();
