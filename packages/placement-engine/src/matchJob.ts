import { gapAnalysisService } from "@slh/market-fit-core";
import {
  JobDemandInput,
  JobMatchReport,
  LearningPath,
  MatchedSkill,
  MissingSkill,
  StudentCapabilityInput,
} from "./types";
import { buildLearningPaths } from "./learningPaths";

/**
 * Matches a student's capability profile against a job's capability demands.
 * Delegates scoring to gapAnalysisService from market-fit-core (deterministic).
 */
export function matchJobToStudent(
  jobDemand: JobDemandInput[],
  studentCapabilities: StudentCapabilityInput[]
): JobMatchReport {
  if (jobDemand.length === 0) {
    return {
      matchScore: 0,
      verdict: "Not Ready",
      matchedSkills: [],
      partialSkills: [],
      missingSkills: [],
      learningPaths: [],
    };
  }

  const demandInput = jobDemand.map((d) => ({
    capabilityId: d.capabilityId,
    capabilitySlug: d.capabilitySlug,
    capabilityName: d.capabilityName,
    category: d.category,
    demandScore: d.demandScore,
    averageImportance: d.demandScore,
    frequency: 1,
    sourceExamples: [],
    listingCount: 1,
    evidence: [],
  }));

  const userInput = studentCapabilities.map((c) => ({
    capabilityId: c.capabilityId,
    capabilitySlug: c.capabilitySlug,
    capabilityName: c.capabilitySlug,
    category: "general",
    score: c.score,
    confidence: c.confidence,
    evidence: [],
    sources: [],
  }));

  const result = gapAnalysisService.analyze({
    demand: demandInput,
    userCapabilities: userInput,
  });

  const matchedSkills: MatchedSkill[] = result.matchedCapabilities.map((c) => ({
    slug: c.capabilitySlug,
    name: c.capabilityName,
    category: c.category,
    userScore: c.userScore,
    demandScore: c.demandScore,
  }));

  const partialSkills: MatchedSkill[] = result.partialCapabilities.map((c) => ({
    slug: c.capabilitySlug,
    name: c.capabilityName,
    category: c.category,
    userScore: c.userScore,
    demandScore: c.demandScore,
  }));

  const missingSkills: MissingSkill[] = result.missingCapabilities.map((c) => ({
    slug: c.capabilitySlug,
    name: c.capabilityName,
    category: c.category,
    demandScore: c.demandScore,
    gapScore: c.gapScore,
  }));

  const missingDemand = jobDemand.filter((d) =>
    result.missingCapabilities.some((m) => m.capabilityId === d.capabilityId)
  );

  const learningPaths: LearningPath[] = buildLearningPaths(missingDemand);

  const verdict =
    result.readinessScore >= 75
      ? "Competitive"
      : result.readinessScore >= 50
        ? "Ready"
        : "Not Ready";

  return {
    matchScore: result.readinessScore,
    verdict,
    matchedSkills,
    partialSkills,
    missingSkills,
    learningPaths,
  };
}

/**
 * Computes a quick match score (0–100) without the full report.
 * Used for bulk job listing (avoid N+1 full reports).
 */
export function computeQuickMatchScore(
  jobCapabilitySlugs: string[],
  studentSlugs: Set<string>
): number {
  if (jobCapabilitySlugs.length === 0) return 0;
  const matched = jobCapabilitySlugs.filter((slug) => studentSlugs.has(slug)).length;
  return Math.round((matched / jobCapabilitySlugs.length) * 100);
}
