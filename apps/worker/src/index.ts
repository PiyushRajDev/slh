import { Worker } from 'bullmq';
import { handleAnalyzeProject } from './jobs/analyzeProject';
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
            break;
        default:
            console.warn(`[Worker] Unknown job type: ${job.name}`);
    }
}, { connection: connection as any });

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
});

console.log('[Worker] Worker started listening for jobs on queue "analysis"...');
