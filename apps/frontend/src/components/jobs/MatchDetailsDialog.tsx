"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getJobMatchReport, applyToJob, ApiError } from "@/lib/api-client";
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Zap,
  Building2,
  CalendarClock,
  DollarSign,
  MapPin,
  AlertCircle,
  ExternalLink,
  Minus,
} from "lucide-react";

// ─────────────────────────────────────────────────
// Types (mirror API response shapes)
// ─────────────────────────────────────────────────
interface MatchedSkill {
  slug: string;
  name: string;
  category: string;
  userScore: number;
  demandScore: number;
}

interface MissingSkill {
  slug: string;
  name: string;
  category: string;
  demandScore: number;
  gapScore: number;
}

interface LearningPath {
  slug: string;
  name: string;
  category: string;
  recommendation: string | null;
  projectSuggestion: string | null;
  estimatedWeeks: number;
}

interface MatchReport {
  matchScore: number;
  verdict: "Competitive" | "Ready" | "Not Ready";
  matchedSkills: MatchedSkill[];
  partialSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  learningPaths: LearningPath[];
}

interface SimilarJob {
  id: string;
  title: string;
  ctc?: string;
  deadline?: string;
}

interface JobDetail {
  id: string;
  title: string;
  description: string;
  company: { name: string; logoUrl?: string; website?: string; industry?: string; location?: string };
  ctc?: string;
  eligibility?: string;
  deadline?: string;
  location?: string;
  jobType?: string;
  skills: string[];
}

