"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { StudentResult } from "./types"

export function StudentDetailOverlay({ student, onClose }: { student: StudentResult, onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col overflow-hidden" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>{student.student.name} ({student.student.uid})</DialogTitle>
          <DialogDescription>
            Detailed performance breakdown for {student.student.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-6">
          {/* LeetCode Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">LeetCode Performance</h3>
            {!student.leetcode?.success ? (
              <p className="text-sm text-muted-foreground italic">No LeetCode data found or failed to fetch.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="p-3 bg-muted rounded-md border text-foreground/80">
                    <div className="text-xs uppercase font-medium">Total</div>
                    <div className="text-xl font-bold">{student.leetcode.data?.difficultyStats?.total || 0}</div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-md border border-emerald-500/20">
                    <div className="text-xs uppercase font-medium">Easy</div>
                    <div className="text-xl font-bold">{student.leetcode.data?.difficultyStats?.easy || 0}</div>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-md border border-amber-500/20">
                    <div className="text-xs uppercase font-medium">Medium</div>
                    <div className="text-xl font-bold">{student.leetcode.data?.difficultyStats?.medium || 0}</div>
                  </div>
                  <div className="p-3 bg-red-500/10 text-red-600 rounded-md border border-red-500/20">
                    <div className="text-xs uppercase font-medium">Hard</div>
                    <div className="text-xl font-bold">{student.leetcode.data?.difficultyStats?.hard || 0}</div>
                  </div>
                </div>

                {student.leetcode.data.recentSubmissions && student.leetcode.data.recentSubmissions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Recent Submissions</h4>
                    <div className="text-sm border rounded-md divide-y overflow-hidden">
                      {student.leetcode.data.recentSubmissions.slice(0, 5).map((sub, i) => (
                        <div key={i} className="flex justify-between p-2 px-3 bg-card hover:bg-muted/50 transition-colors">
                          <span className="truncate mr-2 font-medium">{sub.title}</span>
                          <span className="text-muted-foreground whitespace-nowrap text-xs flex items-center">
                            {new Date(parseInt(sub.timestamp) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GitHub Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">GitHub Repositories</h3>
            {!student.github ? (
              <p className="text-sm text-muted-foreground italic">No GitHub data available.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-4 text-sm font-medium mb-2">
                  <div className="px-2 py-1 bg-muted rounded">
                    Best Score: <span className="font-bold">{student.github.bestScore}</span>
                  </div>
                  <div className="px-2 py-1 bg-muted rounded">
                    Identified Domain: <span className="text-blue-500">{student.github.bestProfile.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left border-b">
                      <tr>
                        <th className="p-2 px-3 font-medium">Repository</th>
                        <th className="p-2 px-3 font-medium">Profile Match</th>
                        <th className="p-2 px-3 font-medium text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {student.github.repos.map((repo, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="p-2 px-3 font-medium">
                            <a href={repo.repoUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                              {repo.repoName}
                            </a>
                          </td>
                          <td className="p-2 px-3 text-muted-foreground text-xs uppercase flex items-center">
                            {repo.profileId.replace('_', ' ')}
                            <span className={`ml-2 inline-block w-2 h-2 rounded-full ${
                              repo.confidenceLevel === 'HIGH' ? 'bg-green-500' : 
                              repo.confidenceLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-red-500'
                            }`} title={`Confidence: ${repo.confidenceLevel}`}></span>
                          </td>
                          <td className="p-2 px-3 text-right font-medium">
                            {repo.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
