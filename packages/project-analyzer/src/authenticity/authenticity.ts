import * as fs from 'fs/promises';
import * as path from 'path';
import { RawMetrics } from '../metrics/metrics';
import { scanImports } from './import-scanner';

// ── AuthenticityMetrics interface ──────────────────────────────────────
// Sits alongside RawMetrics — derived/interpreted values, not raw facts.
export interface AuthenticityMetrics {
    dependency_usage_ratio: number | null;   // 0.0–1.0, null if < 3 non-skipped deps
    has_valid_entry_point: boolean;
    entry_point_loc: number;
    commit_message_quality: number | null;   // 0.0–1.0, null if < 5 commits
    style_consistency: number | null;        // 0.0–1.0, null if < 10 source files
    readme_code_alignment: number | null;    // 0.0–1.0, null if no README or < 3 keywords
}

// ── Dep categories to skip in usage ratio ──────────────────────────────
const SKIP_DEP_PREFIXES = ['@types/'];
const SKIP_DEPS = new Set([
    'typescript', 'ts-node', 'tsx', 'ts-jest', 'tslib',
    'prettier', 'eslint', 'husky', 'lint-staged', 'commitlint',
    'nodemon', 'concurrently', 'rimraf', 'cross-env',
    'webpack', 'rollup', 'esbuild', 'vite',  // bundlers — not imported in source
    '@types/node', '@types/jest', '@types/react',
]);

function shouldSkipDep(dep: string): boolean {
    if (SKIP_DEPS.has(dep)) return true;
    if (SKIP_DEP_PREFIXES.some(p => dep.startsWith(p))) return true;
    return false;
}

/**
 * Compute the ratio of declared dependencies that are actually imported in source code.
 */
export function computeDependencyUsageRatio(
    importedPackages: Set<string>,
    declaredDeps: string[]
): number | null {
    const meaningful = declaredDeps.filter(d => !shouldSkipDep(d));
    if (meaningful.length < 3) return null;

    let matched = 0;

    for (const dep of meaningful) {
        // a. Exact match
        if (importedPackages.has(dep)) {
            matched++;
            continue;
        }

        // b. Scoped prefix match: @nestjs/core matches if any import starts with @nestjs/
        if (dep.startsWith('@')) {
            const scope = dep.split('/')[0] + '/';
            const hasScope = [...importedPackages].some(imp => imp.startsWith(scope));
            if (hasScope) {
                matched++;
                continue;
            }
        }

        // c. Base name match: strip scope prefix, compare base names
        const baseName = dep.startsWith('@') ? dep.split('/').slice(1).join('/') : dep;
        const hasBase = [...importedPackages].some(imp => {
            const impBase = imp.startsWith('@') ? imp.split('/').slice(1).join('/') : imp;
            return impBase === baseName;
        });
        if (hasBase) {
            matched++;
        }
    }

    return matched / meaningful.length;
}

// ── Entry point validity ───────────────────────────────────────────────

const ENTRY_POINT_CANDIDATES = [
    'src/main.ts', 'src/index.ts', 'src/app.ts', 'src/server.ts',
    'main.ts', 'index.ts', 'app.ts', 'server.ts',
    'main.py', 'app.py', 'run.py', 'manage.py',
    'main.go', 'cmd/main.go',
    'index.js', 'app.js', 'server.js',
    'src/index.js', 'src/main.js', 'src/app.js',
];

/**
 * Check if the repo has a valid non-empty entry point (>15 meaningful lines).
 */
export async function checkEntryPointValidity(
    localPath: string,
    files: string[]
): Promise<{ has_valid_entry_point: boolean; entry_point_loc: number }> {
    // Find the FIRST candidate that exists in the files array
    const foundEntry = ENTRY_POINT_CANDIDATES.find(e =>
        files.includes(e)
    );

    if (!foundEntry) {
        return { has_valid_entry_point: false, entry_point_loc: 0 };
    }

    try {
        const content = await fs.readFile(path.join(localPath, foundEntry), 'utf-8');
        const lines = content.split('\n');

        // Count non-empty, non-comment lines
        let loc = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length === 0) continue;
            if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
            loc++;
        }

        return { has_valid_entry_point: loc > 15, entry_point_loc: loc };
    } catch {
        return { has_valid_entry_point: false, entry_point_loc: 0 };
    }
}

