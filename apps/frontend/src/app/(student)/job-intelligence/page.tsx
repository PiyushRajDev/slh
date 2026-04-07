"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  analyzeMarket,
  getJIReport,
  openJIStream,
  cancelJIReport,
  type JIFilters,
  type JIReport,
} from "@/lib/api-client";
import { FilterBar } from "@/components/job-intelligence/FilterBar";
import { AnalysisProgress } from "@/components/job-intelligence/AnalysisProgress";
import { ReadinessScore } from "@/components/job-intelligence/ReadinessScore";
import { SkillDemandChart } from "@/components/job-intelligence/SkillDemandChart";
import { GapAnalysisReport } from "@/components/job-intelligence/GapAnalysisReport";
import { RoadmapTimeline } from "@/components/job-intelligence/RoadmapTimeline";
import { JobResultsList } from "@/components/job-intelligence/JobResultsList";
import { AlertCircle, RefreshCw } from "lucide-react";

type PageState = "idle" | "loading" | "complete" | "error" | "cached";

interface ProgressState { progress: number; stage: string; message: string; }

export default function JobIntelligencePage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [report, setReport] = useState<JIReport | null>(null);
  const [progress, setProgress] = useState<ProgressState>({ progress: 0, stage: "pending", message: "Waiting to start..." });
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<JIFilters | null>(null);
  const closeStreamRef = useRef<(() => void) | null>(null);

  const loadReport = useCallback(async (id: string) => {
    try {
      const res = await getJIReport(id);
      setReport(res.report);
      setPageState("complete");
    } catch {
      setError("Failed to load report.");
      setPageState("error");
    }
  }, []);

  const startStream = useCallback((id: string) => {
    const close = openJIStream(id, {
      onProgress: (event) => setProgress(event),
      onComplete: async () => {
        closeStreamRef.current = null;
        await loadReport(id);
      },
      onFailed: (payload) => {
        setError(payload.error ?? "Analysis failed.");
        setPageState("error");
      },
      onTimeout: () => {
        setError("Analysis is taking longer than expected. Check back shortly.");
        setPageState("error");
      },
      onTransportError: () => {
        setError("Lost connection to server. Please retry.");
        setPageState("error");
      },
    });
    closeStreamRef.current = close;
  }, [loadReport]);

  const handleAnalyze = useCallback(async (filters: JIFilters, force = false) => {
    closeStreamRef.current?.();
    setError(null);
    setReport(null);
    setProgress({ progress: 0, stage: "pending", message: "Starting analysis..." });
    setPageState("loading");
    setLastFilters(filters);

    try {
      const res = await analyzeMarket({ ...filters, force });
      setReportId(res.reportId);

      if (res.cached) {
        await loadReport(res.reportId);
        setPageState("cached");
      } else {
        startStream(res.reportId);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to start analysis.");
      setPageState("error");
    }
  }, [loadReport, startStream]);

  const handleReanalyze = useCallback(() => {
    if (lastFilters) handleAnalyze(lastFilters, true);
  }, [lastFilters, handleAnalyze]);

  const handleCancel = useCallback(async () => {
    closeStreamRef.current?.();
    if (reportId) {
      try { await cancelJIReport(reportId); } catch {}
    }
    setPageState("idle");
  }, [reportId]);

  useEffect(() => () => { closeStreamRef.current?.(); }, []);

  return (
    <PageShell
      eyebrow="Market Intelligence"
      title="Job Market Gap Analysis"
      description="Filter by role and experience to see what skills are in demand — and exactly where your gaps are."
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <FilterBar loading={pageState === "loading"} onAnalyze={handleAnalyze} />
          </CardContent>
        </Card>

        {pageState === "loading" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <AnalysisProgress
                progress={progress.progress}
                stage={progress.stage}
                message={progress.message}
              />
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {pageState === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button size="sm" variant="outline" onClick={() => lastFilters && handleAnalyze(lastFilters)} className="ml-4">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {(pageState === "complete" || pageState === "cached") && report && (
          <div className="space-y-6">
            {pageState === "cached" && (
              <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/40 px-4 py-2 rounded-lg border border-border">
                Showing a recent analysis from {new Date(report.createdAt).toLocaleDateString()}.
                <Button size="sm" variant="ghost" onClick={handleReanalyze} className="gap-1.5">
                  <RefreshCw className="size-3.5" />Re-analyze
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="flex flex-col items-center justify-center p-6">
                <ReadinessScore score={report.readinessScore ?? 0} />
              </Card>
              <Card className="sm:col-span-2 p-6">
                <p className="text-sm text-muted-foreground mb-2">Top Demanded Skills</p>
                <div className="flex flex-wrap gap-2">
                  {report.topSkills.map(s => (
                    <span key={s} className="text-xs px-2 py-1 rounded-full bg-muted/60 border border-border">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Analyzed {report.jobsCount ?? 0} job listings for {report.role}
                </p>
              </Card>
            </div>

            <Tabs defaultValue="demand">
              <TabsList>
                <TabsTrigger value="demand">Skill Demand</TabsTrigger>
                <TabsTrigger value="gap">Gap Analysis</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="jobs">Jobs ({report.jobsCount ?? 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="demand">
                <Card>
                  <CardHeader><CardTitle className="text-base">Market Skill Demand</CardTitle></CardHeader>
                  <CardContent>
                    {report.skillsAnalysis ? (
                      <SkillDemandChart skills={report.skillsAnalysis} />
                    ) : <p className="text-sm text-muted-foreground">No data available.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gap">
                <Card>
                  <CardHeader><CardTitle className="text-base">Your Skills vs Market</CardTitle></CardHeader>
                  <CardContent>
                    {report.gapAnalysis ? (
                      <GapAnalysisReport gap={report.gapAnalysis} />
                    ) : <p className="text-sm text-muted-foreground">No data available.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roadmap">
                <Card>
                  <CardHeader><CardTitle className="text-base">Your Learning Roadmap</CardTitle></CardHeader>
                  <CardContent>
                    {report.roadmap ? (
                      <RoadmapTimeline roadmap={report.roadmap} />
                    ) : <p className="text-sm text-muted-foreground">No roadmap available.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs">
                <Card>
                  <CardHeader><CardTitle className="text-base">Job Listings Analyzed</CardTitle></CardHeader>
                  <CardContent>
                    {report.jobs ? (
                      <JobResultsList jobs={report.jobs} />
                    ) : <p className="text-sm text-muted-foreground">No jobs data.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </PageShell>
  );
}
