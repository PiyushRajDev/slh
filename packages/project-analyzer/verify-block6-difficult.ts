import { selectBestProfile, AnalysisCandidate } from './src/selection/selection';

const GAUNTLET_SCENARIOS: { name: string; candidates: AnalysisCandidate[]; expectedProfile: string }[] = [
  {
    name: "Scenario A: High Score but High Risk vs. Solid Mid Score",
    candidates: [
      {
        profile: { profileId: 'backend_api', displayName: 'Backend API', status: 'active', fitnessScore: 0.9 } as any,
        score: { overallScore: 92 } as any,
        antiGaming: { flags: [{ severity: 'high' }, { severity: 'medium' }], flagCount: 2, reliabilityScore: 0.595, reliabilityLevel: 'LOW' } as any
        // Defensible: 92 * 0.9 * 0.595 = 49.27
      },
      {
        profile: { profileId: 'production_web_app', displayName: 'Web App', status: 'active', fitnessScore: 0.7 } as any,
        score: { overallScore: 68 } as any,
        antiGaming: { flags: [], flagCount: 0, reliabilityScore: 1.0, reliabilityLevel: 'HIGH' } as any
        // Defensible: 68 * 0.7 * 1.0 = 47.6
      }
    ],
    // 49.27 > 47.6, so backend_api wins despite having flags
    expectedProfile: 'backend_api'
  },
  {
    name: "Scenario B: Tied Defensible Scores (Fitness Tie-breaker)",
    candidates: [
      {
        profile: { profileId: 'frontend_app', displayName: 'Frontend', status: 'active', fitnessScore: 0.6 } as any,
        score: { overallScore: 50 } as any,
        antiGaming: { flags: [], flagCount: 0, reliabilityScore: 1.0, reliabilityLevel: 'HIGH' } as any
        // Defensible: 50 * 0.6 * 1.0 = 30
      },
      {
        profile: { profileId: 'production_web_app', displayName: 'Web App', status: 'active', fitnessScore: 0.85 } as any,
        score: { overallScore: 50 } as any,
        antiGaming: { flags: [], flagCount: 0, reliabilityScore: 1.0, reliabilityLevel: 'HIGH' } as any
        // Defensible: 50 * 0.85 * 1.0 = 42.5
      }
    ],
    expectedProfile: 'production_web_app' // Higher defensible score (42.5 vs 30)
  },
  {
    name: "Scenario C: Extreme Dampening (The 'Fake' Repo)",
    candidates: [
      {
        profile: { profileId: 'generic', displayName: 'Generic', status: 'active', fitnessScore: 0.5 } as any,
        score: { overallScore: 95 } as any,
        antiGaming: { flags: [{ severity: 'high' }, { severity: 'high' }, { severity: 'high' }], flagCount: 3, reliabilityScore: 0.343, reliabilityLevel: 'LOW' } as any
        // Defensible: 95 * 0.5 * 0.343 = 16.3
      }
    ],
    expectedProfile: 'generic' // Must still return a result
  }
];

function runGauntlet() {
  console.log("🔥 Starting Block 6 Selection Gauntlet...\n");
  let passed = 0;

  GAUNTLET_SCENARIOS.forEach(scenario => {
    const winner = selectBestProfile(scenario.candidates);
    const success = winner.profileId === scenario.expectedProfile;

    if (success) {
      console.log(`✅ [PASS] ${scenario.name}`);
      console.log(`   Selected: ${winner.displayName} | Defensible: ${winner.defensibleScore.toFixed(2)} | Level: ${winner.reliabilityLevel}`);
      passed++;
    } else {
      console.log(`❌ [FAIL] ${scenario.name}`);
      console.log(`   Expected ${scenario.expectedProfile}, but got ${winner.profileId}`);
    }
  });

  console.log(`\n📊 Gauntlet Results: ${passed}/${GAUNTLET_SCENARIOS.length}`);
  if (passed !== GAUNTLET_SCENARIOS.length) process.exit(1);
}

runGauntlet();