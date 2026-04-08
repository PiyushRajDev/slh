# Interview Frontend Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all interview route pages and components to the same production design standard as the jobs page.

**Architecture:** Apply `PageShell` to route pages, wrap components in `Card`/`CardContent`, replace all bare color tokens with the established `emerald/amber/red` system, add `Skeleton` loading states, and replace text icons with Lucide icons — no logic changes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, shadcn/ui (Card, Badge, Button, Skeleton, Alert), Lucide React

**Spec:** `docs/superpowers/specs/2026-04-08-interview-frontend-consistency.md`

---

## File Map

| File | Change |
|---|---|
| `apps/frontend/src/components/interview/GapPreview.tsx` | Card wrap, badge tokens, color system |
| `apps/frontend/src/components/interview/SessionSetupForm.tsx` | Card wrap, label styling, spinner on submit |
| `apps/frontend/src/components/interview/AIFeedbackPanel.tsx` | Card wrap, label style |
| `apps/frontend/src/components/interview/SessionReport.tsx` | Color tokens, Lucide icons, badge chips |
| `apps/frontend/src/app/(student)/interview/page.tsx` | PageShell, two-column layout |
| `apps/frontend/src/app/(student)/interview/sessions/page.tsx` | PageShell, Card rows, Skeleton, stats, empty state |
| `apps/frontend/src/app/(student)/interview/sessions/[id]/page.tsx` | Card polish on question block, difficulty badge, loading state |
| `apps/frontend/src/app/(student)/interview/sessions/[id]/report/page.tsx` | PageShell, proper spinner, session title in header |

---

### Task 1: Polish `GapPreview` component

**Files:**
- Modify: `apps/frontend/src/components/interview/GapPreview.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { Card, CardContent } from '@/components/ui/card';

interface GapPreviewProps { dsaReadiness: number | null; company: string; }

const COMPANY_FOCUS: Record<string, string[]> = {
  amazon: ['Arrays', 'Dynamic Programming', 'Graphs'],
  google: ['Graphs', 'DP', 'Trees'],
  microsoft: ['Arrays', 'Trees', 'DP'],
};

export function GapPreview({ dsaReadiness, company }: GapPreviewProps) {
  const topics = COMPANY_FOCUS[company.toLowerCase()] ?? COMPANY_FOCUS.amazon;
  return (
    <Card className="bg-card/40 border-border/40">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          This Session
        </div>

        {dsaReadiness !== null && (
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <div className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
                DSA Readiness
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {dsaReadiness.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground">→ improves with good answers</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
            Focus topics for {company}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <span
                key={t}
                className="rounded-md bg-muted/40 border border-border/40 px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/components/interview/GapPreview.tsx
git commit -m "style: polish GapPreview with Card and established design tokens"
```

---

### Task 2: Polish `SessionSetupForm` component

**Files:**
- Modify: `apps/frontend/src/components/interview/SessionSetupForm.tsx`

- [ ] **Step 1: Replace the file**

```tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SessionSetupFormProps {
  onSubmit: (config: { targetRole: string; targetCompany: string; difficulty: string; questionCount: number }) => void;
  isLoading: boolean;
  onCompanyChange?: (company: string) => void;
}

export function SessionSetupForm({ onSubmit, isLoading, onCompanyChange }: SessionSetupFormProps) {
  const [targetRole, setTargetRole] = useState('SDE-1');
  const [targetCompany, setTargetCompany] = useState('amazon');
  const [difficulty, setDifficulty] = useState('MIXED');
  const [questionCount, setQuestionCount] = useState(5);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ targetRole, targetCompany, difficulty, questionCount });
  }

  return (
    <Card className="bg-card/40 border-border/40">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Target Role
            </label>
            <Input
              id="role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SDE-1, Software Engineer"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="company" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Company
            </label>
            <Select
              value={targetCompany}
              onValueChange={(v) => { if (v) { setTargetCompany(v); onCompanyChange?.(v); } }}
            >
              <SelectTrigger id="company"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="microsoft">Microsoft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="difficulty" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Difficulty
            </label>
            <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
              <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
                <SelectItem value="MIXED">Mixed (recommended)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="count" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Number of Questions
            </label>
            <Select value={String(questionCount)} onValueChange={(v) => v && setQuestionCount(Number(v))}>
              <SelectTrigger id="count"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 questions</SelectItem>
                <SelectItem value="5">5 questions</SelectItem>
                <SelectItem value="7">7 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? 'Starting Session…' : 'Start Interview'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/components/interview/SessionSetupForm.tsx
git commit -m "style: polish SessionSetupForm with Card, label tokens, and loading spinner"
```

