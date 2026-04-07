# Job Intelligence & Skill Gap Analysis — Design Spec

**Date:** 2026-04-03
**Status:** Approved
**Author:** Claude + Piyush

---

## 1. Overview

Allow students to filter jobs by role/experience/salary, fetch relevant listings from multiple external sources, extract required skills via LLM, analyze market demand, compare against the student's full profile, and generate a personalized gap report with an actionable learning roadmap.

**This is separate from the existing internal jobs system** (admin-created `Job` model + `placement-engine`). This feature provides external market intelligence.

---

## 2. Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Job sources | Best-effort scraping (web3career, workingnomads) + public APIs (Remotive, Adzuna). Stubs for LinkedIn/Indeed. | Avoids ToS violations while providing real data |
| AI provider | Vercel AI SDK (`ai` package) with pluggable provider | Provider-agnostic, structured output via `generateObject()` + Zod |
| Processing model | Async via BullMQ worker + SSE progress | Matches existing `analyze-repo` pattern, 30-60s pipeline |
| Profile data | Everything: GitHub + DSA + JRI + ProjectAnalysis | Most accurate gap analysis |
| Package structure | New `packages/job-intelligence` | Follows monorepo convention (`project-analyzer`, `placement-engine`) |

---

## 3. Request Lifecycle

1. Student fills filters (role, experience, salary) → clicks "Analyze Market"
2. Frontend `POST /api/job-intelligence/analyze`
3. API checks for existing recent report with same `(studentId, role, experience, salary)`:
   - If COMPLETED and created within the last 6 hours and `jobsCount >= 10` → return existing `reportId` with `cached: true`
   - If IN_PROGRESS → return existing `reportId` (frontend reconnects to SSE)
   - Otherwise → continue
4. API creates `JobIntelligenceReport` (status: PENDING) inside a transaction (race condition guard)
5. API enqueues BullMQ job on `job-intelligence` queue
6. API returns `202 { reportId, status, cached: false }`
7. Frontend opens SSE on `/api/job-intelligence/stream/:reportId` (stream token auth, tied to userId + reportId, 5-min expiry)
8. Worker pops job, calls `@slh/job-intelligence` pipeline through 6 stages with checkpoint recovery
9. Worker publishes progress after each stage via Redis pub/sub → SSE
10. Final report saved to `JobIntelligenceReport`, status → COMPLETED
11. SSE pushes completion event, frontend renders results

---

## 4. Database Schema

### 4.1 JobIntelligenceReport

```prisma
model JobIntelligenceReport {
  id              String          @id @default(cuid())
  studentId       String
  student         Student         @relation(fields: [studentId], references: [id])

  status          AnalysisStatus  @default(PENDING)

  // Filters as columns (not JSON) for idempotency + queryability
  role            String
  experience      String
  salary          String

  // Pipeline tracking
  stage           String?         // "fetching" | "extracting" | "analyzing_demand" | "building_profile" | "gap_analysis" | "roadmap"
  progress        Int             @default(0)
  progressMessage String?

  // Results (JSON for flexibility)
  jobs            Json?
  skillsAnalysis  Json?
  gapAnalysis     Json?
  roadmap         Json?

  // Queryable metrics (extracted from JSON for fast access)
  jobsCount       Int?
  topSkills       String[]
  readinessScore  Int?

  // Error tracking (stored as JSON-serialized string)
  error           String?         // e.g. '{"stage":"skill_extraction","message":"...","retryable":true}'

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([studentId, createdAt])
  @@index([studentId, role, experience, salary])  // idempotency lookup
}
```

### 4.2 JobCache

```prisma
model JobCache {
  id                String   @id @default(cuid())

  role              String
  source            String   // "remotive" | "adzuna" | "web3career" | "workingnomads"

  title             String
  company           String?
  location          String?
  url               String   @unique

  rawDescription    String   @db.Text

  // Processing state
  parsed            Boolean  @default(false)
  extractionVersion Int      @default(1)   // bump when prompt changes → triggers re-extraction

  extractedSkills   Json?
  normalizedSkills  String[]              // canonicalized skill names for fast aggregation

  salary            String?
  experience        String?

  createdAt         DateTime @default(now())
  expiresAt         DateTime              // 24h TTL

  @@index([role, source])
  @@index([expiresAt])
  @@index([parsed])
}
```

