# Admin Auth Guard & Landing Page — Design Spec

**Date:** 2026-04-02
**Status:** Approved

## Problem

1. Students can navigate to `/admin/*` URLs and see admin pages (backend returns 403 but frontend renders the page shell and attempts data fetches).
2. Admins land on `/dashboard` (the student dashboard) which is irrelevant — no admin-specific landing exists.

## Solution Overview

Three changes:
1. **AuthGuard component** — client-side route protection with role checking
2. **Admin landing page** — Command Center Hub at `/admin`
3. **PageShell nav update** — role-aware Dashboard link

---

## 1. Route Protection System

### AuthGuard Component

**File:** `apps/frontend/src/components/app/auth-guard.tsx`

A wrapper component that checks auth state on mount:
- Reads token via `getAccessToken()` from `@/lib/auth`
- Extracts role via `getUserRoleFromToken()`
- Shows a loading skeleton during the check (prevents flash of protected content)

**Props:**
```ts
interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: "ADMIN";  // only value needed today; SUPER_ADMIN implicitly passes
}
```

**Behavior:**
| Condition | Action |
|-----------|--------|
| No token | Redirect to `/login` |
| Token present, no `requiredRole` | Render children (any authenticated user) |
| Token present, `requiredRole="ADMIN"`, user is ADMIN or SUPER_ADMIN | Render children |
| Token present, `requiredRole="ADMIN"`, user is STUDENT or RECRUITER | Redirect to `/dashboard?denied=1` |

**SUPER_ADMIN** always passes an ADMIN role check (superset of ADMIN permissions).

### Toast for Denied Access

Minimal implementation — no toast library. The `/dashboard` page reads `?denied=1` from the URL on mount and shows a dismissible banner:

```
"You don't have permission to access that page."
```

Styled as a subtle top banner with `bg-destructive/10 text-destructive border-destructive/20`. Auto-dismisses after 5 seconds or on click. Clears the query param from the URL via `replaceState`.

### Route Protection Map

| Route Pattern | Protection |
|---------------|-----------|
| `/dashboard` | Auth required |
| `/dashboard/market-fit` | Auth required |
| `/analyze` | Auth required |
| `/analysis/[id]` | Auth required |
| `/leaderboard/*` | Auth required |
| `/admin` | Auth required + ADMIN role |
| `/admin/analytics` | Auth required + ADMIN role |
| `/admin/leaderboard` | Auth required + ADMIN role |
| `/admin/alerts` | Auth required + ADMIN role |
| `/login`, `/register` | Public |
| `/`, `/u/*` | Public |
| `/onboard/*` | Public |
| `/github-connected` | Public |

### Implementation Approach

Each protected page wraps its content in `<AuthGuard>` (or `<AuthGuard requiredRole="ADMIN">`). No layout-level middleware — keeps it explicit per page.

---

## 2. Admin Landing Page

### Route & File

**Route:** `/admin`
**File:** `apps/frontend/src/app/admin/page.tsx`

### Layout — Command Center Hub

Wrapped in `<AuthGuard requiredRole="ADMIN">` and `<PageShell>`:
- **eyebrow:** "College Admin"
- **title:** "College Dashboard"
- **description:** "Your college's engineering readiness at a glance"

### Summary Strip

4 stat cards in a responsive grid (`grid-cols-2 sm:grid-cols-4`):

| Card | Data Source | Style |
|------|-----------|-------|
| Total Students | `getBatchAnalytics().totalStudents` | `text-foreground` |
| Avg JRI | `getBatchAnalytics().averageJri` | `text-emerald-500` |
| Placement Ready % | `getBatchAnalytics().placementReadyPercent` | `text-blue-500` |
| Critical Alerts | `getAdminAlerts().filter(critical).length` | `text-red-500` |

Styling follows existing admin pages: `bg-card/80 border-border/70`, `text-3xl font-black` for numbers, `text-[10px] uppercase tracking-widest font-bold text-muted-foreground` for labels.

### Module Cards

3 cards in a responsive grid (`grid-cols-1 md:grid-cols-3`):

**1. Batch Analytics**
- Icon: `BarChart3` (Lucide)
- Mini preview: colored tier distribution bar (horizontal segments matching tier colors from leaderboard page)
- Link: "View analytics" → `/admin/analytics`

**2. JRI Leaderboard**
- Icon: `Trophy` (Lucide)
- Mini preview: top 3 students (name + JRI score) from `getAdminLeaderboard()`
- Link: "Full rankings" → `/admin/leaderboard`

**3. Alerts**
- Icon: `Bell` (Lucide)
- Mini preview: severity counts (critical/high/moderate with colored dots)
- Link: "View alerts" → `/admin/alerts`

### Data Fetching

All three API calls (`getBatchAnalytics()`, `getAdminLeaderboard()`, `getAdminAlerts()`) fire in parallel on mount via `Promise.all`. Skeleton placeholders shown while loading. Error state shows a retry button.

---

## 3. PageShell Nav Update

**File:** `apps/frontend/src/components/app/page-shell.tsx`

### Changes

1. **Dashboard link** becomes role-aware:
   - `isAdmin` → `href="/admin"` (label: "Dashboard")
   - Everyone else → `href="/dashboard"` (label: "Dashboard")

2. **Remove separate "Admin" nav link** — redundant since Dashboard now routes admins to `/admin`.

3. **Keep Login link** as-is for all users.

---

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `apps/frontend/src/components/app/auth-guard.tsx` |
| Create | `apps/frontend/src/app/admin/page.tsx` |
| Modify | `apps/frontend/src/components/app/page-shell.tsx` |
| Modify | `apps/frontend/src/app/dashboard/page.tsx` (add denied toast) |
| Modify | All protected page files (wrap in AuthGuard) |

## Design Decisions

- **Client-side guards only** — backend already returns 403; this prevents the UI from rendering. No SSR middleware needed since auth is token-in-localStorage.
- **No toast library** — SLH doesn't use one. A simple banner div keeps dependencies minimal.
- **Explicit per-page guards** — more visible than layout-level guards; each page declares its own requirements.
- **SUPER_ADMIN passes ADMIN checks** — consistent with backend permission model.
