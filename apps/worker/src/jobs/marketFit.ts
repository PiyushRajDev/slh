import { Job } from "bullmq";
import prisma from "../../../api/src/db";
import { aiService } from "../../../../packages/market-fit-core/src/aiService";
import { capabilityCatalogService } from "../../../../packages/market-fit-core/src/capabilityCatalog.service";
import { capabilityExtractionService, MARKET_FIT_EXTRACTION_VERSION } from "../../../../packages/market-fit-core/src/capabilityExtraction.service";
import { gapAnalysisService } from "../../../../packages/market-fit-core/src/gapAnalysis.service";
import { jobIntelligenceService } from "../../../../packages/market-fit-core/src/jobIntelligence.service";
import {
    ExtractUserCapabilitiesJobData,
    GenerateMarketFitReportJobData,
    ParseMarketJobsJobData
} from "../../../../packages/market-fit-core/src/jobTypes";
import { recommendationService } from "../../../../packages/market-fit-core/src/recommendation.service";
import { marketFitReportService } from "../../../../packages/market-fit-core/src/report.service";
import { configureMarketFitCore } from "../../../../packages/market-fit-core/src/runtime";
import { MarketBaselineFreshness, MarketSignalItem, UserCapabilitySummary } from "../../../../packages/market-fit-core/src/types";
import { userCapabilityProfileService } from "../../../../packages/market-fit-core/src/userCapabilityProfile.service";

type ParseMarketJobsResult = {
    clusterId: string;
    roleSlug: string;
    roleTitle: string;
    seniority?: string | null;
    location?: string | null;
    jobCount: number;
    dataFreshness: MarketBaselineFreshness;
    generatedAt: string;
    topMarketSignals: MarketSignalItem[];
};

type ExtractUserCapabilitiesResult = {
    userCapabilityProfileId: string;
    capabilities: UserCapabilitySummary[];
    reused: boolean;
};

configureMarketFitCore({ prisma, aiService });

function isParseResult(value: unknown): value is ParseMarketJobsResult {
    return Boolean(value && typeof value === "object" && "clusterId" in value);
}

function isUserResult(value: unknown): value is ExtractUserCapabilitiesResult {
    return Boolean(value && typeof value === "object" && "userCapabilityProfileId" in value);
}

function buildTopMarketSignals(items: Awaited<ReturnType<typeof jobIntelligenceService.getAggregatedCapabilityDemand>>): MarketSignalItem[] {
    return items.slice(0, 8).map((item) => ({
        capabilitySlug: item.capabilitySlug,
        capabilityName: item.capabilityName,
        category: item.category,
        demandScore: item.demandScore,
        averageImportance: item.averageImportance,
        frequency: item.frequency,
        listingCount: item.listingCount,
        sourceExamples: item.sourceExamples
    }));
}

export async function handleParseMarketJobs(job: Job<ParseMarketJobsJobData>): Promise<ParseMarketJobsResult> {
    await job.updateProgress({ stage: "INGESTING_JOB_LISTINGS" });

    const { cluster, listings, usedCache, dataFreshness } = await jobIntelligenceService.ingestJobListings(job.data.input);

    let aggregatedDemand = await jobIntelligenceService.getAggregatedCapabilityDemand(cluster.id);

    if (usedCache && aggregatedDemand.length > 0) {
        await job.updateProgress({
            stage: "USING_RECENT_BASELINE",
            jobCount: listings.length
        });
    } else {
        await job.updateProgress({
            stage: "EXTRACTING_JOB_CAPABILITIES",
            jobCount: listings.length
        });

        const extractedByListing = [];
        for (const listing of listings) {
            const capabilities = await capabilityExtractionService.extractJobCapabilities({
                source: listing.source,
                externalId: listing.externalId ?? undefined,
                sourceUrl: listing.sourceUrl ?? undefined,
                companyName: listing.companyName ?? undefined,
                title: listing.title,
                location: listing.location ?? undefined,
                employmentType: listing.employmentType ?? undefined,
                workMode: listing.workMode ?? undefined,
                descriptionRaw: listing.descriptionRaw,
                descriptionNormalized: listing.descriptionNormalized,
                sourceHash: listing.sourceHash,
                normalizedHash: listing.normalizedHash,
                postedAt: listing.postedAt ?? undefined
            });

            extractedByListing.push({ listing, capabilities });
        }

        const allCapabilities = extractedByListing.flatMap((item) => item.capabilities);
        const capabilityMap = await capabilityCatalogService.ensureCapabilities(allCapabilities);

        await prisma.jobCapabilityMap.deleteMany({
            where: {
                jobListingId: {
                    in: listings.map((listing) => listing.id)
                }
            }
        });

        const mappingRows = extractedByListing.flatMap(({ listing, capabilities }) =>
            capabilities
                .map((capability) => {
                    const persisted = capabilityMap.get(capability.slug);
                    if (!persisted) {
                        return null;
                    }

                    return {
                        clusterId: cluster.id,
                        jobListingId: listing.id,
                        capabilityId: persisted.id,
                        demandScore: capability.importance,
                        importance: capability.importance,
                        confidence: capability.confidence,
                        evidence: capability.evidence as any,
                        extractionVersion: MARKET_FIT_EXTRACTION_VERSION
                    };
                })
                .filter((value): value is NonNullable<typeof value> => value !== null)
        );

        if (mappingRows.length > 0) {
            await prisma.jobCapabilityMap.createMany({
                data: mappingRows
            });
        }

        aggregatedDemand = await jobIntelligenceService.getAggregatedCapabilityDemand(cluster.id);
    }

    const generatedAt = new Date().toISOString();
    const topMarketSignals = buildTopMarketSignals(aggregatedDemand);
    await prisma.jobCluster.update({
        where: { id: cluster.id },
        data: {
            marketSignals: {
                baselineRole: cluster.roleTitle,
                baselineSeniority: cluster.seniority,
                generatedAt,
                dataFreshness,
                sampleSize: listings.length,
                topMarketSignals
            } as any,
            lastIngestedAt: dataFreshness === "live" ? new Date(generatedAt) : cluster.lastIngestedAt ?? new Date(generatedAt),
            sampleSize: listings.length
        }
    });

    return {
        clusterId: cluster.id,
        roleSlug: cluster.roleSlug,
        roleTitle: cluster.roleTitle,
        seniority: cluster.seniority,
        location: cluster.location,
        jobCount: listings.length,
        dataFreshness,
        generatedAt,
        topMarketSignals
    };
}

