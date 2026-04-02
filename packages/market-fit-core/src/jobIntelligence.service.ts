import axios from "axios";
import { getDevJobListings } from "./devJobListings";
import { getMarketFitCoreRuntime } from "./runtime";
import { marketFitConfigService } from "./marketFitConfig.service";
import { MarketBaselineFreshness, MarketFitAnalyzeInput, MarketFitJobListingInput, NormalizedJobListing } from "./types";
import { normalizeText, normalizeWhitespace, slugify, stableHash, uniqueStrings } from "./utils";

function buildClusterKey(input: Pick<MarketFitAnalyzeInput, "role" | "seniority">): string {
    return [
        slugify(input.role),
        slugify(input.seniority)
    ].join(":");
}

async function getRecentBaselineTtlMs(): Promise<number> {
    const hours = Math.max(1, await marketFitConfigService.getNumber("baseline_cache_ttl_hours"));
    return hours * 60 * 60 * 1000;
}

function normalizeListing(
    roleTitle: string,
    input: MarketFitJobListingInput,
    defaults: Pick<MarketFitAnalyzeInput, "location" | "employmentType" | "workMode">
): NormalizedJobListing {
    const descriptionRaw = normalizeWhitespace(input.description);
    const descriptionNormalized = normalizeText(descriptionRaw);
    const title = normalizeWhitespace(input.title || roleTitle);
    const source = normalizeWhitespace(input.source || "inline");
    const identitySeed = [
        source,
        input.externalId ?? "",
        input.sourceUrl ?? "",
        input.companyName ?? "",
        title,
        descriptionNormalized
    ].join("|");

    return {
        source,
        externalId: input.externalId,
        sourceUrl: input.sourceUrl,
        companyName: input.companyName ? normalizeWhitespace(input.companyName) : undefined,
        title,
        location: input.location ?? defaults.location,
        employmentType: input.employmentType ?? defaults.employmentType,
        workMode: input.workMode ?? defaults.workMode,
        descriptionRaw,
        descriptionNormalized,
        sourceHash: stableHash(identitySeed),
        normalizedHash: stableHash(descriptionNormalized),
        postedAt: input.postedAt ? new Date(input.postedAt) : undefined
    };
}

async function fetchFromConfiguredFeed(input: MarketFitAnalyzeInput): Promise<MarketFitJobListingInput[]> {
    const feedUrl = process.env.MARKET_FIT_JOB_FEED_URL;
    if (!feedUrl) {
        if (process.env.MARKET_FIT_USE_DEV_FIXTURES === "true") {
            return await getDevJobListings(input);
        }

        return [];
    }

    const response = await axios.get(feedUrl, {
        timeout: Number(process.env.MARKET_FIT_JOB_FEED_TIMEOUT_MS ?? 12_000),
        params: {
            role: input.role,
            seniority: input.seniority,
            limit: input.sampleSize
        }
    });

    if (!Array.isArray(response.data)) {
        return [];
    }

    return response.data
        .filter((item) => item && typeof item.description === "string")
        .map((item) => ({
            source: typeof item.source === "string" ? item.source : "remote-feed",
            externalId: typeof item.externalId === "string" ? item.externalId : undefined,
            sourceUrl: typeof item.sourceUrl === "string" ? item.sourceUrl : undefined,
            companyName: typeof item.companyName === "string" ? item.companyName : undefined,
            title: typeof item.title === "string" ? item.title : undefined,
            location: typeof item.location === "string" ? item.location : undefined,
            employmentType: typeof item.employmentType === "string" ? item.employmentType : undefined,
            workMode: typeof item.workMode === "string" ? item.workMode : undefined,
            description: item.description,
            postedAt: typeof item.postedAt === "string" ? item.postedAt : undefined
        }));
}

