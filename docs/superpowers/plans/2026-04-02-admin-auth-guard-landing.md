# Admin Auth Guard & Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect frontend routes with server-verified auth guards and build an admin Command Center landing page.

**Architecture:** An `AuthContext` fetches `/auth/me` on mount to get the server-verified user (including role). An `AuthGuard` component reads from this context and redirects unauthorized users. Layout files in `admin/`, `dashboard/`, and `onboard/` directories provide automatic protection for all child pages. Three straggler pages at unique paths get per-page guards. The existing `/auth/me` endpoint (already implemented) is the single source of truth for auth state — no client-side JWT parsing for role checks.

**Tech Stack:** Next.js 16, React 19, shadcn/ui, Lucide React, existing `getMe()` API function, existing admin API functions.

**Important:** This project uses Next.js 16 with breaking changes. Before writing any code, read relevant docs in `apps/frontend/node_modules/next/dist/docs/`.

**Follow-up (not in scope):** Migrate token storage from localStorage to httpOnly cookies. This requires backend changes to token issuance, the OAuth callback, and the refresh flow — a separate project.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `apps/frontend/src/components/app/auth-context.tsx` | React context that fetches `/auth/me`, provides `{ user, loading }` to tree |
| Create | `apps/frontend/src/components/app/auth-guard.tsx` | Reads from AuthContext, redirects if unauthorized, shows skeleton while loading |
| Create | `apps/frontend/src/app/admin/layout.tsx` | Layout guard: `<AuthGuard requiredRole="ADMIN">` for all `/admin/*` pages |
| Create | `apps/frontend/src/app/dashboard/layout.tsx` | Layout guard: `<AuthGuard>` for all `/dashboard/*` pages |
| Create | `apps/frontend/src/app/onboard/layout.tsx` | Layout guard: `<AuthGuard requiredRole="SUPER_ADMIN">` for all `/onboard/*` pages |
| Create | `apps/frontend/src/app/admin/page.tsx` | Admin Command Center Hub — summary stats + module cards |
| Modify | `apps/frontend/src/app/layout.tsx` | Wrap children in `<AuthProvider>` |
| Modify | `apps/frontend/src/components/app/page-shell.tsx` | Use `useAuth()` for role-aware nav, remove separate Admin link |
| Modify | `apps/frontend/src/app/analyze/page.tsx` | Wrap in `<AuthGuard>` (straggler — no shared layout) |
| Modify | `apps/frontend/src/app/analysis/[id]/page.tsx` | Wrap in `<AuthGuard>` (straggler) |
| Modify | `apps/frontend/src/app/leaderboard/[collegeShortName]/page.tsx` | Wrap in `<AuthGuard>` (straggler) |

---

### Task 1: Create AuthContext

**Files:**
- Create: `apps/frontend/src/components/app/auth-context.tsx`

This context fetches `/auth/me` once on mount and provides the server-verified user object (including role) to the entire component tree. All auth decisions read from this context — no direct JWT parsing.

