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
