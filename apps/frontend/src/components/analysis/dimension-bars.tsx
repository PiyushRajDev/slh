import { getDimensionEntries, type AnalysisReport } from "@/lib/analysis";

interface DimensionBarsProps {
  report: AnalysisReport;
}

export function DimensionBars({ report }: DimensionBarsProps) {
  return (
    <div className="space-y-4">
      {getDimensionEntries(report).map(([key, label, dimension]) => {
        const ratio = Math.max(6, Math.round((dimension.score / dimension.max) * 100));

        return (
          <div key={key} className="grid gap-2 sm:grid-cols-[1fr_220px_auto] sm:items-center">
            <div className="font-medium text-foreground">{label}</div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${ratio}%` }}
              />
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {dimension.score}/{dimension.max}
            </div>
          </div>
        );
      })}
    </div>
  );
}
