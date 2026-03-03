import { StructuralSignals } from '../signals/signals';

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
        fitnessThreshold: 0.65,
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
            // ML code is inherently complex — weight quality lower, git discipline higher
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
            is_minimal: 20,
            has_tests: 30,
            has_documentation: 25
        },
        scoringWeights: {
            codeQuality: 0.35,
            architecture: 0.15,
            testing: 0.30,
            git: 0.20,
            devops: 0.0  // N/A for CLIs
        }
    },
    {
        id: 'library',
        displayName: 'Reusable Library / Package',
        fitnessThreshold: 0.65,
        expectedSignals: {
            has_tests: 40,
            has_documentation: 30,
            is_minimal: 10
        },
        scoringWeights: {
            codeQuality: 0.35,
            architecture: 0.20,
            testing: 0.35,  // Critical for libraries
            git: 0.10,
            devops: 0.0  // Libraries don't deploy
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
            testing: 0.15,  // Lower expectations
            git: 0.15,      // Lower weight
            devops: 0.0     // Often irrelevant for assignments
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

export function evaluateProfiles(signals: StructuralSignals): ProfileResult[] {
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
        const fitnessScore = totalWeight > 0 ? earnedWeight / totalWeight : 0.0;

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
