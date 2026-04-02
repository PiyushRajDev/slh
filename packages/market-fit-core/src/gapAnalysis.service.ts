import { CapabilityGapItem, CapabilityDemandSummary, MarketFitReportPayload, UserCapabilitySummary } from "./types";
import { clamp, round } from "./utils";

type GapComputation = CapabilityGapItem & {
    matchStatus: "MATCHED" | "PARTIAL" | "MISSING";
};

type GapAnalysisOutput = Omit<
    MarketFitReportPayload,
    "baselineRole" | "baselineSeniority" | "sampleSize" | "generatedAt" | "dataFreshness" | "topMarketSignals"
>;

function classifyGap(demandScore: number, userScore: number): GapComputation["matchStatus"] {
    if (userScore >= Math.max(0.55, demandScore * 0.85)) {
        return "MATCHED";
    }

    if (userScore >= Math.max(0.25, demandScore * 0.35)) {
        return "PARTIAL";
    }

    return "MISSING";
}

export const gapAnalysisService = {
    analyze(input: {
        demand: CapabilityDemandSummary[];
        userCapabilities: UserCapabilitySummary[];
    }): GapAnalysisOutput & { capabilityRows: GapComputation[] } {
        const userByCapability = new Map(input.userCapabilities.map((item) => [item.capabilityId, item]));
        const rows: GapComputation[] = [];

        let weightedScore = 0;
        let totalWeight = 0;

        for (const demand of input.demand) {
            const user = userByCapability.get(demand.capabilityId);
            const userScore = user?.score ?? 0;
            const gapScore = clamp(demand.demandScore - userScore);
            const weight = Math.max(0.1, demand.demandScore);
            const coverage = demand.demandScore <= 0 ? 1 : clamp(userScore / demand.demandScore);

            weightedScore += coverage * weight;
            totalWeight += weight;

            rows.push({
                capabilityId: demand.capabilityId,
                capabilitySlug: demand.capabilitySlug,
                capabilityName: demand.capabilityName,
                category: demand.category,
                demandScore: round(demand.demandScore),
                userScore: round(userScore),
                gapScore: round(gapScore),
                evidence: Array.from(new Set([...(demand.evidence ?? []), ...(user?.evidence ?? [])])).slice(0, 5),
                matchStatus: classifyGap(demand.demandScore, userScore)
            });
        }

        const readinessScore = Math.round((totalWeight === 0 ? 0 : (weightedScore / totalWeight) * 100));
        const verdict: MarketFitReportPayload["verdict"] = readinessScore >= 75
            ? "Competitive"
            : readinessScore >= 50
                ? "Ready"
                : "Not Ready";

        const matchedCapabilities = rows.filter((row) => row.matchStatus === "MATCHED").sort((a, b) => b.userScore - a.userScore);
        const partialCapabilities = rows.filter((row) => row.matchStatus === "PARTIAL").sort((a, b) => b.gapScore - a.gapScore);
        const missingCapabilities = rows.filter((row) => row.matchStatus === "MISSING").sort((a, b) => b.demandScore - a.demandScore);

        return {
            readinessScore,
            verdict,
            matchedCapabilities,
            partialCapabilities,
            missingCapabilities,
            actionPlan: [],
            capabilityRows: rows
        };
    }
};
