import { getMarketFitCoreRuntime } from "./runtime";
import { ExtractedCapability, CapabilityLibraryEntry } from "./types";
import { normalizeText, uniqueStrings } from "./utils";

const CACHE_TTL_MS = 5 * 60 * 1000;

type CatalogCache = {
    loadedAt: number;
    entries: CapabilityLibraryEntry[];
    bySlug: Map<string, CapabilityLibraryEntry>;
};

let catalogCache: CatalogCache | null = null;

function fallbackRecommendation(name: string): string {
    return `Build direct evidence for ${name} through a production-style project and measurable commits.`;
}

function fallbackProjectSuggestion(name: string): string {
    return `Create a focused project that demonstrates ${name} with clear documentation and verification.`;
}

function toKeywords(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return uniqueStrings(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0));
}

function toEntry(row: {
    slug: string;
    name: string;
    category: string;
    description: string | null;
    synonyms: unknown;
    recommendation: string | null;
    projectSuggestion: string | null;
}): CapabilityLibraryEntry {
    return {
        slug: row.slug,
        name: row.name,
        category: row.category,
        description: row.description ?? `${row.name} capability used in market-fit analysis.`,
        keywords: toKeywords(row.synonyms),
        recommendation: row.recommendation ?? fallbackRecommendation(row.name),
        projectSuggestion: row.projectSuggestion ?? fallbackProjectSuggestion(row.name)
    };
}

async function loadCatalog(forceRefresh = false): Promise<CatalogCache> {
    if (!forceRefresh && catalogCache && Date.now() - catalogCache.loadedAt < CACHE_TTL_MS) {
        return catalogCache;
    }

    const { prisma } = getMarketFitCoreRuntime();
    const rows = await prisma.capability.findMany({
        orderBy: { name: "asc" },
        select: {
            slug: true,
            name: true,
            category: true,
            description: true,
            synonyms: true,
            recommendation: true,
            projectSuggestion: true
        }
    });

    if (rows.length === 0) {
        throw new Error("Market Fit capability seed data is missing. Run the market-fit seed script.");
    }

    const entries = rows.map(toEntry);
    catalogCache = {
        loadedAt: Date.now(),
        entries,
        bySlug: new Map(entries.map((entry) => [entry.slug, entry]))
    };

    return catalogCache;
}

export const capabilityCatalogService = {
    async getAllEntries(forceRefresh = false): Promise<CapabilityLibraryEntry[]> {
        const catalog = await loadCatalog(forceRefresh);
        return catalog.entries;
    },

    async getEntryBySlug(slug: string): Promise<CapabilityLibraryEntry | null> {
        const catalog = await loadCatalog();
        return catalog.bySlug.get(slug) ?? null;
    },

    async getEntryMapBySlug(slugs: string[]): Promise<Map<string, CapabilityLibraryEntry>> {
        const catalog = await loadCatalog();
        const targetSlugs = new Set(slugs);
        return new Map(
            Array.from(catalog.bySlug.entries()).filter(([slug]) => targetSlugs.has(slug))
        );
    },

    async matchEntriesByTerms(terms: string[]): Promise<CapabilityLibraryEntry[]> {
        const catalog = await loadCatalog();
        const normalizedTerms = terms
            .map((term) => normalizeText(term))
            .filter((term) => term.length > 0);

        return catalog.entries.filter((entry) => {
            const normalizedName = normalizeText(entry.name);
            return entry.keywords.some((keyword) => {
                const normalizedKeyword = normalizeText(keyword);
                return normalizedTerms.some((term) =>
                    term.includes(normalizedKeyword) ||
                    normalizedKeyword.includes(term) ||
                    term.includes(normalizedName)
                );
            });
        });
    },

    async ensureCapabilities(capabilities: ExtractedCapability[]): Promise<Map<string, { id: string; slug: string; name: string; category: string }>> {
        const { prisma } = getMarketFitCoreRuntime();

        const unique = new Map<string, ExtractedCapability>();
        for (const capability of capabilities) {
            if (!unique.has(capability.slug)) {
                unique.set(capability.slug, capability);
            }
        }

        for (const capability of unique.values()) {
            await prisma.capability.upsert({
                where: { slug: capability.slug },
                create: {
                    slug: capability.slug,
                    name: capability.name,
                    category: capability.category,
                    description: `${capability.name} capability used in market-fit analysis.`,
                    synonyms: uniqueStrings([capability.name, ...capability.evidence]) as any,
                    recommendation: fallbackRecommendation(capability.name),
                    projectSuggestion: fallbackProjectSuggestion(capability.name)
                },
                update: {
                    name: capability.name,
                    category: capability.category
                }
            });
        }

        catalogCache = null;

        const rows = await prisma.capability.findMany({
            where: {
                slug: {
                    in: Array.from(unique.keys())
                }
            }
        });

        return new Map(
            rows.map((row) => [
                row.slug,
                {
                    id: row.id,
                    slug: row.slug,
                    name: row.name,
                    category: row.category
                }
            ])
        );
    },

    clearCache(): void {
        catalogCache = null;
    }
};
