'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/app/page-shell';
import { SessionSetupForm } from '@/components/interview/SessionSetupForm';
import { GapPreview } from '@/components/interview/GapPreview';
import { buttonVariants } from '@/components/ui/button';
import { createInterviewSession } from '@/lib/api-client';
import { History } from 'lucide-react';

export default function InterviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('amazon');

  async function handleSubmit(config: { targetRole: string; targetCompany: string; difficulty: string; questionCount: number }) {
    setIsLoading(true);
    try {
      const result = await createInterviewSession({
        targetRole: config.targetRole,
        targetCompany: config.targetCompany,
        difficulty: config.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED',
        questionCount: config.questionCount,
      });
      sessionStorage.setItem(`interview-questions-${result.session.id}`, JSON.stringify(result.questions));
      router.push(`/interview/sessions/${result.session.id}`);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  return (
    <PageShell
      eyebrow="AI Interview Simulator"
      title="Mock Interview"
      description="Practice DSA problems tailored to your target company and role. Answers are scored by AI and linked to your gap profile."
      actions={
        <Link href="/interview/sessions" className={buttonVariants({ variant: 'outline' })}>
          <History className="size-4 mr-2" />
          View History
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <GapPreview dsaReadiness={null} company={selectedCompany} />
        <SessionSetupForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCompanyChange={setSelectedCompany}
        />
      </div>
    </PageShell>
  );
}
