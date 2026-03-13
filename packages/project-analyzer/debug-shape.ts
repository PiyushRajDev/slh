import { runPipeline } from './src/pipeline/pipeline';

async function main() {
  const result = await runPipeline('https://github.com/SagarBiswas-MultiHAT/WebSource-Harvester', process.env.GITHUB_TOKEN);
  console.log('success:', result.success);
  if (result.success) {
    const r = result.report;
    console.log('\n--- TOP LEVEL KEYS ---');
    console.log(Object.keys(r));
    console.log('\n--- r.summary ---');
    console.log(r.summary);
    console.log('\n--- r.confidence ---');
    console.log(r.confidence);
    console.log('\n--- r.selection ---');
    console.log(r.selection);
    console.log('\n--- r.antiGaming ---');
    console.log(r.antiGaming);
    console.log('\n--- r.details (keys only) ---');
    console.log(r.details ? Object.keys(r.details) : 'undefined');
  } else {
    console.log('error:', result.error);
    console.log('stage:', result.stage);
  }
}

main().catch(console.error);
// append to main() before the closing brace:
