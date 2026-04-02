"use client";

import { PageShell } from "@/components/app/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, UserPlus, ArrowRight, ShieldCheck, PieChart, Users } from "lucide-react";
import Link from "next/link";

export default function OnboardPortalPage() {
  return (
    <PageShell
      eyebrow="SuperAdmin Console"
      title="Platform Onboarding"
      description="Manage the growth of SkillLighthouse: add new institutions or simulate student experiences."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Onboard College */}
        <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader>
            <div className="mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <CardTitle>Onboard a College</CardTitle>
            <CardDescription>
              Register a new institution and provision its first administrative account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/onboard/college">
              <Button className="w-full gap-2">
                Get started
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
            <Building2 className="size-32" />
          </div>
        </Card>

        {/* Student Preview */}
        <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader>
            <div className="mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <UserPlus className="size-5" />
            </div>
            <CardTitle>Student Experience</CardTitle>
            <CardDescription>
              View or simulate the onboarding flow that students go through to link their profiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/onboard/student">
              <Button variant="outline" className="w-full gap-2">
                Preview flow
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
            <UserPlus className="size-32" />
          </div>
        </Card>

        {/* Admin Console */}
        <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader>
            <div className="mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle>Admin Console</CardTitle>
            <CardDescription>
              Access the institutional dashboard to manage leaderboards and view student metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button variant="outline" className="w-full gap-2">
                Manage analytics
                <PieChart className="size-4" />
              </Button>
            </Link>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
            <Users className="size-32" />
          </div>
        </Card>
      </div>

      <div className="mt-12 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Platform Statistics
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Colleges", value: "12", trend: "+2 this month" },
            { label: "Total Students", value: "2,840", trend: "+15% growth" },
            { label: "Analyses Run", value: "48,291", trend: "Last 24h: 412" },
            { label: "System Uptime", value: "99.98%", trend: "Healthy" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/70 bg-card/60 p-4 transition-all hover:bg-card/90"
            >
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="mt-1 text-2xl font-bold">{stat.value}</div>
              <div className="mt-1 text-[10px] text-primary/80">{stat.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
