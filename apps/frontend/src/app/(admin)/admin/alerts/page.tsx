"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAdminAlerts } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  ChevronRight,
  TrendingDown,
  Clock,
  Code2,
  FileX,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function AdminAlertsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const alerts = await getAdminAlerts();
        setData(alerts);
      } catch (err: any) {
        setError(err.message || "Failed to fetch early warning alerts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "JRI_DECLINING": return <TrendingDown className="size-4 text-red-400" />;
      case "LOW_JRI": return <AlertCircle className="size-4 text-red-500" />;
      case "STALE_DSA": return <Clock className="size-4 text-amber-400" />;
      case "LOW_PROJECT": return <Code2 className="size-4 text-amber-500" />;
      case "NO_JRI": return <FileX className="size-4 text-muted-foreground" />;
      default: return <AlertTriangle className="size-4" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-500/50 bg-red-500/5 text-red-200";
      case "high": return "border-amber-500/50 bg-amber-500/5 text-amber-200";
      case "medium": return "border-blue-500/50 bg-blue-500/5 text-blue-200";
      default: return "";
    }
  };

  if (loading) {
    return (
      <PageShell eyebrow="College Admin" title="Early Warning Alerts" description="Scanning for at-risk students...">
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="College Admin"
      title="Early Warning System"
      description="Identifying at-risk students based on score stagnation and activity gaps."
      actions={
        <Badge variant="outline" className="h-8 gap-2 px-3">
          <Bell className="size-3.5 text-primary" />
          {data?.totalAlerts || 0} active alerts
        </Badge>
      }
    >
      {/* Alert Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/70 border-red-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              Critical
              <div className="size-6 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center">
                {data?.bySeverity?.critical || 0}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/70 border-amber-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              High Risk
              <div className="size-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center">
                {data?.bySeverity?.high || 0}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/70 border-blue-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              Moderate
              <div className="size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">
                {data?.bySeverity?.medium || 0}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Alert List */}
      <div className="space-y-4">
        {data?.alerts?.length > 0 ? (
          data.alerts.map((alert: any, idx: number) => (
            <div
              key={`${alert.studentId}-${idx}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-lg",
                getSeverityStyles(alert.severity)
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-background/20 p-2">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{alert.studentName}</h3>
                      <Badge variant="outline" className="text-[10px] h-4 border-current">
                        {alert.department}
                      </Badge>
                      <Badge className="bg-background/40 hover:bg-background/60 text-[10px] h-4 uppercase tracking-tighter">
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link 
                    href={`/u/${alert.studentName.split(' ')[0].toLowerCase()}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 bg-background/20 hover:bg-background/40")}
                  >
                    View Profile
                    <ChevronRight className="ml-2 size-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Card className="bg-card/40 border-dashed border-border/80 p-12 text-center">
            <div className="size-12 mx-auto rounded-full bg-emerald-500/10 p-3 text-emerald-400 mb-4">
              <ShieldCheck className="size-full" />
            </div>
            <h3 className="text-lg font-bold">No High-Risk Alerts Found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
              Currently all students are meeting preparation targets or data is up-to-date.
            </p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
