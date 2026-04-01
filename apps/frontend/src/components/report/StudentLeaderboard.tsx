"use client"

import { useState } from "react"
import { StudentResult } from "./types"
import { StudentDetailOverlay } from "./StudentDetailOverlay"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function StudentLeaderboard({ students }: { students: StudentResult[] }) {
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);

  const sortedStudents = [...students].sort((a, b) => (b.jriScore || 0) - (a.jriScore || 0));

  return (
    <>
      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm font-medium">
            <thead className="bg-muted/50 border-b">
              <tr className="transition-colors">
                <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground w-[220px]">
                  Student
                </th>
                <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground w-[120px]">
                  Readiness (JRI)
                </th>
                <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground">
                  DSA (LeetCode)
                </th>
                <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground">
                  Projects (GitHub)
                </th>
                <th className="h-12 px-4 text-right align-middle font-bold text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0 text-[13px]">
              {sortedStudents.map((s, i) => (
                <tr
                  key={`${s.student.uid}-${i}`}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="p-4 align-middle">
                    <div className="font-extrabold text-foreground">{s.student.name}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{s.student.uid}</div>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full font-black text-white ${
                        (s.jriScore || 0) >= 80 ? 'bg-green-500 shadow-green-500/20' : 
                        (s.jriScore || 0) >= 60 ? 'bg-yellow-500 shadow-yellow-500/20' : 'bg-red-500 shadow-red-500/20'
                    } shadow-lg border-2 border-white/20`}>
                      {s.jriScore}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-blue-600">{s.dsaScore}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">{s.leetcode?.data?.difficultyStats?.total || 0} Solved</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex flex-col gap-1 items-center">
                        <span className="font-bold text-amber-600">{s.projectScore}</span>
                        {s.github?.bestProfile && (
                            <Badge variant="outline" className="text-[8px] h-4 py-0 font-black border-amber-200 bg-amber-50 text-amber-700">
                                {s.github.bestProfile.replace('_', ' ')}
                            </Badge>
                        )}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold" onClick={() => setSelectedStudent(s)}>
                      Analyze Profile
                    </Button>
                  </td>
                </tr>
              ))}
              {sortedStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    No results found in report.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedStudent && (
        <StudentDetailOverlay 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </>
  )
}
