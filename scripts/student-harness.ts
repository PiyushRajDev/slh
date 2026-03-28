/**
 * SLH Student Profile Harness
 *
 * Reads a Google Spreadsheet containing student coding profiles,
 * routes each to the appropriate analysis pipeline, and outputs
 * structured JSON + CSV results.
 *
 * Pipelines invoked:
 *   - LeetCode:         FullProfileScraper.fetch(username)
 *   - Codeforces:       extractCFProfile(handle)
 *   - Project Analyzer: runPipeline(repoUrl, githubToken)
 *
 * Usage:
 *   npx tsx --env-file=apps/api/.env scripts/student-harness.ts --file=scripts/students.xlsx
 *   npx tsx --env-file=apps/api/.env scripts/student-harness.ts --sheet-id=1abc...xyz
 *   npx tsx --env-file=apps/api/.env scripts/student-harness.ts --file=scripts/data.csv --max-students=5
 *   npx tsx --env-file=apps/api/.env scripts/student-harness.ts --file=scripts/data.xlsx --skip-github
 *   npx tsx --env-file=apps/api/.env scripts/student-harness.ts --skip-leetcode
 *   npx tsx --env-file=apps/api/.env scripts/student-harness.ts --skip-codeforces
 */

import { LeetCodeClient } from '../packages/leetcode-core/src/client/leetcode.client';
import { FullProfileScraper } from '../packages/leetcode-core/src/scraper/fullProfile.scraper';
import { extractCFProfile } from '../packages/codeforces/src/core/extractor.core';
import { runPipeline } from '../packages/project-analyzer/src/pipeline/pipeline';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as XLSX from 'xlsx';

// ─── Config ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function arg(name: string): string | undefined {
    const match = args.find(a => a.startsWith(`--${name}=`));
    return match?.split('=').slice(1).join('=');
}

const LOCAL_FILE = arg('file') || '';
const SHEET_ID = arg('sheet-id') || process.env.SHEET_ID || '';
const MAX_STUDENTS = parseInt(arg('max-students') ?? '999');
const MAX_REPOS_PER_STUDENT = parseInt(arg('max-repos') ?? '5');
const SKIP_GITHUB = args.includes('--skip-github');
const SKIP_LEETCODE = args.includes('--skip-leetcode');
const SKIP_CODEFORCES = args.includes('--skip-codeforces');
const VERBOSE = args.includes('--verbose');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentRecord {
    rowIndex: number;
    timestamp: string;
    name: string;
    uid: string;
    email: string;
    leetcodeUrl: string;
    leetcodeUsername: string;
    githubUrl: string;
    githubUsername: string;
    codeforcesUrl: string;
    codeforcesHandle: string;
    city: string;
}

interface LeetCodeResult {
    success: boolean;
    data?: any;
    error?: string;
    durationMs: number;
}

interface CodeforcesResult {
    success: boolean;
    data?: any;
    error?: string;
    durationMs: number;
}

interface GitHubRepoResult {
    repoUrl: string;
    repoName: string;
    success: boolean;
    profileId?: string;
    score?: number;
    confidenceLevel?: string;
    error?: string;
    durationMs: number;
}

interface GitHubResult {
    reposAnalyzed: number;
    repos: GitHubRepoResult[];
    bestScore: number;
    bestProfile: string;
    avgScore: number;
}

interface StudentResult {
    student: StudentRecord;
    leetcode: LeetCodeResult | null;
    codeforces: CodeforcesResult | null;
    github: GitHubResult | null;
    totalDurationMs: number;
}

// ─── URL Parsers ──────────────────────────────────────────────────────────────

