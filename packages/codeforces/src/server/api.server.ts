import express, { Request, Response, NextFunction } from "express"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { redis, pingRedis } from "../cache/redis.client"
import { enqueueProfileRefresh } from "../queue/cf.queue"
import { isValidHandle } from "../utils/validate"
import { log } from "../utils/logger"
import type { CFErrorSnapshot } from "../contracts/types"

const app  = express()
const PORT = parseInt(process.env.PORT ?? "4001", 10)


app.use(helmet())
app.disable("x-powered-by")

// Rate limit: 30 req/min per IP (tunable via env)
app.use(rateLimit({
  windowMs:       60_000,
  max:            parseInt(process.env.RATE_LIMIT_MAX ?? "30", 10),
  standardHeaders: true,
  legacyHeaders:   false,
  message:        { error: "Too many requests. Slow down." },
}))

// ---------- Redis key helpers ----------
const SNAPSHOT_KEY = (h: string) => `cf:snapshot:${h}`
const LOCK_KEY     = (h: string) => `cf:lock:${h}`
const LOCK_TTL     = 120  // seconds — max time a job should take

// ---------- Routes ----------

app.get("/health", async (_req: Request, res: Response) => {
  const ok = await pingRedis()
  res.status(ok ? 200 : 503).json({ ok, ts: Date.now() })
})

app.get("/cf/:handle", async (req: Request, res: Response) => {
  const { handle } = req.params

  // 1. Validate handle format
  if (!isValidHandle(handle)) {
    return res.status(400).json({ error: "Invalid handle format." })
  }

  try {
    // 2. Cache hit — serve immediately, no CF API call needed
    const cached = await redis.get(SNAPSHOT_KEY(handle))
    if (cached) {
      const parsed = JSON.parse(cached)

      // Negative cache hit — handle doesn't exist on CF
      if ("error" in parsed) {
        return res.status(404).json({ error: (parsed as CFErrorSnapshot).error })
      }

      log.info("Cache hit:", handle)
      return res.json({ source: "cache", data: parsed })
    }

    // 3. Acquire lock atomically with NX (only one winner in a race)
    // This prevents 100 concurrent requests for "tourist" from spawning 100 jobs
    const acquired = await redis.set(LOCK_KEY(handle), "1", "EX", LOCK_TTL, "NX")
    if (!acquired) {
      // Lock already held — job is queued or in-flight
      return res.status(202).json({ source: "queued", message: "Profile is being fetched, try again shortly." })
    }

    // 4. We won the lock — enqueue exactly one job
    await enqueueProfileRefresh(handle)
    return res.status(202).json({ source: "queued", message: "Profile fetch started." })

  } catch (err) {
    log.error("API error for handle:", handle, err)
    return res.status(500).json({ error: "Internal server error." })
  }
})

// ---------- Global error handler ----------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log.error("Unhandled error:", err.message)
  res.status(500).json({ error: "Internal server error." })
})

// ---------- Start ----------
const server = app.listen(PORT, () => {
  log.info(`CF API running on http://localhost:${PORT}`)
})

// Graceful shutdown
async function shutdown(signal: string) {
  log.info(`${signal} — shutting down API...`)
  server.close(async () => {
    await redis.quit()
    log.info("API shutdown complete")
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000)
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT",  () => shutdown("SIGINT"))