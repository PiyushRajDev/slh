# Student Ranking System — Design Spec
**Date:** 2026-04-04  
**Status:** Approved

---

## Overview

A two-phase, deterministic student ranking system that ranks all students in a college against a specific job posting. Uses `computeQuickMatchScore` for bulk pre-ranking and `matchJobToStudent` (via `gapAnalysisService`) for deep analysis on the top 50 candidates. Demand scores are stored per job in a new `JobCapabilityDemand` join table, auto-populated on job create/edit, and optionally editable by admins.

**Design constraint:** Same job + same student profiles must always produce the same ranking (deterministic). No AI in the pipeline.

---

## 1. Schema Changes

### New model: `JobCapabilityDemand`

```prisma
model JobCapabilityDemand {
  id           String     @id @default(cuid())
  jobId        String
  job          Job        @relation(fields: [jobId], references: [id], onDelete: Cascade)
  capabilityId String
  capability   Capability @relation(fields: [capabilityId], references: [id])
  demandScore  Float      // 0.1–1.0, auto-set from category heuristic, editable by admin

  @@unique([jobId, capabilityId])
  @@index([jobId])
}
```

`Job` model gains: `capabilityDemands JobCapabilityDemand[]`

### Auto-weight category heuristic

Stored in `packages/placement-engine/src/demandWeights.ts`:

| Category | Default demandScore |
|---|---|
| dsa, algorithms | 0.9 |
| backend, frontend | 0.7 |
| database, devops, cloud, system design | 0.6 |
| framework, language | 0.5 |
| tool | 0.4 |
| default | 0.5 |

This is the same category vocabulary used by `learningPaths.ts` — consistent throughout.

---

## 2. API Changes

### 2a. Job create/edit — upsert demand rows

When `POST /api/admin/jobs` or `PUT /api/admin/jobs/:id` resolves `capabilitySlugs` from `extractSkillsFromText`:

1. Fetch `Capability` rows for the resolved slugs (need `id` + `category`)
2. Upsert `JobCapabilityDemand` rows: one per capability, `demandScore` from category heuristic
3. Delete any `JobCapabilityDemand` rows for capabilities no longer in the description

### 2b. New endpoint: `GET /api/admin/jobs/:id/rankings`

Registered in `apps/api/src/routes/admin-jobs.routes.ts`.

**Pipeline:**

#### Phase 1 — Quick pre-rank (all students in college)

```
fetch job + capabilityDemands
fetch all students in college:
  - student.id, student.firstName, student.lastName, student.email
  - student.githubProfile.profileUrl (optional)
  - latest UserCapabilityProfile → ProfileCapability[].capabilitySlug (Set<string>)
  - student without UserCapabilityProfile → { status: "INSUFFICIENT_DATA" }
for each student:
  quickScore = computeQuickMatchScore(jobCapabilitySlugs, studentSlugSet)
sort desc by quickScore
```

#### Phase 2 — Shortlist

```
shortlisted = top 50 by quickScore
remainder = rest
```

Shortlist size configurable via query param `?shortlistSize=50` (default 50, max 100).

#### Phase 3 — Deep analysis (shortlisted only)

For each shortlisted student:

```
jobDemand: JobDemandInput[] = capabilityDemands.map(d => {
  capabilityId: d.capabilityId,
  capabilitySlug: d.capability.slug,
  capabilityName: d.capability.name,
  category: d.capability.category,
  demandScore: d.demandScore,
  recommendation: d.capability.recommendation,
  projectSuggestion: d.capability.projectSuggestion,
})

studentCapabilities: StudentCapabilityInput[] = profile.capabilities.map(c => {
  capabilityId: c.capabilityId,
  capabilitySlug: c.capability.slug,
  score: c.score,
  confidence: c.confidence,
})

report = matchJobToStudent(jobDemand, studentCapabilities)
jriScore = student.jriCalculations[latest].jriScore ?? 0
normalizedEvidenceStrength = avg(matchedCapabilities.confidence) * 100  // 0–100
finalScore = round(0.7 * report.matchScore + 0.2 * jriScore + 0.1 * normalizedEvidenceStrength)
```

#### Phase 4 — Build response

```
shortlisted: sort by finalScore desc, assign rank 1..N
remainder: finalScore = round(quickScore * 0.8), no rank
fetch JobApplication status for each student for this job
```

#### Response shape

```ts
{
  jobId: string;
  jobTitle: string;
  totalStudents: number;
  shortlistedCount: number;
  summary: {
    pctReady: number;          // % with finalScore >= 75
    avgReadiness: number;      // avg finalScore of shortlisted
    topMissingSkill: string;   // most common missing skill across shortlisted
  };
  rankings: RankedStudent[];
}

interface RankedStudent {
  studentId: string;
  name: string;
  profileUrl: string | null;
  rank: number | null;           // null for non-shortlisted
  quickScore: number;
  finalScore: number;
  readinessScore: number | null; // from matchJobToStudent; null if not deep-analyzed
  generalJRI: number;
  matchStatus: "Competitive" | "Ready" | "Not Ready" | "INSUFFICIENT_DATA";
  strengths: { slug: string; name: string; userScore: number; demandScore: number }[];
  partial: { slug: string; name: string; userScore: number; demandScore: number }[];
  missing: { slug: string; name: string; demandScore: number; gapScore: number }[];
  learningPath: LearningPath[];
  applicationStatus: ApplicationStatus | null;
}
```

