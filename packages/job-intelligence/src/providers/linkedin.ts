import type { JobFilters, JobProvider, NormalizedJob } from '../types';

export class LinkedInProvider implements JobProvider {
  readonly name = 'linkedin';

  async fetch(_filters: JobFilters): Promise<NormalizedJob[]> {
    console.warn('[LinkedIn] Provider is a stub — requires official API partnership');
    return [];
  }
}
