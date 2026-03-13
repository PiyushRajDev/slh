import { runPipeline } from './src/pipeline/pipeline';

async function main() {
  const r = await runPipeline('https://github.com/PiyushRajDev/slh', process.env.GITHUB_TOKEN);
  if (r.success) {
    const deps = r.report.details.metrics.dependencies;
    console.log('Total deps:', deps.length);
    console.log('All deps:', JSON.stringify(deps, null, 2));
  }
}

main();
