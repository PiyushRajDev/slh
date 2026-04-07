import { Router, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import prisma from '../db';
import {
  authenticate,
  AuthRequest,
  Permission,
  requirePermission,
} from '../middleware/auth.middleware';
import { jiQueue, jiQueueEvents, JI_JOB_NAME } from '../lib/job-intelligence-queue';

const router = Router();

const jiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  keyGenerator: (req) => (req as AuthRequest).auth?.principal.userId ?? req.ip ?? 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Max 3 analyses per 10 minutes.' },
  validate: { keyGeneratorIpFallback: false },
});

const STREAM_TIMEOUT_MS = 5 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 15 * 1000;

function writeSse(res: Response, event: string, data: Record<string, unknown>): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// GET /api/job-intelligence/history  — must be before /:id
router.get(
  '/history',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_READ),
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(20, parseInt(req.query.limit as string) || 10);

    const reports = await prisma.jobIntelligenceReport.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, role: true, experience: true, salary: true,
        readinessScore: true, topSkills: true, status: true, createdAt: true, jobsCount: true,
      },
    });

    res.json({ reports, page, limit });
  }
);

// POST /api/job-intelligence/analyze
router.post(
  '/analyze',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_ANALYZE),
  jiRateLimiter,
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { role, experience, salary, force } = req.body;
    if (!role || !experience || !salary) {
      res.status(400).json({ error: 'role, experience, and salary are required' });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student profile not found' }); return; }

    const studentId = student.id;
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    // Idempotency: check for recent completed or in-progress report
    if (!force) {
      const recent = await prisma.jobIntelligenceReport.findFirst({
        where: {
          studentId,
          role,
          experience,
          salary,
          OR: [
            { status: 'COMPLETED', createdAt: { gte: sixHoursAgo }, jobsCount: { gte: 10 } },
            { status: 'IN_PROGRESS' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true },
      });

      if (recent) {
        res.status(202).json({
          reportId: recent.id,
          status: recent.status,
          cached: recent.status === 'COMPLETED',
        });
        return;
      }
    }

    // Create report in transaction (race condition guard)
    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.jobIntelligenceReport.create({
        data: { studentId, role, experience, salary, status: 'PENDING' },
      });
      await jiQueue.add(JI_JOB_NAME, {
        reportId: created.id,
        studentId,
        filters: { role, experience, salary },
      }, { jobId: `ji-${created.id}` });
      return created;
    });

    res.status(202).json({ reportId: report.id, status: 'PENDING', cached: false });
  }
);

// GET /api/job-intelligence/stream/:id
router.get(
  '/stream/:id',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_READ),
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const reportId = req.params.id;

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const report = await prisma.jobIntelligenceReport.findUnique({
      where: { id: reportId },
      select: { studentId: true, status: true, progress: true, stage: true, progressMessage: true },
    });
    if (!report) { res.status(404).json({ error: 'Report not found' }); return; }
    if (report.studentId !== student.id) { res.status(403).json({ error: 'Forbidden' }); return; }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Immediate state sync on connect
    writeSse(res, 'progress', {
      progress: report.progress,
      stage: report.stage ?? 'pending',
      message: report.progressMessage ?? 'Waiting to start...',
    });

    if (report.status === 'COMPLETED') {
      writeSse(res, 'complete', { reportId });
      res.end();
      return;
    }

    if (report.status === 'FAILED') {
      writeSse(res, 'failed', { reportId, error: 'Analysis failed' });
      res.end();
      return;
    }

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      clearInterval(heartbeat);
      clearTimeout(timeout);
      jiQueueEvents.off('progress', onProgress);
      jiQueueEvents.off('completed', onCompleted);
      jiQueueEvents.off('failed', onFailed);
      if (!res.writableEnded) res.end();
    };

    const heartbeat = setInterval(() => { res.write(': heartbeat\n\n'); }, HEARTBEAT_INTERVAL_MS);
    const timeout = setTimeout(() => {
      writeSse(res, 'timeout', { code: 'STREAM_TIMEOUT', reportId });
      cleanup();
    }, STREAM_TIMEOUT_MS);

    const jobId = `ji-${reportId}`;

    const onProgress = ({ jobId: eid, data }: { jobId: string; data: unknown }) => {
      if (eid !== jobId) return;
      const p = data as any;
      writeSse(res, 'progress', { progress: p?.percent ?? 0, stage: p?.stage ?? '', message: p?.message ?? '' });
    };

    const onCompleted = ({ jobId: eid }: { jobId: string }) => {
      if (eid !== jobId) return;
      writeSse(res, 'complete', { reportId });
      cleanup();
    };

    const onFailed = ({ jobId: eid, failedReason }: { jobId: string; failedReason: string }) => {
      if (eid !== jobId) return;
      writeSse(res, 'failed', { reportId, error: failedReason });
      cleanup();
    };

    await jiQueueEvents.waitUntilReady();
    jiQueueEvents.on('progress', onProgress);
    jiQueueEvents.on('completed', onCompleted);
    jiQueueEvents.on('failed', onFailed);
    req.on('close', cleanup);
  }
);

// GET /api/job-intelligence/:id
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_READ),
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const report = await prisma.jobIntelligenceReport.findUnique({
      where: { id: req.params.id },
    });
    if (!report) { res.status(404).json({ error: 'Report not found' }); return; }
    if (report.studentId !== student.id) { res.status(403).json({ error: 'Forbidden' }); return; }

    res.json({ report });
  }
);

// POST /api/job-intelligence/:id/cancel
router.post(
  '/:id/cancel',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_READ),
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const report = await prisma.jobIntelligenceReport.findUnique({
      where: { id: req.params.id },
      select: { studentId: true, status: true },
    });
    if (!report) { res.status(404).json({ error: 'Report not found' }); return; }
    if (report.studentId !== student.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    if (report.status === 'COMPLETED' || report.status === 'FAILED') {
      res.status(400).json({ error: 'Cannot cancel a finished report' });
      return;
    }

    await prisma.jobIntelligenceReport.update({
      where: { id: req.params.id },
      data: {
        status: 'FAILED',
        error: JSON.stringify({ stage: 'cancelled', message: 'Cancelled by user', retryable: false }),
      },
    });

    res.json({ success: true });
  }
);

export default router;
