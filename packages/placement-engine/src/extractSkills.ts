import { ExtractedSkills } from "./types";

interface CapabilityEntry {
  slug: string;
  name: string;
  synonyms: string[] | null;
}

/**
 * Normalizes a string for matching: lowercase, strip punctuation, collapse whitespace.
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Deterministic keyword-based skill extractor.
 * Matches job description text against the Capability catalog
 * (slugs, names, and synonyms). Returns de-duplicated raw skills
 * and matched capability slugs.
 */
export function extractSkillsFromText(
  text: string,
  catalog: CapabilityEntry[]
): ExtractedSkills {
  const normalizedText = normalize(text);
  const words = normalizedText.split(" ");

  const matchedSlugs = new Set<string>();
  const matchedNames = new Set<string>();

  for (const capability of catalog) {
    const terms: string[] = [
      normalize(capability.name),
      ...(Array.isArray(capability.synonyms) ? capability.synonyms.map(normalize) : []),
    ];

    for (const term of terms) {
      // Multi-word terms: substring match
      // Single-word terms: whole-word match to avoid false positives
      const isMatch =
        term.includes(" ")
          ? normalizedText.includes(term)
          : words.includes(term);

      if (isMatch) {
        matchedSlugs.add(capability.slug);
        matchedNames.add(normalize(capability.name));
        break;
      }
    }
  }

  return {
    skills: Array.from(matchedNames).sort(),
    capabilitySlugs: Array.from(matchedSlugs).sort(),
  };
}

/**
 * Normalizes a raw skills array: lowercase, deduplicate, sort.
 */
export function normalizeSkills(skills: string[]): string[] {
  return Array.from(new Set(skills.map((s) => s.toLowerCase().trim()))).sort();
}
