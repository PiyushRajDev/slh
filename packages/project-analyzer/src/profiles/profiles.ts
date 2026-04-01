import { StructuralSignals } from '../signals/signals';
import { RawMetrics } from '../metrics/metrics';
import { AuthenticityMetrics } from '../authenticity/authenticity';

export type ProfileId = 'production_web_app' | 'backend_api' | 'frontend_app' | 'ml_pipeline' | 'cli_tool' | 'library' | 'academic' | 'generic';

export interface ProfileResult {
    profileId: ProfileId;
    displayName: string;
    fitnessScore: number; // 0.0 to 1.0
    status: 'active' | 'rejected';
    matchedSignals: string[];
    missingSignals: string[];
}

export interface CapabilityConfidence {
    value: number;
    confidence: number;
}
export type CapabilityVector = Record<ProfileId, CapabilityConfidence>;

export interface ProfileScoringWeights {
    codeQuality: number;
    architecture: number;
    testing: number;
    git: number;
    devops: number;
}

type ProfileConfig = {
    id: ProfileId;
    displayName: string;
    expectedSignals: Partial<Record<keyof StructuralSignals, number>>;
    fitnessThreshold: number;
    scoringWeights: ProfileScoringWeights;
};

const PROFILES: ProfileConfig[] = [
    {
        id: 'production_web_app',
        displayName: 'Full-Stack Web Application',
        fitnessThreshold: 0.60,
        expectedSignals: {
            has_frontend: 20,
            has_backend: 25,
            has_api_routes: 15,
            has_database: 15,
            has_tests: 10,
            has_ci: 5,
            has_deployment_config: 10
        },
        scoringWeights: {
            codeQuality: 0.25,
            architecture: 0.20,
            testing: 0.25,
            git: 0.20,
            devops: 0.10
        }
    },
    {
        id: 'backend_api',
        displayName: 'Backend API Service',
        fitnessThreshold: 0.55,
        expectedSignals: {
            has_backend: 30,
            has_server_entrypoint: 25,
            has_api_routes: 20,
            has_database: 15,
            has_tests: 5,
            has_deployment_config: 5
        },
        scoringWeights: {
            codeQuality: 0.30,
            architecture: 0.25,
            testing: 0.25,
            git: 0.15,
            devops: 0.05
        }
    },
    {
        id: 'frontend_app',
        displayName: 'Frontend Web Application',
        fitnessThreshold: 0.50,
        expectedSignals: {
            has_frontend: 40,
            has_static_frontend: 20,
            has_tests: 15,
            has_ci: 10,
            has_deployment_config: 15
        },
        scoringWeights: {
            codeQuality: 0.25,
            architecture: 0.20,
            testing: 0.25,
            git: 0.20,
            devops: 0.10
        }
    },
    {
        id: 'ml_pipeline',
        displayName: 'Machine Learning Pipeline',
        fitnessThreshold: 0.55,
        expectedSignals: {
            has_ml_components: 50,
            has_tests: 15,
            has_documentation: 15
        },
        scoringWeights: {
            codeQuality: 0.20,
            architecture: 0.20,
            testing: 0.20,
            git: 0.25,
            devops: 0.15
        }
    },
    {
        id: 'cli_tool',
        displayName: 'Command-Line Tool',
        fitnessThreshold: 0.60,
        expectedSignals: {
            is_cli_entrypoint: 40,
            has_tests: 25,
            has_documentation: 20,
            has_ci: 15
        },
        scoringWeights: {
            codeQuality: 0.35,
            architecture: 0.15,
            testing: 0.30,
            git: 0.20,
            devops: 0.0
        }
    },
    {
        id: 'library',
        displayName: 'Reusable Library / Package',
        fitnessThreshold: 0.50,
        expectedSignals: {
            has_library_exports: 35,
            is_library_package: 30,
            has_tests: 20,
            has_documentation: 15
        },
        scoringWeights: {
            codeQuality: 0.35,
            architecture: 0.20,
            testing: 0.35,
            git: 0.10,
            devops: 0.0
        }
    },
    {
        id: 'academic',
        displayName: 'Academic Project',
        fitnessThreshold: 0.60,
        expectedSignals: {
            has_academic_markers: 45,
            is_short_timeline: 35,
            has_documentation: 20
        },
        scoringWeights: {
            codeQuality: 0.30,
            architecture: 0.20,
            testing: 0.15,
            git: 0.15,
            devops: 0.0
        }
    },
    {
        id: 'generic',
        displayName: 'General Project',
        fitnessThreshold: 0.0,
        expectedSignals: {},
        scoringWeights: {
            codeQuality: 0.25,
            architecture: 0.20,
            testing: 0.25,
            git: 0.20,
            devops: 0.10
        }
    }
];

