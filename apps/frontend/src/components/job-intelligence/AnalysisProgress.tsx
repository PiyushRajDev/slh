"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const STAGE_LABELS: Record<string, string> = {
  fetching: "Fetching Jobs",
  extracting: "Analyzing Descriptions",
  analyzing_demand: "Computing Demand",
  building_profile: "Building Your Profile",
  gap_analysis: "Comparing Skills",
  roadmap: "Generating Roadmap",
  complete: "Complete",
};

interface AnalysisProgressProps {
  progress: number;
  stage: string;
  message: string;
}

export function AnalysisProgress({ progress, stage, message }: AnalysisProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{message}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{STAGE_LABELS[stage] ?? stage}</Badge>
          <span className="font-mono text-xs">{progress}%</span>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
