import * as path from 'path';
import { promises as fs } from 'fs';
import { Project, SyntaxKind } from 'ts-morph';
import fg from 'fast-glob';
import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
import * as https from 'https';
import simpleGit from 'simple-git';

export interface RawMetrics {
    // Group A: Code Quality
    complexity_avg: number | null;
    complexity_max: number | null;
    long_functions_count: number;
    long_files_count: number;
    function_lengths: number[];       // all function body line counts
    max_nesting_depth: number;        // deepest if/for/while/try nesting across codebase
    avg_nesting_depth: number | null; // average nesting depth across functions
    duplication_percent: null;
    lint_violations_count: null;

    // Group B: Architecture
    folder_structure: string[];
    max_depth: number;
    circular_dependencies_count: number;
    coupling_score: number;
    max_fan_in: number;
    max_fan_out: number;
    avg_fan_out: number;
    orphan_module_count: number;

    // Group C: Testing
    test_file_count: number;
    test_loc: number;
    assertion_count: number;
    test_to_code_ratio: number;
    assertion_density: number | null; // assertions per 100 LOC of test code
    coverage_config_present: boolean;
    ci_runs_tests: boolean;

    // Group D: Git
    commit_count: number | null;
    commit_span_days: number | null;
    active_days_count: number | null;
    commit_spread_ratio: number | null;
    avg_commit_size: number | null;
    commit_message_avg_length: number | null;
    conventional_commit_ratio: number | null;
    branch_count: number | null;
    feature_branch_count: number | null;

    // Group E: DevOps
    ci_config_present: boolean;
    ci_config_quality: number; // 0-5 score based on stages
    deploy_config_present: boolean;
    deploy_config_types: string[];

    // Group F: Metadata
    file_count: number;
    folder_count: number;
    total_loc: number;
    source_loc: number;
    languages: Record<string, number>;
    primary_language: string | null;
    dependency_count: number;
    dependencies: string[];
    files: string[];           // all file paths relative to repo root
    has_main_export: boolean;  // package.json has "main" field (library indicator)
    has_bin_field: boolean;    // package.json has "bin" field (CLI indicator)
    has_console_scripts: boolean; // Python console_scripts in setup.cfg/pyproject.toml
    uses_argparse: boolean;       // Python argparse/sys.argv/click usage in source
    markup_loc: { md: number; html: number; css: number }; // LOC for markup files excluded from language detection
    is_fork: boolean;
    contributor_count: number | null;
    top_contributor_percent: number | null;
    commit_messages: string[];    // raw commit messages (up to 100, for authenticity analysis)

    // Extraction metadata
    extraction_timestamp: string;
    extraction_version: string;
    commit_sha: string | null;
}

export async function extractRawMetrics(localPath: string, repoUrl: string, token?: string): Promise<RawMetrics> {
    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    const timeoutPromise = new Promise<RawMetrics>((_, reject) => {
        const timer = setTimeout(() => reject(new Error('ANALYSIS_ERROR:Extraction timed out after 5 minutes')), TIMEOUT_MS);
        // Clean up timeout if analysis finishes first
        if (typeof timer.unref === 'function') timer.unref();
    });

    return Promise.race([
        _extractRawMetricsInternal(localPath, repoUrl, token),
        timeoutPromise
    ]);
}

