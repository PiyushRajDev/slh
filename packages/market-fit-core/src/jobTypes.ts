import { MarketFitAnalyzeInput } from "./types";

export const MARKET_FIT_ANALYSIS_VERSION = "1.0.0";

export type ParseMarketJobsJobData = {
    studentId: string;
    requestedByUserId: string;
    input: MarketFitAnalyzeInput;
};

export type ExtractUserCapabilitiesJobData = {
    studentId: string;
    forceRefresh?: boolean;
};

export type GenerateMarketFitReportJobData = {
    studentId: string;
    requestedByUserId: string;
    input: MarketFitAnalyzeInput;
    analysisVersion: string;
};
