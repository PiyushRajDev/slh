"use client";

import { FormEvent, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/app/page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api";
import { hasSessionToken, setSessionTokens } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ArrowRight, FolderGit2, LockKeyhole, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasSessionToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await login(email, password);
      setSessionTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      startTransition(() => router.push("/dashboard"));
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow="Access"
      title="Log in, then connect GitHub."
      description="SLH uses your platform account for auth, then connects GitHub for repository analysis. The result is one tight flow instead of a disconnected dashboard."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="bg-card/75">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your existing SLH credentials to unlock the analysis flow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Email
                </label>
                <Input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@college.edu"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  className="h-10"
                  required
                />
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" size="lg" disabled={submitting} className="h-10 w-full">
                {submitting ? "Signing in..." : "Continue to dashboard"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/55">
          <CardHeader>
            <CardTitle>What happens next</CardTitle>
            <CardDescription>
              The product loop stays simple so students understand exactly what to do.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
              <LockKeyhole className="mt-0.5 size-4 text-primary" />
              <div className="space-y-1">
                <div className="font-medium">1. Authenticate once</div>
                <p className="text-sm text-muted-foreground">
                  We store your SLH token locally so the app can call the API without extra prompts.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
              <FolderGit2 className="mt-0.5 size-4 text-primary" />
              <div className="space-y-1">
                <div className="font-medium">2. Connect GitHub from the dashboard</div>
                <p className="text-sm text-muted-foreground">
                  GitHub OAuth is the next step after login because the API requires an authenticated user to link the account.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
              <ShieldCheck className="mt-0.5 size-4 text-primary" />
              <div className="space-y-1">
                <div className="font-medium">3. Submit a public repository</div>
                <p className="text-sm text-muted-foreground">
                  You will immediately land in the live processing state and then the finished report.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 w-full justify-center"
              )}
            >
              I already have a session
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-10 w-full justify-center"
              )}
            >
              Create an account
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
