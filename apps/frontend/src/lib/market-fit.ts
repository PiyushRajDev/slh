export type MarketFitVerdict = "Not Ready" | "Ready" | "Competitive";
export type MarketFitFreshness = "live" | "recent_cache";

export interface MarketFitRequest {
  role: string;
  seniority: string;
  salaryRange: string;
}

export interface MarketFitCapabilityItem {
  title: string;
  description: string;
}

export interface MarketFitSignalItem {
  title: string;
  description: string;
  demandScore: number;
  frequency: number;
  listingCount: number;
}

export interface MarketFitActionItem {
  gap: string;
  recommendation: string;
  projectSuggestion: string;
}

export interface MarketFitReport {
  baselineRole: string;
  baselineSeniority: string;
  sampleSize: number;
  generatedAt: string;
  dataFreshness: MarketFitFreshness;
  topMarketSignals: MarketFitSignalItem[];
  readinessScore: number;
  verdict: MarketFitVerdict;
  matchedCapabilities: MarketFitCapabilityItem[];
  partialCapabilities: MarketFitCapabilityItem[];
  missingCapabilities: MarketFitCapabilityItem[];
  actionPlan: MarketFitActionItem[];
}

export interface MarketFitAnalyzeResponse {
  message: string;
  jobId: string;
}

export interface MarketFitStatusResponse {
  jobId: string;
  state: string;
  progress: {
    stage?: string;
    reportId?: string;
    jobCount?: number;
  } | null;
  failedReason: string | null;
  reportId: string | null;
  completedAt: string | null;
  returnvalue:
    | {
        reportId?: string;
        readinessScore?: number;
        verdict?: string;
        dataFreshness?: MarketFitFreshness;
      }
    | null;
}

export interface MarketFitReportResponse extends MarketFitReport {
  reportId: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  roleSlug: string;
  roleTitle: string;
  seniority: string | null;
  location: string | null;
}

type RawCapability =
  | string
  | {
      capabilityName?: string;
      title?: string;
      category?: string;
      evidence?: string[];
      description?: string;
      gapScore?: number;
      demandScore?: number;
      userScore?: number;
    };

type RawMarketSignal =
  | string
  | {
      capabilityName?: string;
      title?: string;
      category?: string;
      demandScore?: number;
      frequency?: number;
      listingCount?: number;
      sourceExamples?: string[];
    };

const DEFAULT_CAPABILITY_DESCRIPTION =
  "This capability shows up repeatedly in the market baseline and needs stronger direct proof in your portfolio.";

export const MARKET_FIT_ROLE_OPTIONS = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Platform Engineer",
  "Data Engineer",
] as const;

export const MARKET_FIT_EXPERIENCE_OPTIONS = [
  "Fresher",
  "0-1 years",
  "1-3 years",
  "3-5 years",
] as const;

export const MARKET_FIT_SALARY_OPTIONS = [
  "4-8 LPA",
  "8-12 LPA",
  "12-20 LPA",
  "20+ LPA",
] as const;

export function normalizeMarketFitCapability(item: RawCapability): MarketFitCapabilityItem {
  if (typeof item === "string") {
    return {
      title: item,
      description: DEFAULT_CAPABILITY_DESCRIPTION,
    };
  }

  const title = item.capabilityName ?? item.title ?? "Unknown capability";
  const evidenceLine = item.evidence?.find(Boolean);
  const scoreLine =
    typeof item.userScore === "number" && typeof item.demandScore === "number"
      ? `Your evidence is ${Math.round(item.userScore * 100)}/100 against a market expectation of ${Math.round(item.demandScore * 100)}/100.`
      : null;

  return {
    title,
    description:
      item.description ??
      evidenceLine ??
      scoreLine ??
      (item.category
        ? `${item.category} capability that appears repeatedly in the target-role market baseline.`
        : DEFAULT_CAPABILITY_DESCRIPTION),
  };
}

