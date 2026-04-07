import { Job } from 'bullmq';
import { runJobIntelligencePipeline } from '../../../../packages/job-intelligence/src';
import prisma from '../../../api/src/db';

export interface JIJobPayload {
  reportId: string;
  studentId: string;
  filters: { role: string; experience: string; salary: string };
}

export async function handleJobIntelligence(job: Job<JIJobPayload>): Promise<void> {
  const { reportId, studentId, filters } = job.data;

  // Check if cancelled before starting
  const report = await prisma.jobIntelligenceReport.findUnique({
    where: { id: reportId },
    select: { status: true },
  });
  if (!report || report.status === 'FAILED' || report.status === 'COMPLETED') {
    console.log(`[JI Worker] Report ${reportId} already in terminal state — skipping`);
    return;
  }

  // Mark as IN_PROGRESS atomically
  await prisma.jobIntelligenceReport.updateMany({
    where: { id: reportId, status: 'PENDING' },
    data: { status: 'IN_PROGRESS' },
  });

  try {
    const result = await runJobIntelligencePipeline(
      prisma,
      filters,
      studentId,
      reportId,
      async (percent, message, stage) => {
        // Check for cancellation at each stage
        const current = await prisma.jobIntelligenceReport.findUnique({
          where: { id: reportId },
          select: { status: true },
        });
        if (current?.status === 'FAILED') {
          throw new Error('CANCELLED');
        }

        await job.updateProgress({ percent, stage, message });
        await prisma.jobIntelligenceReport.update({
          where: { id: reportId },
          data: { progress: percent, stage, progressMessage: message },
        });
      }
    );

    const topSkills = (result.skillsAnalysis as any[])
      .filter((s: any) => s.demandTier === 'critical' || s.demandTier === 'high')
      .slice(0, 5)
      .map((s: any) => s.name as string);

    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        jobsCount: (result.jobs as any[]).length,
        topSkills,
        readinessScore: (result.gapAnalysis as any).readinessScore,
      },
    });

    console.log(`[JI Worker] Report ${reportId} completed`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isCancelled = message === 'CANCELLED';

    if (!isCancelled) {
      await prisma.jobIntelligenceReport.update({
        where: { id: reportId },
        data: {
          status: 'FAILED',
          error: JSON.stringify({ stage: 'unknown', message, retryable: true }),
        },
      });
      console.error(`[JI Worker] Report ${reportId} failed:`, message);
    }

    throw err;
  }
}
