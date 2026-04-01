import rawStudentResults from '../../../../results/student-results.json'
import rawStudentSummary from '../../../../results/student-summary.csv?raw'
import type { CampusSummary, CohortSummary, StudentPreview, SummaryRow } from '../types/talentPreview'

interface RawStudentResult {
  student: {
    name: string
    uid: string
    email: string
    leetcodeUsername?: string
    githubUsername?: string
    city?: string
  }
  leetcode?: {
    success?: boolean
    data?: {
      profile?: {
        ranking?: number
      }
      difficultyStats?: {
        easy?: number
        medium?: number
        hard?: number
        total?: number
      }
      contestHistory?: unknown[]
      submissionCalendar?: Record<string, number>
      recentSubmissions?: Array<{ title: string; timestamp: string }>
    }
  } | null
  github?: {
    reposAnalyzed?: number
    repos?: Array<{
      repoName: string
      repoUrl: string
      score: number
      confidenceLevel: string
      profileId: string
      success: boolean
    }>
    bestScore?: number
    bestProfile?: string
    avgScore?: number
  } | null
  totalDurationMs?: number
}

const studentResults = rawStudentResults as RawStudentResult[]
const summaryColumns = [
  'name',
  'uid',
  'email',
  'leetcodeUsername',
  'leetcodeTotal',
  'leetcodeEasy',
  'leetcodeMedium',
  'leetcodeHard',
  'leetcodeRanking',
  'leetcodeContests',
  'leetcodeStatus',
  'codeforcesHandle',
  'codeforcesRating',
  'codeforcesMaxRating',
  'codeforcesRank',
  'codeforcesContests',
  'codeforcesSubmissions',
  'codeforcesStatus',
  'githubUsername',
  'githubReposAnalyzed',
  'githubBestScore',
  'githubBestProfile',
  'githubAverageScore',
  'githubStatus',
  'durationSeconds',
] as const

