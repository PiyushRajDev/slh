"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBatchAnalytics, getAdminAlerts, getLatestAnalysis, ApiError } from "@/lib/api-client";
import { useAuth } from "@/components/app/auth-context";
import { isAdmin } from "@/lib/auth";
import {
  BarChart3,
  Trophy,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  LayoutDashboard,
  AlertCircle,
  UserPlus
} from "lucide-react";

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const isDenied = searchParams.get("denied") === "1";
  const [analytics, setAnalytics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    async function loadData() {
      // Don't fetch if still checking auth or not an admin
      if (authLoading || !user || !isAdmin(user.role)) return;

      setLoading(true);
      try {
        const [analyticsData, alertsData] = await Promise.all([
          getBatchAnalytics("2025"),
          getAdminAlerts()
        ]);
        setAnalytics(analyticsData);
        setAlerts(alertsData);
      } catch (error: any) {
        // Only log if it's not a 401 (auth errors are handled by the layout)
        const isAuthError = error instanceof ApiError && error.status === 401;
        if (!isAuthError) {
          console.error("Failed to fetch admin dashboard data", error);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, authLoading]);

  const stats = [
    {
      label: "Total Students",
      value: analytics?.summary?.totalStudents || 0,
      description: "Profiles indexed",
      icon: Users,
      color: "text-primary"
    },
    {
      label: "Average JRI",
      value: analytics?.summary?.avgJri || 0,
      description: "Across batch",
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    {
      label: "Placement Ready",
      value: `${analytics?.summary?.placementReadyPercent || 0}%`,
      description: "Above JRI 70",
      icon: ShieldCheck,
      color: "text-blue-400"
    },
    {
      label: "Active Alerts",
      value: alerts?.length || 0,
      description: "Requires attention",
      icon: AlertTriangle,
      color: "text-amber-400"
    }
  ];

  const navCards = [
    {
      title: "Ecosystem Analytics",
      description: "Deep dive into batch performance, placement trends, and department metrics.",
      href: "/admin/analytics",
      icon: BarChart3,
      cta: "View Analytics"
    },
    {
      title: "JRI Leaderboard",
      description: "Rank students by their Job Readiness Index and filter by department or batch.",
      href: "/admin/leaderboard",
      icon: Trophy,
      cta: "View Leaderboard"
    },
    {
      title: "Critical Alerts",
      description: "Identify high-risk students missing projects or platform connections.",
      href: "/admin/alerts",
      icon: AlertTriangle,
      cta: "View Alerts"
    },
    {
      title: "Student Onboarding",
      description: "Bulk import students from a CSV file to automatically provision their platform accounts.",
      href: "/admin/onboard",
      icon: UserPlus,
      cta: "Onboard Students"
    }
  ];

  return (
    <PageShell
      eyebrow="Command Center"
      title="Admin Dashboard"
      description="Overview of batch performance and system-wide intelligence."
    >
      {isDenied && (
        <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/25">
          <AlertCircle className="size-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            Can&apos;t access the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.label} className="bg-card/80 border-border/40">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                  <stat.icon className={`size-3 ${stat.color}`} />
                  {stat.label}
                </CardDescription>
                <CardTitle className="text-3xl font-black">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Navigation Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Quick Access</h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {navCards.map((card) => (
            <Card key={card.title} className="group relative overflow-hidden bg-card/40 transition-all hover:bg-card/60 border-border/40 hover:border-primary/30">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <card.icon className="size-5" />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription className="line-clamp-2">{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={card.href}>
                  <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-primary/10">
                    {card.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity / System Status Placeholder */}
      <Card className="bg-card/30 border-dashed border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <LayoutDashboard className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">System Insights</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            More administrative tools and system health metrics will appear here as the platform expands.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
