"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttributeRadarProps {
  attributes: Record<string, number>;
  archetype: string;
}

export function AttributeRadar({ attributes, archetype }: AttributeRadarProps) {
  const data = Object.entries(attributes).map(([name, value]) => ({
    attribute: name,
    value: Math.round(value),
    fullMark: 100,
  }));

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Developer DNA</CardTitle>
            <CardDescription>Your capability radar across 5 core dimensions</CardDescription>
          </div>
          <Badge className="border-0 bg-primary/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {archetype}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid
                stroke="oklch(1 0 0 / 0.08)"
                radialLines={true}
              />
              <PolarAngleAxis
                dataKey="attribute"
                tick={{ fill: "oklch(0.7 0 0)", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "oklch(0.5 0 0)", fontSize: 10 }}
                tickCount={5}
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
                formatter={(value) => [`${value ?? 0}/100`, ""]}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="oklch(0.68 0.16 247)"
                strokeWidth={2}
                fill="oklch(0.68 0.16 247)"
                fillOpacity={0.15}
                dot={{
                  r: 4,
                  fill: "oklch(0.68 0.16 247)",
                  strokeWidth: 0,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Attribute breakdown below radar */}
        <div className="mt-2 grid grid-cols-5 gap-2">
          {data.map((attr) => (
            <div key={attr.attribute} className="text-center">
              <div className="text-lg font-semibold text-foreground">{attr.value}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground leading-tight">
                {attr.attribute}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
