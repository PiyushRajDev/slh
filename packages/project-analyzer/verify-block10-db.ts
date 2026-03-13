console.log("STARTING SCRIPT");
import * as path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { runPipeline } from './src/pipeline/pipeline';
import { buildPersistencePayload, verifyIntegrity } from './src/persistence/persistence';
import { decryptToken } from '../../apps/api/src/utils/crypto';
import prisma from '../../apps/api/src/db';
import { AnalysisReport } from './src/report/report';

async function main() {
    console.log("🗄️ Executing SLH Brain Block 10 DB Integration Gauntlet...\n");

    const student = await prisma.student.findUnique({
        where: { email: 'test@slh.dev' },
        select: { id: true, githubAccessToken: true, githubUsername: true }
    });

    if (!student?.githubAccessToken || !student?.githubUsername) {
        console.error('No token or username found');
        process.exit(1);
    }

    const token = decryptToken(student.githubAccessToken);
    const repoUrl = `https://github.com/${student.githubUsername}/slh`;

    const output = await runPipeline(repoUrl, token);

    if (!output.success) {
        console.error(`❌ Pipeline failed at stage: ${(output as any).stage}`);
        console.error(`Error: ${(output as any).error}`);
        process.exit(1);
    }

    const payload = buildPersistencePayload(output.report);

    // Write record
    const createdRecord = await prisma.projectAnalysis.create({
        data: {
            studentId: student.id,
            repoUrl,
            commitSha: payload.commitSha,
            report: payload.report as any,
            integrityHash: payload.integrityHash,
            overallScore: payload.overallScore,
            profileId: payload.profileId,
            confidenceLevel: payload.confidenceLevel,
            reliabilityLevel: payload.reliabilityLevel,
            flagCount: payload.flagCount,
            analyzerVersion: payload.analyzerVersion,
            status: 'COMPLETED'
        }
    });

    // Read it back
    const readRecord = await prisma.projectAnalysis.findUnique({
        where: { id: createdRecord.id }
    });

    if (!readRecord) throw new Error("Could not read back record");

    let passed = 0;
    let failed = 0;
    function assert(name: string, condition: boolean) {
        if (condition) { console.log(`✅ [PASS] ${name}`); passed++; }
        else { console.log(`❌ [FAIL] ${name}`); failed++; }
    }

    assert('Record exists', !!readRecord);
    assert('overallScore matches', readRecord.overallScore === payload.overallScore);
    assert('profileId matches', readRecord.profileId === payload.profileId);
    assert('analyzerVersion === "1.0.0"', readRecord.analyzerVersion === '1.0.0');
    assert('status === "COMPLETED"', readRecord.status === 'COMPLETED');
    assert('integrityHash is 64 chars', readRecord.integrityHash!.length === 64);

    const isIntact = verifyIntegrity(readRecord.report as unknown as AnalysisReport, readRecord.integrityHash!);
    assert('verifyIntegrity returns true on DB fetched report', isIntact);

    // Cleanup
    await prisma.projectAnalysis.delete({
        where: { id: createdRecord.id }
    });

    console.log(`\n📊 DB Integration Verification: ${passed}/${passed + failed} passed`);

    if (failed > 0) process.exit(1);
    else console.log('🟢 Block 10 DB Integrations are production-ready.');

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
