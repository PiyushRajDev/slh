import { useDeferredValue, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { campusSummary, cohortOptions, featuredStudents, profileTitle, studentProfiles, studentsForCohort } from '../data/talentPreview'

type PreviewMode = 'students' | 'batches'

function StatCard({
  eyebrow,
  value,
  caption,
}: {
  eyebrow: string
  value: string
  caption: string
}) {
  return (
    <article className="card-rise rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
      <p className="mt-3 display-face text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{caption}</p>
    </article>
  )
}

function scoreTone(score: number): string {
  if (score >= 78) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (score >= 58) return 'bg-sky-100 text-sky-800 border-sky-200'
  if (score >= 38) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-rose-100 text-rose-800 border-rose-200'
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return 'No recent submission captured'
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(timestamp)
}

function relativeDays(timestamp: number | null): string {
  if (!timestamp) return 'No recent activity'
  const days = Math.max(0, Math.round((Date.now() - timestamp) / (24 * 60 * 60 * 1000)))
  return days === 0 ? 'Active today' : `${days} day${days === 1 ? '' : 's'} ago`
}

function difficultyPercent(value: number, total: number): string {
  if (total <= 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export default function TalentPreviewPage({ mode }: { mode: PreviewMode }) {
  const { token, user, logout } = useAuth()
  const [selectedStudentId, setSelectedStudentId] = useState(studentProfiles[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [selectedCohort, setSelectedCohort] = useState('All')
  const deferredSearch = useDeferredValue(search)

  const selectedStudent =
    studentProfiles.find((student) => student.id === selectedStudentId) ?? studentProfiles[0]

  const studentMatches = studentProfiles
    .filter((student) => {
      if (!deferredSearch.trim()) return true
      const term = deferredSearch.trim().toLowerCase()
      return (
        student.name.toLowerCase().includes(term) ||
        student.uid.toLowerCase().includes(term) ||
        student.githubUsername.toLowerCase().includes(term) ||
        student.leetcodeUsername.toLowerCase().includes(term)
      )
    })
    .slice(0, 10)

  const cohortStudents = studentsForCohort(selectedCohort)
  const filteredTopTalent = campusSummary.topTalent.filter((student) => selectedCohort === 'All' || student.year === selectedCohort).slice(0, 6)
  const filteredSupport = campusSummary.supportNeeded.filter((student) => selectedCohort === 'All' || student.year === selectedCohort).slice(0, 6)
  const filteredMomentum = campusSummary.momentumWatch.filter((student) => selectedCohort === 'All' || student.year === selectedCohort).slice(0, 6)
  const filteredCohorts = campusSummary.cohorts.filter((cohort) => selectedCohort === 'All' || cohort.cohort === selectedCohort)
  const filteredDistribution = cohortStudents.reduce<Record<string, number>>((accumulator, student) => {
    accumulator[student.githubBestProfile] = (accumulator[student.githubBestProfile] ?? 0) + 1
    return accumulator
  }, {})

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_60px_rgba(16,35,61,0.12)] backdrop-blur sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                Temporary Talent Preview
              </span>
              <div className="space-y-3">
                <h1 className="display-face text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                  {mode === 'students'
                    ? 'A student dashboard that turns raw activity into clear next steps.'
                    : 'A batch command center that helps colleges spot momentum, strength, and support gaps.'}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Built from the current `student-results.json` and `student-summary.csv` snapshot so we can test messaging, hierarchy, and flow before investing in a long-term product surface.
                </p>
              </div>
            </div>

            <div className="float-card rounded-[28px] border border-[#f7b267]/30 bg-[linear-gradient(135deg,#10233d_0%,#1e3a5f_45%,#f7b267_140%)] p-5 text-white shadow-[0_24px_60px_rgba(16,35,61,0.22)] lg:max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Snapshot</p>
              <p className="mt-3 display-face text-3xl font-semibold">{campusSummary.totalStudents} students</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Median LeetCode score is {campusSummary.medianLeetcode} solved and median GitHub best score is {campusSummary.medianGithub}, which makes clarity and motivation especially important in the student flow.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-200/70 pt-5 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap gap-2">
              <NavLink
                to="/students"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-[0_10px_30px_rgba(16,35,61,0.18)]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`
                }
              >
                Student view
              </NavLink>
              <NavLink
                to="/batches"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-[0_10px_30px_rgba(16,35,61,0.18)]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`
                }
              >
                College view
              </NavLink>
              <Link
                to="/project-analysis"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Live analyzer
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              {token ? (
                <>
                  <span className="text-sm text-slate-600">{user?.email}</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full bg-[#f76f5e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ef5c49]"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        {mode === 'students' && selectedStudent && (
          <main className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard
                eyebrow="Student-ready UX"
                value={`${campusSummary.shortlistReadyCount}`}
                caption="students already look shortlist-ready from this snapshot, so the UI should celebrate progress without hiding gaps."
              />
              <StatCard
                eyebrow="Portfolio visibility"
                value={`${campusSummary.portfolioReadyCount}`}
                caption="students have a GitHub best score of 50 or more, making project evidence a strong secondary narrative after coding progress."
              />
              <StatCard
                eyebrow="Support opportunity"
                value={`${campusSummary.missingSignalCount}`}
                caption="students are missing either coding depth or project proof, which is where the action-focused student view can help most."
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
              <article className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(16,35,61,0.98),rgba(35,87,122,0.96)_56%,rgba(247,178,103,0.96)_140%)] p-6 text-white shadow-[0_28px_70px_rgba(16,35,61,0.28)] sm:p-8">
                <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">Student snapshot</p>
                    <h2 className="mt-3 display-face text-4xl font-semibold tracking-[-0.04em]">{selectedStudent.name}</h2>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/80">
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">{selectedStudent.uid}</span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">{selectedStudent.year} batch</span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">{profileTitle(selectedStudent.githubBestProfile)}</span>
                    </div>
                    <p className="mt-6 max-w-xl text-sm leading-7 text-white/78 sm:text-base">
                      This version is aimed at students first: the headline score is paired with proof, momentum, and a short action list so the screen feels helpful, not evaluative.
                    </p>
                  </div>

                  <div className="min-w-[220px] rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                    <p className="text-sm text-white/70">Readiness</p>
                    <div className="mt-3 flex items-end gap-3">
                      <span className="display-face text-6xl font-semibold">{selectedStudent.readinessScore}</span>
                      <span className="pb-2 text-sm text-white/70">/100</span>
                    </div>
                    <p className="mt-2 text-sm text-white/80">{selectedStudent.readinessLabel}</p>
                    <p className="mt-5 text-xs uppercase tracking-[0.22em] text-white/60">Peer percentile</p>
                    <p className="mt-1 text-2xl font-semibold">Top {Math.max(1, 100 - selectedStudent.percentile + 1)}%</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[24px] border border-white/15 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/60">LeetCode solved</p>
                    <p className="mt-2 text-3xl font-semibold">{selectedStudent.leetcodeTotal}</p>
                    <p className="mt-2 text-sm text-white/75">
                      {selectedStudent.leetcodeEasy} easy, {selectedStudent.leetcodeMedium} medium, {selectedStudent.leetcodeHard} hard
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/15 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/60">Best GitHub score</p>
                    <p className="mt-2 text-3xl font-semibold">{selectedStudent.githubBestScore}</p>
                    <p className="mt-2 text-sm text-white/75">{selectedStudent.githubReposAnalyzed} repos analyzed</p>
                  </div>
                  <div className="rounded-[24px] border border-white/15 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/60">Recent activity</p>
                    <p className="mt-2 text-3xl font-semibold">{selectedStudent.recent90Days}</p>
                    <p className="mt-2 text-sm text-white/75">{relativeDays(selectedStudent.lastSubmissionAt)}</p>
                  </div>
                </div>
              </article>

              <aside className="space-y-4">
                <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur">
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500" htmlFor="student-search">
                    Find a student
                  </label>
                  <input
                    id="student-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, UID, GitHub, or LeetCode"
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {featuredStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => setSelectedStudentId(student.id)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        {student.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 space-y-2">
                    {studentMatches.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          student.id === selectedStudent.id
                            ? 'border-slate-900 bg-slate-950 text-white'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className={`text-xs ${student.id === selectedStudent.id ? 'text-white/70' : 'text-slate-500'}`}>{student.uid}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${student.id === selectedStudent.id ? 'border-white/20 bg-white/10 text-white' : scoreTone(student.readinessScore)}`}>
                          {student.readinessScore}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#f7b267]/40 bg-[#fff5e9] p-5 shadow-[0_18px_50px_rgba(247,178,103,0.15)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Next best move</p>
                  <div className="mt-4 space-y-3">
                    {selectedStudent.recommendations.map((recommendation) => (
                      <div key={recommendation} className="rounded-2xl bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700">
                        {recommendation}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Skill composition</p>
                    <h3 className="mt-2 display-face text-3xl font-semibold tracking-[-0.03em] text-slate-950">Balanced feedback, not just one number</h3>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                    Last seen {formatDate(selectedStudent.lastSubmissionAt)}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-emerald-900">
                      <span>Easy</span>
                      <span>{difficultyPercent(selectedStudent.leetcodeEasy, selectedStudent.leetcodeTotal)}</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: difficultyPercent(selectedStudent.leetcodeEasy, selectedStudent.leetcodeTotal) }} />
                    </div>
                    <p className="mt-3 text-sm text-emerald-900/80">{selectedStudent.leetcodeEasy} solved</p>
                  </div>

                  <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-sky-900">
                      <span>Medium</span>
                      <span>{difficultyPercent(selectedStudent.leetcodeMedium, selectedStudent.leetcodeTotal)}</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-sky-100">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: difficultyPercent(selectedStudent.leetcodeMedium, selectedStudent.leetcodeTotal) }} />
                    </div>
                    <p className="mt-3 text-sm text-sky-900/80">{selectedStudent.leetcodeMedium} solved</p>
                  </div>

                  <div className="rounded-[24px] border border-violet-100 bg-violet-50 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-violet-900">
                      <span>Hard</span>
                      <span>{difficultyPercent(selectedStudent.leetcodeHard, selectedStudent.leetcodeTotal)}</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-violet-100">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: difficultyPercent(selectedStudent.leetcodeHard, selectedStudent.leetcodeTotal) }} />
                    </div>
                    <p className="mt-3 text-sm text-violet-900/80">{selectedStudent.leetcodeHard} solved</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Signals we would highlight</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedStudent.strengths.map((strength) => (
                        <span key={strength} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Profile context</p>
                    <dl className="mt-4 space-y-3 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-4">
                        <dt>LeetCode ranking</dt>
                        <dd className="font-semibold">{selectedStudent.leetcodeRanking ? `#${selectedStudent.leetcodeRanking.toLocaleString()}` : 'Not available'}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt>LeetCode contests</dt>
                        <dd className="font-semibold">{selectedStudent.leetcodeContests}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt>GitHub average score</dt>
                        <dd className="font-semibold">{selectedStudent.githubAverageScore}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt>Processing duration</dt>
                        <dd className="font-semibold">{selectedStudent.durationSeconds.toFixed(1)} sec</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>

              <aside className="space-y-6">
                <article className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Recent submissions</p>
                  <div className="mt-4 space-y-3">
                    {selectedStudent.recentSubmissions.slice(0, 6).map((submission) => (
                      <div key={`${submission.title}-${submission.timestamp}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">{submission.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{formatDate(submission.timestamp)}</p>
                      </div>
                    ))}
                    {selectedStudent.recentSubmissions.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                        No recent LeetCode submission list available for this student.
                      </p>
                    )}
                  </div>
                </article>

                <article className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Project highlights</p>
                  <div className="mt-4 space-y-3">
                    {selectedStudent.repoHighlights.map((repo) => (
                      <a
                        key={repo.repoUrl}
                        href={repo.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-slate-900">{repo.repoName}</p>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(repo.score)}`}>{repo.score}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{profileTitle(repo.profileId)}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{repo.confidenceLevel} confidence</p>
                      </a>
                    ))}
                    {selectedStudent.repoHighlights.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                        No GitHub repository detail is available in this snapshot.
                      </p>
                    )}
                  </div>
                </article>
              </aside>
            </section>
          </main>
        )}

        {mode === 'batches' && (
          <main className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard
                eyebrow="Coding active"
                value={`${campusSummary.codingActiveCount}`}
                caption="students solved at least one LeetCode problem in the imported dataset."
              />
              <StatCard
                eyebrow="Portfolio ready"
                value={`${campusSummary.portfolioReadyCount}`}
                caption="students crossed a GitHub best score of 50 or more."
              />
              <StatCard
                eyebrow="Shortlist ready"
                value={`${campusSummary.shortlistReadyCount}`}
                caption="students reached the top readiness bucket by combining coding depth and project proof."
              />
              <StatCard
                eyebrow="Missing signals"
                value={`${campusSummary.missingSignalCount}`}
                caption="students need either stronger coding evidence, stronger project proof, or both."
              />
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Filter by cohort</p>
                  <h2 className="mt-2 display-face text-3xl font-semibold tracking-[-0.03em] text-slate-950">Batch health at a glance</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cohortOptions.map((cohort) => (
                    <button
                      key={cohort}
                      type="button"
                      onClick={() => setSelectedCohort(cohort)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        cohort === selectedCohort
                          ? 'bg-slate-950 text-white shadow-[0_10px_30px_rgba(16,35,61,0.18)]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cohort}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <article className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Cohort comparison</p>
                      <p className="mt-2 text-sm text-slate-600">Average coding, average portfolio score, and readiness rate by batch.</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-4">
                    {filteredCohorts.map((cohort) => (
                      <div key={cohort.cohort} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{cohort.cohort}</p>
                            <p className="text-sm text-slate-500">{cohort.studentCount} students</p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(cohort.readyRate)}`}>
                            {cohort.readyRate}% ready
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Avg LeetCode</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{cohort.avgLeetcode}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Avg GitHub</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{cohort.avgGithub}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Momentum</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{cohort.momentumRate}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Portfolio profile mix</p>
                  <p className="mt-2 text-sm text-slate-600">Useful for placement conversations and identifying where project quality is clustering.</p>
                  <div className="mt-5 space-y-3">
                    {Object.entries(filteredDistribution)
                      .sort((left, right) => right[1] - left[1])
                      .map(([profileId, count]) => {
                        const width = `${Math.max(10, Math.round((count / Math.max(cohortStudents.length, 1)) * 100))}%`
                        return (
                          <div key={profileId} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-4">
                              <p className="font-semibold text-slate-900">{profileTitle(profileId)}</p>
                              <p className="text-sm text-slate-500">{count} students</p>
                            </div>
                            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-[linear-gradient(90deg,#10233d,#2f8f9d,#f7b267)]" style={{ width }} />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </article>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <article className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur xl:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Shortlist ready</p>
                <div className="mt-4 space-y-3">
                  {filteredTopTalent.map((student) => (
                    <div key={student.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{student.uid}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(student.readinessScore)}`}>
                          {student.readinessScore}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-slate-600">
                        <span>LC {student.leetcodeTotal}</span>
                        <span>GH {student.githubBestScore}</span>
                        <span>{profileTitle(student.githubBestProfile)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur xl:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Needs intervention</p>
                <div className="mt-4 space-y-3">
                  {filteredSupport.map((student) => (
                    <div key={student.id} className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{student.uid}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(student.readinessScore)}`}>
                          {student.readinessScore}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{student.recommendations[0]}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(16,35,61,0.08)] backdrop-blur xl:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Momentum watch</p>
                <div className="mt-4 space-y-3">
                  {filteredMomentum.map((student) => (
                    <div key={student.id} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{student.uid}</p>
                        </div>
                        <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                          {student.recent90Days} acts
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{profileTitle(student.githubBestProfile)}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </main>
        )}
      </div>
    </div>
  )
}
