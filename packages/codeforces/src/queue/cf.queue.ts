import { Queue, QueueEvents } from "bullmq"
import { bullmqConnection } from "../cache/redis.client"
import { log } from "../utils/logger"
import type { CFJobData } from "../contracts/types"

export const cfQueue = new Queue<CFJobData>("cf-profile", {
  connection: bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail:     { age: 86_400 },   // keep failed jobs 24h for debugging
    attempts: 3,
    backoff: { type: "exponential", delay: 3_000 }, // 3s → 6s → 12s
  },
})

/**
 * Enqueue a profile fetch job with deduplication.
 *
 * jobId = "cf-<handle>" (dash, not colon — BullMQ v5 forbids ":" in jobIds).
 * If the same handle is already waiting in the queue, BullMQ silently skips it.
 * This prevents 100 users requesting "tourist" from spawning 100 CF API calls.
 */
export async function enqueueProfileRefresh(handle: string): Promise<void> {
  await cfQueue.add(
    "refresh-profile",
    { handle, requestedAt: Date.now() },
    { jobId: `cf-${handle}` },
  )
  log.info("Job enqueued:", handle)
}

const queueEvents = new QueueEvents("cf-profile", { connection: bullmqConnection })
queueEvents.on("completed", ({ jobId }) => log.info("Job completed:", jobId))
queueEvents.on("failed",    ({ jobId, failedReason }) => log.error("Job failed:", jobId, failedReason))