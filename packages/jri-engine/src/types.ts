// ─── Input Types ───────────────────────────────────────────────

export interface DSAProfileInput {
    platform: "LEETCODE" | "CODEFORCES" | "HACKERRANK";
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    rating: number | null;
    contestsCount: number;
}

export interface ProjectAnalysisInput {
    overallScore: number;
    createdAt: string;
}

export interface AcademicInput {
    /** Cumulative GPA on a 10-point scale */
    cgpa: number;
    /** Number of core CS courses completed (DSA, OOP, DBMS, OS, CN) */
    coreCoursesTaken: number;
    /** Number of advanced CS courses (ML, Cloud, Security, Distributed Systems) */
    advancedCoursesTaken: number;
}

export interface HackathonInput {
    /** "winner" | "runner_up" | "participation" or freeform string */
    prize: string | null;
    /** ISO date string */
    participationDate: string;
}

// ─── Weight Configuration ──────────────────────────────────────

export interface WeightConfig {
    dsa?: number;
    projects?: number;
    academic?: number;
    hackathon?: number;
}

export interface NormalizedWeights {
    dsa: number;
    projects: number;
    academic: number;
    hackathon: number;
}

// ─── Calculator Input ──────────────────────────────────────────

export interface JRIInput {
    dsaProfiles?: DSAProfileInput[];
    projectAnalyses?: ProjectAnalysisInput[];
    academic?: AcademicInput;
    hackathons?: HackathonInput[];
    weights?: WeightConfig;
}

// ─── Scorer Output ─────────────────────────────────────────────

export interface ComponentBreakdown {
    score: number;
    max: number;
    details: Record<string, number>;
}

// ─── Projects Snapshot ─────────────────────────────────────────

export interface ProjectsSnapshot {
    analysesCount: number;
    latestScore: number;
    averageScore: number;
    bestScore: number;
    growth: number;
    consistency: number;
}

// ─── Calculator Output ─────────────────────────────────────────

export interface JRIResult {
    jriScore: number;
    tier: string;
    archetype: string;
    algorithmVersion: string;
    components: {
        dsa: ComponentBreakdown;
        projects: ComponentBreakdown;
        academic: ComponentBreakdown;
        hackathon: ComponentBreakdown;
    };
    weights: NormalizedWeights;
    attributes: Record<string, number>;
    projects: ProjectsSnapshot;
}
