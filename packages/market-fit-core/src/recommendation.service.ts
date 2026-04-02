import { capabilityCatalogService } from "./capabilityCatalog.service";
import { CapabilityGapItem, MarketFitActionItem } from "./types";

export const recommendationService = {
    async buildActionPlan(input: {
        missingCapabilities: CapabilityGapItem[];
        partialCapabilities: CapabilityGapItem[];
    }): Promise<MarketFitActionItem[]> {
        const priorityGaps = [...input.missingCapabilities, ...input.partialCapabilities]
            .sort((a, b) => b.gapScore - a.gapScore)
            .slice(0, 5);

        const entryMap = await capabilityCatalogService.getEntryMapBySlug(priorityGaps.map((gap) => gap.capabilitySlug));

        return priorityGaps.map((gap) => {
            const entry = entryMap.get(gap.capabilitySlug);
            return {
                gap: gap.capabilityName,
                recommendation: entry?.recommendation ?? `Build direct evidence for ${gap.capabilityName} through a production-style project and measurable commits.`,
                projectSuggestion: entry?.projectSuggestion ?? `Create a focused project that demonstrates ${gap.capabilityName} with clear documentation and verification.`
            };
        });
    }
};
