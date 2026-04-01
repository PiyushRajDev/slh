"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getBatchAnalytics, getAdminExportUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Download,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  ChevronRight,
  Briefcase,
  Building2,
  Package,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [batchFilter, setBatchFilter] = useState("2025");
  const [searchQuery, setSearchQuery] = useState("");

  // Placement-derived data
  const placementStats = useMemo(() => {
    if (!data?.students) return null;
    const students: any[] = data.students;

    const placed = students.filter((s) => s.isPlaced);
    const notPlaced = students.filter((s) => !s.isPlaced);
    const placedPct = students.length > 0 ? Math.round((placed.length / students.length) * 100) : 0;

    // Company breakdown (top 8)
    const companyMap = new Map<string, number>();
    placed.forEach((s) => {
      const company = s.companyName || "Unknown";
      companyMap.set(company, (companyMap.get(company) ?? 0) + 1);
    });
    const companies = [...companyMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Package distribution buckets
    const packages = placed.filter((s) => s.packageOffered != null);
    const pkgBuckets = [
      { label: "< 5 LPA", count: packages.filter((s) => s.packageOffered < 5).length },
      { label: "5–10 LPA", count: packages.filter((s) => s.packageOffered >= 5 && s.packageOffered < 10).length },
      { label: "10–20 LPA", count: packages.filter((s) => s.packageOffered >= 10 && s.packageOffered < 20).length },
      { label: "20+ LPA", count: packages.filter((s) => s.packageOffered >= 20).length },
    ];

    const avgPackage =
      packages.length > 0
        ? Math.round((packages.reduce((sum, s) => sum + s.packageOffered, 0) / packages.length) * 10) / 10
        : null;

    const pieData = [
      { name: "Placed", value: placed.length, color: "hsl(var(--chart-2))" },
      { name: "Not Placed", value: notPlaced.length, color: "hsl(var(--border))" },
    ];

    return { placed: placed.length, total: students.length, placedPct, companies, pkgBuckets, avgPackage, pieData };
  }, [data]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const analytics = await getBatchAnalytics(batchFilter);
        setData(analytics);
      } catch (err: any) {
        setError(err.message || "Failed to load admin analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [batchFilter]);

  const filteredStudents = data?.students?.filter((s: any) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.githubUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading && !data) {
    return (
      <PageShell eyebrow="College Admin" title="Batch Analytics" description="Loading ecosystem insights...">
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="College Admin"
      title="Ecosystem Analytics"
      description={`Intelligence & placement readiness report for Batch ${batchFilter}`}
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card p-1">
            {["2024", "2025", "2026"].map((b) => (
              <button
                key={b}
                onClick={() => setBatchFilter(b)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                  batchFilter === b ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/80 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <Users className="size-3 text-primary" />
              Total Students
            </CardDescription>
            <CardTitle className="text-3xl font-black">{data?.summary?.totalStudents || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {data?.summary?.studentsWithJri} profiles indexed
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <TrendingUp className="size-3 text-emerald-400" />
              Average JRI
            </CardDescription>
            <CardTitle className="text-3xl font-black">{data?.summary?.avgJri || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Across all platforms
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <ShieldCheck className="size-3 text-blue-400" />
              Placement Ready
            </CardDescription>
            <CardTitle className="text-3xl font-black">{data?.summary?.placementReadyPercent}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {data?.summary?.placementReady} students above JRI 70
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <AlertTriangle className="size-3 text-amber-400" />
              High Risk
            </CardDescription>
            <CardTitle className="text-3xl font-black">
              {data?.risks?.find((r: any) => r.label.includes("No project"))?.percent || 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Missing project evidence
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk Analysis Heatmap Preview */}
        <Card className="lg:col-span-1 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Risk Distribution</CardTitle>
            <CardDescription>Identifying gaps in student preparation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.risks?.map((risk: any) => (
              <div key={risk.label} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>{risk.label}</span>
                  <span className={cn(risk.percent > 30 ? "text-red-400" : "text-amber-400")}>{risk.percent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", risk.percent > 30 ? "bg-red-500" : "bg-amber-500")}
                    style={{ width: `${risk.percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{risk.description}</p>
              </div>
            ))}
            <Link 
              href="/admin/alerts"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full text-xs")}
            >
              View detailed alerts
              <ArrowRight className="ml-2 size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Rankings / Student List */}
        <Card className="lg:col-span-2 bg-card/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Student Rankings</CardTitle>
                <CardDescription>Performance sorted by JRI</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-9 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/40 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-bold">Student</th>
                    <th className="px-4 py-3 font-bold">JRI</th>
                    <th className="px-4 py-3 font-bold">Tier</th>
                    <th className="px-4 py-3 font-bold">DSA</th>
                    <th className="px-4 py-3 font-bold">Projects</th>
                    <th className="px-4 py-3 font-bold text-right pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredStudents.slice(0, 10).map((s: any) => (
                    <tr key={s.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">{s.department}</div>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-primary">{s.jriScore}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 capitalize">{s.tier}</Badge>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {s.leetcode?.totalSolved || 0} Solved
                      </td>
                      <td className="px-4 py-4 text-xs font-medium">
                         {s.projects.avgScore || 0} Avg
                      </td>
                      <td className="px-4 py-4 text-right pr-6">
                        {s.isPlaced ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">Placed</Badge>
                        ) : s.jriScore >= 70 ? (
                          <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px]">Ready</Badge>
                        ) : (
                          <Badge variant="ghost" className="text-muted-foreground text-[10px]">Processing</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length > 10 && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Showing top 10 of {filteredStudents.length} students. Export CSV for full list.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.departments?.map((dept: any) => (
          <Card key={dept.name} className="bg-card/60 backdrop-blur-sm border-border/40">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{dept.name}</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{dept.count} Students</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Average JRI</div>
                  <div className="text-lg font-bold">{dept.avgJri}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Placement Ready</div>
                  <div className="text-sm font-semibold text-emerald-400">{dept.placementReadyPercent}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Placement Outcomes ─── */}
      {placementStats && (
        <>
          <div className="flex items-center gap-4 pt-2">
            <h2 className="text-base font-semibold">Placement Outcomes</h2>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          {/* Summary row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/80 border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                  <Briefcase className="size-3 text-emerald-400" />
                  Placed
                </CardDescription>
                <CardTitle className="text-3xl font-black">{placementStats.placed}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">{placementStats.placedPct}% of batch</div>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                  <Building2 className="size-3 text-blue-400" />
                  Companies
                </CardDescription>
                <CardTitle className="text-3xl font-black">{placementStats.companies.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Unique hiring companies</div>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                  <Package className="size-3 text-violet-400" />
                  Avg Package
                </CardDescription>
                <CardTitle className="text-3xl font-black">
                  {placementStats.avgPackage != null ? `${placementStats.avgPackage} LPA` : "—"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Across reported offers</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Placement ratio donut */}
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">Placement Ratio</CardTitle>
                <CardDescription>Placed vs. not placed</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={placementStats.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {placementStats.pieData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex justify-center gap-6 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full bg-[hsl(var(--chart-2))]" />
                    Placed ({placementStats.placed})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full bg-border" />
                    Not placed ({placementStats.total - placementStats.placed})
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package distribution */}
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">Package Distribution</CardTitle>
                <CardDescription>Students per salary bracket</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={placementStats.pkgBuckets} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top hiring companies */}
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">Top Hiring Companies</CardTitle>
                <CardDescription>Students placed per company</CardDescription>
              </CardHeader>
              <CardContent>
                {placementStats.companies.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">No placement data recorded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {placementStats.companies.map((c: any) => (
                      <div key={c.name} className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">{c.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-emerald-500/70"
                              style={{
                                width: `${Math.round((c.count / placementStats.placed) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="w-5 text-right text-xs font-bold text-muted-foreground">
                            {c.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageShell>
  );
}
