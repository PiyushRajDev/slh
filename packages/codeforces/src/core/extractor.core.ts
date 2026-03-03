import { cfClient, CFApiError } from "../client/cf.client"
import { log } from "../utils/logger"
import type { CFExtractedProfile, CFSubmission } from "../contracts/types"

const PAGE_SIZE    = 1000
const MAX_SUBS     = 50_000
const MAX_PAGES    = Math.ceil(MAX_SUBS / PAGE_SIZE)

async function fetchAllSubmissions(handle: string): Promise<CFSubmission[]> {
  const all: CFSubmission[] = []

  for (let page = 0; page < MAX_PAGES; page++) {
    const from  = page * PAGE_SIZE + 1
    const batch = await cfClient.getUserStatus(handle, from, PAGE_SIZE)

    if (!batch.length) break
    all.push(...batch)
    if (all.length >= MAX_SUBS) {
      log.warn(`Submission cap hit for ${handle}`)
      break
    }
    // CF returns fewer than PAGE_SIZE on the last page
    if (batch.length < PAGE_SIZE) break
  }

  return all
}

export async function extractCFProfile(handle: string): Promise<CFExtractedProfile> {
  log.info("Extracting profile:", handle)

  // Fetch profile + rating history in parallel (independent calls)
  const [[profile], ratingHistory] = await Promise.all([
    cfClient.getUserInfo(handle),
    cfClient.getUserRating(handle).catch((err: unknown) => {
      // Unrated users have no contest history — CF returns FAILED for them
      if (err instanceof CFApiError && err.isTerminal) return []
      throw err
    }),
  ])

  if (!profile) throw new CFApiError(`Handle not found: ${handle}`, 400)

  const submissions = await fetchAllSubmissions(handle)

  log.info(`Done: ${handle} — ${submissions.length} submissions`)

  return {
    handle,
    extractedAt: Math.floor(Date.now() / 1000),
    profile,
    ratingHistory,
    submissionCount: submissions.length,
    submissions,
  }
}