---

### Task 3: Polish `AIFeedbackPanel` component

**Files:**
- Modify: `apps/frontend/src/components/interview/AIFeedbackPanel.tsx`

- [ ] **Step 1: Replace the file**

```tsx
'use client';
import { Card, CardContent } from '@/components/ui/card';

interface AIFeedbackPanelProps { feedback: string; isStreaming: boolean; }

export function AIFeedbackPanel({ feedback, isStreaming }: AIFeedbackPanelProps) {
  if (!feedback && !isStreaming) return null;
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          AI Feedback
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {feedback}
          {isStreaming && <span className="animate-pulse">▌</span>}
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/components/interview/AIFeedbackPanel.tsx
git commit -m "style: polish AIFeedbackPanel with Card and label tokens"
```

---

### Task 4: Polish `SessionReport` component

**Files:**
- Modify: `apps/frontend/src/components/interview/SessionReport.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { ReadinessDeltaBadge } from './ReadinessDeltaBadge';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NextStep { priority: number; action: string; topic: string; }
interface SessionReportProps {
  overallScore: number;
  aiSummary: string;
  strongAreas: string[];
  weakAreas: string[];
  gapsAddressed: string[];
  nextSteps: NextStep[];
  dsaReadinessBefore: number | null;
  dsaReadinessAfter: number | null;
  targetRole: string;
  targetCompany: string;
}

function scoreColor(n: number) {
  if (n >= 75) return 'text-emerald-600 dark:text-emerald-400';
  if (n >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function scoreBg(n: number) {
  if (n >= 75) return 'bg-emerald-500/10 border-emerald-500/20';
  if (n >= 50) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

export function SessionReport({
  overallScore, aiSummary, strongAreas, weakAreas, gapsAddressed,
  nextSteps, dsaReadinessBefore, dsaReadinessAfter, targetRole, targetCompany,
}: SessionReportProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <Card className={cn('border', scoreBg(overallScore))}>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="text-center shrink-0">
            <div className={cn('text-5xl font-black', scoreColor(overallScore))}>{overallScore}</div>
            <div className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60 mt-1">
              Overall Score
            </div>
          </div>
          <div className="w-px h-12 bg-border/60 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="font-semibold capitalize text-foreground">
              {targetCompany} — {targetRole}
            </div>
            {dsaReadinessBefore !== null && dsaReadinessAfter !== null && (
              <ReadinessDeltaBadge before={dsaReadinessBefore} after={dsaReadinessAfter} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          AI Summary
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{aiSummary}</p>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card/40 border-border/40">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Strengths
            </div>
            <ul className="flex flex-col gap-1.5">
              {strongAreas.map((s) => (
                <li key={s} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/40">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Needs Work
            </div>
            <ul className="flex flex-col gap-1.5">
              {weakAreas.map((w) => (
                <li key={w} className="text-sm flex items-start gap-2">
                  <XCircle className="size-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Gaps addressed */}
      {gapsAddressed.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Gaps Addressed
          </div>
          <div className="flex flex-wrap gap-2">
            {gapsAddressed.map((g) => (
              <span
                key={g}
                className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Next Steps
        </div>
        <ol className="flex flex-col gap-2">
          {nextSteps.sort((a, b) => a.priority - b.priority).map((step, i) => (
            <li key={i} className="text-sm flex items-start gap-3">
              <Badge
                variant="outline"
                className="shrink-0 size-5 rounded-full p-0 flex items-center justify-center text-[10px] font-black bg-muted/60 border-border/60"
              >
                {i + 1}
              </Badge>
              <span>{step.action}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link href="/interview" className={buttonVariants()}>Practice Again</Link>
        <Link href="/interview/sessions" className={buttonVariants({ variant: 'outline' })}>
          View History
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/components/interview/SessionReport.tsx
git commit -m "style: polish SessionReport with design tokens, Lucide icons, Card layout"
```

