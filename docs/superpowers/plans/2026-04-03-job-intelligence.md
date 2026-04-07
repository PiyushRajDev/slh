# Job Intelligence & Skill Gap Analysis — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a market-intelligence feature that fetches real job listings, extracts required skills via LLM, and produces a personalized gap report + learning roadmap for students.

**Architecture:** New `packages/job-intelligence` package runs a 6-stage async pipeline (fetch → extract → demand → profile → gap → roadmap); the API enqueues it as a BullMQ job and streams progress to the frontend via SSE using the same QueueEvents pattern as the existing analysis queue; results are persisted incrementally for checkpoint recovery.

**Tech Stack:** Vercel AI SDK v6 (`ai`, `@ai-sdk/anthropic`), Zod v4, Cheerio v1 (HTML scraping), BullMQ, Prisma (injected), Express 5, Next.js 16 + React 19, Recharts.

---

## File Map

**Create:**
```
packages/job-intelligence/
  package.json
  tsconfig.json
  src/index.ts
  src/types.ts
  src/pipeline.ts
  src/providers/remotive.ts
  src/providers/workingnomads.ts
  src/providers/web3career.ts
  src/providers/adzuna.ts
  src/providers/linkedin.ts
  src/providers/indeed.ts
  src/providers/index.ts
  src/ai/schemas.ts
  src/ai/canonicalize.ts
  src/ai/preprocess.ts
  src/ai/extractSkills.ts
  src/ai/analyzeDemand.ts
  src/ai/gapAnalysis.ts
  src/ai/roadmap.ts
  src/profile/buildProfile.ts

apps/api/src/lib/job-intelligence-queue.ts
apps/api/src/routes/job-intelligence.routes.ts
apps/worker/src/jobs/jobIntelligence.ts

apps/frontend/src/components/job-intelligence/FilterBar.tsx
apps/frontend/src/components/job-intelligence/AnalysisProgress.tsx
apps/frontend/src/components/job-intelligence/ReadinessScore.tsx
apps/frontend/src/components/job-intelligence/SkillDemandChart.tsx
apps/frontend/src/components/job-intelligence/GapAnalysisReport.tsx
apps/frontend/src/components/job-intelligence/RoadmapTimeline.tsx
apps/frontend/src/components/job-intelligence/JobResultsList.tsx
apps/frontend/src/app/(student)/job-intelligence/page.tsx
```

**Modify:**
```
packages/database/prisma/schema.prisma   — add 3 models
apps/api/src/auth/permissions.ts         — add 2 permissions + role maps
apps/api/src/app.ts                      — mount job-intelligence router
apps/worker/src/index.ts                 — add ji worker
apps/frontend/src/lib/api-client.ts      — add 4 client functions
```

---

## Task 1: Database Schema

**Files:**
- Modify: `packages/database/prisma/schema.prisma`

- [ ] **Step 1: Add three models to schema.prisma**

Append to the end of `packages/database/prisma/schema.prisma`:

```prisma
model JobIntelligenceReport {
  id              String         @id @default(cuid())
  studentId       String
  student         Student        @relation(fields: [studentId], references: [id])

  status          AnalysisStatus @default(PENDING)

  role            String
  experience      String
  salary          String

  stage           String?
  progress        Int            @default(0)
  progressMessage String?

  jobs            Json?
  skillsAnalysis  Json?
  gapAnalysis     Json?
  roadmap         Json?

  jobsCount       Int?
  topSkills       String[]
  readinessScore  Int?

  error           String?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([studentId, createdAt])
  @@index([studentId, role, experience, salary])
}

model JobCache {
  id                String   @id @default(cuid())

  role              String
  source            String

  title             String
  company           String?
  location          String?
  url               String   @unique

  rawDescription    String   @db.Text

  parsed            Boolean  @default(false)
  extractionVersion Int      @default(1)

  extractedSkills   Json?
  normalizedSkills  String[]

  salary            String?
  experience        String?

  createdAt         DateTime @default(now())
  expiresAt         DateTime

  @@index([role, source])
  @@index([expiresAt])
  @@index([parsed])
}

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

Also add the back-relation to `Student` (find the Student model and add this field after `jobApplications`):
```prisma
  jobIntelligenceReports JobIntelligenceReport[]
```

- [ ] **Step 2: Push schema to DB and regenerate client**

```bash
cd /home/piyush/slh/apps/api && npx prisma db push
cd /home/piyush/slh/apps/api && npx prisma generate
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/database/src/generated/
git commit -m "feat: add JobIntelligenceReport, JobCache, SkillDemand schema models"
```

---

## Task 2: Package Scaffolding + Types

**Files:**
- Create: `packages/job-intelligence/package.json`
- Create: `packages/job-intelligence/tsconfig.json`
- Create: `packages/job-intelligence/src/types.ts`
- Create: `packages/job-intelligence/src/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@slh/job-intelligence",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "ai": "^6.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "zod": "^4.0.0",
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create src/types.ts**

```typescript
export interface JobFilters {
  role: string;
  experience: string;
  salary: string;
}

export interface NormalizedJob {
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  description: string;
  salary: string | null;
  experience: string | null;
  source: string;
  postedAt: Date | null;
}

export interface JobProvider {
  name: string;
  fetch(filters: JobFilters): Promise<NormalizedJob[]>;
}

export interface ExtractedSkill {
  name: string;
  category: 'language' | 'framework' | 'tool' | 'concept';
  required: boolean;
}

export interface AnnotatedJob extends NormalizedJob {
  extractedSkills: ExtractedSkill[];
}

export interface SkillDemandItem {
  name: string;
  category: string;
  frequency: number;
  frequencyPercent: number;
  weightedFrequency: number;
  demandTier: 'critical' | 'high' | 'medium' | 'low';
  sources: string[];
}

export interface SkillMatch {
  skill: string;
  demandTier: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: {
    projects: number;
    repos: number;
    lastUsed: string | null;
    source: string[];
  };
}

export interface GapReport {
  readinessScore: number;
  matched: SkillMatch[];
  partial: SkillMatch[];
  missing: SkillMatch[];
}

export interface RoadmapPhase {
  title: string;
  duration: string;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  resources: Array<{
    title: string;
    type: 'course' | 'tutorial' | 'documentation' | 'practice';
  }>;
  outcome: string;
}

export interface Roadmap {
  phases: RoadmapPhase[];
  estimatedTotalDuration: string;
  priorityOrder: string[];
}

export interface StudentCapabilityProfile {
  skills: Array<{
    name: string;
    level: number; // 0=none, 1=beginner, 2=intermediate, 3=advanced
    evidence: {
      projects: number;
      repos: number;
      lastUsed: string | null;
      source: string[];
    };
  }>;
  dsaLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
  overallJri: number | null;
}

export interface JobIntelligenceResult {
  jobs: AnnotatedJob[];
  skillsAnalysis: SkillDemandItem[];
  gapAnalysis: GapReport;
  roadmap: Roadmap;
}
```

- [ ] **Step 4: Create src/index.ts**

```typescript
export { runJobIntelligencePipeline } from './pipeline';
export type {
  JobFilters,
  NormalizedJob,
  AnnotatedJob,
  ExtractedSkill,
  SkillDemandItem,
  SkillMatch,
  GapReport,
  Roadmap,
  RoadmapPhase,
  StudentCapabilityProfile,
  JobIntelligenceResult,
} from './types';
```

- [ ] **Step 5: Install dependencies**

```bash
cd /home/piyush/slh && npm install
```

Expected: new packages installed in `node_modules` under the workspace.

- [ ] **Step 6: Commit**

```bash
git add packages/job-intelligence/
git commit -m "feat: scaffold @slh/job-intelligence package with types"
```

---

## Task 3: Canonicalize + Preprocess Utilities

**Files:**
- Create: `packages/job-intelligence/src/ai/canonicalize.ts`
- Create: `packages/job-intelligence/src/ai/preprocess.ts`

- [ ] **Step 1: Create src/ai/canonicalize.ts**

```typescript
const CANON: Record<string, string> = {
  'react.js': 'React', 'reactjs': 'React',
  'node': 'Node.js', 'nodejs': 'Node.js', 'node js': 'Node.js',
  'js': 'JavaScript', 'javascript': 'JavaScript',
  'ts': 'TypeScript', 'typescript': 'TypeScript',
  'py': 'Python', 'python3': 'Python',
  'postgres': 'PostgreSQL', 'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB', 'mongodb': 'MongoDB',
  'k8s': 'Kubernetes', 'kube': 'Kubernetes',
  'aws': 'AWS', 'amazon web services': 'AWS',
  'gcp': 'GCP', 'google cloud': 'GCP',
  'azure': 'Azure', 'microsoft azure': 'Azure',
  'vue': 'Vue.js', 'vuejs': 'Vue.js',
  'angular': 'Angular', 'angularjs': 'Angular',
  'next': 'Next.js', 'nextjs': 'Next.js',
  'express': 'Express.js', 'expressjs': 'Express.js',
  'fastapi': 'FastAPI', 'fast api': 'FastAPI',
  'django': 'Django',
  'spring boot': 'Spring Boot', 'springboot': 'Spring Boot',
  'docker': 'Docker',
  'git': 'Git',
  'ci/cd': 'CI/CD', 'cicd': 'CI/CD',
  'rest': 'REST APIs', 'rest api': 'REST APIs', 'restful': 'REST APIs',
  'graphql': 'GraphQL',
  'redis': 'Redis',
  'kafka': 'Apache Kafka', 'apache kafka': 'Apache Kafka',
  'elasticsearch': 'Elasticsearch',
  'terraform': 'Terraform',
  'linux': 'Linux',
};

export function canonicalize(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return CANON[lower] ?? raw.trim();
}
```

- [ ] **Step 2: Create src/ai/preprocess.ts**

```typescript
// Strips noise from job descriptions before sending to LLM
// to reduce token cost and improve extraction quality.
const NOISE_PATTERNS = [
  // Benefits blocks
  /we offer[:\s].*?(?=\n\n|\z)/gsi,
  /benefits include[:\s].*?(?=\n\n|\z)/gsi,
  /perks[:\s].*?(?=\n\n|\z)/gsi,
  // EEO / legal boilerplate
  /equal opportunity employer.*$/gsi,
  /we are an equal.*$/gsi,
  /eeo.*$/gsi,
  /accommodation.*?request.*?$/gim,
  // Company "about us" fluff
  /about us[:\s].*?(?=\n\n)/gsi,
  /who we are[:\s].*?(?=\n\n)/gsi,
  // Compensation legals
  /base salary range.*?$/gim,
  /compensation.*?depends on.*?$/gim,
];

export function preprocessDescription(raw: string): string {
  let text = raw;
  for (const pattern of NOISE_PATTERNS) {
    text = text.replace(pattern, '');
  }
  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  // Truncate at 2000 chars — single-job fallback limit
  return text.slice(0, 2000);
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/job-intelligence/src/ai/
git commit -m "feat: add skill canonicalization and description preprocessing utilities"
```

