import { runPipeline } from './src/pipeline/pipeline';
import 'dotenv/config';

const urls = [
    'https://github.com/facebook/create-react-app',
    'https://github.com/simonplend/express-api-starter',
    'https://github.com/huggingface/transformers',
    'https://github.com/pallets/click',
    'https://github.com/axios/axios',
    'https://github.com/piyushyadav0191/empty-test'
];

async function main() {
    console.log('--- Starting multi-repo evaluation URL tests ---');
    const token = process.env.GITHUB_TOKEN;
    if (!token) console.error('Warning: GITHUB_TOKEN not set, might hit rate limits');
    for (const url of urls) {
        try {
            console.log(`\nAnalyzing: ${url} ...`);
            const result = await runPipeline(url, token);
            if (!result.success) {
                console.error(`❌ Failed analysis properly: ${result.error} (Stage: ${result.stage})`);
                continue;
            }
            const report = result.report;
            console.log(`✅ Selected Profile: ${report.selection.displayName}`);
            console.log(`✅ Score: ${report.selection.rawScore}/100 (Defensible: ${report.selection.defensibleScore.toFixed(1)})`);
            console.log(`✅ Confidence: ${report.confidence.level} (${report.confidence.overallConfidence.toFixed(2)})`);
            console.log(`✅ Anti-Gaming Flags: ${report.antiGaming.flags.length}`);
            if (report.antiGaming.flags.length > 0) {
                console.log(`   Flags: ${report.antiGaming.flags.map(f => f.pattern).join(', ')}`);
            }
        } catch (e) {
            console.error(`❌ Crashed: ${url}`, e);
        }
    }
}
main();
