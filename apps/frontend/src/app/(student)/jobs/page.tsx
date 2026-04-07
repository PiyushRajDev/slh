"use client";

import { useEffect, useState, useMemo } from "react";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MatchDetailsDialog } from "@/components/jobs/MatchDetailsDialog";
import { getStudentJobs, ApiError } from "@/lib/api-client";
import {
  Building2,
  CalendarClock,
  DollarSign,
  MapPin,
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
interface StudentJob {
  id: string;
  title: string;
  company: { id: string; name: string; logoUrl?: string; industry?: string };
  ctc?: string;
  deadline?: string;
  location?: string;
  jobType?: string;
  skills: string[];
  matchScore: number;
  applicationStatus: string | null;
  applicantCount: number;
  createdAt: string;
}

// ─────────────────────────────────────────────────
// Match Score Badge
// ─────────────────────────────────────────────────
function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      : score >= 45
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
        : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";

  return (
    <Badge variant="outline" className={`text-xs font-bold px-2 ${color}`}>
      {score}% match
    </Badge>
  );
}

// ─────────────────────────────────────────────────
// Job Card
// ─────────────────────────────────────────────────
function JobCard({ job, onViewMatch }: { job: StudentJob; onViewMatch: () => void }) {
  const isApplied = !!job.applicationStatus;
  const isDeadlineSoon =
    job.deadline && new Date(job.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
  const isExpired = job.deadline && new Date(job.deadline) < new Date();

  const deadlineText = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <Card className="group bg-card/60 border-border/40 hover:border-primary/30 hover:shadow-sm transition-all duration-200 flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1 gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted border border-border/50 overflow-hidden">
            {job.company.logoUrl ? (
              <img src={job.company.logoUrl} alt={job.company.name} className="size-full object-contain p-1" />
            ) : (
              <Building2 className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-[15px] leading-snug truncate">{job.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{job.company.name}</p>
              </div>
              <MatchScoreBadge score={job.matchScore} />
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {job.ctc && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <DollarSign className="size-3 text-emerald-500" /> {job.ctc}
            </span>
          )}
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {job.location}
            </span>
          )}
          {deadlineText && (
            <span className={`flex items-center gap-1 ${isDeadlineSoon && !isExpired ? "text-amber-600 dark:text-amber-400 font-medium" : isExpired ? "text-muted-foreground/50 line-through" : ""}`}>
              <CalendarClock className="size-3" /> {deadlineText}
            </span>
          )}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          {job.jobType && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{job.jobType}</Badge>
          )}
          {isApplied && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" variant="outline">
              <CheckCircle2 className="size-2.5 mr-1" /> Applied
            </Badge>
          )}
          {isDeadlineSoon && !isExpired && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" variant="outline">
              Closing soon
            </Badge>
          )}
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 6).map((skill) => (
              <span key={skill} className="rounded-md bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary">
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className="text-[11px] text-muted-foreground self-center">+{job.skills.length - 6}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-border/40">
          <span className="text-[11px] text-muted-foreground">
            {job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onViewMatch}
            className="text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 h-7 px-3"
          >
            View Match Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────
// Filters
// ─────────────────────────────────────────────────
const MATCH_FILTERS = [
  { label: "All", min: 0 },
  { label: "70%+", min: 70 },
  { label: "45%+", min: 45 },
  { label: "< 45%", min: -1 }, // special: below 45
] as const;

// ─────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────
export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<StudentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { jobs: data } = await getStudentJobs();
        setJobs(data);
      } catch (err: any) {
        const isAuth = err instanceof ApiError && err.status === 401;
        if (!isAuth) setError(err.message ?? "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derive job types for filter dropdown
  const jobTypes = useMemo(() => {
    const types = Array.from(new Set(jobs.map((j) => j.jobType).filter(Boolean))) as string[];
    return ["All", ...types];
  }, [jobs]);

  // Apply filters
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match =
          job.title.toLowerCase().includes(q) ||
          job.company.name.toLowerCase().includes(q) ||
          job.skills.some((s) => s.includes(q));
        if (!match) return false;
      }

      // Match filter
      if (matchFilter === -1 && job.matchScore >= 45) return false;
      if (matchFilter > 0 && job.matchScore < matchFilter) return false;

      // Type filter
      if (typeFilter !== "All" && job.jobType !== typeFilter) return false;

      return true;
    });
  }, [jobs, search, matchFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: jobs.length,
    highMatch: jobs.filter((j) => j.matchScore >= 70).length,
    applied: jobs.filter((j) => !!j.applicationStatus).length,
  }), [jobs]);

  function handleApplied(jobId: string) {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, applicationStatus: "APPLIED", applicantCount: j.applicantCount + 1 } : j))
    );
  }

  return (
    <PageShell
      eyebrow="Placement Portal"
      title="Job Opportunities"
      description="Browse openings posted by your placement cell. Match scores are computed from your live skill profile."
    >
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/25">
          <AlertCircle className="size-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats strip */}
      {!loading && jobs.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-foreground">{stats.total}</span>
            <span className="text-muted-foreground">openings</span>
          </div>
          <div className="w-px bg-border/60" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.highMatch}</span>
            <span className="text-muted-foreground">strong matches (70%+)</span>
          </div>
          <div className="w-px bg-border/60" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-foreground">{stats.applied}</span>
            <span className="text-muted-foreground">applied</span>
          </div>
        </div>
      )}

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company, or skill…"
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="gap-2"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            <ChevronDown className={`size-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            {/* Match filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Match Score
              </label>
              <div className="flex gap-1">
                {MATCH_FILTERS.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => setMatchFilter(f.min)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      matchFilter === f.min
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job type filter */}
            {jobTypes.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Job Type
                </label>
                <div className="flex gap-1 flex-wrap">
                  {jobTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        typeFilter === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <Briefcase className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">
              {jobs.length === 0 ? "No job postings yet" : "No jobs match your filters"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {jobs.length === 0
                ? "Your placement cell hasn't posted any openings yet. Check back soon."
                : "Try adjusting your search or filters."}
            </p>
            {jobs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => { setSearch(""); setMatchFilter(0); setTypeFilter("All"); }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewMatch={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>
      )}

      {/* Match Details Dialog */}
      <MatchDetailsDialog
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
        onApplied={handleApplied}
      />
    </PageShell>
  );
}
