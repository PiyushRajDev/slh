import { Queue, QueueEvents } from "bullmq";

export const ANALYSIS_QUEUE_NAME = "analysis";
export const ANALYZE_REPO_JOB_NAME = "analyze-repo";

export const analysisQueueConnection = {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
};

export const analysisQueue = new Queue(ANALYSIS_QUEUE_NAME, {
    connection: analysisQueueConnection,
    defaultJobOptions: {
        removeOnComplete: { age: 24 * 3600, count: 1000 },
        removeOnFail: { age: 7 * 24 * 3600, count: 5000 },
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
    },
});

export const analysisQueueEvents = new QueueEvents(ANALYSIS_QUEUE_NAME, {
    connection: analysisQueueConnection,
});
