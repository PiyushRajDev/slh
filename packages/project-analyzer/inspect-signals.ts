import { runPipeline } from './src/pipeline/pipeline';

async function main() {
  const r = await runPipeline('https://github.com/PiyushRajDev/slh', process.env.GITHUB_TOKEN);
  if (r.success) {
    console.log('=== SIGNALS ===');
    console.log(JSON.stringify(r.report.details.signals, null, 2));
    console.log('=== METRICS ===');
    const m = r.report.details.metrics;
    console.log(JSON.stringify({
      primary_language: m.primary_language,
      total_loc: m.total_loc,
      source_loc: m.source_loc,
      complexity_avg: m.complexity_avg,
      long_functions_count: m.long_functions_count,
      test_file_count: m.test_file_count,
      commit_count: m.commit_count,
      dependencies: m.dependencies?.slice(0, 10),
      languages: m.languages
    }, null, 2));
    console.log('=== ANTI-GAMING ===');
    console.log(JSON.stringify(r.report.details.antiGaming, null, 2));
  } else {
    console.log('FAILED:', r.error, r.stage);
  }
}

main();