### 4.3 SkillDemand (analytics, optional but high-impact)

```prisma
model SkillDemand {
  id         String   @id @default(cuid())
  role       String
  skill      String
  frequency  Int
  importance Float
  updatedAt  DateTime @updatedAt

  @@unique([role, skill])
}
```

### 4.4 Schema Design Decisions

- Filters stored as columns (not JSON) for composite index and idempotency queries
- `stage` field enables checkpoint-based pipeline recovery — if worker crashes, resume from last completed stage
- `topSkills` and `readinessScore` extracted as columns for fast UI access without JSON parsing
- `extractionVersion` on JobCache prevents stale cached skills when LLM prompts evolve
- `normalizedSkills` on JobCache enables instant aggregation without re-parsing JSON
- `SkillDemand` enables future dashboards, trend analysis, and "Top skills for backend dev (India)" queries

---

## 5. Package Structure

```
packages/job-intelligence/
  package.json
  tsconfig.json
  src/
    index.ts                          ← public API exports
    types.ts                          ← all interfaces and types
    pipeline.ts                       ← orchestrator with checkpoint recovery

    providers/
      base.ts                         ← JobProvider interface
      remotive.ts                     ← public JSON API, no key needed
      adzuna.ts                       ← REST API with app_id/app_key
      web3career.ts                   ← HTML scraping via fetch + cheerio
      workingnomads.ts                ← public JSON API
      linkedin.ts                     ← stub (returns [] + warning)
      indeed.ts                       ← stub (returns [] + warning)
      index.ts                        ← aggregator: parallel fetch, dedup, cache check

    ai/
      extractSkills.ts                ← LLM structured output via Vercel AI SDK
      analyzeDemand.ts                ← frequency counting, weighting, tier assignment
      gapAnalysis.ts                  ← hybrid LLM fuzzy match + deterministic scoring
      roadmap.ts                      ← constrained LLM roadmap generation
      schemas.ts                      ← Zod schemas for all LLM outputs
      canonicalize.ts                 ← skill name normalization map
      preprocess.ts                   ← strip fluff from job descriptions

    profile/
      buildProfile.ts                 ← aggregate GitHub + DSA + JRI + ProjectAnalysis
```

---

## 6. Job Providers Layer

### 6.1 Provider Interface

```typescript
interface JobProvider {
  name: string;
  fetch(filters: JobFilters): Promise<NormalizedJob[]>;
}

interface NormalizedJob {
  title: string;
  company: string | null;
  location: string | null;
  url: string;                // unique key for dedup
  description: string;
  salary: string | null;
  experience: string | null;
  source: string;
  postedAt: Date | null;
}

interface JobFilters {
  role: string;
  experience: string;
  salary: string;
}
```

### 6.2 Provider Details

| Provider | Method | Auth | Filter Support |
|----------|--------|------|----------------|
| **Remotive** | GET `remotive.com/api/remote-jobs` | None | Category mapping from role |
| **Adzuna** | GET `api.adzuna.com/v1/api/jobs` | app_id + app_key (free tier: 250 req/day) | Role, salary, location (India market) |
| **Web3Career** | HTML scrape via `fetch` + `cheerio` | None | Category from URL path |
| **WorkingNomads** | GET `workingnomads.co/api/exposed_jobs` | None | Category filter |
| **LinkedIn** | Stub → returns `[]` | N/A | Logs "requires official API partnership" |
| **Indeed** | Stub → returns `[]` | N/A | Logs "requires publisher partnership" |

### 6.3 Aggregator Logic (`providers/index.ts`)

1. Check `JobCache` for fresh entries (role + source, `expiresAt > now`) — skip providers with fresh cache
2. Run remaining providers in parallel via `Promise.allSettled()`
3. Per-provider timeout: 15 seconds
4. Failed providers log error, don't fail pipeline (graceful degradation)
5. Deduplicate by `url` (first occurrence wins)
6. Write new results to `JobCache` with 24h TTL
7. Target: 15-30 jobs per query
8. Filter mapping: `role` → provider-specific category/search term; `experience` and `salary` → native filter where supported, post-filter from description otherwise

