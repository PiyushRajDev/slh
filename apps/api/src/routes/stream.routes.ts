import { Router, Response } from "express";
import { Job } from "bullmq";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { analysisQueue, analysisQueueEvents } from "../lib/queue";
import { classifyAnalysisFailure } from "../lib/analysis-errors";

const router = Router();
const STREAM_TIMEOUT_MS = 5 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 15 * 1000;

type ProgressPayload = {
    stage?: string;
    detail?: Record<string, unknown>;
    timestamp?: number;
};

function normalizeProgressPayload(data: unknown): ProgressPayload {
    if (typeof data === "string") {
        try {
            return normalizeProgressPayload(JSON.parse(data));
        } catch {
            return { detail: { value: data } };
        }
    }

    if (data && typeof data === "object") {
        return data as ProgressPayload;
    }

    return {};
}

function normalizeReturnValue(data: unknown): { analysisId?: string; status?: string } {
    if (typeof data === "string") {
        try {
            return normalizeReturnValue(JSON.parse(data));
        } catch {
            return {};
        }
    }

    if (data && typeof data === "object") {
        return data as { analysisId?: string; status?: string };
    }

    return {};
}

function writeSseEvent(res: Response, event: string, data: Record<string, unknown>): void {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function canAccessJob(req: AuthRequest, job: Job): Promise<boolean> {
    if (!req.user) {
        return false;
    }

    if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") {
        return true;
    }

    const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
        select: { id: true }
    });

    if (!student) {
        return false;
    }

    return job.data?.studentId === student.id;
}

router.get("/analyses/:jobId/events", authenticate, async (req: AuthRequest, res: Response) => {
    const jobIdParam = req.params.jobId;
    const jobId = Array.isArray(jobIdParam) ? jobIdParam[0] : jobIdParam;

    if (!jobId) {
        res.status(400).json({ error: "jobId is required" });
        return;
    }

    try {
        const queueReadyPromise = analysisQueueEvents.waitUntilReady();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Queue events timeout")), 5000)
        );

        await Promise.race([queueReadyPromise, timeoutPromise]);

        const job = await Job.fromId(analysisQueue, jobId);
        if (!job) {
            res.status(404).json({ error: "Job not found" });
            return;
        }

        const hasAccess = await canAccessJob(req, job);
        if (!hasAccess) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        let cleanedUp = false;
        const cleanup = () => {
            if (cleanedUp) {
                return;
            }

            cleanedUp = true;
            clearInterval(heartbeat);
            clearTimeout(timeout);
            analysisQueueEvents.off("progress", onProgress);
            analysisQueueEvents.off("completed", onCompleted);
            analysisQueueEvents.off("failed", onFailed);

            if (!res.writableEnded) {
                res.end();
            }
        };

        const heartbeat = setInterval(() => {
            res.write(": heartbeat\n\n");
        }, HEARTBEAT_INTERVAL_MS);

        const timeout = setTimeout(() => {
            writeSseEvent(res, "timeout", {
                code: "STREAM_TIMEOUT",
                error: "The live session expired before the analysis finished. It may still complete in the background.",
                jobId
            });
            cleanup();
        }, STREAM_TIMEOUT_MS);

        const onProgress = ({ jobId: eventJobId, data }: { jobId: string; data: unknown }) => {
            if (eventJobId !== jobId) {
                return;
            }

            writeSseEvent(res, "progress", normalizeProgressPayload(data));
        };

        const onCompleted = ({
            jobId: eventJobId,
            returnvalue
        }: {
            jobId: string;
            returnvalue: unknown;
        }) => {
            if (eventJobId !== jobId) {
                return;
            }

            writeSseEvent(res, "complete", {
                success: true,
                jobId,
                ...normalizeReturnValue(returnvalue)
            });
            cleanup();
        };

        const onFailed = ({
            jobId: eventJobId,
            failedReason
        }: {
            jobId: string;
            failedReason: string;
        }) => {
            if (eventJobId !== jobId) {
                return;
            }

            const failure = classifyAnalysisFailure(failedReason);
            writeSseEvent(res, "failed", {
                code: failure.code,
                error: failure.message,
                jobId
            });
            cleanup();
        };

        analysisQueueEvents.on("progress", onProgress);
        analysisQueueEvents.on("completed", onCompleted);
        analysisQueueEvents.on("failed", onFailed);

        req.on("close", cleanup);

        const state = await job.getState();

        if (job.progress && typeof job.progress === "object") {
            writeSseEvent(res, "progress", normalizeProgressPayload(job.progress));
        }

        if (state === "completed") {
            writeSseEvent(res, "complete", {
                success: true,
                jobId,
                alreadyComplete: true,
                ...normalizeReturnValue(job.returnvalue)
            });
            cleanup();
            return;
        }

        if (state === "failed") {
            const failure = classifyAnalysisFailure(job.failedReason);
            writeSseEvent(res, "failed", {
                code: failure.code,
                error: failure.message,
                jobId
            });
            cleanup();
        }
    } catch (error) {
        console.error("[analysis-stream] SSE setup failed:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
            return;
        }

        writeSseEvent(res, "failed", {
            error: "Internal error setting up analysis stream",
            jobId
        });
        res.end();
    }
});

export default router;
