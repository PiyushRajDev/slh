import { deriveSignals } from './src/signals/signals';
import { evaluateProfiles } from './src/profiles/profiles';
import { calculateScore } from './src/scoring/scoring';
import { RawMetrics } from './src/metrics/metrics';

type TestCase = {
    name: string;
    metrics: Partial<RawMetrics>;
    deps: string[];
    expectedTop: string;       // expected profile id
    assertions?: (res: ReturnType<typeof evaluateProfiles>, score: ReturnType<typeof calculateScore>) => { pass: boolean; reason: string }[];
};

function buildMetrics(partial: Partial<RawMetrics>, deps: string[]): RawMetrics {
    return {
        complexity_avg: null, complexity_max: null, long_functions_count: 0, long_files_count: 0,
        duplication_percent: null, lint_violations_count: null,
        folder_structure: [], max_depth: 3, circular_dependencies_count: null, coupling_score: 3,
        test_file_count: 0, test_loc: 0, assertion_count: 0, test_to_code_ratio: 0,
        coverage_config_present: false, ci_runs_tests: false,
        commit_count: 20, commit_span_days: 30, active_days_count: 10, commit_spread_ratio: 0.3,
        avg_commit_size: 50, commit_message_avg_length: 35, conventional_commit_ratio: 0.4,
        branch_count: 3, feature_branch_count: 1,
        ci_config_present: false, deploy_config_present: false, deploy_config_types: [],
        ci_config_quality: 0,
        file_count: 20, folder_count: 5, total_loc: 3000, source_loc: 2000,
        languages: { '.py': 3000 }, primary_language: 'py',
        dependency_count: deps.length, dependencies: deps,
        files: [], has_main_export: false, has_bin_field: false,
        markup_loc: { md: 50, html: 0, css: 0 },  // default: assume a basic README exists
        is_fork: false, contributor_count: 1, top_contributor_percent: 100,
        extraction_timestamp: new Date().toISOString(), extraction_version: '1.1.0', commit_sha: null,
        ...partial
    } as RawMetrics;
}

