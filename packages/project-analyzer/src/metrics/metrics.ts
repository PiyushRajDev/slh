import * as path from 'path';
import * as fs from 'fs/promises';
import { Project, SyntaxKind } from 'ts-morph';
import fg from 'fast-glob';
import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
import * as https from 'https';

export interface RawMetrics {
    // Group A: Code Quality
    complexity_avg: number | null;
    complexity_max: number | null;
    long_functions_count: number;
    long_files_count: number;
    duplication_percent: null;
    lint_violations_count: null;

    // Group B: Architecture
    folder_structure: string[];
    max_depth: number;
    circular_dependencies_count: null;
    coupling_score: number;

    // Group C: Testing
    test_file_count: number;
    test_loc: number;
    assertion_count: number;
    test_to_code_ratio: number;
    coverage_config_present: boolean;
    ci_runs_tests: boolean;

    // Group D: Git
    commit_count: number;
    commit_span_days: number;
    active_days_count: number;
    commit_spread_ratio: number;
    avg_commit_size: number;
    commit_message_avg_length: number;
    conventional_commit_ratio: number;
    branch_count: number;
    feature_branch_count: number;

    // Group E: DevOps
    ci_config_present: boolean;
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
    is_fork: boolean;
    contributor_count: number;
    top_contributor_percent: number;

    // Extraction metadata
    extraction_timestamp: string;
    extraction_version: string;
    commit_sha: string | null;
}

export async function extractRawMetrics(localPath: string, repoUrl: string, token?: string): Promise<RawMetrics> {
    // Start timestamp
    const extraction_timestamp = new Date().toISOString();
    const extraction_version = "1.0.0";

    // Parse repoUrl
    const match = repoUrl.match(/github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(\.git)?$/);
    const owner = match ? match[1] : '';
    const repo = match ? match[2].replace(/\.git$/, '') : '';

    // Get File list
    const cwd = localPath;
    const ignore = ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'];

    let allFiles: string[] = [];
    try {
        allFiles = await fg('**/*', { cwd, ignore, dot: true });
    } catch (err) {
        // fast-glob failed, proceed with empty array
    }

    // Pre-split files
    const sourceFiles = allFiles.filter(f => /\.(js|jsx|ts|tsx)$/.test(f) && !/\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f));
    const testFiles = allFiles.filter(f => /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f));

    // Run groups in parallel
    const [
        groupAST,
        groupArch,
        groupTest,
        groupDevOps,
        groupMeta,
        groupGit
    ] = await Promise.allSettled([
        analyzeAST(cwd, sourceFiles),
        analyzeArchitecture(cwd, allFiles, sourceFiles),
        analyzeTesting(cwd, testFiles, sourceFiles, allFiles),
        analyzeDevOps(allFiles),
        analyzeMetadata(cwd, allFiles, sourceFiles),
        analyzeGit(owner, repo, token)
    ]);

    const defaultCodeQuality = { complexity_avg: null, complexity_max: null, long_functions_count: 0, long_files_count: 0, duplication_percent: null, lint_violations_count: null };
    const defaultArch = { folder_structure: [], max_depth: 0, circular_dependencies_count: null, coupling_score: 0 };
    const defaultTest = { test_file_count: 0, test_loc: 0, assertion_count: 0, test_to_code_ratio: 0, coverage_config_present: false, ci_runs_tests: false };
    const defaultDevOps = { ci_config_present: false, deploy_config_present: false, deploy_config_types: [] };
    const defaultMeta = { file_count: 0, folder_count: 0, total_loc: 0, source_loc: 0, languages: {}, primary_language: null, dependency_count: 0, dependencies: [] };
    const defaultGit = { commit_count: 0, commit_span_days: 0, active_days_count: 0, commit_spread_ratio: 0, avg_commit_size: 0, commit_message_avg_length: 0, conventional_commit_ratio: 0, branch_count: 0, feature_branch_count: 0, is_fork: false, contributor_count: 0, top_contributor_percent: 0, commit_sha: null };

    const resAST = groupAST.status === 'fulfilled' ? groupAST.value : defaultCodeQuality;
    const resArch = groupArch.status === 'fulfilled' ? groupArch.value : defaultArch;
    const resTest = groupTest.status === 'fulfilled' ? groupTest.value : defaultTest;
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
        extraction_timestamp,
        extraction_version
    };
}

