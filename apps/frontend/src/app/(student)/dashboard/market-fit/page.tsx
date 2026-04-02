"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/app/page-shell";
import { MarketFitForm } from "@/components/market-fit/market-fit-form";
import { MarketFitReport } from "@/components/market-fit/market-fit-report";
import { MarketFitStatus } from "@/components/market-fit/market-fit-status";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getMarketFitReport, getMarketFitStatus, submitMarketFitAnalysis } from "@/lib/api-client";
import {
  normalizeMarketFitReport,
  type MarketFitReport as MarketFitReportData,
  type MarketFitRequest,
  type MarketFitStatusResponse,
} from "@/lib/market-fit";
import { AlertCircle, RefreshCw } from "lucide-react";

const STORAGE_KEY = "slh.market-fit.latest";

type ViewStatus = "idle" | "submitting" | "processing" | "success" | "error";

type CachedMarketFitState = {
  form: MarketFitRequest;
  report: MarketFitReportData;
};

const DEFAULT_FORM: MarketFitRequest = {
  role: "Backend Developer",
  seniority: "Fresher",
  salaryRange: "8-12 LPA",
};

function readCachedState(): CachedMarketFitState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedMarketFitState;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const report = normalizeMarketFitReport(parsed.report);
    if (!report) {
      return null;
    }

    return {
      form: parsed.form ?? DEFAULT_FORM,
      report,
    };
  } catch {
    return null;
  }
}

function persistCachedState(next: CachedMarketFitState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function MarketFitPage() {
  const [form, setForm] = useState<MarketFitRequest>(DEFAULT_FORM);
  const [jobId, setJobId] = useState<string | null>(null);
  const [viewStatus, setViewStatus] = useState<ViewStatus>("idle");
  const [jobStatus, setJobStatus] = useState<MarketFitStatusResponse | null>(null);
  const [report, setReport] = useState<MarketFitReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(true);

  function commitReport(nextReport: MarketFitReportData, nextForm: MarketFitRequest) {
    setError(null);
    setReport(nextReport);
    setViewStatus("success");
    persistCachedState({
      form: nextForm,
      report: nextReport,
    });
  }

  function restoreCachedReport(message: string) {
    const cached = readCachedState();
    if (!cached) {
      return false;
    }

    setForm(cached.form);
    setNotice(message);
    commitReport(cached.report, cached.form);
    return true;
  }

  async function hydrateLatestReport() {
    try {
      const latest = await getMarketFitReport("me");
      const normalized = normalizeMarketFitReport(latest);
      if (!normalized) {
        throw new Error("Latest market-fit report was not usable.");
      }

      commitReport(normalized, form);
    } catch {
      const cached = readCachedState();
      if (cached) {
        setForm(cached.form);
        setReport(cached.report);
        setViewStatus("success");
        setNotice("Loaded your last saved real market baseline.");
      }
    } finally {
      setHydrating(false);
    }
  }

  useEffect(() => {
    hydrateLatestReport();
  }, []);

  useEffect(() => {
    if (!jobId || viewStatus !== "processing") {
      return;
    }

    const activeJobId = jobId;
    let cancelled = false;
    let timeoutId: number | null = null;

    async function poll() {
      try {
        const status = await getMarketFitStatus(activeJobId);
        if (cancelled) {
          return;
        }

        setJobStatus(status);

        if (status.state === "completed") {
          try {
            const latest = await getMarketFitReport("me");
            if (cancelled) {
              return;
            }

            const normalized = normalizeMarketFitReport(latest);
            if (!normalized) {
              throw new Error("The completed market baseline payload was not usable.");
            }

            setNotice(
              normalized.dataFreshness === "recent_cache"
                ? "Using a recent cached market baseline for this target role."
                : "Loaded a fresh market baseline for this target role."
            );
            commitReport(normalized, form);
          } catch (loadError) {
            if (!cancelled) {
              if (
                !restoreCachedReport(
                  "The live run completed, but the saved result could not be loaded. Showing your last real market baseline instead."
                )
              ) {
                setError(
                  loadError instanceof Error
                    ? loadError.message
                    : "The market baseline finished, but the result could not be loaded."
                );
                setViewStatus("error");
              }
            }
          }
          return;
        }

        if (status.state === "failed") {
          if (!cancelled) {
            const failureMessage =
              status.failedReason ?? "We could not load recent market data for this role.";
            if (
              !restoreCachedReport(
                `${failureMessage} Showing your last saved real market baseline instead.`
              )
            ) {
              setError(failureMessage);
              setViewStatus("error");
            }
          }
          return;
        }

        timeoutId = window.setTimeout(poll, 2500);
      } catch (pollError) {
        if (!cancelled) {
          const message =
            pollError instanceof Error
              ? pollError.message
              : "We lost contact with the market-fit analyzer.";

          if (!restoreCachedReport(`${message} Showing your last saved real market baseline instead.`)) {
            setError(message);
            setViewStatus("error");
          }
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [form, jobId, viewStatus]);

  async function startAnalysis() {
    if (!form.role.trim()) {
      setError("Role is required.");
      setViewStatus("error");
      return;
    }

    if (!form.seniority.trim()) {
      setError("Experience level is required.");
      setViewStatus("error");
      return;
    }

    setError(null);
    setNotice(null);
    setJobStatus(null);
    setViewStatus("submitting");

    try {
      const response = await submitMarketFitAnalysis(form);
      setJobId(response.jobId);
      setViewStatus("processing");
    } catch (submitError) {
      const message =
        submitError instanceof ApiError
          ? submitError.message
          : submitError instanceof Error
            ? submitError.message
            : "Failed to start market-fit analysis.";

      if (!restoreCachedReport(`${message} Showing your last saved real market baseline instead.`)) {
        setError(message);
        setViewStatus("error");
      }
    }
  }

  async function retryAnalysis() {
    await startAnalysis();
  }

  if (hydrating) {
    return (
      <PageShell
        eyebrow="Market Fit"
        title="Loading your market-fit workspace"
        description="Pulling your last saved market baseline and preparing the live analyzer."
      >
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Market Fit"
      title="See how your proof stacks up against the current market baseline."
      description="Choose a target role and experience level, then compare your strongest evidence against the common expectations showing up in recent market demand."
      actions={
        <Button
          variant="outline"
          className="h-10"
          onClick={retryAnalysis}
          disabled={viewStatus === "submitting" || viewStatus === "processing"}
        >
          <RefreshCw className={`size-4 ${viewStatus === "processing" ? "animate-spin" : ""}`} />
          Retry
        </Button>
      }
    >
      {notice ? (
        <Alert className="border-primary/20 bg-primary/5 text-foreground">
          <AlertCircle className="size-4" />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="space-y-6">
          <MarketFitForm
            values={form}
            disabled={viewStatus === "submitting" || viewStatus === "processing"}
            error={viewStatus === "error" ? error : null}
            onChange={setForm}
            onSubmit={startAnalysis}
          />

          <MarketFitStatus
            jobId={jobId}
            status={viewStatus}
            polledStatus={jobStatus}
            error={error}
            reportFreshness={report?.dataFreshness}
            onRetry={retryAnalysis}
          />
        </div>

        {report ? (
          <MarketFitReport report={report} />
        ) : (
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Market baseline report</CardTitle>
              <CardDescription>
                Your readiness score, recurring market signals, proof gaps, and action roadmap will appear here once the analysis finishes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-6 text-sm leading-7 text-muted-foreground">
                Run the analyzer to build a role-level market baseline from recent listings and compare your strongest proof against the common expectations employers keep repeating.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