const TESTS: TestCase[] = [
    {
        name: '🤖 ML/AI project (torch + numpy)',
        metrics: { primary_language: 'py', file_count: 15, total_loc: 2000 },
        deps: ['torch', 'numpy', 'pandas', 'matplotlib'],
        expectedTop: 'ml_pipeline',
    },
    {
        name: '📓 Jupyter notebook project (langchain)',
        metrics: {
            languages: { '.py': 1000, '.ipynb': 500 }, primary_language: 'py',
            file_count: 10, total_loc: 1500,
            files: ['notebook.ipynb', 'utils.py', 'README.md']
        },
        deps: ['langchain', 'openai', 'numpy'],
        expectedTop: 'ml_pipeline',
    },
    {
        name: '⚙️ CLI tool (click + minimal)',
        // CLI tools always have a README — that's their "docs"
        metrics: { file_count: 12, total_loc: 1200, languages: { '.py': 1000, '.md': 200 } },
        deps: ['click', 'argparse'],
        expectedTop: 'cli_tool',
    },
    {
        name: '🌐 Full-stack web app (React + Express + Prisma)',
        metrics: {
            folder_structure: ['src', 'public', 'api'],
            ci_config_present: true, deploy_config_present: true, deploy_config_types: ['Docker'],
            test_file_count: 5, assertion_count: 30
        },
        deps: ['react', 'express', 'prisma'],
        expectedTop: 'production_web_app',
    },
    {
        name: '🔌 Backend API (Express + PostgreSQL)',
        metrics: {
            test_file_count: 3, assertion_count: 20, deploy_config_present: true, deploy_config_types: ['Docker'],
            file_count: 30, total_loc: 4000
        },
        deps: ['express', 'pg', 'jest'],
        expectedTop: 'backend_api',
    },
    {
        name: '🖼️ Frontend React app (no backend)',
        metrics: { file_count: 40, total_loc: 8000, deploy_config_types: [] },
        deps: ['react', 'redux', 'jest'],
        expectedTop: 'frontend_app',
    },
    {
        name: '📦 Library / package (tests + docs, no frontend/backend)',
        // Libraries have: heavy tests + documentation + main export. No CLI deps. Not minimal (>50 files).
        metrics: {
            file_count: 60, total_loc: 8000, // > 50 so is_minimal = false
            test_file_count: 12, test_to_code_ratio: 0.45, assertion_count: 80,
            languages: { '.ts': 6000, '.md': 500 },
            files: ['package.json', 'src/index.ts', 'src/utils.ts', 'README.md'],
            has_main_export: true
        },
        deps: ['jest', 'vitest'],
        expectedTop: 'library',
    },
    {
        name: '🎓 Academic project (short timeline, readme)',
        metrics: {
            commit_span_days: 3, languages: { '.py': 500, '.md': 300 },
            file_count: 8, total_loc: 1200
        },
        deps: [],
        expectedTop: 'academic',
    },
    {
        name: '🔲 Empty project — must be generic at score 0.0 (not 0.30)',
        metrics: {
            file_count: 0, total_loc: 0, dependencies: [], languages: {},
            markup_loc: { md: 0, html: 0, css: 0 },
            commit_span_days: 30  // not short timeline
        },
        deps: [],
        expectedTop: 'generic',
        assertions: (profiles) => {
            const generic = profiles.find(p => p.profileId === 'generic');
            return [{
                pass: generic?.fitnessScore === 0.0,
                reason: `generic fitnessScore should be 0.0, got ${generic?.fitnessScore}`
            }];
        }
    },
    {
        name: '🔬 Score bounds: 0 ≤ score ≤ 100 for ML profile',
        metrics: { file_count: 15, total_loc: 2000, complexity_avg: 25 },
        deps: ['torch', 'numpy'],
        expectedTop: 'ml_pipeline',
        assertions: (_, score) => [{
            pass: score.overallScore >= 0 && score.overallScore <= 100,
            reason: `Score out of range: ${score.overallScore}`
        }]
    }
];

async function run() {
    console.log('🎯 Profile Accuracy & Scoring Verification\n');
    let passed = 0;

    for (const test of TESTS) {
        const metrics = buildMetrics(test.metrics, test.deps);
        const signals = deriveSignals(metrics);
        const profiles = evaluateProfiles(signals);
        const topProfile = profiles.find(p => p.status === 'active') ?? profiles[0];
        const score = calculateScore(metrics, topProfile.profileId);

        let ok = topProfile.profileId === test.expectedTop;
        const reasons: string[] = [];

        if (!ok) reasons.push(`Expected ${test.expectedTop}, got ${topProfile.profileId} (fitness: ${topProfile.fitnessScore.toFixed(2)})`);

        if (test.assertions) {
            for (const result of test.assertions(profiles, score)) {
                if (!result.pass) { ok = false; reasons.push(result.reason); }
            }
        }

        if (ok) {
            console.log(`✅ ${test.name}`);
            console.log(`   Profile: ${topProfile.profileId} | Score: ${score.overallScore}/100 | Fitness: ${topProfile.fitnessScore.toFixed(2)}`);
            passed++;
        } else {
            console.log(`❌ ${test.name}`);
            reasons.forEach(r => console.log(`   ⚠ ${r}`));
            console.log(`   Signals: ml=${signals.has_ml_components}, nb=${signals.has_notebooks}, min=${signals.is_minimal}, fe=${signals.has_frontend}, be=${signals.has_backend}`);
            console.log(`   Top 3 profiles: ${profiles.slice(0, 3).map(p => `${p.profileId}(${p.fitnessScore.toFixed(2)})`).join(', ')}`);
        }
        console.log('');
    }

    console.log(`📊 Profile Accuracy: ${passed}/${TESTS.length}`);
    if (passed !== TESTS.length) {
        console.error('🚨 Profile detection or scoring has failures.');
        process.exit(1);
    } else {
        console.log('🟢 All profiles detect correctly and scores are within bounds.');
    }
}

run();