---

## Task 4: Job Providers — Remotive + WorkingNomads

**Files:**
- Create: `packages/job-intelligence/src/providers/remotive.ts`
- Create: `packages/job-intelligence/src/providers/workingnomads.ts`

- [ ] **Step 1: Create src/providers/remotive.ts**

```typescript
import type { JobFilters, JobProvider, NormalizedJob } from '../types';

// Remotive category mapping from our role names
const ROLE_TO_CATEGORY: Record<string, string> = {
  'Backend Developer': 'software-dev',
  'Frontend Developer': 'software-dev',
  'Full-Stack Developer': 'software-dev',
  'DevOps Engineer': 'devops',
  'Data Engineer': 'data',
  'Mobile Developer': 'software-dev',
};

interface RemotiveJob {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  url: string;
  description: string;
  salary: string;
  publication_date: string;
}

export class RemotiveProvider implements JobProvider {
  readonly name = 'remotive';

  async fetch(filters: JobFilters): Promise<NormalizedJob[]> {
    const category = ROLE_TO_CATEGORY[filters.role] ?? 'software-dev';
    const url = `https://remotive.com/api/remote-jobs?category=${category}&limit=25`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`Remotive API ${res.status}`);
    const data = await res.json() as { jobs: RemotiveJob[] };

    return (data.jobs ?? []).map((j): NormalizedJob => ({
      title: j.title,
      company: j.company_name ?? null,
      location: j.candidate_required_location ?? null,
      url: j.url,
      description: j.description ?? '',
      salary: j.salary || null,
      experience: null,
      source: 'remotive',
      postedAt: j.publication_date ? new Date(j.publication_date) : null,
    }));
  }
}
```

- [ ] **Step 2: Create src/providers/workingnomads.ts**

```typescript
import type { JobFilters, JobProvider, NormalizedJob } from '../types';

const ROLE_TO_CATEGORY: Record<string, string> = {
  'Backend Developer': 'back-end-programming',
  'Frontend Developer': 'front-end-programming',
  'Full-Stack Developer': 'full-stack-programming',
  'DevOps Engineer': 'devops-sysadmin',
  'Data Engineer': 'data-analysis',
  'Mobile Developer': 'mobile-programming',
};

interface WNJob {
  id: number;
  title: string;
  company: string;
  region: string;
  url: string;
  description: string;
  salary: string;
  pub_date: string;
}

export class WorkingNomadsProvider implements JobProvider {
  readonly name = 'workingnomads';

  async fetch(filters: JobFilters): Promise<NormalizedJob[]> {
    const category = ROLE_TO_CATEGORY[filters.role] ?? 'back-end-programming';
    const url = `https://www.workingnomads.com/api/exposed_jobs/?category=${category}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`WorkingNomads API ${res.status}`);
    const data = await res.json() as WNJob[];

    return (data ?? []).slice(0, 25).map((j): NormalizedJob => ({
      title: j.title,
      company: j.company ?? null,
      location: j.region ?? null,
      url: j.url,
      description: j.description ?? '',
      salary: j.salary || null,
      experience: null,
      source: 'workingnomads',
      postedAt: j.pub_date ? new Date(j.pub_date) : null,
    }));
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/job-intelligence/src/providers/
git commit -m "feat: add Remotive and WorkingNomads job providers"
```

---

## Task 5: Providers — Web3Career + Adzuna + Stubs + Aggregator

**Files:**
- Create: `packages/job-intelligence/src/providers/web3career.ts`
- Create: `packages/job-intelligence/src/providers/adzuna.ts`
- Create: `packages/job-intelligence/src/providers/linkedin.ts`
- Create: `packages/job-intelligence/src/providers/indeed.ts`
- Create: `packages/job-intelligence/src/providers/index.ts`

- [ ] **Step 1: Create src/providers/web3career.ts**

```typescript
import type { JobFilters, JobProvider, NormalizedJob } from '../types';

// Web3Career uses path-based categories, not query params
const ROLE_TO_PATH: Record<string, string> = {
  'Backend Developer': 'backend',
  'Frontend Developer': 'frontend',
  'Full-Stack Developer': 'full-stack',
  'DevOps Engineer': 'devops',
  'Data Engineer': 'data',
  'Mobile Developer': 'mobile',
};

export class Web3CareerProvider implements JobProvider {
  readonly name = 'web3career';

  async fetch(filters: JobFilters): Promise<NormalizedJob[]> {
    // Dynamically import cheerio — avoids loading at startup
    const { load } = await import('cheerio');

    const path = ROLE_TO_PATH[filters.role] ?? 'backend';
    const url = `https://web3.career/${path}-jobs`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SLH-Bot/1.0)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`Web3Career HTTP ${res.status}`);

    const html = await res.text();
    const $ = load(html);
    const jobs: NormalizedJob[] = [];

    // Each job card has class "job-card" or similar — adjust selector if site changes
    $('tr.job_processor, tr[data-jobid]').slice(0, 20).each((_i, el) => {
      const titleEl = $(el).find('h2 a, .job_title a').first();
      const title = titleEl.text().trim();
      const href = titleEl.attr('href');
      if (!title || !href) return;

      const company = $(el).find('.company_name, td:nth-child(3)').first().text().trim();
      const description = $(el).find('.job_tags, .job_description').text().trim();
      const jobUrl = href.startsWith('http') ? href : `https://web3.career${href}`;

      jobs.push({
        title,
        company: company || null,
        location: 'Remote',
        url: jobUrl,
        description: description || title,
        salary: null,
        experience: null,
        source: 'web3career',
        postedAt: null,
      });
    });

    return jobs;
  }
}
```

- [ ] **Step 2: Create src/providers/adzuna.ts**

```typescript
import type { JobFilters, JobProvider, NormalizedJob } from '../types';

interface AdzunaResult {
  results: Array<{
    title: string;
    company: { display_name: string };
    location: { display_name: string };
    redirect_url: string;
    description: string;
    salary_min?: number;
    salary_max?: number;
    created: string;
  }>;
}

export class AdzunaProvider implements JobProvider {
  readonly name = 'adzuna';

  async fetch(filters: JobFilters): Promise<NormalizedJob[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) {
      console.warn('[Adzuna] Missing ADZUNA_APP_ID or ADZUNA_APP_KEY — skipping');
      return [];
    }

    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: '20',
      what: filters.role,
      where: 'India',
      sort_by: 'date',
    });

    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?${params}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`Adzuna API ${res.status}`);
    const data = await res.json() as AdzunaResult;

    return (data.results ?? []).map((j): NormalizedJob => {
      const salary = j.salary_min && j.salary_max
        ? `${j.salary_min}–${j.salary_max}`
        : null;
      return {
        title: j.title,
        company: j.company?.display_name ?? null,
        location: j.location?.display_name ?? null,
        url: j.redirect_url,
        description: j.description ?? '',
        salary,
        experience: null,
        source: 'adzuna',
        postedAt: j.created ? new Date(j.created) : null,
      };
    });
  }
}
```

- [ ] **Step 3: Create src/providers/linkedin.ts**

```typescript
import type { JobFilters, JobProvider, NormalizedJob } from '../types';

export class LinkedInProvider implements JobProvider {
  readonly name = 'linkedin';

  async fetch(_filters: JobFilters): Promise<NormalizedJob[]> {
    console.warn('[LinkedIn] Provider is a stub — requires official API partnership');
    return [];
  }
}
```

- [ ] **Step 4: Create src/providers/indeed.ts**

```typescript
import type { JobFilters, JobProvider, NormalizedJob } from '../types';

export class IndeedProvider implements JobProvider {
  readonly name = 'indeed';

  async fetch(_filters: JobFilters): Promise<NormalizedJob[]> {
    console.warn('[Indeed] Provider is a stub — requires publisher partnership');
    return [];
  }
}
```

- [ ] **Step 5: Create src/providers/index.ts (aggregator)**

```typescript
import type { PrismaClient } from '../../database/src/generated/client';
import type { JobFilters, NormalizedJob } from '../types';
import { RemotiveProvider } from './remotive';
import { WorkingNomadsProvider } from './workingnomads';
import { Web3CareerProvider } from './web3career';
import { AdzunaProvider } from './adzuna';
import { LinkedInProvider } from './linkedin';
import { IndeedProvider } from './indeed';

const PROVIDERS = [
  new RemotiveProvider(),
  new WorkingNomadsProvider(),
  new Web3CareerProvider(),
  new AdzunaProvider(),
  new LinkedInProvider(),
  new IndeedProvider(),
];

// Source weight for demand analysis: API sources = 1.0, scraped = 0.8
export const SOURCE_WEIGHTS: Record<string, number> = {
  remotive: 1.0,
  workingnomads: 1.0,
  adzuna: 1.0,
  web3career: 0.8,
  linkedin: 1.0,
  indeed: 1.0,
};

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Provider timeout')), ms)
    ),
  ]);
}

export async function aggregateJobs(
  prisma: PrismaClient,
  filters: JobFilters
): Promise<NormalizedJob[]> {
  const now = new Date();

  // Check which providers have fresh cache
  const cachedSources = await prisma.jobCache.findMany({
    where: {
      role: filters.role,
      expiresAt: { gt: now },
    },
    select: { source: true, url: true },
  });

  const cachedSourceNames = new Set(cachedSources.map(c => c.source));
  const cachedUrls = new Set(cachedSources.map(c => c.url));

  // Only run providers that don't have fresh cache
  const toRun = PROVIDERS.filter(p => !cachedSourceNames.has(p.name));
  const fresh: NormalizedJob[] = [];

  if (toRun.length > 0) {
    const results = await Promise.allSettled(
      toRun.map(p =>
        withTimeout(p.fetch(filters), 15_000).catch(err => {
          console.error(`[${p.name}] Provider failed:`, err.message);
          return [] as NormalizedJob[];
        })
      )
    );

    const allNew: NormalizedJob[] = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') allNew.push(...r.value);
    });

    // Deduplicate by URL (first wins), skip cached URLs
    const seen = new Set(cachedUrls);
    const dedupedNew = allNew.filter(j => {
      if (seen.has(j.url)) return false;
      seen.add(j.url);
      return true;
    });

    // Write to JobCache with 24h TTL
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (dedupedNew.length > 0) {
      await prisma.jobCache.createMany({
        data: dedupedNew.map(j => ({
          role: filters.role,
          source: j.source,
          title: j.title,
          company: j.company,
          location: j.location,
          url: j.url,
          rawDescription: j.description,
          salary: j.salary,
          experience: j.experience,
          expiresAt,
        })),
        skipDuplicates: true,
      });
    }

    fresh.push(...dedupedNew);
  }

  // Load cached results from DB
  const cachedJobs = cachedSources.length > 0
    ? await prisma.jobCache.findMany({
        where: { role: filters.role, expiresAt: { gt: now } },
        select: {
          url: true, title: true, company: true, location: true,
          rawDescription: true, salary: true, experience: true, source: true, createdAt: true,
        },
        take: 30,
      })
    : [];

  const fromCache: NormalizedJob[] = cachedJobs.map(c => ({
    title: c.title,
    company: c.company,
    location: c.location,
    url: c.url,
    description: c.rawDescription,
    salary: c.salary,
    experience: c.experience,
    source: c.source,
    postedAt: c.createdAt,
  }));

  // Merge: fresh + cache, deduplicate by URL
  const allJobs: NormalizedJob[] = [];
  const seenUrls = new Set<string>();
  for (const j of [...fresh, ...fromCache]) {
    if (!seenUrls.has(j.url)) {
      seenUrls.add(j.url);
      allJobs.push(j);
    }
  }

  return allJobs;
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/job-intelligence/src/providers/
git commit -m "feat: add Web3Career, Adzuna providers and job aggregator with cache"
```

---

## Task 6: AI Zod Schemas

**Files:**
- Create: `packages/job-intelligence/src/ai/schemas.ts`

- [ ] **Step 1: Create src/ai/schemas.ts**

```typescript
import { z } from 'zod';

