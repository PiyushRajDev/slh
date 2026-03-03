import IORedis from "ioredis"
import { log } from "../utils/logger"

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"


export const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck:     true,
  retryStrategy: (times) => (times > 20 ? null : Math.min(times * 200, 5_000)),
})

redis.on("error", (err) => log.error("Redis error:", err.message))
redis.on("ready", ()    => log.info("Redis ready"))


export const bullmqConnection = {
  host:                 process.env.REDIS_HOST ?? "127.0.0.1",
  port:                 parseInt(process.env.REDIS_PORT ?? "6379", 10),
  maxRetriesPerRequest: null as null,
  enableReadyCheck:     false,
}

export const pingRedis = async (): Promise<boolean> => {
  try   { return (await redis.ping()) === "PONG" }
  catch { return false }
}