import { z } from 'zod';

export const ExtractedSkillSchema = z.object({
  name: z.string(),
  category: z.enum(['language', 'framework', 'tool', 'concept']),
  required: z.boolean(),
});

export const ExtractedSkillsSchema = z.object({
  skills: z.array(ExtractedSkillSchema).max(25),
});

export const FuzzyMatchSchema = z.object({
  matches: z.array(z.object({
    marketSkill: z.string(),
    studentMatch: z.enum(['matched', 'partial', 'missing']),
    confidence: z.enum(['high', 'medium', 'low']),
    rationale: z.string(),
  })),
});

export const RoadmapSchema = z.object({
  phases: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    skills: z.array(z.string()).min(2).max(4),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    })).min(1).max(3),
    resources: z.array(z.object({
      title: z.string(),
      type: z.enum(['course', 'tutorial', 'documentation', 'practice']),
    })).min(1).max(4),
    outcome: z.string(),
  })).min(2).max(6),
  estimatedTotalDuration: z.string(),
  priorityOrder: z.array(z.string()),
});

export type ExtractedSkillsOutput = z.infer<typeof ExtractedSkillsSchema>;
export type FuzzyMatchOutput = z.infer<typeof FuzzyMatchSchema>;
export type RoadmapOutput = z.infer<typeof RoadmapSchema>;
