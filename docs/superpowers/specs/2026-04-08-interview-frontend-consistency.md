# Interview Frontend Consistency — Design Spec

**Date:** 2026-04-08  
**Scope:** All interview route pages and components  
**Goal:** Bring interview UI to the same production standard as `apps/frontend/src/app/(student)/jobs/page.tsx`

---

## Reference Design (established patterns)

From `jobs/page.tsx` and `page-shell.tsx`:

- **Layout**: `PageShell` with `eyebrow`, `title`, `description`, optional `actions` slot
- **Cards**: `bg-card/40 border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300`
- **Stat labels**: `text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60`
- **Section labels**: `text-[11px] font-semibold uppercase tracking-widest text-muted-foreground`
- **Color tokens**: `emerald-*` (success), `amber-*` (warning), `red-*` (danger) — never `green-*` or `yellow-*`
- **Loading**: `Skeleton` components, never text like "Loading..."
- **Empty states**: dashed-border `Card` with icon + heading + sub-text
- **Icons**: Lucide exclusively

---

## Route Pages

### `/interview` — Setup page

**Before**: bare `max-w-xl mx-auto py-8`, no nav  
**After**:
- Wrap in `PageShell eyebrow="AI Interview Simulator" title="Mock Interview" description="Practice DSA problems tailored to your target company and role. Answers are scored by AI and linked to your gap profile."`
- `actions` slot: `<Link href="/interview/sessions">View History</Link>` (ghost button)
- Content: two-column on lg — `GapPreview` left, `SessionSetupForm` right (single column on mobile, stacked)

### `/interview/sessions` — History page

**Before**: bare `max-w-2xl`, no skeleton, plain text empty state, plain link rows  
**After**:
- `PageShell eyebrow="AI Interview Simulator" title="Interview History" description="Review past sessions and track your readiness improvement over time."`
- `actions` slot: `<Link href="/interview">New Session</Link>` (primary button)
- Stats strip (after load): total sessions, completed count, avg score if available
- Loading: 3× `Skeleton` cards
- Empty state: dashed-border `Card`, `History` icon, "No sessions yet" heading
- Session rows → `Card` items with: company+role as title, date+status, score badge (colored by emerald/amber/red), hover → `border-primary/40`
- Status shown as `Badge`: COMPLETED (emerald), IN_PROGRESS (amber), FAILED (red/muted)

### `/interview/sessions/[id]` — Active session

**Decision**: No `PageShell` — focused task UI, full attention needed.  
**Polish only**:
- Question block: `bg-card/40 border-border/40` card styling
- Difficulty badge: matches job card badge pattern (`bg-muted/60 text-[10px] font-bold uppercase tracking-wider`)
- Examples block: `bg-muted/40 border border-border/40 rounded-md`
- Loading state: centered `Skeleton` blocks instead of text
- Submit button: shows `Loader2` spinner icon when `isSubmitting`

### `/interview/sessions/[id]/report` — Report page

**Before**: bare `max-w-3xl`, plain h1, emoji spinner  
**After**:
- `PageShell eyebrow="Session Report" title="{targetCompany} — {targetRole}" description="AI-generated performance analysis from your mock interview session."`
- `actions` slot: Practice Again + View History buttons
- Polling state: proper centered `Card` with `Loader2` spinner (no emoji), progress message

---

## Components

### `SessionSetupForm`

- Wrap form body in `Card / CardContent`
- Labels → `text-[11px] font-semibold uppercase tracking-widest text-muted-foreground`
- Submit button: full-width, shows `Loader2 animate-spin` icon when `isLoading`

### `GapPreview`

- Replace `rounded-md border p-4 bg-muted/20` → `Card` with `bg-card/40 border-border/40`
- DSA readiness stat: use emerald color token, `text-[9px] font-black uppercase` label
- Focus topic chips: `rounded-md bg-muted/40 border border-border/40 px-2 py-0.5 text-[10px] font-bold` (matches skill chips in job cards)
- Section label: established uppercase tracking pattern

### `AIFeedbackPanel`

- Replace bare div → `Card` with `bg-primary/5 border-primary/20`
- Section label: established uppercase tracking pattern
- Streaming cursor `▌` stays as-is

### `SessionReport`

- Hero section: `bg-card/40 border-border/40` card pattern
- Score color: `≥75 → emerald`, `≥50 → amber`, `<50 → red` (fix `green-*`/`yellow-*`)
- Strong areas: `CheckCircle2` Lucide icon (emerald) instead of `✓` string
- Weak areas: `XCircle` Lucide icon (red) instead of `✗` string
- Gaps addressed chips: match skill chip pattern from job cards
- Next steps: numbered with `Badge` showing priority number
- `ReadinessDeltaBadge` (left as-is — already a dedicated component)

---

## Out of Scope

- `VoiceRecorder`, `CodeEditor`, `SessionTimer`, `QuestionProgressBar`, `InlineScores`, `ReadinessDeltaBadge` — logic/functionality unchanged; only affected if they receive styling from parent changes above
- No new features, no API changes, no routing changes