function parseLeetCodeUsername(url: string): string {
    if (!url) return '';
    // Handles: https://leetcode.com/u/username/ or https://leetcode.com/username/
    const match = url.trim().match(/leetcode\.com\/(?:u\/)?([^\/\?#]+)/i);
    return match?.[1] || '';
}

function parseGitHubUsername(url: string): string {
    if (!url) return '';
    // Handles: https://github.com/username or https://github.com/username/
    const match = url.trim().match(/github\.com\/([a-zA-Z0-9_.-]+)/i);
    return match?.[1] || '';
}

function parseCodeforcesHandle(url: string): string {
    if (!url) return '';
    // Handles: https://codeforces.com/profile/handle
    const match = url.trim().match(/codeforces\.com\/profile\/([^\/\?#]+)/i);
    return match?.[1] || '';
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                current += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                fields.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
    }
    fields.push(current.trim());
    return fields;
}

function parseSpreadsheetCSV(csv: string): StudentRecord[] {
    const lines = csv.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) {
        throw new Error('Spreadsheet has no data rows');
    }

    // Parse header to detect column positions dynamically
    const header = parseCSVLine(lines[0]).map(h => h.toLowerCase());

    const colIndex = (keywords: string[]): number => {
        return header.findIndex(h =>
            keywords.some(kw => h.includes(kw))
        );
    };

    const iTimestamp = colIndex(['timestamp', 'time']);
    const iName = colIndex(['name']);
    const iUID = colIndex(['uid', 'roll', 'id']);
    const iEmail = colIndex(['email']);
    const iLeetcode = colIndex(['leetcode']);
    const iGithub = colIndex(['github']);
    const iCodeforces = colIndex(['codeforces']);
    const iCity = colIndex(['city']);

    const students: StudentRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 3) continue; // skip malformed rows

        const get = (idx: number): string => (idx >= 0 && idx < cols.length) ? cols[idx] : '';

        const leetcodeUrl = get(iLeetcode);
        const githubUrl = get(iGithub);
        const codeforcesUrl = get(iCodeforces);

        students.push({
            rowIndex: i + 1,
            timestamp: get(iTimestamp),
            name: get(iName),
            uid: get(iUID),
            email: get(iEmail),
            leetcodeUrl,
            leetcodeUsername: parseLeetCodeUsername(leetcodeUrl),
            githubUrl,
            githubUsername: parseGitHubUsername(githubUrl),
            codeforcesUrl,
            codeforcesHandle: parseCodeforcesHandle(codeforcesUrl),
            city: get(iCity),
        });
    }

    return students;
}

// ─── XLSX File Parser ─────────────────────────────────────────────────────────

function parseXLSXFile(filePath: string): StudentRecord[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to array of arrays (each row = string[])
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as string[][];

    if (rows.length < 2) {
        throw new Error('Spreadsheet has no data rows');
    }

    const header = rows[0].map(h => String(h).toLowerCase());

    const colIndex = (keywords: string[]): number => {
        return header.findIndex(h =>
            keywords.some(kw => h.includes(kw))
        );
    };

    const iTimestamp = colIndex(['timestamp', 'time']);
    const iName = colIndex(['name']);
    const iUID = colIndex(['uid', 'roll', 'id']);
    const iEmail = colIndex(['email']);
    const iLeetcode = colIndex(['leetcode']);
    const iGithub = colIndex(['github']);
    const iCodeforces = colIndex(['codeforces']);
    const iCity = colIndex(['city']);

    const students: StudentRecord[] = [];

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].map(c => String(c ?? ''));
        if (cols.length < 3 || cols.every(c => !c.trim())) continue;

        const get = (idx: number): string => (idx >= 0 && idx < cols.length) ? cols[idx] : '';

        const leetcodeUrl = get(iLeetcode);
        const githubUrl = get(iGithub);
        const codeforcesUrl = get(iCodeforces);

        students.push({
            rowIndex: i + 1,
            timestamp: get(iTimestamp),
            name: get(iName),
            uid: get(iUID),
            email: get(iEmail),
            leetcodeUrl,
            leetcodeUsername: parseLeetCodeUsername(leetcodeUrl),
            githubUrl,
            githubUsername: parseGitHubUsername(githubUrl),
            codeforcesUrl,
            codeforcesHandle: parseCodeforcesHandle(codeforcesUrl),
            city: get(iCity),
        });
    }

    return students;
}

