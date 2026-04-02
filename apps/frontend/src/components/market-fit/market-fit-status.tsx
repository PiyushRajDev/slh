"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  getMarketFitFreshnessLabel,
  getMarketFitProgress,
  getMarketFitStatusLabel,
  type MarketFitFreshness,
  type MarketFitStatusResponse,
} from "@/lib/market-fit";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface MarketFitStatusProps {
  jobId: string | null;
  status: "idle" | "submitting" | "processing" | "success" | "error";
  polledStatus: MarketFitStatusResponse | null;
  reportFreshness?: MarketFitFreshness;
  error?: string | null;
  onRetry: () => void;
}

export function MarketFitStatus({
  jobId,
  status,
  polledStatus,
  reportFreshness,
  error,
  onRetry,
}: MarketFitStatusProps) {
  const progress = status === "success" ? 100 : getMarketFitProgress(polledStatus);
  const label = status === "submitting" ? "Queueing market analysis" : getMarketFitStatusLabel(polledStatus);

  return (
    <Card className="bg-card/70">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Market Signal Status</CardTitle>
          {reportFreshness ? (
            <Badge variant="outline" className="text-[11px] uppercase tracking-[0.18em]">
              {getMarketFitFreshnessLabel(reportFreshness)}
            </Badge>
          ) : null}
        </div>
        <CardDescription>
          The analyzer builds a role-level market baseline from recent listings, then compares your current proof against it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Current state
              </div>
              <div className="mt-1 font-semibold text-foreground">{label}</div>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {jobId ?? "Job id will appear here"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Processing progress</span>
            <span className="font-mono text-xs text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {status === "processing" || status === "submitting" ? (
          <div className="space-y-3 rounded-2xl border border-border/70 bg-background/40 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <RefreshCw className="size-4 animate-spin text-primary" />
              Building the market baseline without blocking your screen
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              We keep polling until the real market baseline is ready, so you can stay on the page without manually refreshing.
            </p>
          </div>
        ) : null}

        {status === "success" ? (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
            <CheckCircle2 className="size-4" />
            <AlertDescription>
              {reportFreshness === "recent_cache"
                ? "A recent cached market baseline was loaded successfully. Your capability breakdown is shown below."
                : "Market baseline ready. Your capability breakdown is shown below."}
            </AlertDescription>
          </Alert>
        ) : null}

        {status === "error" ? (
          <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error ?? "Market-fit analysis failed."}</AlertDescription>
            </Alert>
            <Button variant="outline" className="h-10" onClick={onRetry}>
              Retry analysis
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
