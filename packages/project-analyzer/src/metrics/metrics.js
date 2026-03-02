"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRawMetrics = extractRawMetrics;
var path = require("path");
var fs = require("fs/promises");
var ts_morph_1 = require("ts-morph");
var fast_glob_1 = require("fast-glob");
var rest_1 = require("@octokit/rest");
var node_fetch_1 = require("node-fetch");
var https = require("https");
function extractRawMetrics(localPath, repoUrl, token) {
    return __awaiter(this, void 0, void 0, function () {
        var extraction_timestamp, extraction_version, match, owner, repo, cwd, ignore, allFiles, err_1, sourceFiles, testFiles, _a, groupAST, groupArch, groupTest, groupDevOps, groupMeta, groupGit, defaultCodeQuality, defaultArch, defaultTest, defaultDevOps, defaultMeta, defaultGit, resAST, resArch, resTest, resDevOps, resMeta, resGit;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    extraction_timestamp = new Date().toISOString();
                    extraction_version = "1.0.0";
                    match = repoUrl.match(/github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(\.git)?$/);
                    owner = match ? match[1] : '';
                    repo = match ? match[2].replace(/\.git$/, '') : '';
                    cwd = localPath;
                    ignore = ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'];
                    allFiles = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, fast_glob_1.default)('**/*', { cwd: cwd, ignore: ignore, dot: true })];
                case 2:
                    allFiles = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    sourceFiles = allFiles.filter(function (f) { return /\.(js|jsx|ts|tsx)$/.test(f) && !/\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f); });
                    testFiles = allFiles.filter(function (f) { return /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f); });
                    return [4 /*yield*/, Promise.allSettled([
                            analyzeAST(cwd, sourceFiles),
                            analyzeArchitecture(cwd, allFiles, sourceFiles),
                            analyzeTesting(cwd, testFiles, sourceFiles, allFiles),
                            analyzeDevOps(allFiles),
                            analyzeMetadata(cwd, allFiles, sourceFiles),
                            analyzeGit(owner, repo, token)
                        ])];
                case 5:
                    _a = _b.sent(), groupAST = _a[0], groupArch = _a[1], groupTest = _a[2], groupDevOps = _a[3], groupMeta = _a[4], groupGit = _a[5];
                    defaultCodeQuality = { complexity_avg: null, complexity_max: null, long_functions_count: 0, long_files_count: 0, duplication_percent: null, lint_violations_count: null };
                    defaultArch = { folder_structure: [], max_depth: 0, circular_dependencies_count: null, coupling_score: 0 };
                    defaultTest = { test_file_count: 0, test_loc: 0, assertion_count: 0, test_to_code_ratio: 0, coverage_config_present: false, ci_runs_tests: false };
                    defaultDevOps = { ci_config_present: false, deploy_config_present: false, deploy_config_types: [] };
                    defaultMeta = { file_count: 0, folder_count: 0, total_loc: 0, source_loc: 0, languages: {}, primary_language: null, dependency_count: 0, dependencies: [] };
                    defaultGit = { commit_count: 0, commit_span_days: 0, active_days_count: 0, commit_spread_ratio: 0, avg_commit_size: 0, commit_message_avg_length: 0, conventional_commit_ratio: 0, branch_count: 0, feature_branch_count: 0, is_fork: false, contributor_count: 0, top_contributor_percent: 0, commit_sha: null };
                    resAST = groupAST.status === 'fulfilled' ? groupAST.value : defaultCodeQuality;
                    resArch = groupArch.status === 'fulfilled' ? groupArch.value : defaultArch;
                    resTest = groupTest.status === 'fulfilled' ? groupTest.value : defaultTest;
                    resDevOps = groupDevOps.status === 'fulfilled' ? groupDevOps.value : defaultDevOps;
                    resMeta = groupMeta.status === 'fulfilled' ? groupMeta.value : defaultMeta;
                    resGit = groupGit.status === 'fulfilled' ? groupGit.value : defaultGit;
                    return [2 /*return*/, __assign(__assign(__assign(__assign(__assign(__assign({}, resAST), resArch), resTest), resDevOps), resMeta), { commit_count: resGit.commit_count, commit_span_days: resGit.commit_span_days, active_days_count: resGit.active_days_count, commit_spread_ratio: resGit.commit_spread_ratio, avg_commit_size: resGit.avg_commit_size, commit_message_avg_length: resGit.commit_message_avg_length, conventional_commit_ratio: resGit.conventional_commit_ratio, branch_count: resGit.branch_count, feature_branch_count: resGit.feature_branch_count, is_fork: resGit.is_fork, contributor_count: resGit.contributor_count, top_contributor_percent: resGit.top_contributor_percent, commit_sha: resGit.commit_sha, extraction_timestamp: extraction_timestamp, extraction_version: extraction_version })];
            }
        });
    });
}
function analyzeAST(cwd, sourceFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var project, totalComplexity, functionCount, complexity_max, long_functions_count, long_files_count, _loop_1, _i, _a, sf;
        return __generator(this, function (_b) {
            project = new ts_morph_1.Project();
            project.addSourceFilesAtPaths(sourceFiles.map(function (f) { return path.join(cwd, f); }));
            totalComplexity = 0;
            functionCount = 0;
            complexity_max = 0;
            long_functions_count = 0;
            long_files_count = 0;
            _loop_1 = function (sf) {
                var lines = sf.getEndLineNumber();
                if (lines > 500)
                    long_files_count++;
                // gather functions
                var funcs = __spreadArray(__spreadArray([], sf.getFunctions(), true), sf.getClasses().flatMap(function (c) { return c.getMethods(); }), true);
                // Also catch arrow functions assigned to variables
                sf.forEachDescendant(function (node) {
                    if (node.isKind(ts_morph_1.SyntaxKind.ArrowFunction) || node.isKind(ts_morph_1.SyntaxKind.FunctionExpression)) {
                        funcs.push(node);
                    }
                });
                var _loop_2 = function (f) {
                    if (!f.getBody)
                        return "continue"; // safety
                    var startLine = f.getStartLineNumber();
                    var endLine = f.getEndLineNumber();
                    if ((endLine - startLine) > 50)
                        long_functions_count++;
                    var complexity = 1;
                    f.forEachDescendant(function (node) {
                        switch (node.getKind()) {
                            case ts_morph_1.SyntaxKind.IfStatement:
                            case ts_morph_1.SyntaxKind.WhileStatement:
                            case ts_morph_1.SyntaxKind.ForStatement:
                            case ts_morph_1.SyntaxKind.ForInStatement:
                            case ts_morph_1.SyntaxKind.ForOfStatement:
                            case ts_morph_1.SyntaxKind.ConditionalExpression:
                            case ts_morph_1.SyntaxKind.CatchClause:
                            case ts_morph_1.SyntaxKind.CaseClause:
                                complexity++;
                                break;
                        }
                    });
                    totalComplexity += complexity;
                    functionCount++;
                    if (complexity > complexity_max)
                        complexity_max = complexity;
                };
                for (var _c = 0, funcs_1 = funcs; _c < funcs_1.length; _c++) {
                    var f = funcs_1[_c];
                    _loop_2(f);
                }
            };
            for (_i = 0, _a = project.getSourceFiles(); _i < _a.length; _i++) {
                sf = _a[_i];
                _loop_1(sf);
            }
            return [2 /*return*/, {
                    complexity_avg: functionCount > 0 ? (totalComplexity / functionCount) : null,
                    complexity_max: functionCount > 0 ? complexity_max : null,
                    long_functions_count: long_functions_count,
                    long_files_count: long_files_count,
                    duplication_percent: null,
                    lint_violations_count: null
                }];
        });
    });
}
function analyzeArchitecture(cwd, allFiles, sourceFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var folders, max_depth, _i, allFiles_1, f, parts, totalImports, _a, sourceFiles_1, f, content, importMatches, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    folders = new Set();
                    max_depth = 0;
                    for (_i = 0, allFiles_1 = allFiles; _i < allFiles_1.length; _i++) {
                        f = allFiles_1[_i];
                        parts = f.split('/');
                        if (parts.length > 1) {
                            folders.add(parts[0]);
                        }
                        if (parts.length > max_depth) {
                            max_depth = parts.length;
                        }
                    }
                    totalImports = 0;
                    _a = 0, sourceFiles_1 = sourceFiles;
                    _c.label = 1;
                case 1:
                    if (!(_a < sourceFiles_1.length)) return [3 /*break*/, 6];
                    f = sourceFiles_1[_a];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(path.join(cwd, f), 'utf-8')];
                case 3:
                    content = _c.sent();
                    importMatches = content.match(/^(?:import|export)\s+.*\s+from\s+['"].*['"];?|require\(['"].*['"]\)/gm);
                    if (importMatches) {
                        totalImports += importMatches.length;
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _b = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _a++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, {
                        folder_structure: Array.from(folders),
                        max_depth: max_depth > 0 ? max_depth - 1 : 0, // depth 0 means root
                        circular_dependencies_count: null,
                        coupling_score: sourceFiles.length > 0 ? (totalImports / sourceFiles.length) : 0
                    }];
            }
        });
    });
}
function analyzeTesting(cwd, testFiles, sourceFiles, allFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var test_loc, assertion_count, _i, testFiles_1, f, content, asserts, _a, source_loc, _b, sourceFiles_2, f, content, _c, coverage_config_present, ci_runs_tests;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    test_loc = 0;
                    assertion_count = 0;
                    _i = 0, testFiles_1 = testFiles;
                    _d.label = 1;
                case 1:
                    if (!(_i < testFiles_1.length)) return [3 /*break*/, 6];
                    f = testFiles_1[_i];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(path.join(cwd, f), 'utf-8')];
                case 3:
                    content = _d.sent();
                    test_loc += content.split('\n').length;
                    asserts = content.match(/\b(expect|assert|should)\b/g);
                    if (asserts)
                        assertion_count += asserts.length;
                    return [3 /*break*/, 5];
                case 4:
                    _a = _d.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    source_loc = 0;
                    _b = 0, sourceFiles_2 = sourceFiles;
                    _d.label = 7;
                case 7:
                    if (!(_b < sourceFiles_2.length)) return [3 /*break*/, 12];
                    f = sourceFiles_2[_b];
                    _d.label = 8;
                case 8:
                    _d.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, fs.readFile(path.join(cwd, f), 'utf-8')];
                case 9:
                    content = _d.sent();
                    source_loc += content.split('\n').length;
                    return [3 /*break*/, 11];
                case 10:
                    _c = _d.sent();
                    return [3 /*break*/, 11];
                case 11:
                    _b++;
                    return [3 /*break*/, 7];
                case 12:
                    coverage_config_present = allFiles.some(function (f) { return /jest\.config|vitest\.config|nyc\.config|\.nycrc|codecov\.yml/.test(f); });
                    ci_runs_tests = allFiles.some(function (f) { return /\.github\/workflows\/.*\.yml$/.test(f) || /\.gitlab-ci\.yml$/.test(f) || /circleci\/config\.yml$/.test(f); });
                    return [2 /*return*/, {
                            test_file_count: testFiles.length,
                            test_loc: test_loc,
                            assertion_count: assertion_count,
                            test_to_code_ratio: source_loc > 0 ? (test_loc / source_loc) : 0,
                            coverage_config_present: coverage_config_present,
                            ci_runs_tests: ci_runs_tests
                        }];
            }
        });
    });
}
function analyzeDevOps(allFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var ci_config_present, deploy_config_types;
        return __generator(this, function (_a) {
            ci_config_present = allFiles.some(function (f) { return /\.github\/workflows\/.*\.yml$/.test(f) || /\.gitlab-ci\.yml$/.test(f) || /circleci\/config\.yml$/.test(f); });
            deploy_config_types = [];
            if (allFiles.some(function (f) { return /Dockerfile/.test(f); }))
                deploy_config_types.push('Docker');
            if (allFiles.some(function (f) { return /docker-compose\.yml/.test(f); }))
                deploy_config_types.push('Docker Compose');
            if (allFiles.some(function (f) { return /vercel\.json/.test(f); }))
                deploy_config_types.push('Vercel');
            if (allFiles.some(function (f) { return /netlify\.toml/.test(f); }))
                deploy_config_types.push('Netlify');
            if (allFiles.some(function (f) { return /Procfile/.test(f); }))
                deploy_config_types.push('Heroku');
            if (allFiles.some(function (f) { return /\.aws\/|serverless\.yml/.test(f); }))
                deploy_config_types.push('AWS');
            return [2 /*return*/, {
                    ci_config_present: ci_config_present,
                    deploy_config_present: deploy_config_types.length > 0,
                    deploy_config_types: deploy_config_types
                }];
        });
    });
}
function analyzeMetadata(cwd, allFiles, sourceFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var folder_count, total_loc, source_loc, languages, binaryExts, _i, allFiles_2, f, ext, stat, loc, content, _a, primary_language, maxLoc, _b, _c, _d, ext, loc, dependency_count, dependencies, pjsonPath, pjson, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    folder_count = new Set(allFiles.map(function (f) { return path.dirname(f); })).size;
                    total_loc = 0;
                    source_loc = 0;
                    languages = {};
                    binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.tar', '.gz', '.wasm', '.map', '.mp4', '.mp3', '.woff', '.woff2', '.ttf', '.eot']);
                    _i = 0, allFiles_2 = allFiles;
                    _h.label = 1;
                case 1:
                    if (!(_i < allFiles_2.length)) return [3 /*break*/, 8];
                    f = allFiles_2[_i];
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 6, , 7]);
                    ext = path.extname(f).toLowerCase();
                    return [4 /*yield*/, fs.stat(path.join(cwd, f))];
                case 3:
                    stat = _h.sent();
                    if (!stat.isFile())
                        return [3 /*break*/, 7];
                    loc = 0;
                    if (!!binaryExts.has(ext)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fs.readFile(path.join(cwd, f), 'utf-8')];
                case 4:
                    content = _h.sent();
                    loc = content.split('\n').length;
                    total_loc += loc;
                    _h.label = 5;
                case 5:
                    if (ext) {
                        languages[ext] = (languages[ext] || 0) + loc;
                    }
                    if (sourceFiles.includes(f)) {
                        source_loc += loc;
                    }
                    return [3 /*break*/, 7];
                case 6:
                    _a = _h.sent();
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8:
                    primary_language = null;
                    maxLoc = 0;
                    for (_b = 0, _c = Object.entries(languages); _b < _c.length; _b++) {
                        _d = _c[_b], ext = _d[0], loc = _d[1];
                        if (loc > maxLoc) {
                            maxLoc = loc;
                            primary_language = ext.replace('.', '');
                        }
                    }
                    dependency_count = 0;
                    dependencies = [];
                    pjsonPath = allFiles.find(function (f) { return f === 'package.json'; });
                    if (!pjsonPath) return [3 /*break*/, 12];
                    _h.label = 9;
                case 9:
                    _h.trys.push([9, 11, , 12]);
                    _f = (_e = JSON).parse;
                    return [4 /*yield*/, fs.readFile(path.join(cwd, pjsonPath), 'utf-8')];
                case 10:
                    pjson = _f.apply(_e, [_h.sent()]);
                    if (pjson.dependencies) {
                        dependencies.push.apply(dependencies, Object.keys(pjson.dependencies));
                    }
                    if (pjson.devDependencies) {
                        dependencies.push.apply(dependencies, Object.keys(pjson.devDependencies));
                    }
                    dependency_count = dependencies.length;
                    return [3 /*break*/, 12];
                case 11:
                    _g = _h.sent();
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, {
                        file_count: allFiles.length,
                        folder_count: folder_count,
                        total_loc: total_loc,
                        source_loc: source_loc,
                        languages: languages,
                        primary_language: primary_language,
                        dependency_count: dependency_count,
                        dependencies: dependencies
                    }];
            }
        });
    });
}
function analyzeGit(owner, repo, token) {
    return __awaiter(this, void 0, void 0, function () {
        var httpsAgent, customFetch, octokit, repoInfo, is_fork, commitsResponse, firstPageData, commit_sha, latestDateStr, activeDaysSet, commitMessageLengths, conventionalCount, _i, firstPageData_1, c, msg, commit_count, earliestDateStr, linkHeader, lastPageMatch, lastPage, lastPageCommits, earliestCommit, commit_span_days, latestDate, earliestDate, commit_message_avg_length, conventional_commit_ratio, commit_spread_ratio, branchesResponse, branches, branchCount, branchLink, lastBranchMatch, lb, lastPageBranches, feature_branch_count, contributorsRes, contributors, contributor_count, top_contributor_percent, totalContributions, topContributions;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!owner || !repo) {
                        throw new Error("Invalid owner/repo");
                    }
                    httpsAgent = new https.Agent({ family: 4 });
                    customFetch = function (url, options) { return (0, node_fetch_1.default)(url, __assign(__assign({}, options), { agent: httpsAgent })); };
                    octokit = new rest_1.Octokit({
                        auth: token,
                        request: { fetch: customFetch }
                    });
                    return [4 /*yield*/, octokit.repos.get({ owner: owner, repo: repo })];
                case 1:
                    repoInfo = _e.sent();
                    is_fork = repoInfo.data.fork;
                    return [4 /*yield*/, octokit.repos.listCommits({ owner: owner, repo: repo, per_page: 100 })];
                case 2:
                    commitsResponse = _e.sent();
                    firstPageData = commitsResponse.data;
                    if (firstPageData.length === 0) {
                        return [2 /*return*/, {
                                commit_count: 0, commit_span_days: 0, active_days_count: 0, commit_spread_ratio: 0,
                                avg_commit_size: 0, commit_message_avg_length: 0, conventional_commit_ratio: 0,
                                branch_count: 0, feature_branch_count: 0,
                                is_fork: is_fork,
                                contributor_count: 0,
                                top_contributor_percent: 0, commit_sha: null
                            }];
                    }
                    commit_sha = firstPageData[0].sha;
                    latestDateStr = (_a = firstPageData[0].commit.author) === null || _a === void 0 ? void 0 : _a.date;
                    activeDaysSet = new Set();
                    commitMessageLengths = 0;
                    conventionalCount = 0;
                    for (_i = 0, firstPageData_1 = firstPageData; _i < firstPageData_1.length; _i++) {
                        c = firstPageData_1[_i];
                        if ((_b = c.commit.author) === null || _b === void 0 ? void 0 : _b.date)
                            activeDaysSet.add(c.commit.author.date.split('T')[0]);
                        msg = c.commit.message || '';
                        commitMessageLengths += msg.length;
                        if (/^(feat|fix|chore|docs|style|refactor|perf|test|build|ci)(\([^)]+\))?: /.test(msg)) {
                            conventionalCount++;
                        }
                    }
                    commit_count = firstPageData.length;
                    earliestDateStr = (_c = firstPageData[firstPageData.length - 1].commit.author) === null || _c === void 0 ? void 0 : _c.date;
                    linkHeader = commitsResponse.headers.link;
                    if (!linkHeader) return [3 /*break*/, 4];
                    lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
                    if (!lastPageMatch) return [3 /*break*/, 4];
                    lastPage = parseInt(lastPageMatch[1], 10);
                    commit_count = (lastPage - 1) * 100;
                    return [4 /*yield*/, octokit.repos.listCommits({ owner: owner, repo: repo, per_page: 100, page: lastPage })];
                case 3:
                    lastPageCommits = _e.sent();
                    commit_count += lastPageCommits.data.length;
                    earliestCommit = lastPageCommits.data[lastPageCommits.data.length - 1];
                    if ((_d = earliestCommit === null || earliestCommit === void 0 ? void 0 : earliestCommit.commit.author) === null || _d === void 0 ? void 0 : _d.date) {
                        earliestDateStr = earliestCommit.commit.author.date;
                    }
                    _e.label = 4;
                case 4:
                    commit_span_days = 0;
                    if (latestDateStr && earliestDateStr) {
                        latestDate = new Date(latestDateStr).getTime();
                        earliestDate = new Date(earliestDateStr).getTime();
                        commit_span_days = Math.max(0, Math.floor((latestDate - earliestDate) / (1000 * 60 * 60 * 24)));
                    }
                    commit_message_avg_length = firstPageData.length > 0 ? (commitMessageLengths / firstPageData.length) : 0;
                    conventional_commit_ratio = firstPageData.length > 0 ? (conventionalCount / firstPageData.length) : 0;
                    commit_spread_ratio = commit_span_days > 0 ? (activeDaysSet.size / commit_span_days) : 0;
                    return [4 /*yield*/, octokit.repos.listBranches({ owner: owner, repo: repo, per_page: 100 })];
                case 5:
                    branchesResponse = _e.sent();
                    branches = branchesResponse.data;
                    branchCount = branches.length;
                    branchLink = branchesResponse.headers.link;
                    if (!branchLink) return [3 /*break*/, 7];
                    lastBranchMatch = branchLink.match(/&page=(\d+)>; rel="last"/);
                    if (!lastBranchMatch) return [3 /*break*/, 7];
                    lb = parseInt(lastBranchMatch[1], 10);
                    return [4 /*yield*/, octokit.repos.listBranches({ owner: owner, repo: repo, per_page: 100, page: lb })];
                case 6:
                    lastPageBranches = _e.sent();
                    branchCount = (lb - 1) * 100 + lastPageBranches.data.length;
                    _e.label = 7;
                case 7:
                    feature_branch_count = branches.filter(function (b) { return /^(feat|feature|bugfix|fix|chore|hotfix)\//i.test(b.name); }).length;
                    return [4 /*yield*/, octokit.repos.listContributors({ owner: owner, repo: repo, per_page: 100 })];
                case 8:
                    contributorsRes = _e.sent();
                    contributors = contributorsRes.data;
                    contributor_count = contributors.length;
                    top_contributor_percent = 0;
                    if (contributors.length > 0) {
                        totalContributions = contributors.reduce(function (sum, c) { return sum + (c.contributions || 0); }, 0);
                        topContributions = contributors[0].contributions || 0;
                        top_contributor_percent = totalContributions > 0 ? (topContributions / totalContributions) * 100 : 0;
                    }
                    return [2 /*return*/, {
                            commit_count: commit_count,
                            commit_span_days: commit_span_days,
                            active_days_count: activeDaysSet.size, // Approximated over first page
                            commit_spread_ratio: commit_spread_ratio,
                            avg_commit_size: 0, // Not available easily
                            commit_message_avg_length: commit_message_avg_length,
                            conventional_commit_ratio: conventional_commit_ratio,
                            branch_count: branchCount,
                            feature_branch_count: feature_branch_count,
                            is_fork: is_fork,
                            contributor_count: contributor_count,
                            top_contributor_percent: top_contributor_percent,
                            commit_sha: commit_sha
                        }];
            }
        });
    });
}