---

### Task 5: Upgrade `/interview` setup page

**Files:**
- Modify: `apps/frontend/src/app/(student)/interview/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/app/page-shell';
import { SessionSetupForm } from '@/components/interview/SessionSetupForm';
import { GapPreview } from '@/components/interview/GapPreview';
import { buttonVariants } from '@/components/ui/button';
import { createInterviewSession } from '@/lib/api-client';
import { History } from 'lucide-react';

export default function InterviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('amazon');

  async function handleSubmit(config: { targetRole: string; targetCompany: string; difficulty: string; questionCount: number }) {
    setIsLoading(true);
    try {
      const result = await createInterviewSession({
        targetRole: config.targetRole,
        targetCompany: config.targetCompany,
        difficulty: config.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED',
        questionCount: config.questionCount,
      });
      sessionStorage.setItem(`interview-questions-${result.session.id}`, JSON.stringify(result.questions));
      router.push(`/interview/sessions/${result.session.id}`);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  return (
    <PageShell
      eyebrow="AI Interview Simulator"
      title="Mock Interview"
      description="Practice DSA problems tailored to your target company and role. Answers are scored by AI and linked to your gap profile."
      actions={
        <Link href="/interview/sessions" className={buttonVariants({ variant: 'outline' })}>
          <History className="size-4 mr-2" />
          View History
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <GapPreview dsaReadiness={null} company={selectedCompany} />
        <SessionSetupForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCompanyChange={setSelectedCompany}
        />
      </div>
    </PageShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app/(student)/interview/page.tsx
git commit -m "style: wrap interview setup page in PageShell with two-column layout"
```

---

### Task 6: Upgrade `/interview/sessions` history page

**Files:**
- Modify: `apps/frontend/src/app/(student)/interview/sessions/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/app/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { listInterviewSessions } from '@/lib/api-client';
import { PlusCircle, History, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

function statusBadgeClass(status: string) {
  if (status === 'COMPLETED') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (status === 'IN_PROGRESS') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  return 'bg-muted/60 text-muted-foreground border-border/60';
}

function scoreColor(n: number) {
  if (n >= 75) return 'text-emerald-600 dark:text-emerald-400';
  if (n >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

export default function InterviewSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listInterviewSessions()
      .then((r) => setSessions(r.sessions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = sessions.filter((s) => s.status === 'COMPLETED');
  const avgScore = completed.length > 0 && completed.every((s) => s.report?.overallScore != null)
    ? Math.round(completed.reduce((acc, s) => acc + s.report.overallScore, 0) / completed.length)
    : null;

  return (
    <PageShell
      eyebrow="AI Interview Simulator"
      title="Interview History"
      description="Review past sessions and track your readiness improvement over time."
      actions={
        <Link href="/interview" className={buttonVariants()}>
          <PlusCircle className="size-4 mr-2" />
          New Session
        </Link>
      }
    >
      {/* Stats strip */}
      {!loading && sessions.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-foreground">{sessions.length}</span>
            <span className="text-muted-foreground">sessions</span>
          </div>
          <div className="w-px bg-border/60" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{completed.length}</span>
            <span className="text-muted-foreground">completed</span>
          </div>
          {avgScore !== null && (
            <>
              <div className="w-px bg-border/60" />
              <div className="flex items-center gap-2 text-sm">
                <span className={cn('font-bold', scoreColor(avgScore))}>{avgScore}</span>
                <span className="text-muted-foreground">avg score</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <History className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No sessions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start your first mock interview to begin tracking your progress.
            </p>
            <Link href="/interview" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mt-3')}>
              Start a session
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={s.report ? `/interview/sessions/${s.id}/report` : `/interview/sessions/${s.id}`}
              className="group block"
            >
              <Card className="bg-card/40 border-border/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold capitalize text-foreground truncate">
                      {s.targetCompany} — {s.targetRole}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-auto', statusBadgeClass(s.status))}
                      >
                        {s.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.report?.overallScore != null && (
                      <div className="text-right">
                        <div className={cn('text-2xl font-black', scoreColor(s.report.overallScore))}>
                          {s.report.overallScore}
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
                          Score
                        </div>
                      </div>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app/(student)/interview/sessions/page.tsx
git commit -m "style: upgrade interview history page with PageShell, Cards, Skeleton, stats strip"
```