export const ExtractedSkillSchema = z.object({
  name: z.string(),
  category: z.enum(['language', 'framework', 'tool', 'concept']),
  required: z.boolean(),
});

export const ExtractedSkillsSchema = z.object({
  skills: z.array(ExtractedSkillSchema).max(25),
});

export const FuzzyMatchSchema = z.object({
  matches: z.array(z.object({
    marketSkill: z.string(),
    studentMatch: z.enum(['matched', 'partial', 'missing']),
    confidence: z.enum(['high', 'medium', 'low']),
    rationale: z.string(),
  })),
});

export const RoadmapSchema = z.object({
  phases: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    skills: z.array(z.string()).min(2).max(4),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    })).min(1).max(3),
    resources: z.array(z.object({
      title: z.string(),
      type: z.enum(['course', 'tutorial', 'documentation', 'practice']),
    })).min(1).max(4),
    outcome: z.string(),
  })).min(2).max(6),
  estimatedTotalDuration: z.string(),
  priorityOrder: z.array(z.string()),
});

export type ExtractedSkillsOutput = z.infer<typeof ExtractedSkillsSchema>;
export type FuzzyMatchOutput = z.infer<typeof FuzzyMatchSchema>;
export type RoadmapOutput = z.infer<typeof RoadmapSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add packages/job-intelligence/src/ai/schemas.ts
git commit -m "feat: add Zod schemas for AI structured output"
```

---

## Task 7: Skill Extraction

**Files:**
- Create: `packages/job-intelligence/src/ai/extractSkills.ts`

- [ ] **Step 1: Create src/ai/extractSkills.ts**

```typescript
import { generateText, Output } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { PrismaClient } from '../../database/src/generated/client';
import type { NormalizedJob, AnnotatedJob, ExtractedSkill } from '../types';
import { preprocessDescription } from './preprocess';
import { canonicalize } from './canonicalize';
import { ExtractedSkillsSchema } from './schemas';

const EXTRACTION_VERSION = 1;
const MAX_BATCH_TOKENS = 3000;
const TOKENS_PER_CHAR = 0.3; // rough estimate

function estimateTokens(text: string): number {
  return Math.ceil(text.length * TOKENS_PER_CHAR);
}

function getModel() {
  const modelId = process.env.AI_MODEL_ID ?? 'claude-haiku-4-5-20251001';
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic(modelId);
}

async function extractBatch(
  jobs: NormalizedJob[]
): Promise<Map<string, ExtractedSkill[]>> {
  const model = getModel();

  const prompt = [
    'For each job listing below, extract the technical skills required.',
    'Return up to 25 skills per job. Skip soft skills.',
    'Normalize skill names (e.g. "Node.js" not "node").',
    '',
    ...jobs.map((j, i) =>
      `--- Job ${i + 1}: ${j.title} at ${j.company ?? 'Unknown'} ---\n${preprocessDescription(j.description)}`
    ),
    '',
    'Return a JSON object with "skills" array for each job combined (deduplicated).',
  ].join('\n');

  const result = await generateText({
    model,
    output: Output.object({ schema: ExtractedSkillsSchema }),
    prompt,
    maxRetries: 1,
  });

  // Canonicalize all extracted skill names
  const canonical = result.output.skills.map(s => ({
    ...s,
    name: canonicalize(s.name),
  }));

  // Map all jobs in this batch to the combined extracted skills
  const map = new Map<string, ExtractedSkill[]>();
  for (const job of jobs) {
    map.set(job.url, canonical);
  }
  return map;
}

