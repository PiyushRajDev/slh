"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/auth";
import { useAuth } from "@/components/app/auth-context";
import { logout as logoutApi } from "@/lib/api-client";

interface PageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  actions,
  className,
}: PageShellProps) {
  const { user, logout: localLogout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only compute these after mount to prevent hydration mismatch
  const role = mounted ? user?.role : undefined;
  const isUserAdmin = mounted ? isAdmin(role) : false;
  const isSuperAdmin = mounted ? role === "SUPER_ADMIN" : false;

  const showAdminLinks = isUserAdmin;
  const showStudentLinks = role === "STUDENT";
  const showSuperAdminLinks = isSuperAdmin;
  const isLoginPage = pathname === "/login";
  const showLoginLink = !user && !isLoginPage;

  const handleSignOut = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localLogout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-card/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={mounted && isUserAdmin ? "/admin" : "/dashboard"}
              className="rounded-lg border border-border/70 bg-background px-3 py-2 text-sm font-semibold tracking-[0.18em] text-foreground uppercase transition-colors hover:border-primary/40 hover:text-primary"
            >
              SLH
            </Link>
            <nav className="hidden items-center gap-2 md:flex">

              {showAdminLinks && (
                <Link href="/admin/onboard" className={buttonVariants({ variant: "ghost" })}>
                  Onboard
                </Link>
              )}

              {/* Student links */}
              {showStudentLinks && (
                <>
                  <Link href="/dashboard/market-fit" className={buttonVariants({ variant: "ghost" })}>
                    Market Fit
                  </Link>
                  <Link href="/analyze" className={buttonVariants({ variant: "ghost" })}>
                    Analyze
                  </Link>
                </>
              )}

              {/* Admin links */}
              {showAdminLinks && (
                <>
                  <Link href="/admin/analytics" className={buttonVariants({ variant: "ghost" })}>
                    Analytics
                  </Link>
                  <Link href="/admin/leaderboard" className={buttonVariants({ variant: "ghost" })}>
                    Leaderboard
                  </Link>
                  <Link href="/admin/alerts" className={buttonVariants({ variant: "ghost" })}>
                    Alerts
                  </Link>
                </>
              )}

              {/* Super Admin links */}
              {showSuperAdminLinks && (
                <>
                  <Link href="/onboard/college" className={cn(buttonVariants({ variant: "ghost" }), "text-primary hover:text-primary")}>
                    Onboard
                  </Link>
                </>
              )}

              {showLoginLink && (
                <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                  Login
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {mounted && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
            )}
            <ThemeToggle />
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="rounded-md border border-border/70 px-2 py-1 font-mono">
                Cmd/Ctrl + K
              </span>
              <span>Command menu</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="flex flex-col gap-5 border-b border-border/60 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
              {eyebrow}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                {description}
              </p>
            </div>
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </section>

        <section className={cn("space-y-6", className)}>{children}</section>
      </main>
    </div>
  );
}