async function _extractRawMetricsInternal(localPath: string, repoUrl: string, token?: string): Promise<RawMetrics> {
    // Start timestamp
    const extraction_timestamp = new Date().toISOString();
    const extraction_version = "1.1.0";

    // Parse repoUrl
    const match = repoUrl.match(/github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(\.git)?$/);
    const owner = match ? match[1] : '';
    const repo = match ? match[2].replace(/\.git$/, '') : '';

    // Get File list
    const cwd = localPath;
    const ignore = ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/__pycache__/**', '**/venv/**', '**/.venv/**', '**/target/**', '**/bin/**', '**/obj/**'];

    let allFiles: string[] = [];
    try {
        allFiles = await fg('**/*', { cwd, ignore, dot: true });
    } catch (err) {
        // fast-glob failed, proceed with empty array
    }

    // Fix 2: Multi-language source file detection
    const jstsSourceFiles = allFiles.filter(f => /\.(js|jsx|ts|tsx)$/.test(f) && !/\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f));
    const pythonSourceFiles = allFiles.filter(f => /\.py$/.test(f) && !/test_.*\.py$/.test(f) && !/.*_test\.py$/.test(f));
    const javaSourceFiles = allFiles.filter(f => /\.java$/.test(f) && !/Test\.java$/.test(f));
    const goSourceFiles = allFiles.filter(f => /\.go$/.test(f) && !/_test\.go$/.test(f));
    const cppSourceFiles = allFiles.filter(f => /\.(cpp|cc|cxx|c|h|hpp)$/.test(f));
    const rustSourceFiles = allFiles.filter(f => /\.rs$/.test(f) && !/test.*\.rs$/.test(f));

    const allSourceFiles = [...jstsSourceFiles, ...pythonSourceFiles, ...javaSourceFiles, ...goSourceFiles, ...cppSourceFiles, ...rustSourceFiles];

    // Multi-language test file detection
    const jstsTestFiles = allFiles.filter(f => /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f));
    const pythonTestFiles = allFiles.filter(f => /test_.*\.py$/.test(f) || /.*_test\.py$/.test(f));
    const javaTestFiles = allFiles.filter(f => /Test\.java$/.test(f));
    const goTestFiles = allFiles.filter(f => /_test\.go$/.test(f));
    const allTestFiles = [...jstsTestFiles, ...pythonTestFiles, ...javaTestFiles, ...goTestFiles];

    // Defaults
    const defaultCodeQuality = { complexity_avg: null, complexity_max: null, long_functions_count: 0, long_files_count: 0, function_lengths: [] as number[], max_nesting_depth: 0, avg_nesting_depth: null, duplication_percent: null, lint_violations_count: null };
    const defaultArch = { folder_structure: [] as string[], max_depth: 0, circular_dependencies_count: 0, coupling_score: 0, max_fan_in: 0, max_fan_out: 0, avg_fan_out: 0, orphan_module_count: 0 };
    const defaultTest = { test_file_count: 0, test_loc: 0, assertion_count: 0, test_to_code_ratio: 0, assertion_density: null, coverage_config_present: false, ci_runs_tests: false };
    const defaultDevOps = { ci_config_present: false, ci_config_quality: 0, deploy_config_present: false, deploy_config_types: [] };
    const defaultMeta = { file_count: 0, folder_count: 0, total_loc: 0, source_loc: 0, languages: {}, primary_language: null, dependency_count: 0, dependencies: [], files: [] as string[], has_main_export: false, has_bin_field: false, has_console_scripts: false, uses_argparse: false, markup_loc: { md: 0, html: 0, css: 0 } };
    const defaultGit = { commit_count: null, commit_span_days: null, active_days_count: null, commit_spread_ratio: null, avg_commit_size: null, commit_message_avg_length: null, conventional_commit_ratio: null, branch_count: null, feature_branch_count: null, is_fork: false, contributor_count: null, top_contributor_percent: null, commit_sha: null, commit_messages: [] as string[] };

    // Fix 6: Multi-language AST wiring — JS/TS first, fallback to Python
    let resAST: { complexity_avg: number | null; complexity_max: number | null; long_functions_count: number; long_files_count: number; function_lengths: number[]; max_nesting_depth: number; avg_nesting_depth: number | null; duplication_percent: null; lint_violations_count: null };
    try {
        const jstsResult = await analyzeAST(cwd, jstsSourceFiles);
        if (jstsResult && jstsResult.complexity_avg !== null) {
            resAST = jstsResult;
        } else if (pythonSourceFiles.length > 0) {
            const pyResult = await analyzePythonAST(cwd, pythonSourceFiles);
            resAST = pyResult ?? defaultCodeQuality;
        } else {
            resAST = defaultCodeQuality;
        }
    } catch {
        if (pythonSourceFiles.length > 0) {
            try {
                const pyResult = await analyzePythonAST(cwd, pythonSourceFiles);
                resAST = pyResult ?? defaultCodeQuality;
            } catch {
                resAST = defaultCodeQuality;
            }
        } else {
            resAST = defaultCodeQuality;
        }
    }

    // Run remaining groups in parallel
    const [
        groupArch,
        groupTest,
        groupDevOps,
        groupMeta,
        groupGit
    ] = await Promise.allSettled([
        analyzeArchitecture(cwd, allFiles, allSourceFiles),
        analyzeTesting(cwd, allTestFiles, allSourceFiles, allFiles),
        analyzeDevOps(cwd, allFiles),
        analyzeMetadata(cwd, allFiles, allSourceFiles),
        analyzeGit(cwd, owner, repo, token)
    ]);

    const resArch = groupArch.status === 'fulfilled' ? groupArch.value : defaultArch;
    const resTestRaw = groupTest.status === 'fulfilled' ? groupTest.value : defaultTest;
    const assertion_density = resTestRaw.test_loc > 0 ? (resTestRaw.assertion_count / resTestRaw.test_loc) * 100 : null;
    const resTest = { ...resTestRaw, assertion_density };
    const resDevOps = groupDevOps.status === 'fulfilled' ? groupDevOps.value : defaultDevOps;
    const resMeta = groupMeta.status === 'fulfilled' ? groupMeta.value : defaultMeta;
    const resGit = groupGit.status === 'fulfilled' ? groupGit.value : defaultGit;

    return {
        ...resAST,
        ...resArch,
        ...resTest,
        ...resDevOps,
        ...resMeta,
        commit_count: resGit.commit_count,
        commit_span_days: resGit.commit_span_days,
        active_days_count: resGit.active_days_count,
        commit_spread_ratio: resGit.commit_spread_ratio,
        avg_commit_size: resGit.avg_commit_size,
        commit_message_avg_length: resGit.commit_message_avg_length,
        conventional_commit_ratio: resGit.conventional_commit_ratio,
        branch_count: resGit.branch_count,
        feature_branch_count: resGit.feature_branch_count,
        is_fork: resGit.is_fork,
        contributor_count: resGit.contributor_count,
        top_contributor_percent: resGit.top_contributor_percent,
        commit_sha: resGit.commit_sha,
        commit_messages: resGit.commit_messages,
        extraction_timestamp,
        extraction_version
    };
}

async function analyzeAST(cwd: string, sourceFiles: string[]) {
    // Fix 5: Max file size guard (prevent ts-morph OOM on large bundled files)
    const safeFiles: string[] = [];
    for (const f of sourceFiles) {
        try {
            const stat = await fs.stat(path.join(cwd, f));
            if (stat.size <= 1048576) { // 1MB limit
                safeFiles.push(f);
            }
        } catch { } // ignore Unstatable files
    }

    const project = new Project();
    project.addSourceFilesAtPaths(safeFiles.map(f => path.join(cwd, f)));

    let totalComplexity = 0;
    let functionCount = 0;
    let complexity_max = 0;
    let long_functions_count = 0;
    let long_files_count = 0;

    const function_lengths: number[] = [];
    let max_nesting_depth = 0;
    let total_nesting_depth = 0;

    // Helper for nesting depth
    function getBlockDepth(node: any, currentDepth: number): number {
        let childDepth = currentDepth;
        const kind = node.getKind();
        if (
            kind === SyntaxKind.IfStatement ||
            kind === SyntaxKind.WhileStatement ||
            kind === SyntaxKind.ForStatement ||
            kind === SyntaxKind.ForInStatement ||
            kind === SyntaxKind.ForOfStatement ||
            kind === SyntaxKind.SwitchStatement ||
            kind === SyntaxKind.TryStatement ||
            kind === SyntaxKind.CatchClause
        ) {
            childDepth++;
        }

        let maxChildDepth = childDepth;
        node.forEachChild((child: any) => {
            maxChildDepth = Math.max(maxChildDepth, getBlockDepth(child, childDepth));
        });
        return maxChildDepth;
    }

    for (const sf of project.getSourceFiles()) {
        const lines = sf.getEndLineNumber();
        if (lines > 500) long_files_count++;

        // gather functions
        const funcs: any[] = [...sf.getFunctions(), ...sf.getClasses().flatMap(c => c.getMethods())];

        // Also catch arrow functions assigned to variables
        sf.forEachDescendant(node => {
            if (node.isKind(SyntaxKind.ArrowFunction) || node.isKind(SyntaxKind.FunctionExpression)) {
                funcs.push(node);
            }
        });

        for (const f of funcs) {
            if (!f.getBody) continue; // safety
            const startLine = f.getStartLineNumber();
            const endLine = f.getEndLineNumber();
            // Record function length
            const length = endLine - startLine;
            if (length > 50) long_functions_count++;
            function_lengths.push(length);

            // Compute nesting depth
            const body = f.getBody ? f.getBody() : undefined;
            if (body) {
                const funcDepth = getBlockDepth(body, 0);
                total_nesting_depth += funcDepth;
                max_nesting_depth = Math.max(max_nesting_depth, funcDepth);
            }

            let complexity = 1;

            f.forEachDescendant((node: any) => {
                switch (node.getKind()) {
                    case SyntaxKind.IfStatement:
                    case SyntaxKind.WhileStatement:
                    case SyntaxKind.ForStatement:
                    case SyntaxKind.ForInStatement:
                    case SyntaxKind.ForOfStatement:
                    case SyntaxKind.ConditionalExpression:
                    case SyntaxKind.CatchClause:
                    case SyntaxKind.CaseClause:
                        complexity++;
                        break;
                }
            });

            totalComplexity += complexity;
            functionCount++;
            if (complexity > complexity_max) complexity_max = complexity;
        }
    }

    return {
        complexity_avg: functionCount > 0 ? (totalComplexity / functionCount) : null,
        complexity_max: functionCount > 0 ? complexity_max : null,
        long_functions_count,
        long_files_count,
        function_lengths,
        max_nesting_depth,
        avg_nesting_depth: functionCount > 0 ? (total_nesting_depth / functionCount) : null,
        duplication_percent: null,
        lint_violations_count: null
    };
}

