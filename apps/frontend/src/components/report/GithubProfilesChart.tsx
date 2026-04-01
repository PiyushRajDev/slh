"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { StudentResult } from "./types"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function GithubProfilesChart({ students }: { students: StudentResult[] }) {
  const activeCount = students.filter(s => s.github).length;
  const avgBestScore = Math.round(students.reduce((acc, s) => acc + (s.github?.bestScore || 0), 0) / Math.max(1, activeCount));
  const lowProjectCount = students.filter(s => s.github && (s.github.bestScore < 40)).length;
  const lowProjectPercent = Math.round((lowProjectCount / Math.max(1, activeCount)) * 100);

  const profileCounts = students.reduce((acc, s) => {
    if (s.github?.bestProfile) {
      acc[s.github.bestProfile] = (acc[s.github.bestProfile] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(profileCounts).map(([name, value]) => ({
    name: name.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    value
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (activeCount === 0) return null;

  return (
    <Card className="col-span-1 shadow-sm border-primary/10 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Project Capabilities</CardTitle>
            <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded uppercase">Active: {activeCount}</span>
        </div>
        <CardDescription>
            Avg Score: {avgBestScore} ({avgBestScore > 40 ? "↑ Good" : "↓ Weak"})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 border ${lowProjectPercent > 50 ? 'bg-red-500/5 border-red-500/10' : 'bg-green-500/5 border-green-500/10'}`}>
            {lowProjectPercent > 50 ? <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />}
            <div className="space-y-1">
                <p className="text-[11px] font-bold leading-tight">
                    {lowProjectPercent > 50 ? "PROJECT QUALITY GAP" : "STRONG REPO SIGNALS"}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {lowProjectPercent}% of students have scores below 40. Projects lack "Production-Ready" signals.
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
