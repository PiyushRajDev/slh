import { RawMetrics } from '../metrics/metrics';
import { StructuralSignals } from '../signals/signals';

export interface AntiGamingFlag {
    pattern: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    evidence: Record<string, any>;
}

export interface AntiGamingReport {
    flags: AntiGamingFlag[];
    flagCount: number;
}

export function detectGaming(metrics: RawMetrics, signals: StructuralSignals): AntiGamingReport {
    const flags: AntiGamingFlag[] = [];

    const totalLoc = metrics.total_loc || 0;
    const complexityAvg = metrics.complexity_avg || 0;

    if (totalLoc > 1000 && complexityAvg < 1.0) {
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

    const commitCount = metrics.commit_count || 0;
    const commitSpanDays = metrics.commit_span_days || 0;

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

    const isFork = metrics.is_fork === true;

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

    return {
        flags,
        flagCount: flags.length
    };
}