function toNumber(value: string | undefined): number {
  const parsed = Number.parseFloat((value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function toNullableNumber(value: string | undefined): number | null {
  const parsed = Number.parseFloat((value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeKey(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function yearFromUid(uid: string): string {
  const match = uid.trim().match(/^(\d{2})/)
  return match ? `20${match[1]}` : 'Unknown'
}

function profileLabel(profileId: string): string {
  const labels: Record<string, string> = {
    academic: 'Academic Project',
    frontend_app: 'Frontend App',
    production_web_app: 'Production Web App',
    backend_api: 'Backend API',
    cli_tool: 'CLI Tool',
    library: 'Library',
    ml_pipeline: 'ML Pipeline',
    generic: 'General App',
    none: 'No strong GitHub signal',
  }

  return labels[profileId] ?? profileId.replaceAll('_', ' ')
}

function formatCandidateStrengths(student: StudentPreview): string[] {
  const strengths: string[] = []

  if (student.leetcodeTotal >= 150) strengths.push('Strong problem-solving base')
  if (student.githubBestScore >= 55) strengths.push('Portfolio shows good execution quality')
  if (student.recent90Days >= 20) strengths.push('Healthy recent coding momentum')
  if (student.githubBestProfile !== 'none') strengths.push(`${profileLabel(student.githubBestProfile)} signal detected`)

  if (strengths.length === 0) strengths.push('Foundational profile with room to sharpen')
  return strengths.slice(0, 3)
}

function formatCandidateRecommendations(student: StudentPreview): string[] {
  const recommendations: string[] = []

  if (student.leetcodeTotal < 60) {
    recommendations.push('Build coding depth with a consistent medium-problem routine.')
  }
  if (student.githubBestScore < 40) {
    recommendations.push('Ship one polished GitHub project with README, deployment, and clearer structure.')
  }
  if (student.recent30Days < 5) {
    recommendations.push('Restart momentum with a 2-week streak and visible submission cadence.')
  }
  if (student.githubReposAnalyzed < 2) {
    recommendations.push('Add more representative repositories so project quality is easier to evaluate.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep compounding: pair one strong project release with contest or DSA consistency.')
  }

  return recommendations.slice(0, 3)
}

function readinessLabel(score: number): string {
  if (score >= 78) return 'Shortlist Ready'
  if (score >= 58) return 'On Track'
  if (score >= 38) return 'Building'
  return 'Needs Attention'
}

function parseSummaryLine(line: string): SummaryRow {
  const parts = line.split(',')
  const fixedHead = parts.slice(0, 10)
  const fixedTail = parts.slice(-14)
  const leetcodeStatus = parts.slice(10, parts.length - 14).join(',').trim()
  const values = [...fixedHead, leetcodeStatus, ...fixedTail]

  while (values.length < summaryColumns.length) {
    values.push('')
  }

  const record = Object.fromEntries(
    summaryColumns.map((column, index) => [column, values[index] ?? ''])
  ) as Record<(typeof summaryColumns)[number], string>

  return {
    name: record.name.trim(),
    uid: record.uid.trim(),
    email: record.email.trim(),
    leetcodeUsername: record.leetcodeUsername.trim(),
    leetcodeTotal: toNumber(record.leetcodeTotal),
    leetcodeEasy: toNumber(record.leetcodeEasy),
    leetcodeMedium: toNumber(record.leetcodeMedium),
    leetcodeHard: toNumber(record.leetcodeHard),
    leetcodeRanking: toNullableNumber(record.leetcodeRanking),
    leetcodeContests: toNumber(record.leetcodeContests),
    leetcodeStatus: record.leetcodeStatus.trim(),
    codeforcesStatus: record.codeforcesStatus.trim(),
    githubUsername: record.githubUsername.trim(),
    githubReposAnalyzed: toNumber(record.githubReposAnalyzed),
    githubBestScore: toNumber(record.githubBestScore),
    githubBestProfile: record.githubBestProfile.trim() || 'none',
    githubAverageScore: toNumber(record.githubAverageScore),
    githubStatus: record.githubStatus.trim(),
    durationSeconds: toNumber(record.durationSeconds),
  }
}

function summaryPriority(row: SummaryRow): number {
  return (
    row.leetcodeTotal * 2 +
    row.githubBestScore * 3 +
    row.githubAverageScore +
    row.githubReposAnalyzed * 4 +
    (row.leetcodeStatus === 'OK' ? 10 : 0) +
    (row.githubStatus === 'OK' ? 10 : 0)
  )
}

function resultPriority(row: RawStudentResult): number {
  const leetcodeTotal = row.leetcode?.data?.difficultyStats?.total ?? 0
  const githubBest = row.github?.bestScore ?? 0
  const githubAvg = row.github?.avgScore ?? 0
  const reposAnalyzed = row.github?.reposAnalyzed ?? 0
  const recency = Object.values(row.leetcode?.data?.submissionCalendar ?? {}).reduce((sum, count) => sum + count, 0)
  return leetcodeTotal * 2 + githubBest * 3 + githubAvg + reposAnalyzed * 4 + Math.min(recency, 40)
}

function recentCount(calendar: Record<string, number>, days: number): number {
  const now = Date.now()
  const threshold = now - days * 24 * 60 * 60 * 1000

  return Object.entries(calendar).reduce((sum, [timestamp, count]) => {
    const time = Number.parseInt(timestamp, 10) * 1000
    return time >= threshold ? sum + count : sum
  }, 0)
}

function lastSubmissionAt(result: RawStudentResult): number | null {
  const recent = result.leetcode?.data?.recentSubmissions ?? []
  if (recent.length > 0) {
    return Number.parseInt(recent[0].timestamp, 10) * 1000
  }

  const calendarKeys = Object.keys(result.leetcode?.data?.submissionCalendar ?? {})
  if (calendarKeys.length === 0) return null
  return Math.max(...calendarKeys.map((value) => Number.parseInt(value, 10) * 1000))
}

function mergeData(): StudentPreview[] {
  const summaryByKey = new Map<string, SummaryRow>()
  const resultByKey = new Map<string, RawStudentResult>()

  for (const line of rawStudentSummary.trim().split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue
    const row = parseSummaryLine(line)
    const key = normalizeKey(row.uid) || normalizeKey(row.email) || normalizeKey(row.githubUsername) || normalizeKey(row.name)
    const current = summaryByKey.get(key)
    if (!current || summaryPriority(row) > summaryPriority(current)) {
      summaryByKey.set(key, row)
    }
  }

  for (const result of studentResults) {
    const key = normalizeKey(result.student.uid) || normalizeKey(result.student.email) || normalizeKey(result.student.githubUsername) || normalizeKey(result.student.name)
    const current = resultByKey.get(key)
    if (!current || resultPriority(result) > resultPriority(current)) {
      resultByKey.set(key, result)
    }
  }

  const merged: StudentPreview[] = []
  const allKeys = new Set([...summaryByKey.keys(), ...resultByKey.keys()])

  for (const key of allKeys) {
    const summary = summaryByKey.get(key)
    const result = resultByKey.get(key)
    if (!summary && !result) continue

    const difficultyStats = result?.leetcode?.data?.difficultyStats
    const calendar = result?.leetcode?.data?.submissionCalendar ?? {}
    const recent90Days = recentCount(calendar, 90)
    const recent30Days = recentCount(calendar, 30)
    const leetcodeTotal = difficultyStats?.total ?? summary?.leetcodeTotal ?? 0
    const githubBestScore = result?.github?.bestScore ?? summary?.githubBestScore ?? 0
    const readiness = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (Math.min(leetcodeTotal, 350) / 350) * 55 +
            githubBestScore * 0.35 +
            (Math.min(recent90Days, 50) / 50) * 10
        )
      )
    )

    merged.push({
      id: key,
      name: result?.student.name?.trim() || summary?.name || 'Unknown Student',
      uid: result?.student.uid?.trim() || summary?.uid || 'NA',
      email: result?.student.email?.trim() || summary?.email || 'NA',
      year: yearFromUid(result?.student.uid || summary?.uid || ''),
      city: result?.student.city?.trim() || '',
      leetcodeUsername: result?.student.leetcodeUsername?.trim() || summary?.leetcodeUsername || '',
      githubUsername: result?.student.githubUsername?.trim() || summary?.githubUsername || '',
      leetcodeTotal,
      leetcodeEasy: difficultyStats?.easy ?? summary?.leetcodeEasy ?? 0,
      leetcodeMedium: difficultyStats?.medium ?? summary?.leetcodeMedium ?? 0,
      leetcodeHard: difficultyStats?.hard ?? summary?.leetcodeHard ?? 0,
      leetcodeRanking: result?.leetcode?.data?.profile?.ranking ?? summary?.leetcodeRanking ?? null,
      leetcodeContests: result?.leetcode?.data?.contestHistory?.length ?? summary?.leetcodeContests ?? 0,
      leetcodeStatus: summary?.leetcodeStatus || (leetcodeTotal > 0 ? 'OK' : 'SKIPPED'),
      githubBestScore,
      githubAverageScore: result?.github?.avgScore ?? summary?.githubAverageScore ?? 0,
      githubBestProfile: result?.github?.bestProfile ?? summary?.githubBestProfile ?? 'none',
      githubReposAnalyzed: result?.github?.reposAnalyzed ?? summary?.githubReposAnalyzed ?? 0,
      githubStatus: summary?.githubStatus || (githubBestScore > 0 ? 'OK' : 'SKIPPED'),
      durationSeconds: summary?.durationSeconds ?? Math.round((result?.totalDurationMs ?? 0) / 1000),
      recent30Days,
      recent90Days,
      lastSubmissionAt: lastSubmissionAt(result ?? { student: { name: '', uid: '', email: '' } }),
      recentSubmissions: (result?.leetcode?.data?.recentSubmissions ?? []).map((submission) => ({
        title: submission.title,
        timestamp: Number.parseInt(submission.timestamp, 10) * 1000,
      })),
      repoHighlights: (result?.github?.repos ?? [])
        .filter((repo) => repo.success)
        .sort((left, right) => right.score - left.score)
        .slice(0, 3)
        .map((repo) => ({
          repoName: repo.repoName,
          repoUrl: repo.repoUrl,
          score: repo.score,
          confidenceLevel: repo.confidenceLevel,
          profileId: repo.profileId,
        })),
      readinessScore: readiness,
      readinessLabel: readinessLabel(readiness),
      percentile: 0,
      strengths: [],
      recommendations: [],
    })
  }

  merged.sort((left, right) => {
    if (right.readinessScore !== left.readinessScore) return right.readinessScore - left.readinessScore
    if (right.githubBestScore !== left.githubBestScore) return right.githubBestScore - left.githubBestScore
    return right.leetcodeTotal - left.leetcodeTotal
  })

  const total = merged.length
  for (const [index, student] of merged.entries()) {
    student.percentile = Math.max(1, Math.round(((total - index) / total) * 100))
    student.strengths = formatCandidateStrengths(student)
    student.recommendations = formatCandidateRecommendations(student)
  }

  return merged
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)]
}

export const studentProfiles = mergeData()

export const featuredStudents = studentProfiles.slice(0, 6)

export const cohortOptions = ['All', ...new Set(studentProfiles.map((student) => student.year))].sort()

function createCampusSummary(students: StudentPreview[]): CampusSummary {
  const codingActiveCount = students.filter((student) => student.leetcodeTotal > 0).length
  const portfolioReadyCount = students.filter((student) => student.githubBestScore >= 50).length
  const shortlistReadyCount = students.filter((student) => student.readinessScore >= 78).length
  const missingSignalCount = students.filter((student) => student.leetcodeTotal === 0 || student.githubBestScore === 0).length

  const cohortsMap = new Map<string, CohortSummary>()
  for (const student of students) {
    const current = cohortsMap.get(student.year) ?? {
      cohort: student.year,
      studentCount: 0,
      avgLeetcode: 0,
      avgGithub: 0,
      readyRate: 0,
      activeRate: 0,
      momentumRate: 0,
    }

    current.studentCount += 1
    current.avgLeetcode += student.leetcodeTotal
    current.avgGithub += student.githubBestScore
    current.readyRate += student.readinessScore >= 78 ? 1 : 0
    current.activeRate += student.leetcodeTotal > 0 ? 1 : 0
    current.momentumRate += student.recent90Days >= 12 ? 1 : 0
    cohortsMap.set(student.year, current)
  }

  const cohorts = [...cohortsMap.values()]
    .map((cohort) => ({
      ...cohort,
      avgLeetcode: Number((cohort.avgLeetcode / cohort.studentCount).toFixed(1)),
      avgGithub: Number((cohort.avgGithub / cohort.studentCount).toFixed(1)),
      readyRate: Number(((cohort.readyRate / cohort.studentCount) * 100).toFixed(1)),
      activeRate: Number(((cohort.activeRate / cohort.studentCount) * 100).toFixed(1)),
      momentumRate: Number(((cohort.momentumRate / cohort.studentCount) * 100).toFixed(1)),
    }))
    .sort((left, right) => left.cohort.localeCompare(right.cohort))

  const profileCounts = new Map<string, number>()
  for (const student of students) {
    profileCounts.set(student.githubBestProfile, (profileCounts.get(student.githubBestProfile) ?? 0) + 1)
  }

  return {
    totalStudents: students.length,
    codingActiveCount,
    portfolioReadyCount,
    shortlistReadyCount,
    missingSignalCount,
    medianLeetcode: median(students.map((student) => student.leetcodeTotal)),
    medianGithub: median(students.map((student) => student.githubBestScore)),
    cohorts,
    profileDistribution: [...profileCounts.entries()]
      .map(([profileId, count]) => ({ profileId, label: profileLabel(profileId), count }))
      .sort((left, right) => right.count - left.count),
    topTalent: students.slice(0, 8),
    supportNeeded: [...students]
      .sort((left, right) => {
        const leftRisk = (left.leetcodeTotal === 0 ? 2 : 0) + (left.githubBestScore === 0 ? 2 : 0) + (left.recent30Days === 0 ? 1 : 0)
        const rightRisk = (right.leetcodeTotal === 0 ? 2 : 0) + (right.githubBestScore === 0 ? 2 : 0) + (right.recent30Days === 0 ? 1 : 0)
        if (rightRisk !== leftRisk) return rightRisk - leftRisk
        return left.readinessScore - right.readinessScore
      })
      .slice(0, 8),
    momentumWatch: [...students]
      .sort((left, right) => {
        if (right.recent90Days !== left.recent90Days) return right.recent90Days - left.recent90Days
        return right.readinessScore - left.readinessScore
      })
      .slice(0, 8),
  }
}

export const campusSummary = createCampusSummary(studentProfiles)

export function studentsForCohort(cohort: string): StudentPreview[] {
  if (cohort === 'All') return studentProfiles
  return studentProfiles.filter((student) => student.year === cohort)
}

export function profileTitle(profileId: string): string {
  return profileLabel(profileId)
}
