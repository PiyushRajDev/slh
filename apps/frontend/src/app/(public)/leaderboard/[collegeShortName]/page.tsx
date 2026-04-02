"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { PageShell } from "@/components/app/page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicLeaderboard } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  MapPin, 
  Users, 
  Building2, 
  ArrowRight, 
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Code2
} from "lucide-react";

interface LeaderboardPageProps {
  params: Promise<{ collegeShortName: string }>;
}

export default function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { collegeShortName } = use(params);
  const [data, setData] = useState<{
    college: { name: string; shortName: string };
    total: number;
    leaderboard: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    setLoading(true);
    getPublicLeaderboard(collegeShortName, { batch, department, limit: 100 })
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      })
      .finally(() => setLoading(false));
  }, [collegeShortName, batch, department]);

  return (
    <PageShell
      eyebrow="Leaderboard"
      title={data?.college.name ?? collegeShortName.toUpperCase()}
      description="The top performing students ranked by Job Readiness Index (JRI)."
    >
      <div className="space-y-6">
        {/* Statistics overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Students</p>
                  <p className="text-2xl font-semibold">{data?.total ?? "---"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                  <Trophy className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Elite Tier</p>
                  <p className="text-2xl font-semibold">
                    {data?.leaderboard.filter(s => s.tier === 'Elite').length ?? "---"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Placement Ready</p>
                  <p className="text-2xl font-semibold">
                    {data?.leaderboard.filter(s => s.jriScore >= 70).length ?? "---"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground">
            <Filter className="size-4" />
            Filter by:
          </div>
          <select 
            className="rounded-lg border border-border/70 bg-background/50 px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary/50"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
          >
            <option value="">All Batches</option>
            <option value="2025">Batch 2025</option>
            <option value="2026">Batch 2026</option>
          </select>
          <select 
            className="rounded-lg border border-border/70 bg-background/50 px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary/50"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
          </select>
          {loading && (
            <div className="ml-auto px-4">
              <Skeleton className="h-4 w-24" />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Leaderboard Table */}
        <Card className="overflow-hidden border border-border/70 bg-card/75 backdrop-blur-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/70 bg-background/40">
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Student</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Branch</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">JRI Score</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tier</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-8" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-12" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      </tr>
                    ))
                  ) : data?.leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        No students found matching these filters.
                      </td>
                    </tr>
                  ) : (
                    data?.leaderboard.map((student) => (
                      <tr key={student.githubUsername} className="group transition-colors hover:bg-primary/2">
                        <td className="px-6 py-4">
                          <div className={cn(
                            "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                            student.rank === 1 ? "bg-amber-500/20 text-amber-500" :
                            student.rank === 2 ? "bg-slate-300/20 text-slate-400" :
                            student.rank === 3 ? "bg-orange-400/20 text-orange-500" :
                            "bg-background/80 text-muted-foreground border border-border/50"
                          )}>
                            {student.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{student.name}</span>
                              <span className="text-[11px] text-muted-foreground">Batch {student.batch}</span>
                            </div>
                            {student.isPlaced && (
                              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-[10px] text-emerald-400">
                                Placed
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-muted-foreground">{student.department}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-primary">{student.jriScore}</span>
                            <div className="h-1 w-12 rounded-full bg-border/40 overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${student.jriScore}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            "border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            student.tier === 'Elite' ? "bg-amber-500/10 text-amber-500" :
                            student.tier === 'Pro' ? "bg-purple-500/10 text-purple-400" :
                            student.tier === 'Rising' ? "bg-blue-500/10 text-blue-400" :
                            "bg-slate-500/10 text-slate-400"
                          )}>
                            {student.tier}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {student.githubUsername ? (
                            <Link 
                              href={`/u/${student.githubUsername}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                              View Portfolio
                              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          ) : (
                            <span className="text-xs italic text-muted-foreground/60">No github linked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
