# AI Interview Simulator — Design Spec

**Date:** 2026-04-08
**Status:** Approved
**Author:** Claude + Piyush

---

## 1. Overview

An AI-powered mock interview experience for SLH students. Students configure a timed DSA session, answer questions in a code editor while narrating via voice, and receive streaming AI feedback after each answer. When the session ends, a BullMQ worker generates a JRI-linked report — showing overall score, per-question breakdown, and how the session shifted their DSA readiness score.

**V1 scope:** DSA/coding interviews only. System design, behavioral, and HR rounds are out of scope.

---

## 2. Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Interview type | DSA/Coding only | Directly maps to existing `DSAProfile` data; highest student anxiety |
| Answer mode | Code editor + voice (Web Speech API) | Mirrors real interviews; Web Speech API avoids third-party STT cost |
| Question source | Curated DB bank + AI generation fallback + company tags | Infinite variety without cold-start; company-specific patterns add B2B value |
| Session model | Configurable timed mock (student picks # questions + time limit) | Flexible, not prescriptive; students practice at their own pace |
| Per-question feedback | `streamText` (Vercel AI SDK) inline API route | Real-time, conversational — feels like an actual interviewer |
| Final report | BullMQ worker — generates JRI-linked report async | Heavy computation; consistent with existing SLH async patterns |
| Architecture approach | Hybrid (streaming for questions, worker for report) | Fast per-question UX + reliable JRI integration |
| Package structure | New `packages/interview-simulator` | Follows monorepo convention |

---

## 3. Architecture

```
Frontend (Next.js)
  ├── Session setup page (/interview/new)
  ├── Active session page (/interview/sessions/:id)
  │   ├── Monaco code editor
  │   ├── Web Speech API (voice transcription, client-side)
  │   ├── Streaming AI feedback panel (streamText)
  │   └── Timer + progress bar
  └── Report page (/interview/sessions/:id/report)

API (Express)
  ├── POST /api/interview/sessions            → create session, select questions
  ├── POST /api/interview/sessions/:id/answer → streamText per-question feedback
  ├── POST /api/interview/sessions/:id/end    → enqueue report BullMQ job
  ├── GET  /api/interview/sessions/:id        → session state (resume support)
  ├── GET  /api/interview/sessions/:id/report → final report (polls until ready)
  ├── GET  /api/interview/sessions            → session history (paginated)
  └── GET  /api/interview/questions           → admin: manage question bank

Worker (BullMQ — queue: "interview-report")
  └── generateInterviewReport job
      ├── Pull all InterviewAnswers for session
      ├── Pull student's latest GapReport (dsaReadinessBefore)
      ├── generateText + Output.object → scored report JSON
      ├── Compute dsaReadinessAfter, gapsAddressed, weakAreas
      └── Write InterviewReport to DB

packages/interview-simulator
  ├── src/questions/selector.ts     — pick questions from bank (+ AI fallback)
  ├── src/ai/feedback.ts            — streamText prompt + system message
  ├── src/ai/report.ts              — generateText report scoring
  ├── src/ai/generateQuestion.ts    — AI question generation fallback
  └── src/scoring/readinessDelta.ts — compute JRI readiness delta
```

### Per-question critical path

```
Student writes code + speaks
  → Web Speech API transcribes in browser
  → POST /answer { code, voiceTranscript, questionId, timeTakenSec }
  → streamText (AI evaluates as interviewer)
  → Tokens stream to UI via HTTP streaming
  → On stream complete: inline scores extracted, InterviewAnswer saved to DB
  → Student moves to next question
```

---

## 4. Database Schema

### 4.1 InterviewQuestion

```prisma
model InterviewQuestion {
  id            String   @id @default(cuid())
  title         String
  body          String   @db.Text
  difficulty    QuestionDifficulty   // EASY | MEDIUM | HARD
  topic         String               // "arrays" | "dp" | "graphs" | "trees" | "strings" | "backtracking"
  companies     String[]             // ["amazon", "google", "microsoft"]
  hints         String[]             // unlock-able hints, ordered
  modelAnswer   String?  @db.Text
  isAiGenerated Boolean  @default(false)
  timesUsed     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  answers       InterviewAnswer[]

  @@index([topic, difficulty])
  @@index([companies])
}

enum QuestionDifficulty {
  EASY
  MEDIUM
  HARD
}
```

### 4.2 InterviewSession

```prisma
model InterviewSession {
  id             String          @id @default(cuid())
  studentId      String
  student        Student         @relation(fields: [studentId], references: [id])

  status         InterviewStatus @default(PENDING)

  // Configuration (set at creation, immutable after start)
  targetRole     String                    // "Backend Developer"
  targetCompany  String?                   // "amazon" | null for generic
  difficulty     SessionDifficulty         // EASY | MEDIUM | HARD | MIXED
  questionIds    String[]                  // ordered sequence selected at creation
  timeLimitMin   Int                       // e.g. 30 | 45 | 60

  // Runtime state
  currentQuestionIndex Int  @default(0)
  startedAt      DateTime?
  completedAt    DateTime?

  answers        InterviewAnswer[]
  report         InterviewReport?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([studentId, createdAt])
}

enum InterviewStatus {
  PENDING     // created, not started
  ACTIVE      // in progress
  COMPLETED   // all questions answered or time expired
  ABANDONED   // student left without finishing
}

enum SessionDifficulty {
  EASY
  MEDIUM
  HARD
  MIXED
}
```

### 4.3 InterviewAnswer

```prisma
model InterviewAnswer {
  id               String   @id @default(cuid())
  sessionId        String
  session          InterviewSession @relation(fields: [sessionId], references: [id])
  questionId       String
  question         InterviewQuestion @relation(fields: [questionId], references: [id])

  // Student's answer
  code             String?  @db.Text
  voiceTranscript  String?  @db.Text
  hintsUsed        Int      @default(0)
  timeTakenSec     Int

  // AI feedback (stored after stream completes)
  aiFeedback       String   @db.Text

  // Per-dimension scores (0–100, extracted from AI response)
  scoreCorrectness Int
  scoreComplexity  Int
  scoreEdgeCases   Int
  scoreComm        Int      // voice communication clarity

  submittedAt      DateTime @default(now())

  @@unique([sessionId, questionId])
  @@index([sessionId])
}
```

### 4.4 InterviewReport

```prisma
model InterviewReport {
  id                 String          @id @default(cuid())
  sessionId          String          @unique
  session            InterviewSession @relation(fields: [sessionId], references: [id])

  // Aggregate scores
  overallScore       Int             // weighted avg 0–100

  // JRI linkage
  dsaReadinessBefore Int             // snapshot of GapReport.readinessScore at session start
  dsaReadinessAfter  Int             // updated estimate based on session performance
  gapsAddressed      String[]        // skill names that improved (e.g. ["Linked Lists", "Hash Maps"])
  weakAreas          String[]        // topics still needing work
  strongAreas        String[]        // topics performed well

  // Narrative
  aiSummary          String  @db.Text
  nextSteps          Json            // Array<{ priority: number, action: string, topic: string }>

  createdAt          DateTime @default(now())
}
```

---

## 5. Package Structure

```
packages/interview-simulator/
  package.json
  tsconfig.json
  src/
    index.ts                        ← public API exports
    types.ts                        ← shared interfaces

    questions/
      selector.ts                   ← pick questions from DB bank; AI fallback if <N available
      companyProfiles.ts            ← company → topic weights (Amazon: arrays+dp+graphs heavy)

    ai/
      feedback.ts                   ← streamText system prompt + user message builder
      report.ts                     ← generateText + Output.object for final report
      generateQuestion.ts           ← AI question generation (fallback when bank is sparse)
      schemas.ts                    ← Zod schemas for report output

    scoring/
      readinessDelta.ts             ← compute dsaReadinessBefore/After from session scores
      dimensions.ts                 ← extract 4 scores from AI feedback text
```

---

## 6. Question Selection

### 6.1 Selector logic (`questions/selector.ts`)

```typescript
async function selectQuestions(
  config: { targetRole, targetCompany, difficulty, count },
  studentId: string
): Promise<InterviewQuestion[]>
```

1. Build topic weight map from `companyProfiles.ts` (or default uniform weights)
2. Query bank: `difficulty` filter + `topic` weighted sampling + exclude questions answered in last 7 days by this student
3. If bank returns `< count` questions: call `generateQuestion()` to fill remaining slots, save generated questions to DB (`isAiGenerated: true`)
4. Shuffle final list, return ordered sequence

### 6.2 Company profiles (`companyProfiles.ts`)

```typescript
const COMPANY_PROFILES: Record<string, TopicWeights> = {
  amazon:    { arrays: 0.25, dp: 0.25, graphs: 0.20, trees: 0.15, strings: 0.10, backtracking: 0.05 },
  google:    { arrays: 0.20, dp: 0.20, graphs: 0.25, trees: 0.20, strings: 0.10, backtracking: 0.05 },
  microsoft: { arrays: 0.25, trees: 0.25, dp: 0.20, graphs: 0.15, strings: 0.10, backtracking: 0.05 },
  // default: uniform weights
};
```

---

## 7. AI Integration

### 7.1 Per-question streaming feedback (`ai/feedback.ts`)

Uses `streamText` from Vercel AI SDK. System prompt establishes the AI as an interviewer.

**System message:**
```
You are an experienced software engineering interviewer at {company}.
You are conducting a timed DSA coding interview.
The student has just answered a question. Evaluate their solution as a real interviewer would:
- Acknowledge what they did well, specifically
- Identify the most important issue (correctness, time complexity, edge cases, or communication)
- Ask ONE follow-up question or probe to test their understanding
- Be concise — 3–5 sentences max. You are not giving a lecture.

After your response, output a JSON block (do not explain it):
<<<SCORES>>>
{"correctness": 0-100, "complexity": 0-100, "edgeCases": 0-100, "communication": 0-100}
<<<END>>>
```

**User message** includes: the question body, the student's code, their voice transcript, hints used count, and time taken.

Score extraction: after stream completes, parse the `<<<SCORES>>>` block from the full response. Store full `aiFeedback` (without scores block) and extracted scores separately in `InterviewAnswer`.

Model: `claude-3-5-haiku-20241022` (speed — this is the critical latency path).

### 7.2 Final report generation (`ai/report.ts`)

Uses `generateText + Output.object` (structured output via Zod).

```typescript
const ReportSchema = z.object({
  overallScore:    z.number().int().min(0).max(100),
  aiSummary:       z.string(),         // 3–5 sentence narrative
  strongAreas:     z.array(z.string()),
  weakAreas:       z.array(z.string()),
  gapsAddressed:   z.array(z.string()),
  nextSteps:       z.array(z.object({
    priority: z.number().int().min(1).max(3),
    action:   z.string(),
    topic:    z.string(),
  })),
});
```

Input includes: all `InterviewAnswer` records (code, transcript, scores, feedback), student's `GapReport`, and session config.

Model: `claude-3-5-sonnet` (quality — this runs async in worker, latency not critical).

### 7.3 AI question generation (`ai/generateQuestion.ts`)

Triggered only when the bank has fewer questions than requested. Generates a question matching the specified topic and difficulty. Output validated against a Zod schema matching `InterviewQuestion` fields. Saved to DB with `isAiGenerated: true` for future reuse.

---

## 8. Readiness Delta (`scoring/readinessDelta.ts`)

```typescript
function computeReadinessDelta(
  answers: InterviewAnswer[],
  gapReport: GapReport,
  beforeScore: number
): { afterScore: number; gapsAddressed: string[] }
```

Logic:
- Map each question's `topic` to skills in the student's `GapReport.missing` / `GapReport.partial`
- For each topic where average `scoreCorrectness >= 75`: mark as addressed, contribute `+weight` to delta
- `afterScore = clamp(beforeScore + Σ(delta * demandWeight), 0, 100)`
- `demandWeight` pulled from existing `DEMAND_WEIGHT` map in `@slh/job-intelligence`

This is fully deterministic — same input always produces the same delta.

---

## 9. API Routes

All routes under `/api/interview/`. Auth: `authenticate` middleware on all routes.

### POST `/sessions`

Creates a session and selects questions.

- Body: `{ targetRole, targetCompany?, difficulty, questionCount: 3|5|7, timeLimitMin: 30|45|60 }`
- Calls `selectQuestions()` from the package
- Creates `InterviewSession` with `status: PENDING`, `questionIds[]`
- Returns: `{ sessionId, questions: [{ id, title, body, difficulty, topic, hints }] }`

### POST `/sessions/:id/answer`

Evaluates one answer via streaming.

- Body: `{ questionId, code?, voiceTranscript?, timeTakenSec, hintsUsed }`
- Validates session is ACTIVE, question belongs to session, answer not already submitted
- Sets session `status: ACTIVE` on first answer
- Calls `streamText` → pipes HTTP response
- After stream ends (via `onFinish` callback in `streamText` options): extracts scores from `<<<SCORES>>>` block in full text, saves `InterviewAnswer` to DB
- Returns: streaming text response (scores block stripped before sending to client)

### POST `/sessions/:id/end`

Ends the session and enqueues report generation.

- Marks session `status: COMPLETED`, sets `completedAt`
- Enqueues BullMQ job `{ name: 'generate-report', data: { sessionId } }` on `interview-report` queue
- Returns: `{ sessionId, status: 'COMPLETED', reportPending: true }`

### GET `/sessions/:id`

Returns current session state.

- Includes: config, status, `currentQuestionIndex`, answers submitted so far (scores only, not full feedback — full feedback fetched per-answer)
- Auth: verify `session.studentId === req.user.studentId`

### GET `/sessions/:id/report`

Returns the generated report, or `{ status: 'pending' }` if worker hasn't finished.

- Frontend polls this every 3s after `POST /end` until report is ready

### GET `/sessions`

Paginated history: `?page=1&limit=10`

Returns lightweight list: `{ id, targetRole, targetCompany, difficulty, overallScore, status, createdAt }`

---

## 10. Worker Integration

Queue name: `interview-report`

```typescript
// apps/worker/src/jobs/interviewReport.ts
export async function handleInterviewReport(job: Job) {
  const { sessionId } = job.data;
  // 1. Load session + all answers from DB
  // 2. Load student's latest GapReport
  // 3. Snapshot dsaReadinessBefore
  // 4. Call generateInterviewReport() from @slh/interview-simulator
  // 5. Compute readiness delta
  // 6. Write InterviewReport to DB
}
```

Worker config:
```typescript
{ attempts: 2, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true }
```

---

## 11. Frontend

### 11.1 Pages

```
apps/frontend/src/app/(student)/interview/
  page.tsx                    ← session history + "Start New" CTA
  new/page.tsx                ← session setup form
  sessions/[id]/page.tsx      ← active session (code editor + voice + streaming AI)
  sessions/[id]/report/page.tsx ← final report (polls until ready)
```

### 11.2 Components

```
apps/frontend/src/components/interview/
  SessionSetupForm.tsx         ← config form (company, difficulty, questions, time)
  GapPreview.tsx               ← shows weak areas from gap analysis on setup screen
  CodeEditor.tsx               ← Monaco editor wrapper (language selector: Python/JS/Java/C++)
  VoiceRecorder.tsx            ← Web Speech API hook + recording indicator
  AIFeedbackPanel.tsx          ← streams AI response token by token
  InlineScores.tsx             ← 4-bar score display shown after stream completes
  SessionTimer.tsx             ← countdown timer with warning at <5 min
  QuestionProgressBar.tsx      ← Q1 ✅ Q2 🔄 Q3 ⬜ ... across top
  SessionReport.tsx            ← full report layout (summary, per-Q, JRI delta)
  ReadinessDeltaBadge.tsx      ← "42 → 58 (+16)" hero callout
```

### 11.3 Voice Recording (`VoiceRecorder.tsx`)

Uses browser's `SpeechRecognition` API (no third-party dependency):

```typescript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;
```

- Shows "Recording..." indicator while active
- Interim results shown live as italic text below code editor
- Final transcript accumulated and sent with `POST /answer`
- Graceful fallback: if `SpeechRecognition` not available (Firefox), show a text area for manual transcript

### 11.4 Streaming Answer Submission

```typescript
const res = await fetch(`/api/interview/sessions/${id}/answer`, {
  method: 'POST',
  body: JSON.stringify({ questionId, code, voiceTranscript, timeTakenSec, hintsUsed }),
});
const reader = res.body!.getReader();
// Read chunks, decode, append to AIFeedbackPanel state
```

### 11.5 Page States

| State | Behavior |
|---|---|
| Setup | Form with gap analysis preview |
| Session active | Code editor + timer + voice + streaming panel |
| Session complete (report pending) | "Generating your report..." spinner, polling GET /report every 3s |
| Report ready | Full report rendered |
| Session history | Past sessions list with scores + "Practice Again" |
| Time expired | Auto-call POST /end, redirect to report |

---

## 12. Error Handling

| Scenario | Handling |
|---|---|
| Stream interrupted mid-response | Client shows partial feedback + "Connection lost — answer saved, refresh to continue" |
| `SpeechRecognition` not supported | Fallback to manual transcript text area |
| Question bank empty for filters | AI generates all questions (no user-visible difference) |
| Worker fails to generate report | Retry once (BullMQ config); show "Report generation failed — try refreshing" after 2 failures |
| Session abandoned (tab closed) | Status stays ACTIVE; on next visit, offer "Resume session" or "End and get partial report" |
| Answer submitted twice | `@@unique([sessionId, questionId])` rejects duplicate; API returns 409 |
| Time limit expires | Frontend calls POST /end automatically; session marked COMPLETED |

---

## 13. Security

- All endpoints require JWT authentication
- Session ownership verified on every route: `session.studentId === req.user.studentId`
- Code and voice transcripts stored in DB (not exposed to other users)
- AI model API key in `apps/api/.env`, never sent to client
- No code execution — code is evaluated by AI for logic only, never run on the server

---

## 14. New Environment Variables

```
# Already exists from job-intelligence
ANTHROPIC_API_KEY=

# No new env vars required
```

---

## 15. Package Dependencies

```
packages/interview-simulator:
  dependencies:
    - ai                  (Vercel AI SDK v5)
    - @ai-sdk/anthropic
    - zod
    - @slh/database

apps/frontend:
  dependencies:
    - @monaco-editor/react  (code editor)
    # Web Speech API — browser native, no package needed
```

---

## 16. Seed Data

A seed script (`packages/database/prisma/seed-interview-questions.ts`) will populate the bank with ~50 curated questions across topics:

| Topic | Easy | Medium | Hard |
|---|---|---|---|
| Arrays | 5 | 5 | 2 |
| Linked Lists | 3 | 3 | 1 |
| Trees | 3 | 4 | 2 |
| Graphs | 2 | 4 | 2 |
| Dynamic Programming | 2 | 4 | 3 |
| Strings | 3 | 3 | 1 |
| Backtracking | 1 | 2 | 2 |

Each question seeded with: title, body, difficulty, topic, companies[], hints[], modelAnswer.

---

## 17. Out of Scope (V1)

- System design interviews
- Behavioral / HR rounds
- Code execution / test case running
- Real-time collaboration or pair interviews
- Leaderboard / peer comparison
- Third-party STT (Deepgram, AssemblyAI) — Web Speech API only
- Admin UI for question bank management (questions managed via seed script + direct DB)
