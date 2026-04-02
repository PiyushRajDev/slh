import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getServerSession } from "@/lib/auth-server";
import { isAdmin, isSuperAdmin } from "@/lib/auth";

/**
 * StudentLayout (Server Component): 
 * Manages the primary student-facing dashboard boundary. 
 * Cross-pollination protection: Admins hitting student routes are sent to their respective areas.
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  
  // 1. Resolve current path for redirection memory
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/dashboard";

  // 2. Handle expired sessions that can be refreshed
  if (!session) {
    const cookieStore = await cookies();
    if (cookieStore.has("refreshToken")) {
      // Access token is missing or expired, but we have a refresh token.
      // Move to the refresh handler to rotate and come back.
      redirect(`/api/auth/refresh?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    // No session and no refresh possible
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  // 3. Role-based steering is now handled by middleware.
  // This layout is for student-scoped rendering.

  // 4. Deterministic render: no loaders, no flashes
  return <>{children}</>;
}
