"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getTierProgress } from "@/lib/learning-paths";

interface TierProgressProps {
  jriScore: number;
  tier: string;
}

const tierColors: Record<string, string> = {
  Rookie: "from-zinc-500 to-zinc-400",
  Challenger: "from-amber-600 to-amber-400",
  Rising: "from-emerald-600 to-emerald-400",
  Pro: "from-blue-600 to-blue-400",
  Elite: "from-violet-600 to-violet-400",
  Legend: "from-amber-400 to-yellow-300",
};

const tierGlow: Record<string, string> = {
  Rookie: "shadow-zinc-500/20",
  Challenger: "shadow-amber-500/20",
  Rising: "shadow-emerald-500/20",
  Pro: "shadow-blue-500/20",
  Elite: "shadow-violet-500/20",
  Legend: "shadow-yellow-400/30",
};

export function TierProgress({ jriScore, tier }: TierProgressProps) {
  const info = getTierProgress(jriScore);
  const gradient = tierColors[tier] || tierColors.Rookie;
  const glow = tierGlow[tier] || tierGlow.Rookie;

  return (
    <Card className={`bg-card/80 overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${glow} text-sm font-bold text-white`}
            >
              {Math.round(jriScore)}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{tier}</div>
              <div className="text-[11px] text-muted-foreground">
                {info.nextTier
                  ? `${Math.round(info.tierCeiling - jriScore)} pts to ${info.nextTier}`
                  : "Maximum tier reached"}
              </div>
            </div>
          </div>
          {info.nextTier ? (
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Next:</span>{" "}
              <span className="text-xs font-semibold text-foreground">{info.nextTier}</span>
            </div>
          ) : null}
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, info.progress)}%` }}
          />
        </div>

        {/* Tier markers */}
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>{info.tierFloor}</span>
          <span>{info.tierCeiling}</span>
        </div>
      </CardContent>
    </Card>
  );
}
