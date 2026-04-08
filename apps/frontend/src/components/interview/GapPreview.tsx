import { Card, CardContent } from '@/components/ui/card';

interface GapPreviewProps { dsaReadiness: number | null; company: string; }

const COMPANY_FOCUS: Record<string, string[]> = {
  amazon: ['Arrays', 'Dynamic Programming', 'Graphs'],
  google: ['Graphs', 'DP', 'Trees'],
  microsoft: ['Arrays', 'Trees', 'DP'],
};

export function GapPreview({ dsaReadiness, company }: GapPreviewProps) {
  const topics = COMPANY_FOCUS[company.toLowerCase()] ?? COMPANY_FOCUS.amazon;
  return (
    <Card className="bg-card/40 border-border/40">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          This Session
        </div>

        {dsaReadiness !== null && (
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <div className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
                DSA Readiness
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {dsaReadiness.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground">→ improves with good answers</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
            Focus topics for {company}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <span
                key={t}
                className="rounded-md bg-muted/40 border border-border/40 px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
