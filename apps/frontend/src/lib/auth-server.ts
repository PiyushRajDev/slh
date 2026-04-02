import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const JWT_SECRET = process.env.JWT_SECRET || "any_random_32char_string_here!!";
const CLOCK_SKEW_ALLOWED_MS = 30; // seconds for jose clockTolerance

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Returns the verified session from the accessToken cookie.
 * Returns null if the token is missing, invalid, or expired (with buffer).
 */
export async function getServerSession(): Promise<{ user: SessionUser; expiresAt: number } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_KEY)?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: `${CLOCK_SKEW_ALLOWED_MS}s`,
    });

    if (!payload.sub || !payload.role) {
      return null;
    }

    return {
      user: {
        id: payload.sub as string,
        email: (payload.email as string) || "",
        role: payload.role as string,
      },
      expiresAt: payload.exp as number,
    };
  } catch (error) {
    // jose will throw if token is expired or signature is invalid
    return null;
  }
}

/**
 * Basic presence check for middleware. Does NOT verify.
 */
export async function hasServerSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.has(ACCESS_TOKEN_KEY) || cookieStore.has(REFRESH_TOKEN_KEY);
  } catch {
    return false;
  }
}

export async function getServerAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Sanitizes a URL for safe internal redirection.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "/dashboard";
  
  // Only allow relative paths starting with /
  // Rejects absolute URLs (containing ://) to prevent open redirects
  if (url.includes("://") || !url.startsWith("/")) {
    return "/dashboard";
  }
  
  return url;
}
