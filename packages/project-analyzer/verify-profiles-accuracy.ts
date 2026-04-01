import { deriveSignals } from './src/signals/signals';
import { evaluateProfiles } from './src/profiles/profiles';
import { calculateScore } from './src/scoring/scoring';
import { selectBestProfile } from './src/selection/selection';
import { detectGaming } from './src/anti-gaming/anti-gaming';
import { RawMetrics } from './src/metrics/metrics';

type TestCase = {
    name: string;
    metrics: Partial<RawMetrics>;
    deps: string[];
    expectedTop: string;       // expected profile id
    assertions?: (
        profiles: ReturnType<typeof evaluateProfiles>,
        score: ReturnType<typeof calculateScore>,
        signals: ReturnType<typeof deriveSignals>,
        selection: ReturnType<typeof selectBestProfile>
    ) => { pass: boolean; reason: string }[];
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
        has_console_scripts: false, uses_argparse: false,
        markup_loc: { md: 50, html: 0, css: 0 },  // default: assume a basic README exists
        readme_keywords: [],
        is_fork: false, contributor_count: 1, top_contributor_percent: 100,
        function_lengths: [], max_nesting_depth: 0, avg_nesting_depth: 0,
        avg_fan_out: 0, max_fan_in: 0, max_fan_out: 0, orphan_module_count: 0,
        extraction_timestamp: new Date().toISOString(), extraction_version: '1.1.0', commit_sha: null,
        commit_messages: [],
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
        name: '🧾 Missing git history does not trigger short timeline',
        metrics: {
            commit_count: null, commit_span_days: null, commit_sha: null,
            files: ['README.md'], readme_keywords: []
        },
        deps: [],
        expectedTop: 'generic',
        assertions: (_, __, signals, selection) => [
            {
                pass: signals.is_short_timeline === false,
                reason: `is_short_timeline should be false when git history is missing, got ${signals.is_short_timeline}`
            }
        ]
    },
    {
        name: '📚 Documentation-only repo should not become academic',
        metrics: {
            files: ['README.md'],
            commit_count: null, commit_span_days: null, commit_sha: null,
            markup_loc: { md: 220, html: 0, css: 0 },
            readme_keywords: [],
        },
        deps: [],
        expectedTop: 'generic',
    },
    {
        name: '🌐 Full-stack web app (React + Express + Prisma)',
        metrics: {
            folder_structure: ['src', 'public', 'api'],
            ci_config_present: true, deploy_config_present: true, deploy_config_types: ['Docker'],
            test_file_count: 5, assertion_count: 30,
            files: ['src/App.tsx', 'src/components/Nav.tsx', 'src/server.ts', 'src/routes/orders.ts', 'public/index.html'],
        },
        deps: ['react', 'express', 'prisma'],
        expectedTop: 'production_web_app',
    },
    {
        name: '🪄 Static portfolio should count as frontend',
        metrics: {
            languages: { '.js': 400, '.html': 300, '.css': 220 },
            primary_language: 'js',
            files: ['index.html', 'assets/app.js', 'assets/styles.css', 'README.md'],
            markup_loc: { md: 40, html: 300, css: 220 },
            readme_keywords: ['portfolio', 'frontend'],
            deploy_config_present: true,
            commit_count: 12,
            commit_span_days: 45,
            commit_sha: 'abc123',
        },
        deps: [],
        expectedTop: 'frontend_app',
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
        name: '🛠️ Lightweight API with server entrypoint should stay backend',
        metrics: {
            primary_language: 'ts',
            languages: { '.ts': 2200 },
            files: ['src/server.ts', 'src/routes/users.ts', '.env.example', 'README.md'],
            folder_structure: ['src', 'routes'],
            readme_keywords: ['backend', 'api', 'rest api'],
            commit_count: 14,
            commit_span_days: 25,
            commit_sha: 'def456',
            total_loc: 2400,
        },
        deps: ['express'],
        expectedTop: 'backend_api',
    },
    {
        name: '🖼️ Frontend React app (no backend)',
        metrics: {
            file_count: 40,
            total_loc: 8000,
            deploy_config_types: [],
            files: ['src/App.tsx', 'src/components/Card.tsx', 'src/pages/Home.tsx', 'public/index.html']
        },
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
        name: '📦 Reusable TS package with exports should stay library',
        metrics: {
            primary_language: 'ts',
            languages: { '.ts': 4500, '.md': 120 },
            files: ['package.json', 'src/index.ts', 'src/client.ts', 'README.md'],
            has_main_export: true,
            readme_keywords: ['library', 'package', 'sdk'],
            commit_count: 22,
            commit_span_days: 90,
            commit_sha: 'ghi789',
        },
        deps: [],
        expectedTop: 'library',
    },
    {
        name: '🎓 Academic project (short timeline, readme)',
        metrics: {
            commit_count: 6, commit_span_days: 3, commit_sha: 'jkl012',
            languages: { '.py': 500, '.md': 300 },
            file_count: 8, total_loc: 1200,
            readme_keywords: ['assignment', 'student']
        },
        deps: [],
        expectedTop: 'academic',
    },
    {
        name: '🐍 main.py alone should not trigger CLI override',
        metrics: {
            files: ['main.py', 'README.md'],
            commit_count: 12,
            commit_span_days: 40,
            commit_sha: 'mno345',
            readme_keywords: [],
        },
        deps: [],
        expectedTop: 'generic',
        assertions: (_, __, signals, selection) => [
            {
                pass: signals.is_cli_entrypoint === false,
                reason: `main.py without CLI evidence should not activate CLI entrypoint, got ${signals.is_cli_entrypoint}`
            },
            {
                pass: selection.profileId !== 'cli_tool',
                reason: `main.py without CLI evidence should not select cli_tool, got ${selection.profileId}`
            }
        ]
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
        assertions: (profiles, _, __, selection) => {
            const generic = profiles.find(p => p.profileId === 'generic');
            return [
                {
                    pass: generic?.fitnessScore === 0.0,
                    reason: `generic fitnessScore should be 0.0, got ${generic?.fitnessScore}`
                },
                {
                    pass: selection.profileId === 'generic',
                    reason: `generic should win when no other profile has meaningful fitness, got ${selection.profileId}`
                }
            ];
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
        const candidates = profiles.map(profile => ({
            profile,
            score: calculateScore(metrics, profile.profileId),
            antiGaming: detectGaming(metrics, signals, profile.profileId),
        }));
        const selection = selectBestProfile(candidates, signals, metrics);
        const score = calculateScore(metrics, selection.profileId as any);

        let ok = selection.profileId === test.expectedTop;
        const reasons: string[] = [];

        if (!ok) reasons.push(`Expected ${test.expectedTop}, got ${selection.profileId} (fitness: ${selection.fitnessScore.toFixed(2)})`);

        if (test.assertions) {
            for (const result of test.assertions(profiles, score, signals, selection)) {
                if (!result.pass) { ok = false; reasons.push(result.reason); }
            }
        }

        if (ok) {
            console.log(`✅ ${test.name}`);
            console.log(`   Profile: ${selection.profileId} | Score: ${score.overallScore}/100 | Fitness: ${selection.fitnessScore.toFixed(2)}`);
            passed++;
        } else {
            console.log(`❌ ${test.name}`);
            reasons.forEach(r => console.log(`   ⚠ ${r}`));
            console.log(`   Signals: ml=${signals.has_ml_components}, nb=${signals.has_notebooks}, min=${signals.is_minimal}, fe=${signals.has_frontend}, be=${signals.has_backend}, static=${signals.has_static_frontend}, api=${signals.has_api_routes}`);
            console.log(`   Top 3 profiles: ${(selection.topCandidates ?? []).map(p => `${p.profileId}(${p.fitnessScore.toFixed(2)})`).join(', ')}`);
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
