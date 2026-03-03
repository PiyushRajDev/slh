import { RawMetrics } from '../metrics/metrics';
import { StructuralSignals } from '../signals/signals';

export interface AntiGamingFlag {
    pattern: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    evidence: Record<string, number | boolean | string | string[]>;
}

export interface AntiGamingReport {
    flags: AntiGamingFlag[];
    flagCount: number;
    reliabilityScore: number;
    reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function detectGaming(metrics: RawMetrics, signals: StructuralSignals, profileId: string): AntiGamingReport {
    const flags: AntiGamingFlag[] = [];

    const totalLoc = metrics.total_loc || 0;
    const complexityAvg = metrics.complexity_avg || 0;
    const commitCount = metrics.commit_count || 0;
    const commitSpanDays = metrics.commit_span_days || 0;
    const isFork = metrics.is_fork === true;
    const fileCount = metrics.file_count || 0;
    const depCount = metrics.dependency_count || 0;

    // Pattern 1: Fork Minimal Divergence
    if (isFork && commitCount < 5) {
        let severity: 'low' | 'medium' | 'high' = 'high';
        if (profileId === 'ml_pipeline' || profileId === 'library') severity = 'medium';

        flags.push({
            pattern: 'Fork Minimal Divergence',
            severity,
            description: 'Forked repository with very few original commits',
            evidence: { is_fork: isFork, commit_count: commitCount, threshold: 5 }
        });
    }

    // Pattern 2: Commit Burst
    if (commitCount > 20 && commitSpanDays <= 2) {
        let severity: 'low' | 'medium' | 'high' = 'high';
        if (profileId === 'academic') severity = 'low';
        // 'generic' stays high as a safe default

        flags.push({
            pattern: 'Commit Burst',
            severity,
            description: 'All work completed in 1-2 days suggests rushed or bulk import',
            evidence: { commit_count: commitCount, commit_span_days: commitSpanDays, expected_span: '> 7 days' }
        });
    }

    // Pattern 3: Single Commit Dump
    if (commitCount === 1) {
        flags.push({
            pattern: 'Single Commit',
            severity: 'high',
            description: 'Entire project submitted in a single commit — no development history.',
            evidence: { commit_count: commitCount }
        });
    }

    // Pattern 4 & 5: Repetitive / Generic Messages
    const ccr = metrics.conventional_commit_ratio;
    // Approximating these since RawMetrics doesn't currently give us 'unique_messages'
    // but the original logic flagged if ccr === 0 and commitCount > 20
    if (typeof ccr === 'number' && ccr < 0.20 && commitCount > 10) {
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (profileId === 'production_web_app') severity = 'medium';
        flags.push({
            pattern: 'Generic/Repetitive Messages',
            severity,
            description: 'Low commit message diversity or purely generic messages',
            evidence: { conventional_commit_ratio: ccr, total_commits: commitCount }
        });
    }

    // Pattern 6: File Explosion
    const maxDepth = metrics.max_depth || 0;
    const avgLoc = fileCount > 0 ? (totalLoc / fileCount) : 0;
    if (fileCount > 200 && maxDepth < 3 && avgLoc < 20) {
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (profileId === 'production_web_app') severity = 'medium';
        flags.push({
            pattern: 'File Explosion',
            severity,
            description: 'Unusually high file count with shallow structure',
            evidence: { file_count: fileCount, avg_loc_per_file: avgLoc, folder_depth: maxDepth }
        });
    }

    // Pattern 7: Dependency Inflation
    if (depCount > 30 && (fileCount < 20 || totalLoc < 1000)) {
        let severity: 'low' | 'medium' | 'high' = 'medium';
        if (profileId === 'production_web_app' || profileId === 'frontend_app') severity = 'low';
        flags.push({
            pattern: 'Dependency Inflation',
            severity,
            description: 'Unusually high dependency count relative to original code',
            evidence: { dependency_count: depCount, file_count: fileCount, total_loc: totalLoc }
        });
    }

    // Pattern 8: Boilerplate Heavy & Empty Shells
    // (We use log-scaling as requested by tier-3 gauntlet)
    if (totalLoc > 1000 && complexityAvg <= Math.log(Math.max(1, totalLoc / 1000) * 2)) {
        flags.push({
            pattern: 'Empty Shell / Boilerplate',
            severity: 'high',
            description: 'Large volume of code with near-zero logic (likely bulk JSON, config, or boilerplate).',
            evidence: { total_loc: totalLoc, complexity_avg: complexityAvg }
        });
    }

    // Pattern 9: Low Ownership
    const contributorCount = metrics.contributor_count || 0;
    const topPercent = metrics.top_contributor_percent || 0;
    if (contributorCount > 1 && topPercent < 30) {
        flags.push({
            pattern: 'Low Ownership',
            severity: 'medium',
            description: 'Low individual contribution percentage suggests limited individual ownership',
            evidence: { contributor_count: contributorCount, top_contributor_percent: topPercent }
        });
    }

    // Pattern 10: Minimal Project
    if (fileCount < 10 && totalLoc < 500 && depCount < 3) {
        let severity: 'low' | 'medium' | 'high' = 'low'; // default CLI/Academic
        if (profileId === 'production_web_app' || profileId === 'backend_api' || profileId === 'frontend_app') severity = 'medium';
        flags.push({
            pattern: 'Minimal Project',
            severity,
            description: 'Very minimal project scope',
            evidence: { file_count: fileCount, total_loc: totalLoc }
        });
    }

    // Calculate Reliability (incorporating confidence weights per doc)
    let reliability = 1.0;
    const severityWeight = { low: 0.05, medium: 0.15, high: 0.30 };

    flags.forEach(flag => {
        const dampening = severityWeight[flag.severity] * 1.0; // assuming perfect confidence (1.0) on the flag detection itself for now
        reliability *= (1 - dampening);
    });

    // Boosts
    if (commitSpanDays > 30 && commitCount > 20) {
        reliability = Math.min(1.0, reliability * 1.1);
    }
    const testFileCount = metrics.test_file_count || 0;
    if (testFileCount > 10) {
        reliability = Math.min(1.0, reliability * 1.05);
    }

    reliability = Math.max(0.0, Math.min(1.0, reliability));

    let reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (reliability >= 0.85) reliabilityLevel = 'HIGH';
    else if (reliability >= 0.65) reliabilityLevel = 'MEDIUM';

    return {
        flags,
        flagCount: flags.length,
        reliabilityScore: reliability,
        reliabilityLevel
    };
}
