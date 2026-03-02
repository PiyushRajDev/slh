import { selectBestProfile, AnalysisCandidate } from './src/selection/selection';
import { ProfileResult } from './src/profiles/profiles';
import { FinalScoreReport } from './src/scoring/scoring';
import { AntiGamingReport } from './src/anti-gaming/anti-gaming';

const candidateA: AnalysisCandidate = {
    profile: {
        profileId: 'backend_api',
        displayName: 'Backend API',
        fitnessScore: 0.8,
        status: 'active',
        matchedSignals: [],
        missingSignals: []
    } as ProfileResult,
    score: {
        overallScore: 85
    } as FinalScoreReport,
    antiGaming: {
        flags: [
            { pattern: 'Flag', severity: 'high', description: '', evidence: {} }
        ],
        flagCount: 1
    } as AntiGamingReport
};

const candidateB: AnalysisCandidate = {
    profile: {
        profileId: 'frontend_app',
        displayName: 'Frontend App',
        fitnessScore: 0.7,
        status: 'active',
        matchedSignals: [],
        missingSignals: []
    } as ProfileResult,
    score: {
        overallScore: 70
    } as FinalScoreReport,
    antiGaming: {
        flags: [],
        flagCount: 0
    } as AntiGamingReport
};

console.log("Selecting between Candidate A (Raw: 85, 1 High Flag) and Candidate B (Raw: 70, 0 Flags)...");

const winner = selectBestProfile([candidateA, candidateB]);

console.log(`🏆 Winner: ${winner.displayName}`);
console.log(`Defensible Score: ${winner.defensibleScore}`);
console.log(`Raw Score: ${winner.rawScore}`);
console.log(`Reliability: ${winner.reliabilityScore} (${winner.reliabilityLevel})`);

if (winner.profileId !== 'frontend_app') {
    throw new Error('Candidate B should have won due to a higher defensible score.');
}

console.log("✅ Verification passed! Candidate B correctly chosen due to defensible score calculations.");
