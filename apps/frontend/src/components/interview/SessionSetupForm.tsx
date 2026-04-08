'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SessionSetupFormProps {
  onSubmit: (config: { targetRole: string; targetCompany: string; difficulty: string; questionCount: number }) => void;
  isLoading: boolean;
  onCompanyChange?: (company: string) => void;
}

export function SessionSetupForm({ onSubmit, isLoading, onCompanyChange }: SessionSetupFormProps) {
  const [targetRole, setTargetRole] = useState('SDE-1');
  const [targetCompany, setTargetCompany] = useState('amazon');
  const [difficulty, setDifficulty] = useState('MIXED');
  const [questionCount, setQuestionCount] = useState(5);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ targetRole, targetCompany, difficulty, questionCount });
  }

  return (
    <Card className="bg-card/40 border-border/40">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Target Role
            </label>
            <Input
              id="role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SDE-1, Software Engineer"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="company" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Company
            </label>
            <Select
              value={targetCompany}
              onValueChange={(v) => { if (v) { setTargetCompany(v); onCompanyChange?.(v); } }}
            >
              <SelectTrigger id="company"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="microsoft">Microsoft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="difficulty" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Difficulty
            </label>
            <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
              <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
                <SelectItem value="MIXED">Mixed (recommended)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="count" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Number of Questions
            </label>
            <Select value={String(questionCount)} onValueChange={(v) => v && setQuestionCount(Number(v))}>
              <SelectTrigger id="count"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 questions</SelectItem>
                <SelectItem value="5">5 questions</SelectItem>
                <SelectItem value="7">7 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? 'Starting Session…' : 'Start Interview'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
