import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getServerSession } from "@/lib/auth-server";
import { isSuperAdmin } from "@/lib/auth";

/**
 * SuperAdminLayout (Server Component): 
 * Synchronously enforces super-admin role boundaries. 
 * Triggers server-side silent refresh if needed.
 */
export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  
  // 1. Resolve current path for redirection memory
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/superadmin";

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

  // 3. Enforce the strictest role boundary
  if (!isSuperAdmin(session.user.role)) {
    // Super-admins can access everything, but others cannot access here.
    redirect("/unauthorized");
  }

  // 4. Deterministic render: no loaders, no flashes
  return <>{children}</>;
}