// Fix 3: Python complexity analysis via regex-based McCabe estimation
async function analyzePythonAST(cwd: string, pythonSourceFiles: string[]) {
    let totalComplexity = 0;
    let functionCount = 0;
    let complexity_max = 0;
    let long_functions_count = 0;
    let long_files_count = 0;

    const function_lengths: number[] = [];
    let max_nesting_depth = 0;
    let total_nesting_depth = 0;

    for (const f of pythonSourceFiles) {
        try {
            const content = await fs.readFile(path.join(cwd, f), 'utf-8');
            const lines = content.split('\n');

            if (lines.length > 500) long_files_count++;

            // Find function/method definitions
            const funcPattern = /^(\s*)(?:async\s+)?def\s+\w+/;
            const functionStarts: { indent: number; lineIdx: number }[] = [];

            for (let i = 0; i < lines.length; i++) {
                const funcMatch = lines[i].match(funcPattern);
                if (funcMatch) {
                    const indent = funcMatch[1].length;
                    functionStarts.push({ indent, lineIdx: i });
                }
            }

            // For each function, find its body and compute complexity
            for (let fi = 0; fi < functionStarts.length; fi++) {
                const start = functionStarts[fi];
                const nextFuncOrEnd = fi + 1 < functionStarts.length
                    ? functionStarts[fi + 1].lineIdx
                    : lines.length;

                const funcLines = lines.slice(start.lineIdx, nextFuncOrEnd);

                if (funcLines.length > 50) long_functions_count++;
                function_lengths.push(funcLines.length);

                // Cyclomatic complexity: count decision points
                // Nesting depth: proxy by checking maximum indentation inside the function relative to the function def
                let complexity = 1;
                let funcMaxIndent = 0;
                for (const line of funcLines) {
                    const stripped = line.trim();
                    if (!stripped || stripped.startsWith('#')) continue;

                    // Calculate relative indentation
                    const lineIndentMatch = line.match(/^(\s*)/);
                    if (lineIndentMatch) {
                        const lineIndent = lineIndentMatch[1].length;
                        // Assuming 4 spaces per indent level (rough approximation for mix of tabs/spaces)
                        const relativeIndentLevel = Math.max(0, Math.floor((lineIndent - start.indent) / 4));
                        funcMaxIndent = Math.max(funcMaxIndent, relativeIndentLevel);
                    }
                    // Count branching keywords
                    if (/^\s*(if|elif)\s/.test(line)) complexity++;
                    if (/^\s*(for|while|with)\s/.test(line)) complexity++;
                    if (/^\s*except[\s:]/.test(line)) complexity++;
                    // Inline boolean operators add paths
                    const andCount = (stripped.match(/\bandand\b/g) || []).length;
                    const orCount = (stripped.match(/\bor\b/g) || []).length;
                    complexity += andCount + orCount;
                }

                totalComplexity += complexity;
                functionCount++;
                if (complexity > complexity_max) complexity_max = complexity;

                max_nesting_depth = Math.max(max_nesting_depth, funcMaxIndent);
                total_nesting_depth += funcMaxIndent;
            }
        } catch { }
    }

    return functionCount > 0 ? {
        complexity_avg: totalComplexity / functionCount,
        complexity_max,
        long_functions_count,
        long_files_count,
        function_lengths,
        max_nesting_depth,
        avg_nesting_depth: total_nesting_depth / functionCount,
        duplication_percent: null,
        lint_violations_count: null
    } : null;
}

