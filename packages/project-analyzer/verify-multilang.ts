import { extractRawMetrics } from './src/metrics/metrics';
import { withClonedRepo } from './src/git/git';
import { decryptToken } from '../../apps/api/src/utils/crypto.ts';
import prisma from '../../apps/api/src/db.ts';

const testRepos = [
    { url: 'https://github.com/cneuralnetwork/video-dwd-cli', expectedLang: 'py' },
    { url: 'https://github.com/ayush-that/codejeet', expectedLang: 'tsx' },
];

async function main() {
    const student = await prisma.student.findUnique({ where: { email: 'test@slh.dev' } });
    const token = student?.githubAccessToken ? decryptToken(student.githubAccessToken) : undefined;

    let passed = 0;

    for (const { url, expectedLang } of testRepos) {
        console.log(`\n--- Analyzing: ${url}`);

        await withClonedRepo(url, token, async (localPath: string) => {
            const metrics = await extractRawMetrics(localPath, url, token);

            console.log(`primary_language: ${metrics.primary_language} (expected: ${expectedLang})`);
            console.log(`complexity_avg: ${metrics.complexity_avg}`);
            console.log(`test_file_count: ${metrics.test_file_count}`);
            console.log(`dependencies count: ${metrics.dependency_count}`);
            console.log(`languages:`, Object.keys(metrics.languages).join(', '));

            let ok = true;

            if (metrics.primary_language !== expectedLang) {
                console.error(`❌ Language wrong: got ${metrics.primary_language}, expected ${expectedLang}`);
                ok = false;
            }

            if (expectedLang === 'py' && metrics.complexity_avg === null) {
                console.error(`❌ Complexity null for Python project`);
                ok = false;
            }

            if (ok) {
                console.log(`✅ PASS`);
                passed++;
            }
        });
    }

    console.log(`\n📊 Multi-Lang Results: ${passed}/${testRepos.length}`);
    if (passed !== testRepos.length) {
        console.error('🚨 Multi-language detection has issues.');
        process.exit(1);
    } else {
        console.log('🟢 Multi-language metric extraction working correctly.');
    }

    await prisma.$disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
