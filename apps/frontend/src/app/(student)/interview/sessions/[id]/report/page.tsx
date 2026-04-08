'use client';
import { use, useEffect, useState } from 'react';
import { PageShell } from '@/components/app/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { SessionReport } from '@/components/interview/SessionReport';
import { getInterviewReport, getInterviewSession } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Props { params: Promise<{ id: string }>; }

export default function SessionReportPage({ params }: Props) {
  const { id: sessionId } = use(params);
  const [report, setReport] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sessionResult = await getInterviewSession(sessionId);
        if (!cancelled) setSession(sessionResult.session);
      } catch {}

      const poll = async () => {
        if (cancelled) return;
        try {
          const result = await getInterviewReport(sessionId);
          if ('report' in result) {
            if (!cancelled) { setReport(result.report); setPolling(false); }
          } else {
            setTimeout(poll, 3000);
          }
        } catch {
          setTimeout(poll, 5000);
        }
      };
      poll();
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId]);

  const title = session
    ? `${session.targetCompany} — ${session.targetRole}`
    : 'Session Report';

  if (polling && !report) {
    return (
      <PageShell
        eyebrow="Session Report"
        title={title}
        description="AI-generated performance analysis from your mock interview session."
      >
        <Card className="bg-card/40 border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div className="text-center">
              <div className="font-semibold text-foreground">Generating your report…</div>
              <div className="text-sm text-muted-foreground mt-1">This usually takes 10–20 seconds</div>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!report) return null;

  return (
    <PageShell
      eyebrow="Session Report"
      title={title}
      description="AI-generated performance analysis from your mock interview session."
      actions={
        <>
          <Link href="/interview" className={buttonVariants()}>Practice Again</Link>
          <Link href="/interview/sessions" className={buttonVariants({ variant: 'outline' })}>View History</Link>
        </>
      }
    >
      <SessionReport
        overallScore={report.overallScore}
        aiSummary={report.aiSummary}
        strongAreas={report.strongAreas}
        weakAreas={report.weakAreas}
        gapsAddressed={report.gapsAddressed}
        nextSteps={report.nextSteps}
        dsaReadinessBefore={report.dsaReadinessBefore}
        dsaReadinessAfter={report.dsaReadinessAfter}
        targetRole={session?.targetRole ?? ''}
        targetCompany={session?.targetCompany ?? ''}
      />
    </PageShell>
  );
}
