export interface SummaryRow {
  name: string
  uid: string
  email: string
  leetcodeUsername: string
  leetcodeTotal: number
  leetcodeEasy: number
  leetcodeMedium: number
  leetcodeHard: number
  leetcodeRanking: number | null
  leetcodeContests: number
  leetcodeStatus: string
  codeforcesStatus: string
  githubUsername: string
  githubReposAnalyzed: number
  githubBestScore: number
  githubBestProfile: string
  githubAverageScore: number
  githubStatus: string
  durationSeconds: number
}

export interface RepoHighlight {
  repoName: string
  repoUrl: string
  score: number
  confidenceLevel: string
  profileId: string
}

export interface StudentPreview {
  id: string
  name: string
  uid: string
  email: string
  year: string
  city: string
  leetcodeUsername: string
  githubUsername: string
  leetcodeTotal: number
  leetcodeEasy: number
  leetcodeMedium: number
  leetcodeHard: number
  leetcodeRanking: number | null
  leetcodeContests: number
  leetcodeStatus: string
  githubBestScore: number
  githubAverageScore: number
  githubBestProfile: string
  githubReposAnalyzed: number
  githubStatus: string
  durationSeconds: number
  recent30Days: number
  recent90Days: number
  lastSubmissionAt: number | null
  recentSubmissions: Array<{ title: string; timestamp: number }>
  repoHighlights: RepoHighlight[]
  readinessScore: number
  readinessLabel: string
  percentile: number
  strengths: string[]
  recommendations: string[]
}

export interface CohortSummary {
  cohort: string
  studentCount: number
  avgLeetcode: number
  avgGithub: number
  readyRate: number
  activeRate: number
  momentumRate: number
}

export interface CampusSummary {
  totalStudents: number
  codingActiveCount: number
  portfolioReadyCount: number
  shortlistReadyCount: number
  missingSignalCount: number
  medianLeetcode: number
  medianGithub: number
  cohorts: CohortSummary[]
  profileDistribution: Array<{ profileId: string; label: string; count: number }>
  topTalent: StudentPreview[]
  supportNeeded: StudentPreview[]
  momentumWatch: StudentPreview[]
}
