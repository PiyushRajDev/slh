import { selectBestProfile, AnalysisCandidate } from './src/selection/selection';

const GAUNTLET_SCENARIOS: { name: string; candidates: AnalysisCandidate[]; expectedProfile: string }[] = [
  {
    name: "Scenario A: High Score but High Risk vs. Solid Mid Score",
    candidates: [
      {
        profile: { profileId: 'backend_api', displayName: 'Backend API', status: 'active', fitnessScore: 0.9 } as any,
        score: { overallScore: 92 } as any,
        antiGaming: { flags: [{ severity: 'high' }, { severity: 'medium' }] } as any // Reliability: 1.0 - 0.30 - 0.15 = 0.55
      },
      {
        profile: { profileId: 'production_web_app', displayName: 'Web App', status: 'active', fitnessScore: 0.7 } as any,
        score: { overallScore: 68 } as any,
        antiGaming: { flags: [] } as any // Reliability: 1.0
      }
    ],
    expectedProfile: 'production_web_app' // 92 * 0.55 = 50.6 vs 68 * 1.0 = 68
  },
  {
    name: "Scenario B: Tied Defensible Scores (Fitness Tie-breaker)",
    candidates: [
      {
        profile: { profileId: 'frontend_app', displayName: 'Frontend', status: 'active', fitnessScore: 0.6 } as any,
        score: { overallScore: 50 } as any,
        antiGaming: { flags: [] } as any
      },
      {
        profile: { profileId: 'production_web_app', displayName: 'Web App', status: 'active', fitnessScore: 0.85 } as any,
        score: { overallScore: 50 } as any,
        antiGaming: { flags: [] } as any
      }
    ],
    expectedProfile: 'production_web_app' // Both are 50, but Web App has higher fitness
  },
  {
    name: "Scenario C: Extreme Dampening (The 'Fake' Repo)",
    candidates: [
      {
        profile: { profileId: 'generic', displayName: 'Generic', status: 'active', fitnessScore: 0.5 } as any,
        score: { overallScore: 95 } as any,
        antiGaming: { flags: [{ severity: 'high' }, { severity: 'high' }, { severity: 'high' }] } as any // Reliability: 0.1
      }
    ],
    expectedProfile: 'generic' // Must still return a result even if score is crushed
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