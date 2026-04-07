import { JobDemandInput, LearningPath } from "./types";

/**
 * Category → estimated weeks to learn.
 * Deterministic lookup; no AI involved.
 */
const TIMELINE_BY_CATEGORY: Record<string, number> = {
  dsa: 8,
  algorithms: 8,
  "data structures": 6,
  database: 4,
  backend: 5,
  frontend: 4,
  devops: 5,
  cloud: 5,
  "system design": 8,
  testing: 3,
  language: 6,
  framework: 4,
  tool: 2,
  "soft skills": 12,
  default: 4,
};

function getEstimatedWeeks(category: string): number {
  const key = category.toLowerCase();
  return TIMELINE_BY_CATEGORY[key] ?? TIMELINE_BY_CATEGORY["default"];
}

/**
 * Generates learning path entries for missing skills.
 * Uses the Capability.recommendation and Capability.projectSuggestion
 * fields already stored in the DB (fetched via JobDemandInput).
 */
export function buildLearningPaths(missingDemand: JobDemandInput[]): LearningPath[] {
  return missingDemand
    .sort((a, b) => b.demandScore - a.demandScore)
    .map((d) => ({
      slug: d.capabilitySlug,
      name: d.capabilityName,
      category: d.category,
      recommendation: d.recommendation,
      projectSuggestion: d.projectSuggestion,
      estimatedWeeks: getEstimatedWeeks(d.category),
    }));
}