// Fix 7: Multi-language architecture coupling
async function analyzeArchitecture(cwd: string, allFiles: string[], sourceFiles: string[]) {
    const folders = new Set<string>();
    let max_depth = 0;
    for (const f of allFiles) {
        const parts = f.split('/');
        for (let i = 0; i < parts.length - 1; i++) {
            folders.add(parts[i]);
        }
        if (parts.length > max_depth) {
            max_depth = parts.length;
        }
    }

    // ── Build import graph ─────────────────────────────────────
    // adjacency: file → Set<file>  (local imports only)
    const adjacency = new Map<string, Set<string>>();
    const sourceSet = new Set(sourceFiles);
    let totalImports = 0;

    // Extension candidates for resolving bare specifiers
    const EXT_CANDIDATES = ['.ts', '.tsx', '.js', '.jsx', '.py'];
    const INDEX_CANDIDATES = EXT_CANDIDATES.map(e => '/index' + e);

    function resolveLocalImport(importerDir: string, specifier: string): string | null {
        // Normalize the specifier to a relative path from repo root
        const resolved = path.posix.join(importerDir, specifier);

        // 1. Exact match (already has extension)
        if (sourceSet.has(resolved)) return resolved;

        // 2. Try adding extensions
        for (const ext of EXT_CANDIDATES) {
            if (sourceSet.has(resolved + ext)) return resolved + ext;
        }

        // 3. Try as directory with index file
        for (const idx of INDEX_CANDIDATES) {
            if (sourceSet.has(resolved + idx)) return resolved + idx;
        }

        return null;
    }

    for (const f of sourceFiles) {
        const deps = new Set<string>();
        adjacency.set(f, deps);
        const dir = path.posix.dirname(f);

        try {
            const content = await fs.readFile(path.join(cwd, f), 'utf-8');

            // JS/TS: import ... from './foo' | require('./foo') | export ... from './foo'
            const jsLocalRe = /(?:import|export)\s+(?:[^;]*?)\s+from\s+['"](\.{1,2}\/[^'"]+)['"]|require\(['"](\.{1,2}\/[^'"]+)['"]\)/gm;
            let m: RegExpExecArray | null;
            while ((m = jsLocalRe.exec(content)) !== null) {
                const spec = m[1] || m[2];
                if (!spec) continue;
                const target = resolveLocalImport(dir, spec);
                if (target) deps.add(target);
                totalImports++;
            }

            // Python: from .module import X | from ..package.sub import Y
            const pyRelativeRe = /^from\s+(\.\.?[\w.]*?)\s+import/gm;
            while ((m = pyRelativeRe.exec(content)) !== null) {
                const dots = m[1];
                if (!dots) continue;
                // Convert dots to path: ".foo" → "./foo", "..bar" → "../bar"
                const leadingDots = dots.match(/^\.+/);
                if (!leadingDots) continue;
                const depth = leadingDots[0].length;
                const modulePart = dots.slice(depth).replace(/\./g, '/');
                const prefix = depth === 1 ? './' : '../'.repeat(depth - 1);
                const spec = prefix + modulePart;
                const target = resolveLocalImport(dir, spec || './');
                if (target) deps.add(target);
                totalImports++;
            }

            // Count all imports (including external) for coupling_score
            const allJsImports = content.match(/^(?:import|export)\s+.*\s+from\s+['"].*['"];?|require\(['"].*['"]\)/gm);
            const allPyImports = content.match(/^(?:import|from)\s+[\w.]+/gm);
            const javaImports = content.match(/^import\s+[\w.]+;/gm);
            const goImports = content.match(/^(?:import\s+"[\w./]+")/gm);
            // totalImports already counted local JS/TS + Python relative above,
            // add external/absolute to get the full coupling count
            const allCount = (allJsImports?.length || 0) + (allPyImports?.length || 0) +
                (javaImports?.length || 0) + (goImports?.length || 0);
            // Avoid double-counting: we already incremented for local matches
            // Just use allCount for the coupling metric
            totalImports = Math.max(totalImports, 0); // keep local count separate
        } catch { }
    }

    // ── Cycle detection (Iterative DFS coloring) ────────────────────
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map<string, number>();
    for (const f of sourceFiles) color.set(f, WHITE);

    let cycleCount = 0;
    for (const f of sourceFiles) {
        if (color.get(f) === WHITE) {
            const stack = [{ node: f, idx: 0 }];
            color.set(f, GRAY);

            while (stack.length > 0) {
                const current = stack[stack.length - 1];
                const neighborsSet = adjacency.get(current.node);
                const neighbors = neighborsSet ? Array.from(neighborsSet) : [];

                if (current.idx < neighbors.length) {
                    const nb = neighbors[current.idx++];
                    const c = color.get(nb);
                    if (c === GRAY) {
                        cycleCount++;
                    } else if (c === WHITE) {
                        color.set(nb, GRAY);
                        stack.push({ node: nb, idx: 0 });
                    }
                } else {
                    color.set(current.node, BLACK);
                    stack.pop();
                }
            }
        }
    }

    // ── Fan-in / Fan-out ──────────────────────────────────────
    const fanIn = new Map<string, number>();
    for (const f of sourceFiles) fanIn.set(f, 0);

    let maxFanOut = 0;
    let totalFanOut = 0;
    let graphNodeCount = 0;

    for (const [file, deps] of adjacency) {
        const out = deps.size;
        totalFanOut += out;
        graphNodeCount++;
        if (out > maxFanOut) maxFanOut = out;

        for (const dep of deps) {
            fanIn.set(dep, (fanIn.get(dep) || 0) + 1);
        }
    }

    let maxFanIn = 0;
    for (const count of fanIn.values()) {
        if (count > maxFanIn) maxFanIn = count;
    }

    const avgFanOut = graphNodeCount > 0 ? totalFanOut / graphNodeCount : 0;

    // ── Orphan modules ────────────────────────────────────────
    // Files with 0 fan-in AND 0 fan-out, excluding common entry points
    const ENTRY_PATTERNS = [
        /^(?:src\/)?(?:index|main|app|server|cli)\.[^/]+$/i,
        /__main__\.py$/,
        /manage\.py$/,
        /^(?:src\/)?(?:App|app)\.[tj]sx?$/
    ];
    const isEntryPoint = (f: string) => ENTRY_PATTERNS.some(re => re.test(f));

    let orphanCount = 0;
    for (const f of sourceFiles) {
        const out = adjacency.get(f)?.size || 0;
        const inCount = fanIn.get(f) || 0;
        if (out === 0 && inCount === 0 && !isEntryPoint(f)) {
            orphanCount++;
        }
    }

    // Recompute totalImports for coupling_score (all import statements)
    let couplingTotal = 0;
    for (const f of sourceFiles) {
        try {
            const content = await fs.readFile(path.join(cwd, f), 'utf-8');
            const jsImports = content.match(/^(?:import|export)\s+.*\s+from\s+['"].*['"];?|require\(['"].*['"]\)/gm);
            const pythonImports = content.match(/^(?:import|from)\s+[\w.]+/gm);
            const javaImports = content.match(/^import\s+[\w.]+;/gm);
            const goImports = content.match(/^(?:import\s+"[\w./]+")/gm);
            couplingTotal += (jsImports?.length || 0) + (pythonImports?.length || 0) +
                (javaImports?.length || 0) + (goImports?.length || 0);
        } catch { }
    }

    return {
        folder_structure: Array.from(folders),
        max_depth: max_depth > 0 ? max_depth - 1 : 0,
        circular_dependencies_count: cycleCount,
        coupling_score: sourceFiles.length > 0 ? (couplingTotal / sourceFiles.length) : 0,
        max_fan_in: maxFanIn,
        max_fan_out: maxFanOut,
        avg_fan_out: Math.round(avgFanOut * 100) / 100,
        orphan_module_count: orphanCount
    };
}

// Fix 4: Multi-language test detection
async function analyzeTesting(cwd: string, testFiles: string[], sourceFiles: string[], allFiles: string[]) {
    let test_loc = 0;
    let assertion_count = 0;

    for (const f of testFiles) {
        try {
            const content = await fs.readFile(path.join(cwd, f), 'utf-8');
            test_loc += content.split('\n').length;

            // JS/TS assertions
            const jsAsserts = content.match(/\b(expect|assert|should)\b/g);
            // Python assertions
            const pythonAsserts = content.match(/\b(assert|assertEqual|assertIn|assertTrue|assertFalse|assertRaises|pytest\.raises)\b/g);
            // Java assertions
            const javaAsserts = content.match(/\b(assertEquals|assertTrue|assertFalse|assertNotNull|assertNull|assertThat|verify)\b/g);

            assertion_count += (jsAsserts?.length || 0) + (pythonAsserts?.length || 0) + (javaAsserts?.length || 0);
        } catch { }
    }

    let source_loc = 0;
    for (const f of sourceFiles) {
        try {
            const content = await fs.readFile(path.join(cwd, f), 'utf-8');
            source_loc += content.split('\n').length;
        } catch { }
    }

    const coverage_config_present = allFiles.some(f =>
        /jest\.config|vitest\.config|nyc\.config|\.nycrc|codecov\.yml|pytest\.ini|setup\.cfg|tox\.ini|\.coveragerc|pyproject\.toml/.test(f)
    );
    const ci_runs_tests = allFiles.some(f => /\.github\/workflows\/.*\.yml$/.test(f) || /\.gitlab-ci\.yml$/.test(f) || /circleci\/config\.yml$/.test(f));

    return {
        test_file_count: testFiles.length,
        test_loc,
        assertion_count,
        test_to_code_ratio: source_loc > 0 ? (test_loc / source_loc) : 0,
        coverage_config_present,
        ci_runs_tests
    };
}

async function analyzeDevOps(cwd: string, allFiles: string[]) {
    const ci_config_present = allFiles.some(f => /\.github\/workflows\/.*\.yml$/.test(f) || /\.gitlab-ci\.yml$/.test(f) || /circleci\/config\.yml$/.test(f));

    // ci_config_quality: 0-5 based on stages detected in CI config
    let ci_config_quality = 0;
    if (ci_config_present) {
        ci_config_quality = 1; // base: CI exists
        const ciFiles = allFiles.filter(f => /\.github\/workflows\/.*\.yml$/.test(f) || /\.gitlab-ci\.yml$/.test(f) || /circleci\/config\.yml$/.test(f));
        for (const cf of ciFiles) {
            try {
                const content = await fs.readFile(path.join(cwd, cf), 'utf-8');
                const lower = content.toLowerCase();
                if (/\b(npm\s+run\s+build|yarn\s+build|go\s+build|mvn\s+compile|cargo\s+build)\b/.test(lower)) ci_config_quality = Math.max(ci_config_quality, 2);
                if (/\b(npm\s+test|yarn\s+test|pytest|jest|go\s+test|mvn\s+test|cargo\s+test)\b/.test(lower)) ci_config_quality = Math.max(ci_config_quality, 3);
                if (/\b(npm\s+run\s+lint|eslint|pylint|flake8|golint)\b/.test(lower)) ci_config_quality = Math.max(ci_config_quality, 4);
                if (/\b(deploy|publish|release|push|upload)\b/.test(lower)) ci_config_quality = 5;
            } catch { }
        }
    }

    const deploy_config_types: string[] = [];
    if (allFiles.some(f => /Dockerfile/.test(f))) deploy_config_types.push('Docker');
    if (allFiles.some(f => /docker-compose\.yml/.test(f))) deploy_config_types.push('Docker Compose');
    if (allFiles.some(f => /vercel\.json/.test(f))) deploy_config_types.push('Vercel');
    if (allFiles.some(f => /netlify\.toml/.test(f))) deploy_config_types.push('Netlify');
    if (allFiles.some(f => /Procfile/.test(f))) deploy_config_types.push('Heroku');
    if (allFiles.some(f => /\.aws\/|serverless\.yml/.test(f))) deploy_config_types.push('AWS');

    return {
        ci_config_present,
        ci_config_quality,
        deploy_config_present: deploy_config_types.length > 0,
        deploy_config_types
    };
}

// Fix 1: Language detection with nonLanguageExts filter
// Fix 5: Multi-language dependency detection
async function analyzeMetadata(cwd: string, allFiles: string[], sourceFiles: string[]) {
    const folder_count = new Set(allFiles.map(f => path.dirname(f))).size;
    let total_loc = 0;
    let source_loc = 0;
    const languages: Record<string, number> = {};
    const markup_loc = { md: 0, html: 0, css: 0 };

    const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.tar', '.gz', '.wasm', '.map', '.mp4', '.mp3', '.woff', '.woff2', '.ttf', '.eot']);

    // Fix 1: Extensions to exclude from language detection (still count toward total_loc)
    const nonLanguageExts = new Set([
        '.json', '.lock', '.md', '.mdx', '.txt', '.csv', '.yaml', '.yml',
        '.toml', '.xml', '.env', '.ini', '.cfg', '.conf', '.gitignore',
        '.prettierrc', '.eslintrc', '.editorconfig', '.nvmrc', '.npmrc',
        '.map', '.min.js', '.svg', '.html', '.css', '.scss', '.sass', '.less'
    ]);

    for (const f of allFiles) {
        try {
            const ext = path.extname(f).toLowerCase();
            const stat = await fs.stat(path.join(cwd, f));
            if (!stat.isFile()) continue;

            let loc = 0;
            if (!binaryExts.has(ext)) {
                const content = await fs.readFile(path.join(cwd, f), 'utf-8');
                loc = content.split('\n').length;
                total_loc += loc;
            }

            // Only attribute LOC to language if not in the exclusion set
            if (ext && !nonLanguageExts.has(ext) && !binaryExts.has(ext)) {
                languages[ext] = (languages[ext] || 0) + loc;
            }

            // Track markup LOC separately for signal detection
            if (ext === '.md' || ext === '.mdx') markup_loc.md += loc;
            if (ext === '.html' || ext === '.htm') markup_loc.html += loc;
            if (ext === '.css' || ext === '.scss' || ext === '.sass' || ext === '.less') markup_loc.css += loc;

            if (sourceFiles.includes(f)) {
                source_loc += loc;
            }
        } catch { }
    }

    let primary_language = null;
    let maxLoc = 0;
    for (const [ext, loc] of Object.entries(languages)) {
        if (loc > maxLoc) {
            maxLoc = loc;
            primary_language = ext.replace('.', '');
        }
    }

    let dependency_count = 0;
    const dependencies: string[] = [];

    // JS/TS: package.json — scan all package.json files up to depth 3, excluding node_modules
    const pjsonPaths = allFiles.filter(f => {
        const base = f.split('/').pop();
        if (base !== 'package.json') return false;
        if (f.includes('node_modules')) return false;
        const depth = f.split('/').length;
        return depth <= 3; // depth 1 = root, depth 3 = a/b/package.json
    });
    let has_main_export = false;
    let has_bin_field = false;
    for (const pjsonPath of pjsonPaths) {
        try {
            const pjson = JSON.parse(await fs.readFile(path.join(cwd, pjsonPath), 'utf-8'));
            if (pjson.dependencies) {
                dependencies.push(...Object.keys(pjson.dependencies));
            }
            if (pjson.devDependencies) {
                dependencies.push(...Object.keys(pjson.devDependencies));
            }
            // Detect library pattern: package.json has "main" or "exports" field (root only)
            if (pjsonPath === 'package.json' && (pjson.main || pjson.exports || pjson.module)) {
                has_main_export = true;
            }
            // Detect CLI pattern: package.json has "bin" field
            if (pjson.bin) {
                has_bin_field = true;
            }
        } catch { }
    }

    // Fix 5: Python — requirements*.txt (scan all matching files up to depth 3)
    const reqPaths = allFiles.filter(f => {
        const base = f.split('/').pop() || '';
        if (!/^requirements.*\.txt$/.test(base)) return false;
        const depth = f.split('/').length;
        return depth <= 3;
    });
    for (const reqPath of reqPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, reqPath), 'utf-8');
            const deps = content.split('\n')
                .map(l => l.trim().split(/[>=<!]/)[0].trim())
                .filter(l => l && !l.startsWith('#') && !l.startsWith('-'));
            dependencies.push(...deps);
        } catch { }
    }

    // Fix 5: Python — pyproject.toml (proper [project] dependencies parsing)
    const pyprojectPaths = allFiles.filter(f => f.split('/').pop() === 'pyproject.toml' && f.split('/').length <= 3);
    for (const pyprojectPath of pyprojectPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, pyprojectPath), 'utf-8');
            // Extract [project] dependencies = ["pkg>=1.0", ...] array
            const depsBlock = content.match(/\[project\][\s\S]*?dependencies\s*=\s*\[([\s\S]*?)\]/);
            if (depsBlock) {
                const quoted = depsBlock[1].match(/["']([^"'>=<!~\s\[]+)/g);
                if (quoted) dependencies.push(...quoted.map(m => m.replace(/["']/g, '')));
            }
            // Also check [project.optional-dependencies]
            const optBlock = content.match(/\[project\.optional-dependencies\][\s\S]*?(?=\n\[|$)/);
            if (optBlock) {
                const quoted = optBlock[0].match(/["']([^"'>=<!~\s\[]+)/g);
                if (quoted) dependencies.push(...quoted.map(m => m.replace(/["']/g, '')));
            }
        } catch { }
    }

    // Fix 5: Python — setup.py (install_requires)
    const setupPyPaths = allFiles.filter(f => f.split('/').pop() === 'setup.py' && f.split('/').length <= 3);
    for (const setupPyPath of setupPyPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, setupPyPath), 'utf-8');
            const requiresBlock = content.match(/install_requires\s*=\s*\[([\s\S]*?)\]/);
            if (requiresBlock) {
                const deps = requiresBlock[1].match(/['"]([^'">=<!\s]+)/g);
                if (deps) dependencies.push(...deps.map(d => d.replace(/['"]/g, '')));
            }
        } catch { }
    }

    // Python — setup.cfg (install_requires under [options])
    const setupCfgPaths = allFiles.filter(f => f.split('/').pop() === 'setup.cfg' && f.split('/').length <= 3);
    for (const setupCfgPath of setupCfgPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, setupCfgPath), 'utf-8');
            const optionsBlock = content.match(/\[options\][\s\S]*?install_requires\s*=\s*([\s\S]*?)(?=\n\[|$)/);
            if (optionsBlock) {
                const deps = optionsBlock[1].split('\n')
                    .map(l => l.trim().split(/[>=<!]/)[0].trim())
                    .filter(l => l && !l.startsWith('#'));
                dependencies.push(...deps);
            }
        } catch { }
    }

    // ── CLI entrypoint detection ─────────────────────────────────
    let has_console_scripts = false;
    let uses_argparse = false;

    // Check setup.cfg for console_scripts
    for (const setupCfgPath of setupCfgPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, setupCfgPath), 'utf-8');
            if (/\[options\.entry_points\][\s\S]*?console_scripts/i.test(content) ||
                /\[console_scripts\]/i.test(content)) {
                has_console_scripts = true;
            }
        } catch { }
    }

    // Check pyproject.toml for console scripts (reuses pyprojectPaths from dep parsing above)
    for (const pyprojectPath of pyprojectPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, pyprojectPath), 'utf-8');
            if (/\[(?:project\.scripts|tool\.poetry\.scripts)\]/i.test(content) ||
                /console_scripts/i.test(content)) {
                has_console_scripts = true;
            }
        } catch { }
    }

    // Check setup.py for console_scripts
    for (const setupPyPath of setupPyPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, setupPyPath), 'utf-8');
            if (/console_scripts/i.test(content)) {
                has_console_scripts = true;
            }
        } catch { }
    }

    // Check for argparse / sys.argv / click usage in Python source files
    const pySourceFiles = allFiles.filter(f => f.endsWith('.py') && !f.includes('test') && !f.includes('__pycache__'));
    const pyFilesToCheck = pySourceFiles.slice(0, 15); // sample up to 15
    for (const pyFile of pyFilesToCheck) {
        try {
            const content = await fs.readFile(path.join(cwd, pyFile), 'utf-8');
            if (/import\s+argparse|from\s+argparse\s+import|sys\.argv|ArgumentParser/m.test(content) ||
                /import\s+click|from\s+click\s+import|@click\.command|@click\.group/m.test(content) ||
                /import\s+typer|from\s+typer\s+import/m.test(content) ||
                /import\s+fire|from\s+fire\s+import/m.test(content)) {
                uses_argparse = true;
                break;
            }
        } catch { }
    }

    // Python — environment.yml / environment.yaml (conda)
    const envYmlPaths = allFiles.filter(f => /^(environment\.ya?ml)$/.test(f.split('/').pop() || ''));
    for (const envPath of envYmlPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, envPath), 'utf-8');
            // Extract pip dependencies from conda environment files
            const pipBlock = content.match(/- pip:\s*\n((?:\s+-\s+.+\n?)*)/);
            if (pipBlock) {
                const pipDeps = pipBlock[1].match(/^\s+-\s+([^\s>=<!~\[]+)/gm);
                if (pipDeps) dependencies.push(...pipDeps.map(d => d.replace(/^\s+-\s+/, '').trim()));
            }
            // Also extract conda packages (e.g. "- numpy=1.21")
            const condaDeps = content.match(/^\s+-\s+(?!pip)([a-zA-Z][\w-]*)/gm);
            if (condaDeps) dependencies.push(...condaDeps.map(d => d.replace(/^\s+-\s+/, '').trim()));
        } catch { }
    }

    // Fix 5: Go — go.mod
    const gomodPaths = allFiles.filter(f => f.split('/').pop() === 'go.mod' && f.split('/').length <= 3);
    for (const gomodPath of gomodPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, gomodPath), 'utf-8');
            const requires = content.match(/^\s*require\s+([\w./\-]+)/gm);
            if (requires) dependencies.push(...requires.map(r => r.replace(/^\s*require\s+/, '').trim()));
        } catch { }
    }

    // Fix 5: Java — pom.xml
    const pomPaths = allFiles.filter(f => f.split('/').pop() === 'pom.xml' && f.split('/').length <= 3);
    for (const pomPath of pomPaths) {
        try {
            const content = await fs.readFile(path.join(cwd, pomPath), 'utf-8');
            const artifactIds = content.match(/<artifactId>([\w\-\.]+)<\/artifactId>/g);
            if (artifactIds) dependencies.push(...artifactIds.map(a => a.replace(/<\/?artifactId>/g, '')));
        } catch { }
    }

    // Deduplicate dependencies gathered from multiple manifest files
    const uniqueDeps = [...new Set(dependencies)];
    dependencies.length = 0;
    dependencies.push(...uniqueDeps);
    dependency_count = dependencies.length;

    return {
        file_count: allFiles.length,
        folder_count,
        total_loc,
        source_loc,
        languages,
        primary_language,
        dependency_count,
        dependencies,
        files: allFiles,
        has_main_export,
        has_bin_field,
        has_console_scripts,
        uses_argparse,
        markup_loc
    };
}