function normalizeMarketSignal(item: RawMarketSignal): MarketFitSignalItem | null {
  if (typeof item === "string") {
    return {
      title: item,
      description: "Recurring signal in the current role baseline.",
      demandScore: 0,
      frequency: 0,
      listingCount: 0,
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const title = item.capabilityName ?? item.title;
  if (typeof title !== "string" || !title.trim()) {
    return null;
  }

  const sourceLine = Array.isArray(item.sourceExamples) ? item.sourceExamples.find(Boolean) : null;
  const listingCount = Number.isFinite(Number(item.listingCount)) ? Math.max(0, Math.round(Number(item.listingCount))) : 0;
  const frequency = Number.isFinite(Number(item.frequency)) ? Math.max(0, Math.min(1, Number(item.frequency))) : 0;
  const demandScore = Number.isFinite(Number(item.demandScore)) ? Math.max(0, Math.min(1, Number(item.demandScore))) : 0;

  return {
    title: title.trim(),
    description:
      sourceLine ??
      (listingCount > 0
        ? `Observed across ${listingCount} listings in the current market baseline.`
        : "Recurring signal in the current role baseline."),
    demandScore,
    frequency,
    listingCount,
  };
}

export function normalizeMarketFitReport(raw: unknown): MarketFitReport | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const payload = raw as Record<string, unknown>;
  const readinessScore = Number(payload.readinessScore);
  const verdict = payload.verdict;
  const baselineRole =
    typeof payload.baselineRole === "string"
      ? payload.baselineRole
      : typeof payload.roleTitle === "string"
        ? payload.roleTitle
        : null;
  const baselineSeniority =
    typeof payload.baselineSeniority === "string"
      ? payload.baselineSeniority
      : typeof payload.seniority === "string"
        ? payload.seniority
        : null;
  const generatedAt =
    typeof payload.generatedAt === "string"
      ? payload.generatedAt
      : typeof payload.completedAt === "string"
        ? payload.completedAt
        : typeof payload.createdAt === "string"
          ? payload.createdAt
          : null;
  const dataFreshness = payload.dataFreshness;

  if (
    !Number.isFinite(readinessScore) ||
    typeof verdict !== "string" ||
    !baselineRole ||
    !baselineSeniority ||
    !generatedAt ||
    (dataFreshness !== "live" && dataFreshness !== "recent_cache")
  ) {
    return null;
  }

  return {
    baselineRole,
    baselineSeniority,
    sampleSize: Number.isFinite(Number(payload.sampleSize)) ? Math.max(0, Math.round(Number(payload.sampleSize))) : 0,
    generatedAt,
    dataFreshness,
    topMarketSignals: Array.isArray(payload.topMarketSignals)
      ? payload.topMarketSignals
          .map((item) => normalizeMarketSignal(item as RawMarketSignal))
          .filter((item): item is MarketFitSignalItem => item !== null)
      : [],
    readinessScore: Math.max(0, Math.min(100, Math.round(readinessScore))),
    verdict: verdict as MarketFitVerdict,
    matchedCapabilities: Array.isArray(payload.matchedCapabilities)
      ? payload.matchedCapabilities.map((item) => normalizeMarketFitCapability(item as RawCapability))
      : [],
    partialCapabilities: Array.isArray(payload.partialCapabilities)
      ? payload.partialCapabilities.map((item) => normalizeMarketFitCapability(item as RawCapability))
      : [],
    missingCapabilities: Array.isArray(payload.missingCapabilities)
      ? payload.missingCapabilities.map((item) => normalizeMarketFitCapability(item as RawCapability))
      : [],
    actionPlan: Array.isArray(payload.actionPlan)
      ? payload.actionPlan
          .map((item) => {
            if (!item || typeof item !== "object") {
              return null;
            }

            const record = item as Record<string, unknown>;
            if (
              typeof record.gap !== "string" ||
              typeof record.recommendation !== "string" ||
              typeof record.projectSuggestion !== "string"
            ) {
              return null;
            }

            return {
              gap: record.gap,
              recommendation: record.recommendation,
              projectSuggestion: record.projectSuggestion,
            };
          })
          .filter((item): item is MarketFitActionItem => item !== null)
      : [],
  };
}

export function getMarketFitScoreTone(verdict: MarketFitVerdict) {
  switch (verdict) {
    case "Competitive":
      return "text-emerald-300";
    case "Ready":
      return "text-blue-300";
    default:
      return "text-amber-300";
  }
}

export function getMarketFitVerdictCopy(verdict: MarketFitVerdict) {
  switch (verdict) {
    case "Competitive":
      return "Your proven evidence is already aligning with the stronger end of the current market baseline.";
    case "Ready":
      return "You are within reach of the target role, but a few proof gaps still weaken your market readiness.";
    default:
      return "The foundation is visible, but the current market baseline still expects stronger system-level proof.";
  }
}

export function getMarketFitFreshnessLabel(freshness: MarketFitFreshness) {
  return freshness === "recent_cache" ? "Recent cached baseline" : "Fresh market baseline";
}

export function getMarketFitProgress(status: MarketFitStatusResponse | null) {
  if (!status) {
    return 0;
  }

  const stage = status.progress?.stage;
  if (status.state === "completed") return 100;
  if (status.state === "failed") return 100;
  if (stage === "WAITING_FOR_DEPENDENCIES") return 12;
  if (stage === "INGESTING_JOB_LISTINGS") return 22;
  if (stage === "USING_RECENT_BASELINE") return 46;
  if (stage === "EXTRACTING_JOB_CAPABILITIES") return 58;
  if (stage === "BUILDING_USER_CAPABILITY_PROFILE") return 74;
  if (stage === "RUNNING_GAP_ANALYSIS") return 88;
  if (stage === "COMPLETED") return 100;
  if (status.state === "waiting" || status.state === "delayed") return 18;
  if (status.state === "active") return 40;
  return 12;
}

export function getMarketFitStatusLabel(status: MarketFitStatusResponse | null) {
  const stage = status?.progress?.stage;
  if (stage === "WAITING_FOR_DEPENDENCIES") return "Waiting for market inputs";
  if (stage === "INGESTING_JOB_LISTINGS") return "Collecting recent market listings";
  if (stage === "USING_RECENT_BASELINE") return "Using a recent cached market baseline";
  if (stage === "EXTRACTING_JOB_CAPABILITIES") return "Building the role baseline";
  if (stage === "BUILDING_USER_CAPABILITY_PROFILE") return "Collecting your proof signals";
  if (stage === "RUNNING_GAP_ANALYSIS") return "Comparing your proof to the market";
  if (stage === "COMPLETED" || status?.state === "completed") return "Market baseline ready";
  if (status?.state === "failed") return "Market baseline failed";
  if (status?.state === "active") return "Analyzer running";
  if (status?.state === "waiting" || status?.state === "delayed") return "Queued for processing";
  return "Preparing analysis";
}
