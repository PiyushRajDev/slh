'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/app/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { listInterviewSessions } from '@/lib/api-client';
import { PlusCircle, History, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function statusBadgeClass(status: string) {
  if (status === 'COMPLETED') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (status === 'IN_PROGRESS') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  return 'bg-muted/60 text-muted-foreground border-border/60';
}

function scoreColor(n: number) {
  if (n >= 75) return 'text-emerald-600 dark:text-emerald-400';
  if (n >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

export default function InterviewSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listInterviewSessions()
      .then((r) => setSessions(r.sessions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = sessions.filter((s) => s.status === 'COMPLETED');
  const avgScore = completed.length > 0 && completed.every((s) => s.report?.overallScore != null)
    ? Math.round(completed.reduce((acc, s) => acc + s.report.overallScore, 0) / completed.length)
    : null;

  return (
    <PageShell
      eyebrow="AI Interview Simulator"
      title="Interview History"
      description="Review past sessions and track your readiness improvement over time."
      actions={
        <Link href="/interview" className={buttonVariants()}>
          <PlusCircle className="size-4 mr-2" />
          New Session
        </Link>
      }
    >
      {/* Stats strip */}
      {!loading && sessions.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-foreground">{sessions.length}</span>
            <span className="text-muted-foreground">sessions</span>
          </div>
          <div className="w-px bg-border/60" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{completed.length}</span>
            <span className="text-muted-foreground">completed</span>
          </div>
          {avgScore !== null && (
            <>
              <div className="w-px bg-border/60" />
              <div className="flex items-center gap-2 text-sm">
                <span className={cn('font-bold', scoreColor(avgScore))}>{avgScore}</span>
                <span className="text-muted-foreground">avg score</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <History className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No sessions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start your first mock interview to begin tracking your progress.
            </p>
            <Link href="/interview" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mt-3')}>
              Start a session
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={s.report ? `/interview/sessions/${s.id}/report` : `/interview/sessions/${s.id}`}
              className="group block"
            >
              <Card className="bg-card/40 border-border/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold capitalize text-foreground truncate">
                      {s.targetCompany} — {s.targetRole}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-auto', statusBadgeClass(s.status))}
                      >
                        {s.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.report?.overallScore != null && (
                      <div className="text-right">
                        <div className={cn('text-2xl font-black', scoreColor(s.report.overallScore))}>
                          {s.report.overallScore}
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
                          Score
                        </div>
                      </div>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
