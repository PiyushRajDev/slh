import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../db';
import { analysisService } from '../services/analysisService';

async function getStudentIdForUser(userId: string, role: string, overrideStudentId?: string): Promise<string> {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        if (!overrideStudentId) {
            throw new Error('Admin must provide studentId query parameter');
        }
        return overrideStudentId;
    }

    const student = await prisma.student.findUnique({
        where: { userId }
    });

    if (!student) {
        throw new Error('Student record not found for user');
    }

    return student.id;
}

export const analysisController = {
    async analyze(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { repoUrl } = req.body;
            if (!repoUrl || typeof repoUrl !== 'string') {
                res.status(400).json({ error: 'repoUrl is required' });
                return;
            }

            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const studentId = await getStudentIdForUser(req.user.userId, req.user.role);

            const result = await analysisService.queueAnalysis(studentId, repoUrl);

            if (result.alreadyQueued === false && result.existingAnalysisId) {
                res.status(200).json({
                    message: 'Analysis already completed',
                    analysisId: result.existingAnalysisId
                });
                return;
            }

            res.status(202).json({
                message: 'Analysis queued',
                jobId: result.jobId,
                repoUrl: result.repoUrl
            });
        } catch (error: any) {
            if (error.message === 'Invalid GitHub repository URL') {
                res.status(400).json({ error: error.message });
            } else if (error.message === 'Student record not found for user') {
                res.status(403).json({ error: error.message });
            } else {
                console.error('[analyze] Error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },

    async getAnalyses(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const reqLimit = parseInt(req.query.limit as string, 10);
            const reqOffset = parseInt(req.query.offset as string, 10);

            const limit = isNaN(reqLimit) ? 10 : Math.min(reqLimit, 50);
            const offset = isNaN(reqOffset) ? 0 : reqOffset;

            const queryStudentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
            const studentId = await getStudentIdForUser(req.user.userId, req.user.role, queryStudentId);

            const result = await analysisService.getAnalyses(studentId, limit, offset);

            res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'Student record not found for user' || error.message === 'Admin must provide studentId query parameter') {
                res.status(403).json({ error: error.message });
            } else {
                console.error('[getAnalyses] Error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },

    async getAnalysisById(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const analysisId = req.params.id as string;
            const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

            let studentIdForOwnershipCheck: string | undefined;
            if (!isAdmin) {
                studentIdForOwnershipCheck = await getStudentIdForUser(req.user.userId, req.user.role);
            }

            const analysis = await analysisService.getAnalysisById(analysisId, studentIdForOwnershipCheck);

            if (!analysis) {
                res.status(404).json({ error: 'Analysis not found' });
                return;
            }

            res.status(200).json(analysis);
        } catch (error: any) {
            if (error.message === 'FORBIDDEN' || error.message === 'Student record not found for user') {
                res.status(403).json({ error: 'Forbidden' });
            } else {
                console.error('[getAnalysisById] Error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },

    async verifyAnalysisIntegrity(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const analysisId = req.params.id as string;
            const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

            let studentIdForOwnershipCheck: string | undefined;
            if (!isAdmin) {
                studentIdForOwnershipCheck = await getStudentIdForUser(req.user.userId, req.user.role);
            }

            const verification = await analysisService.verifyAnalysisIntegrity(analysisId, studentIdForOwnershipCheck);

            if (!verification) {
                res.status(404).json({ error: 'Analysis not found' });
                return;
            }

            res.status(200).json(verification);
        } catch (error: any) {
            if (error.message === 'FORBIDDEN' || error.message === 'Student record not found for user') {
                res.status(403).json({ error: 'Forbidden' });
            } else {
                console.error('[verifyAnalysisIntegrity] Error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },

    async getLatestAnalysis(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
            const queryStudentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
            const studentId = await getStudentIdForUser(req.user.userId, req.user.role, isAdmin ? queryStudentId : undefined);

            const latestAnalysis = await analysisService.getLatestAnalysis(studentId);

            if (!latestAnalysis) {
                res.status(404).json({ error: 'No analyses found' });
                return;
            }

            res.status(200).json(latestAnalysis);
        } catch (error: any) {
            if (error.message === 'Student record not found for user' || error.message === 'Admin must provide studentId query parameter') {
                res.status(403).json({ error: error.message });
            } else {
                console.error('[getLatestAnalysis] Error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
};