export async function extractSkillsFromJobs(
  prisma: PrismaClient,
  jobs: NormalizedJob[]
): Promise<AnnotatedJob[]> {
  // Check which jobs are already in cache with current extraction version
  const cached = await prisma.jobCache.findMany({
    where: {
      url: { in: jobs.map(j => j.url) },
      parsed: true,
      extractionVersion: EXTRACTION_VERSION,
    },
    select: { url: true, extractedSkills: true },
  });

  const cachedMap = new Map<string, ExtractedSkill[]>(
    cached
      .filter(c => c.extractedSkills != null)
      .map(c => [c.url, c.extractedSkills as ExtractedSkill[]])
  );

  // Separate jobs needing extraction from those already cached
  const needExtraction = jobs.filter(j => !cachedMap.has(j.url));

  // Batch into ~3K token buckets
  const batches: NormalizedJob[][] = [];
  let current: NormalizedJob[] = [];
  let currentTokens = 0;

  for (const job of needExtraction) {
    const tokens = estimateTokens(preprocessDescription(job.description));
    if (tokens > 2000) {
      // Single-job fallback for very long descriptions
      batches.push([job]);
      continue;
    }
    if (currentTokens + tokens > MAX_BATCH_TOKENS && current.length > 0) {
      batches.push(current);
      current = [];
      currentTokens = 0;
    }
    current.push(job);
    currentTokens += tokens;
  }
  if (current.length > 0) batches.push(current);

  // Process batches sequentially (respects LLM rate limits)
  for (const batch of batches) {
    try {
      const extracted = await extractBatch(batch);
      for (const [url, skills] of extracted) {
        cachedMap.set(url, skills);
        // Persist to JobCache
        const normalizedSkills = skills.map(s => s.name);
        await prisma.jobCache.updateMany({
          where: { url },
          data: {
            extractedSkills: skills as any,
            normalizedSkills,
            parsed: true,
            extractionVersion: EXTRACTION_VERSION,
          },
        });
      }
    } catch (err) {
      console.error('[extractSkills] Batch failed, skipping:', err);
      // Graceful degradation: continue without this batch
      for (const job of batch) {
        cachedMap.set(job.url, []);
      }
    }
  }

  return jobs.map(j => ({
    ...j,
    extractedSkills: cachedMap.get(j.url) ?? [],
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/job-intelligence/src/ai/extractSkills.ts
git commit -m "feat: add LLM skill extraction with adaptive batching and cache"
```

---

## Task 8: Demand Analysis + Gap Analysis

**Files:**
- Create: `packages/job-intelligence/src/ai/analyzeDemand.ts`
- Create: `packages/job-intelligence/src/ai/gapAnalysis.ts`

- [ ] **Step 1: Create src/ai/analyzeDemand.ts**

```typescript
import type { PrismaClient } from '../../database/src/generated/client';
import type { AnnotatedJob, SkillDemandItem } from '../types';
import { SOURCE_WEIGHTS } from '../providers';
import { canonicalize } from './canonicalize';

const DEMAND_WEIGHT: Record<SkillDemandItem['demandTier'], number> = {
  critical: 1.0, high: 0.75, medium: 0.5, low: 0.25,
};

function assignTier(percentile: number): SkillDemandItem['demandTier'] {
  if (percentile >= 0.90) return 'critical';
  if (percentile >= 0.70) return 'high';
  if (percentile >= 0.40) return 'medium';
  return 'low';
}

export async function analyzeDemand(
  prisma: PrismaClient,
  jobs: AnnotatedJob[],
  role: string
): Promise<SkillDemandItem[]> {
  const totalJobs = jobs.length;
  if (totalJobs === 0) return [];

  // Count raw frequency and weighted frequency per skill
  const freqMap = new Map<string, { raw: number; weighted: number; sources: Set<string>; category: string }>();

  for (const job of jobs) {
    const sourceWeight = SOURCE_WEIGHTS[job.source] ?? 1.0;
    for (const skill of job.extractedSkills) {
      const canonical = canonicalize(skill.name);
      const existing = freqMap.get(canonical);
      if (existing) {
        existing.raw += 1;
        existing.weighted += sourceWeight;
        existing.sources.add(job.source);
      } else {
        freqMap.set(canonical, {
          raw: 1,
          weighted: sourceWeight,
          sources: new Set([job.source]),
          category: skill.category,
        });
      }
    }
  }

  // Apply dominance cap: single source ≤ 50% of weighted frequency
  const dominanceMap = new Map<string, Map<string, number>>();
  for (const job of jobs) {
    for (const skill of job.extractedSkills) {
      const canonical = canonicalize(skill.name);
      const sourceWeight = SOURCE_WEIGHTS[job.source] ?? 1.0;
      const perSource = dominanceMap.get(canonical) ?? new Map<string, number>();
      perSource.set(job.source, (perSource.get(job.source) ?? 0) + sourceWeight);
      dominanceMap.set(canonical, perSource);
    }
  }

  const sortedByWeighted = [...freqMap.entries()].sort(
    (a, b) => b[1].weighted - a[1].weighted
  );
  const maxWeighted = sortedByWeighted[0]?.[1].weighted ?? 1;

  // Calculate percentiles
  const items: SkillDemandItem[] = sortedByWeighted.map(([name, data], i) => {
    const percentile = 1 - i / sortedByWeighted.length;
    const tier = assignTier(percentile);

    // Apply dominance cap
    let cappedWeighted = data.weighted;
    const perSource = dominanceMap.get(name);
    if (perSource) {
      for (const [, sourceW] of perSource) {
        if (sourceW / data.weighted > 0.5) {
          cappedWeighted = Math.min(cappedWeighted, sourceW * 2);
        }
      }
    }

    return {
      name,
      category: data.category,
      frequency: data.raw,
      frequencyPercent: Math.round((data.raw / totalJobs) * 100),
      weightedFrequency: Math.round(cappedWeighted * 10) / 10,
      demandTier: tier,
      sources: [...data.sources],
    };
  });

  // Optionally upsert SkillDemand analytics (best-effort)
  try {
    await Promise.all(
      items.slice(0, 50).map(item =>
        prisma.skillDemand.upsert({
          where: { role_skill: { role, skill: item.name } },
          create: { role, skill: item.name, frequency: item.frequency, importance: item.weightedFrequency },
          update: { frequency: item.frequency, importance: item.weightedFrequency },
        })
      )
    );
  } catch {
    // Non-critical, don't fail pipeline
  }

  return items;
}

export { DEMAND_WEIGHT };
```

- [ ] **Step 2: Create src/ai/gapAnalysis.ts**

```typescript
import { generateText, Output } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { SkillDemandItem, StudentCapabilityProfile, GapReport, SkillMatch } from '../types';
import { FuzzyMatchSchema } from './schemas';
import { DEMAND_WEIGHT } from './analyzeDemand';

function getModel() {
  const modelId = process.env.AI_MODEL_ID ?? 'claude-haiku-4-5-20251001';
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic(modelId);
}

function calculateReadinessScore(
  matched: SkillMatch[],
  partial: SkillMatch[],
  missing: SkillMatch[],
  demand: SkillDemandItem[]
): number {
  const demandWeightMap = new Map(demand.map(d => [d.name, DEMAND_WEIGHT[d.demandTier]]));
  let numerator = 0;
  let denominator = 0;

  for (const s of matched) {
    const w = demandWeightMap.get(s.skill) ?? 0.25;
    numerator += w * 1.0;
    denominator += w;
  }
  for (const s of partial) {
    const w = demandWeightMap.get(s.skill) ?? 0.25;
    numerator += w * 0.5;
    denominator += w;
  }
  for (const s of missing) {
    const w = demandWeightMap.get(s.skill) ?? 0.25;
    denominator += w;
  }

  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export async function performGapAnalysis(
  demand: SkillDemandItem[],
  profile: StudentCapabilityProfile
): Promise<GapReport> {
  // Take top 30 demand skills for LLM fuzzy match (cost control)
  const topDemand = demand.slice(0, 30);

  const profileSkillsText = profile.skills
    .map(s => `${s.name} (level ${s.level}/3, ${s.evidence.projects} projects, ${s.evidence.repos} repos)`)
    .join('\n');

  const demandText = topDemand
    .map(d => `${d.name} [${d.demandTier}]`)
    .join('\n');

  const prompt = [
    'You are analyzing a software developer\'s skills against job market requirements.',
    '',
    'Market demands these skills (with demand tier):',
    demandText,
    '',
    'Student has these skills:',
    profileSkillsText,
    `DSA level: ${profile.dsaLevel}`,
    '',
    'For each market skill, classify the student\'s match as:',
    '- matched: Student clearly has this skill (same name or direct equivalent)',
    '- partial: Student has a related skill (e.g. has Express.js for "Node.js backend")',
    '- missing: Student has no relevant skill for this requirement',
    '',
    'Return confidence: high = certain, medium = inferred, low = uncertain.',
    'Be brief in rationale (1 sentence max).',
  ].join('\n');

  const model = getModel();
  const result = await generateText({
    model,
    output: Output.object({ schema: FuzzyMatchSchema }),
    prompt,
    maxRetries: 1,
  });

  const profileSkillMap = new Map(profile.skills.map(s => [s.name.toLowerCase(), s]));

  const matched: SkillMatch[] = [];
  const partial: SkillMatch[] = [];
  const missing: SkillMatch[] = [];

  for (const m of result.output.matches) {
    const demandItem = topDemand.find(d => d.name === m.marketSkill);
    if (!demandItem) continue;

    const profileSkill = profileSkillMap.get(m.marketSkill.toLowerCase());
    const evidence: SkillMatch['evidence'] = {
      projects: profileSkill?.evidence.projects ?? 0,
      repos: profileSkill?.evidence.repos ?? 0,
      lastUsed: profileSkill?.evidence.lastUsed ?? null,
      source: profileSkill?.evidence.source ?? [],
    };

    const skillMatch: SkillMatch = {
      skill: m.marketSkill,
      demandTier: demandItem.demandTier,
      confidence: m.confidence,
      evidence,
    };

    if (m.studentMatch === 'matched') matched.push(skillMatch);
    else if (m.studentMatch === 'partial') partial.push(skillMatch);
    else missing.push(skillMatch);
  }

  const readinessScore = calculateReadinessScore(matched, partial, missing, topDemand);

  return { readinessScore, matched, partial, missing };
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/job-intelligence/src/ai/analyzeDemand.ts packages/job-intelligence/src/ai/gapAnalysis.ts
git commit -m "feat: add demand analysis and hybrid LLM gap analysis"
```

---

## Task 9: Roadmap Generation

**Files:**
- Create: `packages/job-intelligence/src/ai/roadmap.ts`

- [ ] **Step 1: Create src/ai/roadmap.ts**

```typescript
import { generateText, Output } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { SkillMatch, Roadmap } from '../types';
import { RoadmapSchema } from './schemas';

function getModel() {
  const modelId = process.env.AI_MODEL_ID ?? 'claude-haiku-4-5-20251001';
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic(modelId);
}

export async function generateRoadmap(
  missing: SkillMatch[],
  partial: SkillMatch[],
  role: string
): Promise<Roadmap> {
  if (missing.length === 0 && partial.length === 0) {
    return {
      phases: [{
        title: 'Deepen Existing Skills',
        duration: '1-2 months',
        skills: [],
        projects: [{ name: 'Open Source Contribution', description: 'Contribute to a relevant open source project', difficulty: 'intermediate' }],
        resources: [{ title: 'Advanced system design resources', type: 'documentation' }],
        outcome: 'Portfolio strengthened with real-world contributions',
      }],
      estimatedTotalDuration: '1-2 months',
      priorityOrder: [],
    };
  }

  // Sort by demand tier for priority ordering
  const tierOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const prioritized = [
    ...missing.sort((a, b) => tierOrder[a.demandTier as keyof typeof tierOrder] - tierOrder[b.demandTier as keyof typeof tierOrder]),
    ...partial.sort((a, b) => tierOrder[a.demandTier as keyof typeof tierOrder] - tierOrder[b.demandTier as keyof typeof tierOrder]),
  ];

  const priorityText = prioritized.slice(0, 15).map((s, i) =>
    `${i + 1}. ${s.skill} [${s.demandTier}${s === partial.find(p => p.skill === s.skill) ? ', partial' : ', missing'}]`
  ).join('\n');

  const prompt = [
    `Create a learning roadmap for a developer targeting: ${role}`,
    '',
    'Priority skills to learn (ordered by market demand):',
    priorityText,
    '',
    'Rules:',
    '- 2-6 phases, each 2-4 skills that can be learned together',
    '- Each phase has 1-3 projects that combine multiple skills from that phase',
    '- Projects should be concrete and buildable (e.g. "Build a REST API with Node.js + PostgreSQL")',
    '- Resources are titles only (no URLs) — just the type: course, tutorial, documentation, or practice',
    '- Each phase ends with a clear outcome statement',
    '- priorityOrder lists skills in the order a student should learn them',
    '- estimatedTotalDuration is the total calendar time for all phases',
    '- Start with the highest-demand missing skills',
  ].join('\n');

  const model = getModel();
  const result = await generateText({
    model,
    output: Output.object({ schema: RoadmapSchema }),
    prompt,
    maxRetries: 1,
  });

  return result.output;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/job-intelligence/src/ai/roadmap.ts
git commit -m "feat: add constrained LLM roadmap generation"
```

---

## Task 10: Student Profile Builder

**Files:**
- Create: `packages/job-intelligence/src/profile/buildProfile.ts`

- [ ] **Step 1: Create src/profile/buildProfile.ts**

```typescript
import type { PrismaClient } from '../../database/src/generated/client';
import type { StudentCapabilityProfile } from '../types';
import { canonicalize } from '../ai/canonicalize';

export async function buildStudentProfile(
  prisma: PrismaClient,
  studentId: string
): Promise<StudentCapabilityProfile> {
  const [student, dsaProfiles, jriCalcs, projectAnalyses] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: { githubProfile: true },
    }),
    prisma.dSAProfile.findMany({ where: { studentId } }),
    prisma.jRICalculation.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    }),
    prisma.projectAnalysis.findMany({
      where: { studentId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const skillMap = new Map<string, {
    level: number;
    projects: number;
    repos: number;
    lastUsed: Date | null;
    sources: Set<string>;
  }>();

  function upsertSkill(
    name: string,
    level: number,
    source: string,
    projects = 0,
    repos = 0,
    lastUsed: Date | null = null
  ) {
    const canonical = canonicalize(name);
    const existing = skillMap.get(canonical);
    if (existing) {
      existing.level = Math.max(existing.level, level);
      existing.projects += projects;
      existing.repos += repos;
      existing.sources.add(source);
      if (lastUsed && (!existing.lastUsed || lastUsed > existing.lastUsed)) {
        existing.lastUsed = lastUsed;
      }
    } else {
      skillMap.set(canonical, { level, projects, repos, lastUsed, sources: new Set([source]) });
    }
  }

  // Extract from GitHub profile
  if (student?.githubProfile) {
    const gh = student.githubProfile;
    const langs = gh.languagesUsed as Record<string, number> | null;
    if (langs) {
      const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
      for (const [lang, bytes] of Object.entries(langs)) {
        const pct = bytes / total;
        const level = pct > 0.3 ? 3 : pct > 0.1 ? 2 : 1;
        upsertSkill(lang, level, 'github', 0, gh.totalRepos);
      }
    }
    const frameworks = gh.frameworks as string[] | null;
    if (frameworks) {
      for (const fw of frameworks) {
        upsertSkill(fw, 2, 'github', 0, gh.totalRepos);
      }
    }
  }

  // Extract from ProjectAnalysis reports
  for (const pa of projectAnalyses) {
    if (!pa.report) continue;
    const report = pa.report as any;

    // Signals from project analysis
    const signals = report?.details?.signals ?? {};
    const techStack: string[] = [];

    if (signals.hasBackend) {
      const langs: string[] = report?.details?.languages ?? [];
      for (const l of langs) {
        techStack.push(l);
        upsertSkill(l, 2, 'project-analysis', 1, 0, pa.createdAt);
      }
    }
    if (signals.hasFrontend) techStack.push('React', 'HTML', 'CSS');
    if (signals.hasDatabase) techStack.push('SQL');
    if (signals.hasCICD) techStack.push('CI/CD');

    // Profile ID gives context (e.g. "backend_api" → Node.js likely)
    if (pa.profileId === 'backend_api') {
      upsertSkill('REST APIs', 2, 'project-analysis', 1, 0, pa.createdAt);
    }
    if (pa.profileId === 'web_app') {
      upsertSkill('HTML', 2, 'project-analysis', 1, 0, pa.createdAt);
    }

    for (const skill of techStack) {
      upsertSkill(skill, 2, 'project-analysis', 1, 0, pa.createdAt);
    }
  }

  // DSA level
  const lcProfile = dsaProfiles.find(d => d.platform === 'LEETCODE');
  let dsaLevel: StudentCapabilityProfile['dsaLevel'] = 'none';
  if (lcProfile) {
    const solved = lcProfile.totalSolved;
    if (solved >= 200) dsaLevel = 'advanced';
    else if (solved >= 80) dsaLevel = 'intermediate';
    else if (solved >= 20) dsaLevel = 'beginner';
  }

  const overallJri = jriCalcs[0]?.jriScore ?? null;

  return {
    skills: [...skillMap.entries()].map(([name, data]) => ({
      name,
      level: data.level,
      evidence: {
        projects: data.projects,
        repos: data.repos,
        lastUsed: data.lastUsed?.toISOString() ?? null,
        source: [...data.sources],
      },
    })),
    dsaLevel,
    overallJri,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/job-intelligence/src/profile/
git commit -m "feat: add student capability profile builder from GitHub/DSA/JRI/ProjectAnalysis"
```

---

## Task 11: Pipeline Orchestrator

**Files:**
- Create: `packages/job-intelligence/src/pipeline.ts`

- [ ] **Step 1: Create src/pipeline.ts**

```typescript
import type { PrismaClient } from '../database/src/generated/client';
import type { JobFilters, JobIntelligenceResult } from './types';
import { aggregateJobs } from './providers';
import { extractSkillsFromJobs } from './ai/extractSkills';
import { analyzeDemand } from './ai/analyzeDemand';
import { buildStudentProfile } from './profile/buildProfile';
import { performGapAnalysis } from './ai/gapAnalysis';
import { generateRoadmap } from './ai/roadmap';

type ProgressCallback = (percent: number, message: string, stage: string) => void;

function stageProgress(
  base: number,
  weight: number,
  completed: number,
  total: number
): number {
  return Math.round(base + (completed / Math.max(total, 1)) * weight);
}

export async function runJobIntelligencePipeline(
  prisma: PrismaClient,
  filters: JobFilters,
  studentId: string,
  reportId: string,
  onProgress: ProgressCallback
): Promise<JobIntelligenceResult> {
  // Load existing report for checkpoint recovery
  const existing = await prisma.jobIntelligenceReport.findUnique({
    where: { id: reportId },
    select: { jobs: true, skillsAnalysis: true, gapAnalysis: true, roadmap: true },
  });

  // ── Stage 1: Fetch Jobs (0 → 20%) ──────────────────────────────────
  let jobs: any[];
  if (existing?.jobs) {
    jobs = existing.jobs as any[];
    onProgress(20, 'Loaded jobs from cache', 'fetching');
  } else {
    onProgress(0, 'Fetching jobs from providers...', 'fetching');
    const rawJobs = await aggregateJobs(prisma, filters);
    onProgress(10, `Found ${rawJobs.length} jobs`, 'fetching');

    // ── Stage 2: Extract Skills (20 → 45%) ───────────────────────────
    const annotated = await extractSkillsFromJobs(prisma, rawJobs);
    for (let i = 0; i < annotated.length; i++) {
      onProgress(stageProgress(20, 25, i + 1, annotated.length), `Analyzing job ${i + 1}/${annotated.length}...`, 'extracting');
    }

    jobs = annotated;
    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: { jobs: jobs as any, stage: 'extracting', progress: 45 },
    });
  }

  onProgress(45, 'Computing skill demand...', 'analyzing_demand');

  // ── Stage 3: Demand Analysis (45 → 55%) ─────────────────────────────
  let skillsAnalysis: any[];
  if (existing?.skillsAnalysis) {
    skillsAnalysis = existing.skillsAnalysis as any[];
  } else {
    skillsAnalysis = await analyzeDemand(prisma, jobs, filters.role);
    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: { skillsAnalysis: skillsAnalysis as any, stage: 'analyzing_demand', progress: 55 },
    });
  }
  onProgress(55, 'Building your capability profile...', 'building_profile');

  // ── Stage 4: Build Student Profile (55 → 65%) ───────────────────────
  const profile = await buildStudentProfile(prisma, studentId);
  onProgress(65, 'Comparing your skills to market...', 'gap_analysis');

  // ── Stage 5: Gap Analysis (65 → 80%) ────────────────────────────────
  let gapAnalysis: any;
  if (existing?.gapAnalysis) {
    gapAnalysis = existing.gapAnalysis;
  } else {
    gapAnalysis = await performGapAnalysis(skillsAnalysis, profile);
    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: { gapAnalysis: gapAnalysis as any, stage: 'gap_analysis', progress: 80 },
    });
  }
  onProgress(80, 'Generating your learning roadmap...', 'roadmap');

  // ── Stage 6: Roadmap (80 → 100%) ────────────────────────────────────
  let roadmap: any;
  if (existing?.roadmap) {
    roadmap = existing.roadmap;
  } else {
    roadmap = await generateRoadmap(gapAnalysis.missing, gapAnalysis.partial, filters.role);
    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: { roadmap: roadmap as any, stage: 'roadmap', progress: 100 },
    });
  }
  onProgress(100, 'Analysis complete', 'complete');

  return { jobs, skillsAnalysis, gapAnalysis, roadmap };
}
```

- [ ] **Step 2: Typecheck the package**

```bash
cd /home/piyush/slh/packages/job-intelligence && npx tsc --noEmit
```

Expected: 0 errors. Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
git add packages/job-intelligence/src/pipeline.ts
git commit -m "feat: add job-intelligence pipeline orchestrator with checkpoint recovery"
```