---

## 7. AI Processing Pipeline

### 7.1 Skill Extraction (`ai/extractSkills.ts`)

**Input:** `NormalizedJob[]` with descriptions
**Output:** Each job annotated with extracted skills

Zod schema:
```typescript
const ExtractedSkillsSchema = z.object({
  skills: z.array(z.object({
    name: z.string(),
    category: z.enum(["language", "framework", "tool", "concept"]),
    required: z.boolean(),
  }))
});
```

Processing:
- **Preprocessing:** Strip benefits, EEO/legal, company fluff via regex heuristics before sending to LLM
- **Adaptive batching:** Estimate tokens per description, fill batches to ~3K tokens. Fallback to single-job calls if one description exceeds 2K tokens
- **Cache check:** Skip jobs where `JobCache.extractedSkills` exists AND `extractionVersion` matches current version
- **Canonicalization:** Apply `CANON` map after LLM output, before cache write:
  ```typescript
  const CANON: Record<string, string> = {
    "react.js": "React", "reactjs": "React",
    "node": "Node.js", "nodejs": "Node.js",
    "js": "JavaScript", "ts": "TypeScript",
    // ... extensible
  };
  ```
- **Limits:** Max 25 skills per job. Drop `soft_skill` category (keeps signal high)
- **Retry:** Vercel AI SDK `maxRetries: 1` on invalid structured output
- **Save:** Write `extractedSkills` (JSON) + `normalizedSkills` (string array) + `extractionVersion` back to `JobCache`

### 7.2 Demand Analysis (`ai/analyzeDemand.ts`)

**Input:** All extracted skills across all jobs
**Output:** Ranked `SkillDemand[]`

```typescript
interface SkillDemand {
  name: string;
  category: string;
  frequency: number;
  frequencyPercent: number;
  weightedFrequency: number;
  demandTier: "critical" | "high" | "medium" | "low";
  sources: string[];
}
```

Processing (pure computation, no LLM):
- Normalize skill names via `CANON` map
- Count frequency across all jobs
- **Weighted frequency:** `weightedFreq = Σ(jobCount * sourceWeight)` where API sources = 1.0, scraped = 0.8
- **Dominance cap:** Single provider can't contribute >50% of a skill's weight
- **Percentile-based tiers per run:** Top 10% = critical, next 20% = high, next 30% = medium, rest = low (adapts to sparse vs. dense markets)
- Sort by weighted frequency descending
- Optionally upsert into `SkillDemand` model for analytics

### 7.3 Gap Analysis (`ai/gapAnalysis.ts`)

**Input:** `SkillDemand[]` + student's unified capability profile
**Output:** `GapReport`

```typescript
interface GapReport {
  readinessScore: number;       // 0-100, deterministic
  matched: SkillMatch[];
  partial: SkillMatch[];
  missing: SkillMatch[];
}

interface SkillMatch {
  skill: string;
  demandTier: string;
  confidence: "high" | "medium" | "low";
  evidence: {
    projects: number;
    repos: number;
    lastUsed: string | null;
    source: string[];           // ["project-analysis", "github", "dsa"]
  };
}
```

**Hybrid approach:**
1. **LLM handles ONLY fuzzy matching** — "Express" ≈ "Node.js backend", "MongoDB" contributes to "Database". Single call with demand skills + student profile → returns match classifications
2. **Scoring is fully deterministic:**
   ```
   readinessScore = Σ(demandWeight(skill) * proficiency(skill)) / Σ(demandWeight(all)) * 100

   proficiency: 0 (missing), 0.5 (partial), 1.0 (matched)
   demandWeight: critical = 1.0, high = 0.75, medium = 0.5, low = 0.25
   ```
3. Evidence is structured with concrete counts from profile data

### 7.4 Roadmap Generation (`ai/roadmap.ts`)

