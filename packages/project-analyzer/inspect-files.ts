import { runPipeline } from './src/pipeline/pipeline';

async function main() {
  const r = await runPipeline('https://github.com/PiyushRajDev/slh', process.env.GITHUB_TOKEN);
  if (r.success) {
    const files: string[] = (r.report.details.metrics as any).files || [];
    console.log('Total files:', files.length);
    const cliFiles = files.filter((f: string) => 
      f === 'cli.py' || f === 'cli.ts' || f === 'cli.js' ||
      f.endsWith('/cli.py') || f.endsWith('/cli.ts') || f.endsWith('/cli.js') ||
      /^bin\//.test(f) || /\/(bin|cli)\.(js|ts|py)$/.test(f) ||
      f === '__main__.py' || f.endsWith('/__main__.py') ||
      f === 'main.py' || f === 'app.py'
    );
    console.log('CLI-matching files:', JSON.stringify(cliFiles, null, 2));
  }
}

main();