- [ ] **Step 1: Create `auth-context.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getMe } from "@/lib/api";
import type { AuthMeResponse } from "@/lib/analysis";
import { hasSessionToken } from "@/lib/auth";

type AuthUser = AuthMeResponse["data"]["user"];

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!hasSessionToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Key decisions:
- `hasSessionToken()` is a cheap localStorage check to skip the network call entirely for unauthenticated users (public pages load fast).
- `getMe()` calls `GET /auth/me` which runs through the backend `authenticate` middleware — this is the server verification. If the token is invalid/expired, it returns 401, `getMe()` throws, and `user` stays null.
- The `refresh` callback lets components re-fetch after login/logout.

- [ ] **Step 2: Verify it compiles**

```bash
cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/app/auth-context.tsx
git commit -m "feat: add AuthContext backed by server-verified /auth/me"
```

---

### Task 2: Create AuthGuard Component

**Files:**
- Create: `apps/frontend/src/components/app/auth-guard.tsx`

Reads from `AuthContext` (not localStorage). While context is loading, shows skeleton. Once loaded, checks user presence and role, redirects if unauthorized.

- [ ] **Step 1: Create `auth-guard.tsx`**

```tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/app/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: "ADMIN" | "SUPER_ADMIN";
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole) {
      const authorized =
        requiredRole === "ADMIN"
          ? user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          : user.role === "SUPER_ADMIN";

      if (!authorized) {
        router.replace("/dashboard?denied=1");
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (requiredRole) {
    const authorized =
      requiredRole === "ADMIN"
        ? user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        : user.role === "SUPER_ADMIN";
    if (!authorized) return null;
  }

  return <>{children}</>;
}
```

The role check runs twice — once in the effect (to trigger redirect) and once in the render (to prevent flash). This is intentional: the effect is async (redirect takes a frame), so the render guard prevents showing protected content during that frame.

- [ ] **Step 2: Verify it compiles**

```bash
cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/app/auth-guard.tsx
git commit -m "feat: add AuthGuard component using server-verified AuthContext"
```

---

### Task 3: Wire AuthProvider into Root Layout

**Files:**
- Modify: `apps/frontend/src/app/layout.tsx`

The root layout is a server component. `AuthProvider` is a client component. We need to wrap the children in `AuthProvider` inside the existing `TooltipProvider`.

- [ ] **Step 1: Add AuthProvider to root layout**

Add import at the top of `apps/frontend/src/app/layout.tsx`:
```tsx
import { AuthProvider } from "@/components/app/auth-context";
```

In the body, wrap the existing content inside `<TooltipProvider>` with `<AuthProvider>`. Current code (lines 40-43):
```tsx
<TooltipProvider>
  {children}
  <CommandMenu />
</TooltipProvider>
```

Change to:
```tsx
<TooltipProvider>
  <AuthProvider>
    {children}
    <CommandMenu />
  </AuthProvider>
</TooltipProvider>
```

- [ ] **Step 2: Verify it compiles**

```bash
cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/layout.tsx
git commit -m "feat: wire AuthProvider into root layout for app-wide auth state"
```

---

### Task 4: Create Layout Guards for admin/, dashboard/, onboard/

**Files:**
- Create: `apps/frontend/src/app/admin/layout.tsx`
- Create: `apps/frontend/src/app/dashboard/layout.tsx`
- Create: `apps/frontend/src/app/onboard/layout.tsx`

These layout files automatically protect every page under their directory. No per-page wrapping needed.

- [ ] **Step 1: Create `apps/frontend/src/app/admin/layout.tsx`**

```tsx
import { AuthGuard } from "@/components/app/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="ADMIN">{children}</AuthGuard>;
}
```

- [ ] **Step 2: Create `apps/frontend/src/app/dashboard/layout.tsx`**

```tsx
import { AuthGuard } from "@/components/app/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
```

- [ ] **Step 3: Create `apps/frontend/src/app/onboard/layout.tsx`**

```tsx
import { AuthGuard } from "@/components/app/auth-guard";

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="SUPER_ADMIN">{children}</AuthGuard>;
}
```

- [ ] **Step 4: Verify all compile**

```bash
cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/admin/layout.tsx \
       apps/frontend/src/app/dashboard/layout.tsx \
       apps/frontend/src/app/onboard/layout.tsx
git commit -m "feat: add layout-level auth guards for admin, dashboard, onboard routes"
```

---

### Task 5: Guard Straggler Pages (analyze, analysis, leaderboard)

**Files:**
- Modify: `apps/frontend/src/app/analyze/page.tsx`
- Modify: `apps/frontend/src/app/analysis/[id]/page.tsx`
- Modify: `apps/frontend/src/app/leaderboard/[collegeShortName]/page.tsx`

These three pages sit at unique paths with no shared parent directory (other than root), so they need per-page guards.

- [ ] **Step 1: Wrap `analyze/page.tsx`**

Add import at the top:
```tsx
import { AuthGuard } from "@/components/app/auth-guard";
```

Wrap the outermost return JSX. The current return starts with `<PageShell ...>`. Change to:
```tsx
return (
  <AuthGuard>
    <PageShell ...>
      {/* existing content unchanged */}
    </PageShell>
  </AuthGuard>
);
```

- [ ] **Step 2: Wrap `analysis/[id]/page.tsx`**

Same pattern — add `AuthGuard` import, wrap outermost return JSX with `<AuthGuard>`.

- [ ] **Step 3: Wrap `leaderboard/[collegeShortName]/page.tsx`**

Same pattern — add `AuthGuard` import, wrap outermost return JSX with `<AuthGuard>`.

- [ ] **Step 4: Verify all compile**

```bash
cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/analyze/page.tsx \
       apps/frontend/src/app/analysis/\[id\]/page.tsx \
       apps/frontend/src/app/leaderboard/\[collegeShortName\]/page.tsx
