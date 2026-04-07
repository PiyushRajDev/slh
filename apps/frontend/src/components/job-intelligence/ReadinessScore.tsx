import { cn } from "@/lib/utils";

const VERDICTS = [
  { threshold: 80, label: "Market-Ready", color: "text-emerald-400" },
  { threshold: 60, label: "Nearly Ready", color: "text-blue-400" },
  { threshold: 40, label: "Developing", color: "text-amber-400" },
  { threshold: 0, label: "Gap Present", color: "text-red-400" },
] as const;

function getVerdict(score: number) {
  return VERDICTS.find(v => score >= v.threshold) ?? VERDICTS[3];
}

const R = 56;
const CIRC = 2 * Math.PI * R;

interface ReadinessScoreProps {
  score: number;
}

export function ReadinessScore({ score }: ReadinessScoreProps) {
  const verdict = getVerdict(score);
  const offset = CIRC - (score / 100) * CIRC;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
          <circle
            cx="64" cy="64" r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={verdict.color}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold tabular-nums", verdict.color)}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={cn("text-sm font-medium", verdict.color)}>{verdict.label}</span>
    </div>
  );
}