async function analyzeAST(cwd: string, sourceFiles: string[]) {
    const project = new Project();
    project.addSourceFilesAtPaths(sourceFiles.map(f => path.join(cwd, f)));

    let totalComplexity = 0;
    let functionCount = 0;
    let complexity_max = 0;
    let long_functions_count = 0;
    let long_files_count = 0;

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
            if ((endLine - startLine) > 50) long_functions_count++;

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
        complexity_avg: functionCount > 0 ? (totalComplexity / functionCount) : 0,
        complexity_max: functionCount > 0 ? complexity_max : 0,
        long_functions_count,
        long_files_count,
        duplication_percent: null,
        lint_violations_count: null
    };
}

async function analyzeArchitecture(cwd: string, allFiles: string[], sourceFiles: string[]) {
    const folders = new Set<string>();
    let max_depth = 0;
    for (const f of allFiles) {
        const parts = f.split('/');
        if (parts.length > 1) {
            folders.add(parts[0]);
        }
        if (parts.length > max_depth) {
            max_depth = parts.length;
        }
    }

    // coupling_score using regex on import/require
    let totalImports = 0;
    for (const f of sourceFiles) {
        try {
            const content = await fs.readFile(path.join(cwd, f), 'utf-8');
            const importMatches = content.match(/^(?:import|export)\s+.*\s+from\s+['"].*['"];?|require\(['"].*['"]\)/gm);
            if (importMatches) {
                totalImports += importMatches.length;
            }
        } catch { }
    }

    return {
        folder_structure: Array.from(folders),
        max_depth: max_depth > 0 ? max_depth - 1 : 0, // depth 0 means root
        circular_dependencies_count: null,
        coupling_score: sourceFiles.length > 0 ? (totalImports / sourceFiles.length) : 0
    };
}

async function analyzeTesting(cwd: string, testFiles: string[], sourceFiles: string[], allFiles: string[]) {
    let test_loc = 0;
    let assertion_count = 0;

    for (const f of testFiles) {
        try {
            const content = await fs.readFile(path.join(cwd, f), 'utf-8');
            test_loc += content.split('\n').length;
            const asserts = content.match(/\b(expect|assert|should)\b/g);
            if (asserts) assertion_count += asserts.length;
        } catch { }
    }

    let source_loc = 0;
    for (const f of sourceFiles) {
        try {
            const content = await fs.readFile(path.join(cwd, f), 'utf-8');
            source_loc += content.split('\n').length;
        } catch { }
    }

    const coverage_config_present = allFiles.some(f => /jest\.config|vitest\.config|nyc\.config|\.nycrc|codecov\.yml/.test(f));
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

async function analyzeDevOps(allFiles: string[]) {
    const ci_config_present = allFiles.some(f => /\.github\/workflows\/.*\.yml$/.test(f) || /\.gitlab-ci\.yml$/.test(f) || /circleci\/config\.yml$/.test(f));
    const deploy_config_types: string[] = [];
    if (allFiles.some(f => /Dockerfile/.test(f))) deploy_config_types.push('Docker');
    if (allFiles.some(f => /docker-compose\.yml/.test(f))) deploy_config_types.push('Docker Compose');
    if (allFiles.some(f => /vercel\.json/.test(f))) deploy_config_types.push('Vercel');
    if (allFiles.some(f => /netlify\.toml/.test(f))) deploy_config_types.push('Netlify');
    if (allFiles.some(f => /Procfile/.test(f))) deploy_config_types.push('Heroku');
    if (allFiles.some(f => /\.aws\/|serverless\.yml/.test(f))) deploy_config_types.push('AWS');

    return {
        ci_config_present,
        deploy_config_present: deploy_config_types.length > 0,
        deploy_config_types
    };
}

async function analyzeMetadata(cwd: string, allFiles: string[], sourceFiles: string[]) {
    const folder_count = new Set(allFiles.map(f => path.dirname(f))).size;
    let total_loc = 0;
    let source_loc = 0;
    const languages: Record<string, number> = {};

    const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.tar', '.gz', '.wasm', '.map', '.mp4', '.mp3', '.woff', '.woff2', '.ttf', '.eot']);

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

            if (ext) {
                languages[ext] = (languages[ext] || 0) + loc;
            }

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
    const pjsonPath = allFiles.find(f => f === 'package.json');
    if (pjsonPath) {
        try {
            const pjson = JSON.parse(await fs.readFile(path.join(cwd, pjsonPath), 'utf-8'));
            if (pjson.dependencies) {
                dependencies.push(...Object.keys(pjson.dependencies));
            }
            if (pjson.devDependencies) {
                dependencies.push(...Object.keys(pjson.devDependencies));
            }
            dependency_count = dependencies.length;
        } catch { }
    }

    return {
        file_count: allFiles.length,
        folder_count,
        total_loc,
        source_loc,
        languages,
        primary_language,
        dependency_count,
        dependencies
    };
}

async function analyzeGit(owner: string, repo: string, token?: string) {
    if (!owner || !repo) {
        throw new Error("Invalid owner/repo");
    }

    const httpsAgent = new https.Agent({ family: 4 });
    const customFetch = (url: any, options: any) => fetch(url, { ...options, agent: httpsAgent });

    const octokit = new Octokit({
        auth: token,
        request: { fetch: customFetch }
    });

    // 1. Repo info
    const repoInfo = await octokit.repos.get({ owner, repo });
    const is_fork = repoInfo.data.fork;

    // 2. Commits First Page
    const commitsResponse = await octokit.repos.listCommits({ owner, repo, per_page: 100 });
    const firstPageData = commitsResponse.data;
    if (firstPageData.length === 0) {
        return {
            commit_count: 0, commit_span_days: 0, active_days_count: 0, commit_spread_ratio: 0,
            avg_commit_size: 0, commit_message_avg_length: 0, conventional_commit_ratio: 0,
            branch_count: 0, feature_branch_count: 0, is_fork, contributor_count: 0,
            top_contributor_percent: 0, commit_sha: null
        };
    }

    const commit_sha = firstPageData[0].sha;
    const latestDateStr = firstPageData[0].commit.author?.date;

    const activeDaysSet = new Set<string>();
    let commitMessageLengths = 0;
    let conventionalCount = 0;

    for (const c of firstPageData) {
        if (c.commit.author?.date) activeDaysSet.add(c.commit.author.date.split('T')[0]);
        const msg = c.commit.message || '';
        commitMessageLengths += msg.length;
        if (/^(feat|fix|chore|docs|style|refactor|perf|test|build|ci)(\([^)]+\))?: /.test(msg)) {
            conventionalCount++;
        }
    }

    // Calculate commit count and find earliest commit via Link header
    let commit_count = firstPageData.length;
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

    let commit_span_days = 0;
    if (latestDateStr && earliestDateStr) {
        const latestDate = new Date(latestDateStr).getTime();
        const earliestDate = new Date(earliestDateStr).getTime();
        commit_span_days = Math.max(0, Math.floor((latestDate - earliestDate) / (1000 * 60 * 60 * 24)));
    }

    const commit_message_avg_length = firstPageData.length > 0 ? (commitMessageLengths / firstPageData.length) : 0;
    const conventional_commit_ratio = firstPageData.length > 0 ? (conventionalCount / firstPageData.length) : 0;
    const commit_spread_ratio = commit_span_days > 0 ? (activeDaysSet.size / commit_span_days) : 0;

    // 3. Branches
    const branchesResponse = await octokit.repos.listBranches({ owner, repo, per_page: 100 });
    const branches = branchesResponse.data;
    let branchCount = branches.length;
    const branchLink = branchesResponse.headers.link;
    if (branchLink) {
        const lastBranchMatch = branchLink.match(/&page=(\d+)>; rel="last"/);
        if (lastBranchMatch) {
            const lb = parseInt(lastBranchMatch[1], 10);
            const lastPageBranches = await octokit.repos.listBranches({ owner, repo, per_page: 100, page: lb });
            branchCount = (lb - 1) * 100 + lastPageBranches.data.length;
        }
    }

    const feature_branch_count = branches.filter(b => /^(feat|feature|bugfix|fix|chore)\//i.test(b.name) || !['main', 'master', 'develop'].includes(b.name)).length;

    // 4. Contributors
    const contributorsRes = await octokit.repos.listContributors({ owner, repo, per_page: 100 });
    const contributors = contributorsRes.data;
    let contributor_count = contributors.length; // Approximated over first page for count
    let top_contributor_percent = 0;
    if (contributors.length > 0) {
        const totalContributions = contributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
        const topContributions = contributors[0].contributions || 0;
        top_contributor_percent = totalContributions > 0 ? (topContributions / totalContributions) * 100 : 0;
    }

    return {
        commit_count,
        commit_span_days,
        active_days_count: activeDaysSet.size, // Approximated over first page
        commit_spread_ratio,
        avg_commit_size: 0, // Not available easily
        commit_message_avg_length,
        conventional_commit_ratio,
        branch_count: branchCount,
        feature_branch_count: feature_branch_count,
        is_fork,
        contributor_count,
        top_contributor_percent,
        commit_sha
    };
}
