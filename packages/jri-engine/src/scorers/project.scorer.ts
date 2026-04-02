import type { ProjectAnalysisInput, ProjectsSnapshot, ComponentBreakdown } from '../types';
import { clamp, round } from '../utils';

/**
 * Aggregate project analysis scores into a snapshot and a 0–100 component score.
 * Uses the average of the student's completed project analyses.
 */
export function computeProjectsSnapshot(analyses: ProjectAnalysisInput[]): ProjectsSnapshot {
    const scores = analyses
        .map(a => a.overallScore)
        .filter(s => Number.isFinite(s));

    if (scores.length === 0) {
        return {
            analysesCount: 0,
            latestScore: 0,
            averageScore: 0,
            bestScore: 0,
            growth: 0,
            consistency: 40,
        };
    }

    // Analyses should be sorted newest-first by the caller.
    // Defensive: sort by createdAt descending.
    const sorted = [...analyses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const sortedScores = sorted.map(a => a.overallScore);

    const latestScore = sortedScores[0];
    const bestScore = Math.max(...sortedScores);
    const averageScore = sortedScores.reduce((s, v) => s + v, 0) / sortedScores.length;
    const oldestScore = sortedScores[sortedScores.length - 1];
    const growth = latestScore - oldestScore;

    let consistency = 50;
    if (sortedScores.length >= 2) {
        const variance = sortedScores.reduce((s, v) => s + (v - averageScore) ** 2, 0) / sortedScores.length;
        const stdDev = Math.sqrt(variance);
        consistency = clamp(
            85 - stdDev * 1.2 + (growth > 0 ? Math.min(growth, 10) : growth * 0.3),
            25, 98,
        );
    } else {
        consistency = clamp(55 + latestScore * 0.2, 40, 90);
    }

    return {
        analysesCount: sortedScores.length,
        latestScore,
        averageScore: round(averageScore),
        bestScore,
        growth: round(growth),
        consistency: round(consistency),
    };
}

/**
 * Project Component Score (0–100).
 * Simply returns the average project analysis score as the component score.
 */
export function scoreProjects(analyses: ProjectAnalysisInput[]): ComponentBreakdown {
    const snapshot = computeProjectsSnapshot(analyses);

    return {
        score: round(clamp(snapshot.averageScore)),
        max: 100,
        details: {
            analysesCount: snapshot.analysesCount,
            latestScore: snapshot.latestScore,
            averageScore: snapshot.averageScore,
            bestScore: snapshot.bestScore,
            growth: snapshot.growth,
            consistency: snapshot.consistency,
        },
    };
}
