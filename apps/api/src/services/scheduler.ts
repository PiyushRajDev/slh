import { Queue, Worker, Job } from 'bullmq';
import { analysisQueueConnection } from '../lib/queue';
import prisma from '../db';
import { sendWeeklyReportEmail } from './emailService';

// ── Queue definitions ────────────────────────────────────────────────────────

export const SCHEDULER_QUEUE_NAME = 'scheduler';
export const WEEKLY_REANALYSIS_JOB = 'weekly-reanalysis';
export const WEEKLY_REPORT_EMAIL_JOB = 'weekly-report-email';

export const schedulerQueue = new Queue(SCHEDULER_QUEUE_NAME, {
    connection: analysisQueueConnection,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});

// ── Schedule registration (call once at app startup) ─────────────────────────

/**
 * Registers recurring cron jobs in BullMQ.
 * Safe to call on every startup — BullMQ deduplicates by jobId.
 */
export async function registerScheduledJobs(): Promise<void> {
    // Weekly re-analysis: every Monday at 02:00 UTC
    await schedulerQueue.add(
        WEEKLY_REANALYSIS_JOB,
        {},
        {
            jobId: 'weekly-reanalysis-cron',
            repeat: { pattern: '0 2 * * 1' },
        }
    );

    // Weekly report emails: every Monday at 08:00 UTC (after re-analysis)
    await schedulerQueue.add(
        WEEKLY_REPORT_EMAIL_JOB,
        {},
        {
            jobId: 'weekly-report-email-cron',
            repeat: { pattern: '0 8 * * 1' },
        }
    );

    console.log('[scheduler] Cron jobs registered');
}

// ── Job handlers ─────────────────────────────────────────────────────────────

async function handleWeeklyReanalysis(_job: Job): Promise<void> {
    const students = await prisma.student.findMany({
        where: {
            user: { isActive: true },
            githubUsername: { not: null },
            githubAccessToken: { not: null },
        },
        select: {
            id: true,
            githubProfile: {
                select: { repositories: true },
            },
        },
    });

    // Import here to avoid circular deps at module load
    const { analysisQueue, ANALYZE_REPO_JOB_NAME } = await import('../lib/queue');

    let queued = 0;
    for (const student of students) {
        const repos = student.githubProfile?.repositories as Array<{ url?: string; html_url?: string }> | null;
        if (!repos?.length) continue;

        // Queue only the top-most repo (index 0 — already sorted by stars in GitHubProfile)
        const repoUrl = repos[0].html_url ?? repos[0].url;
        if (!repoUrl) continue;

        await analysisQueue.add(
            ANALYZE_REPO_JOB_NAME,
            { studentId: student.id, repoUrl },
            { jobId: `reanalysis-${student.id}-${Date.now()}` }
        );
        queued++;
    }

    console.log(`[scheduler] weekly-reanalysis: queued ${queued} jobs for ${students.length} students`);
}

async function handleWeeklyReportEmail(_job: Job): Promise<void> {
    const students = await prisma.student.findMany({
        where: { user: { isActive: true } },
        select: {
            id: true,
            firstName: true,
            email: true,
            jriCalculations: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    jriScore: true,
                    githubScore: true,
                    dsaScore: true,
                },
            },
        },
    });

    const baseUrl = process.env.FRONTEND_URL ?? 'https://app.skilllighthouse.com';
    let sent = 0;

    for (const student of students) {
        const latest = student.jriCalculations[0];
        if (!latest) continue;

        await sendWeeklyReportEmail({
            studentId: student.id,
            email: student.email,
            firstName: student.firstName,
            jriScore: latest.jriScore,
            githubScore: latest.githubScore,
            dsaScore: latest.dsaScore,
            profileUrl: `${baseUrl}/profile/${student.id}`,
        });
        sent++;
    }

    console.log(`[scheduler] weekly-report-email: sent ${sent} emails`);
}

// ── Worker ───────────────────────────────────────────────────────────────────

export function startSchedulerWorker(): Worker {
    const worker = new Worker(
        SCHEDULER_QUEUE_NAME,
        async (job: Job) => {
            switch (job.name) {
                case WEEKLY_REANALYSIS_JOB:
                    await handleWeeklyReanalysis(job);
                    break;
                case WEEKLY_REPORT_EMAIL_JOB:
                    await handleWeeklyReportEmail(job);
                    break;
                default:
                    console.warn(`[scheduler] Unknown job: ${job.name}`);
            }
        },
        { connection: analysisQueueConnection, concurrency: 1 }
    );

    worker.on('failed', (job, err) => {
        console.error(`[scheduler] Job ${job?.name} failed:`, err.message);
    });

    return worker;
}
