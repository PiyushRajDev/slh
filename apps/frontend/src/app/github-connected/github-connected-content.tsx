"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/app/page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function GitHubConnectedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/dashboard");
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <PageShell
      eyebrow="GitHub"
      title={success ? "GitHub connected." : "GitHub connection failed."}
      description="Returning you to the dashboard so you can keep moving through the analysis flow."
    >
      <Alert
        className={
          success
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            : undefined
        }
        variant={success ? "default" : "destructive"}
      >
        {success ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <AlertCircle className="size-4" />
        )}
        <AlertDescription>
          {success
            ? "GitHub OAuth completed successfully."
            : "We could not complete the GitHub OAuth flow."}
        </AlertDescription>
      </Alert>
    </PageShell>
  );
}
