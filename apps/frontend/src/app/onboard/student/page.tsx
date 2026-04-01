"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/app/page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { buildGitHubConnectUrl, getOnboardingStatus } from "@/lib/api";
import { hasSessionToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Code2,
  ExternalLink,
  FolderGit2,
  Loader2,
  PartyPopper,
  UserCheck,
  Zap,
} from "lucide-react";

const Github = (props: React.JSX.IntrinsicElements["svg"]) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

type OnboardingStep = {
  key: string;
  label: string;
  complete: boolean;
  connectedAt?: string | null;
  platforms?: string[];
  jriScore?: number | null;
  calculatedAt?: string | null;
  projectScore?: number | null;
  analyzedAt?: string | null;
};

const STEP_META: Record<
  string,
  { icon: React.ElementType; description: string; action?: { label: string; href?: string; githubConnect?: boolean } }
> = {
  account_created: {
    icon: UserCheck,
    description: "Your SLH account is active and ready.",
  },
  github_connected: {
    icon: Github,
    description: "Connect your GitHub account so SLH can analyze your repositories.",
    action: { label: "Connect GitHub", githubConnect: true },
  },
  dsa_profile_linked: {
    icon: Code2,
    description: "Verify at least one DSA profile (LeetCode or Codeforces) to unlock your JRI score.",
    action: { label: "Go to dashboard", href: "/dashboard" },
  },
  jri_calculated: {
    icon: Zap,
    description: "Calculate your Job Readiness Index to see how you compare to peers.",
    action: { label: "Calculate JRI", href: "/dashboard" },
  },
  project_analyzed: {
    icon: FolderGit2,
    description: "Run a deep analysis on one of your GitHub projects.",
    action: { label: "Analyze a project", href: "/analyze" },
  },
};

function StepCard({ step, active }: { step: OnboardingStep; active: boolean }) {
  const meta = STEP_META[step.key];
  const Icon = meta?.icon ?? Circle;
  const [githubUrl, setGithubUrl] = useState("");

  useEffect(() => {
    if (meta?.action?.githubConnect) {
      setGithubUrl(buildGitHubConnectUrl());
    }
  }, [meta?.action?.githubConnect]);

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4 transition-colors",
        step.complete
          ? "border-border/50 bg-background/40 opacity-70"
          : active
          ? "border-primary/30 bg-primary/5"
          : "border-border/60 bg-background/60"
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          step.complete ? "bg-primary/10" : active ? "bg-primary/15" : "bg-muted/60"
        )}
      >
        {step.complete ? (
          <CheckCircle2 className="size-4.5 text-primary" />
        ) : (
          <Icon className={cn("size-4.5", active ? "text-primary" : "text-muted-foreground")} />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", step.complete && "line-through text-muted-foreground")}>
            {step.label}
          </span>
          {step.complete && (
            <Badge variant="secondary" className="text-[10px]">
              Done
            </Badge>
          )}
          {!step.complete && active && (
            <Badge className="text-[10px]">Up next</Badge>
          )}
        </div>

        {!step.complete && meta?.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{meta.description}</p>
        )}

        {step.complete && step.key === "github_connected" && step.connectedAt && (
          <p className="text-xs text-muted-foreground">
            Connected {new Date(step.connectedAt).toLocaleDateString()}
          </p>
        )}
        {step.complete && step.key === "dsa_profile_linked" && step.platforms && (
          <p className="text-xs text-muted-foreground">
            Verified: {step.platforms.map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(", ")}
          </p>
        )}
        {step.complete && step.key === "jri_calculated" && step.jriScore != null && (
          <p className="text-xs text-muted-foreground">JRI score: {step.jriScore}</p>
        )}
        {step.complete && step.key === "project_analyzed" && step.projectScore != null && (
          <p className="text-xs text-muted-foreground">
            Project score: {step.projectScore}/100
          </p>
        )}
      </div>

      {!step.complete && meta?.action && (
        <div className="shrink-0">
          {meta.action.githubConnect ? (
            <a
              href={githubUrl}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5 text-xs h-8"
              )}
            >
              <Github className="size-3.5" />
              {meta.action.label}
            </a>
          ) : (
            <Link
              href={meta.action.href!}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs h-8"
              )}
            >
              {meta.action.label}
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentOnboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    firstName: string;
    percentComplete: number;
    isFullyOnboarded: boolean;
    steps: OnboardingStep[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasSessionToken()) {
      startTransition(() => router.replace("/login"));
      return;
    }

    getOnboardingStatus()
      .then((data) => setStatus(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load onboarding status"))
      .finally(() => setLoading(false));
  }, [router]);

  const firstIncomplete = status?.steps.findIndex((s) => !s.complete) ?? -1;

  return (
    <PageShell
      eyebrow="Onboarding"
      title="Complete your profile."
      description="Link your coding accounts to unlock your Job Readiness Index and project analysis."
    >
      {loading && (
        <div className="space-y-3 max-w-2xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive" className="max-w-2xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && status && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
          <div className="space-y-4">
            {/* Progress bar */}
            <Card className="bg-card/75">
              <CardContent className="pt-5 pb-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Hey {status.firstName}, here&rsquo;s your progress
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {status.percentComplete}%
                    </span>
                  </div>
                  <Progress value={status.percentComplete} />
                  <p className="text-xs text-muted-foreground">
                    {status.steps.filter((s) => s.complete).length} of {status.steps.length} steps complete
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Checklist */}
            <div className="space-y-2">
              {status.steps.map((step, i) => (
                <StepCard
                  key={step.key}
                  step={step}
                  active={i === firstIncomplete}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {status.isFullyOnboarded ? (
              <Card className="bg-primary/8 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PartyPopper className="size-5 text-primary" />
                    <CardTitle>You&rsquo;re all set!</CardTitle>
                  </div>
                  <CardDescription>
                    All onboarding steps are complete. Your JRI is live.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="lg"
                    className="h-10 w-full"
                    onClick={() => startTransition(() => router.push("/dashboard"))}
                  >
                    Go to dashboard
                    <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/55">
                <CardHeader>
                  <CardTitle>Why complete this?</CardTitle>
                  <CardDescription>
                    Each step unlocks more of SLH.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      title: "GitHub connection",
                      body: "Lets SLH fetch your public repos and run AI-powered project analyses.",
                    },
                    {
                      title: "DSA profile verification",
                      body: "Prove ownership of your LeetCode / Codeforces account so scores are counted.",
                    },
                    {
                      title: "JRI score",
                      body: "A composite signal of your DSA skill, project quality, and activity — recruiters see this.",
                    },
                    {
                      title: "Project analysis",
                      body: "Get a detailed breakdown of one repo: code quality, complexity, and a score out of 100.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-3"
                    >
                      <Zap className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium">{item.title}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button
              variant="ghost"
              size="lg"
              className="h-10 w-full"
              onClick={() => startTransition(() => router.push("/dashboard"))}
            >
              Skip for now
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
