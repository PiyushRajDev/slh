import type { DSAProfileInput, ComponentBreakdown } from '../types';
import { clamp, round } from '../utils';

/**
 * DSA Score (0–100) based on the architecture spec §7.2B.
 *
 * 1. Problem Count   (40 pts)
 *    - Total solved    0-20 : min(totalSolved / 25, 20)
 *    - Hard problems   0-20 : min(hardSolved * 2, 20)
 *
 * 2. Platform Presence (30 pts)
 *    - Active platforms 0-15 : activePlatforms * 5
 *    - Consistency      0-15 : platforms with > 50 problems * 5
 *
 * 3. Rating/Rank      (30 pts)
 *    - LeetCode rating  0-15 : (rating / 3000) * 15
 *    - CodeForces rating 0-15 : (rating / 3000) * 15
 */
export function scoreDSA(profiles: DSAProfileInput[]): ComponentBreakdown {
    if (profiles.length === 0) {
        return { score: 0, max: 100, details: {} };
    }

    // ── Problem Count (40 pts) ──
    const totalSolved = profiles.reduce((sum, p) => sum + p.totalSolved, 0);
    const totalSolvedPts = clamp(totalSolved / 25, 0, 20);

    const totalHard = profiles.reduce((sum, p) => sum + p.hardSolved, 0);
    const hardPts = clamp(totalHard * 2, 0, 20);

    const problemScore = totalSolvedPts + hardPts;

    // ── Platform Presence (30 pts) ──
    const activePlatforms = profiles.filter(p => p.totalSolved > 0).length;
    const platformPts = clamp(activePlatforms * 5, 0, 15);

    const consistentPlatforms = profiles.filter(p => p.totalSolved > 50).length;
    const consistencyPts = clamp(consistentPlatforms * 5, 0, 15);

    const presenceScore = platformPts + consistencyPts;

    // ── Rating/Rank (30 pts) ──
    const leetcode = profiles.find(p => p.platform === 'LEETCODE');
    const leetcodeRating = leetcode?.rating ?? 0;
    const leetcodeRatingPts = clamp((leetcodeRating / 3000) * 15, 0, 15);

    const codeforces = profiles.find(p => p.platform === 'CODEFORCES');
    const codeforcesRating = codeforces?.rating ?? 0;
    const codeforcesRatingPts = clamp((codeforcesRating / 3000) * 15, 0, 15);

    const ratingScore = leetcodeRatingPts + codeforcesRatingPts;

    const total = round(clamp(problemScore + presenceScore + ratingScore));

    return {
        score: total,
        max: 100,
        details: {
            totalSolved: round(totalSolvedPts),
            hardProblems: round(hardPts),
            activePlatforms: round(platformPts),
            consistency: round(consistencyPts),
            leetcodeRating: round(leetcodeRatingPts),
            codeforcesRating: round(codeforcesRatingPts),
        },
    };
}
