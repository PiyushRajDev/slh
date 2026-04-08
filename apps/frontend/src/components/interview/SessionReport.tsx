import { ReadinessDeltaBadge } from './ReadinessDeltaBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NextStep { priority: number; action: string; topic: string; }
interface SessionReportProps {
  overallScore: number;
  aiSummary: string;
  strongAreas: string[];
  weakAreas: string[];
  gapsAddressed: string[];
  nextSteps: NextStep[];
  dsaReadinessBefore: number | null;
  dsaReadinessAfter: number | null;
  targetRole: string;
  targetCompany: string;
}

function scoreColor(n: number) {
  if (n >= 75) return 'text-emerald-600 dark:text-emerald-400';
  if (n >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function scoreBg(n: number) {
  if (n >= 75) return 'bg-emerald-500/10 border-emerald-500/20';
  if (n >= 50) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

export function SessionReport({
  overallScore, aiSummary, strongAreas, weakAreas, gapsAddressed,
  nextSteps, dsaReadinessBefore, dsaReadinessAfter, targetRole, targetCompany,
}: SessionReportProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <Card className={cn('border', scoreBg(overallScore))}>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="text-center shrink-0">
            <div className={cn('text-5xl font-black', scoreColor(overallScore))}>{overallScore}</div>
            <div className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60 mt-1">
              Overall Score
            </div>
          </div>
          <div className="w-px h-12 bg-border/60 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="font-semibold capitalize text-foreground">
              {targetCompany} — {targetRole}
            </div>
            {dsaReadinessBefore !== null && dsaReadinessAfter !== null && (
              <ReadinessDeltaBadge before={dsaReadinessBefore} after={dsaReadinessAfter} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          AI Summary
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{aiSummary}</p>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card/40 border-border/40">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Strengths
            </div>
            <ul className="flex flex-col gap-1.5">
              {strongAreas.map((s) => (
                <li key={s} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/40">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Needs Work
            </div>
            <ul className="flex flex-col gap-1.5">
              {weakAreas.map((w) => (
                <li key={w} className="text-sm flex items-start gap-2">
                  <XCircle className="size-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Gaps addressed */}
      {gapsAddressed.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Gaps Addressed
          </div>
          <div className="flex flex-wrap gap-2">
            {gapsAddressed.map((g) => (
              <span
                key={g}
                className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Next Steps
        </div>
        <ol className="flex flex-col gap-2">
          {nextSteps.sort((a, b) => a.priority - b.priority).map((step, i) => (
            <li key={i} className="text-sm flex items-start gap-3">
              <Badge
                variant="outline"
                className="shrink-0 size-5 rounded-full p-0 flex items-center justify-center text-[10px] font-black bg-muted/60 border-border/60"
              >
                {i + 1}
              </Badge>
              <span>{step.action}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
