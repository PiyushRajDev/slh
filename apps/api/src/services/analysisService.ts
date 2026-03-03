import { Queue } from 'bullmq';
import prisma from '../db';
import { verifyIntegrity } from '../../../../packages/project-analyzer/src/persistence/persistence';
import { AnalysisReport } from '../../../../packages/project-analyzer/src/report/report';

const queue = new Queue('jobs', {
    connection: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') }
});

export const analysisService = {
    async queueAnalysis(studentId: string, repoUrl: string) {
        // 1. Validate 'https://github.com/{owner}/{repo}'
        const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
        if (!githubUrlRegex.test(repoUrl)) {
            throw new Error('Invalid GitHub repository URL');
        }

        // 2. Check existing COMPLETED analysis
        const existing = await prisma.projectAnalysis.findFirst({
            where: { studentId, repoUrl, status: 'COMPLETED' }
        });

        if (existing) {
            return { alreadyQueued: false, existingAnalysisId: existing.id };
        }

        // 3. Queue job with deduplication ID
        const jobId = `${studentId}-${repoUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
        await queue.add('ANALYZE_PROJECT', { studentId, repoUrl }, { jobId });

        return { jobId, repoUrl };
    },

    async getAnalyses(studentId: string, limit: number, offset: number) {
        const analyses = await prisma.projectAnalysis.findMany({
            where: { studentId, status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            select: {
                id: true,
                repoUrl: true,
                overallScore: true,
                profileId: true,
                confidenceLevel: true,
                reliabilityLevel: true,
                flagCount: true,
                analyzerVersion: true,
                createdAt: true
            }
        });

        const total = await prisma.projectAnalysis.count({
            where: { studentId, status: 'COMPLETED' }
        });

        return { analyses, total, limit, offset };
    },

    async getAnalysisById(id: string, studentId?: string) {
        const record = await prisma.projectAnalysis.findUnique({
            where: { id }
        });

        if (!record) {
            return null; // Will trigger 404
        }

        if (studentId && record.studentId !== studentId) {
            throw new Error('FORBIDDEN'); // Will trigger 403
        }

        // Return full record excluding `integrityHash`
        const { integrityHash, ...rest } = record;
        return rest;
    },

    async verifyAnalysisIntegrity(id: string, studentId?: string) {
        const record = await prisma.projectAnalysis.findUnique({
            where: { id }
        });

        if (!record) {
            return null;
        }

        if (studentId && record.studentId !== studentId) {
            throw new Error('FORBIDDEN');
        }

        if (!record.integrityHash || !record.report) {
            return { verified: false, analysisId: id, warning: 'Integrity check failed — report may have been tampered with or is missing' };
        }

        const verified = verifyIntegrity(record.report as unknown as AnalysisReport, record.integrityHash);

        return {
            verified,
            analysisId: id,
            ...(verified ? {} : { warning: 'Integrity check failed — report may have been tampered with' })
        };
    },

    async getLatestAnalysis(studentId: string) {
        const record = await prisma.projectAnalysis.findFirst({
            where: { studentId, status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            return null;
        }

        const { integrityHash, ...rest } = record;
        return rest;
    }
};
