import { createHash } from "crypto";

export function clamp(value: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(max, value));
}

export function round(value: number, precision = 4): number {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
}

export function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

export function normalizeText(value: string): string {
    return normalizeWhitespace(value).toLowerCase();
}

export function slugify(value: string): string {
    return normalizeText(value)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100);
}

export function stableHash(value: string): string {
    return createHash("sha256").update(value).digest("hex");
}

export function uniqueStrings(values: string[]): string[] {
    return Array.from(new Set(values.map((value) => normalizeWhitespace(value)).filter(Boolean)));
}

export function summarizeSentences(text: string, limit = 3): string[] {
    return uniqueStrings(
        text
            .split(/[\n\.]+/)
            .map((part) => part.trim())
            .filter((part) => part.length >= 12)
            .slice(0, limit)
    );
}
