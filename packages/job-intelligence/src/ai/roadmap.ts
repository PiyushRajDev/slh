import { generateText, Output } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { SkillMatch, Roadmap } from '../types';
import { RoadmapSchema } from './schemas';

function getModel() {
  const modelId = process.env.AI_MODEL_ID ?? 'claude-haiku-4-5-20251001';
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic(modelId);
}

export async function generateRoadmap(
  missing: SkillMatch[],
  partial: SkillMatch[],
  role: string
): Promise<Roadmap> {
  if (missing.length === 0 && partial.length === 0) {
    return {
      phases: [{
        title: 'Deepen Existing Skills',
        duration: '1-2 months',
        skills: [],
        projects: [{ name: 'Open Source Contribution', description: 'Contribute to a relevant open source project', difficulty: 'intermediate' }],
        resources: [{ title: 'Advanced system design resources', type: 'documentation' }],
        outcome: 'Portfolio strengthened with real-world contributions',
      }],
      estimatedTotalDuration: '1-2 months',
      priorityOrder: [],
    };
  }

  // Sort by demand tier for priority ordering
  const tierOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const prioritized = [
    ...missing.sort((a, b) => tierOrder[a.demandTier as keyof typeof tierOrder] - tierOrder[b.demandTier as keyof typeof tierOrder]),
    ...partial.sort((a, b) => tierOrder[a.demandTier as keyof typeof tierOrder] - tierOrder[b.demandTier as keyof typeof tierOrder]),
  ];

  const priorityText = prioritized.slice(0, 15).map((s, i) =>
    `${i + 1}. ${s.skill} [${s.demandTier}${partial.find(p => p.skill === s.skill) ? ', partial' : ', missing'}]`
  ).join('\n');

  const prompt = [
    `Create a learning roadmap for a developer targeting: ${role}`,
    '',
    'Priority skills to learn (ordered by market demand):',
    priorityText,
    '',
    'Rules:',
    '- 2-6 phases, each 2-4 skills that can be learned together',
    '- Each phase has 1-3 projects that combine multiple skills from that phase',
    '- Projects should be concrete and buildable (e.g. "Build a REST API with Node.js + PostgreSQL")',
    '- Resources are titles only (no URLs) — just the type: course, tutorial, documentation, or practice',
    '- Each phase ends with a clear outcome statement',
    '- priorityOrder lists skills in the order a student should learn them',
    '- estimatedTotalDuration is the total calendar time for all phases',
    '- Start with the highest-demand missing skills',
  ].join('\n');

  const model = getModel();
  const result = await generateText({
    model,
    output: Output.object({ schema: RoadmapSchema }),
    prompt,
    maxRetries: 1,
  });

  return result.output;
}
