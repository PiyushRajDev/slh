import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getServerSession } from "@/lib/auth-server";
import { isAdmin } from "@/lib/auth";

/**
 * AdminLayout (Server Component): 
 * Synchronously enforces admin role boundaries. 
 * Triggers server-side silent refresh if needed.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  
  // 1. Resolve current path for redirection memory
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/admin";

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

  // 3. Role boundary is enforced by middleware.
  // This layout is for admin-scoped rendering.

  // 4. Deterministic render: no loaders, no flashes
  return <>{children}</>;
}