// ── Commit message quality (Step 4) ────────────────────────────────────

const GENERIC_MESSAGES = new Set([
    'update', 'fix', 'changes', 'added', 'modified', 'commit',
    'wip', 'work in progress', 'test', 'asdf', 'aaa', 'temp',
    'initial commit', 'first commit', 'final', 'done', 'stuff',
    'update readme', 'update readme.md', 'minor', 'minor changes',
    'updated', 'fixed', 'add', 'remove', 'delete', 'edit',
    'save', 'push', 'misc', 'cleanup', 'clean up', 'refactor',
]);

const CONVENTIONAL_RE = /^(feat|fix|refactor|test|docs|chore|perf|style|ci|build)(\([^)]+\))?\s*:\s*/;
const FILE_REF_RE = /\b[\w-]+\.(ts|js|py|go|tsx|jsx|css|html|json|yaml|yml|md)\b/;
const CAMEL_CASE_RE = /\b[a-z]+[A-Z]\w+\b/;
const PASCAL_CASE_RE = /\b[A-Z][a-z]+[A-Z]\w+\b/;

/**
 * Compute commit message quality as a 0.0–1.0 score, volume-adjusted.
 */
export function computeCommitMessageQuality(
    messages: string[],
    commitCount: number
): number | null {
    if (commitCount < 5 || messages.length < 5) return null;

    const total = messages.length;
    const uniqueMessages = new Set(messages.map(m => m.toLowerCase().trim()));

    // 1. Uniqueness ratio (weight: 0.25)
    const rawUniqueness = uniqueMessages.size / total;
    const uniquenessScore = Math.min(1.0, Math.max(0, (rawUniqueness - 0.3) / 0.6));

    // 2. Specificity score (weight: 0.35)
    let specificCount = 0;
    for (const msg of messages) {
        const lower = msg.toLowerCase().trim();
        // Check blocklist first
        if (GENERIC_MESSAGES.has(lower)) continue;

        const isSpecific =
            CONVENTIONAL_RE.test(msg) ||
            FILE_REF_RE.test(msg) ||
            CAMEL_CASE_RE.test(msg) ||
            PASCAL_CASE_RE.test(msg) ||
            (msg.length >= 20 && /\b(add|create|implement|remove|fix|update|refactor|migrate|extract|handle)\w*\b/i.test(msg));

        if (isSpecific) specificCount++;
    }
    const specificityScore = specificCount / total;

    // 3. Length distribution (weight: 0.25)
    const longEnough = messages.filter(m => m.trim().length >= 10).length;
    const rawLengthRatio = longEnough / total;
    const lengthScore = Math.min(1.0, Math.max(0, (rawLengthRatio - 0.3) / 0.5));

    // Weighted sum
    const rawScore = (uniquenessScore * 0.25) + (specificityScore * 0.35) + (lengthScore * 0.25);

    // Volume adjustment: cap score for repos with < 30 commits
    const volumeMultiplier = Math.min(1.0, commitCount / 30);
    return rawScore * volumeMultiplier;
}

// ── Style consistency (Step 5) ─────────────────────────────────────────

type StyleClass = 'tab' | '2space' | '4space' | 'mixed';
type QuoteClass = 'single' | 'double' | 'mixed';
type SemiClass = 'with' | 'without' | 'mixed';

const JS_TS_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const STYLE_SKIP_RE = /(?:\.d\.ts$|\.test\.|\.spec\.|test_|_test\.)/;

function classifyIndentation(lines: string[]): StyleClass {
    let tabs = 0, twoSpace = 0, fourSpace = 0;
    const sample = lines.slice(0, 50);
    for (const line of sample) {
        if (line.startsWith('\t')) tabs++;
        else if (line.startsWith('    ')) fourSpace++;
        else if (line.startsWith('  ') && !line.startsWith('    ')) twoSpace++;
    }
    const total = tabs + twoSpace + fourSpace;
    if (total < 3) return 'mixed';
    const dominant = Math.max(tabs, twoSpace, fourSpace);
    return dominant / total >= 0.8 ? (tabs >= twoSpace && tabs >= fourSpace ? 'tab' : fourSpace >= twoSpace ? '4space' : '2space') : 'mixed';
}

