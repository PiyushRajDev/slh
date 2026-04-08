'use client';
import { Card, CardContent } from '@/components/ui/card';

interface AIFeedbackPanelProps { feedback: string; isStreaming: boolean; }

export function AIFeedbackPanel({ feedback, isStreaming }: AIFeedbackPanelProps) {
  if (!feedback && !isStreaming) return null;
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          AI Feedback
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {feedback}
          {isStreaming && <span className="animate-pulse">▌</span>}
        </p>
      </CardContent>
    </Card>
  );
}