// Export for use by scoring.ts
export function getProfileScoringWeights(profileId: ProfileId): ProfileScoringWeights {
    const profile = PROFILES.find(p => p.id === profileId);
    return profile?.scoringWeights ?? PROFILES[PROFILES.length - 1].scoringWeights;
}

/**
 * Evaluate profiles with dominance logic.
 * Accepts optional metrics for academic hard gating (stars, commits, span, authors).
 */
export function evaluateProfiles(signals: StructuralSignals, metrics?: Partial<RawMetrics>): ProfileResult[] {
    const results: ProfileResult[] = PROFILES.map(profile => {
        let totalWeight = 0;
        let earnedWeight = 0;
        const matchedSignals: string[] = [];
        const missingSignals: string[] = [];

        for (const [key, weight] of Object.entries(profile.expectedSignals)) {
            const signalKey = key as keyof StructuralSignals;
            const signalWeight = weight as number;

            totalWeight += signalWeight;

            if (signals[signalKey] === true) {
                earnedWeight += signalWeight;
                matchedSignals.push(signalKey);
            } else {
                missingSignals.push(signalKey);
            }
        }

        // Generic gets 0.0 (not 0.30) so it only wins if truly nothing matches
        let fitnessScore = totalWeight > 0 ? earnedWeight / totalWeight : 0.0;

        // ═══════════════════════════════════════════════════════════════
        // DOMINANCE RULES — applied after base fitness calculation
        // ═══════════════════════════════════════════════════════════════

        // ── Rule 1: Academic Hard Gating ──────────────────────────────
        // Academic must only activate when structural weakness exists.
        if (profile.id === 'academic') {
            const commitCount = metrics?.commit_count ?? 0;
            const commitSpanDays = metrics?.commit_span_days ?? 0;
            const contributorCount = metrics?.contributor_count ?? 1;
            const hasVerifiedLowActivity = signals.has_git_history && commitCount > 0 && commitCount < 20 && commitSpanDays >= 0 && commitSpanDays < 30;

            // Pre-score suppression: mature repos are NOT academic
            if (commitCount > 150 || commitSpanDays > 365 || contributorCount > 2) {
                fitnessScore = Math.max(0, fitnessScore - 0.50);
            }

            // Academic REQUIRES positive evidence — documentation alone must not activate it.
            const hasAcademicEvidence = signals.has_academic_markers || hasVerifiedLowActivity;
            if (!hasAcademicEvidence) {
                fitnessScore = 0;
            }

            // ML suppresses academic
            if (signals.has_ml_components) {
                fitnessScore = Math.max(0, fitnessScore - 0.20);
            }

            if (signals.has_frontend || signals.has_static_frontend) {
                fitnessScore = Math.max(0, fitnessScore - 0.35);
            }
            if (signals.has_backend || signals.has_api_routes || signals.has_server_entrypoint) {
                fitnessScore = Math.max(0, fitnessScore - 0.40);
            }
            if (signals.has_database) {
                fitnessScore = Math.max(0, fitnessScore - 0.15);
            }
            if (signals.is_library_package || signals.has_library_exports) {
                fitnessScore = Math.max(0, fitnessScore - 0.35);
            }
            if (signals.is_cli_entrypoint) {
                fitnessScore = Math.max(0, fitnessScore - 0.35);
            }

            // Safety: academic must never win for high-activity repos
            if (commitSpanDays > 730) {
                fitnessScore = 0;
            }
        }

        // ── Rule 2: Backend Dominance Over Library ────────────────────
        // Additive suppression — each condition stacks independently
        if (profile.id === 'library') {
            if (signals.has_backend) {
                fitnessScore = Math.max(0, fitnessScore - 0.35);
            }
            if (signals.has_server_entrypoint || signals.has_api_routes) {
                fitnessScore = Math.max(0, fitnessScore - 0.20);
            }
            if (signals.has_backend && signals.has_database) {
                fitnessScore = Math.max(0, fitnessScore - 0.10); // additional on top of -0.35
            }
            if (signals.has_docker) {
                fitnessScore = Math.max(0, fitnessScore - 0.20);
            }
            // Safety: library must not win if has_backend + high commit count
            const commitCount = metrics?.commit_count ?? 0;
            if (signals.has_backend && commitCount > 100) {
                fitnessScore = Math.max(0, fitnessScore - 0.20);
            }
            if (signals.has_library_exports) {
                fitnessScore = Math.min(1.0, fitnessScore + 0.20);
            }
        }

        // Boost backend when server signals are present
        if (profile.id === 'backend_api') {
            if (signals.has_docker) {
                fitnessScore = Math.min(1.0, fitnessScore + 0.10);
            }
            if (signals.has_server_entrypoint) {
                fitnessScore = Math.min(1.0, fitnessScore + 0.20);
            }
            if (signals.has_api_routes) {
                fitnessScore = Math.min(1.0, fitnessScore + 0.15);
            }
            if (signals.has_database) {
                fitnessScore = Math.min(1.0, fitnessScore + 0.05);
            }
        }

        // ── Rule 3: CLI Dominance Boost ───────────────────────────────
        // Fix 3: Suppress cli_tool when backend/frontend structure present
        if (profile.id === 'cli_tool') {
            if (signals.has_backend) {
                fitnessScore = Math.max(0, fitnessScore - 0.35);
            }
            if (signals.has_frontend) {
                fitnessScore = Math.max(0, fitnessScore - 0.25);
            }
            if (!signals.is_cli_entrypoint) {
                fitnessScore = Math.max(0, fitnessScore - 0.20);
            }
        }
        if (signals.is_cli_tool) {
            if (profile.id === 'cli_tool') {
                fitnessScore = Math.min(1.0, fitnessScore + 0.35);
            }
            if (profile.id === 'academic') {
                fitnessScore = Math.max(0, fitnessScore - 0.25);
            }
            if (profile.id === 'library') {
                // Stronger suppression: CLI tools with library-like packaging should still classify as CLI
                fitnessScore = Math.max(0, fitnessScore - 0.25);
            }
            if (profile.id === 'generic') {
                fitnessScore = Math.max(0, fitnessScore - 0.20);
            }
        }

        // ── Rule 4: Production Web App Reinforcement ─────────────────
        if (signals.has_frontend && signals.has_backend) {
            if (profile.id === 'production_web_app') {
                fitnessScore = Math.min(1.0, fitnessScore + 0.30);
            }
            if (profile.id === 'library') {
                fitnessScore = Math.max(0, fitnessScore - 0.30);
            }
            if (profile.id === 'academic') {
                fitnessScore = Math.max(0, fitnessScore - 0.30);
            }
        }

        if (profile.id === 'frontend_app' && signals.has_static_frontend) {
            fitnessScore = Math.min(1.0, fitnessScore + 0.15);
        }

        // ── Rule 5: Monorepo → production_web_app boost ──────────────
        // Fix 6: Well-structured monorepos should not fall to generic
        if (signals.is_monorepo && profile.id === 'production_web_app') {
            fitnessScore = Math.min(1.0, fitnessScore + 0.20);
        }

        // ── Rule 6: Academic infra cap ───────────────────────────────
        // Fix 5: Academic with strong infrastructure shouldn't score high
        if (profile.id === 'academic' && signals.has_tests && signals.has_ci) {
            fitnessScore = Math.max(0, fitnessScore - 0.15);
        }

        // ── Rule 7: Library ↔ Frontend mutual suppression ────────────
        // R2-5: Libraries with frontend deps shouldn't become frontend_app
        if (profile.id === 'frontend_app' && signals.is_library_package) {
            fitnessScore = Math.max(0, fitnessScore - 0.30);
        }

        return {
            profileId: profile.id,
            displayName: profile.displayName,
            fitnessScore,
            status: fitnessScore >= profile.fitnessThreshold ? 'active' : 'rejected',
            matchedSignals,
            missingSignals
        };
    });

    return results.sort((a, b) => b.fitnessScore - a.fitnessScore);
}