// ─────────────────────────────────────────────────
// Score Ring
// ─────────────────────────────────────────────────
function ScoreRing({ score, verdict }: { score: number; verdict: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "stroke-emerald-500" : score >= 45 ? "stroke-amber-500" : "stroke-red-500";
  const bgColor =
    score >= 70 ? "text-emerald-500" : score >= 45 ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-28">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={`${color} transition-all duration-700`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black ${bgColor}`}>{score}%</span>
          <span className="text-[10px] text-muted-foreground font-medium">Match</span>
        </div>
      </div>
      <Badge
        className={
          score >= 70
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            : score >= 45
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
        }
        variant="outline"
      >
        {verdict}
      </Badge>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Skill Row
// ─────────────────────────────────────────────────
function SkillRow({ name, category, icon: Icon, colorClass }: {
  name: string;
  category: string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Icon className={`size-4 shrink-0 ${colorClass}`} />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="ml-2 text-[11px] text-muted-foreground">{category}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Learning Path Card
// ─────────────────────────────────────────────────
function LearningPathCard({ path }: { path: LearningPath }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{path.name}</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" /> ~{path.estimatedWeeks}w
        </span>
      </div>
      {path.recommendation && (
        <p className="text-xs text-muted-foreground flex gap-1.5">
          <BookOpen className="size-3.5 shrink-0 mt-0.5 text-primary" />
          {path.recommendation}
        </p>
      )}
      {path.projectSuggestion && (
        <p className="text-xs text-muted-foreground flex gap-1.5">
          <Zap className="size-3.5 shrink-0 mt-0.5 text-amber-500" />
          {path.projectSuggestion}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────────
interface MatchDetailsDialogProps {
  jobId: string | null;
  onClose: () => void;
  onApplied?: (jobId: string) => void;
}

export function MatchDetailsDialog({ jobId, onClose, onApplied }: MatchDetailsDialogProps) {
  const [data, setData] = useState<{ job: JobDetail; match: MatchReport; similarJobs: SimilarJob[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"overview" | "skills" | "paths">("overview");

  const open = !!jobId;

  async function loadData(id: string) {
    setLoading(true);
    setError("");
    setData(null);
    setApplied(false);
    setActiveSection("overview");
    try {
      const result = await getJobMatchReport(id);
      setData(result);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to load match details");
    } finally {
      setLoading(false);
    }
  }

  // Load when jobId changes
  const prevJobId = useState<string | null>(null);
  if (open && jobId !== prevJobId[0]) {
    prevJobId[1](jobId);
    loadData(jobId!);
  }

  async function handleApply() {
    if (!jobId || applied) return;
    setApplying(true);
    try {
      await applyToJob(jobId);
      setApplied(true);
      onApplied?.(jobId);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  }

  const { match, job, similarJobs } = data ?? {};
  const totalSkills = (match?.matchedSkills.length ?? 0) + (match?.partialSkills.length ?? 0) + (match?.missingSkills.length ?? 0);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/50 overflow-hidden">
              {job?.company.logoUrl ? (
                <img src={job.company.logoUrl} alt={job.company.name} className="size-full object-contain" />
              ) : (
                <Building2 className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg leading-tight">
                {loading ? <Skeleton className="h-5 w-48" /> : (job?.title ?? "")}
              </DialogTitle>
              <div className="text-sm text-muted-foreground mt-0.5">
                {loading ? <Skeleton className="h-3.5 w-32 mt-1" /> : job?.company.name}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="px-6 pt-4">
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {loading ? (
            <div className="px-6 py-6 space-y-4">
              <div className="flex justify-center"><Skeleton className="size-28 rounded-full" /></div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : data ? (
            <div className="divide-y divide-border/60">

              {/* Score + Meta */}
              <div className="px-6 py-5 flex flex-col sm:flex-row items-center gap-6">
                <ScoreRing score={match!.matchScore} verdict={match!.verdict} />
                <div className="flex-1 space-y-2.5 w-full">
                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/20 p-2.5">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {match!.matchedSkills.length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Matched</div>
                    </div>
                    <div className="rounded-lg bg-amber-500/8 border border-amber-500/20 p-2.5">
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {match!.partialSkills.length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Partial</div>
                    </div>
                    <div className="rounded-lg bg-red-500/8 border border-red-500/20 p-2.5">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {match!.missingSkills.length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Missing</div>
                    </div>
                  </div>

                  {/* Job meta */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {job?.ctc && <span className="flex items-center gap-1"><DollarSign className="size-3" />{job.ctc}</span>}
                    {job?.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{job.location}</span>}
                    {job?.deadline && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="size-3" />
                        {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="px-6 py-2 flex gap-1">
                {(["overview", "skills", "paths"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSection(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeSection === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {s === "overview" ? "Overview" : s === "skills" ? `Skills (${totalSkills})` : `Learning Paths (${match!.learningPaths.length})`}
                  </button>
                ))}
              </div>

              {/* Overview */}
              {activeSection === "overview" && (
                <div className="px-6 py-4 space-y-4">
                  {job?.eligibility && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                        Eligibility
                      </h4>
                      <p className="text-sm text-foreground">{job.eligibility}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                      Description
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">{job?.description}</p>
                  </div>

                  {similarJobs && similarJobs.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Similar Roles at {job?.company.name}
                      </h4>
                      <div className="space-y-1.5">
                        {similarJobs.map((sj) => (
                          <div key={sj.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                            <span className="text-sm font-medium">{sj.title}</span>
                            {sj.ctc && <span className="text-xs text-muted-foreground">{sj.ctc}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Breakdown */}
              {activeSection === "skills" && (
                <div className="px-6 py-4 space-y-4">
                  {match!.matchedSkills.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" /> You have these
                      </h4>
                      <div className="divide-y divide-border/40">
                        {match!.matchedSkills.map((s) => (
                          <SkillRow key={s.slug} name={s.name} category={s.category} icon={CheckCircle2} colorClass="text-emerald-500" />
                        ))}
                      </div>
                    </div>
                  )}

                  {match!.partialSkills.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                        <Minus className="size-3.5" /> Partially matched
                      </h4>
                      <div className="divide-y divide-border/40">
                        {match!.partialSkills.map((s) => (
                          <SkillRow key={s.slug} name={s.name} category={s.category} icon={Minus} colorClass="text-amber-500" />
                        ))}
                      </div>
                    </div>
                  )}

                  {match!.missingSkills.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                        <XCircle className="size-3.5" /> Missing skills
                      </h4>
                      <div className="divide-y divide-border/40">
                        {match!.missingSkills.map((s) => (
                          <SkillRow key={s.slug} name={s.name} category={s.category} icon={XCircle} colorClass="text-red-500" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Learning Paths */}
              {activeSection === "paths" && (
                <div className="px-6 py-4">
                  {match!.learningPaths.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium">No gaps to fill!</p>
                      <p className="text-xs text-muted-foreground">You already have all required skills.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-xs text-muted-foreground mb-3">
                        Estimated time to close all gaps: ~{match!.learningPaths.reduce((sum, p) => sum + p.estimatedWeeks, 0)} weeks
                      </p>
                      {match!.learningPaths.map((path) => (
                        <LearningPathCard key={path.slug} path={path} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {data && (
          <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between gap-3 shrink-0 bg-card/50">
            {job?.company.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="size-3.5" /> Company site
              </a>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={applying || applied}
                className={applied ? "bg-emerald-600 hover:bg-emerald-600 text-white" : ""}
              >
                {applied ? (
                  <><CheckCircle2 className="size-4 mr-1.5" /> Applied</>
                ) : applying ? (
                  "Applying…"
                ) : (
                  "Mark as Applied"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