---

### Task 7: Polish active session page (`/interview/sessions/[id]`)

**Files:**
- Modify: `apps/frontend/src/app/(student)/interview/sessions/[id]/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CodeEditor } from '@/components/interview/CodeEditor';
import { VoiceRecorder } from '@/components/interview/VoiceRecorder';
import { AIFeedbackPanel } from '@/components/interview/AIFeedbackPanel';
import { SessionTimer } from '@/components/interview/SessionTimer';
import { QuestionProgressBar } from '@/components/interview/QuestionProgressBar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { submitAnswerStream, completeInterviewSession } from '@/lib/api-client';
import type { InterviewQuestion } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Props { params: Promise<{ id: string }>; }

function difficultyClass(d: string) {
  const u = d.toUpperCase();
  if (u === 'EASY') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (u === 'HARD') return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
}

export default function ActiveSessionPage({ params }: Props) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [code, setCode] = useState('');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [startedAt] = useState(new Date());
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`interview-questions-${sessionId}`);
    if (stored) setQuestions(JSON.parse(stored));
  }, [sessionId]);

  const currentQuestion = questions[currentIdx];

  async function handleSubmit() {
    if (!currentQuestion || isSubmitting) return;
    setIsSubmitting(true);
    setFeedback('');
    setIsStreaming(true);
    try {
      await submitAnswerStream(
        sessionId,
        { questionId: currentQuestion.id, code, transcript },
        (chunk) => setFeedback((prev) => prev + chunk),
      );
      setAnsweredCount((n) => n + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setIsSubmitting(false);
    }
  }

  async function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setCode('');
      setTranscript('');
      setFeedback('');
      setShowHints(false);
    } else {
      await completeInterviewSession(sessionId);
      router.push(`/interview/sessions/${sessionId}/report`);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-6 flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }
  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <QuestionProgressBar current={answeredCount} total={questions.length} />
        <SessionTimer startedAt={startedAt} />
      </div>

      {/* Question card */}
      <Card className="bg-card/40 border-border/40">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold leading-tight">{currentQuestion.title}</h2>
            <Badge
              variant="outline"
              className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-auto shrink-0', difficultyClass(currentQuestion.difficulty))}
            >
              {currentQuestion.difficulty}
            </Badge>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">{currentQuestion.description}</p>

          {currentQuestion.examples.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Examples</span>
              <div className="flex flex-col gap-2">
                {currentQuestion.examples.map((ex, i) => (
                  <div key={i} className="text-xs font-mono bg-muted/40 border border-border/40 rounded-md p-3">
                    <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
                    <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
                    {ex.explanation && <div className="text-muted-foreground mt-1">{ex.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Constraints</span>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
              {currentQuestion.constraints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <Button variant="ghost" size="sm" className="self-start -ml-2" onClick={() => setShowHints((v) => !v)}>
            {showHints ? 'Hide hints' : 'Show hints'}
          </Button>
          {showHints && (
            <ol className="text-xs text-muted-foreground list-decimal list-inside flex flex-col gap-1.5">
              {currentQuestion.hints.map((h, i) => <li key={i}>{h}</li>)}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Code editor */}
      <CodeEditor value={code} onChange={setCode} language="python" />

      {/* Voice recorder */}
      <VoiceRecorder onTranscriptChange={setTranscript} />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={isSubmitting || !code.trim()} className="gap-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? 'Getting feedback…' : 'Submit Answer'}
        </Button>
        {feedback && !isStreaming && (
          <Button variant="outline" onClick={handleNext}>
            {currentIdx < questions.length - 1 ? 'Next Question →' : 'Finish Session'}
          </Button>
        )}
      </div>

      {/* AI Feedback */}
      <AIFeedbackPanel feedback={feedback} isStreaming={isStreaming} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app/(student)/interview/sessions/[id]/page.tsx
git commit -m "style: polish active session page with Card, difficulty badge, Skeleton loading, spinner"
```

