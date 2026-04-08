'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CodeEditor } from '@/components/interview/CodeEditor';
import { VoiceRecorder } from '@/components/interview/VoiceRecorder';
import { AIFeedbackPanel } from '@/components/interview/AIFeedbackPanel';
import { SessionTimer } from '@/components/interview/SessionTimer';
import { QuestionProgressBar } from '@/components/interview/QuestionProgressBar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { submitAnswerStream, completeInterviewSession } from '@/lib/api-client';
import type { InterviewQuestion } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Props { params: Promise<{ id: string }>; }

function difficultyClass(d: string) {
  const u = d.toUpperCase();
  if (u === 'EASY') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (u === 'HARD') return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
}

export default function ActiveSessionPage({ params }: Props) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [code, setCode] = useState('');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [startedAt] = useState(new Date());
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`interview-questions-${sessionId}`);
    if (stored) setQuestions(JSON.parse(stored));
  }, [sessionId]);

  const currentQuestion = questions[currentIdx];

  async function handleSubmit() {
    if (!currentQuestion || isSubmitting) return;
    setIsSubmitting(true);
    setFeedback('');
    setIsStreaming(true);
    try {
      await submitAnswerStream(
        sessionId,
        { questionId: currentQuestion.id, code, transcript },
        (chunk) => setFeedback((prev) => prev + chunk),
      );
      setAnsweredCount((n) => n + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setIsSubmitting(false);
    }
  }

  async function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setCode('');
      setTranscript('');
      setFeedback('');
      setShowHints(false);
    } else {
      await completeInterviewSession(sessionId);
      router.push(`/interview/sessions/${sessionId}/report`);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-6 flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }
  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <QuestionProgressBar current={answeredCount} total={questions.length} />
        <SessionTimer startedAt={startedAt} />
      </div>

      {/* Question card */}
      <Card className="bg-card/40 border-border/40">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold leading-tight">{currentQuestion.title}</h2>
            <Badge
              variant="outline"
              className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-auto shrink-0', difficultyClass(currentQuestion.difficulty))}
            >
              {currentQuestion.difficulty}
            </Badge>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">{currentQuestion.description}</p>

          {currentQuestion.examples.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Examples</span>
              <div className="flex flex-col gap-2">
                {currentQuestion.examples.map((ex, i) => (
                  <div key={i} className="text-xs font-mono bg-muted/40 border border-border/40 rounded-md p-3">
                    <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
                    <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
                    {ex.explanation && <div className="text-muted-foreground mt-1">{ex.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Constraints</span>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
              {currentQuestion.constraints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <Button variant="ghost" size="sm" className="self-start -ml-2" onClick={() => setShowHints((v) => !v)}>
            {showHints ? 'Hide hints' : 'Show hints'}
          </Button>
          {showHints && (
            <ol className="text-xs text-muted-foreground list-decimal list-inside flex flex-col gap-1.5">
              {currentQuestion.hints.map((h, i) => <li key={i}>{h}</li>)}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Code editor */}
      <CodeEditor value={code} onChange={setCode} language="python" />

      {/* Voice recorder */}
      <VoiceRecorder onTranscriptChange={setTranscript} />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={isSubmitting || !code.trim()} className="gap-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? 'Getting feedback…' : 'Submit Answer'}
        </Button>
        {feedback && !isStreaming && (
          <Button variant="outline" onClick={handleNext}>
            {currentIdx < questions.length - 1 ? 'Next Question →' : 'Finish Session'}
          </Button>
        )}
      </div>

      {/* AI Feedback */}
      <AIFeedbackPanel feedback={feedback} isStreaming={isStreaming} />
    </div>
  );
}
