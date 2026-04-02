import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/analyze", "/analysis", "/onboard"];
const AUTH_PAGES = ["/login", "/register"];
const JWT_SECRET = process.env.JWT_SECRET || "any_random_32char_string_here!!";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Bypass loops for the refresh handler and static assets
  if (
    pathname.startsWith("/api/auth/refresh") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.some((page) => pathname === page);
  const accessTokenCookie = request.cookies.get("accessToken");
  const hasAccessToken = !!accessTokenCookie;

  // 2. Redirect to login if missing session on protected route
  if (isProtectedRoute && !hasAccessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Decode token for role-aware steering if it exists
  let userRole: string | null = null;
  if (hasAccessToken) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(accessTokenCookie.value, secret);
      userRole = payload.role as string;
    } catch {
      // Invalidate on the server if needed, or let the component handles it
    }
  }

  // 4. Role-based steering for root path
  if (pathname === "/") {
    if (userRole === "SUPER_ADMIN") return NextResponse.redirect(new URL("/onboard", request.url));
    if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    if (userRole) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. Auth page logic (don't allow logged-in users on /login)
  if (isAuthPage && userRole) {
    const target = userRole === "SUPER_ADMIN" ? "/onboard" : (userRole === "ADMIN" ? "/admin" : "/dashboard");
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 6. Prevent cross-role access (e.g. admins in /dashboard or non-admins in /admin)
  if (userRole) {
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    
    // Admins attempting student routes
    if (pathname.startsWith("/dashboard") && userRole !== "STUDENT") {
      const target = userRole === "SUPER_ADMIN" ? "/onboard" : "/admin";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Non-admins attempting admin routes
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Students trying to access superadmin onboarding, but allowed in /onboard/student
    if (pathname.startsWith("/onboard") && pathname !== "/onboard/student" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/analyze/:path*",
    "/analysis/:path*",
    "/onboard/:path*",
    "/login",
    "/register",
    "/",
  ],
};
