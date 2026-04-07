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
