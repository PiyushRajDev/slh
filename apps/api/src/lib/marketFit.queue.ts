import { FlowProducer, Queue, QueueEvents } from "bullmq";
import { analysisQueueConnection } from "./queue";

export const MARKET_FIT_QUEUE_NAME = "market-fit";
export const PARSE_MARKET_JOBS_JOB_NAME = "parse-market-jobs";
export const EXTRACT_USER_CAPABILITIES_JOB_NAME = "extract-user-capabilities";
export const GENERATE_MARKET_FIT_REPORT_JOB_NAME = "generate-market-fit-report";

export const marketFitQueue = new Queue(MARKET_FIT_QUEUE_NAME, {
    connection: analysisQueueConnection,
    defaultJobOptions: {
        removeOnComplete: { age: 24 * 3600, count: 1000 },
        removeOnFail: { age: 7 * 24 * 3600, count: 5000 },
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 }
    }
});

export const marketFitQueueEvents = new QueueEvents(MARKET_FIT_QUEUE_NAME, {
    connection: analysisQueueConnection
});

export const marketFitFlow = new FlowProducer({
    connection: analysisQueueConnection
});
