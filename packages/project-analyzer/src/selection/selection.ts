import { ProfileResult } from '../profiles/profiles';
import { FinalScoreReport } from '../scoring/scoring';
import { AntiGamingReport } from '../anti-gaming/anti-gaming';

export interface SelectionResult {
    profileId: string;
    displayName: string;
    rawScore: number;
    reliabilityScore: number; // 0.0 to 1.0
    reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    defensibleScore: number;
    fitnessScore: number;
    isAmbiguous: boolean;
    runnerUpProfileId: string | null;
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
        const reliabilityScore = candidate.antiGaming.reliabilityScore;
        const reliabilityLevel = candidate.antiGaming.reliabilityLevel;
        const rawScore = candidate.score.overallScore;
        const fitnessScore = candidate.profile.fitnessScore;

        // Step 3: Calculate Defensible Score
        // defensible_score = score * fitness * reliability
        const defensibleScore = rawScore * fitnessScore * reliabilityScore;

        return {
            profileId: candidate.profile.profileId,
            displayName: candidate.profile.displayName,
            rawScore,
            reliabilityScore,
            reliabilityLevel,
            defensibleScore,
            fitnessScore,
            isActive: candidate.profile.status === 'active'
        };
    });

    // Step 2: Filter by Fitness Threshold. The active status reflects fitness threshold passing from evaluateProfiles.
    let activeCandidates = calculatedCandidates.filter(c => c.isActive);

    // Case 1: No Valid Profiles -> Use generic fallback
    if (activeCandidates.length === 0) {
        activeCandidates = calculatedCandidates; // consider all, generic will likely win or fallback is best
    }

    // Step 4: Select Winner
    activeCandidates.sort((a, b) => {
        // Primary sort: Defensible Score
        if (Math.abs(b.defensibleScore - a.defensibleScore) > 0.001) {
            return b.defensibleScore - a.defensibleScore;
        }
        // Tie break 1: Raw Score
        if (b.rawScore !== a.rawScore) {
            return b.rawScore - a.rawScore;
        }
        // Tie break 2: Fitness Score
        if (b.fitnessScore !== a.fitnessScore) {
            return b.fitnessScore - a.fitnessScore;
        }
        // Tie break 3: Reliability
        return b.reliabilityScore - a.reliabilityScore;
    });

    const winner = activeCandidates[0];

    // Step 5: Record Runner-Up (Optional)
    let isAmbiguous = false;
    let runnerUpProfileId: string | null = null;

    if (activeCandidates.length > 1) {
        const secondBest = activeCandidates[1];
        if (secondBest.defensibleScore >= 0.95 * winner.defensibleScore) {
            isAmbiguous = true;
            runnerUpProfileId = secondBest.profileId;
        }
    }

    return {
        profileId: winner.profileId,
        displayName: winner.displayName,
        rawScore: winner.rawScore,
        reliabilityScore: winner.reliabilityScore,
        reliabilityLevel: winner.reliabilityLevel,
        defensibleScore: winner.defensibleScore,
        fitnessScore: winner.fitnessScore,
        isAmbiguous,
        runnerUpProfileId
    };
}
