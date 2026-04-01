import { Job } from 'bullmq';
import { runPipeline } from '../../../../packages/project-analyzer/src/pipeline/pipeline.ts';
import { buildPersistencePayload } from '../../../../packages/project-analyzer/src/persistence/persistence.ts';
import { decryptToken } from '../../../api/src/utils/crypto.ts';
import prisma from '../../../api/src/db.ts';

export interface AnalyzeProjectPayload {
    studentId: string;
    repoUrl: string;
}

export interface AnalyzeProjectResult {
    analysisId: string;
    status: 'COMPLETED' | 'DUPLICATE';
}

function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'Unknown analysis failure';
}

export async function handleAnalyzeProject(job: Job<AnalyzeProjectPayload>): Promise<AnalyzeProjectResult> {
    const payload = job.data;

    try {
        const student = await prisma.student.findUnique({
            where: { id: payload.studentId },
            select: { githubAccessToken: true }
        });

        if (!student?.githubAccessToken) {
            throw new Error(`[ANALYZE_PROJECT] Missing githubAccessToken for student: ${payload.studentId}`);
        }

        const token = decryptToken(student.githubAccessToken);

        const output = await runPipeline(payload.repoUrl, token, async (stage, detail) => {
            await job.updateProgress({ stage, detail, timestamp: Date.now() });
        });

        if (!output.success) {
            throw new Error(`[${output.stage}] ${output.error}`);
        }

        const persistencePayload = buildPersistencePayload(output.report);

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
            return {
                analysisId: existing.id,
                status: 'DUPLICATE'
            };
        }

        const created = await prisma.projectAnalysis.create({
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

        return {
            analysisId: created.id,
            status: 'COMPLETED'
        };
    } catch (error) {
        const errorMessage = toErrorMessage(error);

        try {
            await prisma.projectAnalysis.create({
                data: {
                    studentId: payload.studentId,
                    repoUrl: payload.repoUrl,
                    analyzerVersion: '1.0.0',
                    status: 'FAILED',
                    errorMessage
                }
            });
        } catch (persistenceError) {
            console.error('[ANALYZE_PROJECT] Failed to persist failed analysis:', persistenceError);
        }

        throw error;
    }
}
