"use client";

import { FormEvent, startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/app/page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { onboardCollege } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, UserCog } from "lucide-react";

type Step = 1 | 2 | 3;

const STEPS = [
  { id: 1 as Step, label: "College info", icon: Building2 },
  { id: 2 as Step, label: "Admin setup", icon: UserCog },
  { id: 3 as Step, label: "Confirmation", icon: CheckCircle2 },
];

interface CollegeResult {
  college: {
    id: string;
    name: string;
    shortName: string;
    domain: string | null;
    location: string | null;
    website: string | null;
    createdAt: string;
  };
  adminEmail: string;
}

export default function CollegeOnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CollegeResult | null>(null);

  // Step 1: College info
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [domain, setDomain] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  // Step 2: Admin setup
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  function handleStep1(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStep(2);
  }

  async function handleStep2(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await onboardCollege({
        name,
        shortName,
        domain: domain || undefined,
        location: location || undefined,
        website: website || undefined,
        adminEmail,
        adminPassword,
        adminFirstName,
        adminLastName,
      });
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to onboard college");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow="Onboarding"
      title="Add a new college."
      description="Register a college and create its first admin account. This action requires super-admin access."
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  isActive && "border-primary/40 bg-primary/8 text-primary",
                  isDone && "border-border/50 text-muted-foreground",
                  !isActive && !isDone && "border-border/30 text-muted-foreground/50"
                )}
              >
                <Icon className="size-3.5" />
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight className="size-3.5 text-muted-foreground/40" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: College info */}
      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
          <Card className="bg-card/75">
            <CardHeader>
              <CardTitle>College information</CardTitle>
              <CardDescription>
                Basic details about the institution being registered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleStep1}>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    College name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rajasthan Technical University"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Short name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value.toUpperCase())}
                    placeholder="RTU"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Email domain
                  </label>
                  <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="rtu.ac.in"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kota, Rajasthan"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Website
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://rtu.ac.in"
                    className="h-10"
                    type="url"
                  />
                </div>
                <div className="flex md:col-span-2">
                  <Button type="submit" size="lg" className="h-10 flex-1">
                    Next: Admin setup
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card/55">
            <CardHeader>
              <CardTitle>What happens next</CardTitle>
              <CardDescription>
                Two steps to get a college live on SLH.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "College record created",
                  body: "A new college entry is added to the platform with the details you provide.",
                },
                {
                  title: "First admin provisioned",
                  body: "An ADMIN account is created and linked to the college. A welcome email with login instructions is sent.",
                },
                {
                  title: "Students can be bulk-imported",
                  body: "Once the admin logs in, they can import students via CSV or the bulk-import API.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-4"
                >
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <p className="text-xs text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Admin setup */}
      {step === 2 && (
        <Card className="max-w-2xl bg-card/75">
          <CardHeader>
            <CardTitle>Admin account</CardTitle>
            <CardDescription>
              This person will manage <span className="font-medium text-foreground">{name}</span> on
              SLH. They can import students and view analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleStep2}>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  First name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                  placeholder="Aditya"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Last name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                  placeholder="Verma"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Admin email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@rtu.ac.in"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Admin password <span className="text-destructive">*</span>
                </label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="h-10"
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive" className="md:col-span-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3 md:col-span-2 md:flex-row">
                <Button type="submit" size="lg" disabled={submitting} className="h-10 flex-1">
                  {submitting ? "Creating college..." : "Create college"}
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-10 flex-1"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && result && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
          <Card className="bg-card/75">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <CheckCircle2 className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle>College registered</CardTitle>
                  <CardDescription>
                    {result.college.name} is now live on SLH.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-3">
                {[
                  { label: "College name", value: result.college.name },
                  { label: "Short name", value: result.college.shortName },
                  { label: "College ID", value: result.college.id, mono: true },
                  { label: "Admin email", value: result.adminEmail },
                  ...(result.college.location
                    ? [{ label: "Location", value: result.college.location }]
                    : []),
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={cn("text-right font-medium", mono && "font-mono text-xs")}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-10 flex-1"
                  onClick={() => {
                    setStep(1);
                    setName(""); setShortName(""); setDomain(""); setLocation(""); setWebsite("");
                    setAdminFirstName(""); setAdminLastName(""); setAdminEmail(""); setAdminPassword("");
                    setResult(null);
                  }}
                >
                  Onboard another college
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 flex-1"
                  onClick={() => startTransition(() => router.push("/dashboard"))}
                >
                  Back to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/55">
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>
                What the admin should do after logging in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Admin logs in at /login using the email and password you set.",
                "They can bulk-import students via the admin dashboard or API.",
                "Each student gets a temporary password: SLH@{rollNumber}.",
                "Students complete onboarding by connecting GitHub and DSA profiles.",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-3"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
