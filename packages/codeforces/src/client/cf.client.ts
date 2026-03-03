import axios, { AxiosError } from "axios"
import Bottleneck from "bottleneck"
import { log } from "../utils/logger"
import type { CFUserInfo, CFRatingChange, CFSubmission } from "../contracts/types"

const BASE = "https://codeforces.com/api"

/**
 * Rate limiter: 1 request per 700ms (~1.4 req/s).
 */
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 700,
})

interface CFApiResponse<T> {
  status: "OK" | "FAILED"
  comment?: string
  result: T
}

export class CFApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = "CFApiError"
  }

  get isTerminal(): boolean {
    return this.statusCode === 400 || this.statusCode === 403
  }
}

async function cfGet<T>(endpoint: string, params: Record<string, unknown>): Promise<T> {
  return limiter.schedule(async () => {
    try {
      const res = await axios.get<CFApiResponse<T>>(`${BASE}/${endpoint}`, {
        params,
        timeout: 10_000,
        headers: { "User-Agent": "SLH-CF-Service/1.0" },
      })

      if (res.data.status !== "OK") {
        throw new CFApiError(res.data.comment ?? "CF API returned FAILED", 400)
      }

      return res.data.result
    } catch (err) {
      if (err instanceof CFApiError) throw err

      const status = (err as AxiosError).response?.status

      if (status === 400) throw new CFApiError("Bad request — invalid handle?", 400)
      if (status === 403) throw new CFApiError("CF API access forbidden", 403)
      if (status === 429) throw new CFApiError("CF API rate limited", 429)

      // Network / 5xx — transient, BullMQ will retry
      log.warn("CF API transient error:", (err as Error).message)
      throw err
    }
  })
}

export const cfClient = {
  getUserInfo: (handle: string) =>
    cfGet<CFUserInfo[]>("user.info", { handles: handle }),

  getUserRating: (handle: string) =>
    cfGet<CFRatingChange[]>("user.rating", { handle }),

  getUserStatus: (handle: string, from: number, count: number) =>
    cfGet<CFSubmission[]>("user.status", { handle, from, count }),
}