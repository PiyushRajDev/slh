import { Response } from 'express';
import {
    AuthRequest,
    type AuthRole,
    isElevatedRole
} from '../middleware/auth.middleware';
import prisma from '../db';
import { analysisService } from '../services/analysisService';
import { AnalysisRequestError } from '../lib/analysis-errors';

async function getStudentIdForUser(userId: string, role: AuthRole, overrideStudentId?: string): Promise<string> {
    if (isElevatedRole(role) && overrideStudentId) {
        return overrideStudentId;
    }

    const student = await prisma.student.findUnique({
        where: { userId }
    });

    if (student) {
        return student.id;
    }

    if (isElevatedRole(role)) {
        throw new Error('Admin must provide studentId query parameter');
    }

    throw new Error('Student record not found for user');
}

export const analysisController = {
    async analyze(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { repoUrl } = req.body;
            if (!repoUrl || typeof repoUrl !== 'string') {
                res.status(400).json({ error: 'repoUrl is required' });
                return;
            }

            const principal = req.auth?.principal;
            if (!principal) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const studentId = await getStudentIdForUser(principal.userId, principal.role);

            const result = await analysisService.queueAnalysis(studentId, repoUrl);

            res.status(202).json({
                message: 'Analysis queued',
                jobId: result.jobId,
                repoUrl: result.repoUrl
            });
        } catch (error: any) {
            if (error instanceof AnalysisRequestError) {
                res.status(error.status).json({ error: error.message, code: error.code });
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
            const principal = req.auth?.principal;
            if (!principal) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const reqLimit = parseInt(req.query.limit as string, 10);
            const reqOffset = parseInt(req.query.offset as string, 10);

            const limit = isNaN(reqLimit) ? 10 : Math.min(reqLimit, 50);
            const offset = isNaN(reqOffset) ? 0 : reqOffset;

            const queryStudentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
            const studentId = await getStudentIdForUser(principal.userId, principal.role, queryStudentId);

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
            const principal = req.auth?.principal;
            if (!principal) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const analysisId = req.params.id as string;
            const isAdmin = isElevatedRole(principal.role);

            let studentIdForOwnershipCheck: string | undefined;
            if (!isAdmin) {
                studentIdForOwnershipCheck = await getStudentIdForUser(principal.userId, principal.role);
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
            const principal = req.auth?.principal;
            if (!principal) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const analysisId = req.params.id as string;
            const isAdmin = isElevatedRole(principal.role);

            let studentIdForOwnershipCheck: string | undefined;
            if (!isAdmin) {
                studentIdForOwnershipCheck = await getStudentIdForUser(principal.userId, principal.role);
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
            const principal = req.auth?.principal;
            if (!principal) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const isAdmin = isElevatedRole(principal.role);
            const queryStudentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
            const studentId = await getStudentIdForUser(principal.userId, principal.role, isAdmin ? queryStudentId : undefined);

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
