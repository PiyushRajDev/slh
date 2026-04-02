import type { PrismaClient } from "../../database/src/generated/client";

export type StructuredAiRequest = {
    systemPrompt: string;
    userPrompt: string;
    schemaHint: string;
    temperature?: number;
    maxTokens?: number;
};

export interface StructuredAiClient {
    isEnabled(): boolean;
    generateStructuredObject<T>(request: StructuredAiRequest): Promise<T>;
}

type MarketFitRuntime = {
    prisma: PrismaClient;
    aiService: StructuredAiClient;
};

let runtime: MarketFitRuntime | null = null;

export function configureMarketFitCore(nextRuntime: MarketFitRuntime): void {
    runtime = nextRuntime;
}

export function getMarketFitCoreRuntime(): MarketFitRuntime {
    if (!runtime) {
        throw new Error("Market Fit core runtime has not been configured");
    }

    return runtime;
}