function classifyQuotes(content: string): QuoteClass {
    const singles = (content.match(/(?<!=)'(?:[^'\\]|\\.)*'/g) || []).length;
    const doubles = (content.match(/(?<!=)"(?:[^"\\]|\\.)*"/g) || []).length;
    const total = singles + doubles;
    if (total < 5) return 'mixed';
    if (singles / total >= 0.8) return 'single';
    if (doubles / total >= 0.8) return 'double';
    return 'mixed';
}

function classifySemicolons(lines: string[]): SemiClass {
    let withSemi = 0, withoutSemi = 0;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length < 3) continue;
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
        if (trimmed.endsWith('{') || trimmed.endsWith('}') || trimmed.endsWith('(') || trimmed.endsWith(',')) continue;
        if (trimmed.endsWith(';')) withSemi++;
        else if (/\w$|\)$|'$|"$|`$/.test(trimmed)) withoutSemi++;
    }
    const total = withSemi + withoutSemi;
    if (total < 5) return 'mixed';
    if (withSemi / total >= 0.8) return 'with';
    if (withoutSemi / total >= 0.8) return 'without';
    return 'mixed';
}

/**
 * Compute style consistency across source files.
 * Returns null if fewer than 10 source files.
 */
export async function computeStyleConsistency(
    localPath: string,
    files: string[]
): Promise<number | null> {
    const sourceFiles = files.filter(f => {
        const ext = path.extname(f);
        return JS_TS_EXTENSIONS.has(ext) && !STYLE_SKIP_RE.test(f) && !f.includes('node_modules/');
    });

    if (sourceFiles.length < 10) return null;

    // Sample up to 20 files, spread across the repo
    const step = Math.max(1, Math.floor(sourceFiles.length / 20));
    const sampled: string[] = [];
    for (let i = 0; i < sourceFiles.length && sampled.length < 20; i += step) {
        sampled.push(sourceFiles[i]);
    }

    const fileAnalyses: Array<{ indent: StyleClass; quote: QuoteClass; semi: SemiClass }> = [];

    await Promise.all(sampled.map(async (relPath) => {
        try {
            const content = await fs.readFile(path.join(localPath, relPath), 'utf-8');
            const lines = content.split('\n');
            fileAnalyses.push({
                indent: classifyIndentation(lines),
                quote: classifyQuotes(content),
                semi: classifySemicolons(lines),
            });
        } catch {
            // Skip unreadable files
        }
    }));

    if (fileAnalyses.length < 5) return null;

    // For each dimension, compute how consistent the files are
    function consistencyScore<T extends string>(values: T[]): number {
        if (values.length === 0) return 0;
        const counts = new Map<T, number>();
        for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
        // 'mixed' counts against consistency
        const nonMixed = values.filter(v => v !== 'mixed');
        if (nonMixed.length === 0) return 0;
        const dominantCount = Math.max(...[...counts.entries()].filter(([k]) => k !== 'mixed').map(([, v]) => v), 0);
        return dominantCount / values.length;
    }

    const indentScore = consistencyScore(fileAnalyses.map(f => f.indent));
    const quoteScore = consistencyScore(fileAnalyses.map(f => f.quote));
    const semiScore = consistencyScore(fileAnalyses.map(f => f.semi));

    // Average of all dimension scores
    return (indentScore + quoteScore + semiScore) / 3;
}

// ── README-code alignment (Step 6) ─────────────────────────────────────

const SKIP_HEADER_WORDS = new Set([
    'with', 'using', 'getting', 'started', 'installation', 'about',
    'usage', 'contributing', 'license', 'table', 'contents', 'overview',
    'setup', 'build', 'deploy', 'development', 'features', 'demo',
    'project', 'introduction', 'description', 'requirements', 'notes',
    'prerequisites', 'how', 'what', 'why', 'todo', 'changelog', 'api',
]);

/**
 * Extract tech keywords from README using only high-confidence patterns.
 */
