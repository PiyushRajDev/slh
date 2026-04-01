import { ProfileResult, ProfileId } from '../profiles/profiles';
import { FinalScoreReport } from '../scoring/scoring';
import { AntiGamingReport } from '../anti-gaming/anti-gaming';
import { StructuralSignals } from '../signals/signals';
import { RawMetrics } from '../metrics/metrics';

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
    secondaryProfile: string | null;
    tierOverride: boolean;
    topCandidates?: Array<{
        profileId: string;
        rawScore: number;
        reliabilityScore: number;
        reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
        defensibleScore: number;
        fitnessScore: number;
        isActive: boolean;
    }>;
    missingGitMetrics?: boolean;
    selectionNotes?: string[];
}

export interface AnalysisCandidate {
    profile: ProfileResult;
    score: FinalScoreReport;
    antiGaming: AntiGamingReport;
}

interface CalculatedCandidate {
    profileId: ProfileId;
    displayName: string;
    rawScore: number;
    reliabilityScore: number;
    reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    defensibleScore: number;
    fitnessScore: number;
    isActive: boolean;
}

/**
 * Guarded Hierarchical Tier Override
 *
 * Tier order: ML > Fullstack > CLI > Backend > Frontend
 *
 * Safety: override only fires if the candidate's fitness is within 0.15
 * of the current top fitness. This prevents forced misclassification
 * when the tier target has very low fitness (e.g. backend at 0.40
 * while library is at 0.82).
 */
function applyTierOverride(
    candidates: CalculatedCandidate[],
    signals: StructuralSignals,
    metrics?: Partial<RawMetrics>
): { overrideId: ProfileId | null } {

    const maxFitness = Math.max(...candidates.map(c => c.fitnessScore));
    const commitCount = metrics?.commit_count ?? 0;
    const markupHtmlCss = (metrics?.markup_loc?.html ?? 0) + (metrics?.markup_loc?.css ?? 0);
    const hasDeployConfig = metrics?.deploy_config_present === true;

    // Helper: only override if candidate fitness is competitive
    const canOverride = (id: ProfileId): boolean => {
        const c = candidates.find(c => c.profileId === id);
        if (!c) return false;
        return c.fitnessScore >= maxFitness - 0.15;
    };

    // Tier 1: ML Dominance — require activity (not just notebooks in a tiny repo)
    if (signals.has_ml_components && commitCount > 20 && canOverride('ml_pipeline')) {
        return { overrideId: 'ml_pipeline' };
    }

    // Tier 2: Fullstack — both frontend AND backend runtime
    if (signals.has_frontend && signals.has_backend && canOverride('production_web_app')) {
        return { overrideId: 'production_web_app' };
    }

    // Tier 3: CLI — structurally distinctive, above backend/frontend
    if (signals.is_cli_entrypoint && canOverride('cli_tool')) {
        return { overrideId: 'cli_tool' };
    }

    // Tier 4: Strong Backend — requires system behavior, not just folder presence
    if (signals.has_backend && !signals.has_frontend) {
        const isStrongBackend =
            signals.has_database ||
            signals.has_docker ||
            commitCount > 100;
        if (isStrongBackend && canOverride('backend_api')) {
            return { overrideId: 'backend_api' };
        }
    }

    // Tier 5: Strong Frontend — requires substance, not just a UI library
    if (signals.has_frontend && !signals.has_backend) {
        const isStrongFrontend =
            markupHtmlCss > 500 ||
            hasDeployConfig ||
            commitCount > 50;
        if (isStrongFrontend && canOverride('frontend_app')) {
            return { overrideId: 'frontend_app' };
        }
    }

    // No tier override — fall through to score-based selection
    return { overrideId: null };
}