---

### Task 8: Upgrade report page

**Files:**
- Modify: `apps/frontend/src/app/(student)/interview/sessions/[id]/report/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
'use client';
import { use, useEffect, useState } from 'react';
import { PageShell } from '@/components/app/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { SessionReport } from '@/components/interview/SessionReport';
import { getInterviewReport, getInterviewSession } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Props { params: Promise<{ id: string }>; }

export default function SessionReportPage({ params }: Props) {
  const { id: sessionId } = use(params);
  const [report, setReport] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sessionResult = await getInterviewSession(sessionId);
        if (!cancelled) setSession(sessionResult.session);
      } catch {}

      const poll = async () => {
        if (cancelled) return;
        try {
          const result = await getInterviewReport(sessionId);
          if ('report' in result) {
            if (!cancelled) { setReport(result.report); setPolling(false); }
          } else {
            setTimeout(poll, 3000);
          }
        } catch {
          setTimeout(poll, 5000);
        }
      };
      poll();
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId]);

  const title = session
    ? `${session.targetCompany} — ${session.targetRole}`
    : 'Session Report';

  if (polling && !report) {
    return (
      <PageShell
        eyebrow="Session Report"
        title={title}
        description="AI-generated performance analysis from your mock interview session."
      >
        <Card className="bg-card/40 border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div className="text-center">
              <div className="font-semibold text-foreground">Generating your report…</div>
              <div className="text-sm text-muted-foreground mt-1">This usually takes 10–20 seconds</div>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!report) return null;

  return (
    <PageShell
      eyebrow="Session Report"
      title={title}
      description="AI-generated performance analysis from your mock interview session."
      actions={
        <>
          <Link href="/interview" className={buttonVariants()}>Practice Again</Link>
          <Link href="/interview/sessions" className={buttonVariants({ variant: 'outline' })}>View History</Link>
        </>
      }
    >
      <SessionReport
        overallScore={report.overallScore}
        aiSummary={report.aiSummary}
        strongAreas={report.strongAreas}
        weakAreas={report.weakAreas}
        gapsAddressed={report.gapsAddressed}
        nextSteps={report.nextSteps}
        dsaReadinessBefore={report.dsaReadinessBefore}
        dsaReadinessAfter={report.dsaReadinessAfter}
        targetRole={session?.targetRole ?? ''}
        targetCompany={session?.targetCompany ?? ''}
      />
    </PageShell>
  );
}
```

Note: The `SessionReport` actions (Practice Again / View History) are now rendered in the `PageShell` actions slot. Remove the duplicate buttons from the bottom of `SessionReport` component — the ones in the `{/* Actions */}` section at the end of `SessionReport.tsx`. Update that section to render nothing (remove the `<div className="flex gap-3 pt-2">` block from `SessionReport.tsx`).

- [ ] **Step 2: Remove the Actions block from `SessionReport.tsx`**

In `apps/frontend/src/components/interview/SessionReport.tsx`, delete the final `{/* Actions */}` block:

```tsx
// DELETE this entire block from SessionReport.tsx:
      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link href="/interview" className={buttonVariants()}>Practice Again</Link>
        <Link href="/interview/sessions" className={buttonVariants({ variant: 'outline' })}>
          View History
        </Link>
      </div>
```

Also remove the now-unused `buttonVariants` and `Link` imports from `SessionReport.tsx`:

```tsx
// Remove from imports in SessionReport.tsx:
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
```

Final imports for `SessionReport.tsx` should be:
```tsx
import { ReadinessDeltaBadge } from './ReadinessDeltaBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/(student)/interview/sessions/[id]/report/page.tsx
git add apps/frontend/src/components/interview/SessionReport.tsx
git commit -m "style: wrap report page in PageShell, move actions to header, polish loading state"
```
