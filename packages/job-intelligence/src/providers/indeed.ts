import type { JobFilters, JobProvider, NormalizedJob } from '../types';

export class IndeedProvider implements JobProvider {
  readonly name = 'indeed';

  async fetch(_filters: JobFilters): Promise<NormalizedJob[]> {
    console.warn('[Indeed] Provider is a stub — requires publisher partnership');
    return [];
  }
}
