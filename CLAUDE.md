# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**SkillLighthouse (SLH)** — an evidence-based engineering evaluation platform. It analyzes student GitHub repos deterministically (no AI), assigns a Job Readiness Index (JRI) score, and surfaces explainable signals for recruiters and colleges. Key design constraint: same input must always produce the same output.

## Development Commands

```bash
# Install all workspace dependencies (run from root)
npm install

# API server — port 3000, watch mode
cd apps/api && npm run dev

# Frontend — port 3001
cd apps/frontend && npm run dev

# Worker — reads from ../api/.env
cd apps/worker && npm run dev

# Database: sync schema to DB
cd apps/api && npx prisma db push

# Database: visual UI
cd apps/api && npx prisma studio

# Test the project analyzer pipeline directly
cd packages/project-analyzer
npx tsx --env-file=../../apps/api/.env test-urls.ts

# Run student accuracy harness
npx tsx scripts/student-accuracy-harness.ts

# Typecheck a package
cd packages/project-analyzer && npm run typecheck
```

**Environment**: All apps share `apps/api/.env`. The worker explicitly loads it with `--env-file=../api/.env`.

## Architecture

This is an **npm workspaces monorepo** (`apps/*`, `packages/*`).

### Request Flow

1. **Frontend** (Next.js 16, port 3001) — proxies `/api/*` and `/auth/*` to the API via `next.config.ts` rewrites
2. **API** (Express 5, port 3000) — authenticates, validates, then enqueues a BullMQ job and returns `202`
3. **Redis** (BullMQ) — job queue between API and Worker
4. **Worker** (`apps/worker`) — pops jobs, decrypts the student's stored GitHub token, calls `runPipeline()` from `@slh/project-analyzer`, saves results to PostgreSQL
5. **Project Analyzer** (`packages/project-analyzer`) — clones the repo, runs the full analysis pipeline, returns a structured report

### Project Analyzer Pipeline

The core engine in `packages/project-analyzer/src/pipeline/pipeline.ts` runs these stages in order:

```
metrics → signals → profiles → scoring → anti-gaming → selection → confidence → report
```

- **metrics**: static file analysis + git history (via `ts-morph` AST + `simple-git`)
- **signals**: detects patterns (backend, frontend, DB, CI/CD)
- **profiles**: matches repo against rubrics (e.g., `backend_api`, `web_app`)
- **scoring**: deterministic score per profile
- **anti-gaming**: flags padding, boilerplate, fake complexity
- **selection**: picks the most defensible profile
- **confidence**: computes trust level
- **report**: final JSON report saved to `ProjectAnalysis` table

### Database Models (Prisma, PostgreSQL)

Key models: `User` (roles: STUDENT/ADMIN/RECRUITER/SUPER_ADMIN) → `Student` (stores encrypted GitHub token) → `ProjectAnalysis` (status: PENDING/IN_PROGRESS/COMPLETED/FAILED, stores full JSON report) → `JRICalculation`.

Schema is in `packages/database/prisma/schema.prisma`. The generated client is at `packages/database/src/generated/client/`.

### Authentication

GitHub OAuth + JWT (access + refresh tokens). GitHub token is encrypted at rest in the `Student` table. The worker decrypts it when cloning private repos.

## Frontend Notes

**Important**: This project uses **Next.js 16** with **React 19**, which has breaking changes from prior versions. Before writing any frontend code, read the relevant guide in `apps/frontend/node_modules/next/dist/docs/`. Do not rely on training-data knowledge of Next.js conventions. Path alias: `@/*` maps to `./src/*`.

## Key Environment Variables (apps/api/.env)

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — OAuth app credentials
- `GITHUB_TOKEN` — Personal access token to avoid GitHub API rate limits
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `ENCRYPTION_KEY` — 32-char key for GitHub token encryption
- `RESEND_API_KEY` — Email delivery

## Package Dependency Map

```
apps/api          → @slh/database, @slh/project-analyzer, @slh/leetcode-core
apps/worker       → @slh/database, @slh/project-analyzer
apps/frontend     → (standalone Next.js, calls API over HTTP)
packages/project-analyzer → @octokit/rest, ts-morph, simple-git, zod
packages/leetcode-core    → (standalone scraper)
packages/codeforces       → (standalone, has its own Express + BullMQ)
```

## Docs

Architecture specs live in `docs/`:
- `METRICS.md` — what metrics are collected and why
- `PROFILES.md` — evaluation profile definitions
- `SCORING.md` — scoring algorithm details
- `INTEGRATION.md` — how packages integrate
