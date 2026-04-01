"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicProfile } from "@/lib/api";
import { extractRepoSlug } from "@/lib/analysis";
import { AttributeRadar } from "@/components/dashboard/AttributeRadar";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Code2,
  ExternalLink,
  Award,
  Trophy,
  FolderGit2,
  BarChart3,
  Copy,
  Check,

  Share2,
} from "lucide-react";

function ShareButtons({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  function profileUrl() {
    return typeof window !== "undefined"
      ? `${window.location.origin}/u/${username}`
      : `/u/${username}`;
  }

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function twitterShareUrl() {
    const text = encodeURIComponent(`Check out this verified developer profile on SkillLighthouse`);
    const url = encodeURIComponent(profileUrl());
    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  }

  function linkedinShareUrl() {
    const url = encodeURIComponent(profileUrl());
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card"
      >
        {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={twitterShareUrl()}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card"
      >
        <Share2 className="size-4" />
        Share on X
      </a>
      <a
        href={linkedinShareUrl()}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>
    </div>
  );
}

export function PublicProfileClient({ username }: { username: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicProfile(username);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Profile not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
          <BarChart3 className="size-12" />
        </div>
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The developer profile you are looking for does not exist or is private.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
          Go Home
        </Link>
      </div>
    );
  }

  const { student, card, platforms, topProjects } = profile;

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Hero Section */}
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
                  Verified Developer
                </Badge>
                {student.isPlaced && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
                    Placed
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{student.name}</h1>
                <p className="text-lg text-muted-foreground">
                  {student.department} · Batch of {student.batch}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://github.com/${student.githubUsername}`}
                  className="flex items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FolderGit2 className="size-4" />
                  github.com/{student.githubUsername}
                </a>
                {platforms.leetcode?.username && (
                  <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium">
                    <Trophy className="size-4 text-amber-500" />
                    LeetCode: {platforms.leetcode.username}
                  </div>
                )}
              </div>
              <ShareButtons username={username} />
            </div>

            {/* JRI Score Circular Card */}
            <div className="relative flex flex-col items-center rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center shadow-2xl shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground uppercase tracking-widest">
                {card.tier}
              </div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                Job Readiness Index
              </div>
              <div className="mt-2 text-7xl font-black text-primary">{Math.round(card.jriScore)}</div>
              <div className="mt-2 flex items-center gap-3 text-sm font-medium">
                <span className="text-foreground/70">DSA {Math.round(card.dsaScore)}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span className="text-foreground/70">Build {Math.round(card.projectScore)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        {/* Attributes Radar & DSA Stats */}
        <div className="grid gap-8 lg:grid-cols-2">
          <AttributeRadar attributes={card.attributes} archetype={card.archetype} />

          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="size-5 text-primary" />
                DSA Performance
              </CardTitle>
              <CardDescription>Verified problem solving stats across platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {platforms.leetcode && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">LeetCode</span>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/20">Verified</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="rounded-xl bg-background/60 p-3 text-center">
                      <div className="text-2xl font-bold">{platforms.leetcode.totalSolved}</div>
                      <div className="text-[10px] uppercase text-muted-foreground">Total</div>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-400">{platforms.leetcode.easySolved}</div>
                      <div className="text-[10px] uppercase text-emerald-500">Easy</div>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                      <div className="text-2xl font-bold text-amber-400">{platforms.leetcode.mediumSolved}</div>
                      <div className="text-[10px] uppercase text-amber-500">Med</div>
                    </div>
                    <div className="rounded-xl bg-red-500/10 p-3 text-center">
                      <div className="text-2xl font-bold text-red-400">{platforms.leetcode.hardSolved}</div>
                      <div className="text-[10px] uppercase text-red-500">Hard</div>
                    </div>
                  </div>
                </div>
              )}
              {platforms.codeforces && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Codeforces</span>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/20">Verified</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-background/60 p-3 text-center">
                      <div className="text-2xl font-bold">{platforms.codeforces.totalSolved}</div>
                      <div className="text-[10px] uppercase text-muted-foreground">Solved</div>
                    </div>
                    <div className="rounded-xl bg-blue-500/10 p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">{platforms.codeforces.rating || "N/A"}</div>
                      <div className="text-[10px] uppercase text-blue-500">Rating</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Proof of Work: TOP PROJECTS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Code2 className="size-6 text-primary" />
              Proof of Work
            </h2>
            <div className="h-px flex-1 bg-border/60 mx-6 hidden md:block" />
            <Badge variant="outline" className="px-3 py-1">Top Best Repositories</Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {topProjects.length > 0 ? (
              topProjects.map((project: any) => (
                <Card
                  key={project.id}
                  className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card/40"
                >
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full w-1.5",
                      project.score >= 80
                        ? "bg-amber-400"
                        : project.score >= 60
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {extractRepoSlug(project.repoUrl)}
                      </CardTitle>
                      <div className="text-right">
                        <div className="text-2xl font-black text-foreground/90">{project.score}</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                          Score / 100
                        </div>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {project.profile || "General"}
                      </Badge>
                      <span className="text-[11px] opacity-70">
                        Analyzed {new Date(project.analyzedAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "size-2 rounded-full",
                            project.confidence === "HIGH" ? "bg-emerald-500" : "bg-amber-500"
                          )}
                        />
                        Confidence: {project.confidence}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-full border-primary/20 text-[11px] bg-background"
                        )}
                      >
                        <ExternalLink className="mr-1.5 size-3" />
                        Source Code
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center text-muted-foreground">
                No analyzed projects on this public profile yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer Branding */}
        <footer className="mt-12 pt-12 border-t border-border/40 text-center space-y-4">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Verified by <span className="font-bold text-foreground">SkillLighthouse (SLH)</span>
          </div>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground font-mono">
            <span>Algorithm V2.4.1</span>
            <span>•</span>
            <span>Deterministic Analysis Platform</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
