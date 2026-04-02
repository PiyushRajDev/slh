import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="h-10 w-10" />
      </div>
      
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Access Denied</h1>
      <p className="mb-8 max-w-sm text-balance text-muted-foreground">
        Your account doesn&apos;t have the required permissions to access this area of SkillLighthouse.
      </p>

      <div className="flex flex-col gap-3 min-w-[200px]">
        <Link 
          href="/" 
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "justify-center")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <Link 
          href="/login" 
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "justify-center")}
        >
          Switch Account
        </Link>
      </div>
    </div>
  );
}
