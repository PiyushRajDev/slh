const data = require('./results/student-accuracy-results.json');
const confusions = {};
const wrong = data.filter(d => d.verdict === 'WRONG' || d.verdict === 'MISCALIBRATED');
wrong.forEach(d => {
  const key = `${d.groundTruthProfile} -> ${d.pipelineProfile}`;
  confusions[key] = (confusions[key] || 0) + 1;
});
const total = data.length;
const defensible = data.filter(d => d.verdict === 'CORRECT' || d.verdict === 'ACCEPTABLE').length;

console.log(`Total: ${total}, Defensible: ${defensible} (${Math.round(defensible/total*100)}%)`);
console.log("Top Confusions:");
console.entries = Object.entries(confusions).sort((a,b) => b[1] - a[1]).slice(0, 10);
console.entries.forEach(([k,v]) => console.log(`${k}: ${v}`));

console.log("\nSome specific examples of top confusions:");
for (let i = 0; i < 3; i++) {
  const topConf = console.entries[i][0];
  const ex = wrong.filter(d => `${d.groundTruthProfile} -> ${d.pipelineProfile}` === topConf).slice(0, 3);
  console.log(`\nExamples for ${topConf}:`);
  ex.forEach(e => console.log(`  ${e.repo} (GT: ${e.groundTruthProfile}, PL: ${e.pipelineProfile}, GT Score: ${e.groundTruthScoreRange}, PL Score: ${e.pipelineScore})`));
}