export function selectBestProfile(
    candidates: AnalysisCandidate[],
    signals?: StructuralSignals,
    metrics?: Partial<RawMetrics>
): SelectionResult {
    if (!candidates || candidates.length === 0) {
        throw new Error("No candidates provided for selection.");
    }

    const calculatedCandidates: CalculatedCandidate[] = candidates.map(candidate => {
        const reliabilityScore = candidate.antiGaming.reliabilityScore;
        const reliabilityLevel = candidate.antiGaming.reliabilityLevel;
        const rawScore = candidate.score.overallScore;
        const fitnessScore = candidate.profile.fitnessScore;
        const defensibleScore = rawScore * fitnessScore * reliabilityScore;

        return {
            profileId: candidate.profile.profileId as ProfileId,
            displayName: candidate.profile.displayName,
            rawScore,
            reliabilityScore,
            reliabilityLevel,
            defensibleScore,
            fitnessScore,
            isActive: candidate.profile.status === 'active'
        };
    });

    const selectionNotes: string[] = [];
    const missingGitMetrics = metrics?.commit_sha == null && (metrics?.commit_count == null || metrics.commit_count === 0);

    // Step 1: Filter by Fitness Threshold
    let activeCandidates = calculatedCandidates.filter(c => c.isActive);
    if (activeCandidates.length === 0) {
        activeCandidates = calculatedCandidates;
    }

    // Step 2: Sort by defensible score
    activeCandidates.sort((a, b) => {
        if (Math.abs(b.defensibleScore - a.defensibleScore) > 0.001) {
            return b.defensibleScore - a.defensibleScore;
        }
        if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
        if (b.fitnessScore !== a.fitnessScore) return b.fitnessScore - a.fitnessScore;
        return b.reliabilityScore - a.reliabilityScore;
    });

    // ═══════════════════════════════════════════════════════════════
    // Step 3: GUARDED HIERARCHICAL TIER OVERRIDE
    // Structural dominance — but only if fitness is competitive.
    // ═══════════════════════════════════════════════════════════════
    let tierOverride = false;
    if (signals) {
        const { overrideId } = applyTierOverride(activeCandidates, signals, metrics);
        if (overrideId && activeCandidates[0].profileId !== overrideId) {
            const idx = activeCandidates.findIndex(c => c.profileId === overrideId);
            if (idx > 0) {
                const [override] = activeCandidates.splice(idx, 1);
                activeCandidates.unshift(override);
                tierOverride = true;
                selectionNotes.push(`Tier override promoted ${override.profileId}.`);
            }
        }
    }

    const strongConcreteSignals = !!signals && (
        signals.has_frontend ||
        signals.has_static_frontend ||
        signals.has_backend ||
        signals.has_api_routes ||
        signals.has_server_entrypoint ||
        signals.has_database ||
        signals.has_library_exports ||
        signals.is_library_package ||
        signals.is_cli_entrypoint ||
        signals.has_ml_components
    );

    const promoteCandidate = (predicate: (candidate: CalculatedCandidate, winner: CalculatedCandidate) => boolean, note: string) => {
        const currentWinner = activeCandidates[0];
        const alternativeIdx = activeCandidates.findIndex((candidate, index) =>
            index > 0 && predicate(candidate, currentWinner)
        );

        if (alternativeIdx > 0) {
            const [alternative] = activeCandidates.splice(alternativeIdx, 1);
            activeCandidates.unshift(alternative);
            selectionNotes.push(note.replace('{profile}', alternative.profileId));
        }
    };

    promoteCandidate(
        (candidate, winner) =>
            winner.profileId === 'generic' &&
            candidate.profileId !== 'generic' &&
            candidate.fitnessScore >= 0.30 &&
            (candidate.defensibleScore >= winner.defensibleScore * 0.80 || strongConcreteSignals),
        'Generic fallback suppressed in favor of {profile}.'
    );

    promoteCandidate(
        (candidate, winner) =>
            winner.profileId === 'academic' &&
            missingGitMetrics &&
            candidate.profileId !== 'academic' &&
            candidate.profileId !== 'generic' &&
            candidate.fitnessScore >= Math.max(0.30, winner.fitnessScore - 0.20) &&
            candidate.defensibleScore >= winner.defensibleScore * 0.75,
        'Academic fallback suppressed due to missing git metrics; promoted {profile}.'
    );

    const winner = activeCandidates[0];

    // Step 4: Record ambiguity + secondary
    let isAmbiguous = false;
    let runnerUpProfileId: string | null = null;

    if (activeCandidates.length > 1) {
        const secondBest = activeCandidates[1];
        if (secondBest.defensibleScore >= 0.95 * winner.defensibleScore) {
            isAmbiguous = true;
            runnerUpProfileId = secondBest.profileId;
        }
    }

    if ((winner.profileId === 'academic' || winner.profileId === 'generic') && missingGitMetrics) {
        isAmbiguous = true;
        runnerUpProfileId = runnerUpProfileId ?? activeCandidates[1]?.profileId ?? null;
        selectionNotes.push(`${winner.profileId} selected with missing git metrics; confidence should stay conservative.`);
    }

    const secondaryProfile = activeCandidates.length > 1 ? activeCandidates[1].profileId : null;

    return {
        profileId: winner.profileId,
        displayName: winner.displayName,
        rawScore: winner.rawScore,
        reliabilityScore: winner.reliabilityScore,
        reliabilityLevel: winner.reliabilityLevel,
        defensibleScore: winner.defensibleScore,
        fitnessScore: winner.fitnessScore,
        isAmbiguous,
        runnerUpProfileId,
        secondaryProfile,
        tierOverride,
        topCandidates: activeCandidates.slice(0, 3).map(candidate => ({
            profileId: candidate.profileId,
            rawScore: candidate.rawScore,
            reliabilityScore: candidate.reliabilityScore,
            reliabilityLevel: candidate.reliabilityLevel,
            defensibleScore: candidate.defensibleScore,
            fitnessScore: candidate.fitnessScore,
            isActive: candidate.isActive
        })),
        missingGitMetrics,
        selectionNotes
    };
}