async function analyzeGit(cwd: string, owner: string, repo: string, token?: string) {
    let commit_count = 0;
    let commit_span_days = 0;
    let active_days_count = 0;
    let commit_spread_ratio = 0;
    let avg_commit_size = 0;
    let commit_message_avg_length = 0;
    let conventional_commit_ratio = 0;
    let branch_count = 0;
    let feature_branch_count = 0;
    let is_fork = false;
    let contributor_count = 0;
    let top_contributor_percent = 0;
    let commit_sha: string | null = null;
    let commit_messages: string[] = [];

    // Local fallback computation
    async function computeLocalGitMetrics() {
        try {
            const git = simpleGit(cwd);
            const log = await git.log();
            const allCommits = log.all;
            if (allCommits.length === 0) return;

            commit_sha = allCommits[0].hash;
            commit_count = allCommits.length;

            const activeDaysSet = new Set<string>();
            let commitMessageLengths = 0;
            let conventionalCount = 0;
            const authors = new Map<string, number>();

            for (const c of allCommits) {
                const dateSplit = new Date(c.date).toISOString().split('T')[0];
                activeDaysSet.add(dateSplit);

                const msg = c.message.split('\n')[0].trim();
                if (commit_messages.length < 100) {
                    commit_messages.push(msg);
                }
                commitMessageLengths += msg.length;
                if (/^(feat|fix|chore|docs|style|refactor|perf|test|build|ci)(\([^)]+\))?: /.test(msg)) {
                    conventionalCount++;
                }

                const authorEmail = c.author_email || c.author_name;
                authors.set(authorEmail, (authors.get(authorEmail) || 0) + 1);
            }

            active_days_count = activeDaysSet.size;
            commit_message_avg_length = commitMessageLengths / allCommits.length;
            conventional_commit_ratio = conventionalCount / allCommits.length;

            const latestDate = new Date(allCommits[0].date).getTime();
            const earliestDate = new Date(allCommits[allCommits.length - 1].date).getTime();
            commit_span_days = Math.max(0, Math.floor((latestDate - earliestDate) / (1000 * 60 * 60 * 24)));
            commit_spread_ratio = commit_span_days > 0 ? (active_days_count / commit_span_days) : 0;

            contributor_count = authors.size;
            if (authors.size > 0) {
                const topContributions = Math.max(...Array.from(authors.values()));
                top_contributor_percent = (topContributions / allCommits.length) * 100;
            }

            try {
                const branchSummary = await git.branchLocal();
                branch_count = branchSummary.all.length;
                feature_branch_count = branchSummary.all.filter(b => /^(feat|feature|bugfix|fix|chore|hotfix)\//i.test(b)).length;
            } catch { }

        } catch { }
    }

    try {
        if (!owner || !repo) {
            throw new Error("Invalid owner/repo");
        }
        if (!token) {
            throw new Error("No token provided, fallback to local git");
        }

        const httpsAgent = new https.Agent({ family: 4 });
        const customFetch = (url: any, options: any) => fetch(url, { ...options, agent: httpsAgent });

        const octokit = new Octokit({
            auth: token,
            request: { fetch: customFetch }
        });

        const repoInfo = await octokit.repos.get({ owner, repo });
        is_fork = repoInfo.data.fork;

        const commitsResponse = await octokit.repos.listCommits({ owner, repo, per_page: 100 });
        const firstPageData = commitsResponse.data;
        if (firstPageData.length === 0) {
            // If no commits via API, try local git
            await computeLocalGitMetrics();
            if (commit_count === 0) { // Still no commits after local fallback
                return {
                    commit_count: 0, commit_span_days: 0, active_days_count: 0, commit_spread_ratio: 0,
                    avg_commit_size: 0, commit_message_avg_length: 0, conventional_commit_ratio: 0,
                    branch_count: 0, feature_branch_count: 0, is_fork, contributor_count: 0,
                    top_contributor_percent: 0, commit_sha: null, commit_messages: [] as string[]
                };
            }
        } else {
            commit_sha = firstPageData[0].sha;
            const latestDateStr = firstPageData[0].commit.author?.date;

            const activeDaysSet = new Set<string>();
            let commitMessageLengths = 0;
            let conventionalCount = 0;

            for (const c of firstPageData) {
                if (c.commit.author?.date) activeDaysSet.add(c.commit.author.date.split('T')[0]);
                const msg = c.commit.message?.split('\n')[0] || '';   // first line only
                commit_messages.push(msg);
                commitMessageLengths += msg.length;
                if (/^(feat|fix|chore|docs|style|refactor|perf|test|build|ci)(\([^)]+\))?: /.test(msg)) {
                    conventionalCount++;
                }
            }

            commit_count = firstPageData.length;
            let earliestDateStr = firstPageData[firstPageData.length - 1].commit.author?.date;

            const linkHeader = commitsResponse.headers.link;
            if (linkHeader) {
                const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
                if (lastPageMatch) {
                    const lastPage = parseInt(lastPageMatch[1], 10);
                    commit_count = (lastPage - 1) * 100;

                    const lastPageCommits = await octokit.repos.listCommits({ owner, repo, per_page: 100, page: lastPage });
                    commit_count += lastPageCommits.data.length;

                    const earliestCommit = lastPageCommits.data[lastPageCommits.data.length - 1];
                    if (earliestCommit?.commit.author?.date) {
                        earliestDateStr = earliestCommit.commit.author.date;
                    }
                }
            }

            if (latestDateStr && earliestDateStr) {
                const latestDate = new Date(latestDateStr).getTime();
                const earliestDate = new Date(earliestDateStr).getTime();
                commit_span_days = Math.max(0, Math.floor((latestDate - earliestDate) / (1000 * 60 * 60 * 24)));
            }

            commit_message_avg_length = firstPageData.length > 0 ? (commitMessageLengths / firstPageData.length) : 0;
            conventional_commit_ratio = firstPageData.length > 0 ? (conventionalCount / firstPageData.length) : 0;
            commit_spread_ratio = commit_span_days > 0 ? (activeDaysSet.size / commit_span_days) : 0;

            const sampleSize = Math.min(10, firstPageData.length);
            if (sampleSize > 0) {
                let totalChanges = 0;
                let sampledCount = 0;
                for (let i = 0; i < sampleSize; i++) {
                    try {
                        const detail = await octokit.repos.getCommit({ owner, repo, ref: firstPageData[i].sha });
                        totalChanges += (detail.data.stats?.total || 0);
                        sampledCount++;
                    } catch { }
                }
                avg_commit_size = sampledCount > 0 ? Math.round(totalChanges / sampledCount) : 0;
            }

            const branchesResponse = await octokit.repos.listBranches({ owner, repo, per_page: 100 });
            const branches = branchesResponse.data;
            branch_count = branches.length;
            const branchLink = branchesResponse.headers.link;
            if (branchLink) {
                const lastBranchMatch = branchLink.match(/&page=(\d+)>; rel="last"/);
                if (lastBranchMatch) {
                    const lb = parseInt(lastBranchMatch[1], 10);
                    const lastPageBranches = await octokit.repos.listBranches({ owner, repo, per_page: 100, page: lb });
                    branch_count = (lb - 1) * 100 + lastPageBranches.data.length;
                }
            }

            feature_branch_count = branches.filter(b => /^(feat|feature|bugfix|fix|chore|hotfix)\//i.test(b.name)).length;

            const contributorsRes = await octokit.repos.listContributors({ owner, repo, per_page: 100 });
            const contributors = contributorsRes.data;
            contributor_count = contributors.length;
            if (contributors.length > 0) {
                const totalContributions = contributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
                const topContributions = contributors[0].contributions || 0;
                top_contributor_percent = totalContributions > 0 ? (topContributions / totalContributions) * 100 : 0;
            }
        }

    } catch (apiError) {
        // Fallback to local git if API fails or token missing
        await computeLocalGitMetrics();
    }

    return {
        commit_count,
        commit_span_days,
        active_days_count,
        commit_spread_ratio,
        avg_commit_size,
        commit_message_avg_length,
        conventional_commit_ratio,
        branch_count,
        feature_branch_count,
        is_fork,
        contributor_count,
        top_contributor_percent,
        commit_sha,
        commit_messages
    };
}
