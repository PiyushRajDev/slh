import type { HackathonInput, ComponentBreakdown } from '../types';
import { clamp, round } from '../utils';

/**
 * Hackathon Score (0–100) based on the architecture spec §7.2D.
 *
 * 1. Participation Count (40 pts) : min(count * 10, 40)
 * 2. Achievement Level   (40 pts) : winner=40, runner_up=25, participation=10 (capped at 40)
 * 3. Recency Bonus       (20 pts) : ratio of events in last 12 months * 20
 */
export function scoreHackathon(hackathons: HackathonInput[]): ComponentBreakdown {
    if (hackathons.length === 0) {
        return { score: 0, max: 100, details: {} };
    }

    // ── Participation Count (40 pts) ──
    const participationPts = clamp(hackathons.length * 10, 0, 40);

    // ── Achievement Level (40 pts) ──
    let achievementRaw = 0;
    for (const h of hackathons) {
        const prize = (h.prize ?? '').toLowerCase();
        if (prize.includes('winner') || prize.includes('first') || prize.includes('1st')) {
            achievementRaw += 40;
        } else if (prize.includes('runner') || prize.includes('second') || prize.includes('2nd')) {
            achievementRaw += 25;
        } else {
            achievementRaw += 10;
        }
    }
    const achievementPts = clamp(achievementRaw, 0, 40);

    // ── Recency Bonus (20 pts) ──
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentCount = hackathons.filter(h =>
        new Date(h.participationDate) > oneYearAgo
    ).length;
    const recencyRatio = recentCount / hackathons.length;
    const recencyPts = clamp(recencyRatio * 20, 0, 20);

    const total = round(clamp(participationPts + achievementPts + recencyPts));

    return {
        score: total,
        max: 100,
        details: {
            participation: round(participationPts),
            achievement: round(achievementPts),
            recency: round(recencyPts),
        },
    };
}
