import { Worker } from "bullmq"
import { redis, bullmqConnection } from "../cache/redis.client"
import { extractCFProfile } from "../core/extractor.core"
import { CFApiError } from "../client/cf.client"
import { log } from "../utils/logger"
import type { CFJobData, CFSnapshot, CFErrorSnapshot } from "../contracts/types"
import pLimit from "p-limit"

const SNAPSHOT_TTL     = 3_600   // 1 hour — cached profile
const NEG_CACHE_TTL    = 300     // 5 min  — bad handle / not found
const WORKER_CONC      = parseInt(process.env.WORKER_CONCURRENCY ?? "3", 10)

const SNAPSHOT_KEY = (h: string) => `cf:snapshot:${h}`
const LOCK_KEY     = (h: string) => `cf:lock:${h}`

// p-limit ensures max WORKER_CONC extractions run at once per process
const limit = pLimit(WORKER_CONC)

const worker = new Worker<CFJobData>(
  "cf-profile",
  async (job) => {
    const { handle } = job.data

    return limit(async () => {
      log.info(`[job:${job.id}] Processing: ${handle}`)

      try {
        const data = await extractCFProfile(handle)
        const snapshot: CFSnapshot = data

        // Atomic pipeline: store snapshot + release lock in one round-trip
        await redis
          .pipeline()
          .set(SNAPSHOT_KEY(handle), JSON.stringify(snapshot), "EX", SNAPSHOT_TTL)
          .del(LOCK_KEY(handle))
          .exec()

        log.info(`[job:${job.id}] Stored: ${handle} (${data.submissionCount} submissions)`)
        return { handle, submissionCount: data.submissionCount }

      } catch (err) {
        // Always release the lock — even on failure — so future requests can retry
        await redis.del(LOCK_KEY(handle)).catch(() => null)

        if (err instanceof CFApiError && err.isTerminal) {
          // Negative cache: stops hammering CF for handles that don't exist
          const errorSnap: CFErrorSnapshot = {
            handle,
            error:       err.message,
            extractedAt: Math.floor(Date.now() / 1000),
          }
          await redis
            .set(SNAPSHOT_KEY(handle), JSON.stringify(errorSnap), "EX", NEG_CACHE_TTL)
            .catch(() => null)

          log.warn(`[job:${job.id}] Terminal error for ${handle}: ${err.message}`)
          // Return instead of throw — prevents BullMQ from retrying a hopeless job
          return { handle, error: err.message }
        }

        log.error(`[job:${job.id}] Transient error for ${handle}:`, err)
        throw err // BullMQ will retry with exponential backoff
      }
    })
  },
  {
    // CRITICAL: bullmqConnection, NOT the shared redis client.
    // BullMQ uses blocking BLPOP. Sharing the app client causes
    // "Command timed out" every 5 seconds in an infinite loop.
    connection:       bullmqConnection,
    concurrency:      WORKER_CONC,
    stalledInterval:  30_000,
    maxStalledCount:  1,
  },
)

worker.on("failed", (job, err) => log.error(`Job ${job?.id} failed permanently:`, err?.message))
worker.on("error",  (err)      => log.error("Worker error:", err.message))

log.info(`CF Worker running — concurrency: ${WORKER_CONC}`)

// Graceful shutdown: finish in-flight jobs before exiting
async function shutdown(signal: string) {
  log.info(`${signal} — shutting down worker...`)
  await worker.close()
  await redis.quit()
  log.info("Worker shutdown complete")
  process.exit(0)
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT",  () => shutdown("SIGINT"))