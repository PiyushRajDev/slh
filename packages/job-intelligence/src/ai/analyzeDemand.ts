import type { PrismaClient } from '../../../database/src/generated/client';
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
