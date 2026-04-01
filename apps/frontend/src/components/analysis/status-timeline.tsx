import {
  ANALYSIS_STAGES,
  formatProfileLabel,
  formatStageLabel,
  type AnalysisStage,
} from "@/lib/analysis";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface StatusTimelineProps {
  currentStage: AnalysisStage | null;
  currentDetail?: Record<string, unknown>;
}

function getStageState(currentStage: AnalysisStage | null, stage: AnalysisStage) {
  if (!currentStage) {
    return "pending";
  }

  const currentIndex = ANALYSIS_STAGES.indexOf(currentStage);
  const stageIndex = ANALYSIS_STAGES.indexOf(stage);

  if (stageIndex < currentIndex) {
    return "complete";
  }

  if (stageIndex === currentIndex) {
    return "active";
  }

  return "pending";
}

function describeDetail(stage: AnalysisStage, detail?: Record<string, unknown>) {
  if (!detail) {
    return null;
  }

  switch (stage) {
    case "METRICS_EXTRACTING":
      return detail.fileCount ? `Detected ${detail.fileCount} files` : null;
    case "SIGNALS_DERIVING":
      return detail.topLanguage
        ? `Top language: ${detail.topLanguage}${detail.totalLoc ? ` · ${detail.totalLoc} LOC` : ""}`
        : detail.totalLoc
          ? `${detail.totalLoc} LOC detected`
          : null;
    case "PROFILES_EVALUATING":
      return detail.repoCount ? `Evaluating ${detail.repoCount} files for structural fit` : null;
    case "SCORING":
      return detail.activeProfiles
        ? `${detail.activeProfiles} active profile candidates survived`
        : null;
    case "SELECTING_PROFILE":
      return detail.detected
        ? `Detected profile: ${formatProfileLabel(String(detail.detected))}`
        : null;
    default:
      return null;
  }
}

export function StatusTimeline({ currentStage, currentDetail }: StatusTimelineProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-5">
      {ANALYSIS_STAGES.map((stage) => {
        const state = getStageState(currentStage, stage);
        const detail = state === "active" ? describeDetail(stage, currentDetail) : null;

        return (
          <div key={stage} className="flex items-start gap-3">
            <div className="mt-0.5">
              {state === "complete" ? (
                <CheckCircle2 className="size-4 text-emerald-400" />
              ) : state === "active" ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Circle className="size-4 text-muted-foreground/40" />
              )}
            </div>
            <div className="space-y-1">
              <div className={state === "active" ? "font-medium text-foreground" : "text-muted-foreground"}>
                {formatStageLabel(stage)}
              </div>
              {detail ? (
                <div className="font-mono text-xs text-muted-foreground">
                  {detail}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
