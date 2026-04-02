import { getMarketFitCoreRuntime } from "./runtime";
import { MarketFitAnalyzeInput, MarketFitJobListingInput } from "./types";
import { normalizeWhitespace, slugify } from "./utils";

export async function getDevJobListings(input: Pick<MarketFitAnalyzeInput, "role" | "seniority" | "sampleSize">): Promise<MarketFitJobListingInput[]> {
    const { prisma } = getMarketFitCoreRuntime();
    const roleSlug = slugify(input.role);
    const seniority = normalizeWhitespace(input.seniority);
    const sampleSize = input.sampleSize ?? 12;

    const cluster = await prisma.jobCluster.findFirst({
        where: {
            roleSlug,
            seniority
        },
        orderBy: {
            updatedAt: "desc"
        },
        include: {
            jobListings: {
                where: { source: "dev-fixture" },
                orderBy: [{ postedAt: "desc" }, { createdAt: "asc" }],
                take: sampleSize
            }
        }
    });

    if (!cluster || cluster.jobListings.length === 0) {
        return [];
    }

    return cluster.jobListings.map((listing) => ({
        source: listing.source,
        externalId: listing.externalId ?? undefined,
        sourceUrl: listing.sourceUrl ?? undefined,
        companyName: listing.companyName ?? undefined,
        title: listing.title,
        location: listing.location ?? undefined,
        employmentType: listing.employmentType ?? undefined,
        workMode: listing.workMode ?? undefined,
        description: listing.descriptionRaw,
        postedAt: listing.postedAt?.toISOString()
    }));
}