**Input:** `GapReport` (missing + partial skills)
**Output:** Phased learning plan

```typescript
const RoadmapSchema = z.object({
  phases: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    skills: z.array(z.string()).min(2).max(4),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    })).min(1),
    resources: z.array(z.object({
      title: z.string(),
      type: z.enum(["course", "tutorial", "documentation", "practice"]),
    })),
    outcome: z.string(),
  })).min(2).max(6),
  estimatedTotalDuration: z.string(),
  priorityOrder: z.array(z.string()),
});
```

**Constraints enforced via prompt + Zod:**
- Max 4-6 phases, each with 2-4 skills and 1+ project
- Projects must combine multiple skills
- Each phase has an `outcome` field ("Deploy a full-stack app with auth + Docker")
- No URLs in resources (go stale) — just titles and types
- Priority order: high-demand missing skills first (highest ROI)

---

## 8. Student Capability Profile (`profile/buildProfile.ts`)

Aggregates from all available sources:

| Source | Data Extracted |
|--------|---------------|
| `GitHubProfile` | languages, frameworks, total repos, total commits, stars |
| `ProjectAnalysis` (all reports) | tech stack per project, architecture signals, code quality scores, profile matches |
| `DSAProfile` (LeetCode/Codeforces) | total solved, difficulty distribution, rating |
| `JRICalculation` | composite JRI score, github/dsa/academic sub-scores |

Output: unified `StudentCapabilityProfile` with skill-level evidence mapping:
```typescript
interface StudentCapabilityProfile {
  skills: Array<{
    name: string;           // canonicalized
    level: number;          // 0-3 (none, beginner, intermediate, advanced)
    evidence: {
      projects: number;
      repos: number;
      lastUsed: string | null;
      source: string[];
    };
  }>;
  dsaLevel: "none" | "beginner" | "intermediate" | "advanced";
  overallJri: number | null;
}
```

---

## 9. Pipeline Orchestrator (`pipeline.ts`)

```typescript
async function runJobIntelligencePipeline(
  filters: JobFilters,
  studentId: string,
  reportId: string,
  onProgress: (percent: number, message: string, stage: string) => void
): Promise<JobIntelligenceResult>
```

### 9.1 Progress Mapping

| Stage | Progress Range | Message |
|-------|---------------|---------|
| Fetch jobs | 0 → 20% | "Fetching jobs from X providers..." |
| Extract skills | 20 → 45% | "Analyzing job descriptions..." |
| Demand analysis | 45 → 55% | "Computing skill demand..." |
| Build profile | 55 → 65% | "Building your capability profile..." |
| Gap analysis | 65 → 80% | "Comparing your skills to market..." |
| Roadmap | 80 → 100% | "Generating your learning roadmap..." |

**Granular progress within stages:** `progress = stageBase + (completedItems / totalItems) * stageWeight`
Example: extracting 20 jobs in batches of 5 → progress increments at 20%, 26%, 32%, 39%, 45%

### 9.2 Checkpoint Recovery

Before each stage, check if the report already has that stage's output:
```
if (report.jobs) → skip fetch
if (report.skillsAnalysis) → skip extraction
if (report.gapAnalysis) → skip gap analysis
...
```
Enables resume after worker crash without restarting from scratch.

### 9.3 Timeouts

| Scope | Limit |
|-------|-------|
| Total pipeline | 90 seconds |
| Fetch (all providers) | 10 seconds |
| Skill extraction (all batches) | 30 seconds |
| Demand analysis | 5 seconds |
| Profile build | 5 seconds |
| Gap analysis | 15 seconds |
| Roadmap generation | 15 seconds |

---

## 10. API Routes

All routes mounted under `/api/job-intelligence/`.

### 10.1 POST `/analyze`

- Auth: `authenticate` + `requirePermission('job-intelligence.analyze')`
- Rate limit: 3 requests / 10 minutes per student
- Idempotency check: find existing report with same `(studentId, role, experience, salary)` where COMPLETED + <6h + `jobsCount >= 10`, or IN_PROGRESS
- If no match: create report in transaction (race condition guard), enqueue BullMQ job
- Response: `202 { reportId, status, cached: boolean }`

