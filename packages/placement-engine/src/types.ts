export interface ExtractedSkills {
  skills: string[];          // normalized, lowercase, deduplicated raw strings
  capabilitySlugs: string[]; // matched Capability.slug values from catalog
}

export interface MatchedSkill {
  slug: string;
  name: string;
  category: string;
  userScore: number;
  demandScore: number;
}

export interface MissingSkill {
  slug: string;
  name: string;
  category: string;
  demandScore: number;
  gapScore: number;
}

export interface LearningPath {
  slug: string;
  name: string;
  category: string;
  recommendation: string | null;
  projectSuggestion: string | null;
  estimatedWeeks: number;
}

export interface JobMatchReport {
  matchScore: number;                // 0–100
  verdict: "Competitive" | "Ready" | "Not Ready";
  matchedSkills: MatchedSkill[];
  partialSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  learningPaths: LearningPath[];
}

export interface StudentCapabilityInput {
  capabilityId: string;
  capabilitySlug: string;
  score: number;
  confidence: number;
}

export interface JobDemandInput {
  capabilityId: string;
  capabilitySlug: string;
  capabilityName: string;
  category: string;
  demandScore: number;
  recommendation: string | null;
  projectSuggestion: string | null;
}
