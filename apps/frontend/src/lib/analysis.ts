export const ANALYSIS_STAGES = [
  "CLONING",
  "METRICS_EXTRACTING",
  "SIGNALS_DERIVING",
  "PROFILES_EVALUATING",
  "SCORING",
  "ANTI_GAMING",
  "SELECTING_PROFILE",
  "GENERATING_REPORT",
] as const;

export type AnalysisStage = (typeof ANALYSIS_STAGES)[number];
export type AnalysisFailureCode =
  | "ANALYSIS_FAILED"
  | "ANALYSIS_TIMEOUT"
  | "GITHUB_NOT_CONNECTED"
  | "GITHUB_RATE_LIMITED"
  | "INVALID_REPOSITORY_URL"
  | "PRIVATE_REPOSITORY"
  | "REPOSITORY_NOT_FOUND"
  | "REPOSITORY_OWNER_MISMATCH"
  | "STREAM_DISCONNECTED"
  | "STREAM_TIMEOUT";

export type InsightPriority = "critical" | "high" | "medium" | "low";

export interface AnalysisInsight {
  dimension: "codeQuality" | "architecture" | "testing" | "git" | "devops";
  priority: InsightPriority;
  title: string;
  description: string;
  impact: string;
}

export interface DimensionScore {
  score: number;
  max: number;
  breakdown: Record<string, number>;
}

export interface AnalysisReport {
  version: string;
  timestamp: string;
  repoUrl: string;
  summary: {
    profileId: string;
    displayName: string;
    overallScore: number;
    confidenceLevel: string;
    reliabilityLevel: string;
  };
  details: {
    dimensions: {
      overallScore: number;
      dimensions: {
        codeQuality: DimensionScore;
        architecture: DimensionScore;
        testing: DimensionScore;
        git: DimensionScore;
        devops: DimensionScore;
      };
    };
    confidence: {
      level: string;
      reason?: string;
    };
    antiGaming: {
      flagCount: number;
      flags: Array<{ reason?: string; type?: string; severity?: string }>;
      reliabilityLevel?: string;
    };
    selection: {
      fitnessScore: number;
      isAmbiguous: boolean;
      runnerUpProfileId: string | null;
      secondaryProfile: string | null;
      tierOverride: boolean;
      selectionNotes?: string[];
    };
    metrics: {
      commit_sha: string | null;
      file_count: number;
      total_loc: number;
      primary_language: string | null;
    };
  };
}

export interface AnalysisRecord {
  id: string;
  repoUrl: string;
  overallScore: number | null;
  profileId: string | null;
  confidenceLevel: string | null;
  reliabilityLevel: string | null;
  flagCount: number | null;
  analyzerVersion: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  errorMessage?: string | null;
  report?: AnalysisReport | null;
  insights?: AnalysisInsight[];
}

export interface AnalysisListResponse {
  analyses: AnalysisRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuthMeResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      collegeId: string | null;
      student: {
        id: string;
        firstName: string;
        lastName: string;
        department: string;
        githubUsername: string | null;
      } | null;
    };
  };
}

export interface AnalysisProgressEvent {
  stage: AnalysisStage;
  detail?: Record<string, unknown>;
  timestamp?: number;
}

export interface WeakProfileStep {
  dimension: AnalysisInsight["dimension"];
  label: string;
  title: string;
  description: string;
  impact: string;
}

const WEAK_PROFILE_FALLBACKS: Record<
  AnalysisInsight["dimension"],
  Omit<WeakProfileStep, "dimension">
> = {
  codeQuality: {
    label: "Code quality",
    title: "Simplify the roughest code paths",
    description:
      "Break long functions into smaller pieces and remove obviously repeated logic before the codebase gets harder to trust.",
    impact: "+2 to +4 points",
  },
  architecture: {
    label: "Architecture",
    title: "Add clearer project structure",
    description:
      "Split responsibilities into clearer folders so routes, services, components, and utilities are easier to scan.",
    impact: "+3 to +6 points",
  },
  testing: {
    label: "Testing",
    title: "Add a few meaningful tests",
    description:
      "Start with 3 to 5 tests around the main user or API path so the project proves it can protect core behavior.",
    impact: "+5 to +8 points",
  },
  git: {
    label: "Git discipline",
    title: "Show steadier git history",
    description:
      "Make smaller, more focused commits across multiple days instead of one large drop so the repo shows real iteration.",
    impact: "+2 to +4 points",
  },
  devops: {
    label: "DevOps",
    title: "Add one shipping signal",
    description:
      "A CI workflow, deploy config, or Dockerfile quickly makes the project feel more production-ready.",
    impact: "+3 to +5 points",
  },
};

