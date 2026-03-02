import { calculateConfidence } from './src/confidence/confidence';
import { RawMetrics } from './src/metrics/metrics';
import { SelectionResult } from './src/selection/selection';

const EXTREME_SCENARIOS = [
  {
    name: "Commit Spammer (Artificial Volume Inflation)",
    metrics: {
      commit_count: 2000,
      commit_span_days: 3,
      total_loc: 800
    } as RawMetrics,
    selection: {
      fitnessScore: 0.92,
      reliabilityScore: 0.91,
      profileId: 'backend_api'
    } as SelectionResult,
    expectedLevel: 'LOW',
    expectedMaxRange: 15
  },
  {
    name: "Single Massive Dump",
    metrics: {
      commit_count: 1,
      commit_span_days: 1,
      total_loc: 75000
    } as RawMetrics,
    selection: {
      fitnessScore: 0.95,
      reliabilityScore: 0.95,
      profileId: 'production_web_app'
    } as SelectionResult,
    expectedLevel: 'LOW',
    expectedMaxRange: 15
  },
  {
    name: "Time Gap Zombie",
    metrics: {
      commit_count: 12,
      commit_span_days: 720,
      total_loc: 4000
    } as RawMetrics,
    selection: {
      fitnessScore: 0.88,
      reliabilityScore: 0.86,
      profileId: 'frontend_app'
    } as SelectionResult,
    expectedLevel: 'MEDIUM',
    expectedMaxRange: 8
  },
  {
    name: "High Quality Micro Repo",
    metrics: {
      commit_count: 6,
      commit_span_days: 10,
      total_loc: 300
    } as RawMetrics,
    selection: {
      fitnessScore: 0.99,
      reliabilityScore: 0.98,
      profileId: 'frontend_app'
    } as SelectionResult,
    expectedLevel: 'MEDIUM',
    expectedMaxRange: 8
  },
  {
    name: "Contradictory Signals",
    metrics: {
      commit_count: 80,
      commit_span_days: 40,
      total_loc: 12000
    } as RawMetrics,
    selection: {
      fitnessScore: 0.95,
      reliabilityScore: 0.35,
      profileId: 'backend_api'
    } as SelectionResult,
    expectedLevel: 'MEDIUM',
    expectedMaxRange: 8
  },
  {
    name: "Floating Precision Edge",
    metrics: {
      commit_count: 19.999999,
      commit_span_days: 13.999999,
      total_loc: 999.999
    } as RawMetrics,
    selection: {
      fitnessScore: 0.8499999,
      reliabilityScore: 0.8499999,
      profileId: 'frontend_app'
    } as SelectionResult,
    expectedLevel: 'MEDIUM',
    expectedMaxRange: 8
  },
  {
    name: "Outlier Explosion",
    metrics: {
      commit_count: 25000,
      commit_span_days: 3650,
      total_loc: 2000000
    } as RawMetrics,
    selection: {
      fitnessScore: 0.6,
      reliabilityScore: 0.6,
      profileId: 'generic'
    } as SelectionResult,
    expectedLevel: 'MEDIUM',
    expectedMaxRange: 8
  },
  {
    name: "Corrupted Metrics Injection",
    metrics: {
      commit_count: -10,
      commit_span_days: -5,
      total_loc: -300
    } as RawMetrics,
    selection: {
      fitnessScore: 0.8,
      reliabilityScore: 0.8,
      profileId: 'backend_api'
    } as SelectionResult,
    expectedLevel: 'LOW',
    expectedMaxRange: 15
  },
  {
    name: "NaN Metrics Propagation",
    metrics: {
      commit_count: NaN,
      commit_span_days: NaN,
      total_loc: NaN
    } as RawMetrics,
    selection: {
      fitnessScore: NaN,
      reliabilityScore: NaN,
      profileId: 'generic'
    } as SelectionResult,
    expectedLevel: 'LOW',
    expectedMaxRange: 15
  },
  {
    name: "Reliable But Weak Fit",
    metrics: {
      commit_count: 120,
      commit_span_days: 60,
      total_loc: 18000
    } as RawMetrics,
    selection: {
      fitnessScore: 0.3,
      reliabilityScore: 0.92,
      profileId: 'production_web_app'
    } as SelectionResult,
    expectedLevel: 'MEDIUM',
    expectedMaxRange: 8
  }
];

function runExtremeConfidenceTest() {
  console.log("🔥 Starting Production-Grade Confidence Stress Test...\n");

  let passed = 0;

  EXTREME_SCENARIOS.forEach((scenario, index) => {
    try {
      const report = calculateConfidence(scenario.metrics, scenario.selection);

      const levelMatch = report.level === scenario.expectedLevel;
      const rangeMatch = report.scoreRange === scenario.expectedMaxRange;

      const withinBounds =
        report.overallConfidence >= 0 &&
        report.overallConfidence <= 1 &&
        Number.isFinite(report.overallConfidence);

      const success = levelMatch && rangeMatch && withinBounds;

      if (success) {
        console.log(`✅ [PASS ${index + 1}/10] ${scenario.name}`);
        console.log(
          `   Confidence: ${(report.overallConfidence * 100).toFixed(2)}% | Range: ±${report.scoreRange}`
        );
        passed++;
      } else {
        console.log(`❌ [FAIL ${index + 1}/10] ${scenario.name}`);
        console.log(
          `   Expected ${scenario.expectedLevel} (±${scenario.expectedMaxRange})`
        );
        console.log(
          `   Got ${report.level} (±${report.scoreRange})`
        );
        console.log(
          `   Confidence: ${report.overallConfidence}`
        );
        console.log(
          `   Factors: ${JSON.stringify(report.factors, null, 2)}`
        );
      }
    } catch (error) {
      console.log(`💥 [CRASH ${index + 1}/10] ${scenario.name}`);
      console.error(error);
    }

    console.log("----------------------------------------------------\n");
  });

  console.log(`📊 Final Result: ${passed}/10 Passed`);

  if (passed !== EXTREME_SCENARIOS.length) {
    console.log("🚨 Confidence Engine NOT production safe.");
    process.exit(1);
  }

  console.log("🟢 Confidence Engine survived extreme testing.");
}

runExtremeConfidenceTest();