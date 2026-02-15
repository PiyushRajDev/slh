import "./env.js";
import { Worker } from "bullmq";
import { connection } from "./infrastructure/redis.js";
import { processProfileJob } from "./processor/profile.processor.js";
import { prisma } from "@slh/database";

const worker = new Worker("profileQueue", processProfileJob, {
    connection: connection as any,
    concurrency: 5,
});

console.log(`[Worker] Started listening on profileQueue (concurrency: 5)`);

worker.on("active", (job) => {
    console.log(`[Worker] Active: Job ${job.id} [${job.name}] started processing for ${job.data.studentId} on ${job.data.platform}`);
});

worker.on("completed", (job) => {
    console.log(`[Worker] Completed: Job ${job.id} for ${job.data.studentId} finished successfully`);
});

worker.on("failed", (job, err) => {
    console.error(`[Worker] Failed: Job ${job?.id} for ${job?.data?.studentId} failed with error: ${err.message}`);
});

worker.on("error", (err) => {
    console.error(`[Worker] Internal Error: ${err.message}`);
});

worker.on("stalled", (jobId) => {
    console.warn(`[Worker] Stalled: Job ${jobId} has stalled and will be moved back to waiting`);
});

// Global Exception Handlers
process.on("uncaughtException", (err) => {
    console.error(`[Global] Uncaught Exception: ${err.message}`);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("[Global] Unhandled Rejection at:", promise, "reason:", reason);
});

// Graceful Shutdown
const shutdown = async () => {
    console.log("Shutting down worker...");
    await worker.close();
    console.log("Worker closed.");
    await prisma.$disconnect();
    console.log("Database disconnected.");
    process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