### 10.2 GET `/:id`

- Auth: `authenticate` + verify `report.studentId === req.user.studentId`
- Returns full report (all JSON fields) if COMPLETED
- Returns partial data + progress if IN_PROGRESS

### 10.3 GET `/stream/:id`

- Auth: stream token (tied to userId + reportId, 5-min expiry)
- SSE endpoint reading from Redis pub/sub channel `job-intelligence:${reportId}`
- On connect: immediately send current DB state `{ progress, stage, status }`
- Heartbeat: `{ type: "heartbeat" }` every 15 seconds
- Events: `{ type: "progress", progress, stage, message }` and `{ type: "complete", reportId }`

### 10.4 GET `/history`

- Auth: `authenticate`
- Paginated: `?page=1&limit=10`
- Returns lightweight list: `{ id, role, experience, salary, readinessScore, topSkills, status, createdAt }`

### 10.5 POST `/:id/cancel`

- Auth: `authenticate` + verify ownership
- Marks report status as FAILED with `error: { stage: "cancelled", message: "Cancelled by user", retryable: false }`
- Worker checks status before each stage and exits early if cancelled

---

## 11. Worker Integration

### 11.1 Queue Configuration

- Queue name: `job-intelligence`
- Separate from existing `analysis` queue (independent scaling)

```typescript
{
  attempts: 2,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: true,
  removeOnFail: false,
}
```

### 11.2 Job Handler (`apps/worker/src/jobs/jobIntelligence.ts`)

- On start: check `if report.status === COMPLETED → return early` (idempotent)
- Set status → IN_PROGRESS atomically
- Call `runJobIntelligencePipeline()` with progress callback that publishes to Redis pub/sub
- Save each stage's output to DB incrementally (enables checkpoint recovery)
- On success: set status → COMPLETED, populate `jobsCount`, `topSkills`, `readinessScore`
- On failure: set status → FAILED with structured error `{ stage, message, retryable }`

### 11.3 Worker Registration

Add to `apps/worker/src/index.ts`:
```typescript
import { handleJobIntelligence } from './jobs/jobIntelligence';

// New worker for job-intelligence queue
const jiWorker = new Worker('job-intelligence', async job => {
  switch (job.name) {
    case 'analyze-market':
      return await handleJobIntelligence(job);
    default:
      console.warn(`[JI Worker] Unknown job type: ${job.name}`);
  }
}, { connection });
```

---

## 12. Frontend

### 12.1 Page & Components

```
apps/frontend/src/
  app/(student)/job-intelligence/
    page.tsx                          ← client component (interactive)

  components/job-intelligence/
    FilterBar.tsx                     ← 3 dropdowns + "Analyze Market" button
    AnalysisProgress.tsx              ← SSE-driven animated progress bar + stage message
    ReadinessScore.tsx                ← circular score gauge + verdict text
    JobResultsList.tsx                ← scrollable job cards with source badges + skill tags
    SkillDemandChart.tsx              ← horizontal bar chart, color-coded by demand tier
    GapAnalysisReport.tsx             ← matched/partial/missing sections with evidence tags
    RoadmapTimeline.tsx               ← phased cards with projects, outcomes, durations

  lib/api-client.ts                   ← add: analyzeMarket(), getReport(), getReportHistory(), cancelReport()
```

### 12.2 Page States

| State | Behavior |
|-------|----------|
| **Empty** | Filters shown with CTA, no prior reports |
| **Loading** | Progress bar animating, SSE connected, filters disabled |
| **Complete** | All result sections rendered |
| **Error** | Stage-specific error message + retry button |
| **Cached** | Instant display from recent report + "Re-analyze" option |
| **History** | Past reports accessible via sidebar/dropdown |

### 12.3 Filter Options (V1, hardcoded)

- **Role:** Backend Developer, Frontend Developer, Full-Stack Developer, DevOps Engineer, Data Engineer, Mobile Developer
- **Experience:** 0-1 years, 0-2 years, 2-5 years, 5+ years
- **Salary:** 3-6 LPA, 6-8 LPA, 8-12 LPA, 12-20 LPA, 20+ LPA

