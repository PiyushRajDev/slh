"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getMarketFitFreshnessLabel,
  getMarketFitScoreTone,
  getMarketFitVerdictCopy,
  type MarketFitCapabilityItem,
  type MarketFitReport,
  type MarketFitSignalItem,
} from "@/lib/market-fit";
import {
  Activity,
  CheckCircle2,
  Sparkles,
  Target,
  TriangleAlert,
  XCircle,
} from "lucide-react";

function CapabilityList({
  title,
  description,
  items,
  icon,
}: {
  title: string;
  description: string;
  items: MarketFitCapabilityItem[];
  icon: ReactNode;
}) {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={`${title}-${item.title}`}
              className="rounded-2xl border border-border/70 bg-background/60 p-4"
            >
              <div className="text-sm font-semibold text-foreground">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
            Nothing to show in this section yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MarketSignalList({ items }: { items: MarketFitSignalItem[] }) {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <CardTitle>Top Market Signals</CardTitle>
        </div>
        <CardDescription>
          These are the recurring requirements showing up most strongly across the recent baseline for this role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={`${item.title}-${item.listingCount}`}
              className="rounded-2xl border border-border/70 bg-background/60 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <Badge variant="outline" className="text-[11px] uppercase tracking-[0.18em]">
                  {Math.round(item.demandScore * 100)}/100 demand
                </Badge>
                <Badge variant="outline" className="text-[11px] uppercase tracking-[0.18em]">
                  {Math.round(item.frequency * 100)}% recurrence
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
            No market-signal detail is available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MarketFitReport({ report }: { report: MarketFitReport }) {
  const scoreTone = getMarketFitScoreTone(report.verdict);

  return (
    <div className="space-y-6">
      <Card className="bg-card/80">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Readiness For {report.baselineRole}</CardTitle>
            <Badge variant="outline" className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
              {report.baselineSeniority}
            </Badge>
            <Badge variant="outline" className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
              {getMarketFitFreshnessLabel(report.dataFreshness)}
            </Badge>
          </div>
          <CardDescription>
            This report compares your strongest proof against the common-core expectations showing up in the current market baseline.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
            <div className={`text-6xl font-semibold tracking-tight ${scoreTone}`}>
              {report.readinessScore}
            </div>
            <div className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              / 100 readiness
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-border/70 bg-background/60 p-5">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-0 bg-primary/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {report.verdict}
              </Badge>
              <Badge variant="outline" className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                {report.sampleSize} listings sampled
              </Badge>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              {getMarketFitVerdictCopy(report.verdict)}
            </p>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Baseline updated {new Date(report.generatedAt).toLocaleString()}
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Strong proof
                </div>
                <div className="mt-1 text-2xl font-semibold text-emerald-300">
                  {report.matchedCapabilities.length}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Partial proof
                </div>
                <div className="mt-1 text-2xl font-semibold text-blue-300">
                  {report.partialCapabilities.length}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Missing proof
                </div>
                <div className="mt-1 text-2xl font-semibold text-amber-300">
                  {report.missingCapabilities.length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MarketSignalList items={report.topMarketSignals} />

      <div className="grid gap-6 xl:grid-cols-3">
        <CapabilityList
          title="Strong Evidence"
          description="Signals the market already expects and your current proof is already supporting."
          items={report.matchedCapabilities}
          icon={<CheckCircle2 className="size-4 text-emerald-300" />}
        />
        <CapabilityList
          title="Partial Evidence"
          description="Areas where you have momentum, but the market baseline still expects stronger proof."
          items={report.partialCapabilities}
          icon={<TriangleAlert className="size-4 text-blue-300" />}
        />
        <CapabilityList
          title="Missing Evidence"
          description="Capabilities that repeatedly show up in the target role baseline but are still weak in your profile."
          items={report.missingCapabilities}
          icon={<XCircle className="size-4 text-amber-300" />}
        />
      </div>

      <Card className="bg-card/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <CardTitle>Action Plan</CardTitle>
          </div>
          <CardDescription>
            Each recommendation is framed as a credibility-building move that closes proof gaps for this market baseline.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {report.actionPlan.length > 0 ? (
            report.actionPlan.map((item) => (
              <div
                key={`${item.gap}-${item.projectSuggestion}`}
                className="rounded-2xl border border-border/70 bg-background/60 p-5"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <div className="text-sm font-semibold text-foreground">{item.gap}</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.recommendation}
                </p>
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/6 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Project suggestion
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/90">
                    {item.projectSuggestion}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-5 text-sm text-muted-foreground">
              No action plan is available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