function extractReadmeKeywords(readmeContent: string): Set<string> {
    const keywords = new Set<string>();

    // a. Code blocks — extract package-name-like words
    const codeBlockRe = /```[\s\S]*?```/g;
    let match: RegExpExecArray | null;
    while ((match = codeBlockRe.exec(readmeContent)) !== null) {
        const block = match[0];
        // Extract import targets
        const importMatches = block.matchAll(/(?:import|require|from)\s+['"]?([a-zA-Z@][\w\-/.]*)/g);
        for (const m of importMatches) {
            keywords.add(m[1].toLowerCase().split('/')[0].replace(/^@/, ''));
        }
    }

    // b. Install commands
    const installRe = /(?:npm\s+install|yarn\s+add|pip\s+install|go\s+get)\s+([\w@/.\-]+)/g;
    while ((match = installRe.exec(readmeContent)) !== null) {
        const pkg = match[1].replace(/^--[\w-]+\s*/, '').trim();
        if (pkg.length >= 2) keywords.add(pkg.toLowerCase().split('/')[0].replace(/^@/, ''));
    }

    // c. Import examples in prose
    const proseImportRe = /(?:import|from)\s+['"]([a-zA-Z@][\w\-/.]*)['"]/g;
    while ((match = proseImportRe.exec(readmeContent)) !== null) {
        keywords.add(match[1].toLowerCase().split('/')[0].replace(/^@/, ''));
    }

    // d. Section headers (## or ### lines)
    const headerRe = /^#{1,3}\s+(.+)$/gm;
    while ((match = headerRe.exec(readmeContent)) !== null) {
        const words = match[1].split(/[\s,/]+/);
        for (const word of words) {
            const lower = word.toLowerCase().replace(/[^\w-]/g, '');
            if (lower.length >= 4 && !SKIP_HEADER_WORDS.has(lower)) {
                keywords.add(lower);
            }
        }
    }

    return keywords;
}

/**
 * Compute README-code alignment score.
 * Returns null if no README or fewer than 3 extracted keywords.
 */
export async function computeReadmeCodeAlignment(
    localPath: string,
    metrics: RawMetrics
): Promise<number | null> {
    // Find README
    const readmeCandidates = ['README.md', 'README.MD', 'readme.md', 'Readme.md'];
    let readmeContent: string | null = null;

    for (const candidate of readmeCandidates) {
        try {
            readmeContent = await fs.readFile(path.join(localPath, candidate), 'utf-8');
            break;
        } catch {
            continue;
        }
    }

    if (!readmeContent) return null;

    const keywords = extractReadmeKeywords(readmeContent);
    if (keywords.size < 3) return null;

    // Cross-reference against repo signals
    const depsLower = new Set(metrics.dependencies.map(d => d.toLowerCase()));
    const langExtensions = new Set(Object.keys(metrics.languages).map(k => k.toLowerCase()));
    const foldersLower = new Set(metrics.folder_structure.map(f => f.toLowerCase()));

    let matched = 0;
    for (const keyword of keywords) {
        if (depsLower.has(keyword)) { matched++; continue; }
        if (foldersLower.has(keyword)) { matched++; continue; }
        // Check if keyword matches any language extension name
        const langName = keyword.replace(/^\./, '');
        if (langExtensions.has(`.${langName}`) || langExtensions.has(langName)) { matched++; continue; }
        // Partial dep match — keyword appears as substring of a dependency
        const partialMatch = [...depsLower].some(dep => dep.includes(keyword) || keyword.includes(dep));
        if (partialMatch) matched++;
    }

    return matched / keywords.size;
}

// ── Main entry point ───────────────────────────────────────────────────

/**
 * Run all authenticity analyses on a cloned repo.
 */
export async function analyzeAuthenticity(
    localPath: string,
    metrics: RawMetrics,
    importedPackages?: Set<string>
): Promise<AuthenticityMetrics> {
    // Scan imports if not provided
    const imports = importedPackages ?? await scanImports(localPath, metrics.files);

    // Run all analyses in parallel
    const [depRatio, entryPoint, styleScore, readmeScore] = await Promise.all([
        Promise.resolve(computeDependencyUsageRatio(imports, metrics.dependencies)),
        checkEntryPointValidity(localPath, metrics.files),
        computeStyleConsistency(localPath, metrics.files),
        computeReadmeCodeAlignment(localPath, metrics),
    ]);

    // Commit message quality — needs raw messages from metrics
    const commitQuality = metrics.commit_messages
        ? computeCommitMessageQuality(metrics.commit_messages, metrics.commit_count ?? 0)
        : null;

    return {
        dependency_usage_ratio: depRatio,
        has_valid_entry_point: entryPoint.has_valid_entry_point,
        entry_point_loc: entryPoint.entry_point_loc,
        commit_message_quality: commitQuality,
        style_consistency: styleScore,
        readme_code_alignment: readmeScore,
    };
}