### 12.4 SSE Handling

Reuses the same pattern from the existing analysis page:
- Stream token auth (request token before opening SSE)
- Auto-reconnect on disconnect
- On reconnect: immediate state sync from server (current progress/stage/status)
- Heartbeat detection: if no event for 30s, reconnect

### 12.5 Cached Report Handling

When `POST /analyze` returns `cached: true`, the frontend skips opening an SSE stream and directly calls `GET /:id` to load the completed report. A "Re-analyze" button is shown that forces a fresh analysis (bypasses the cache check via a `force: true` query parameter).

### 12.6 Multi-Tab Consistency

All state driven by `reportId` from server. No local-only state for results. Two tabs viewing the same report see the same data.

---

## 13. Error Handling & Edge Cases

| Scenario | Handling |
|----------|----------|
| No jobs found (all providers return 0) | Return report with `jobsCount: 0`, show friendly "No jobs found for these filters" message |
| Single provider fails | Log error, continue with remaining providers (graceful degradation) |
| LLM returns invalid JSON | Vercel AI SDK `maxRetries: 1`, then skip that batch and continue |
| LLM rate limited | Exponential backoff within extraction stage |
| Student has no GitHub/DSA data | Build partial profile, gap analysis notes "limited profile data — accuracy may be lower" |
| Worker crashes mid-pipeline | Checkpoint recovery on retry — resume from last saved stage |
| Duplicate rapid submissions | Transaction-based find-or-create + composite index guard |
| SSE connection drops | Client auto-reconnects, server sends current state on connect |
| Pipeline exceeds 90s timeout | Fail with `{ stage: "timeout", message: "Pipeline exceeded time limit", retryable: true }` |
| Rate limit exceeded | Return `429` with retry-after header |

---

## 14. Performance

- **Job cache:** 24h TTL on `JobCache` — avoids re-scraping identical listings
- **Skill cache:** `extractedSkills` cached per job + `extractionVersion` — avoids redundant LLM calls
- **Report cache:** Reuse recent COMPLETED reports with same filters (6h window, quality threshold)
- **Batch LLM calls:** 3-5 job descriptions per call (adaptive by token budget)
- **Parallel providers:** All 4+ providers fetched simultaneously via `Promise.allSettled()`
- **Incremental persistence:** Each stage saves to DB immediately — no waiting for full pipeline
- **Lightweight history:** Only queryable columns returned, no JSON blobs
- **Cache cleanup:** Expired `JobCache` entries pruned via a periodic BullMQ repeatable job (runs every 6 hours, deletes entries where `expiresAt < now`)

---

## 15. Security

- All endpoints require authentication via JWT
- SSE stream tokens scoped to `userId + reportId`, expire in 5 minutes
- Rate limit: 3 analyses per 10 minutes per student
- Report ownership verified on all read endpoints (`report.studentId === req.user.studentId`)
- No raw job descriptions exposed to frontend — only extracted/processed data
- LLM API keys stored in `apps/api/.env`, never sent to client

---

## 16. New Environment Variables

```
# Adzuna API (free tier)
ADZUNA_APP_ID=
ADZUNA_APP_KEY=

# AI provider for Vercel AI SDK
AI_PROVIDER=anthropic          # or "openai"
ANTHROPIC_API_KEY=             # if using Anthropic
OPENAI_API_KEY=                # if using OpenAI
```

---

## 17. Permission Addition

Add to `apps/api/src/auth/permissions.ts`:

```typescript
'job-intelligence.analyze'    // STUDENT, ADMIN, SUPER_ADMIN
'job-intelligence.read'       // STUDENT (own only), ADMIN, SUPER_ADMIN
```

---

## 18. Package Dependencies

```
packages/job-intelligence:
  dependencies:
    - ai                        (Vercel AI SDK)
    - @ai-sdk/anthropic         (or @ai-sdk/openai)
    - zod                       (structured output schemas)
    - cheerio                   (HTML parsing for scrapers)
    - @slh/database             (Prisma client for cache + reports)
  devDependencies:
    - typescript
```
