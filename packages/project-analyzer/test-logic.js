function calculateConfidence(metrics, selection) {
  const countRaw = Number(metrics.commit_count);
  const spanRaw = Number(metrics.commit_span_days);
  const locRaw = Number(metrics.total_loc);

  const commitCount = Number.isFinite(countRaw) ? Math.max(0, countRaw) : 0;
  const commitSpanDays = Number.isFinite(spanRaw) ? Math.max(0, spanRaw) : 0;
  const totalLoc = Number.isFinite(locRaw) ? Math.max(0, locRaw) : 0;

  const matchRaw = Number(selection.fitnessScore);
  const relRaw = Number(selection.reliabilityScore);
  const profileMatch = Number.isFinite(matchRaw) ? Math.max(0, matchRaw) : 0;
  const reliability = Number.isFinite(relRaw) ? Math.max(0, relRaw) : 0;

  let dataCompleteness = (Math.min(1, commitCount / 20) * 0.4) +
                         (Math.min(1, commitSpanDays / 14) * 0.3) +
                         (Math.min(1, totalLoc / 1000) * 0.3);

  let overallConfidence = (dataCompleteness * 0.4) + (profileMatch * 0.3) + (reliability * 0.3);

  if (commitSpanDays < 5 || commitCount < 5) overallConfidence = Math.min(overallConfidence, 0.60);
  else if (commitCount < 20) overallConfidence = Math.min(overallConfidence, 0.85);

  let level = 'LOW';
  let scoreRange = 15;

  if (overallConfidence > 0.85) {
    level = 'HIGH';
    scoreRange = 3;
  } else if (overallConfidence > 0.60) {
    level = 'MEDIUM';
    scoreRange = 8;
  }
  
  return {overallConfidence, level, scoreRange};
}

const scenarios = [
  {name: "Spammer", m: {commit_count: 2000, commit_span_days: 3, total_loc: 800}, s: {fitnessScore: 0.92, reliabilityScore: 0.91}, expect: 'LOW'},
  {name: "Dump", m: {commit_count: 1, commit_span_days: 1, total_loc: 75000}, s: {fitnessScore: 0.95, reliabilityScore: 0.95}, expect: 'LOW'},
  {name: "Zombie", m: {commit_count: 12, commit_span_days: 720, total_loc: 4000}, s: {fitnessScore: 0.88, reliabilityScore: 0.86}, expect: 'MEDIUM'},
  {name: "Micro", m: {commit_count: 6, commit_span_days: 10, total_loc: 300}, s: {fitnessScore: 0.99, reliabilityScore: 0.98}, expect: 'MEDIUM'},
  {name: "Contra", m: {commit_count: 80, commit_span_days: 40, total_loc: 12000}, s: {fitnessScore: 0.95, reliabilityScore: 0.35}, expect: 'MEDIUM'},
  {name: "Float", m: {commit_count: 19.999999, commit_span_days: 13.999999, total_loc: 999.999}, s: {fitnessScore: 0.8499999, reliabilityScore: 0.8499999}, expect: 'MEDIUM'},
  {name: "Outlier", m: {commit_count: 25000, commit_span_days: 3650, total_loc: 2000000}, s: {fitnessScore: 0.6, reliabilityScore: 0.6}, expect: 'MEDIUM'},
  {name: "Corrupt", m: {commit_count: -10, commit_span_days: -5, total_loc: -300}, s: {fitnessScore: 0.8, reliabilityScore: 0.8}, expect: 'LOW'},
  {name: "NaN", m: {commit_count: NaN, commit_span_days: NaN, total_loc: NaN}, s: {fitnessScore: NaN, reliabilityScore: NaN}, expect: 'LOW'},
  {name: "Reliable Weak", m: {commit_count: 120, commit_span_days: 60, total_loc: 18000}, s: {fitnessScore: 0.3, reliabilityScore: 0.92}, expect: 'MEDIUM'}
];

scenarios.forEach(sc => {
  const res = calculateConfidence(sc.m, sc.s);
  console.log(`${sc.name}: Expected ${sc.expect}, Got ${res.level} (${res.overallConfidence.toFixed(4)})`);
  if (sc.expect !== res.level) console.error("MISMATCH ON", sc.name);
});
