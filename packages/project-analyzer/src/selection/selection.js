"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectBestProfile = selectBestProfile;
function selectBestProfile(candidates) {
    if (!candidates || candidates.length === 0) {
        throw new Error("No candidates provided for selection.");
    }
    var calculatedCandidates = candidates.map(function (candidate) {
        var penalty = 0.0;
        candidate.antiGaming.flags.forEach(function (flag) {
            if (flag.severity === 'low')
                penalty += 0.05;
            else if (flag.severity === 'medium')
                penalty += 0.15;
            else if (flag.severity === 'high')
                penalty += 0.30;
        });
        var reliabilityScore = Math.max(0.0, Math.min(1.0, 1.0 - penalty));
        var reliabilityLevel = 'LOW';
        if (reliabilityScore >= 0.85) {
            reliabilityLevel = 'HIGH';
        }
        else if (reliabilityScore >= 0.65) {
            reliabilityLevel = 'MEDIUM';
        }
        var rawScore = candidate.score.overallScore;
        var defensibleScore = rawScore * reliabilityScore;
        return {
            profileId: candidate.profile.profileId,
            displayName: candidate.profile.displayName,
            rawScore: rawScore,
            reliabilityScore: reliabilityScore,
            reliabilityLevel: reliabilityLevel,
            defensibleScore: defensibleScore,
            fitnessScore: candidate.profile.fitnessScore,
            isActive: candidate.profile.status === 'active'
        };
    });
    var activeCandidates = calculatedCandidates.filter(function (c) { return c.isActive; });
    // Fallback if no active candidates exist
    var candidatesToConsider = activeCandidates.length > 0 ? activeCandidates : calculatedCandidates;
    candidatesToConsider.sort(function (a, b) {
        if (b.defensibleScore !== a.defensibleScore) {
            return b.defensibleScore - a.defensibleScore;
        }
        return b.fitnessScore - a.fitnessScore;
    });
    var winner = candidatesToConsider[0];
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
