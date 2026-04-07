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
