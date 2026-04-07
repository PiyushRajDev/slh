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