#### Caching

In-memory `Map<jobId, { data: RankingResponse; expiresAt: number }>` with 5-minute TTL. Cache is module-level in the route handler. Invalidated on job update (same module reference).

### 2c. New endpoint: `PUT /api/admin/jobs/:id/capability-demands`

Allows admin to update individual demand scores after job creation.

```ts
body: { updates: { capabilityId: string; demandScore: number }[] }
```

Upserts only the provided rows. Does not delete others. Returns updated `capabilityDemands[]`.

### 2d. New endpoint: `POST /api/admin/jobs/:id/shortlist`

Bulk-shortlists top N students.

```ts
body: { studentIds: string[] }
// upserts JobApplication rows with status: SHORTLISTED
```

---

## 3. Frontend

### 3a. `apps/frontend/src/components/jobs/JobRankingsDialog.tsx` (new)

Client component. Opens as a Dialog from the job card in `AdminJobsPage`.

**Layout structure:**

```
DialogContent (max-w-4xl, tall)
├── Header: job title, company, "X of Y students ranked"
├── HiringIntelligencePanel
│   ├── % Ready badge
│   ├── Avg Readiness score
│   └── Top Missing Skill badge
├── FilterBar
│   ├── "Strong only" toggle (finalScore ≥ 80)
│   ├── "Critical gap" toggle (has missing skill with demandScore ≥ 0.8)
│   └── "Ready to hire" toggle (verdict = Competitive)
├── "Select Top 20" button → calls POST /shortlist
├── RankingsTable (scrollable)
│   ├── Shortlisted section (ranked, with deep data)
│   └── "No Profile" section (INSUFFICIENT_DATA, at bottom)
└── LoadingState / ErrorState
```

**Table columns:** Rank | Name | Final Score | Readiness | JRI | Verdict | Expand

**Expandable row:** Strengths (green) / Partial (yellow) / Missing (red) skill badges + Learning Path items (skill name, eta weeks, project suggestion).

**Score color coding:** ≥80 green, 50–79 yellow, <50 red — using Tailwind `text-green-500`, `text-yellow-500`, `text-red-500` consistent with existing design system.

### 3b. `apps/frontend/src/lib/api-client.ts` additions

```ts
export function getJobRankings(jobId: string, shortlistSize?: number)
export function updateJobCapabilityDemands(jobId: string, updates: ...)
export function shortlistStudents(jobId: string, studentIds: string[])
```

### 3c. `AdminJobsPage` changes

- Add "Rankings" button to each job card (icon: `Trophy` from lucide-react)
- Add `rankingsJobId: string | null` state
- Render `<JobRankingsDialog jobId={rankingsJobId} open={...} onClose={...} />`

### 3d. Demand weight editing

In the existing `JobFormDialog` edit flow: after skills are shown, add a collapsible "Skill Weights" section. Each row: skill name, category badge, select (Low 0.4 / Medium 0.6 / High 0.8 / Critical 1.0). On save, calls `PUT /api/admin/jobs/:id/capability-demands`. Only shown when `editingJob` is set (not during creation — auto-weights are applied first).

---

## 4. Package: `packages/placement-engine`

### New export: `demandWeights.ts`

```ts
export function getDefaultDemandScore(category: string): number
```

Category → weight lookup. Used by the API when upserting `JobCapabilityDemand` rows. Same vocabulary as `TIMELINE_BY_CATEGORY` in `learningPaths.ts`.

No other changes to the placement-engine package.

---

## 5. What is NOT in scope

- Caching via Redis (in-memory TTL is sufficient for this feature)
- Per-department or per-batch filtering of rankings (can be added later)
- Live weight-adjustment preview (Approach C — deferred)
- Email notifications when shortlisted

---

## 6. File touchlist

| File | Change |
|---|---|
| `packages/database/prisma/schema.prisma` | Add `JobCapabilityDemand` model, add relation to `Job` and `Capability` |
| `packages/database/src/generated/client/*` | Regenerated by `prisma generate` |
| `packages/placement-engine/src/demandWeights.ts` | New — category → demandScore lookup |
| `packages/placement-engine/src/index.ts` | Export `demandWeights` |
| `apps/api/src/routes/admin-jobs.routes.ts` | Upsert demands on job create/edit; add rankings, capability-demands, shortlist endpoints |
| `apps/frontend/src/components/jobs/JobRankingsDialog.tsx` | New dialog component |
| `apps/frontend/src/app/(admin)/admin/jobs/page.tsx` | Add Rankings button + dialog state |
| `apps/frontend/src/lib/api-client.ts` | Add 3 new API functions |
