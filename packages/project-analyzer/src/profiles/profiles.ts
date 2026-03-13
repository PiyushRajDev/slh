import { StructuralSignals } from '../signals/signals';
import { RawMetrics } from '../metrics/metrics';

export type ProfileId = 'production_web_app' | 'backend_api' | 'frontend_app' | 'ml_pipeline' | 'cli_tool' | 'library' | 'academic' | 'generic';

export interface ProfileResult {
    profileId: ProfileId;
    displayName: string;
    fitnessScore: number; // 0.0 to 1.0
    status: 'active' | 'rejected';
    matchedSignals: string[];
    missingSignals: string[];
}

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
            has_frontend: 25,
            has_backend: 25,
            has_database: 20,
            has_tests: 15,
            has_ci: 10,
            has_deployment_config: 5
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
            has_backend: 40,
            has_database: 25,
            has_tests: 20,
            has_deployment_config: 15
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
            has_frontend: 60,
            has_tests: 20,
            has_ci: 20
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
            has_tests: 40,
            is_library_package: 35,
            has_documentation: 30,
            is_minimal: 10
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
        fitnessThreshold: 0.50,
        expectedSignals: {
            is_short_timeline: 25,
            has_documentation: 25
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

            // Pre-score suppression: mature repos are NOT academic
            if (commitCount > 150 || commitSpanDays > 365 || contributorCount > 2) {
                fitnessScore = Math.max(0, fitnessScore - 0.50);
            }

            // Academic REQUIRES positive evidence — not just absence of infra
            // No evidence → zero out completely
            const hasAcademicEvidence = signals.is_short_timeline;
            if (!hasAcademicEvidence) {
                fitnessScore = 0;
            }

            // ML suppresses academic
            if (signals.has_ml_components) {
                fitnessScore = Math.max(0, fitnessScore - 0.20);
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
        }

        // Boost backend when server signals are present
        if (profile.id === 'backend_api') {
            if (signals.has_docker) {
                fitnessScore = Math.min(1.0, fitnessScore + 0.10);
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
