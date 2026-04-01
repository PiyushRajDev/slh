"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasSessionToken } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasSessionToken() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-4 text-sm text-muted-foreground">
        Loading SLH...
      </div>
    </div>
  );
}
