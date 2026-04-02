"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/app/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: "ADMIN" | "SUPER_ADMIN";
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole) {
      const authorized =
        requiredRole === "ADMIN"
          ? user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          : user.role === "SUPER_ADMIN";

      if (!authorized) {
        router.replace("/dashboard?denied=1");
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (requiredRole) {
    const authorized =
      requiredRole === "ADMIN"
        ? user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        : user.role === "SUPER_ADMIN";
    if (!authorized) return null;
  }

  return <>{children}</>;
}