---

## Task 12: Permissions + Queue Setup

**Files:**
- Modify: `apps/api/src/auth/permissions.ts`
- Create: `apps/api/src/lib/job-intelligence-queue.ts`

- [ ] **Step 1: Add permissions to permissions.ts**

In `apps/api/src/auth/permissions.ts`, add to the `Permission` enum (after `ADMIN_LEADERBOARD_READ`):

```typescript
JOB_INTELLIGENCE_ANALYZE = "job-intelligence.analyze",
JOB_INTELLIGENCE_READ = "job-intelligence.read",
```

Then add `JOB_INTELLIGENCE_ANALYZE` and `JOB_INTELLIGENCE_READ` to `studentPermissions`:

```typescript
const studentPermissions: Permission[] = [
  // ...existing...
  Permission.JOB_INTELLIGENCE_ANALYZE,
  Permission.JOB_INTELLIGENCE_READ,
];
```

And add both to `adminPermissions`:

```typescript
const adminPermissions: Permission[] = [
  // ...existing...
  Permission.JOB_INTELLIGENCE_ANALYZE,
  Permission.JOB_INTELLIGENCE_READ,
];
```

- [ ] **Step 2: Create apps/api/src/lib/job-intelligence-queue.ts**

```typescript
import { Queue, QueueEvents } from 'bullmq';

export const JI_QUEUE_NAME = 'job-intelligence';
export const JI_JOB_NAME = 'analyze-market';

export const jiQueueConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const jiQueue = new Queue(JI_QUEUE_NAME, {
  connection: jiQueueConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const jiQueueEvents = new QueueEvents(JI_QUEUE_NAME, {
  connection: jiQueueConnection,
});
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/auth/permissions.ts apps/api/src/lib/job-intelligence-queue.ts
git commit -m "feat: add job-intelligence permissions and BullMQ queue setup"
```

---

## Task 13: API Routes

**Files:**
- Create: `apps/api/src/routes/job-intelligence.routes.ts`

- [ ] **Step 1: Create apps/api/src/routes/job-intelligence.routes.ts**

```typescript
import { Router, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { Job } from 'bullmq';
import prisma from '../db';
import {
  authenticate,
  AuthRequest,
  Permission,
  requirePermission,
} from '../middleware/auth.middleware';
import { jiQueue, jiQueueEvents, jiQueueConnection, JI_JOB_NAME } from '../lib/job-intelligence-queue';

const router = Router();

const jiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  keyGenerator: (req) => (req as AuthRequest).auth?.principal.userId ?? req.ip ?? 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Max 3 analyses per 10 minutes.' },
});

const STREAM_TIMEOUT_MS = 5 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 15 * 1000;

function writeSse(res: Response, event: string, data: Record<string, unknown>): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// POST /api/job-intelligence/analyze
router.post(
  '/analyze',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_ANALYZE),
  jiRateLimiter,
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { role, experience, salary, force } = req.body;
    if (!role || !experience || !salary) {
      res.status(400).json({ error: 'role, experience, and salary are required' });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student profile not found' }); return; }

    const studentId = student.id;
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    // Idempotency: check for recent completed or in-progress report
    if (!force) {
      const recent = await prisma.jobIntelligenceReport.findFirst({
        where: {
          studentId,
          role,
          experience,
          salary,
          OR: [
            { status: 'COMPLETED', createdAt: { gte: sixHoursAgo }, jobsCount: { gte: 10 } },
            { status: 'IN_PROGRESS' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true },
      });

      if (recent) {
        res.status(202).json({
          reportId: recent.id,
          status: recent.status,
          cached: recent.status === 'COMPLETED',
        });
        return;
      }
    }

    // Create report in transaction (race condition guard)
    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.jobIntelligenceReport.create({
        data: { studentId, role, experience, salary, status: 'PENDING' },
      });
      await jiQueue.add(JI_JOB_NAME, {
        reportId: created.id,
        studentId,
        filters: { role, experience, salary },
      }, { jobId: `ji-${created.id}` });
      return created;
    });

    res.status(202).json({ reportId: report.id, status: 'PENDING', cached: false });
  }
);

// GET /api/job-intelligence/:id
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_READ),
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const report = await prisma.jobIntelligenceReport.findUnique({
      where: { id: req.params.id },
    });
    if (!report) { res.status(404).json({ error: 'Report not found' }); return; }
    if (report.studentId !== student.id) { res.status(403).json({ error: 'Forbidden' }); return; }

    res.json({ report });
  }
);

// GET /api/job-intelligence/stream/:id
router.get(
  '/stream/:id',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_READ),
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const reportId = req.params.id;

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const report = await prisma.jobIntelligenceReport.findUnique({
      where: { id: reportId },
      select: { studentId: true, status: true, progress: true, stage: true, progressMessage: true },
    });
    if (!report) { res.status(404).json({ error: 'Report not found' }); return; }
    if (report.studentId !== student.id) { res.status(403).json({ error: 'Forbidden' }); return; }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Immediate state sync on connect
    writeSse(res, 'progress', {
      progress: report.progress,
      stage: report.stage ?? 'pending',
      message: report.progressMessage ?? 'Waiting to start...',
    });

    if (report.status === 'COMPLETED') {
      writeSse(res, 'complete', { reportId });
      res.end();
      return;
    }

    if (report.status === 'FAILED') {
      writeSse(res, 'failed', { reportId, error: 'Analysis failed' });
      res.end();
      return;
    }

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      clearInterval(heartbeat);
      clearTimeout(timeout);
      jiQueueEvents.off('progress', onProgress);
      jiQueueEvents.off('completed', onCompleted);
      jiQueueEvents.off('failed', onFailed);
      if (!res.writableEnded) res.end();
    };

    const heartbeat = setInterval(() => { res.write(': heartbeat\n\n'); }, HEARTBEAT_INTERVAL_MS);
    const timeout = setTimeout(() => {
      writeSse(res, 'timeout', { code: 'STREAM_TIMEOUT', reportId });
      cleanup();
    }, STREAM_TIMEOUT_MS);

    const jobId = `ji-${reportId}`;

    const onProgress = ({ jobId: eid, data }: { jobId: string; data: unknown }) => {
      if (eid !== jobId) return;
      const p = data as any;
      writeSse(res, 'progress', { progress: p?.percent ?? 0, stage: p?.stage ?? '', message: p?.message ?? '' });
    };

    const onCompleted = ({ jobId: eid }: { jobId: string }) => {
      if (eid !== jobId) return;
      writeSse(res, 'complete', { reportId });
      cleanup();
    };

    const onFailed = ({ jobId: eid, failedReason }: { jobId: string; failedReason: string }) => {
      if (eid !== jobId) return;
      writeSse(res, 'failed', { reportId, error: failedReason });
      cleanup();
    };

    await jiQueueEvents.waitUntilReady();
    jiQueueEvents.on('progress', onProgress);
    jiQueueEvents.on('completed', onCompleted);
    jiQueueEvents.on('failed', onFailed);
    req.on('close', cleanup);
  }
);

// GET /api/job-intelligence/history
router.get(
  '/history',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_READ),
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(20, parseInt(req.query.limit as string) || 10);

    const reports = await prisma.jobIntelligenceReport.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, role: true, experience: true, salary: true,
        readinessScore: true, topSkills: true, status: true, createdAt: true, jobsCount: true,
      },
    });

    res.json({ reports, page, limit });
  }
);

// POST /api/job-intelligence/:id/cancel
router.post(
  '/:id/cancel',
  authenticate,
  requirePermission(Permission.JOB_INTELLIGENCE_READ),
  async (req: AuthRequest, res: Response) => {
    const principal = req.auth?.principal;
    if (!principal) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const student = await prisma.student.findUnique({
      where: { userId: principal.userId },
      select: { id: true },
    });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const report = await prisma.jobIntelligenceReport.findUnique({
      where: { id: req.params.id },
      select: { studentId: true, status: true },
    });
    if (!report) { res.status(404).json({ error: 'Report not found' }); return; }
    if (report.studentId !== student.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    if (report.status === 'COMPLETED' || report.status === 'FAILED') {
      res.status(400).json({ error: 'Cannot cancel a finished report' });
      return;
    }

    await prisma.jobIntelligenceReport.update({
      where: { id: req.params.id },
      data: {
        status: 'FAILED',
        error: JSON.stringify({ stage: 'cancelled', message: 'Cancelled by user', retryable: false }),
      },
    });

    res.json({ success: true });
  }
);

export default router;
```

