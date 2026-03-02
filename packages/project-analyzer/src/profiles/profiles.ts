import { StructuralSignals } from '../signals/signals';

export type ProfileId = 'production_web_app' | 'backend_api' | 'frontend_app' | 'library' | 'generic';

export interface ProfileResult {
    profileId: ProfileId;
    displayName: string;
    fitnessScore: number; // 0.0 to 1.0
    status: 'active' | 'rejected';
    matchedSignals: string[];
    missingSignals: string[];
}

type ProfileConfig = {
    id: ProfileId;
    displayName: string;
    expectedSignals: Partial<Record<keyof StructuralSignals, number>>;
};

const PROFILES: ProfileConfig[] = [
    {
        id: 'production_web_app',
        displayName: 'Production Web Application',
        expectedSignals: {
            has_frontend: 25,
            has_backend: 25,
            has_database: 20,
            has_tests: 15,
            has_ci: 10,
            has_docker: 5
        }
    },
    {
        id: 'backend_api',
        displayName: 'REST/Backend API Service',
        expectedSignals: {
            has_backend: 40,
            has_database: 30,
            has_tests: 20,
            has_docker: 10
        }
    },
    {
        id: 'frontend_app',
        displayName: 'Frontend Web Application',
        expectedSignals: {
            has_frontend: 60,
            has_tests: 20,
            has_ci: 20
        }
    }
];

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

        const fitnessScore = totalWeight > 0 ? earnedWeight / totalWeight : 0;

        return {
            profileId: profile.id,
            displayName: profile.displayName,
            fitnessScore,
            status: fitnessScore >= 0.50 ? 'active' : 'rejected',
            matchedSignals,
            missingSignals
        };
    });

    return results.sort((a, b) => b.fitnessScore - a.fitnessScore);
}
