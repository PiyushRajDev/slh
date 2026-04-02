import { Worker } from 'bullmq';
import { handleAnalyzeProject } from './jobs/analyzeProject';
import {
    EXTRACT_USER_CAPABILITIES_JOB_NAME,
    GENERATE_MARKET_FIT_REPORT_JOB_NAME,
    MARKET_FIT_QUEUE_NAME,
    PARSE_MARKET_JOBS_JOB_NAME
} from '../../api/src/lib/marketFit.queue';
import {
    handleExtractUserCapabilities,
    handleGenerateMarketFitReport,
    handleParseMarketJobs
} from './jobs/marketFit';
import IORedis from 'ioredis';

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null
});

export const worker = new Worker('analysis', async job => {
    switch (job.name) {
        case 'analyze-repo':
            console.log(`[Worker] Dispatching analyze-repo job:`, job.id);
            return await handleAnalyzeProject(job);
        default:
            console.warn(`[Worker] Unknown job type: ${job.name}`);
    }
}, { connection: connection as any });

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
});

console.log('[Worker] Worker started listening for jobs on queue "analysis"...');

export const marketFitWorker = new Worker(MARKET_FIT_QUEUE_NAME, async job => {
    switch (job.name) {
        case PARSE_MARKET_JOBS_JOB_NAME:
            console.log(`[Worker] Dispatching ${PARSE_MARKET_JOBS_JOB_NAME}:`, job.id);
            return await handleParseMarketJobs(job as any);
        case EXTRACT_USER_CAPABILITIES_JOB_NAME:
            console.log(`[Worker] Dispatching ${EXTRACT_USER_CAPABILITIES_JOB_NAME}:`, job.id);
            return await handleExtractUserCapabilities(job as any);
        case GENERATE_MARKET_FIT_REPORT_JOB_NAME:
            console.log(`[Worker] Dispatching ${GENERATE_MARKET_FIT_REPORT_JOB_NAME}:`, job.id);
            return await handleGenerateMarketFitReport(job as any);
        default:
            console.warn(`[Worker] Unknown market-fit job type: ${job.name}`);
    }
}, { connection: connection as any, concurrency: 20 });

marketFitWorker.on('failed', (job, err) => {
    console.error(`[Worker] Market fit job ${job?.id} failed with error:`, err);
});

console.log(`[Worker] Worker started listening for jobs on queue "${MARKET_FIT_QUEUE_NAME}"...`);
