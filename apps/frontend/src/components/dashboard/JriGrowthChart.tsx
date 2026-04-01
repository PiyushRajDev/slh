"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface JriGrowthChartProps {
  history: Array<{
    id: string;
    jriScore: number;
    createdAt: string;
  }>;
}

export function JriGrowthChart({ history }: JriGrowthChartProps) {
  if (history.length < 2) {
    return (
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-primary" />
            JRI Growth Timeline
          </CardTitle>
          <CardDescription>
            Recalculate your JRI at least twice to see your growth trajectory here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40">
            <p className="text-sm text-muted-foreground">
              {history.length === 0
                ? "No JRI history yet"
                : "One more recalculation to unlock the timeline"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [...history]
    .reverse()
    .map((entry) => ({
      date: format(new Date(entry.createdAt), "MMM d"),
      fullDate: format(new Date(entry.createdAt), "MMM d, yyyy HH:mm"),
      score: Math.round(entry.jriScore),
    }));

  const firstScore = data[0].score;
  const lastScore = data[data.length - 1].score;
  const totalGrowth = lastScore - firstScore;
  const minScore = Math.max(0, Math.min(...data.map((d) => d.score)) - 10);
  const maxScore = Math.min(100, Math.max(...data.map((d) => d.score)) + 10);

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" />
              JRI Growth Timeline
            </CardTitle>
            <CardDescription>
              Your Job Readiness Index over time
            </CardDescription>
          </div>
          <div
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              totalGrowth > 0
                ? "bg-emerald-500/10 text-emerald-400"
                : totalGrowth < 0
                  ? "bg-red-500/10 text-red-400"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {totalGrowth > 0 ? "+" : ""}
            {totalGrowth} pts
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="jriGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.16 247)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.68 0.16 247)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(1 0 0 / 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "oklch(0.7 0 0)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[minScore, maxScore]}
                tick={{ fill: "oklch(0.7 0 0)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0 0)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: "0.75rem",
                  fontSize: "13px",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "oklch(0.7 0 0)", marginBottom: 4 }}
                itemStyle={{ color: "oklch(0.97 0 0)" }}
                formatter={(value) => [`${value ?? 0}`, "JRI Score"]}
                labelFormatter={(label) => `${label}`}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="oklch(0.68 0.16 247)"
                strokeWidth={2.5}
                fill="url(#jriGradient)"
                dot={{
                  r: 4,
                  fill: "oklch(0.68 0.16 247)",
                  strokeWidth: 2,
                  stroke: "oklch(0.18 0 0)",
                }}
                activeDot={{
                  r: 6,
                  fill: "oklch(0.68 0.16 247)",
                  strokeWidth: 2,
                  stroke: "oklch(0.18 0 0)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
