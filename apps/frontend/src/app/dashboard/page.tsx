"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/app/page-shell";
import {
  ApiError,
  buildGitHubConnectUrl,
  getAnalyses,
  getJriProfile,
  getMe,
  getOnboardingStatus,
  recalculateJri,
  verifyPlatformAccount,
} from "@/lib/api";
import {
  extractRepoSlug,
  formatProfileLabel,
  getGrowthDelta,
  type AnalysisRecord,
  type AuthMeResponse,
} from "@/lib/analysis";
import { clearSessionTokens } from "@/lib/auth";
import { JriProfileResponse } from "@/lib/jri";
import { getStarterProjectIdeas } from "@/lib/starter-projects";
import { generateRecommendations } from "@/lib/learning-paths";
import { cn } from "@/lib/utils";

// Dashboard components
import { JriGrowthChart } from "@/components/dashboard/JriGrowthChart";
import { AttributeRadar } from "@/components/dashboard/AttributeRadar";
import { LearningPath } from "@/components/dashboard/LearningPath";
import { TierProgress } from "@/components/dashboard/TierProgress";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  FolderGit2,
  Gamepad2,
  Key,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";

// ─── Tab Definitions ───
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "growth", label: "Growth", icon: TrendingUp },
  { id: "dsa", label: "DSA", icon: Code2 },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "publicity", label: "Publicity", icon: BarChart3 }, // Using BarChart3 since Globe might be missing
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [profile, setProfile] = useState<AuthMeResponse["data"]["user"] | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [jriProfile, setJriProfile] = useState<JriProfileResponse | null>(null);
  const [jriError, setJriError] = useState("");
  const [jriSubmitting, setJriSubmitting] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [dsaWeight, setDsaWeight] = useState(55);
  const [projectWeight, setProjectWeight] = useState(45);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onboardingStatus, setOnboardingStatus] = useState<{
    percentComplete: number;
    isFullyOnboarded: boolean;
    steps: Array<{ key: string; complete: boolean }>;
  } | null>(null);

  const [verifyingLeetcode, setVerifyingLeetcode] = useState(false);
  const [verifyingCodeforces, setVerifyingCodeforces] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{
    platform: "leetcode" | "codeforces";
    success: boolean;
    message: string;
  } | null>(null);

  const verificationToken = useMemo(() => {
    if (!profile?.student?.id) return "SLH-TOKEN";
    return `SLH-${profile.student.id.slice(-6).toUpperCase()}`;
  }, [profile?.student?.id]);

  const showVerificationCard = useMemo(() => {
    const leetcodeNeedsVerify = leetcodeUsername.trim() !== "" &&
      (jriProfile?.platforms.leetcode.username?.toLowerCase() !== leetcodeUsername.trim().toLowerCase() ||
       !jriProfile?.platforms.leetcode.isVerified);

    const codeforcesNeedsVerify = codeforcesHandle.trim() !== "" &&
      (jriProfile?.platforms.codeforces.username?.toLowerCase() !== codeforcesHandle.trim().toLowerCase() ||
       !jriProfile?.platforms.codeforces.isVerified);

    return leetcodeNeedsVerify || codeforcesNeedsVerify;
  }, [leetcodeUsername, codeforcesHandle, jriProfile]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [me, history, jri, onboarding] = await Promise.all([
          getMe(),
          getAnalyses(50),
          getJriProfile().catch(() => null),
          getOnboardingStatus().catch(() => null),
        ]);
        if (cancelled) return;

        setProfile(me.data.user);
        setAnalyses(
          [...history.analyses].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );

        if (jri) {
          setJriProfile(jri);
          setLeetcodeUsername(jri.platforms.leetcode.username ?? "");
          setCodeforcesHandle(jri.platforms.codeforces.username ?? "");
          setDsaWeight(Math.round(jri.card.importance.dsa));
          setProjectWeight(Math.round(jri.card.importance.projects));
          setJriError("");
        } else {
          setJriError("JRI profile is not available yet. Recalculate to initialize it.");
        }

        if (onboarding) setOnboardingStatus(onboarding);
      } catch (loadError) {
        if (cancelled) return;

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          clearSessionTokens();
        } else if (
          loadError instanceof Error &&
          /Unauthorized|No token|Invalid or expired token/i.test(loadError.message)
        ) {
          clearSessionTokens();
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function handleRecalculateJri() {
    setJriSubmitting(true);
    setJriError("");

    try {
      const updated = await recalculateJri({
        leetcodeUsername: leetcodeUsername.trim() || undefined,
        codeforcesHandle: codeforcesHandle.trim() || undefined,
        weights: { dsa: dsaWeight, projects: projectWeight },
      });

      setJriProfile(updated);
      setLeetcodeUsername(updated.platforms.leetcode.username ?? leetcodeUsername);
      setCodeforcesHandle(updated.platforms.codeforces.username ?? codeforcesHandle);
      setDsaWeight(Math.round(updated.card.importance.dsa));
      setProjectWeight(Math.round(updated.card.importance.projects));
    } catch (recalcError) {
      setJriError(
        recalcError instanceof Error ? recalcError.message : "Failed to recalculate JRI profile"
      );
    } finally {
      setJriSubmitting(false);
    }
  }

  async function handleVerify(platform: "leetcode" | "codeforces") {
    const username = platform === "leetcode" ? leetcodeUsername : codeforcesHandle;
    if (!username.trim()) {
      setVerifyStatus({
        platform,
        success: false,
        message: `Please enter your ${platform} handle first.`,
      });
      return;
    }

    if (platform === "leetcode") setVerifyingLeetcode(true);
    else setVerifyingCodeforces(true);

    setVerifyStatus(null);

    try {
      const { verified } = await verifyPlatformAccount(platform, username.trim(), verificationToken);
      if (verified) {
        setVerifyStatus({
          platform,
          success: true,
          message: `Successfully verified your ${platform} account!`,
        });
      } else {
        setVerifyStatus({
          platform,
          success: false,
          message: `Verification failed. Make sure "${verificationToken}" is in your profile (About Me/Real Name).`,
        });
      }
    } catch (err: any) {
      setVerifyStatus({
        platform,
        success: false,
        message: err.message || "Verification request failed.",
      });
    } finally {
      setVerifyingLeetcode(false);
      setVerifyingCodeforces(false);
    }
  }

  const processedAnalyses = useMemo(() => {
    return analyses.map((analysis, index) => {
      const previous = analyses
        .slice(index + 1)
        .find(
          (candidate) =>
            candidate.repoUrl === analysis.repoUrl && candidate.status === "COMPLETED"
        );
      return { ...analysis, delta: getGrowthDelta(analysis, previous) };
    });
  }, [analyses]);

  const starterIdeas = useMemo(
    () => getStarterProjectIdeas(profile?.student?.department),
    [profile?.student?.department]
  );

  const totalGrowth = useMemo(() => {
    const repos = new Map<string, AnalysisRecord[]>();
    analyses.forEach((analysis) => {
      if (!repos.has(analysis.repoUrl)) repos.set(analysis.repoUrl, []);
      repos.get(analysis.repoUrl)?.push(analysis);
    });
    return [...repos.values()].reduce((total, repoAnalyses) => {
      const completed = repoAnalyses
        .filter((a) => a.status === "COMPLETED" && a.overallScore != null)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (completed.length < 2) return total;
      const first = completed[0].overallScore ?? 0;
      const last = completed[completed.length - 1].overallScore ?? 0;
      return total + Math.max(0, last - first);
    }, 0);
  }, [analyses]);

  const recommendations = useMemo(
    () => (jriProfile ? generateRecommendations(jriProfile) : []),
    [jriProfile]
  );

  const githubConnected = Boolean(profile?.student?.githubUsername);

  // ─── Loading State ───
  if (loading) {
    return (
      <PageShell
        eyebrow="Profile"
        title="Loading your dashboard"
        description="Pulling your latest analyses and profile state."
      >
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </PageShell>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <PageShell
        eyebrow="Profile"
        title="We couldn&apos;t load the dashboard."
        description="Authentication or API access needs attention before we can show your history."
      >
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-10")}>
            Go to login
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Profile"
      title={
        profile?.student
          ? `${profile.student.firstName} ${profile.student.lastName}`
          : profile?.email ?? "Dashboard"
      }
      description={
        profile?.student?.department
          ? `${profile.student.department} · ${githubConnected ? profile.student.githubUsername : "GitHub not connected"}`
          : "Connect GitHub to analyze repositories."
      }
      actions={
        <>
          {githubConnected ? (
            <Badge className="border-0 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              GitHub connected
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="h-10"
              onClick={() => window.location.assign(buildGitHubConnectUrl())}
            >
              <FolderGit2 className="size-4" />
              Connect GitHub
            </Button>
          )}
          <Link href="/analyze" className={cn(buttonVariants({ size: "lg" }), "h-10")}>
            New analysis
          </Link>
        </>
      }
    >
      {/* ─── Onboarding Banner ─── */}
      {onboardingStatus && !onboardingStatus.isFullyOnboarded && (
        <Link
          href="/onboard/student"
          className="flex items-center justify-between gap-4 rounded-xl border border-primary/25 bg-primary/6 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <CheckCircle2 className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Complete your profile — {onboardingStatus.percentComplete}% done</p>
              <p className="text-xs text-muted-foreground">
                {onboardingStatus.steps.filter((s) => s.complete).length} of{" "}
                {onboardingStatus.steps.length} steps complete · Connect GitHub, verify DSA profiles, and more
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 shrink-0 text-primary" />
        </Link>
      )}

      {/* ─── Tab Navigation ─── */}
      <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1 backdrop-blur-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/70"
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ─── */}
      <div className="animate-in fade-in duration-300">
        {activeTab === "overview" && (
          <OverviewTab
            jriProfile={jriProfile}
            analyses={analyses}
            totalGrowth={totalGrowth}
            recommendations={recommendations}
            githubConnected={githubConnected}
          />
        )}
        {activeTab === "growth" && (
          <GrowthTab
            jriProfile={jriProfile}
            recommendations={recommendations}
          />
        )}
        {activeTab === "publicity" && (
          <PublicityTab profile={profile} />
        )}
        {activeTab === "dsa" && (
          <DsaTab
            jriProfile={jriProfile}
            jriError={jriError}
            jriSubmitting={jriSubmitting}
            leetcodeUsername={leetcodeUsername}
            codeforcesHandle={codeforcesHandle}
            dsaWeight={dsaWeight}
            projectWeight={projectWeight}
            verifyingLeetcode={verifyingLeetcode}
            verifyingCodeforces={verifyingCodeforces}
            verifyStatus={verifyStatus}
            showVerificationCard={showVerificationCard}
            verificationToken={verificationToken}
            setLeetcodeUsername={setLeetcodeUsername}
            setCodeforcesHandle={setCodeforcesHandle}
            setDsaWeight={setDsaWeight}
            setProjectWeight={setProjectWeight}
            setVerifyStatus={setVerifyStatus}
            handleRecalculateJri={handleRecalculateJri}
            handleVerify={handleVerify}
          />
        )}
        {activeTab === "projects" && (
          <ProjectsTab
            analyses={analyses}
            processedAnalyses={processedAnalyses}
            starterIdeas={starterIdeas}
            jriProfile={jriProfile}
            githubConnected={githubConnected}
            profile={profile}
          />
        )}
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════

function OverviewTab({
  jriProfile,
  analyses,
  totalGrowth,
  recommendations,
  githubConnected,
}: {
  jriProfile: JriProfileResponse | null;
  analyses: AnalysisRecord[];
  totalGrowth: number;
  recommendations: ReturnType<typeof generateRecommendations>;
  githubConnected: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* JRI Hero Card + Tier Progress */}
      {jriProfile ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* JRI Score Card */}
          <Card className="bg-card/80">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Job Readiness Index
                  </div>
                  <div className="text-6xl font-semibold tracking-tight text-primary">
                    {Math.round(jriProfile.card.jriScore)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>DSA {Math.round(jriProfile.card.components.dsaScore)}</span>
                    <span className="text-border">•</span>
                    <span>Projects {Math.round(jriProfile.card.components.projectScore)}</span>
                  </div>
                </div>
                <div className="ml-auto flex flex-col items-end gap-2">
                  <Badge className="border-0 bg-primary/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    {jriProfile.card.tier}
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {jriProfile.card.archetype}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tier Progress + Quick Stats */}
          <div className="space-y-4">
            <TierProgress
              jriScore={jriProfile.card.jriScore}
              tier={jriProfile.card.tier}
            />
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/70 bg-card/80 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Repos</div>
                <div className="mt-1 text-xl font-semibold">
                  {new Set(analyses.map((a) => a.repoUrl)).size}
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/80 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Analyses</div>
                <div className="mt-1 text-xl font-semibold">{analyses.length}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/80 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Growth</div>
                <div className="mt-1 flex items-center gap-1 text-xl font-semibold">
                  <TrendingUp className="size-4 text-primary" />
                  +{totalGrowth}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="bg-card/80">
          <CardContent className="p-6">
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 p-6 text-center">
              <Gamepad2 className="mx-auto size-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No JRI snapshot yet. Go to the <strong>DSA</strong> tab to link your handles and calculate your first score.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radar + Top Recommendations side by side */}
      {jriProfile ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <AttributeRadar
            attributes={jriProfile.card.attributes}
            archetype={jriProfile.card.archetype}
          />

          {/* Top 3 recommendations preview */}
          <Card className="bg-card/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="size-4 text-primary" />
                    Next Steps
                  </CardTitle>
                  <CardDescription>
                    Top priorities to improve your JRI
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your profile looks great! Keep building and practicing.
                </p>
              ) : (
                recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-3"
                  >
                    <span className="mt-0.5 text-base">{rec.icon}</span>
                    <div className="flex-1 space-y-0.5">
                      <div className="text-sm font-medium text-foreground">{rec.title}</div>
                      <div className="text-[12px] text-primary/80">{rec.estimatedImpact}</div>
                    </div>
                  </div>
                ))
              )}
              {recommendations.length > 3 && (
                <button
                  onClick={() => {/* Tab switch handled by parent - we'll use a workaround */}}
                  className="text-xs text-primary hover:underline"
                >
                  View all {recommendations.length} recommendations →
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Platform connection CTA if not connected */}
      {!githubConnected && (
        <Card className="bg-card/65">
          <CardHeader>
            <CardTitle>Connect GitHub before analysis</CardTitle>
            <CardDescription>
              The API can only analyze repositories from the GitHub account linked to your SLH profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              size="lg"
              className="h-10 w-full"
              onClick={() => window.location.assign(buildGitHubConnectUrl())}
            >
              <FolderGit2 className="size-4" />
              Connect GitHub
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  GROWTH TAB
// ═══════════════════════════════════════════════════════════════════════════

function GrowthTab({
  jriProfile,
  recommendations,
}: {
  jriProfile: JriProfileResponse | null;
  recommendations: ReturnType<typeof generateRecommendations>;
}) {
  return (
    <div className="space-y-6">
      {/* Growth Timeline Chart */}
      <JriGrowthChart history={jriProfile?.history ?? []} />

      {/* Full Recommendations */}
      <LearningPath recommendations={recommendations} />

      {/* Project Evidence Summary */}
      {jriProfile && jriProfile.projects.analysesCount > 0 ? (
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Project Evidence</CardTitle>
            <CardDescription>
              Trends from your analyzed repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-5">
              <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Analyses</div>
                <div className="mt-1 text-2xl font-semibold">{jriProfile.projects.analysesCount}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Latest</div>
                <div className="mt-1 text-2xl font-semibold">{Math.round(jriProfile.projects.latestScore)}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Average</div>
                <div className="mt-1 text-2xl font-semibold">{Math.round(jriProfile.projects.averageScore)}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Best</div>
                <div className="mt-1 text-2xl font-semibold">{Math.round(jriProfile.projects.bestScore)}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Growth</div>
                <div className={`mt-1 text-2xl font-semibold ${jriProfile.projects.growth > 0 ? "text-emerald-400" : jriProfile.projects.growth < 0 ? "text-red-400" : ""}`}>
                  {jriProfile.projects.growth > 0 ? "+" : ""}{Math.round(jriProfile.projects.growth)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DSA TAB
// ═══════════════════════════════════════════════════════════════════════════

function DsaTab({
  jriProfile,
  jriError,
  jriSubmitting,
  leetcodeUsername,
  codeforcesHandle,
  dsaWeight,
  projectWeight,
  verifyingLeetcode,
  verifyingCodeforces,
  verifyStatus,
  showVerificationCard,
  verificationToken,
  setLeetcodeUsername,
  setCodeforcesHandle,
  setDsaWeight,
  setProjectWeight,
  setVerifyStatus,
  handleRecalculateJri,
  handleVerify,
}: {
  jriProfile: JriProfileResponse | null;
  jriError: string;
  jriSubmitting: boolean;
  leetcodeUsername: string;
  codeforcesHandle: string;
  dsaWeight: number;
  projectWeight: number;
  verifyingLeetcode: boolean;
  verifyingCodeforces: boolean;
  verifyStatus: { platform: "leetcode" | "codeforces"; success: boolean; message: string } | null;
  showVerificationCard: boolean;
  verificationToken: string;
  setLeetcodeUsername: (v: string) => void;
  setCodeforcesHandle: (v: string) => void;
  setDsaWeight: (v: number) => void;
  setProjectWeight: (v: number) => void;
  setVerifyStatus: (v: null) => void;
  handleRecalculateJri: () => void;
  handleVerify: (platform: "leetcode" | "codeforces") => void;
}) {
  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      {jriProfile ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* LeetCode Card */}
          <Card className="bg-card/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">LeetCode</CardTitle>
                  <CardDescription>
                    {jriProfile.platforms.leetcode.username ?? "Not linked"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {jriProfile.platforms.leetcode.isVerified && (
                    <Badge className="border-0 bg-emerald-500/10 text-emerald-400 text-[10px]">
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[11px]">
                    {jriProfile.platforms.leetcode.fetchStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Total Solved</div>
                  <div className="mt-1 text-2xl font-semibold">{jriProfile.platforms.leetcode.totalSolved}</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Contests</div>
                  <div className="mt-1 text-2xl font-semibold">{jriProfile.platforms.leetcode.contestsCount}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
                  <div className="text-[10px] text-emerald-400">Easy</div>
                  <div className="text-lg font-semibold text-emerald-300">{jriProfile.platforms.leetcode.easySolved}</div>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2 text-center">
                  <div className="text-[10px] text-amber-400">Medium</div>
                  <div className="text-lg font-semibold text-amber-300">{jriProfile.platforms.leetcode.mediumSolved}</div>
                </div>
                <div className="rounded-lg bg-red-500/10 p-2 text-center">
                  <div className="text-[10px] text-red-400">Hard</div>
                  <div className="text-lg font-semibold text-red-300">{jriProfile.platforms.leetcode.hardSolved}</div>
                </div>
              </div>
              {jriProfile.platforms.leetcode.fetchStatus === "FAILED" && jriProfile.platforms.leetcode.errorMessage ? (
                <div className="mt-3 text-xs text-destructive">{jriProfile.platforms.leetcode.errorMessage}</div>
              ) : null}
            </CardContent>
          </Card>

          {/* Codeforces Card */}
          <Card className="bg-card/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Codeforces</CardTitle>
                  <CardDescription>
                    {jriProfile.platforms.codeforces.username ?? "Not linked"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {jriProfile.platforms.codeforces.isVerified && (
                    <Badge className="border-0 bg-emerald-500/10 text-emerald-400 text-[10px]">
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[11px]">
                    {jriProfile.platforms.codeforces.fetchStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Solved</div>
                  <div className="mt-1 text-2xl font-semibold">{jriProfile.platforms.codeforces.totalSolved}</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Rating</div>
                  <div className="mt-1 text-2xl font-semibold">{jriProfile.platforms.codeforces.rating ?? "--"}</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Contests</div>
                  <div className="mt-1 text-2xl font-semibold">{jriProfile.platforms.codeforces.contestsCount}</div>
                </div>
              </div>
              {jriProfile.platforms.codeforces.fetchStatus === "FAILED" && jriProfile.platforms.codeforces.errorMessage ? (
                <div className="mt-3 text-xs text-destructive">{jriProfile.platforms.codeforces.errorMessage}</div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Handle Input + Weights + Recalculate */}
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gamepad2 className="size-4 text-primary" />
            Configure & Recalculate
          </CardTitle>
          <CardDescription>
            Link your profiles and set importance weights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex justify-between">
                LeetCode username
                {verifyingLeetcode ? <Loader2 className="size-3 animate-spin" /> : null}
              </label>
              <div className="flex gap-2">
                <Input
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  placeholder="username"
                  className="h-10"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 shrink-0"
                  onClick={() => handleVerify("leetcode")}
                  disabled={verifyingLeetcode}
                >
                  Verify
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex justify-between">
                Codeforces handle
                {verifyingCodeforces ? <Loader2 className="size-3 animate-spin" /> : null}
              </label>
              <div className="flex gap-2">
                <Input
                  value={codeforcesHandle}
                  onChange={(e) => setCodeforcesHandle(e.target.value)}
                  placeholder="handle"
                  className="h-10"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 shrink-0"
                  onClick={() => handleVerify("codeforces")}
                  disabled={verifyingCodeforces}
                >
                  Verify
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                DSA importance %
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={dsaWeight}
                onChange={(e) => setDsaWeight(Number(e.target.value) || 0)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Project importance %
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={projectWeight}
                onChange={(e) => setProjectWeight(Number(e.target.value) || 0)}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-10"
              onClick={handleRecalculateJri}
              disabled={jriSubmitting}
            >
              <BarChart3 className="size-4" />
              {jriSubmitting ? "Recalculating..." : "Recalculate JRI"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Current weights: DSA {dsaWeight}% • Projects {projectWeight}%
            </div>
          </div>

          {/* Verification status messages */}
          {verifyStatus && !verifyStatus.success ? (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 text-destructive-foreground">
              <XCircle className="size-4" />
              <div className="flex flex-col gap-2 w-full">
                <AlertDescription>{verifyStatus.message}</AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-fit text-xs border-destructive/20 hover:bg-destructive/10"
                  onClick={() => setVerifyStatus(null)}
                >
                  Try again
                </Button>
              </div>
            </Alert>
          ) : verifyStatus && verifyStatus.success ? (
            <Alert className="border-emerald-500/50 bg-emerald-500/5 text-emerald-200">
              <CheckCircle2 className="size-4" />
              <AlertDescription>{verifyStatus.message}</AlertDescription>
            </Alert>
          ) : showVerificationCard ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Key className="size-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Verify Ownership</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    To prevent others from linking your account, please temporarily add the token
                    <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-primary">{verificationToken}</code>
                    to your account.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-0 text-[11px] text-primary hover:bg-transparent"
                    onClick={() => navigator.clipboard.writeText(verificationToken)}
                  >
                    <Copy className="mr-1 size-3" />
                    Copy token
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {jriError ? (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 text-destructive-foreground">
              <AlertCircle className="size-4" />
              <AlertDescription>{jriError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  PROJECTS TAB
// ═══════════════════════════════════════════════════════════════════════════

function ProjectsTab({
  analyses,
  processedAnalyses,
  starterIdeas,
  jriProfile,
  githubConnected,
  profile,
}: {
  analyses: AnalysisRecord[];
  processedAnalyses: (AnalysisRecord & { delta: number | null })[];
  starterIdeas: ReturnType<typeof getStarterProjectIdeas>;
  jriProfile: JriProfileResponse | null;
  githubConnected: boolean;
  profile: AuthMeResponse["data"]["user"] | null;
}) {
  return (
    <div className="space-y-6">
      {/* Project Evidence Summary */}
      {jriProfile && jriProfile.projects.analysesCount > 0 ? (
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Project Evidence</CardTitle>
            <CardDescription>
              Summary of your analyzed repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Analyses</div>
                <div className="text-2xl font-semibold">{jriProfile.projects.analysesCount}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Latest</div>
                <div className="text-2xl font-semibold">{Math.round(jriProfile.projects.latestScore)}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Average</div>
                <div className="text-2xl font-semibold">{Math.round(jriProfile.projects.averageScore)}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Growth</div>
                <div className="text-2xl font-semibold">
                  {jriProfile.projects.growth > 0 ? `+${Math.round(jriProfile.projects.growth)}` : Math.round(jriProfile.projects.growth)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Analysis History */}
      {analyses.length === 0 ? (
        <Card className="bg-card/75">
          <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
            <div className="rounded-full border border-border/70 bg-background/60 p-5">
              <FolderGit2 className="size-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {githubConnected
                  ? "No analyses yet"
                  : "Connect GitHub, then analyze your first repo"}
              </h2>
              <p className="max-w-xl text-sm text-muted-foreground">
                {githubConnected
                  ? "Submit a public repository and SLH will take you through live processing, scoring, and concrete next actions."
                  : "We could not find any project history yet. Connect GitHub first, then bring in a public repository to generate your first report."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {githubConnected ? (
                <Link
                  href="/analyze"
                  className={cn(buttonVariants({ size: "lg" }), "h-10")}
                >
                  Analyze a repository
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="h-10"
                  onClick={() => window.location.assign(buildGitHubConnectUrl())}
                >
                  <FolderGit2 className="size-4" />
                  Connect GitHub
                </Button>
              )}
              <Button variant="outline" size="lg" className="h-10" onClick={() => window.location.reload()}>
                <RefreshCw className="size-4" />
                Refresh
              </Button>
            </div>
            <div className="grid w-full max-w-4xl gap-3 pt-4 md:grid-cols-3">
              {starterIdeas.map((idea) => (
                <div
                  key={idea.title}
                  className="rounded-2xl border border-border/70 bg-background/60 p-4 text-left"
                >
                  <div className="text-sm font-semibold text-foreground">{idea.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{idea.description}</p>
                </div>
              ))}
            </div>
            <p className="max-w-2xl text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Starter ideas are tuned to{" "}
              {profile?.student?.department ?? "your current profile"}{" "}
              so the first project already has room to show structure, testing, and deployment maturity.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity history</CardTitle>
                <CardDescription>
                  All your project analyses, newest first
                </CardDescription>
              </div>
              <Link
                href="/analyze"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9")}
              >
                New analysis
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {processedAnalyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/analysis/${analysis.id}`}
                className="group block rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:border-primary/40 hover:bg-background/70"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {extractRepoSlug(analysis.repoUrl)}
                      </span>
                      <Badge variant="outline" className="border-border/70 bg-transparent text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {formatProfileLabel(analysis.profileId)}
                      </Badge>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="min-w-16 text-right font-mono text-lg font-semibold text-foreground">
                      {analysis.overallScore ?? "--"}
                    </div>
                    <div className="min-w-18 font-mono text-sm text-muted-foreground">
                      {analysis.delta == null
                        ? "NEW"
                        : analysis.delta > 0
                          ? `↑ +${analysis.delta}`
                          : analysis.delta < 0
                            ? `↓ ${analysis.delta}`
                            : "—"}
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function platformHint(leetcode: string, codeforces: string) {
  if (leetcode && !codeforces) return "LeetCode (About Me)";
  if (codeforces && !leetcode) return "Codeforces (First Name)";
  return "LeetCode (About Me) or Codeforces (First Name)";
}

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLICITY TAB
// ═══════════════════════════════════════════════════════════════════════════

function PublicityTab({ profile }: { profile: AuthMeResponse["data"]["user"] | null }) {
  const [badgeStyle, setBadgeStyle] = useState<"flat" | "for-the-badge">("flat");
  const githubUsername = profile?.student?.githubUsername;
  
  const publicUrl = githubUsername 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${githubUsername}` 
    : "";

  const jriBadgeUrl = githubUsername 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/public/badge/${githubUsername}?style=${badgeStyle}` 
    : "";
    
  const dsaBadgeUrl = githubUsername 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/public/badge/${githubUsername}/dsa?style=${badgeStyle}` 
    : "";

  if (!githubUsername) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="rounded-full bg-amber-500/10 p-4 text-amber-500">
              <FolderGit2 className="size-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Publicity is Locked</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Connect your GitHub account to generate a public portfolio link and performance badges.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        {/* PUBLIC LINK CARD */}
        <Card className="bg-card/80 border-primary/20 shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Public Portfolio
            </CardTitle>
            <CardDescription>
              Share your verified performance with recruiters and peers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/60 p-3">
              <div className="flex-1 truncate text-sm font-mono text-muted-foreground mr-2">
                {publicUrl}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigator.clipboard.writeText(publicUrl)}
                className="h-8 shrink-0"
              >
                <Copy className="size-3" />
              </Button>
              <Link 
                href={publicUrl} 
                target="_blank" 
                rel="noreferrer"
                className={cn(buttonVariants({ size: "sm" }), "h-8 shrink-0")}
              >
                <ExternalLink className="size-3" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This link is your <strong>Proof of Competence</strong>. It includes your verified JRI score, 
              developer archetype, and top analyzed repositories.
            </p>
          </CardContent>
        </Card>

        {/* BADGE PREVIEW CARD */}
        <Card className="bg-card/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Live Badges</CardTitle>
              <div className="flex bg-muted rounded-lg p-1 gap-1">
                <button 
                  onClick={() => setBadgeStyle("flat")}
                  className={cn(
                    "text-[10px] uppercase font-bold px-2 py-1 rounded transition-all",
                    badgeStyle === "flat" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Flat
                </button>
                <button 
                  onClick={() => setBadgeStyle("for-the-badge")}
                  className={cn(
                    "text-[10px] uppercase font-bold px-2 py-1 rounded transition-all",
                    badgeStyle === "for-the-badge" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Premium
                </button>
              </div>
            </div>
            <CardDescription>Add live, verified status to your GitHub README</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-center p-4 rounded-xl border border-border/40 bg-background/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={jriBadgeUrl} alt="JRI Badge" className="h-5 drop-shadow-md" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dsaBadgeUrl} alt="DSA Badge" className="h-5 drop-shadow-md" />
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5 block">Markdown</label>
                  <div className="relative">
                    <pre className="text-[11px] font-mono bg-background p-3 rounded-lg border border-border/80 overflow-x-auto whitespace-pre-wrap">
                      {`[![SLH Profile](${jriBadgeUrl})](${publicUrl})`}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => navigator.clipboard.writeText(`[![SLH Profile](${jriBadgeUrl})](${publicUrl})`)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-muted"
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
