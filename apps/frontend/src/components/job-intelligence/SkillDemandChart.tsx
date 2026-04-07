"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TIER_COLORS = {
  critical: "#f87171",
  high: "#fb923c",
  medium: "#facc15",
  low: "#94a3b8",
} as const;

interface SkillDemandItem {
  name: string;
  frequencyPercent: number;
  demandTier: keyof typeof TIER_COLORS;
}

interface SkillDemandChartProps {
  skills: SkillDemandItem[];
}

export function SkillDemandChart({ skills }: SkillDemandChartProps) {
  const top15 = skills.slice(0, 15);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <span key={tier} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            {tier}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={top15} layout="vertical" margin={{ left: 0, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Frequency"]}
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
          />
          <Bar dataKey="frequencyPercent" radius={[0, 4, 4, 0]}>
            {top15.map((entry, index) => (
              <Cell key={index} fill={TIER_COLORS[entry.demandTier] ?? '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
