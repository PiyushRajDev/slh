import * as path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { runPipeline } from './src/pipeline/pipeline';
import { decryptToken } from '../../apps/api/src/utils/crypto';
import prisma from '../../apps/api/src/db';

async function main() {
    const student = await prisma.student.findUnique({
        where: { email: 'test@slh.dev' },
        select: { githubAccessToken: true, githubUsername: true }
    });

    if (!student?.githubAccessToken) {
        console.error('No token found');
        process.exit(1);
    }

    const token = decryptToken(student.githubAccessToken);
    const repoUrl = `https://github.com/${student.githubUsername}/slh`;

    console.log(`\n🚀 Running full pipeline on: ${repoUrl}`);

    const output = await runPipeline(repoUrl, token);

    if (!output.success) {
        const errorOutput = output as typeof output & { stage: string, error: string };
        console.error(`❌ Pipeline failed at stage: ${errorOutput.stage}`);
        console.error(`Error: ${errorOutput.error}`);
        process.exit(1);
    }

    const { report } = output;

    console.log('\n--- Pipeline Result ---');
    console.log(`Version:         ${report.version}`);
    console.log(`Profile:         ${report.summary.displayName}`);
    console.log(`Overall Score:   ${report.summary.overallScore}/100`);
    console.log(`Confidence:      ${report.summary.confidenceLevel}`);
    console.log(`Reliability:     ${report.summary.reliabilityLevel}`);
    console.log(`Commit Count:    ${report.details.metrics.commit_count}`);
    console.log(`Total LOC:       ${report.details.metrics.total_loc}`);
    console.log(`Primary Lang:    ${report.details.metrics.primary_language}`);
    console.log(`Flags:           ${report.details.antiGaming.flagCount}`);

    // Assertions
    let passed = 0;
    let failed = 0;

    function assert(name: string, condition: boolean) {
        if (condition) { console.log(`✅ ${name}`); passed++; }
        else { console.log(`❌ ${name}`); failed++; }
    }

    assert('success === true', output.success === true);
    assert('version === "1.0.0"', report.version === '1.0.0');
    assert('overallScore is integer', Number.isInteger(report.summary.overallScore));
    assert('overallScore is 0-100', report.summary.overallScore >= 0 && report.summary.overallScore <= 100);
    assert('commit_count > 0', report.details.metrics.commit_count > 0);
    assert('total_loc > 0', report.details.metrics.total_loc > 0);
    assert('confidenceLevel defined', ['HIGH', 'MEDIUM', 'LOW'].includes(report.summary.confidenceLevel));
    assert('reliabilityLevel defined', ['HIGH', 'MEDIUM', 'LOW'].includes(report.summary.reliabilityLevel));
    assert('JSON serializable', (() => { try { JSON.stringify(report); return true; } catch { return false; } })());
    assert('profileId defined', typeof report.summary.profileId === 'string' && report.summary.profileId.length > 0);

    console.log(`\n📊 Pipeline Verification: ${passed}/${passed + failed} passed`);

    if (failed > 0) process.exit(1);
    else console.log('🟢 Block 9 Pipeline Orchestrator is production-ready.');

    await prisma.$disconnect();
}

main().catch(console.error);