export const jobIntelligenceService = {
    buildClusterKey,

    async ingestJobListings(input: MarketFitAnalyzeInput) {
        const { prisma } = getMarketFitCoreRuntime();
        const clusterKey = buildClusterKey(input);
        const roleSlug = slugify(input.role);
        const defaultSampleSize = await marketFitConfigService.getNumber("baseline_default_sample_size");
        const maxSampleSize = await marketFitConfigService.getNumber("baseline_max_sample_size");
        const requestedSampleSize = Math.max(1, Math.min(input.sampleSize ?? defaultSampleSize, maxSampleSize));

        const cluster = await prisma.jobCluster.upsert({
            where: { clusterKey },
            create: {
                clusterKey,
                roleSlug,
                roleTitle: normalizeWhitespace(input.role),
                seniority: normalizeWhitespace(input.seniority),
                sampleSize: requestedSampleSize
            },
            update: {
                roleTitle: normalizeWhitespace(input.role),
                seniority: normalizeWhitespace(input.seniority),
                sampleSize: requestedSampleSize
            }
        });

        const cachedListings = await prisma.jobListing.findMany({
            where: { clusterId: cluster.id },
            orderBy: [{ postedAt: "desc" }, { updatedAt: "desc" }],
            take: requestedSampleSize
        });
        const hasRecentCache = Boolean(
            !input.forceRefresh &&
            cluster.lastIngestedAt &&
            Date.now() - cluster.lastIngestedAt.getTime() <= await getRecentBaselineTtlMs() &&
            cachedListings.length > 0
        );

        if (!input.jobListings?.length && hasRecentCache) {
            return {
                cluster,
                listings: cachedListings,
                usedCache: true,
                dataFreshness: "recent_cache" as MarketBaselineFreshness
            };
        }

        let sourceListings = input.jobListings ?? [];
        if (sourceListings.length === 0) {
            sourceListings = await fetchFromConfiguredFeed(input);
        }

        if (sourceListings.length === 0) {
            throw new Error("No recent market data is available for this role. Configure MARKET_FIT_JOB_FEED_URL or provide job listings.");
        }

        const normalized = sourceListings
            .slice(0, requestedSampleSize)
            .map((listing) =>
                normalizeListing(input.role, listing, {
                    location: input.location,
                    employmentType: input.employmentType,
                    workMode: input.workMode
                })
            );

        const persisted = [];
        for (const listing of normalized) {
            const row = await prisma.jobListing.upsert({
                where: { sourceHash: listing.sourceHash },
                create: {
                    clusterId: cluster.id,
                    source: listing.source,
                    externalId: listing.externalId,
                    sourceUrl: listing.sourceUrl,
                    companyName: listing.companyName,
                    title: listing.title,
                    location: listing.location,
                    employmentType: listing.employmentType,
                    workMode: listing.workMode,
                    descriptionRaw: listing.descriptionRaw,
                    descriptionNormalized: listing.descriptionNormalized,
                    sourceHash: listing.sourceHash,
                    normalizedHash: listing.normalizedHash,
                    postedAt: listing.postedAt
                },
                update: {
                    clusterId: cluster.id,
                    source: listing.source,
                    externalId: listing.externalId,
                    sourceUrl: listing.sourceUrl,
                    companyName: listing.companyName,
                    title: listing.title,
                    location: listing.location,
                    employmentType: listing.employmentType,
                    workMode: listing.workMode,
                    descriptionRaw: listing.descriptionRaw,
                    descriptionNormalized: listing.descriptionNormalized,
                    normalizedHash: listing.normalizedHash,
                    postedAt: listing.postedAt
                }
            });
            persisted.push(row);
        }

        await prisma.jobCluster.update({
            where: { id: cluster.id },
            data: {
                lastIngestedAt: new Date(),
                sampleSize: persisted.length
            }
        });

        return {
            cluster,
            listings: persisted,
            usedCache: false,
            dataFreshness: "live" as MarketBaselineFreshness
        };
    },

    async getAggregatedCapabilityDemand(clusterId: string) {
        const { prisma } = getMarketFitCoreRuntime();
        const frequencyWeight = await marketFitConfigService.getNumber("baseline_frequency_weight");
        const importanceWeight = await marketFitConfigService.getNumber("baseline_importance_weight");
        const totalListings = await prisma.jobListing.count({
            where: { clusterId }
        });
        const mappings = await prisma.jobCapabilityMap.findMany({
            where: { clusterId },
            include: {
                capability: true,
                jobListing: {
                    select: {
                        title: true,
                        companyName: true
                    }
                }
            }
        });

        const byCapability = new Map<string, {
            capabilityId: string;
            capabilitySlug: string;
            capabilityName: string;
            category: string;
            demandSum: number;
            evidence: string[];
            sourceExamples: string[];
            listingIds: Set<string>;
        }>();

        for (const mapping of mappings) {
            const existing = byCapability.get(mapping.capabilityId) ?? {
                capabilityId: mapping.capabilityId,
                capabilitySlug: mapping.capability.slug,
                capabilityName: mapping.capability.name,
                category: mapping.capability.category,
                demandSum: 0,
                evidence: [],
                sourceExamples: [],
                listingIds: new Set<string>()
            };

            existing.demandSum += mapping.demandScore;
            existing.listingIds.add(mapping.jobListingId);

            const evidence = Array.isArray(mapping.evidence) ? (mapping.evidence as string[]) : [];
            existing.evidence.push(...evidence);
            if (mapping.jobListing.title) {
                const sourceLabel = mapping.jobListing.companyName
                    ? `${mapping.jobListing.title} at ${mapping.jobListing.companyName}`
                    : mapping.jobListing.title;
                existing.sourceExamples.push(sourceLabel);
            }
            existing.sourceExamples.push(...evidence);
            byCapability.set(mapping.capabilityId, existing);
        }

        return Array.from(byCapability.values())
            .map((value) => {
                const listingCount = value.listingIds.size;
                const averageImportance = value.demandSum / Math.max(1, listingCount);
                const frequency = listingCount / Math.max(1, totalListings);
                const demandScore = averageImportance * importanceWeight + frequency * frequencyWeight;

                return {
                    capabilityId: value.capabilityId,
                    capabilitySlug: value.capabilitySlug,
                    capabilityName: value.capabilityName,
                    category: value.category,
                    demandScore: Number(demandScore.toFixed(4)),
                    averageImportance: Number(averageImportance.toFixed(4)),
                    frequency: Number(frequency.toFixed(4)),
                    evidence: Array.from(new Set(value.evidence)).slice(0, 5),
                    sourceExamples: uniqueStrings(value.sourceExamples).slice(0, 5),
                    listingCount
                };
            })
            .sort((a, b) => b.demandScore - a.demandScore);
    }
};