// ─── Spreadsheet Fetcher ──────────────────────────────────────────────────────

async function fetchSpreadsheet(sheetId: string): Promise<string> {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    console.log(`  Fetching: ${url.slice(0, 80)}...`);

    const res = await fetch(url, {
        headers: { 'User-Agent': 'SLH-Student-Harness/1.0' },
        redirect: 'follow',
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch spreadsheet: HTTP ${res.status} — make sure the sheet is shared as "Anyone with the link"`);
    }

    return res.text();
}

// ─── GitHub API Helper ────────────────────────────────────────────────────────

async function fetchGitHubRepos(username: string): Promise<{ html_url: string; name: string; pushed_at: string; fork: boolean; size: number }[]> {
    const url = `https://api.github.com/users/${username}/repos?type=owner&sort=pushed&per_page=20`;
    const headers: Record<string, string> = {
        'User-Agent': 'SLH-Student-Harness/1.0',
        'Accept': 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
        throw new Error(`GitHub API ${res.status} for ${username}`);
    }
    const repos = await res.json() as any[];

    // Filter out forks, sort by pushed_at desc, take top N
    return repos
        .filter((r: any) => !r.fork && r.size > 0)
        .sort((a: any, b: any) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
        .slice(0, MAX_REPOS_PER_STUDENT);
}

// ─── Pipeline Runners ─────────────────────────────────────────────────────────

async function runLeetCode(username: string): Promise<LeetCodeResult> {
    const start = Date.now();
    try {
        const client = new LeetCodeClient();
        const scraper = new FullProfileScraper(client);
        const data = await scraper.fetch(username);
        return { success: true, data, durationMs: Date.now() - start };
    } catch (err: any) {
        return { success: false, error: err.message, durationMs: Date.now() - start };
    }
}

async function runCodeforces(handle: string): Promise<CodeforcesResult> {
    const start = Date.now();
    try {
        const data = await extractCFProfile(handle);
        return { success: true, data, durationMs: Date.now() - start };
    } catch (err: any) {
        return { success: false, error: err.message, durationMs: Date.now() - start };
    }
}

async function runGitHub(username: string): Promise<GitHubResult> {
    const empty: GitHubResult = { reposAnalyzed: 0, repos: [], bestScore: 0, bestProfile: 'none', avgScore: 0 };

    try {
        const repos = await fetchGitHubRepos(username);
        if (repos.length === 0) return empty;

        const results: GitHubRepoResult[] = [];

        for (const repo of repos) {
            const start = Date.now();
            try {
                const output = await runPipeline(repo.html_url, GITHUB_TOKEN || undefined);
                if (output.success) {
                    results.push({
                        repoUrl: repo.html_url,
                        repoName: repo.name,
                        success: true,
                        profileId: output.report.summary.profileId,
                        score: output.report.summary.overallScore,
                        confidenceLevel: output.report.summary.confidenceLevel,
                        durationMs: Date.now() - start,
                    });
                } else {
                    const errOutput = output as { success: false; error: string; stage: string };
                    results.push({
                        repoUrl: repo.html_url,
                        repoName: repo.name,
                        success: false,
                        error: errOutput.error,
                        durationMs: Date.now() - start,
                    });
                }
            } catch (err: any) {
                results.push({
                    repoUrl: repo.html_url,
                    repoName: repo.name,
                    success: false,
                    error: err.message,
                    durationMs: Date.now() - start,
                });
            }

            // Small delay between clone operations
            await sleep(500);
        }

        const successful = results.filter(r => r.success && r.score != null);
        const bestRepo = successful.sort((a, b) => (b.score || 0) - (a.score || 0))[0];

        return {
            reposAnalyzed: results.length,
            repos: results,
            bestScore: bestRepo?.score || 0,
            bestProfile: bestRepo?.profileId || 'none',
            avgScore: successful.length > 0
                ? Math.round(successful.reduce((s, r) => s + (r.score || 0), 0) / successful.length)
                : 0,
        };
    } catch (err: any) {
        return { ...empty, repos: [{ repoUrl: '', repoName: '', success: false, error: err.message, durationMs: 0 }] };
    }
}

// ─── Output Writers ───────────────────────────────────────────────────────────

function writeJSON(results: StudentResult[], outDir: string) {
    const filePath = path.join(outDir, 'student-results.json');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`  📄 JSON: ${filePath}`);
}

function writeCSV(results: StudentResult[], outDir: string) {
    const filePath = path.join(outDir, 'student-summary.csv');
    const headers = [
        'Name', 'UID', 'Email',
        'LC_Username', 'LC_Total', 'LC_Easy', 'LC_Medium', 'LC_Hard', 'LC_Ranking', 'LC_Contests', 'LC_Status',
        'CF_Handle', 'CF_Rating', 'CF_MaxRating', 'CF_Rank', 'CF_Contests', 'CF_Submissions', 'CF_Status',
        'GH_Username', 'GH_ReposAnalyzed', 'GH_BestScore', 'GH_BestProfile', 'GH_AvgScore', 'GH_Status',
        'Duration_Sec',
    ];

    const rows = results.map(r => {
        const lc = r.leetcode?.data;
        const cf = r.codeforces?.data;
        return [
            csvEscape(r.student.name),
            csvEscape(r.student.uid),
            csvEscape(r.student.email),
            // LeetCode
            csvEscape(r.student.leetcodeUsername),
            lc?.difficultyStats?.total ?? '',
            lc?.difficultyStats?.easy ?? '',
            lc?.difficultyStats?.medium ?? '',
            lc?.difficultyStats?.hard ?? '',
            lc?.profile?.ranking ?? '',
            lc?.contest?.attendedContestsCount ?? '',
            r.leetcode ? (r.leetcode.success ? 'OK' : `ERR: ${r.leetcode.error?.slice(0, 50)}`) : 'SKIPPED',
            // Codeforces
            csvEscape(r.student.codeforcesHandle),
            cf?.profile?.rating ?? '',
            cf?.profile?.maxRating ?? '',
            cf?.profile?.rank ?? '',
            cf?.ratingHistory?.length ?? '',
            cf?.submissionCount ?? '',
            r.codeforces ? (r.codeforces.success ? 'OK' : `ERR: ${r.codeforces.error?.slice(0, 50)}`) : 'SKIPPED',
            // GitHub
            csvEscape(r.student.githubUsername),
            r.github?.reposAnalyzed ?? '',
            r.github?.bestScore ?? '',
            r.github?.bestProfile ?? '',
            r.github?.avgScore ?? '',
            r.github ? 'OK' : 'SKIPPED',
            // Duration
            (r.totalDurationMs / 1000).toFixed(1),
        ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(filePath, csv);
    console.log(`  📊 CSV: ${filePath}`);
}

function csvEscape(s: string): string {
    if (!s) return '';
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function printStudentResult(r: StudentResult, idx: number, total: number) {
    const emoji = (ok: boolean | null) => ok === null ? '⏭️' : ok ? '✅' : '❌';

    console.log(`\n${'─'.repeat(72)}`);
    console.log(`[${idx + 1}/${total}] ${r.student.name} (${r.student.uid})`);
    console.log(`  Email   : ${r.student.email}`);

    if (r.leetcode) {
        const lc = r.leetcode;
        const d = lc.data;
        console.log(`  ${emoji(lc.success)} LeetCode : ${r.student.leetcodeUsername} — ${
            lc.success
                ? `${d.difficultyStats.total} solved (E:${d.difficultyStats.easy} M:${d.difficultyStats.medium} H:${d.difficultyStats.hard}), rank #${d.profile.ranking ?? '?'}`
                : `ERROR: ${lc.error}`
        } (${(lc.durationMs / 1000).toFixed(1)}s)`);
    } else {
        console.log(`  ⏭️  LeetCode : skipped (no username)`);
    }

    if (r.codeforces) {
        const cf = r.codeforces;
        const d = cf.data;
        console.log(`  ${emoji(cf.success)} Codeforces: ${r.student.codeforcesHandle} — ${
            cf.success
                ? `rating ${d.profile?.rating ?? '?'} (max: ${d.profile?.maxRating ?? '?'}), ${d.submissionCount} submissions`
                : `ERROR: ${cf.error}`
        } (${(cf.durationMs / 1000).toFixed(1)}s)`);
    } else {
        console.log(`  ⏭️  Codeforces: skipped (no handle)`);
    }

    if (r.github) {
        const gh = r.github;
        console.log(`  ${emoji(gh.reposAnalyzed > 0)} GitHub    : ${r.student.githubUsername} — ${gh.reposAnalyzed} repos, best: ${gh.bestScore}/100 (${gh.bestProfile}), avg: ${gh.avgScore}/100`);
        if (VERBOSE) {
            for (const repo of gh.repos) {
                console.log(`       ${emoji(repo.success)} ${repo.repoName}: ${repo.success ? `${repo.score}/100 (${repo.profileId})` : repo.error} (${(repo.durationMs / 1000).toFixed(1)}s)`);
            }
        }
    } else {
        console.log(`  ⏭️  GitHub    : skipped (no username)`);
    }

    console.log(`  ⏱  Total: ${(r.totalDurationMs / 1000).toFixed(1)}s`);
}

function printSummary(results: StudentResult[]) {
    console.log(`\n${'═'.repeat(72)}`);
    console.log('  STUDENT PROFILE HARNESS — SUMMARY');
    console.log(`${'═'.repeat(72)}\n`);

    const total = results.length;
    const lcOk = results.filter(r => r.leetcode?.success).length;
    const lcFail = results.filter(r => r.leetcode && !r.leetcode.success).length;
    const lcSkip = results.filter(r => !r.leetcode).length;

    const cfOk = results.filter(r => r.codeforces?.success).length;
    const cfFail = results.filter(r => r.codeforces && !r.codeforces.success).length;
    const cfSkip = results.filter(r => !r.codeforces).length;

    const ghOk = results.filter(r => r.github && r.github.reposAnalyzed > 0).length;
    const ghSkip = results.filter(r => !r.github).length;

    console.log(`  Students processed : ${total}`);
    console.log(`  LeetCode           : ✅ ${lcOk}  ❌ ${lcFail}  ⏭️  ${lcSkip}`);
    console.log(`  Codeforces         : ✅ ${cfOk}  ❌ ${cfFail}  ⏭️  ${cfSkip}`);
    console.log(`  GitHub             : ✅ ${ghOk}  ⏭️  ${ghSkip}`);

    const totalTime = results.reduce((s, r) => s + r.totalDurationMs, 0);
    console.log(`  Total time         : ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`${'─'.repeat(72)}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('━'.repeat(72));
    console.log('  SLH Student Profile Harness');
    console.log('━'.repeat(72));

    if (!LOCAL_FILE && !SHEET_ID) {
        console.error('\n  ❌ No data source provided.');
        console.error('  Usage:');
        console.error('    npx tsx --env-file=apps/api/.env scripts/student-harness.ts --file=scripts/students.xlsx');
        console.error('    npx tsx --env-file=apps/api/.env scripts/student-harness.ts --sheet-id=YOUR_SHEET_ID\n');
        process.exit(1);
    }

    console.log(`  Source        : ${LOCAL_FILE ? `file: ${LOCAL_FILE}` : `sheet: ${SHEET_ID.slice(0, 20)}...`}`);
    console.log(`  Max students  : ${MAX_STUDENTS}`);
    console.log(`  Max repos/user: ${MAX_REPOS_PER_STUDENT}`);
    console.log(`  Skip GitHub   : ${SKIP_GITHUB}`);
    console.log(`  Skip LeetCode : ${SKIP_LEETCODE}`);
    console.log(`  Skip Codeforces: ${SKIP_CODEFORCES}`);
    console.log(`  GitHub token  : ${GITHUB_TOKEN ? 'present' : 'MISSING'}\n`);

    // Phase 1: Load & parse student data
    console.log('📄 Phase 1: Loading student data...');
    let students: StudentRecord[];

    if (LOCAL_FILE) {
        const absPath = path.resolve(LOCAL_FILE);
        if (!fs.existsSync(absPath)) {
            console.error(`  ❌ File not found: ${absPath}`);
            process.exit(1);
        }
        const ext = path.extname(absPath).toLowerCase();
        if (ext === '.xlsx' || ext === '.xls') {
            console.log(`  Reading XLSX: ${absPath}`);
            students = parseXLSXFile(absPath);
        } else {
            // Assume CSV
            console.log(`  Reading CSV: ${absPath}`);
            const csvContent = fs.readFileSync(absPath, 'utf-8');
            students = parseSpreadsheetCSV(csvContent);
        }
    } else {
        const csvContent = await fetchSpreadsheet(SHEET_ID);
        students = parseSpreadsheetCSV(csvContent);
    }

    students = students.slice(0, MAX_STUDENTS);
    console.log(`  Parsed ${students.length} student records\n`);

    if (students.length === 0) {
        console.error('  No students found in spreadsheet.');
        process.exit(1);
    }

    // Show parsed preview
    console.log('  Preview of first 3 rows:');
    for (const s of students.slice(0, 3)) {
        console.log(`    ${s.name} | LC: ${s.leetcodeUsername || '—'} | GH: ${s.githubUsername || '—'} | CF: ${s.codeforcesHandle || '—'}`);
    }
    console.log('');

    // Phase 2: Run pipelines
    console.log('🔬 Phase 2: Running analysis pipelines...\n');
    const results: StudentResult[] = [];

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const studentStart = Date.now();

        process.stdout.write(`[${String(i + 1).padStart(2)}/${students.length}] ${student.name} (${student.uid}) ... `);

        // LeetCode
        let leetcode: LeetCodeResult | null = null;
        if (!SKIP_LEETCODE && student.leetcodeUsername) {
            leetcode = await runLeetCode(student.leetcodeUsername);
            process.stdout.write(leetcode.success ? '🟢LC ' : '🔴LC ');
            await sleep(500); // rate limiting courtesy
        }

        // Codeforces
        let codeforces: CodeforcesResult | null = null;
        if (!SKIP_CODEFORCES && student.codeforcesHandle) {
            codeforces = await runCodeforces(student.codeforcesHandle);
            process.stdout.write(codeforces.success ? '🟢CF ' : '🔴CF ');
            await sleep(500);
        }

        // GitHub
        let github: GitHubResult | null = null;
        if (!SKIP_GITHUB && student.githubUsername) {
            github = await runGitHub(student.githubUsername);
            process.stdout.write(github.reposAnalyzed > 0 ? `🟢GH(${github.reposAnalyzed}) ` : '🔴GH ');
        }

        const totalDurationMs = Date.now() - studentStart;
        const result: StudentResult = { student, leetcode, codeforces, github, totalDurationMs };
        results.push(result);

        console.log(`  ${(totalDurationMs / 1000).toFixed(1)}s`);

        // Rate limiting between students
        if (i < students.length - 1) await sleep(800);
    }

    // Phase 3: Detailed results
    console.log('\n📊 DETAILED RESULTS');
    results.forEach((r, i) => printStudentResult(r, i, results.length));

    // Phase 4: Write output
    console.log('\n💾 Phase 3: Writing output files...');
    const outDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'results');
    fs.mkdirSync(outDir, { recursive: true });

    writeJSON(results, outDir);
    writeCSV(results, outDir);

    printSummary(results);
}

main().catch(e => {
    console.error('\n💥 Harness crashed:', e.message);
    if (VERBOSE) console.error(e);
    process.exit(1);
});
