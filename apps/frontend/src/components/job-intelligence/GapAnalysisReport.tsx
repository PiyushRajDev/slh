import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillMatch {
  skill: string;
  demandTier: string;
  confidence: string;
  evidence: { projects: number; repos: number; lastUsed: string | null; source: string[] };
}

interface GapReport {
  readinessScore: number;
  matched: SkillMatch[];
  partial: SkillMatch[];
  missing: SkillMatch[];
}

const TIER_BADGE: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

function SkillRow({ skill, type }: { skill: SkillMatch; type: "matched" | "partial" | "missing" }) {
  const icon = {
    matched: <CheckCircle className="size-4 text-emerald-400 shrink-0" />,
    partial: <Circle className="size-4 text-amber-400 shrink-0" />,
    missing: <AlertCircle className="size-4 text-red-400 shrink-0" />,
  }[type];

  const evidenceParts = [];
  if (skill.evidence.projects > 0) evidenceParts.push(`${skill.evidence.projects} project${skill.evidence.projects > 1 ? 's' : ''}`);
  if (skill.evidence.repos > 0) evidenceParts.push(`${skill.evidence.repos} repos`);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      {icon}
      <span className="flex-1 text-sm font-medium">{skill.skill}</span>
      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", TIER_BADGE[skill.demandTier] ?? TIER_BADGE.low)}>
        {skill.demandTier}
      </span>
      {evidenceParts.length > 0 && (
        <span className="text-xs text-muted-foreground">{evidenceParts.join(', ')}</span>
      )}
    </div>
  );
}

interface GapAnalysisReportProps {
  gap: GapReport;
}

export function GapAnalysisReport({ gap }: GapAnalysisReportProps) {
  const sections = [
    { label: "Matched", skills: gap.matched, type: "matched" as const, color: "text-emerald-400" },
    { label: "Partial", skills: gap.partial, type: "partial" as const, color: "text-amber-400" },
    { label: "Missing", skills: gap.missing, type: "missing" as const, color: "text-red-400" },
  ].filter(s => s.skills.length > 0);

  return (
    <div className="space-y-6">
      {sections.map(section => (
        <div key={section.label}>
          <h4 className={cn("text-sm font-semibold mb-2 flex items-center gap-2", section.color)}>
            {section.label}
            <Badge variant="secondary" className="text-xs">{section.skills.length}</Badge>
          </h4>
          <div className="rounded-lg border border-border bg-card/50 px-3">
            {section.skills.map(skill => (
              <SkillRow key={skill.skill} skill={skill} type={section.type} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
