export type MarketFitJobListingInput = {
    source?: string;
    externalId?: string;
    sourceUrl?: string;
    companyName?: string;
    title?: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    description: string;
    postedAt?: string;
};

export type MarketFitAnalyzeInput = {
    role: string;
    seniority: string;
    salaryRange?: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    sampleSize?: number;
    forceRefresh?: boolean;
    userId?: string;
    studentId?: string;
    jobListings?: MarketFitJobListingInput[];
};

export type NormalizedJobListing = {
    source: string;
    externalId?: string;
    sourceUrl?: string;
    companyName?: string;
    title: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    descriptionRaw: string;
    descriptionNormalized: string;
    sourceHash: string;
    normalizedHash: string;
    postedAt?: Date;
};

export type ExtractedCapability = {
    slug: string;
    name: string;
    category: string;
    importance: number;
    confidence: number;
    evidence: string[];
};

export type CapabilityDemandSummary = {
    capabilityId: string;
    capabilitySlug: string;
    capabilityName: string;
    category: string;
    demandScore: number;
    averageImportance: number;
    frequency: number;
    evidence: string[];
    sourceExamples: string[];
    listingCount: number;
};

export type MarketSignalItem = {
    capabilitySlug: string;
    capabilityName: string;
    category: string;
    demandScore: number;
    averageImportance: number;
    frequency: number;
    listingCount: number;
    sourceExamples: string[];
};

export type MarketBaselineFreshness = "live" | "recent_cache";

export type UserCapabilitySummary = {
    capabilityId: string;
    capabilitySlug: string;
    capabilityName: string;
    category: string;
    score: number;
    confidence: number;
    evidence: string[];
    sources: string[];
};

export type CapabilityGapItem = {
    capabilityId: string;
    capabilitySlug: string;
    capabilityName: string;
    category: string;
    demandScore: number;
    userScore: number;
    gapScore: number;
    evidence: string[];
};

export type MarketFitActionItem = {
    gap: string;
    recommendation: string;
    projectSuggestion: string;
};

export type MarketFitReportPayload = {
    baselineRole: string;
    baselineSeniority: string;
    sampleSize: number;
    generatedAt: string;
    dataFreshness: MarketBaselineFreshness;
    topMarketSignals: MarketSignalItem[];
    readinessScore: number;
    verdict: "Not Ready" | "Ready" | "Competitive";
    matchedCapabilities: CapabilityGapItem[];
    missingCapabilities: CapabilityGapItem[];
    partialCapabilities: CapabilityGapItem[];
    actionPlan: MarketFitActionItem[];
};

export type CapabilityLibraryEntry = {
    slug: string;
    name: string;
    category: string;
    description: string;
    keywords: string[];
    recommendation: string;
    projectSuggestion: string;
};
