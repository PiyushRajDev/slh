import type { PrismaClient } from '../../../database/src/generated/client';
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
