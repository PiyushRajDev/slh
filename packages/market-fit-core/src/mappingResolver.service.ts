import { getMarketFitCoreRuntime } from "./runtime";
import { clamp, normalizeText, uniqueStrings } from "./utils";

export type CapabilityContributionSource = "PROJECT_ANALYSIS" | "GITHUB_PROFILE" | "DSA_PROFILE" | "JRI_PROFILE";

export type CapabilityContribution = {
    slug: string;
    name: string;
    category: string;
    sourceType: CapabilityContributionSource;
    score: number;
    confidence: number;
    evidence: string[];
};

const DIMENSION_MAX = {
    codeQuality: 25,
    architecture: 20,
    testing: 25,
    git: 20,
    devops: 10
} as const;

type LoadedMapping = {
    sourceType: string;
    matcherType: string;
    matcherKey: string;
    matcherValue: string | null;
    baseScore: number;
    scoreMultiplier: number | null;
    confidence: number;
    minThreshold: number | null;
    profileIds: unknown;
    evidenceTemplate: string | null;
    capability: {
        slug: string;
        name: string;
        category: string;
    };
};

function applyMappingScore(mapping: LoadedMapping, sourceValue: number): number {
    return clamp(mapping.baseScore + sourceValue * (mapping.scoreMultiplier ?? 0));
}

function buildEvidence(mapping: LoadedMapping, fallbackEvidence: string[]): string[] {
    return uniqueStrings([
        mapping.evidenceTemplate ?? "",
        ...fallbackEvidence
    ].filter((value) => value.trim().length > 0)).slice(0, 4);
}

function allowsProfile(mapping: LoadedMapping, profileId: string | null | undefined): boolean {
    if (!Array.isArray(mapping.profileIds) || mapping.profileIds.length === 0) {
        return true;
    }

    if (!profileId) {
        return false;
    }

    return mapping.profileIds.some((value) => typeof value === "string" && value === profileId);
}

function pushContribution(target: CapabilityContribution[], mapping: LoadedMapping, sourceType: CapabilityContributionSource, score: number, evidence: string[]): void {
    target.push({
        slug: mapping.capability.slug,
        name: mapping.capability.name,
        category: mapping.capability.category,
        sourceType,
        score: clamp(score),
        confidence: clamp(mapping.confidence),
        evidence: buildEvidence(mapping, evidence)
    });
}

function matchesTermMapping(mapping: LoadedMapping, terms: string[]): boolean {
    const matcher = normalizeText(mapping.matcherKey);
    if (matcher.length === 0) {
        return false;
    }

    return terms.some((term) => {
        if (mapping.matcherType === "EXACT") {
            return term === matcher;
        }

        return term.includes(matcher) || matcher.includes(term);
    });
}

async function loadMappings(sourceType: LoadedMapping["sourceType"]): Promise<LoadedMapping[]> {
    const { prisma } = getMarketFitCoreRuntime();
    return prisma.signalMapping.findMany({
        where: {
            sourceType: sourceType as any,
            isActive: true
        },
        include: {
            capability: {
                select: {
                    slug: true,
                    name: true,
                    category: true
                }
            }
        },
        orderBy: [{ matcherKey: "asc" }]
    }) as Promise<LoadedMapping[]>;
}

