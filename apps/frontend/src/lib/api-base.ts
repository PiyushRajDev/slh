import {
  AnalysisFailureCode,
} from "@/lib/analysis";

/**
 * Standard API error class for the SkillLighthouse platform.
 */
export class ApiError extends Error {
  readonly code?: AnalysisFailureCode | string;
  readonly status: number;

  constructor(message: string, status: number, code?: AnalysisFailureCode | string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Helper to parse JSON from a response safely, avoiding common syntax errors.
 */
export async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Common error building logic for API responses.
 */
export async function buildError(response: Response): Promise<Error> {
  const payload = await parseJsonSafely(response);
  const message =
    payload?.error ??
    payload?.message ??
    `Request failed with status ${response.status}`;
  return new ApiError(message, response.status, payload?.code);
}

/**
 * Core apiRequest implementation.
 * 
 * IMPORTANT: This function does NOT access any server-side environment 
 * (like next/headers). It relies on the caller to provide authentication 
 * headers (cookies) when running on the server.
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const requestHeaders = new Headers(init.headers);

  if (init.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  // Resolve final backend URL
  // When running in the browser, favor relative URLs to take advantage of Next.js rewrites 
  // and eliminate cross-origin or third-party cookie restrictions.
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  const isClient = typeof window !== "undefined";
  
  let url = path;
  if (!path.startsWith("http")) {
    url = isClient ? path : `${apiBaseUrl}${path}`;
  }

  // Execute fetch
  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
    credentials: "include", // Essential for same-origin browser cookie handling
  });

  // Handle errors
  if (!response.ok) {
    // Note: Global UI sync (like logout) is handled by the calling layer 
    // or by checking the error in a client hook.
    throw await buildError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