export async function handleExtractUserCapabilities(job: Job<ExtractUserCapabilitiesJobData>): Promise<ExtractUserCapabilitiesResult> {
    await job.updateProgress({ stage: "BUILDING_USER_CAPABILITY_PROFILE" });

    const result = await userCapabilityProfileService.refreshForStudent(job.data.studentId, job.data.forceRefresh);

    return {
        userCapabilityProfileId: result.profile.id,
        capabilities: result.capabilities,
        reused: result.reused
    };
}

export async function handleGenerateMarketFitReport(job: Job<GenerateMarketFitReportJobData>): Promise<{
    reportId: string;
    readinessScore: number;
    verdict: string;
    dataFreshness: MarketBaselineFreshness;
}> {
    let reportId: string | null = null;

    try {
        await job.updateProgress({ stage: "WAITING_FOR_DEPENDENCIES" });
        const children = await job.getChildrenValues();
        const childValues = Object.values(children);

        const parseResult = childValues.find(isParseResult);
        const userResult = childValues.find(isUserResult);

        if (!parseResult || !userResult) {
            throw new Error("Required child job results were not available");
        }

        let report = await marketFitReportService.getReportByBackgroundJob(job.id!);
        if (!report) {
            report = await marketFitReportService.createPendingReport({
                studentId: job.data.studentId,
                clusterId: parseResult.clusterId,
                userCapabilityProfileId: userResult.userCapabilityProfileId,
                requestedByUserId: job.data.requestedByUserId,
                backgroundJobId: job.id!,
                roleSlug: parseResult.roleSlug,
                roleTitle: parseResult.roleTitle,
                seniority: parseResult.seniority ?? undefined,
                location: parseResult.location ?? undefined
            });
        }

        reportId = report.id;
        await marketFitReportService.markProcessing(report.id);
        await job.updateProgress({ stage: "RUNNING_GAP_ANALYSIS", reportId: report.id });

        const demand = await jobIntelligenceService.getAggregatedCapabilityDemand(parseResult.clusterId);
        const gapResult = gapAnalysisService.analyze({
            demand,
            userCapabilities: userResult.capabilities
        });

        const actionPlan = await recommendationService.buildActionPlan({
            missingCapabilities: gapResult.missingCapabilities,
            partialCapabilities: gapResult.partialCapabilities
        });

        const payload = {
            baselineRole: parseResult.roleTitle,
            baselineSeniority: parseResult.seniority ?? job.data.input.seniority,
            sampleSize: parseResult.jobCount,
            generatedAt: parseResult.generatedAt,
            dataFreshness: parseResult.dataFreshness,
            topMarketSignals: parseResult.topMarketSignals,
            readinessScore: gapResult.readinessScore,
            verdict: gapResult.verdict,
            matchedCapabilities: gapResult.matchedCapabilities,
            missingCapabilities: gapResult.missingCapabilities,
            partialCapabilities: gapResult.partialCapabilities,
            actionPlan
        } as const;

        await marketFitReportService.completeReport({
            reportId: report.id,
            payload,
            capabilityRows: gapResult.capabilityRows,
            jobCount: parseResult.jobCount
        });

        await job.updateProgress({ stage: "COMPLETED", reportId: report.id });

        return {
            reportId: report.id,
            readinessScore: payload.readinessScore,
            verdict: payload.verdict,
            dataFreshness: payload.dataFreshness
        };
    } catch (error) {
        if (reportId) {
            await marketFitReportService.failReport(
                reportId,
                error instanceof Error ? error.message : "Market fit analysis failed"
            );
        }

        throw error;
    }
}