export const mappingResolverService = {
    async resolveProjectAnalysisContributions(input: {
        profileId?: string | null;
        repoUrl: string;
        overall: number;
        signals: Record<string, unknown>;
        dimensions: Record<string, { score?: number } | undefined>;
        metricTerms: string[];
    }): Promise<CapabilityContribution[]> {
        const contributions: CapabilityContribution[] = [];
        const [profileMappings, signalMappings, dimensionMappings, termMappings] = await Promise.all([
            loadMappings("PROJECT_PROFILE"),
            loadMappings("PROJECT_SIGNAL"),
            loadMappings("PROJECT_DIMENSION"),
            loadMappings("PROJECT_TERM")
        ]);

        for (const mapping of profileMappings) {
            if (!allowsProfile(mapping, input.profileId)) {
                continue;
            }

            if (mapping.matcherType === "EXACT" && input.profileId === mapping.matcherKey) {
                pushContribution(
                    contributions,
                    mapping,
                    "PROJECT_ANALYSIS",
                    applyMappingScore(mapping, input.overall),
                    [input.repoUrl]
                );
            }
        }

        for (const mapping of signalMappings) {
            if (!allowsProfile(mapping, input.profileId)) {
                continue;
            }

            if (mapping.matcherType === "BOOLEAN_TRUE" && Boolean(input.signals[mapping.matcherKey])) {
                pushContribution(
                    contributions,
                    mapping,
                    "PROJECT_ANALYSIS",
                    applyMappingScore(mapping, input.overall),
                    [input.repoUrl]
                );
            }
        }

        for (const mapping of dimensionMappings) {
            const dimensionKey = mapping.matcherKey as keyof typeof DIMENSION_MAX;
            const maxValue = DIMENSION_MAX[dimensionKey];
            if (!maxValue) {
                continue;
            }

            const normalizedValue = Number(input.dimensions[dimensionKey]?.score ?? 0) / maxValue;
            if (normalizedValue <= (mapping.minThreshold ?? 0)) {
                continue;
            }

            pushContribution(
                contributions,
                mapping,
                "PROJECT_ANALYSIS",
                applyMappingScore(mapping, normalizedValue),
                [input.repoUrl]
            );
        }

        const normalizedTerms = input.metricTerms.map((term) => normalizeText(term));
        for (const mapping of termMappings) {
            if (!matchesTermMapping(mapping, normalizedTerms)) {
                continue;
            }

            pushContribution(
                contributions,
                mapping,
                "PROJECT_ANALYSIS",
                applyMappingScore(mapping, input.overall),
                [input.repoUrl]
            );
        }

        return contributions;
    },

    async resolveGithubTermContributions(input: {
        terms: string[];
        evidence: string;
    }): Promise<CapabilityContribution[]> {
        const mappings = await loadMappings("GITHUB_TERM");
        const contributions: CapabilityContribution[] = [];
        const normalizedTerms = input.terms
            .map((term) => normalizeText(term))
            .filter((term) => term.length > 0);

        for (const mapping of mappings) {
            if (!matchesTermMapping(mapping, normalizedTerms)) {
                continue;
            }

            pushContribution(
                contributions,
                mapping,
                "GITHUB_PROFILE",
                applyMappingScore(mapping, Math.min(1, normalizedTerms.length / 20)),
                [input.evidence]
            );
        }

        return contributions;
    },

    async resolveDsaContributions(input: {
        platform: string;
        score: number;
        evidence: string;
    }): Promise<CapabilityContribution[]> {
        const mappings = await loadMappings("DSA_PROFILE");
        return mappings
            .filter((mapping) => mapping.matcherType === "EXACT" && mapping.matcherKey === input.platform)
            .map((mapping) => ({
                slug: mapping.capability.slug,
                name: mapping.capability.name,
                category: mapping.capability.category,
                sourceType: "DSA_PROFILE" as const,
                score: applyMappingScore(mapping, input.score),
                confidence: clamp(mapping.confidence),
                evidence: buildEvidence(mapping, [input.evidence])
            }));
    },

    async resolveJriContributions(input: {
        metrics: Record<string, number>;
    }): Promise<CapabilityContribution[]> {
        const mappings = await loadMappings("JRI_PROFILE");
        const contributions: CapabilityContribution[] = [];

        for (const mapping of mappings) {
            if (mapping.matcherType !== "EXACT") {
                continue;
            }

            const rawValue = input.metrics[mapping.matcherKey];
            if (typeof rawValue !== "number") {
                continue;
            }

            pushContribution(
                contributions,
                mapping,
                "JRI_PROFILE",
                applyMappingScore(mapping, rawValue),
                [`${mapping.matcherKey}:${rawValue.toFixed(2)}`]
            );
        }

        return contributions;
    }
};
