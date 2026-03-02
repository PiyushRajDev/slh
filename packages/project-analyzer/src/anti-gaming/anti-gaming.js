"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectGaming = detectGaming;
function detectGaming(metrics, signals) {
    var flags = [];
    var totalLoc = metrics.total_loc || 0;
    var complexityAvg = metrics.complexity_avg || 0;
    if (totalLoc > 1000 && complexityAvg < (1.0 + totalLoc / 100000)) {
        flags.push({
            pattern: 'Empty Shell',
            severity: 'high',
            description: 'Large volume of code with near-zero logic (likely bulk JSON, config, or boilerplate).',
            evidence: {
                total_loc: totalLoc,
                complexity_avg: complexityAvg
            }
        });
    }
    var commitCount = metrics.commit_count || 0;
    var commitSpanDays = metrics.commit_span_days || 0;
    if (commitCount > 10 && commitSpanDays < 2) {
        flags.push({
            pattern: 'Commit Burst',
            severity: 'medium',
            description: 'High commit volume in an extremely short window (suggests a bulk upload or tutorial follow-along rather than iterative development).',
            evidence: {
                commit_count: commitCount,
                commit_span_days: commitSpanDays
            }
        });
    }
    var isFork = metrics.is_fork === true;
    if (isFork && commitCount < 5) {
        flags.push({
            pattern: 'Fork Minimalist',
            severity: 'high',
            description: 'Forked repository with very few original contributions.',
            evidence: {
                is_fork: isFork,
                commit_count: commitCount
            }
        });
    }
    if (commitCount <= 1) {
        flags.push({
            pattern: 'Single Commit',
            severity: 'high',
            description: 'Entire project submitted in a single commit — no development history.',
            evidence: { commit_count: commitCount }
        });
    }
    if (commitSpanDays < 1 && commitCount > 5) {
        flags.push({
            pattern: 'Rapid Completion',
            severity: 'medium',
            description: 'Project completed in under 24 hours with multiple commits.',
            evidence: { commit_span_days: commitSpanDays, commit_count: commitCount }
        });
    }
    var depCount = metrics.dependency_count || 0;
    var sourceLoc = metrics.source_loc || 0;
    if (depCount > 50 && sourceLoc < 500) {
        flags.push({
            pattern: 'Dependency Inflation',
            severity: 'medium',
            description: 'Unusually high dependency count relative to original code.',
            evidence: { dependency_count: depCount, source_loc: sourceLoc }
        });
    }
    var testRatio = metrics.test_to_code_ratio || 0;
    if (testRatio > 3.0) {
        flags.push({
            pattern: 'Test Inflation',
            severity: 'low',
            description: 'Test code volume far exceeds source code — may indicate auto-generated tests.',
            evidence: { test_to_code_ratio: testRatio }
        });
    }
    var contributorCount = metrics.contributor_count || 0;
    var topPercent = metrics.top_contributor_percent || 0;
    if (contributorCount > 2 && topPercent < 30) {
        flags.push({
            pattern: 'Low Ownership',
            severity: 'medium',
            description: 'Low individual contribution percentage — may not be primary author.',
            evidence: { contributor_count: contributorCount, top_contributor_percent: topPercent }
        });
    }
    var ccr = metrics.conventional_commit_ratio;
    if (typeof ccr === 'number' && ccr === 0 && commitCount > 20) {
        flags.push({
            pattern: 'Copied Structure',
            severity: 'low',
            description: 'No conventional commit messages despite significant history — may indicate bulk import.',
            evidence: { conventional_commit_ratio: ccr, commit_count: commitCount }
        });
    }
    return {
        flags: flags,
        flagCount: flags.length
    };
}
