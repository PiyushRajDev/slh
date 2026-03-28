/**
 * SLH Student Repo Accuracy Harness
 *
 * Sources repos from student-results.json (output of student-harness.ts)
 * instead of random GitHub search. Uses the SAME ground-truth classifier
 * and evaluation system as accuracy-harness.ts for deterministic comparison.
 *
 * Architecture:
 *   Phase 1 — Read repos from student-results.json (already fetched)
 *   Phase 2 — For each repo, run IN PARALLEL:
 *               (A) Rule-based classifier reads GitHub API → ground truth
 *               (B) Pipeline clones + analyzes → its evaluation
 *   Phase 3 — Compare profile, score, flags → accuracy metrics
 *   Phase 4 — Print structured accuracy report + per-student breakdown
 *
 * Usage:
 *   npx tsx --env-file=apps/api/.env scripts/student-accuracy-harness.ts
 *   npx tsx --env-file=apps/api/.env scripts/student-accuracy-harness.ts --max-repos=10
 *   npx tsx --env-file=apps/api/.env scripts/student-accuracy-harness.ts --verbose
 *   npx tsx --env-file=apps/api/.env scripts/student-accuracy-harness.ts --file=results/student-results.json
 */

import { runPipeline } from '../packages/project-analyzer/src/pipeline/pipeline';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── Config ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function arg(name: string): string | undefined {
    const match = args.find(a => a.startsWith(`--${name}=`));
    return match?.split('=').slice(1).join('=');
}

const INPUT_FILE = arg('file') || 'results/student-results.json';
const MAX_REPOS = parseInt(arg('max-repos') ?? '999');
const VERBOSE = args.includes('--verbose');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileId = 'cli_tool' | 'ml_pipeline' | 'backend_api' | 'frontend_app' | 'library' | 'production_web_app' | 'academic' | 'generic';

interface RepoMeta {
    url: string;
    owner: string;
    name: string;
    description: string;
    stars: number;
    sizeKb: number;
    isFork: boolean;
    language: string;
    archetype: ProfileId;   // from student-harness run
    topics: string[];
    studentName: string;
    studentUid: string;
    previousScore?: number;     // score from student-harness run
    previousProfile?: string;   // profile from student-harness run
}

interface RepoDetail {
    languages: Record<string, number>;
    files: string[];
    commitCount: number;
    commitSpanDays: number;
    uniqueAuthors: number;
    readmeKeywords: string[];
    hasTests: boolean;
    hasCI: boolean;
    hasDocker: boolean;
    hasDocs: boolean;
    hasNotebooks: boolean;
    hasRequirements: boolean;
    hasPackageJson: boolean;
}

interface GroundTruth {
    profile: ProfileId;
    scoreRange: [number, number];
    confidence: number;
    signals: string[];
    reasoning: string;
}

interface PipelineOutput {
    success: boolean;
    profile?: string;
    score?: number;
    confidence?: string;
    reliability?: string;
    flags?: string[];
    lang?: string;
    error?: string;
    stage?: string;
    durationMs?: number;
    rawMetrics?: Record<string, any>;
    detectedSignals?: Record<string, boolean>;
    dimensions?: Record<string, { score: number; max: number }>;
    allProfiles?: Array<{ profileId: string; fitnessScore: number; status: string }>;
}

interface EvalResult {
    repo: RepoMeta;
    detail: RepoDetail | null;
    groundTruth: GroundTruth;
    pipeline: PipelineOutput;
    accuracy: Accuracy;
}

interface Accuracy {
    profileMatch: boolean;
    scoreInRange: boolean;
    noSpuriousFlags: boolean;
    verdict: 'CORRECT' | 'ACCEPTABLE' | 'MISCALIBRATED' | 'WRONG' | 'PIPELINE_FAILED';
    explanation: string;
}

// ─── GitHub Helpers ───────────────────────────────────────────────────────────

const GH_HEADERS: Record<string, string> = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
};

async function ghFetch(path: string, retries = 3): Promise<any> {
    const url = path.startsWith('https://') ? path : `https://api.github.com${path}`;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, { headers: GH_HEADERS });
            if (!res.ok) { console.error(`GitHub ${res.status}: ${path.slice(0, 60)}`); return null; }
            return await res.json();
        } catch (e: any) {
            if (attempt < retries) { await sleep(500 * attempt); continue; }
            throw e;
        }
    }
    return null;
}

// ─── Repo Detail Fetcher ──────────────────────────────────────────────────────

function hasPattern(files: string[], patterns: RegExp[]): boolean {
    return files.some(f => patterns.some(p => p.test(f)));
}

function extractKeywords(text: string): string[] {
    const keywords = [
        'machine learning', 'deep learning', 'neural network', 'pytorch', 'tensorflow',
        'flask', 'fastapi', 'django', 'express', 'react', 'vue', 'angular', 'nextjs',
        'rest api', 'graphql', 'microservice', 'cli', 'command line', 'command-line',
        'library', 'package', 'npm', 'pypi', 'assignment', 'homework', 'course',
        'tutorial', 'fullstack', 'full stack', 'frontend', 'backend', 'database',
        'docker', 'kubernetes', 'jupyter', 'notebook', 'data science',
        'classification', 'regression', 'nlp', 'computer vision',
    ];
    return keywords.filter(k => text.includes(k));
}

