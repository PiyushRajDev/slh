import { ProfileResult } from '../profiles/profiles';
import { FinalScoreReport } from '../scoring/scoring';
import { AntiGamingReport, AntiGamingFlag } from '../anti-gaming/anti-gaming';

export interface SelectionResult {
    profileId: string;
    displayName: string;
    rawScore: number;
    reliabilityScore: number; // 0.0 to 1.0
    reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    defensibleScore: number;
    fitnessScore: number;
}

export interface AnalysisCandidate {
    profile: ProfileResult;
    score: FinalScoreReport;
    antiGaming: AntiGamingReport;
}

export function selectBestProfile(candidates: AnalysisCandidate[]): SelectionResult {
    if (!candidates || candidates.length === 0) {
        throw new Error("No candidates provided for selection.");
    }

    const calculatedCandidates = candidates.map(candidate => {
        let penalty = 0.0;

        candidate.antiGaming.flags.forEach((flag: AntiGamingFlag) => {
            if (flag.severity === 'low') penalty += 0.05;
            else if (flag.severity === 'medium') penalty += 0.15;
            else if (flag.severity === 'high') penalty += 0.30;
        });

        const reliabilityScore = Math.max(0.0, Math.min(1.0, 1.0 - penalty));

        let reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (reliabilityScore >= 0.85) {
            reliabilityLevel = 'HIGH';
        } else if (reliabilityScore >= 0.65) {
            reliabilityLevel = 'MEDIUM';
        }

        const rawScore = candidate.score.overallScore;
        const defensibleScore = rawScore * reliabilityScore;

        return {
            profileId: candidate.profile.profileId,
            displayName: candidate.profile.displayName,
            rawScore,
            reliabilityScore,
            reliabilityLevel,
            defensibleScore,
            fitnessScore: candidate.profile.fitnessScore,
            isActive: candidate.profile.status === 'active'
        };
    });

    const activeCandidates = calculatedCandidates.filter(c => c.isActive);

    // Fallback if no active candidates exist
    const candidatesToConsider = activeCandidates.length > 0 ? activeCandidates : calculatedCandidates;

    candidatesToConsider.sort((a, b) => {
        if (b.defensibleScore !== a.defensibleScore) {
            return b.defensibleScore - a.defensibleScore;
        }
        return b.fitnessScore - a.fitnessScore;
    });

    const winner = candidatesToConsider[0];

    return {
        profileId: winner.profileId,
        displayName: winner.displayName,
        rawScore: winner.rawScore,
        reliabilityScore: winner.reliabilityScore,
        reliabilityLevel: winner.reliabilityLevel,
        defensibleScore: winner.defensibleScore,
        fitnessScore: winner.fitnessScore
    };
}