export function getAnalysisFailureContent(
  code: AnalysisFailureCode | string | undefined,
  fallbackMessage?: string
) {
  switch (code) {
    case "GITHUB_NOT_CONNECTED":
      return {
        title: "Connect GitHub before analyzing",
        description:
          "SLH needs your linked GitHub account before it can verify and score repositories.",
      };
    case "REPOSITORY_OWNER_MISMATCH":
      return {
        title: "Use a repository from your linked account",
        description:
          "This URL points to a different GitHub owner than the account currently connected to SLH.",
      };
    case "PRIVATE_REPOSITORY":
      return {
        title: "Private repositories are not supported yet",
        description:
          "SLH can currently analyze only public repositories, so this one needs to be public before we can score it.",
      };
    case "REPOSITORY_NOT_FOUND":
      return {
        title: "We could not find that repository",
        description:
          "Double-check the URL and make sure the repository exists and is publicly reachable.",
      };
    case "GITHUB_RATE_LIMITED":
      return {
        title: "GitHub is throttling requests right now",
        description:
          "Your analysis did not start because GitHub rate limits are tight at the moment. Try again shortly.",
      };
    case "ANALYSIS_TIMEOUT":
      return {
        title: "This repository hit the current size limit",
        description:
          "The analysis timed out before we could finish. Smaller repositories should complete normally while we expand support for larger codebases.",
      };
    case "STREAM_TIMEOUT":
      return {
        title: "The live session expired",
        description:
          "The analysis may still finish in the background. Check the dashboard in a minute for the saved result.",
      };
    case "STREAM_DISCONNECTED":
      return {
        title: "The live stream disconnected",
        description:
          "The job may still be running even though this page lost the event stream. Check the dashboard to see whether the report finished.",
      };
    case "INVALID_REPOSITORY_URL":
      return {
        title: "Use a valid GitHub repository URL",
        description:
          "Paste a full public GitHub repository URL in the form https://github.com/owner/repo.",
      };
    default:
      return {
        title: "We could not finish this analysis",
        description:
          fallbackMessage ??
          "Something unexpected interrupted the run. Please try again.",
      };
  }
}

export function getWeakProfilePlan(
  score: number,
  report: AnalysisReport,
  insights: AnalysisInsight[]
) {
  const pointsToForty = Math.max(0, 40 - score);
  const steps: WeakProfileStep[] = [];
  const seenTitles = new Set<string>();

  insights.slice(0, 3).forEach((insight) => {
    if (seenTitles.has(insight.title)) {
      return;
    }

    seenTitles.add(insight.title);
    steps.push({
      dimension: insight.dimension,
      label:
        WEAK_PROFILE_FALLBACKS[insight.dimension]?.label ?? insight.dimension,
      title: insight.title,
      description: insight.description,
      impact: insight.impact,
    });
  });

  const fallbackDimensions = getDimensionEntries(report)
    .map(([key, , dimension]) => ({
      key,
      ratio: dimension.max === 0 ? 0 : dimension.score / dimension.max,
    }))
    .sort((a, b) => a.ratio - b.ratio);

  fallbackDimensions.forEach(({ key }) => {
    if (steps.length >= 3) {
      return;
    }

    const fallback = WEAK_PROFILE_FALLBACKS[key];
    if (!fallback || seenTitles.has(fallback.title)) {
      return;
    }

    seenTitles.add(fallback.title);
    steps.push({
      dimension: key,
      ...fallback,
    });
  });

  return {
    pointsToForty,
    steps,
  };
}

export function extractRepoSlug(repoUrl: string): string {
  const parts = repoUrl.replace(/\/$/, "").split("/");
  return parts.slice(-2).join("/") || repoUrl;
}

export function formatProfileLabel(profileId: string | null | undefined): string {
  if (!profileId) {
    return "Unknown profile";
  }

  return profileId
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatStageLabel(stage: AnalysisStage): string {
  switch (stage) {
    case "CLONING":
      return "Cloning repository";
    case "METRICS_EXTRACTING":
      return "Extracting raw metrics";
    case "SIGNALS_DERIVING":
      return "Deriving structural signals";
    case "PROFILES_EVALUATING":
      return "Evaluating architecture";
    case "SCORING":
      return "Scoring against benchmarks";
    case "ANTI_GAMING":
      return "Running anti-gaming checks";
    case "SELECTING_PROFILE":
      return "Selecting best-fit profile";
    case "GENERATING_REPORT":
      return "Generating report";
  }
}

export function getProgressPercent(stage: AnalysisStage | null): number {
  if (!stage) {
    return 0;
  }

  const index = ANALYSIS_STAGES.indexOf(stage);
  return Math.round(((index + 1) / ANALYSIS_STAGES.length) * 100);
}

export function getDimensionEntries(report: AnalysisReport) {
  return [
    ["codeQuality", "Code Quality", report.details.dimensions.dimensions.codeQuality],
    ["architecture", "Architecture", report.details.dimensions.dimensions.architecture],
    ["testing", "Testing", report.details.dimensions.dimensions.testing],
    ["git", "Git Discipline", report.details.dimensions.dimensions.git],
    ["devops", "DevOps", report.details.dimensions.dimensions.devops],
  ] as const;
}

export function getScoreTone(score: number | null | undefined): "strong" | "steady" | "weak" {
  if ((score ?? 0) >= 70) {
    return "strong";
  }

  if ((score ?? 0) >= 40) {
    return "steady";
  }

  return "weak";
}

export function getGrowthDelta(current: AnalysisRecord, previous?: AnalysisRecord) {
  if (
    current.overallScore == null ||
    !previous ||
    previous.overallScore == null
  ) {
    return null;
  }

  return current.overallScore - previous.overallScore;
}
