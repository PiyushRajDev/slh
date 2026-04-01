export interface StudentResult {
  student: {
    rowIndex: number;
    timestamp: string;
    name: string;
    uid: string;
    email: string;
    leetcodeUrl: string;
    leetcodeUsername: string;
    githubUrl: string;
    githubUsername: string;
    city: string;
  };
  leetcode: null | {
    success: boolean;
    data: {
      profile: {
        username: string;
        realName: string;
        ranking: number;
        reputation: number;
      };
      difficultyStats: {
        easy: number;
        medium: number;
        hard: number;
        total: number;
      };
      recentSubmissions: {
        title: string;
        titleSlug: string;
        timestamp: string;
      }[];
    };
    durationMs: number;
  };
  codeforces: null | any;
  github: null | {
    reposAnalyzed: number;
    repos: {
      repoUrl: string;
      repoName: string;
      success: boolean;
      profileId: string;
      score: number;
      confidenceLevel: string;
      durationMs: number;
    }[];
    bestScore: number;
    bestProfile: string;
    avgScore: number;
  };
  totalDurationMs: number;
  jriScore?: number;
  dsaScore?: number;
  projectScore?: number;
}
