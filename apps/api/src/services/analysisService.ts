import axios from 'axios';
import prisma from '../db';
import { verifyIntegrity } from '../../../../packages/project-analyzer/src/persistence/persistence';
import { AnalysisReport } from '../../../../packages/project-analyzer/src/report/report';
import { ProfileId } from '../../../../packages/project-analyzer/src/profiles/profiles';
import { generateInsights } from '../../../../packages/project-analyzer/src/insights/insights';
import { ANALYZE_REPO_JOB_NAME, analysisQueue } from '../lib/queue';
import { decryptToken } from '../utils/crypto';
import { AnalysisRequestError } from '../lib/analysis-errors';

const GITHUB_URL_REGEX = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/;

async function validateRepositoryAccess(
    owner: string,
    repo: string,
    token: string
): Promise<void> {
    try {
        const response = await axios.get<{
            private?: boolean;
            owner?: { login?: string };
            message?: string;
        }>(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${token}`,
                'User-Agent': 'SLH-App',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            timeout: 15_000,
            validateStatus: () => true
        });

        if (response.status === 404) {
            throw new AnalysisRequestError(
                'REPOSITORY_NOT_FOUND',
                'We could not access that repository. Check the URL and make sure it is public.',
                404
            );
        }

        if (
            response.status === 403 ||
            response.status === 429 ||
            response.headers['x-ratelimit-remaining'] === '0' ||
            /rate limit/i.test(response.data?.message ?? '')
        ) {
            throw new AnalysisRequestError(
                'GITHUB_RATE_LIMITED',
                'We are processing many analyses right now. Please try again in a few minutes.',
                429
            );
        }

        if (response.status >= 400) {
            throw new AnalysisRequestError(
                'ANALYSIS_FAILED',
                response.data?.message ?? 'Unable to inspect this repository right now.',
                502
            );
        }

        if (response.data?.private) {
            throw new AnalysisRequestError(
                'PRIVATE_REPOSITORY',
                'This repository is private. SLH can only analyze public repositories.',
                400
            );
        }
    } catch (error) {
        if (error instanceof AnalysisRequestError) {
            throw error;
        }

        if (axios.isAxiosError(error) && /timeout/i.test(error.message)) {
            throw new AnalysisRequestError(
                'GITHUB_RATE_LIMITED',
                'GitHub took too long to respond. Please try again in a few minutes.',
                429
            );
        }

        throw error;
    }
}

function attachInsights<T extends { report?: unknown; profileId?: string | null }>(record: T): T & { insights?: ReturnType<typeof generateInsights> } {
    const report = record.report as AnalysisReport | null | undefined;
    const profileId = (record.profileId ?? report?.summary.profileId) as ProfileId | undefined;

    if (!report || !profileId) {
        return record;
    }

    return {
        ...record,
        insights: generateInsights(report.details.dimensions, profileId)
    };
}

export const analysisService = {
    async queueAnalysis(studentId: string, repoUrl: string) {
        const match = repoUrl.match(GITHUB_URL_REGEX);
        if (!match) {
            throw new AnalysisRequestError(
                'INVALID_REPOSITORY_URL',
                'Invalid GitHub repository URL',
                400
            );
        }

        const [, owner, repo] = match;
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: {
                githubAccessToken: true,
                githubUsername: true
            }
        });

        if (!student?.githubUsername || !student.githubAccessToken) {
            throw new AnalysisRequestError(
                'GITHUB_NOT_CONNECTED',
                'GitHub account not connected. Please connect your GitHub account first.',
                403
            );
        }

        if (owner.toLowerCase() !== student.githubUsername.toLowerCase()) {
            throw new AnalysisRequestError(
                'REPOSITORY_OWNER_MISMATCH',
                'This repository does not belong to your connected GitHub account.',
                403
            );
        }

        const token = decryptToken(student.githubAccessToken);
        await validateRepositoryAccess(owner, repo, token);

        const jobId = `analysis-${studentId}-${Date.now()}`;
        await analysisQueue.add(
            ANALYZE_REPO_JOB_NAME,
            { studentId, repoUrl, submittedAt: new Date().toISOString() },
            { jobId }
        );

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
                status: true,
                updatedAt: true,
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
        return attachInsights(rest);
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
        return attachInsights(rest);
    }
};