export function computeCapabilityVector(
    profiles: ProfileResult[],
    metrics: Partial<RawMetrics>,
    confidenceScores: Record<string, number> = {},
    authenticity?: AuthenticityMetrics
): CapabilityVector {
    const vector: Partial<CapabilityVector> = {};
    for (const p of profiles) {
        let confidence = 1.0;

        // Apply Usage Validation Layer safeguards preventing structural spoofing
        const usageRatio = authenticity?.dependency_usage_ratio ?? 1.0;

        if (p.profileId === 'backend_api' && (metrics.total_loc || 0) < 100) confidence = 0.5;
        if (p.profileId === 'frontend_app' || p.profileId === 'production_web_app') {
            const markup = (metrics.markup_loc?.html || 0) + (metrics.markup_loc?.css || 0);
            if (markup === 0) confidence = 0.3;
            if (usageRatio < 0.3) confidence *= 0.5; // Has frontend dependencies but usage ratio is critically low
        }
        if (p.profileId === 'ml_pipeline' && (confidenceScores.ast_complexity || 1.0) < 0.8) {
             confidence = 0.4;
        }
        if (p.profileId === 'cli_tool' && !metrics.has_bin_field) {
             confidence = 0.6;
        }

        vector[p.profileId] = {
            value: Math.max(0, p.fitnessScore),
            confidence
        };
    }
    return vector as CapabilityVector;
}
