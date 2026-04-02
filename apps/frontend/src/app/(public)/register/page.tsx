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
import { register } from "@/lib/api-client";
import { setSessionTokens } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ArrowRight, UserPlus } from "lucide-react";
import { useAuth } from "@/components/app/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [semester, setSemester] = useState("1");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await register({
        firstName,
        lastName,
        email,
        password,
        rollNumber,
        department,
        batch,
        semester: Number(semester) || 1,
      });

      await refresh();
      startTransition(() => router.push("/dashboard"));
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow="Access"
      title="Create your SLH account."
      description="Register once, then connect GitHub from the dashboard to start analyzing public repositories."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card className="bg-card/75">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Make a local SLH account before linking your GitHub profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  First name
                </label>
                <Input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Aarav"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Last name
                </label>
                <Input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Sharma"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@college.edu"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
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
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Roll number
                </label>
                <Input
                  value={rollNumber}
                  onChange={(event) => setRollNumber(event.target.value)}
                  placeholder="23CS001"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Batch
                </label>
                <Input
                  value={batch}
                  onChange={(event) => setBatch(event.target.value)}
                  placeholder="2026"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Department
                </label>
                <Input
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="Computer Science"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Semester
                </label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={semester}
                  onChange={(event) => setSemester(event.target.value)}
                  className="h-10"
                  required
                />
              </div>

              {error ? (
                <Alert variant="destructive" className="md:col-span-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-col gap-3 md:col-span-2 md:flex-row">
                <Button type="submit" size="lg" disabled={submitting} className="h-10 flex-1">
                  {submitting ? "Creating account..." : "Create account"}
                  <ArrowRight className="size-4" />
                </Button>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-10 flex-1"
                  )}
                >
                  Back to login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/55">
          <CardHeader>
            <CardTitle>Why this is separate</CardTitle>
            <CardDescription>
              The app expects a local SLH account first, then GitHub OAuth.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
              <UserPlus className="mt-0.5 size-4 text-primary" />
              <div className="space-y-1">
                <div className="font-medium">1. Create your SLH profile</div>
                <p className="text-sm text-muted-foreground">
                  This gives the platform a student record to attach analyses and GitHub access to.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
              <ArrowRight className="mt-0.5 size-4 text-primary" />
              <div className="space-y-1">
                <div className="font-medium">2. Land on the dashboard</div>
                <p className="text-sm text-muted-foreground">
                  After registration, you will be signed in automatically and can connect GitHub immediately.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-10 w-full justify-center"
              )}
            >
              I already have an account
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