Note: The `/history` route must be registered **before** the `/:id` route in app.ts so Express matches it first.

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/routes/job-intelligence.routes.ts
git commit -m "feat: add job-intelligence API routes (analyze, stream, history, cancel)"
```

---

## Task 14: Wire Routes + Worker

**Files:**
- Modify: `apps/api/src/app.ts`
- Create: `apps/worker/src/jobs/jobIntelligence.ts`
- Modify: `apps/worker/src/index.ts`

- [ ] **Step 1: Mount router in app.ts**

In `apps/api/src/app.ts`, add the import:

```typescript
import jobIntelligenceRouter from './routes/job-intelligence.routes';
```

Add the mount line (after `studentJobsRouter` mount):

```typescript
app.use('/api/job-intelligence', jobIntelligenceRouter);
```

- [ ] **Step 2: Create apps/worker/src/jobs/jobIntelligence.ts**

```typescript
import { Job } from 'bullmq';
import { runJobIntelligencePipeline } from '../../../../packages/job-intelligence/src';
import prisma from '../../../api/src/db';

export interface JIJobPayload {
  reportId: string;
  studentId: string;
  filters: { role: string; experience: string; salary: string };
}

export async function handleJobIntelligence(job: Job<JIJobPayload>): Promise<void> {
  const { reportId, studentId, filters } = job.data;

  // Check if cancelled before starting
  const report = await prisma.jobIntelligenceReport.findUnique({
    where: { id: reportId },
    select: { status: true },
  });
  if (!report || report.status === 'FAILED' || report.status === 'COMPLETED') {
    console.log(`[JI Worker] Report ${reportId} already in terminal state — skipping`);
    return;
  }

  // Mark as IN_PROGRESS atomically
  await prisma.jobIntelligenceReport.updateMany({
    where: { id: reportId, status: 'PENDING' },
    data: { status: 'IN_PROGRESS' },
  });

  try {
    const result = await runJobIntelligencePipeline(
      prisma,
      filters,
      studentId,
      reportId,
      async (percent, message, stage) => {
        // Check for cancellation at each stage
        const current = await prisma.jobIntelligenceReport.findUnique({
          where: { id: reportId },
          select: { status: true },
        });
        if (current?.status === 'FAILED') {
          throw new Error('CANCELLED');
        }

        await job.updateProgress({ percent, stage, message });
        await prisma.jobIntelligenceReport.update({
          where: { id: reportId },
          data: { progress: percent, stage, progressMessage: message },
        });
      }
    );

    const topSkills = (result.skillsAnalysis as any[])
      .filter((s: any) => s.demandTier === 'critical' || s.demandTier === 'high')
      .slice(0, 5)
      .map((s: any) => s.name as string);

    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        jobsCount: (result.jobs as any[]).length,
        topSkills,
        readinessScore: (result.gapAnalysis as any).readinessScore,
      },
    });

    console.log(`[JI Worker] Report ${reportId} completed`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isCancelled = message === 'CANCELLED';

    if (!isCancelled) {
      await prisma.jobIntelligenceReport.update({
        where: { id: reportId },
        data: {
          status: 'FAILED',
          error: JSON.stringify({ stage: 'unknown', message, retryable: true }),
        },
      });
      console.error(`[JI Worker] Report ${reportId} failed:`, message);
    }

    throw err;
  }
}
```

- [ ] **Step 3: Register worker in apps/worker/src/index.ts**

Add the import:

```typescript
import { handleJobIntelligence } from './jobs/jobIntelligence';
```

Add the new worker (after the existing `worker` declaration):

```typescript
const jiConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const jiWorker = new Worker('job-intelligence', async job => {
  switch (job.name) {
    case 'analyze-market':
      return await handleJobIntelligence(job);
    default:
      console.warn(`[JI Worker] Unknown job type: ${job.name}`);
  }
}, { connection: jiConnection as any });

jiWorker.on('failed', (job, err) => {
  console.error(`[JI Worker] Job ${job?.id} failed:`, err.message);
});

console.log('[JI Worker] Listening for jobs on queue "job-intelligence"...');
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/app.ts apps/worker/src/jobs/jobIntelligence.ts apps/worker/src/index.ts
git commit -m "feat: wire job-intelligence router and worker job handler"
```

---

## Task 15: Frontend API Client

**Files:**
- Modify: `apps/frontend/src/lib/api-client.ts`

- [ ] **Step 1: Add job-intelligence types and functions to api-client.ts**

Append to `apps/frontend/src/lib/api-client.ts`:

```typescript
// ─────────────────────────────────────────────────────────────────
// Job Intelligence
// ─────────────────────────────────────────────────────────────────

export interface JIFilters {
  role: string;
  experience: string;
  salary: string;
  force?: boolean;
}

export interface JIAnalyzeResponse {
  reportId: string;
  status: string;
  cached: boolean;
}

export interface JIReport {
  id: string;
  status: string;
  role: string;
  experience: string;
  salary: string;
  progress: number;
  stage: string | null;
  progressMessage: string | null;
  jobs: any[] | null;
  skillsAnalysis: any[] | null;
  gapAnalysis: any | null;
  roadmap: any | null;
  jobsCount: number | null;
  topSkills: string[];
  readinessScore: number | null;
  error: string | null;
  createdAt: string;
}

