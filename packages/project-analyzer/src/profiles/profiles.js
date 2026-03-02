"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateProfiles = evaluateProfiles;
var PROFILES = [
    {
        id: 'production_web_app',
        displayName: 'Production Web Application',
        fitnessThreshold: 0.60,
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
        fitnessThreshold: 0.65,
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
        fitnessThreshold: 0.50,
        expectedSignals: {
            has_frontend: 60,
            has_tests: 20,
            has_ci: 20
        }
    },
    {
        id: 'ml_pipeline',
        displayName: 'ML Pipeline / Research Project',
        fitnessThreshold: 0.55,
        expectedSignals: { has_tests: 25, has_documentation: 30, has_backend: 20, has_ci: 25 }
    },
    {
        id: 'cli_tool',
        displayName: 'Command-Line Tool',
        fitnessThreshold: 0.60,
        expectedSignals: { has_tests: 35, has_documentation: 30, has_ci: 20 }
    },
    {
        id: 'library',
        displayName: 'Reusable Library / Package',
        fitnessThreshold: 0.65,
        expectedSignals: { has_tests: 45, has_documentation: 35, has_ci: 20 }
    },
    {
        id: 'academic',
        displayName: 'Academic Assignment',
        fitnessThreshold: 0.50,
        expectedSignals: { has_documentation: 50, has_tests: 30, has_ci: 20 }
    },
    {
        id: 'generic',
        displayName: 'General Project',
        fitnessThreshold: 0.0,
        expectedSignals: {}
    }
];
function evaluateProfiles(signals) {
    var results = PROFILES.map(function (profile) {
        var totalWeight = 0;
        var earnedWeight = 0;
        var matchedSignals = [];
        var missingSignals = [];
        for (var _i = 0, _a = Object.entries(profile.expectedSignals); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], weight = _b[1];
            var signalKey = key;
            var signalWeight = weight;
            totalWeight += signalWeight;
            if (signals[signalKey] === true) {
                earnedWeight += signalWeight;
                matchedSignals.push(signalKey);
            }
            else {
                missingSignals.push(signalKey);
            }
        }
        var fitnessScore = totalWeight > 0 ? earnedWeight / totalWeight : 0.30;
        return {
            profileId: profile.id,
            displayName: profile.displayName,
            fitnessScore: fitnessScore,
            status: fitnessScore >= profile.fitnessThreshold ? 'active' : 'rejected',
            matchedSignals: matchedSignals,
            missingSignals: missingSignals
        };
    });
    return results.sort(function (a, b) { return b.fitnessScore - a.fitnessScore; });
}
