import { generateText, Output } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { PrismaClient } from '../../../database/src/generated/client';
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
