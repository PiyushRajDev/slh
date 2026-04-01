"use client";

import { FormEvent, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/app/page-shell";
import { StatusTimeline } from "@/components/analysis/status-timeline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ApiError, buildGitHubConnectUrl, openAnalysisStream, submitAnalysis } from "@/lib/api";
import {
  extractRepoSlug,
  getAnalysisFailureContent,
  getProgressPercent,
  type AnalysisProgressEvent,
  type AnalysisFailureCode,
  type AnalysisStage,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

type SubmissionState = "idle" | "submitting" | "processing" | "error" | "completed";
type AnalysisErrorState = {
  code?: AnalysisFailureCode | string;
  message: string;
};

export default function AnalyzePage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [currentStage, setCurrentStage] = useState<AnalysisStage | null>(null);
  const [currentDetail, setCurrentDetail] = useState<Record<string, unknown> | undefined>();
  const [errorState, setErrorState] = useState<AnalysisErrorState | null>(null);

  useEffect(() => {
    if (!jobId || status !== "processing") {
      return;
    }

    const close = openAnalysisStream(jobId, {
      onProgress: (event: AnalysisProgressEvent) => {
        setCurrentStage(event.stage);
        setCurrentDetail(event.detail);
      },
      onComplete: async (payload) => {
        setErrorState(null);
        setStatus("completed");

        if (payload.analysisId) {
          startTransition(() => router.push(`/analysis/${payload.analysisId}`));
          return;
        }

        startTransition(() => router.push("/dashboard"));
      },
      onFailed: (payload) => {
        setErrorState({
          code: payload.code,
          message: payload.error ?? "Analysis failed",
        });
        setStatus("error");
      },
      onTimeout: (payload) => {
        setErrorState({
          code: payload.code,
          message: payload.error ?? "Analysis timed out",
        });
        setStatus("error");
      },
      onTransportError: (payload) => {
        setErrorState({
          code: payload.code,
          message: payload.error ?? "The live analysis stream disconnected.",
        });
        setStatus("error");
      },
    });

    return close;
  }, [jobId, router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!repoUrl) {
      return;
    }

    setStatus("submitting");
    setErrorState(null);
    setCurrentStage(null);
    setCurrentDetail(undefined);

    try {
      const result = await submitAnalysis(repoUrl);
      setJobId(result.jobId);
      setStatus("processing");
    } catch (submitError) {
      setErrorState({
        code: submitError instanceof ApiError ? submitError.code : undefined,
        message:
          submitError instanceof Error
            ? submitError.message
            : "Failed to queue analysis",
      });
      setStatus("error");
    }
  }

  const isProcessing = status === "processing" || status === "completed";
  const failureContent = errorState
    ? getAnalysisFailureContent(errorState.code, errorState.message)
    : null;
  const showDashboardAction =
    errorState?.code === "STREAM_TIMEOUT" ||
    errorState?.code === "STREAM_DISCONNECTED";
  const showGitHubAction = errorState?.code === "GITHUB_NOT_CONNECTED";

  return (
    <PageShell
      eyebrow="Analyze"
      title="Submit a repository, then watch the engine think."
      description="This screen has one job: make the pipeline feel alive and trustworthy while the report is being prepared."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Public GitHub repository</CardTitle>
            <CardDescription>
              Use a repository from the GitHub account linked to your SLH profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Repository URL
                </label>
                <Input
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="h-10 font-mono"
                  autoFocus
                  required
                />
              </div>

              {errorState ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{errorState?.message}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="h-10 w-full"
                disabled={status === "submitting" || status === "processing"}
              >
                {status === "submitting" ? "Queueing analysis..." : "Start analysis"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle>Live processing state</CardTitle>
            <CardDescription>
              The UI only advances when real backend events arrive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Analyzing
                  </div>
                  <div className="mt-1 font-semibold text-foreground">
                    {repoUrl ? extractRepoSlug(repoUrl) : "github.com/user/repo"}
                  </div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {jobId ?? "Queued job id will appear here"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Pipeline progress</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {getProgressPercent(currentStage)}%
                </span>
              </div>
              <Progress value={getProgressPercent(currentStage)} />
            </div>

            {isProcessing ? (
              <>
                <StatusTimeline currentStage={currentStage} currentDetail={currentDetail} />
                {status === "completed" ? (
                  <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                    <CheckCircle2 className="size-4" />
                    <AlertDescription>
                      Analysis complete. Opening the result screen now.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </>
            ) : status === "error" && failureContent ? (
              <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-foreground">
                    {failureContent.title}
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {failureContent.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {showGitHubAction ? (
                    <Button
                      size="lg"
                      className="h-10"
                      onClick={() => window.location.assign(buildGitHubConnectUrl())}
                    >
                      Connect GitHub
                    </Button>
                  ) : null}
                  {showDashboardAction ? (
                    <Link
                      href="/dashboard"
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}
                    >
                      Check dashboard
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
                Submit a repository and this panel will narrate every stage from cloning through final report generation.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