async function fetchRepoMeta(owner: string, name: string): Promise<any> {
    return ghFetch(`/repos/${owner}/${name}`);
}

async function fetchRepoDetail(owner: string, name: string): Promise<RepoDetail> {
    const base = `/repos/${owner}/${name}`;

    const [langs, tree, commits, readmeMeta] = await Promise.all([
        ghFetch(`${base}/languages`),
        ghFetch(`${base}/git/trees/HEAD?recursive=0`),
        ghFetch(`${base}/commits?per_page=50`),
        ghFetch(`${base}/readme`).catch(() => null),
    ]);

    const files: string[] = (tree?.tree ?? []).map((f: any) => f.path as string);
    const commitList: any[] = Array.isArray(commits) ? commits : [];

    let commitSpanDays = 0;
    if (commitList.length >= 2) {
        const first = new Date(commitList[commitList.length - 1]?.commit?.author?.date ?? 0);
        const last = new Date(commitList[0]?.commit?.author?.date ?? 0);
        commitSpanDays = Math.round((last.getTime() - first.getTime()) / 86_400_000);
    }

    const uniqueAuthors = new Set(
        commitList.map(c => c?.commit?.author?.name).filter(Boolean)
    ).size;

    let readmeKeywords: string[] = [];
    if (readmeMeta?.content) {
        const text = Buffer.from(readmeMeta.content, 'base64').toString('utf-8').toLowerCase().slice(0, 3000);
        readmeKeywords = extractKeywords(text);
    }

    return {
        languages: langs ?? {},
        files,
        commitCount: commitList.length,
        commitSpanDays,
        uniqueAuthors,
        readmeKeywords,
        hasTests: hasPattern(files, [/test/i, /spec/i, /__tests__/i]),
        hasCI: hasPattern(files, [/\.github\/workflows/i, /\.travis\.yml/i, /\.circleci/i]),
        hasDocker: hasPattern(files, [/dockerfile/i, /docker-compose/i]),
        hasDocs: hasPattern(files, [/^docs?\//i, /readme/i, /CONTRIBUTING/i]),
        hasNotebooks: hasPattern(files, [/\.ipynb$/i]),
        hasRequirements: hasPattern(files, [/requirements/i, /pyproject\.toml/i, /setup\.py/i]),
        hasPackageJson: files.includes('package.json'),
    };
}

// ─── Rule-Based Ground Truth Classifier ──────────────────────────────────────
// Identical to accuracy-harness.ts for deterministic comparison

function classifyRepo(repo: RepoMeta, d: RepoDetail): GroundTruth {
    const topics = [...repo.topics, ...d.readmeKeywords].map(t => t.toLowerCase());
    const langs = Object.keys(d.languages).map(l => l.toLowerCase());
    const files = d.files.map(f => f.toLowerCase());
    const isPython = langs[0] === 'python' || langs.includes('python');
    const isJS = langs.includes('javascript') || langs.includes('typescript');

    const signals: string[] = [];
    const scores: Record<ProfileId, number> = {
        generic: 0, production_web_app: 0, backend_api: 0,
        frontend_app: 0, ml_pipeline: 0, cli_tool: 0, library: 0, academic: 0,
    };

    // ML Pipeline
    const mlTopics = ['machine-learning', 'deep-learning', 'neural-network', 'pytorch', 'tensorflow',
        'keras', 'scikit-learn', 'nlp', 'computer-vision', 'data-science', 'ai'];
    if (topics.some(t => mlTopics.some(m => t.includes(m)))) { scores.ml_pipeline += 40; signals.push('ml-topic'); }
    if (d.hasNotebooks) { scores.ml_pipeline += 30; signals.push('has-notebooks'); }
    if (topics.some(t => ['data science', 'machine learning', 'deep learning', 'nlp', 'computer vision'].some(k => t.includes(k)))) { scores.ml_pipeline += 15; signals.push('ml-readme'); }
    const mlFileNames = ['train.py', 'model.py', 'inference.py', 'predict.py', 'dataset.py', 'eval.py', 'evaluate.py', 'trainer.py'];
    if (isPython && files.some(f => mlFileNames.some(m => f === m || f.endsWith('/' + m)))) { scores.ml_pipeline += 20; signals.push('ml-file-entrypoint'); }
    if (isPython && scores.ml_pipeline > 0) { scores.ml_pipeline += 10; }

    // CLI Tool
    const cliTopics = ['cli', 'command-line', 'command-line-tool', 'terminal', 'shell', 'click', 'typer', 'argparse'];
    if (topics.some(t => cliTopics.some(c => t.includes(c)))) { scores.cli_tool += 40; signals.push('cli-topic'); }
    if (files.some(f => /^(cli|main|__main__|cmd)\.py$/.test(f))) { scores.cli_tool += 20; signals.push('cli-entrypoint'); }
    if (isPython && topics.some(t => ['script', 'automation', 'tool', 'utility'].some(c => t.includes(c)))) { scores.cli_tool += 10; signals.push('python-tool'); }

    // Library / Package
    const libTopics = ['npm-package', 'library', 'package', 'sdk', 'framework', 'module', 'plugin'];
    if (topics.some(t => libTopics.some(l => t.includes(l)))) { scores.library += 40; signals.push('library-topic'); }
    if (isJS && d.hasPackageJson && !files.some(f => /src\/(app|pages|components)/.test(f))) { scores.library += 15; signals.push('npm-no-app-structure'); }
    if (isPython && d.hasRequirements && files.some(f => /setup\.(py|cfg)$/.test(f))) { scores.library += 25; signals.push('python-package'); }
    const hasRootIndex = files.some(f => /^(index|src[/\\]index)\.(js|ts|mjs|cjs)$/.test(f));
    const hasAppDirs = files.some(f => /(pages|components|app|routes?|controllers?)\//.test(f));
    if (isJS && hasRootIndex && !hasAppDirs && d.hasPackageJson) { scores.library += 15; signals.push('root-index-library'); }
    if (isPython && files.some(f => f === '__init__.py' || f === 'src/__init__.py')) { scores.library += 15; signals.push('python-init-library'); }

    // Frontend App
    const feTopics = ['react', 'vue', 'angular', 'svelte', 'nextjs', 'frontend', 'web-app', 'ui'];
    if (topics.some(t => feTopics.some(f => t.includes(f)))) { scores.frontend_app += 35; signals.push('frontend-topic'); }
    if (files.some(f => /src\/(pages|components|app)\//.test(f)) && !files.some(f => /(server|api\/)/.test(f))) { scores.frontend_app += 20; signals.push('frontend-structure'); }

    // Backend API
    const beTopics = ['rest-api', 'api', 'backend', 'express', 'fastify', 'nestjs', 'graphql', 'microservice'];
    if (topics.some(t => beTopics.some(b => t.includes(b)))) { scores.backend_api += 35; signals.push('backend-topic'); }
    if (files.some(f => /(routes?|controllers?|middleware|prisma)/.test(f))) { scores.backend_api += 20; signals.push('backend-structure'); }
    if (files.some(f => /(schema\.prisma|server\.(ts|js))/.test(f))) { scores.backend_api += 15; signals.push('server-files'); }

    // Full-Stack / Production Web App
    const fsTopics = ['fullstack', 'full-stack', 'monorepo', 'turbo', 'nextjs', 'nuxt'];
    if (topics.some(t => fsTopics.some(f => t.includes(f)))) { scores.production_web_app += 35; signals.push('fullstack-topic'); }
    if (files.some(f => /(pages|components)/.test(f)) && files.some(f => /(routes?|api\/|server)/.test(f))) { scores.production_web_app += 30; signals.push('fe-and-be-detected'); }
    if (files.some(f => /apps\/(web|api|frontend|backend)/.test(f))) { scores.production_web_app += 20; signals.push('monorepo-apps-dir'); }

    // Academic — STUDENT REPOS: boost academic detection for low-activity repos
    const acadTopics = ['assignment', 'homework', 'course', 'student', 'university', 'college', 'school'];
    if (topics.some(t => acadTopics.some(a => t.includes(a)))) { scores.academic += 40; signals.push('academic-topic'); }
    if (repo.stars < 5 && d.commitCount < 20 && d.commitSpanDays < 30) { scores.academic += 20; signals.push('low-activity'); }
    if (d.readmeKeywords.some(k => ['assignment', 'homework', 'course', 'tutorial'].includes(k))) { scores.academic += 15; signals.push('academic-readme'); }

    // Generic fallback
    if (Object.values(scores).every(s => s < 15)) { scores.generic += 30; signals.push('no-clear-signals'); }

    // Resolve ambiguities
    if (scores.ml_pipeline > 20 && scores.cli_tool > 20 && !d.hasNotebooks) {
        scores.ml_pipeline -= 15; signals.push('ml-cli-ambiguous');
    }
    if (scores.backend_api > 20 && scores.frontend_app > 20) {
        scores.production_web_app += 20; signals.push('both-fe-be');
    }

    // Winner
    const sorted = (Object.entries(scores) as [ProfileId, number][]).sort((a, b) => b[1] - a[1]);
    const [winner, winnerScore] = sorted[0];
    const runnerUpScore = sorted[1]?.[1] ?? 0;
    const confidence = winnerScore === 0 ? 0 : Math.min(1, (winnerScore - runnerUpScore) / 40);

    // Score range from quality signals
    const qualityScore =
        (d.hasTests ? 20 : 0) +
        (d.hasCI ? 15 : 0) +
        (d.hasDocs ? 10 : 0) +
        (d.hasDocker ? 5 : 0) +
        (d.commitSpanDays > 30 ? 10 : 0) +
        (d.commitSpanDays > 90 ? 5 : 0) +
        (d.uniqueAuthors > 1 ? 5 : 0) +
        (repo.stars > 50 ? 5 : 0) +
        (repo.stars > 200 ? 5 : 0);

    const scoreRange: [number, number] = [
        Math.max(10, qualityScore - 15),
        Math.min(95, qualityScore + 35),
    ];
    if (repo.isFork) scoreRange[1] = Math.min(scoreRange[1], 55);

    const reasoning = [
        `Classified as ${winner} (confidence: ${Math.round(confidence * 100)}%).`,
        signals.length > 0 ? `Key signals: ${signals.slice(0, 4).join(', ')}.` : '',
        `${d.commitCount} commits over ${d.commitSpanDays} days.`,
        d.hasTests ? 'Has tests.' : '',
        d.hasCI ? 'Has CI.' : '',
    ].filter(Boolean).join(' ');

    return { profile: winner, scoreRange, confidence, signals, reasoning };
}

// ─── Pipeline Runner ──────────────────────────────────────────────────────────

async function runPipelineOnRepo(repo: RepoMeta): Promise<PipelineOutput> {
    const start = Date.now();
    try {
        const result = await runPipeline(repo.url, GITHUB_TOKEN);
        const durationMs = Date.now() - start;
        if (!result.success) {
            const err = result as { success: false; error: string; stage: string };
            return { success: false, error: err.error ?? 'unknown', stage: err.stage, durationMs };
        }
        const r = result.report;
        const dims = (r.details?.dimensions as any)?.dimensions ?? r.details?.dimensions ?? {};
        return {
            success: true,
            profile: r.summary?.profileId,
            score: Math.round(r.summary?.overallScore ?? 0),
            confidence: r.summary?.confidenceLevel ?? (r.details?.confidence as any)?.level ?? 'UNKNOWN',
            reliability: r.summary?.reliabilityLevel ?? (r.details?.antiGaming as any)?.reliabilityLevel ?? 'UNKNOWN',
            flags: (r.details?.antiGaming?.flags ?? []).map((f: any) => f.pattern),
            lang: (r.details?.metrics as any)?.primary_language ?? 'unknown',
            durationMs,
            rawMetrics: {
                total_loc: (r.details?.metrics as any)?.total_loc,
                complexity_avg: (r.details?.metrics as any)?.complexity_avg,
                commit_count: (r.details?.metrics as any)?.commit_count,
                commit_span_days: (r.details?.metrics as any)?.commit_span_days,
                test_file_count: (r.details?.metrics as any)?.test_file_count,
                ci_config_present: (r.details?.metrics as any)?.ci_config_present,
                deploy_config_present: (r.details?.metrics as any)?.deploy_config_present,
                duplication_percent: (r.details?.metrics as any)?.duplication_percent,
                folder_count: (r.details?.metrics as any)?.folder_count,
            },
            detectedSignals: r.details?.signals as unknown as Record<string, boolean> | undefined,
            dimensions: {
                codeQuality: dims?.codeQuality,
                architecture: dims?.architecture,
                testing: dims?.testing,
                git: dims?.git,
                devops: dims?.devops,
            },
        };
    } catch (e: any) {
        return { success: false, error: e?.message ?? String(e), durationMs: Date.now() - start };
    }
}

// ─── Accuracy Comparison ──────────────────────────────────────────────────────
// Identical to accuracy-harness.ts evaluate() for parity

const RELATED: Record<string, string[]> = {
    cli_tool: ['academic', 'library', 'generic'],
    ml_pipeline: ['cli_tool', 'academic', 'backend_api'],
    backend_api: ['production_web_app', 'library'],
    frontend_app: ['production_web_app'],
    production_web_app: ['backend_api', 'frontend_app'],
    library: ['cli_tool', 'backend_api'],
    academic: ['cli_tool', 'generic', 'ml_pipeline'],
    generic: ['academic', 'cli_tool'],
};

function evaluate(repo: RepoMeta, gt: GroundTruth, pipe: PipelineOutput): Accuracy {
    if (!pipe.success) {
        return {
            profileMatch: false, scoreInRange: false, noSpuriousFlags: false,
            verdict: 'PIPELINE_FAILED',
            explanation: `Stage "${pipe.stage ?? 'unknown'}": ${pipe.error?.slice(0, 80)}`,
        };
    }

    const profileMatch = pipe.profile === gt.profile;
    const scoreInRange = pipe.score! >= gt.scoreRange[0] && pipe.score! <= gt.scoreRange[1];
    const scoreNearRange = pipe.score! >= gt.scoreRange[0] - 15 && pipe.score! <= gt.scoreRange[1] + 15;
    const isRelated = (RELATED[gt.profile] ?? []).includes(pipe.profile!);

    const BENIGN_FLAGS = ['Generic/Repetitive Messages', 'Dependency Inflation'];
    const adversarialFlags = (pipe.flags ?? []).filter(f => !BENIGN_FLAGS.some(b => f.includes(b)));
    const noSpuriousFlags = gt.confidence > 0.5
        ? adversarialFlags.length === 0
        : true;

    let verdict: Accuracy['verdict'];
    let explanation: string;

    if (profileMatch && scoreInRange && noSpuriousFlags) {
        verdict = 'CORRECT';
        explanation = `Profile ✓ (${pipe.profile}), score ${pipe.score} ∈ [${gt.scoreRange}].`;
    } else if ((profileMatch || isRelated) && scoreNearRange) {
        verdict = 'ACCEPTABLE';
        explanation = `Profile ${profileMatch ? '✓' : '~ (related)'} (${pipe.profile} vs ${gt.profile}), score ${pipe.score} near [${gt.scoreRange}].`;
    } else if (profileMatch && !scoreNearRange) {
        verdict = 'MISCALIBRATED';
        explanation = `Profile ✓ (${pipe.profile}), score ${pipe.score} far outside [${gt.scoreRange}].`;
    } else {
        verdict = 'WRONG';
        explanation = `Profile ✗: got ${pipe.profile}, expected ${gt.profile}. Score ${pipe.score} vs [${gt.scoreRange}].`;
    }

    return { profileMatch, scoreInRange, noSpuriousFlags, verdict, explanation };
}

// ─── Determinism Comparison ───────────────────────────────────────────────────
// Compare current pipeline result vs the previous result from student-harness

function compareDeterminism(repo: RepoMeta, current: PipelineOutput): string {
    if (!current.success || repo.previousScore == null || !repo.previousProfile) return '';

    const scoreDelta = current.score! - repo.previousScore;
    const profileChanged = current.profile !== repo.previousProfile;

    const parts: string[] = [];
    if (profileChanged) {
        parts.push(`⚠ PROFILE DRIFT: ${repo.previousProfile} → ${current.profile}`);
    }
    if (Math.abs(scoreDelta) > 0) {
        const arrow = scoreDelta > 0 ? '↑' : '↓';
        const emoji = Math.abs(scoreDelta) > 5 ? '⚠' : '✓';
        parts.push(`${emoji} SCORE DELTA: ${repo.previousScore} → ${current.score} (${arrow}${Math.abs(scoreDelta)})`);
    } else {
        parts.push(`✅ DETERMINISTIC: score=${current.score}, profile=${current.profile}`);
    }

    return parts.join('  |  ');
}

// ─── Output ───────────────────────────────────────────────────────────────────

const EMOJI: Record<string, string> = {
    CORRECT: '✅', ACCEPTABLE: '🟡', MISCALIBRATED: '🟠', WRONG: '❌', PIPELINE_FAILED: '💥',
};

function fmtScore(s?: number, max?: number) {
    if (s == null) return 'N/A';
    return max != null ? `${s}/${max}` : `${s}`;
}

function printResult(r: EvalResult) {
    const e = EMOJI[r.accuracy.verdict];
    const line = '─'.repeat(72);
    console.log(`\n${line}`);
    console.log(`${e} ${r.accuracy.verdict}  —  ${r.repo.owner}/${r.repo.name}  (student: ${r.repo.studentName})`);
    console.log(`   ⭐ ${r.repo.stars} stars | ${r.repo.language} | ${r.repo.sizeKb}KB`);
    if (r.repo.description) console.log(`   "${r.repo.description.slice(0, 80)}"`);

    // Determinism check vs student-harness run
    const detCheck = compareDeterminism(r.repo, r.pipeline);
    if (detCheck) console.log(`   ${detCheck}`);

    // Side-by-side
    console.log('');
    const col = 34;
    const h = (s: string) => s.padEnd(col);
    console.log(`   ${'CLASSIFIER (ground truth)'.padEnd(col)}  PIPELINE`);
    console.log(`   ${'─'.repeat(col)}  ${'─'.repeat(col)}`);

    const gtProfile = r.groundTruth.profile;
    const pipeProfile = r.pipeline.profile ?? 'failed';
    const profileMark = gtProfile === pipeProfile ? '✓' : '✗';
    console.log(`   ${h('Profile : ' + gtProfile)}  ${pipeProfile}  ${profileMark}`);

    const gtRange = `[${r.groundTruth.scoreRange[0]}–${r.groundTruth.scoreRange[1]}]`;
    const pipeScr = r.pipeline.score != null ? `${r.pipeline.score}/100` : 'N/A';
    const inRange = r.pipeline.score != null &&
        r.pipeline.score >= r.groundTruth.scoreRange[0] &&
        r.pipeline.score <= r.groundTruth.scoreRange[1];
    console.log(`   ${h('Score   : ' + gtRange)}  ${pipeScr}  ${inRange ? '✓' : '~'}`);
    console.log(`   ${h('Confidence: ' + Math.round(r.groundTruth.confidence * 100) + '%')}  ${r.pipeline.confidence ?? 'N/A'}`);

    // Classifier details
    if (r.detail) {
        const q = [
            r.detail.hasTests ? '✓ tests' : '✗ tests',
            r.detail.hasCI ? '✓ CI' : '✗ CI',
            r.detail.hasDocker ? '✓ docker' : '✗ docker',
            r.detail.hasDocs ? '✓ docs' : '✗ docs',
        ];
        console.log('');
        console.log(`   ── What classifier read from GitHub API ──`);
        console.log(`   ${q.join('  ')}`);
        console.log(`   Commits : ${r.detail.commitCount} over ${r.detail.commitSpanDays} days | ${r.detail.uniqueAuthors} author(s)`);
        console.log(`   Topics  : ${r.repo.topics.length ? r.repo.topics.join(', ') : 'none'}`);
        if (r.detail.readmeKeywords.length)
            console.log(`   README  : ${r.detail.readmeKeywords.slice(0, 6).join(', ')}`);
        if (VERBOSE)
            console.log(`   Signals : ${r.groundTruth.signals.join(', ')}`);
    }

    // Pipeline details
    if (r.pipeline.success && r.pipeline.rawMetrics) {
        const m = r.pipeline.rawMetrics;
        console.log('');
        console.log(`   ── What pipeline measured after cloning ──`);
        console.log(`   LOC: ${m.total_loc ?? 'N/A'}  |  complexity_avg: ${m.complexity_avg != null ? Number(m.complexity_avg).toFixed(2) : 'N/A'}  |  folders: ${m.folder_count ?? 'N/A'}`);
        console.log(`   test_files: ${m.test_file_count ?? 'N/A'}  |  CI: ${m.ci_config_present ?? 'N/A'}  |  deploy: ${m.deploy_config_present ?? 'N/A'}  |  duplication: ${m.duplication_percent != null ? m.duplication_percent + '%' : 'N/A'}`);
        console.log(`   commits: ${m.commit_count ?? 'N/A'}  |  span: ${m.commit_span_days ?? 'N/A'}d`);
    }

    // Signals
    if (r.pipeline.detectedSignals && r.detail) {
        const s = r.pipeline.detectedSignals;
        const sigKeys = ['has_frontend', 'has_backend', 'has_database', 'has_tests', 'has_ci', 'has_docker',
            'has_documentation', 'has_ml_components', 'has_notebooks', 'is_minimal', 'is_short_timeline'];
        const pipelineSigs = sigKeys.filter(k => s[k]).join(', ') || 'none';
        console.log('');
        console.log(`   ── Signal comparison ──`);
        console.log(`   Pipeline signals   : ${pipelineSigs}`);
    }

    // Dimensions
    if (r.pipeline.dimensions) {
        const d = r.pipeline.dimensions;
        const dimStr = Object.entries(d)
            .filter(([, v]) => v != null)
            .map(([k, v]) => `${k.replace('codeQuality', 'CQ').replace('architecture', 'Arch').replace('testing', 'Test').replace('devops', 'DevOps').replace('git', 'Git')}: ${fmtScore(v?.score, v?.max)}`)
            .join('  ');
        if (dimStr) {
            console.log('');
            console.log(`   ── Pipeline dimension scores ──`);
            console.log(`   ${dimStr}`);
        }
    }

    // Flags
    if (r.pipeline.flags?.length) {
        const BENIGN = ['Generic/Repetitive Messages', 'Dependency Inflation'];
        const adversarial = r.pipeline.flags.filter(f => !BENIGN.some(b => f.includes(b)));
        const benign = r.pipeline.flags.filter(f => BENIGN.some(b => f.includes(b)));
        console.log('');
        if (adversarial.length) console.log(`   ⚠ Anti-gaming flags (adversarial): ${adversarial.join(', ')}`);
        if (benign.length) console.log(`   ℹ Anti-gaming flags (benign):      ${benign.join(', ')}`);
    }

    // Verdict
    console.log('');
    console.log(`   ${e} ${r.accuracy.explanation}`);
    if (r.pipeline.durationMs) console.log(`   ⏱  ${(r.pipeline.durationMs / 1000).toFixed(1)}s`);
}

function pct(n: number, total: number) {
    return total === 0 ? 0 : Math.round((n / total) * 100);
}

function printSummary(results: EvalResult[]) {
    const counts = { CORRECT: 0, ACCEPTABLE: 0, MISCALIBRATED: 0, WRONG: 0, PIPELINE_FAILED: 0 };
    for (const r of results) counts[r.accuracy.verdict]++;

    const total = results.length;
    const defensible = counts.CORRECT + counts.ACCEPTABLE;

    console.log(`\n${'═'.repeat(72)}`);
    console.log('  STUDENT REPO ACCURACY REPORT');
    console.log(`${'═'.repeat(72)}`);
    console.log(`\n  Repos evaluated    : ${total}`);
    console.log(`  ✅ Correct          : ${counts.CORRECT}  (${pct(counts.CORRECT, total)}%)`);
    console.log(`  🟡 Acceptable       : ${counts.ACCEPTABLE}  (${pct(counts.ACCEPTABLE, total)}%)`);
    console.log(`  🟠 Miscalibrated    : ${counts.MISCALIBRATED}  (${pct(counts.MISCALIBRATED, total)}%)`);
    console.log(`  ❌ Wrong            : ${counts.WRONG}  (${pct(counts.WRONG, total)}%)`);
    console.log(`  💥 Pipeline failed  : ${counts.PIPELINE_FAILED}  (${pct(counts.PIPELINE_FAILED, total)}%)`);
    console.log(`\n  Exact accuracy      : ${pct(counts.CORRECT, total)}%`);
    console.log(`  Defensible accuracy : ${pct(defensible, total)}%  (correct + acceptable)`);

    // Per-profile breakdown
    console.log(`\n  Per-profile breakdown (ground-truth):`);
    const byProfile: Record<string, { ok: number; total: number }> = {};
    for (const r of results) {
        const p = r.groundTruth.profile;
        if (!byProfile[p]) byProfile[p] = { ok: 0, total: 0 };
        byProfile[p].total++;
        if (r.accuracy.verdict === 'CORRECT' || r.accuracy.verdict === 'ACCEPTABLE') byProfile[p].ok++;
    }
    for (const [profile, s] of Object.entries(byProfile)) {
        const p = pct(s.ok, s.total);
        const bar = '█'.repeat(Math.round(p / 10)) + '░'.repeat(10 - Math.round(p / 10));
        console.log(`    ${profile.padEnd(22)} ${bar} ${String(p).padStart(3)}%  (${s.ok}/${s.total})`);
    }

    // Per-student breakdown
    console.log(`\n  Per-student breakdown:`);
    const byStudent: Record<string, { name: string; ok: number; total: number; repos: string[] }> = {};
    for (const r of results) {
        const key = r.repo.studentUid;
        if (!byStudent[key]) byStudent[key] = { name: r.repo.studentName, ok: 0, total: 0, repos: [] };
        byStudent[key].total++;
        const isOk = r.accuracy.verdict === 'CORRECT' || r.accuracy.verdict === 'ACCEPTABLE';
        if (isOk) byStudent[key].ok++;
        byStudent[key].repos.push(`${EMOJI[r.accuracy.verdict]} ${r.repo.name}`);
    }
    for (const [uid, s] of Object.entries(byStudent)) {
        const p = pct(s.ok, s.total);
        console.log(`    ${s.name.padEnd(20)} (${uid})  ${p}% (${s.ok}/${s.total})  ${s.repos.join('  ')}`);
    }

    // Confusion matrix
    const confusions: Record<string, number> = {};
    for (const r of results) {
        if (!r.accuracy.profileMatch && r.pipeline.profile) {
            const k = `${r.groundTruth.profile} → ${r.pipeline.profile}`;
            confusions[k] = (confusions[k] ?? 0) + 1;
        }
    }
    const topConf = Object.entries(confusions).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (topConf.length > 0) {
        console.log(`\n  Profile confusion matrix (ground-truth → pipeline):`);
        for (const [k, v] of topConf) console.log(`    ${k.padEnd(44)} ×${v}`);
    }

    // Determinism report
    const deterministicRepos = results.filter(r =>
        r.pipeline.success && r.repo.previousScore != null && r.repo.previousProfile
    );
    if (deterministicRepos.length > 0) {
        const scoreDrifts = deterministicRepos.map(r => Math.abs(r.pipeline.score! - r.repo.previousScore!));
        const profileDrifts = deterministicRepos.filter(r => r.pipeline.profile !== r.repo.previousProfile);
        const avgDrift = scoreDrifts.reduce((a, b) => a + b, 0) / scoreDrifts.length;
        const zeroDrift = scoreDrifts.filter(d => d === 0).length;

        console.log(`\n  ── Determinism Report (vs student-harness run) ──`);
        console.log(`  Repos compared     : ${deterministicRepos.length}`);
        console.log(`  Exactly same score : ${zeroDrift}/${deterministicRepos.length} (${pct(zeroDrift, deterministicRepos.length)}%)`);
        console.log(`  Avg score delta    : ${avgDrift.toFixed(1)} pts`);
        console.log(`  Profile drifts     : ${profileDrifts.length}`);
        if (profileDrifts.length > 0) {
            for (const r of profileDrifts) {
                console.log(`    ⚠ ${r.repo.owner}/${r.repo.name}: ${r.repo.previousProfile} → ${r.pipeline.profile}`);
            }
        }
        if (avgDrift <= 1 && profileDrifts.length === 0) {
            console.log(`  🟢 FULLY DETERMINISTIC — no drift detected`);
        } else if (avgDrift <= 5 && profileDrifts.length === 0) {
            console.log(`  🟡 MOSTLY DETERMINISTIC — minor score variance`);
        } else {
            console.log(`  🔴 DRIFT DETECTED — investigate score variance`);
        }
    }

    // Score bias
    const errors = results
        .filter(r => r.pipeline.success && r.pipeline.score != null)
        .map(r => r.pipeline.score! - ((r.groundTruth.scoreRange[0] + r.groundTruth.scoreRange[1]) / 2));
    if (errors.length > 0) {
        const bias = errors.reduce((a, b) => a + b, 0) / errors.length;
        const dir = bias > 3 ? '↑ OVERSCORING' : bias < -3 ? '↓ UNDERSCORING' : '≈ BALANCED';
        console.log(`\n  Score bias vs ground-truth midpoint: ${bias.toFixed(1)} pts  ${dir}`);
    }

    // Final verdict
    const dp = pct(defensible, total);
    console.log(`\n${'─'.repeat(72)}`);
    if (dp >= 80) console.log('  🟢 PRODUCTION READY — defensible on 80%+ of student repos');
    else if (dp >= 65) console.log('  🟡 NEEDS CALIBRATION — tune the weak archetypes before production');
    else console.log('  🔴 NOT READY — profile detection has significant inaccuracies on student repos');
    console.log(`${'═'.repeat(72)}\n`);
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ─── Repo Loader from student-results.json ────────────────────────────────────

function loadReposFromStudentResults(filePath: string): RepoMeta[] {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
        console.error(`❌ File not found: ${absPath}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(absPath, 'utf-8')) as any[];
    const repos: RepoMeta[] = [];

    for (const entry of data) {
        const student = entry.student;
        if (!entry.github?.repos) continue;

        for (const repo of entry.github.repos) {
            if (!repo.success || !repo.repoUrl) continue;

            // Parse owner/name from URL
            const match = repo.repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
            if (!match) continue;

            repos.push({
                url: repo.repoUrl,
                owner: match[1],
                name: match[2],
                description: '',
                stars: 0,       // will be enriched from API
                sizeKb: 0,
                isFork: false,
                language: '',
                archetype: (repo.profileId as ProfileId) || 'generic',
                topics: [],
                studentName: student.name ?? 'unknown',
                studentUid: student.uid ?? 'unknown',
                previousScore: repo.score,
                previousProfile: repo.profileId,
            });
        }
    }

    return repos;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    if (!GITHUB_TOKEN) { console.error('❌ GITHUB_TOKEN not set'); process.exit(1); }

    console.log('━'.repeat(72));
    console.log('  SLH Student Repo Accuracy Harness');
    console.log('  (repos from student-harness, deterministic ground-truth evaluation)');
    console.log('━'.repeat(72));

    // Phase 1 — Load repos from student-results.json
    console.log('\n📄 Phase 1: Loading repos from student-results.json...');
    let repos = loadReposFromStudentResults(INPUT_FILE);
    repos = repos.slice(0, MAX_REPOS);
    console.log(`  Loaded ${repos.length} repos from ${INPUT_FILE}`);

    if (repos.length === 0) {
        console.error('  No repos found. Run student-harness.ts with GitHub analysis first.');
        process.exit(1);
    }

    // Unique students
    const uniqueStudents = new Set(repos.map(r => r.studentUid));
    console.log(`  Students: ${uniqueStudents.size}`);
    console.log(`  Max repos: ${MAX_REPOS}`);
    console.log(`  Verbose  : ${VERBOSE}\n`);

    // Enrich repo metadata from GitHub API
    console.log('📡 Enriching repo metadata from GitHub API...');
    await ghFetch('/rate_limit').catch(() => null); // warmup
    await sleep(600);

    for (const repo of repos) {
        const meta = await fetchRepoMeta(repo.owner, repo.name);
        if (meta) {
            repo.description = meta.description ?? '';
            repo.stars = meta.stargazers_count ?? 0;
            repo.sizeKb = meta.size ?? 0;
            repo.isFork = meta.fork ?? false;
            repo.language = meta.language ?? '';
            repo.topics = meta.topics ?? [];
        }
        await sleep(200);
    }
    console.log(`  ✅ Enriched ${repos.length} repos\n`);

    // Phase 2 — Parallel ground truth + pipeline per repo
    console.log('🔬 Phase 2: Running parallel analysis (ground truth + pipeline)...\n');
    const results: EvalResult[] = [];

    for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        process.stdout.write(`[${String(i + 1).padStart(2)}/${repos.length}] ${repo.owner}/${repo.name} (${repo.studentName}) ... `);

        const [detailResult, pipelineResult] = await Promise.allSettled([
            fetchRepoDetail(repo.owner, repo.name),
            runPipelineOnRepo(repo),
        ]);

        const detail = detailResult.status === 'fulfilled' ? detailResult.value : null;
        const pipeline = pipelineResult.status === 'fulfilled'
            ? pipelineResult.value
            : { success: false as const, error: String((pipelineResult as PromiseRejectedResult).reason) };

        const groundTruth = detail
            ? classifyRepo(repo, detail)
            : {
                profile: repo.archetype, scoreRange: [20, 70] as [number, number],
                confidence: 0, signals: ['detail-fetch-failed'], reasoning: 'Could not fetch repo detail'
            };

        const accuracy = evaluate(repo, groundTruth, pipeline);
        process.stdout.write(`${EMOJI[accuracy.verdict]} ${accuracy.verdict}\n`);
        results.push({ repo, detail, groundTruth, pipeline, accuracy });

        if (i < repos.length - 1) await sleep(800);
    }

    // Phase 3 — Report
    console.log('\n📊 DETAILED RESULTS');
    results.forEach(printResult);
    printSummary(results);

    // Write results JSON
    const outPath = path.resolve('results/student-accuracy-results.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const summary = results.map(r => ({
        student: r.repo.studentName,
        uid: r.repo.studentUid,
        repo: `${r.repo.owner}/${r.repo.name}`,
        verdict: r.accuracy.verdict,
        groundTruthProfile: r.groundTruth.profile,
        pipelineProfile: r.pipeline.profile ?? null,
        groundTruthScoreRange: r.groundTruth.scoreRange,
        pipelineScore: r.pipeline.score ?? null,
        previousScore: r.repo.previousScore ?? null,
        previousProfile: r.repo.previousProfile ?? null,
        scoreDelta: r.pipeline.score != null && r.repo.previousScore != null
            ? r.pipeline.score - r.repo.previousScore : null,
        profileDrift: r.pipeline.profile !== r.repo.previousProfile,
    }));
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
    console.log(`📄 Results saved to ${outPath}`);
}

main().catch(e => {
    console.error('\n💥 Harness crashed:', e.message);
    if (VERBOSE) console.error(e);
    process.exit(1);
});
