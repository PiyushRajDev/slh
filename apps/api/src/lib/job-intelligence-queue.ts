import { Queue, QueueEvents } from 'bullmq';

export const JI_QUEUE_NAME = 'job-intelligence';
export const JI_JOB_NAME = 'analyze-market';

export const jiQueueConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const jiQueue = new Queue(JI_QUEUE_NAME, {
  connection: jiQueueConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const jiQueueEvents = new QueueEvents(JI_QUEUE_NAME, {
  connection: jiQueueConnection,
});
