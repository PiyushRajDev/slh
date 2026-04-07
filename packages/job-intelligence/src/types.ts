export interface JobFilters {
  role: string;
  experience: string;
  salary: string;
}

export interface NormalizedJob {
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  description: string;
  salary: string | null;
  experience: string | null;
  source: string;
  postedAt: Date | null;
}

export interface JobProvider {
  name: string;
  fetch(filters: JobFilters): Promise<NormalizedJob[]>;
}

export interface ExtractedSkill {
  name: string;
  category: 'language' | 'framework' | 'tool' | 'concept';
  required: boolean;
}

export interface AnnotatedJob extends NormalizedJob {
  extractedSkills: ExtractedSkill[];
}

export interface SkillDemandItem {
  name: string;
  category: string;
  frequency: number;
  frequencyPercent: number;
  weightedFrequency: number;
  demandTier: 'critical' | 'high' | 'medium' | 'low';
  sources: string[];
}

export interface SkillMatch {
  skill: string;
  demandTier: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: {
    projects: number;
    repos: number;
    lastUsed: string | null;
    source: string[];
  };
}

export interface GapReport {
  readinessScore: number;
  matched: SkillMatch[];
  partial: SkillMatch[];
  missing: SkillMatch[];
}

export interface RoadmapPhase {
  title: string;
  duration: string;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  resources: Array<{
    title: string;
    type: 'course' | 'tutorial' | 'documentation' | 'practice';
  }>;
  outcome: string;
}

export interface Roadmap {
  phases: RoadmapPhase[];
  estimatedTotalDuration: string;
  priorityOrder: string[];
}

export interface StudentCapabilityProfile {
  skills: Array<{
    name: string;
    level: number; // 0=none, 1=beginner, 2=intermediate, 3=advanced
    evidence: {
      projects: number;
      repos: number;
      lastUsed: string | null;
      source: string[];
    };
  }>;
  dsaLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
  overallJri: number | null;
}

export interface JobIntelligenceResult {
  jobs: AnnotatedJob[];
  skillsAnalysis: SkillDemandItem[];
  gapAnalysis: GapReport;
  roadmap: Roadmap;
}
