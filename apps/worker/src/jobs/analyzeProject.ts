import { runPipeline } from '../../../../packages/project-analyzer/src/pipeline/pipeline.ts';
import { buildPersistencePayload } from '../../../../packages/project-analyzer/src/persistence/persistence.ts';
import { decryptToken } from '../../../api/src/utils/crypto.ts';
import prisma from '../../../api/src/db.ts';

export interface AnalyzeProjectPayload {
    studentId: string;
    repoUrl: string;
}

export async function handleAnalyzeProject(payload: AnalyzeProjectPayload): Promise<void> {
    // Step 1 - Fetch student token
    const student = await prisma.student.findUnique({
        where: { id: payload.studentId },
        select: { githubAccessToken: true }
    });

    if (!student?.githubAccessToken) {
        throw new Error(`[ANALYZE_PROJECT] Missing githubAccessToken for student: ${payload.studentId}`);
    }

    // Step 3 - Decrypt token
    const token = decryptToken(student.githubAccessToken);

    // Step 4 - Run pipeline
    const output = await runPipeline(payload.repoUrl, token);

    // Step 5 - If pipeline returns success: false
    if (!output.success) {
        const errorOutput = output as typeof output & { stage: string, error: string };
        await prisma.projectAnalysis.create({
            data: {
                studentId: payload.studentId,
                repoUrl: payload.repoUrl,
                analyzerVersion: '1.0.0',
                status: 'FAILED',
                errorMessage: `[${errorOutput.stage}] ${errorOutput.error}`
            }
        });
        return;
    }

    // Step 6 - If pipeline returns success: true
    const persistencePayload = buildPersistencePayload(output.report);

    // Idempotency guard (after pipeline, matching commitSha)
    const existing = await prisma.projectAnalysis.findFirst({
        where: {
            studentId: payload.studentId,
            repoUrl: payload.repoUrl,
            commitSha: persistencePayload.commitSha,
            status: 'COMPLETED'
        }
    });

    if (existing) {
        console.log(`[ANALYZE_PROJECT] same commit already analysed: student=${payload.studentId}, repo=${payload.repoUrl}, commit=${persistencePayload.commitSha}`);
        return;
    }

    await prisma.projectAnalysis.create({
        data: {
            studentId: payload.studentId,
            repoUrl: payload.repoUrl,
            commitSha: persistencePayload.commitSha,
            report: persistencePayload.report as any,
            integrityHash: persistencePayload.integrityHash,
            overallScore: persistencePayload.overallScore,
            profileId: persistencePayload.profileId,
            confidenceLevel: persistencePayload.confidenceLevel,
            reliabilityLevel: persistencePayload.reliabilityLevel,
            flagCount: persistencePayload.flagCount,
            analyzerVersion: persistencePayload.analyzerVersion,
            status: 'COMPLETED'
        }
    });
}
