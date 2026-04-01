import { Badge } from "@/components/ui/badge";
import { type AnalysisInsight } from "@/lib/analysis";
import { cn } from "@/lib/utils";

interface InsightListProps {
  insights: AnalysisInsight[];
}

const priorityTone: Record<AnalysisInsight["priority"], string> = {
  critical: "bg-red-500/10 text-red-300",
  high: "bg-amber-500/10 text-amber-300",
  medium: "bg-blue-500/10 text-blue-300",
  low: "bg-zinc-500/10 text-zinc-300",
};

export function InsightList({ insights }: InsightListProps) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card/70 p-5 text-sm text-muted-foreground">
        No immediate blockers detected. Keep sharpening depth, consistency, and polish.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <div
          key={`${insight.title}-${index}`}
          className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">
                  {index + 1}.
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  {insight.title}
                </h3>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {insight.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "border-0 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  priorityTone[insight.priority]
                )}
              >
                {insight.priority}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {insight.impact}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
