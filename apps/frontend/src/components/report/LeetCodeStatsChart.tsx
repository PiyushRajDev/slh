"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { StudentResult } from "./types"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function LeetCodeStatsChart({ students }: { students: StudentResult[] }) {
  const activeCount = students.filter(s => s.leetcode?.success).length;
  const avgTotal = Math.round(students.reduce((acc, s) => acc + (s.leetcode?.data?.difficultyStats?.total || 0), 0) / Math.max(1, activeCount));
  const mediumPlusPercent = Math.round((students.filter(s => (s.leetcode?.data?.difficultyStats?.medium || 0) + (s.leetcode?.data?.difficultyStats?.hard || 0) > 20).length / Math.max(1, activeCount)) * 100);

  const topPerformers = students.filter(s => s.leetcode?.success)
    .sort((a, b) => (b.leetcode?.data?.difficultyStats?.total || 0) - (a.leetcode?.data?.difficultyStats?.total || 0))
    .slice(0, 8);

  const data = topPerformers.map(s => ({
    name: s.student.name.split(" ")[0],
    Easy: s.leetcode?.data?.difficultyStats?.easy || 0,
    Medium: s.leetcode?.data?.difficultyStats?.medium || 0,
    Hard: s.leetcode?.data?.difficultyStats?.hard || 0,
  }));

  const isWeakDepth = mediumPlusPercent < 40;

  return (
    <Card className="col-span-1 shadow-sm border-primary/10 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">LeetCode Activity</CardTitle>
            <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded uppercase">Active: {activeCount}</span>
        </div>
        <CardDescription>
            Avg {avgTotal} solved ({avgTotal > 100 ? "↑ Good" : "↓ Critical"})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="Easy" stackId="a" fill="#10b981" radius={[0, 0, 2, 2]} />
              <Bar dataKey="Medium" stackId="a" fill="#eab308" />
              <Bar dataKey="Hard" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 border ${isWeakDepth ? 'bg-red-500/5 border-red-500/10' : 'bg-green-500/5 border-green-500/10'}`}>
            {isWeakDepth ? <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />}
            <div className="space-y-1">
                <p className="text-[11px] font-bold leading-tight">
                    {isWeakDepth ? "WEAK DEPTH DETECTED" : "HEALTHY BREADTH"}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Only {mediumPlusPercent}% students solving medium+ problems. High risk of failure in technical rounds.
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
