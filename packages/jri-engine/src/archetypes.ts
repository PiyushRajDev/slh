/**
 * Determine developer archetype based on the gap between
 * DSA-oriented and project-oriented scores.
 */
export function computeArchetype(dsaScore: number, projectScore: number): string {
    const delta = dsaScore - projectScore;
    if (delta >= 12) return 'Algorithm Specialist';
    if (delta <= -12) return 'Product Builder';
    return 'Balanced Engineer';
}
