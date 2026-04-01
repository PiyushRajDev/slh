import { Suspense } from "react";
import { PageShell } from "@/components/app/page-shell";
import { GitHubConnectedContent } from "@/app/github-connected/github-connected-content";

export default function GitHubConnectedPage() {
  return (
    <Suspense
      fallback={
        <PageShell
          eyebrow="GitHub"
          title="Finishing GitHub connection"
          description="Completing the OAuth handoff and returning to your dashboard."
        >
          <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-4 text-sm text-muted-foreground">
            Finalizing GitHub connection...
          </div>
        </PageShell>
      }
    >
      <GitHubConnectedContent />
    </Suspense>
  );
}
