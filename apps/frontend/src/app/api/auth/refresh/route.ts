import { NextResponse, NextRequest } from "next/server";
import { sanitizeUrl } from "@/lib/auth-server";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = sanitizeUrl(rawCallback);
  
  // Prevent infinite loops if callbackUrl somehow points back here
  if (callbackUrl.includes("/api/auth/refresh")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) {
    // Hard logout if no refresh token
    const logoutResponse = NextResponse.redirect(new URL("/login", request.url));
    logoutResponse.cookies.delete(ACCESS_TOKEN_KEY);
    logoutResponse.cookies.delete(REFRESH_TOKEN_KEY);
    return logoutResponse;
  }

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
    
    // Server-to-server call to rotate the token
    const apiRes = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!apiRes.ok) {
      throw new Error("Failed to rotate token at backend");
    }

    const payload = await apiRes.json();
    const tokens = payload?.data?.tokens;

    if (!tokens?.accessToken) {
      throw new Error("No access token returned from refresh");
    }

    const response = NextResponse.redirect(new URL(callbackUrl, request.url));
    
    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, cookieOptions);

    if (tokens.refreshToken) {
      response.cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, cookieOptions);
    }

    return response;
  } catch (error) {
    console.error("[AuthRefresh] Failed to refresh session:", error);
    
    // Clear cookies on failure to prevent repeated loops
    const errorResponse = NextResponse.redirect(new URL("/login", request.url));
    errorResponse.cookies.delete(ACCESS_TOKEN_KEY);
    errorResponse.cookies.delete(REFRESH_TOKEN_KEY);
    return errorResponse;
  }
}
