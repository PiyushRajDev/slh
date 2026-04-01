export interface JriPlatformStats {
  platform: "leetcode" | "codeforces";
  username: string | null;
  profileUrl: string | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  rating: number | null;
  contestsCount: number;
  fetchStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  isVerified: boolean;
  errorMessage: string | null;
  lastFetchedAt: string | null;
}

export interface JriProfileResponse {
  student: {
    id: string;
    name: string;
    department: string;
  };
  card: {
    jriScore: number;
    tier: string;
    archetype: string;
    importance: {
      dsa: number;
      projects: number;
    };
    components: {
      dsaScore: number;
      projectScore: number;
    };
    attributes: Record<string, number>;
  };
  platforms: {
    leetcode: JriPlatformStats;
    codeforces: JriPlatformStats;
  };
  projects: {
    analysesCount: number;
    latestScore: number;
    averageScore: number;
    bestScore: number;
    growth: number;
    consistency: number;
  };
  history: Array<{
    id: string;
    jriScore: number;
    createdAt: string;
  }>;
}
