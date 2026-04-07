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
