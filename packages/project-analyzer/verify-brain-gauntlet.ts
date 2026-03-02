import { calculateScore } from './src/scoring/scoring';
import { detectGaming } from './src/anti-gaming/anti-gaming';
import { selectBestProfile, AnalysisCandidate } from './src/selection/selection';
import { calculateConfidence } from './src/confidence/confidence';
import { RawMetrics } from './src/metrics/metrics';

function randomMetric(): number {
  const pool = [
    Math.random() * 1000,
    Math.random() * 1e6,
    -Math.random() * 100,
    NaN,
    Infinity,
    undefined as any
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateFuzzMetrics(): RawMetrics {
  return {
    complexity_avg: randomMetric(),
    total_loc: randomMetric(),
    commit_count: randomMetric(),
    commit_span_days: randomMetric(),
    folder_count: randomMetric(),
    max_depth: randomMetric(),
    long_functions_count: randomMetric()
  } as unknown as RawMetrics;
}

const HARDENED_GAUNTLET = [

  {
    name: "Invariant: 1000 Random Score Runs Stay Finite & Bounded",
    execute: () => {
      for (let i = 0; i < 1000; i++) {
        const report = calculateScore(generateFuzzMetrics(), 'backend_api');
        if (!Number.isFinite(report.overallScore)) return false;
        if (report.overallScore < 0 || report.overallScore > 100) return false;
      }
      return true;
    },
    failureMessage: "Randomized fuzzing broke score invariants."
  },

  {
    name: "Monotonicity: Increasing Clean Metrics Should Not Reduce Score",
    execute: () => {
      const base: RawMetrics = {
        total_loc: 1000,
        complexity_avg: 5,
        commit_count: 20,
        commit_span_days: 30
      } as RawMetrics;

      const improved: RawMetrics = {
        ...base,
        total_loc: 5000,
        commit_count: 100
      } as RawMetrics;

      const scoreA = calculateScore(base, 'production_web_app').overallScore;
      const scoreB = calculateScore(improved, 'production_web_app').overallScore;

      return scoreB >= scoreA;
    },
    failureMessage: "Score decreased when clean metrics improved."
  },

  {
    name: "Reliability Collapse: 10 High Flags Must Nullify Dominance",
    execute: () => {
      const candidates: AnalysisCandidate[] = [
        {
          profile: { profileId: 'exploit', displayName: '', status: 'active', fitnessScore: 1 } as any,
          score: { overallScore: 100 } as any,
          antiGaming: { flags: Array(10).fill({ severity: 'high' }) } as any
        },
        {
          profile: { profileId: 'clean', displayName: '', status: 'active', fitnessScore: 0.5 } as any,
          score: { overallScore: 20 } as any,
          antiGaming: { flags: [] } as any
        }
      ];

      const winner = selectBestProfile(candidates);
      return winner.profileId === 'clean';
    },
    failureMessage: "Extreme reliability decay did not defeat inflated score."
  },

  {
    name: "Anti-Gaming Evasion: Split Boilerplate Across Commits",
    execute: () => {
      const metrics: RawMetrics = {
        total_loc: 5_000_000,
        complexity_avg: 0.00001,
        commit_count: 200,
        commit_span_days: 2
      } as RawMetrics;

      const report = detectGaming(metrics, {} as any);
      const emptyShell = report.flags.find(f => f.pattern === 'Empty Shell');

      return emptyShell?.severity === 'high';
    },
    failureMessage: "Distributed boilerplate evaded detection."
  },

  {
    name: "Confidence Stability: Repeated Runs Must Match",
    execute: () => {
      const metrics: RawMetrics = {
        total_loc: 8000,
        complexity_avg: 6,
        commit_count: 50,
        commit_span_days: 60
      } as RawMetrics;

      const selection = {
        fitnessScore: 0.8,
        reliabilityScore: 0.9,
        profileId: 'backend_api'
      };

      const a = calculateConfidence(metrics, selection as any).overallConfidence;
      const b = calculateConfidence(metrics, selection as any).overallConfidence;

      return a === b;
    },
    failureMessage: "Confidence output is non-deterministic."
  },

  {
    name: "Cross-System Integrity: High Score + High Flags → Low Confidence",
    execute: () => {
      const metrics: RawMetrics = {
        total_loc: 20000,
        complexity_avg: 10,
        commit_count: 150,
        commit_span_days: 90
      } as RawMetrics;

      const score = calculateScore(metrics, 'backend_api');
      const gaming = { flags: Array(5).fill({ severity: 'high' }) };

      const selection = {
        fitnessScore: 0.95,
        reliabilityScore: 0.2,
        profileId: 'backend_api'
      };

      const confidence = calculateConfidence(metrics, selection as any);

      return confidence.level !== 'HIGH';
    },
    failureMessage: "Confidence ignored reliability decay."
  },

  {
    name: "Sorting Determinism Under Equal Scores",
    execute: () => {
      const candidates: AnalysisCandidate[] = [
        {
          profile: { profileId: 'a', status: 'active', fitnessScore: 0.8 } as any,
          score: { overallScore: 50 } as any,
          antiGaming: { flags: [] } as any
        },
        {
          profile: { profileId: 'b', status: 'active', fitnessScore: 0.8 } as any,
          score: { overallScore: 50 } as any,
          antiGaming: { flags: [] } as any
        }
      ];

      const firstRun = selectBestProfile(candidates).profileId;
      const secondRun = selectBestProfile(candidates).profileId;

      return firstRun === secondRun;
    },
    failureMessage: "Selection not deterministic under equal inputs."
  }

];

async function runHardenedGauntlet() {
  console.log("🔥 Executing SLH Brain Tier-2 Production Gauntlet...\n");
  let passed = 0;

  for (const test of HARDENED_GAUNTLET) {
    try {
      const success = test.execute();
      if (success) {
        console.log(`✅ [PASS] ${test.name}`);
        passed++;
      } else {
        console.log(`❌ [FAIL] ${test.name}`);
        console.log(`   Reason: ${test.failureMessage}`);
      }
    } catch (e) {
      console.log(`💥 [CRASH] ${test.name}`);
      console.error(e);
    }
  }

  console.log(`\n📊 Hardened Gauntlet Results: ${passed}/${HARDENED_GAUNTLET.length}`);

  if (passed !== HARDENED_GAUNTLET.length) {
    console.log("🚨 PRODUCTION HARDENING FAILED. DEPLOYMENT BLOCKED.");
    process.exit(1);
  } else {
    console.log("🟢 SLH Brain survived Tier-2 adversarial stress.");
  }
}

runHardenedGauntlet();