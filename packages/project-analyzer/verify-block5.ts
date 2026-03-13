import { detectGaming } from './src/anti-gaming/anti-gaming';
import { RawMetrics } from './src/metrics/metrics';
import { StructuralSignals } from './src/signals/signals';

const SCENARIOS = [
  {
    name: "The Massive Boilerplate (Empty Shell)",
    metrics: { total_loc: 100000, complexity_avg: 0.2, commit_count: 10, commit_span_days: 5, is_fork: false, file_count: 50, dependency_count: 5 },
    profileId: 'production_web_app',
    expectedFlag: "Empty Shell / Boilerplate",
    expectedSeverity: "high"
  },
  {
    name: "The Tutorial Speedrun (Commit Burst)",
    metrics: { total_loc: 2000, complexity_avg: 3.5, commit_count: 85, commit_span_days: 0.5, is_fork: false, file_count: 20, dependency_count: 5 },
    profileId: 'academic',
    expectedFlag: "Commit Burst",
    expectedSeverity: "low"  // academic profile => low severity
  },
  {
    name: "The Fork Collector (Fork Minimalist)",
    metrics: { total_loc: 50000, complexity_avg: 8.2, commit_count: 2, commit_span_days: 1, is_fork: true, file_count: 100, dependency_count: 10 },
    profileId: 'backend_api',
    expectedFlag: "Fork Minimal Divergence",
    expectedSeverity: "high"
  },
  {
    name: "The Legit High-Perf Engineer (No Flags)",
    metrics: { total_loc: 45000, complexity_avg: 12.5, commit_count: 350, commit_span_days: 90, is_fork: false, file_count: 200, dependency_count: 15, test_file_count: 20 },
    profileId: 'production_web_app',
    expectedFlag: null,
    expectedSeverity: null
  },
  {
    name: "The Edge Case: Tiny Valid Script",
    metrics: { total_loc: 50, complexity_avg: 5.0, commit_count: 2, commit_span_days: 1, is_fork: false, file_count: 3, dependency_count: 0 },
    profileId: 'cli_tool',
    expectedFlag: null,
    expectedSeverity: null
  }
];

function runStressTest() {
  console.log("🛡️ Starting Block 5 Stress Test...\n");
  let passed = 0;

  SCENARIOS.forEach(scenario => {
    const report = detectGaming(scenario.metrics as RawMetrics, {} as StructuralSignals, scenario.profileId);
    const foundFlag = report.flags.find(f => f.pattern === scenario.expectedFlag);

    if (scenario.expectedFlag === null) {
      if (report.flagCount === 0) {
        console.log(`✅ PASS: [${scenario.name}] - Clean as expected.`);
        passed++;
      } else {
        console.log(`❌ FAIL: [${scenario.name}] - Unexpected flags found:`, report.flags.map(f => f.pattern));
      }
    } else {
      if (foundFlag && foundFlag.severity === scenario.expectedSeverity) {
        console.log(`✅ PASS: [${scenario.name}] - Correctly flagged ${scenario.expectedFlag} (${foundFlag.severity}).`);
        passed++;
      } else {
        console.log(`❌ FAIL: [${scenario.name}] - Expected ${scenario.expectedFlag} (${scenario.expectedSeverity}), but got:`, foundFlag ? `${foundFlag.pattern} (${foundFlag.severity})` : "None");
        if (report.flags.length > 0) console.log(`   All flags: ${report.flags.map(f => `${f.pattern}(${f.severity})`).join(', ')}`);
      }
    }
  });

  console.log(`\n📊 Final Result: ${passed}/${SCENARIOS.length} scenarios passed.`);
  if (passed !== SCENARIOS.length) process.exit(1);
}

runStressTest();