import type { AcademicInput, ComponentBreakdown } from '../types';
import { clamp, round } from '../utils';

/**
 * Academic Score (0–100) based on the architecture spec §7.2C.
 *
 * 1. CGPA Score           (70 pts) : (cgpa / 10) * 70
 * 2. Relevant Coursework  (30 pts)
 *    - Core CS courses     0-15 : min(coreCoursesTaken * 3, 15)
 *    - Advanced courses    0-15 : min(advancedCoursesTaken * 5, 15)
 */
export function scoreAcademic(input: AcademicInput | undefined): ComponentBreakdown {
    if (!input) {
        return { score: 0, max: 100, details: {} };
    }

    // ── CGPA Score (70 pts) ──
    const cgpaPts = clamp((input.cgpa / 10) * 70, 0, 70);

    // ── Relevant Coursework (30 pts) ──
    const coreCoursePts = clamp(input.coreCoursesTaken * 3, 0, 15);
    const advancedCoursePts = clamp(input.advancedCoursesTaken * 5, 0, 15);
    const courseworkPts = coreCoursePts + advancedCoursePts;

    const total = round(clamp(cgpaPts + courseworkPts));

    return {
        score: total,
        max: 100,
        details: {
            cgpa: round(cgpaPts),
            coreCourses: round(coreCoursePts),
            advancedCourses: round(advancedCoursePts),
        },
    };
}