export function analyzeMarket(filters: JIFilters) {
  return apiRequest<JIAnalyzeResponse>('/api/job-intelligence/analyze', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
}

export function getJIReport(reportId: string) {
  return apiRequest<{ report: JIReport }>(`/api/job-intelligence/${reportId}`);
}

export function getJIHistory(page = 1, limit = 10) {
  return apiRequest<{ reports: JIReport[]; page: number; limit: number }>(
    `/api/job-intelligence/history?page=${page}&limit=${limit}`
  );
}

export function cancelJIReport(reportId: string) {
  return apiRequest<{ success: boolean }>(`/api/job-intelligence/${reportId}/cancel`, {
    method: 'POST',
  });
}

export function openJIStream(
  reportId: string,
  handlers: {
    onProgress: (event: { progress: number; stage: string; message: string }) => void;
    onComplete: (payload: any) => void;
    onFailed: (payload: any) => void;
    onTimeout: (payload: any) => void;
    onTransportError?: (payload: any) => void;
  }
) {
  let source: EventSource | null = null;
  let closed = false;

  const closeSource = () => {
    if (closed) return;
    closed = true;
    if (source) source.close();
  };

  const initStream = async () => {
    if (closed) return;
    try {
      const response = await apiRequest<{ success: boolean; data: { streamToken: string } }>(
        '/auth/stream-token',
        { method: 'POST' }
      );
      if (closed) return;

      const token = response.data.streamToken;
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
      const url = new URL(`/api/job-intelligence/stream/${reportId}`, apiBaseUrl);
      url.searchParams.set('token', token);

      source = new EventSource(url.toString(), { withCredentials: true });

      source.addEventListener('progress', (event) => {
        try {
          handlers.onProgress(JSON.parse((event as MessageEvent).data));
        } catch {
          handlers.onTransportError?.({ code: 'PARSE_ERROR', error: 'Failed to parse progress event' });
        }
      });

      source.addEventListener('complete', (event) => {
        try { handlers.onComplete(JSON.parse((event as MessageEvent).data)); }
        catch { handlers.onComplete({ reportId }); }
        finally { closeSource(); }
      });

      source.addEventListener('failed', (event) => {
        try { handlers.onFailed(JSON.parse((event as MessageEvent).data)); }
        catch { handlers.onFailed({ error: 'Analysis failed' }); }
        finally { closeSource(); }
      });

      source.addEventListener('timeout', (event) => {
        try { handlers.onTimeout(JSON.parse((event as MessageEvent).data)); }
        catch { handlers.onTimeout({ error: 'Stream timed out' }); }
        finally { closeSource(); }
      });

      source.onerror = () => {
        if (closed) return;
        handlers.onTransportError?.({ code: 'STREAM_DISCONNECTED', error: 'Stream connection error' });
        closeSource();
      };
    } catch {
      if (closed) return;
      handlers.onTransportError?.({ code: 'AUTH_FAILED', error: 'Failed to authenticate stream' });
      closeSource();
    }
  };

  initStream();
  return closeSource;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/lib/api-client.ts
git commit -m "feat: add job-intelligence API client functions and SSE stream helper"
```

---

## Task 16: FilterBar + AnalysisProgress Components

**Files:**
- Create: `apps/frontend/src/components/job-intelligence/FilterBar.tsx`
- Create: `apps/frontend/src/components/job-intelligence/AnalysisProgress.tsx`

- [ ] **Step 1: Create FilterBar.tsx**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JIFilters } from "@/lib/api-client";

const ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Full-Stack Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Mobile Developer",
];

const EXPERIENCES = ["0-1 years", "0-2 years", "2-5 years", "5+ years"];
const SALARIES = ["3-6 LPA", "6-8 LPA", "8-12 LPA", "12-20 LPA", "20+ LPA"];

interface FilterBarProps {
  loading: boolean;
  onAnalyze: (filters: JIFilters) => void;
}

export function FilterBar({ loading, onAnalyze }: FilterBarProps) {
  const [role, setRole] = useState(ROLES[0]);
  const [experience, setExperience] = useState(EXPERIENCES[0]);
  const [salary, setSalary] = useState(SALARIES[0]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[180px]">
        <label className="text-xs text-muted-foreground mb-1 block">Role</label>
        <Select value={role} onValueChange={setRole} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="text-xs text-muted-foreground mb-1 block">Experience</label>
        <Select value={experience} onValueChange={setExperience} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="text-xs text-muted-foreground mb-1 block">Salary</label>
        <Select value={salary} onValueChange={setSalary} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SALARIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={() => onAnalyze({ role, experience, salary })}
        disabled={loading}
        className="h-10 px-6"
      >
        {loading ? "Analyzing..." : "Analyze Market"}
      </Button>
    </div>
  );
}
```

Note: The `Select` component comes from shadcn/ui. Install it if not present:
```bash
cd apps/frontend && npx shadcn add select
```

- [ ] **Step 2: Create AnalysisProgress.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const STAGE_LABELS: Record<string, string> = {
  fetching: "Fetching Jobs",
  extracting: "Analyzing Descriptions",
  analyzing_demand: "Computing Demand",
  building_profile: "Building Your Profile",
  gap_analysis: "Comparing Skills",
  roadmap: "Generating Roadmap",
  complete: "Complete",
};

interface AnalysisProgressProps {
  progress: number;
  stage: string;
  message: string;
}

export function AnalysisProgress({ progress, stage, message }: AnalysisProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{message}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{STAGE_LABELS[stage] ?? stage}</Badge>
          <span className="font-mono text-xs">{progress}%</span>
        </div>
      </div>
      <Progress value={progress} className="h-2" ref={barRef} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/job-intelligence/
git commit -m "feat: add FilterBar and AnalysisProgress components"
```

---

## Task 17: ReadinessScore + SkillDemandChart

**Files:**
- Create: `apps/frontend/src/components/job-intelligence/ReadinessScore.tsx`
- Create: `apps/frontend/src/components/job-intelligence/SkillDemandChart.tsx`

- [ ] **Step 1: Create ReadinessScore.tsx**

```tsx
import { cn } from "@/lib/utils";

const VERDICTS = [
  { threshold: 80, label: "Market-Ready", color: "text-emerald-400" },
  { threshold: 60, label: "Nearly Ready", color: "text-blue-400" },
  { threshold: 40, label: "Developing", color: "text-amber-400" },
  { threshold: 0, label: "Gap Present", color: "text-red-400" },
] as const;

function getVerdict(score: number) {
  return VERDICTS.find(v => score >= v.threshold) ?? VERDICTS[3];
}

// Stroke calculation for SVG circle gauge
const R = 56;
const CIRC = 2 * Math.PI * R;

interface ReadinessScoreProps {
  score: number;
}

export function ReadinessScore({ score }: ReadinessScoreProps) {
  const verdict = getVerdict(score);
  const offset = CIRC - (score / 100) * CIRC;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
          <circle
            cx="64" cy="64" r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={verdict.color}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold tabular-nums", verdict.color)}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={cn("text-sm font-medium", verdict.color)}>{verdict.label}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create SkillDemandChart.tsx**

```tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TIER_COLORS = {
  critical: "#f87171",
  high: "#fb923c",
  medium: "#facc15",
  low: "#94a3b8",
} as const;

interface SkillDemandItem {
  name: string;
  frequencyPercent: number;
  demandTier: keyof typeof TIER_COLORS;
}

interface SkillDemandChartProps {
  skills: SkillDemandItem[];
}

export function SkillDemandChart({ skills }: SkillDemandChartProps) {
  const top15 = skills.slice(0, 15);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <span key={tier} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            {tier}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={top15} layout="vertical" margin={{ left: 0, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Frequency"]}
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
          />
          <Bar dataKey="frequencyPercent" radius={[0, 4, 4, 0]}>
            {top15.map((entry, index) => (
              <Cell key={index} fill={TIER_COLORS[entry.demandTier] ?? '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/job-intelligence/ReadinessScore.tsx apps/frontend/src/components/job-intelligence/SkillDemandChart.tsx
git commit -m "feat: add ReadinessScore gauge and SkillDemandChart"
```

---

## Task 18: GapAnalysisReport + RoadmapTimeline

**Files:**
- Create: `apps/frontend/src/components/job-intelligence/GapAnalysisReport.tsx`
- Create: `apps/frontend/src/components/job-intelligence/RoadmapTimeline.tsx`

- [ ] **Step 1: Create GapAnalysisReport.tsx**

```tsx
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillMatch {
  skill: string;
  demandTier: string;
  confidence: string;
  evidence: { projects: number; repos: number; lastUsed: string | null; source: string[] };
}

interface GapReport {
  readinessScore: number;
  matched: SkillMatch[];
  partial: SkillMatch[];
  missing: SkillMatch[];
}

const TIER_BADGE: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

function SkillRow({ skill, type }: { skill: SkillMatch; type: "matched" | "partial" | "missing" }) {
  const icon = {
    matched: <CheckCircle className="size-4 text-emerald-400 shrink-0" />,
    partial: <Circle className="size-4 text-amber-400 shrink-0" />,
    missing: <AlertCircle className="size-4 text-red-400 shrink-0" />,
  }[type];

  const evidenceParts = [];
  if (skill.evidence.projects > 0) evidenceParts.push(`${skill.evidence.projects} project${skill.evidence.projects > 1 ? 's' : ''}`);
  if (skill.evidence.repos > 0) evidenceParts.push(`${skill.evidence.repos} repos`);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      {icon}
      <span className="flex-1 text-sm font-medium">{skill.skill}</span>
      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", TIER_BADGE[skill.demandTier] ?? TIER_BADGE.low)}>
        {skill.demandTier}
      </span>
      {evidenceParts.length > 0 && (
        <span className="text-xs text-muted-foreground">{evidenceParts.join(', ')}</span>
      )}
    </div>
  );
}

interface GapAnalysisReportProps {
  gap: GapReport;
}

export function GapAnalysisReport({ gap }: GapAnalysisReportProps) {
  const sections = [
    { label: "Matched", skills: gap.matched, type: "matched" as const, color: "text-emerald-400" },
    { label: "Partial", skills: gap.partial, type: "partial" as const, color: "text-amber-400" },
    { label: "Missing", skills: gap.missing, type: "missing" as const, color: "text-red-400" },
  ].filter(s => s.skills.length > 0);

  return (
    <div className="space-y-6">
      {sections.map(section => (
        <div key={section.label}>
          <h4 className={cn("text-sm font-semibold mb-2 flex items-center gap-2", section.color)}>
            {section.label}
            <Badge variant="secondary" className="text-xs">{section.skills.length}</Badge>
          </h4>
          <div className="rounded-lg border border-border bg-card/50 px-3">
            {section.skills.map(skill => (
              <SkillRow key={skill.skill} skill={skill} type={section.type} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create RoadmapTimeline.tsx**

```tsx
import { Badge } from "@/components/ui/badge";
import { Clock, Folder, BookOpen } from "lucide-react";

interface RoadmapProject { name: string; description: string; difficulty: string; }
interface RoadmapResource { title: string; type: string; }
interface RoadmapPhase {
  title: string;
  duration: string;
  skills: string[];
  projects: RoadmapProject[];
  resources: RoadmapResource[];
  outcome: string;
}
interface Roadmap { phases: RoadmapPhase[]; estimatedTotalDuration: string; priorityOrder: string[]; }

const DIFFICULTY_COLORS = { beginner: "text-emerald-400", intermediate: "text-amber-400", advanced: "text-red-400" };

interface RoadmapTimelineProps { roadmap: Roadmap; }

export function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4" />
        Total: <span className="font-medium text-foreground">{roadmap.estimatedTotalDuration}</span>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6 pl-8">
          {roadmap.phases.map((phase, i) => (
            <div key={i} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />

              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Phase {i + 1}</span>
                    <h4 className="font-semibold text-sm">{phase.title}</h4>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    <Clock className="size-3 mr-1" />{phase.duration}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {phase.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Folder className="size-3" />Projects
                  </p>
                  {phase.projects.map((p, pi) => (
                    <div key={pi} className="text-xs pl-4">
                      <span className="font-medium">{p.name}</span>
                      <span className={`ml-2 ${DIFFICULTY_COLORS[p.difficulty as keyof typeof DIFFICULTY_COLORS] ?? ''}`}>
                        [{p.difficulty}]
                      </span>
                      <p className="text-muted-foreground mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>

                {phase.resources.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <BookOpen className="size-3" />Resources
                    </p>
                    {phase.resources.map((r, ri) => (
                      <p key={ri} className="text-xs pl-4 text-muted-foreground">
                        {r.title} <span className="opacity-60">({r.type})</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="text-xs rounded-md bg-muted/40 px-3 py-1.5 border border-border/50">
                  <span className="text-muted-foreground">Outcome: </span>{phase.outcome}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/job-intelligence/GapAnalysisReport.tsx apps/frontend/src/components/job-intelligence/RoadmapTimeline.tsx
git commit -m "feat: add GapAnalysisReport and RoadmapTimeline components"
```

---

## Task 19: JobResultsList

**Files:**
- Create: `apps/frontend/src/components/job-intelligence/JobResultsList.tsx`

- [ ] **Step 1: Create JobResultsList.tsx**

```tsx
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface ExtractedSkill { name: string; category: string; required: boolean; }
interface JobResult {
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  salary: string | null;
  source: string;
  extractedSkills?: ExtractedSkill[];
}

const SOURCE_COLORS: Record<string, string> = {
  remotive: "bg-blue-500/20 text-blue-300",
  workingnomads: "bg-purple-500/20 text-purple-300",
  web3career: "bg-emerald-500/20 text-emerald-300",
  adzuna: "bg-orange-500/20 text-orange-300",
};

interface JobResultsListProps { jobs: JobResult[]; }

export function JobResultsList({ jobs }: JobResultsListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No job listings found for these filters.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
      {jobs.map((job, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2 hover:border-border/80 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-sm truncate">{job.title}</h4>
              <p className="text-xs text-muted-foreground">{job.company ?? 'Unknown Company'} {job.location ? `· ${job.location}` : ''}</p>
            </div>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SOURCE_COLORS[job.source] ?? 'bg-muted/40 text-muted-foreground'}`}>
              {job.source}
            </span>
            {job.salary && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                {job.salary}
              </span>
            )}
            {job.extractedSkills?.slice(0, 5).map(skill => (
              <Badge key={skill.name} variant="outline" className="text-[10px] py-0 h-5">
                {skill.name}
              </Badge>
            ))}
            {(job.extractedSkills?.length ?? 0) > 5 && (
              <span className="text-[10px] text-muted-foreground">
                +{(job.extractedSkills?.length ?? 0) - 5} more
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/components/job-intelligence/JobResultsList.tsx
git commit -m "feat: add JobResultsList component with source badges and skill tags"
```

---

## Task 20: Main Page

**Files:**
- Create: `apps/frontend/src/app/(student)/job-intelligence/page.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  analyzeMarket,
  getJIReport,
  openJIStream,
  cancelJIReport,
  type JIFilters,
  type JIReport,
} from "@/lib/api-client";
import { FilterBar } from "@/components/job-intelligence/FilterBar";
import { AnalysisProgress } from "@/components/job-intelligence/AnalysisProgress";
import { ReadinessScore } from "@/components/job-intelligence/ReadinessScore";
import { SkillDemandChart } from "@/components/job-intelligence/SkillDemandChart";
import { GapAnalysisReport } from "@/components/job-intelligence/GapAnalysisReport";
import { RoadmapTimeline } from "@/components/job-intelligence/RoadmapTimeline";
import { JobResultsList } from "@/components/job-intelligence/JobResultsList";
import { AlertCircle, RefreshCw } from "lucide-react";

type PageState = "idle" | "loading" | "complete" | "error" | "cached";

interface ProgressState { progress: number; stage: string; message: string; }

export default function JobIntelligencePage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [report, setReport] = useState<JIReport | null>(null);
  const [progress, setProgress] = useState<ProgressState>({ progress: 0, stage: "pending", message: "Waiting to start..." });
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<JIFilters | null>(null);
  const closeStreamRef = useRef<(() => void) | null>(null);

  const loadReport = useCallback(async (id: string) => {
    try {
      const res = await getJIReport(id);
      setReport(res.report);
      setPageState("complete");
    } catch {
      setError("Failed to load report.");
      setPageState("error");
    }
  }, []);

  const startStream = useCallback((id: string) => {
    const close = openJIStream(id, {
      onProgress: (event) => setProgress(event),
      onComplete: async () => {
        closeStreamRef.current = null;
        await loadReport(id);
      },
      onFailed: (payload) => {
        setError(payload.error ?? "Analysis failed.");
        setPageState("error");
      },
      onTimeout: () => {
        setError("Analysis is taking longer than expected. Check back shortly.");
        setPageState("error");
      },
      onTransportError: () => {
        setError("Lost connection to server. Please retry.");
        setPageState("error");
      },
    });
    closeStreamRef.current = close;
  }, [loadReport]);

  const handleAnalyze = useCallback(async (filters: JIFilters, force = false) => {
    // Cleanup any existing stream
    closeStreamRef.current?.();
    setError(null);
    setReport(null);
    setProgress({ progress: 0, stage: "pending", message: "Starting analysis..." });
    setPageState("loading");
    setLastFilters(filters);

    try {
      const res = await analyzeMarket({ ...filters, force });
      setReportId(res.reportId);

      if (res.cached) {
        await loadReport(res.reportId);
        setPageState("cached");
      } else {
        startStream(res.reportId);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to start analysis.");
      setPageState("error");
    }
  }, [loadReport, startStream]);

  const handleReanalyze = useCallback(() => {
    if (lastFilters) handleAnalyze(lastFilters, true);
  }, [lastFilters, handleAnalyze]);

  const handleCancel = useCallback(async () => {
    closeStreamRef.current?.();
    if (reportId) {
      try { await cancelJIReport(reportId); } catch {}
    }
    setPageState("idle");
  }, [reportId]);

  // Cleanup stream on unmount
  useEffect(() => () => { closeStreamRef.current?.(); }, []);

  return (
    <PageShell
      eyebrow="Market Intelligence"
      title="Job Market Gap Analysis"
      description="Filter by role and experience to see what skills are in demand — and exactly where your gaps are."
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <FilterBar loading={pageState === "loading"} onAnalyze={handleAnalyze} />
          </CardContent>
        </Card>

        {/* Progress */}
        {pageState === "loading" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <AnalysisProgress
                progress={progress.progress}
                stage={progress.stage}
                message={progress.message}
              />
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {pageState === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button size="sm" variant="outline" onClick={() => lastFilters && handleAnalyze(lastFilters)} className="ml-4">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {(pageState === "complete" || pageState === "cached") && report && (
          <div className="space-y-6">
            {pageState === "cached" && (
              <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/40 px-4 py-2 rounded-lg border border-border">
                Showing a recent analysis from {new Date(report.createdAt).toLocaleDateString()}.
                <Button size="sm" variant="ghost" onClick={handleReanalyze} className="gap-1.5">
                  <RefreshCw className="size-3.5" />Re-analyze
                </Button>
              </div>
            )}

            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="flex flex-col items-center justify-center p-6">
                <ReadinessScore score={report.readinessScore ?? 0} />
              </Card>
              <Card className="sm:col-span-2 p-6">
                <p className="text-sm text-muted-foreground mb-2">Top Demanded Skills</p>
                <div className="flex flex-wrap gap-2">
                  {report.topSkills.map(s => (
                    <span key={s} className="text-xs px-2 py-1 rounded-full bg-muted/60 border border-border">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Analyzed {report.jobsCount ?? 0} job listings for {report.role}
                </p>
              </Card>
            </div>

            {/* Tabbed detail */}
            <Tabs defaultValue="demand">
              <TabsList>
                <TabsTrigger value="demand">Skill Demand</TabsTrigger>
                <TabsTrigger value="gap">Gap Analysis</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="jobs">Jobs ({report.jobsCount ?? 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="demand">
                <Card>
                  <CardHeader><CardTitle className="text-base">Market Skill Demand</CardTitle></CardHeader>
                  <CardContent>
                    {report.skillsAnalysis ? (
                      <SkillDemandChart skills={report.skillsAnalysis} />
                    ) : <p className="text-sm text-muted-foreground">No data available.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gap">
                <Card>
                  <CardHeader><CardTitle className="text-base">Your Skills vs Market</CardTitle></CardHeader>
                  <CardContent>
                    {report.gapAnalysis ? (
                      <GapAnalysisReport gap={report.gapAnalysis} />
                    ) : <p className="text-sm text-muted-foreground">No data available.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roadmap">
                <Card>
                  <CardHeader><CardTitle className="text-base">Your Learning Roadmap</CardTitle></CardHeader>
                  <CardContent>
                    {report.roadmap ? (
                      <RoadmapTimeline roadmap={report.roadmap} />
                    ) : <p className="text-sm text-muted-foreground">No roadmap available.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs">
                <Card>
                  <CardHeader><CardTitle className="text-base">Job Listings Analyzed</CardTitle></CardHeader>
                  <CardContent>
                    {report.jobs ? (
                      <JobResultsList jobs={report.jobs} />
                    ) : <p className="text-sm text-muted-foreground">No jobs data.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </PageShell>
  );
}
```

Note: The `Tabs` component comes from shadcn/ui. Install it if not present:
```bash
cd apps/frontend && npx shadcn add tabs
```

- [ ] **Step 2: Add to navigation (optional but recommended)**

In `apps/frontend/src/components/app/command-menu.tsx` or equivalent navigation file, add a link to `/job-intelligence` with label "Market Analysis" or "Job Intelligence".

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/(student)/job-intelligence/
git commit -m "feat: add job-intelligence main page with SSE streaming and tabbed results"
```

---

## Post-Implementation Checklist

- [ ] **End-to-end test**: With API + worker running locally, submit a job-intelligence request and verify the SSE stream delivers progress events and the report loads on completion.
- [ ] **Typecheck all packages**:
  ```bash
  cd packages/job-intelligence && npx tsc --noEmit
  cd apps/api && npx tsc --noEmit
  cd apps/worker && npx tsc --noEmit
  ```
- [ ] **Add env vars** to `apps/api/.env`:
  ```
  ADZUNA_APP_ID=your_id
  ADZUNA_APP_KEY=your_key
  ANTHROPIC_API_KEY=your_key
  AI_MODEL_ID=claude-haiku-4-5-20251001
  ```
- [ ] **Cache cleanup job** (optional): Add a repeatable BullMQ job to the worker that deletes expired `JobCache` entries every 6 hours.

---

## Spec Coverage Check

| Spec Section | Covered by Task(s) |
|---|---|
| 3. Request lifecycle (idempotency, cache, SSE) | Task 13 (routes) |
| 4.1 JobIntelligenceReport model | Task 1 |
| 4.2 JobCache model | Task 1 |
| 4.3 SkillDemand model | Task 1 |
| 5. Package structure | Task 2 |
| 6. Job providers (Remotive, WN, Web3Career, Adzuna, stubs) | Tasks 4-5 |
| 6.3 Aggregator (parallel, dedup, cache) | Task 5 |
| 7.1 Skill extraction (batch, canon, cache) | Task 7 |
| 7.2 Demand analysis (weighted, tiers, dominance cap) | Task 8 |
| 7.3 Gap analysis (hybrid LLM + deterministic score) | Task 8 |
| 7.4 Roadmap generation (constrained, Zod) | Task 9 |
| 8. Student capability profile | Task 10 |
| 9. Pipeline orchestrator (progress, checkpoints, timeouts) | Task 11 |
| 10. API routes (analyze, get, stream, history, cancel) | Task 13 |
| 11. Worker integration | Task 14 |
| 12.1 Frontend page + components | Tasks 16-20 |
| 12.4 SSE handling (stream token, reconnect) | Task 15 |
| 12.5 Cached report handling + re-analyze | Task 20 |
| 13. Error handling | Tasks 11, 13, 14, 20 |
| 14. Performance (job/skill/report cache) | Tasks 5, 7, 13 |
| 15. Security (auth, rate limit, ownership) | Task 13 |
| 16. New env vars | Task 12, post-checklist |
| 17. Permissions | Task 12 |