git commit -m "feat: add auth guard to analyze, analysis, and leaderboard pages"
```

---

### Task 6: Add Denied-Access Banner to Dashboard

**Files:**
- Modify: `apps/frontend/src/app/dashboard/page.tsx`

The dashboard reads `?denied=1` from the URL on mount and shows a dismissible banner. Clears the param via `replaceState`.

- [ ] **Step 1: Add denied banner logic**

The page already imports `useEffect` and `useState`. Add this import at the top (with the existing imports):
```tsx
import { useSearchParams } from "next/navigation";
```

Inside the default export function, add after the existing state declarations:
```tsx
const searchParams = useSearchParams();
const [showDenied, setShowDenied] = useState(false);

useEffect(() => {
  if (searchParams.get("denied") === "1") {
    setShowDenied(true);
    window.history.replaceState({}, "", "/dashboard");
    const timer = setTimeout(() => setShowDenied(false), 5000);
    return () => clearTimeout(timer);
  }
}, [searchParams]);
```

Then, immediately after the opening `<PageShell ...>` tag in the JSX return, add:
```tsx
{showDenied && (
  <div
    role="alert"
    onClick={() => setShowDenied(false)}
    className="cursor-pointer rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    You don&apos;t have permission to access that page.
  </div>
)}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/dashboard/page.tsx
git commit -m "feat: add denied-access banner to dashboard for redirected users"
```

---

### Task 7: Build Admin Landing Page (Command Center Hub)

**Files:**
- Create: `apps/frontend/src/app/admin/page.tsx`

This page is already protected by `admin/layout.tsx` (Task 4). It fetches from three existing endpoints in parallel and renders summary stats + module preview cards.

**API response shapes (from `apps/api/src/routes/admin.routes.ts`):**

`getBatchAnalytics()` returns:
```ts
{
  summary: {
    totalStudents: number;
    studentsWithJri: number;
    avgJri: number;
    placementReady: number;
    placementReadyPercent: number;
    tierDistribution: Record<string, number>; // { Legend, Elite, Pro, Rising, Challenger, Rookie }
  };
  departments: Array<{ name: string; count: number; avgJri: number; placementReadyPercent: number }>;
  risks: Array<{ label: string; count: number; total: number; percent: number; description: string }>;
  students: Array<{ ... }>;
}
```

`getAdminAlerts()` returns:
```ts
{
  totalAlerts: number;
  bySeverity: { critical: number; high: number; medium: number };
  alerts: Array<{ studentId: string; studentName: string; department: string; type: string; severity: "critical" | "high" | "medium"; message: string }>;
}
```

`getAdminLeaderboard({ limit: 3 })` returns:
```ts
{
  total: number;
  leaderboard: Array<{ rank: number; studentId: string; name: string; jriScore: number; tier: string; ... }>;
}
```

- [ ] **Step 1: Create `apps/frontend/src/app/admin/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getBatchAnalytics, getAdminLeaderboard, getAdminAlerts } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Trophy,
  Bell,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const TIER_BAR_COLORS: Record<string, string> = {
  Legend: "bg-amber-500",
  Elite: "bg-violet-500",
  Pro: "bg-blue-500",
  Rising: "bg-emerald-500",
  Challenger: "bg-orange-500",
  Rookie: "bg-muted-foreground/40",
};

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [analyticsData, leaderboardData, alertsData] = await Promise.all([
          getBatchAnalytics(),
          getAdminLeaderboard({ limit: 3 }),
          getAdminAlerts(),
        ]);
        setAnalytics(analyticsData);
        setLeaderboard(leaderboardData);
        setAlerts(alertsData);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PageShell
      eyebrow="College Admin"
      title="College Dashboard"
      description="Your college's engineering readiness at a glance"
    >
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Summary Stats Strip */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : analytics ? (
          <>
            <Card className="bg-card/80 border-border/70">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  <Users className="size-3.5" />
                  Total Students
                </div>
                <div className="mt-2 text-3xl font-black text-foreground">
                  {analytics.summary.totalStudents}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/70">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  <Target className="size-3.5" />
                  Avg JRI
                </div>
                <div className="mt-2 text-3xl font-black text-emerald-500">
                  {analytics.summary.avgJri}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/70">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  Placement Ready
                </div>
                <div className="mt-2 text-3xl font-black text-blue-500">
                  {analytics.summary.placementReadyPercent}%
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/70">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  <AlertTriangle className="size-3.5" />
                  Critical Alerts
                </div>
                <div className="mt-2 text-3xl font-black text-red-500">
                  {alerts?.bySeverity?.critical ?? 0}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Module Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
          </>
        ) : (
          <>
            {/* Batch Analytics Card */}
            <Card className="bg-card/80 border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="size-4 text-primary" />
                  Batch Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Tier Distribution</p>
                {analytics?.summary?.tierDistribution && (
                  <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
                    {Object.entries(analytics.summary.tierDistribution as Record<string, number>)
                      .filter(([, count]) => count > 0)
                      .map(([tier, count]) => (
                        <div
                          key={tier}
                          className={cn("h-full", TIER_BAR_COLORS[tier] ?? "bg-muted")}
                          style={{ flex: count }}
                          title={`${tier}: ${count}`}
                        />
                      ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {analytics?.summary?.tierDistribution &&
                    Object.entries(analytics.summary.tierDistribution as Record<string, number>)
                      .filter(([, count]) => count > 0)
                      .map(([tier, count]) => (
                        <span key={tier} className="text-[10px] text-muted-foreground">
                          {tier}: {count}
                        </span>
                      ))}
                </div>
                <Link
                  href="/admin/analytics"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View analytics <ChevronRight className="size-3" />
                </Link>
              </CardContent>
            </Card>

            {/* JRI Leaderboard Card */}
            <Card className="bg-card/80 border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="size-4 text-amber-500" />
                  JRI Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Top Performers</p>
                <div className="space-y-2">
                  {leaderboard?.leaderboard?.slice(0, 3).map(
                    (s: { rank: number; name: string; jriScore: number }) => (
                      <div
                        key={s.rank}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          {s.rank}. {s.name}
                        </span>
                        <span className="font-mono font-bold text-primary">
                          {s.jriScore}
                        </span>
                      </div>
                    )
                  )}
                  {(!leaderboard?.leaderboard || leaderboard.leaderboard.length === 0) && (
                    <p className="text-xs text-muted-foreground">No students ranked yet</p>
                  )}
                </div>
                <Link
                  href="/admin/leaderboard"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Full rankings <ChevronRight className="size-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Alerts Card */}
            <Card className="bg-card/80 border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bell className="size-4 text-red-500" />
                  Early Warnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Active Alerts</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="size-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">
                      {alerts?.bySeverity?.critical ?? 0} critical
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">
                      {alerts?.bySeverity?.high ?? 0} high risk
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="size-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">
                      {alerts?.bySeverity?.medium ?? 0} moderate
                    </span>
                  </div>
                </div>
                <Link
                  href="/admin/alerts"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View alerts <ChevronRight className="size-3" />
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageShell>
  );
}
```

Note: No `<AuthGuard>` wrapper here — the `admin/layout.tsx` from Task 4 already protects this page.

- [ ] **Step 2: Verify it compiles**

```bash
cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/admin/page.tsx
git commit -m "feat: add admin Command Center landing page at /admin"
```

---

### Task 8: Update PageShell Nav to Be Role-Aware

**Files:**
- Modify: `apps/frontend/src/components/app/page-shell.tsx`

Replace the existing client-side `getUserRoleFromToken()` role check with `useAuth()` from the context. Make Dashboard link role-aware. Remove the separate Admin nav link.

- [ ] **Step 1: Replace role logic and nav links**

In `apps/frontend/src/components/app/page-shell.tsx`:

Remove these imports:
```tsx
import { getUserRoleFromToken } from "@/lib/auth";
import { useState, useEffect } from "react";
```

Add this import:
```tsx
import { useAuth } from "@/components/app/auth-context";
```

Inside the `PageShell` function, remove the role state and effect:
```tsx
// DELETE these lines:
const [role, setRole] = useState<string | null>(null);

useEffect(() => {
  setRole(getUserRoleFromToken());
}, []);

const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
```

Replace with:
```tsx
const { user } = useAuth();
const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
```

Then replace the nav section (lines 47-65). Current:
```tsx
<nav className="hidden items-center gap-2 md:flex">
  <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
    Dashboard
  </Link>
  <Link href="/dashboard/market-fit" className={buttonVariants({ variant: "ghost" })}>
    Market Fit
  </Link>
  <Link href="/analyze" className={buttonVariants({ variant: "ghost" })}>
    Analyze
  </Link>
  {isAdmin && (
    <Link href="/admin/analytics" className={cn(buttonVariants({ variant: "ghost" }), "text-primary hover:text-primary")}>
      Admin
    </Link>
  )}
  <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
    Login
  </Link>
</nav>
```

Replace with:
```tsx
<nav className="hidden items-center gap-2 md:flex">
  <Link href={isAdmin ? "/admin" : "/dashboard"} className={buttonVariants({ variant: "ghost" })}>
    Dashboard
  </Link>
  <Link href="/dashboard/market-fit" className={buttonVariants({ variant: "ghost" })}>
    Market Fit
  </Link>
  <Link href="/analyze" className={buttonVariants({ variant: "ghost" })}>
    Analyze
  </Link>
  <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
    Login
  </Link>
</nav>
```

Also remove the `cn` import if it's no longer used elsewhere in this file. (Check first — it may be used in the `className` prop of `<section>`.)

- [ ] **Step 2: Verify it compiles**

```bash
cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/app/page-shell.tsx
git commit -m "feat: PageShell uses AuthContext for role-aware nav, remove Admin link"
```

---

### Task 9: Manual Verification

- [ ] **Step 1: Start the frontend dev server**

```bash
cd apps/frontend && npm run dev
```

- [ ] **Step 2: Test as unauthenticated user**

Clear localStorage. Navigate to:
- `/dashboard` — redirects to `/login`
- `/admin` — redirects to `/login`
- `/admin/analytics` — redirects to `/login`
- `/onboard/college` — redirects to `/login`
- `/analyze` — redirects to `/login`
- `/leaderboard/some-college` — redirects to `/login`
- `/login` — renders normally (public)
- `/` — renders normally (public)
- `/u/someuser` — renders normally (public)

- [ ] **Step 3: Test as STUDENT role**

Log in as a student. Navigate to:
- `/dashboard` — renders the student dashboard
- `/admin` — redirects to `/dashboard?denied=1`, banner appears and auto-dismisses
- `/admin/analytics` — redirects to `/dashboard?denied=1`
- `/onboard/college` — redirects to `/dashboard?denied=1`
- `/analyze` — renders normally
- Dashboard nav link — points to `/dashboard`
- No "Admin" link in nav

- [ ] **Step 4: Test as ADMIN role**

Log in as an admin. Navigate to:
- `/admin` — renders the Command Center Hub with stats + module cards
- `/admin/analytics` — renders normally
- `/admin/leaderboard` — renders normally
- `/admin/alerts` — renders normally
- `/onboard/college` — redirects to `/dashboard?denied=1` (ADMIN != SUPER_ADMIN)
- Dashboard nav link — points to `/admin`
- No separate "Admin" link in nav

- [ ] **Step 5: Test as SUPER_ADMIN role**

Log in as a super admin. Navigate to:
- `/admin` — renders the Command Center Hub
- `/onboard/college` — renders normally
- `/onboard/student` — renders normally
- Dashboard nav link — points to `/admin`

- [ ] **Step 6: Commit any fixes from testing**

If issues found during testing, fix and commit each separately.

---

## Route Protection Summary

| Route | Public? | Auth? | Role? | Protected by |
|-------|---------|-------|-------|-------------|
| `/` | Yes | - | - | - |
| `/login` | Yes | - | - | - |
| `/register` | Yes | - | - | - |
| `/u/[username]` | Yes | - | - | - |
| `/github-connected` | Yes | - | - | - |
| `/preview-report` | Yes | - | - | - |
| `/dashboard` | - | Yes | Any | `dashboard/layout.tsx` |
| `/dashboard/market-fit` | - | Yes | Any | `dashboard/layout.tsx` |
| `/analyze` | - | Yes | Any | Per-page AuthGuard |
| `/analysis/[id]` | - | Yes | Any | Per-page AuthGuard |
| `/leaderboard/[college]` | - | Yes | Any | Per-page AuthGuard |
| `/admin` | - | Yes | ADMIN+ | `admin/layout.tsx` |
| `/admin/analytics` | - | Yes | ADMIN+ | `admin/layout.tsx` |
| `/admin/leaderboard` | - | Yes | ADMIN+ | `admin/layout.tsx` |
| `/admin/alerts` | - | Yes | ADMIN+ | `admin/layout.tsx` |
| `/onboard/college` | - | Yes | SUPER_ADMIN | `onboard/layout.tsx` |
| `/onboard/student` | - | Yes | SUPER_ADMIN | `onboard/layout.tsx` |
