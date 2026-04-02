import { capabilityCatalogService } from "./capabilityCatalog.service";
import { getMarketFitCoreRuntime } from "./runtime";
import { CapabilityLibraryEntry, ExtractedCapability, NormalizedJobListing } from "./types";
import { clamp, normalizeText, slugify, summarizeSentences, uniqueStrings } from "./utils";

type AiCapabilityResponse = {
    capabilities?: Array<{
        name?: string;
        category?: string;
        importance?: number;
        confidence?: number;
        evidence?: string[];
    }>;
};

export const MARKET_FIT_EXTRACTION_VERSION = "1.0.0";

function scoreHeuristicCapability(text: string, listing: NormalizedJobListing, entry: CapabilityLibraryEntry): ExtractedCapability | null {
    const hits = entry.keywords.filter((keyword) => text.includes(normalizeText(keyword)));
    if (hits.length === 0) {
        return null;
    }

    const titleBoost = entry.keywords.some((keyword) => normalizeText(listing.title).includes(normalizeText(keyword))) ? 0.15 : 0;
    const requiredBoost = hits.some((keyword) => {
        const index = text.indexOf(normalizeText(keyword));
        if (index < 0) {
            return false;
        }

        const windowStart = Math.max(0, index - 80);
        const context = text.slice(windowStart, index + keyword.length + 20);
        return /(must|required|strong|proficien|hands-on|experience|expert)/.test(context);
    }) ? 0.15 : 0;

    const evidence = uniqueStrings([
        ...summarizeSentences(listing.title, 1),
        ...summarizeSentences(listing.descriptionRaw, 6).filter((sentence) =>
            entry.keywords.some((keyword) => normalizeText(sentence).includes(normalizeText(keyword)))
        )
    ]).slice(0, 4);

    return {
        slug: entry.slug,
        name: entry.name,
        category: entry.category,
        importance: clamp(0.45 + hits.length * 0.12 + titleBoost + requiredBoost),
        confidence: clamp(0.55 + hits.length * 0.08 + titleBoost),
        evidence
    };
}

function mapAiCapability(raw: NonNullable<AiCapabilityResponse["capabilities"]>[number], libraryEntries: CapabilityLibraryEntry[]): ExtractedCapability | null {
    const rawName = raw.name?.trim();
    if (!rawName) {
        return null;
    }

    const normalizedName = normalizeText(rawName);
    const libraryMatch = libraryEntries.find((entry) =>
        entry.slug === slugify(rawName) ||
        normalizeText(entry.name) === normalizedName ||
        entry.keywords.some((keyword) => normalizedName.includes(normalizeText(keyword)) || normalizeText(keyword).includes(normalizedName))
    );

    return {
        slug: libraryMatch?.slug ?? slugify(rawName),
        name: libraryMatch?.name ?? rawName,
        category: libraryMatch?.category ?? (raw.category?.trim() || "general"),
        importance: clamp(Number(raw.importance ?? 0.6)),
        confidence: clamp(Number(raw.confidence ?? 0.65)),
        evidence: uniqueStrings(raw.evidence ?? []).slice(0, 4)
    };
}

function mergeCapabilities(capabilities: ExtractedCapability[]): ExtractedCapability[] {
    const merged = new Map<string, ExtractedCapability>();

    for (const capability of capabilities) {
        const existing = merged.get(capability.slug);
        if (!existing) {
            merged.set(capability.slug, {
                ...capability,
                evidence: uniqueStrings(capability.evidence).slice(0, 4)
            });
            continue;
        }

        merged.set(capability.slug, {
            ...existing,
            importance: clamp(Math.max(existing.importance, capability.importance)),
            confidence: clamp(Math.max(existing.confidence, capability.confidence)),
            evidence: uniqueStrings([...existing.evidence, ...capability.evidence]).slice(0, 4)
        });
    }

    return Array.from(merged.values()).sort((a, b) => b.importance - a.importance);
}

async function extractWithAi(listing: NormalizedJobListing, libraryEntries: CapabilityLibraryEntry[]): Promise<ExtractedCapability[]> {
    const { aiService } = getMarketFitCoreRuntime();
    if (!aiService.isEnabled()) {
        return [];
    }

    const response = await aiService.generateStructuredObject<AiCapabilityResponse>({
        systemPrompt: "You extract concrete hiring capabilities from backend and software engineering job descriptions.",
        schemaHint: JSON.stringify({
            capabilities: [
                {
                    name: "string",
                    category: "string",
                    importance: "number 0..1",
                    confidence: "number 0..1",
                    evidence: ["string"]
                }
            ]
        }),
        userPrompt: [
            `Role title: ${listing.title}`,
            `Location: ${listing.location ?? "unknown"}`,
            "Job description:",
            listing.descriptionRaw
        ].join("\n"),
        temperature: 0.1,
        maxTokens: 800
    });

    return (response.capabilities ?? [])
        .map((capability) => mapAiCapability(capability, libraryEntries))
        .filter((value): value is ExtractedCapability => value !== null);
}

export const capabilityExtractionService = {
    async extractJobCapabilities(listing: NormalizedJobListing): Promise<ExtractedCapability[]> {
        const libraryEntries = await capabilityCatalogService.getAllEntries();
        const text = normalizeText(`${listing.title}\n${listing.descriptionNormalized}`);
        const heuristic = libraryEntries
            .map((entry) => scoreHeuristicCapability(text, listing, entry))
            .filter((value): value is ExtractedCapability => value !== null);

        let aiCapabilities: ExtractedCapability[] = [];
        try {
            aiCapabilities = await extractWithAi(listing, libraryEntries);
        } catch (error) {
            console.warn("[market-fit] AI extraction fallback triggered:", error instanceof Error ? error.message : error);
        }

        return mergeCapabilities([...heuristic, ...aiCapabilities]).slice(0, 15);
    }
};
