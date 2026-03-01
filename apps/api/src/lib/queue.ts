import { Queue } from "bullmq";

export const analysisQueue = new Queue("analysis", {
    connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT ?? 6379),
    },
});
