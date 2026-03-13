import { runPipeline } from './src/pipeline/pipeline';

const urls = [
  'https://github.com/cneuralnetwork/video-dwd-cli',
  'https://github.com/cneuralnetwork/ML-Project-CLI',
  'https://github.com/PiyushRajDev/slh',
];

async function main() {
  console.log('--- Starting multi-repo evaluation URL tests ---');
  const token = process.env.GITHUB_TOKEN;
  if (!token) console.error('Warning: GITHUB_TOKEN not set');

  for (const url of urls) {
    try {
      console.log(`\nAnalyzing: ${url} ...`);
      const result = await runPipeline(url, token);
      if (!result.success) {
        console.error(`❌ Failed: ${result.error} (Stage: ${result.stage})`);
        continue;
      }
      const r = result.report;
      console.log(`✅ Profile:     ${r.summary.profileId} — ${r.summary.displayName}`);
      console.log(`✅ Score:       ${r.summary.overallScore}/100`);
      console.log(`✅ Confidence:  ${r.summary.confidenceLevel}`);
      console.log(`✅ Reliability: ${r.summary.reliabilityLevel}`);
      console.log(`✅ Lang:        ${r.details.metrics.primary_language}`);
      console.log(`✅ Flags:       ${r.details.antiGaming.flagCount}`);
      if (r.details.antiGaming.flagCount > 0) {
        console.log(`   Patterns: ${r.details.antiGaming.flags.map((f: any) => f.pattern).join(', ')}`);
      }
    } catch (e) {
      console.error(`❌ Crashed: ${url}`, e);
    }
  }
}

main();
