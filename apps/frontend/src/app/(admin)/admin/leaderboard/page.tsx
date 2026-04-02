"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/app/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminLeaderboard, getAdminExportUrl } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  Crown,
  Download,
  ExternalLink,
  Medal,
  Search,
  Trophy,
  Users,
} from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  batch: string;
  githubUsername: string | null;
  isPlaced: boolean;
  companyName: string | null;
  jriScore: number;
  dsaScore: number;
  githubScore: number;
  bestProjectScore: number | null;
  tier: string;
  lastUpdated: string | null;
};

const TIER_COLORS: Record<string, string> = {
  Legend: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Elite: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Pro: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Rising: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Challenger: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Rookie: "bg-muted/60 text-muted-foreground border-border/50",
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="size-4 text-amber-400" />;
  if (rank === 2) return <Medal className="size-4 text-slate-300" />;
  if (rank === 3) return <Medal className="size-4 text-amber-600" />;
  return <span className="text-xs font-mono font-bold text-muted-foreground">{rank}</span>;
}

export default function AdminLeaderboardPage() {
  const [data, setData] = useState<{ total: number; leaderboard: LeaderboardEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [batchFilter, setBatchFilter] = useState("2025");
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getAdminLeaderboard({
          batch: batchFilter || undefined,
          department: deptFilter || undefined,
          limit: 100,
        });
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [batchFilter, deptFilter]);

  const filtered = (data?.leaderboard ?? []).filter((s) =>
    search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const departments = [...new Set((data?.leaderboard ?? []).map((s) => s.department))].sort();
  const placedCount = (data?.leaderboard ?? []).filter((s) => s.isPlaced).length;
  const placementPct =
    data && data.total > 0 ? Math.round((placedCount / data.total) * 100) : 0;

  return (
    <PageShell
      eyebrow="College Admin"
      title="JRI Leaderboard"
      description="Students ranked by Job Readiness Index."
      actions={
        <div className="flex items-center gap-3">
          {/* Batch toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
            {["2024", "2025", "2026"].map((b) => (
              <button
                key={b}
                onClick={() => setBatchFilter(b)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                  batchFilter === b
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {b}
              </button>
            ))}
          </div>
          <Link
            href={getAdminExportUrl(batchFilter)}
            download
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="mr-2 size-3.5" />
            Export CSV
          </Link>
        </div>
      }
    >
      {/* Summary bar */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/80 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <Users className="size-3 text-primary" />
              Total on board
            </CardDescription>
            <CardTitle className="text-3xl font-black">{loading ? "—" : data?.total ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <Trophy className="size-3 text-amber-400" />
              Placed
            </CardDescription>
            <CardTitle className="text-3xl font-black">
              {loading ? "—" : placedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <Trophy className="size-3 text-emerald-400" />
              Placement %
            </CardDescription>
            <CardTitle className="text-3xl font-black">
              {loading ? "—" : `${placementPct}%`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, roll no, dept…"
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-md border border-border/60 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {(search || deptFilter) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs"
            onClick={() => { setSearch(""); setDeptFilter(""); }}
          >
            Clear filters
          </Button>
        )}
        {!loading && (
          <span className="ml-auto text-xs text-muted-foreground">
            Showing {filtered.length} of {data?.total ?? 0}
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="bg-destructive/5 border-destructive/20 p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="bg-card/40 border-dashed border-border/80 p-12 text-center">
          <p className="text-muted-foreground text-sm">No students match the current filters.</p>
        </Card>
      ) : (
        <Card className="bg-card/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-bold w-12">#</th>
                  <th className="px-4 py-3 font-bold">Student</th>
                  <th className="px-4 py-3 font-bold text-center">JRI</th>
                  <th className="px-4 py-3 font-bold text-center">Tier</th>
                  <th className="px-4 py-3 font-bold text-center">DSA</th>
                  <th className="px-4 py-3 font-bold text-center">Build</th>
                  <th className="px-4 py-3 font-bold text-center">Project</th>
                  <th className="px-4 py-3 font-bold text-right pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((s) => (
                  <tr
                    key={s.studentId}
                    className={cn(
                      "group transition-colors hover:bg-muted/20",
                      s.rank <= 3 && "bg-primary/3"
                    )}
                  >
                    <td className="px-4 py-3.5 w-12">
                      <div className="flex size-7 items-center justify-center">
                        <RankIcon rank={s.rank} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold leading-tight">{s.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {s.rollNumber} · {s.department}
                          </div>
                        </div>
                        {s.githubUsername && (
                          <Link
                            href={`/u/${s.githubUsername}`}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="size-3 text-muted-foreground hover:text-primary" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-primary text-base">
                      {s.jriScore}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] h-5 px-1.5", TIER_COLORS[s.tier] ?? "")}
                      >
                        {s.tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs text-muted-foreground font-medium">
                      {s.dsaScore}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs text-muted-foreground font-medium">
                      {s.githubScore}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs text-muted-foreground font-medium">
                      {s.bestProjectScore != null ? `${s.bestProjectScore}/100` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right pr-5">
                      {s.isPlaced ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                            Placed
                          </Badge>
                          {s.companyName && (
                            <span className="text-[10px] text-muted-foreground">{s.companyName}</span>
                          )}
                        </div>
                      ) : s.jriScore >= 70 ? (
                        <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px]">
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px] border-border/40">
                          In progress
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageShell>
  );
}
