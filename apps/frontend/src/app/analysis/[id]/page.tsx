"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DimensionBars } from "@/components/analysis/dimension-bars";
import { InsightList } from "@/components/analysis/insight-list";
import { PageShell } from "@/components/app/page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnalysisById } from "@/lib/api";
import {
  extractRepoSlug,
  formatProfileLabel,
  getWeakProfilePlan,
  getScoreTone,
  type AnalysisRecord,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowRight, ShieldAlert, TrendingUp } from "lucide-react";

const scoreToneClass = {
  strong: "text-emerald-300",
  steady: "text-blue-300",
  weak: "text-amber-300",
} as const;

export default function AnalysisDetailPage() {
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const result = await getAnalysisById(params.id);
        if (!cancelled) {
          setAnalysis(result);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load analysis"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  if (loading) {
    return (
      <PageShell
        eyebrow="Report"
        title="Loading analysis"
        description="Pulling the saved report, scoring breakdown, and recommended next actions."
      >
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </PageShell>
    );
  }

  if (error || !analysis || !analysis.report) {
    return (
      <PageShell
        eyebrow="Report"
        title="We couldn&apos;t open this analysis."
        description="The record is missing, inaccessible, or incomplete."
      >
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error || "Analysis report not found."}</AlertDescription>
        </Alert>
      </PageShell>
    );
  }

  const report = analysis.report;
  const scoreTone = getScoreTone(analysis.overallScore);
  const flags = report.details.antiGaming.flags ?? [];
  const score = analysis.overallScore ?? report.summary.overallScore;
  const weakProfile = score < 20;
  const weakProfilePlan = getWeakProfilePlan(score, report, analysis.insights ?? []);

  return (
    <PageShell
      eyebrow="Report"
      title={weakProfile ? "Early-stage project, clear path forward." : "A report built for action, not admiration."}
      description="The result screen has to answer two questions immediately: what this score means, and what the student should do next."
      actions={
        <Link
          href="/analyze"
          className={cn(buttonVariants({ size: "lg" }), "h-10")}
        >
          Analyze another repo
          <ArrowRight className="size-4" />
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>{extractRepoSlug(analysis.repoUrl)}</CardTitle>
            <CardDescription>
              {formatProfileLabel(analysis.profileId ?? report.summary.profileId)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                <div className={cn("text-6xl font-semibold tracking-tight", scoreToneClass[scoreTone])}>
                  {score}
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  / 100 score
                </div>
                {weakProfile ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                    <TrendingUp className="size-3.5" />
                    Growth mode
                  </div>
                ) : null}
              </div>
              <div className="space-y-3 rounded-2xl border border-border/70 bg-background/60 p-5">
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-0 bg-primary/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Confidence: {analysis.confidenceLevel ?? report.summary.confidenceLevel}
                  </Badge>
                  <Badge className="border-0 bg-blue-500/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                    Reliability: {analysis.reliabilityLevel ?? report.summary.reliabilityLevel}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  {weakProfile
                    ? "Your project is early-stage. The upside is that the next few improvements will move the score quickly."
                    : "This score reflects the strongest current profile match and the evidence found in the repository itself."}
                </p>
                {weakProfile ? (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 text-sm text-amber-100/90">
                    You are about{" "}
                    <span className="font-semibold">
                      {weakProfilePlan.pointsToForty} points
                    </span>{" "}
                    away from 40+. Focus on the first three wins below before chasing polish.
                  </div>
                ) : null}
                <div className="font-mono text-xs text-muted-foreground">
                  Commit SHA: {report.details.metrics.commit_sha ?? "Unavailable"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
              <div className="mb-4 text-sm font-semibold text-foreground">
                Dimension breakdown
              </div>
              <DimensionBars report={report} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {weakProfile ? (
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Road to 40+</CardTitle>
                <CardDescription>
                  Early-stage projects should optimize for obvious wins, not tiny refinements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weakProfilePlan.steps.map((step, index) => (
                  <div
                    key={`${step.title}-${index}`}
                    className="rounded-xl border border-border/70 bg-background/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-primary">
                            {index + 1}.
                          </span>
                          <div className="text-sm font-semibold text-foreground">
                            {step.title}
                          </div>
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {step.label}
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {step.impact}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle>{weakProfile ? "What to improve after the first wins" : "What to improve next"}</CardTitle>
              <CardDescription>
                {weakProfile
                  ? "These recommendations still matter, but they are secondary to the three biggest score movers above."
                  : "These are pulled from the scoring breakdown, not invented after the fact."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InsightList insights={analysis.insights ?? []} />
            </CardContent>
          </Card>

          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Anti-gaming</CardTitle>
              <CardDescription>
                Reliability matters almost as much as raw score.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <ShieldAlert className="size-4 text-primary" />
                <span className="font-medium text-foreground">
                  {analysis.flagCount ?? report.details.antiGaming.flagCount} flags detected
                </span>
              </div>
              {flags.length > 0 ? (
                <div className="space-y-3">
                  {flags.map((flag, index) => (
                    <div key={`${flag.type ?? "flag"}-${index}`} className="rounded-xl border border-border/70 bg-background/60 p-4">
                      <div className="font-medium text-foreground">
                        {flag.reason ?? flag.type ?? "Potential flag"}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {flag.severity ?? "review"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                  No reliability flags were raised for this analysis.
                </div>
              )}

              {report.details.selection.selectionNotes?.length ? (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-foreground">
                      Selection notes
                    </div>
                    {report.details.selection.selectionNotes.map((note, index) => (
                      <div key={`${note}-${index}`} className="text-sm text-muted-foreground">
                        {note}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
