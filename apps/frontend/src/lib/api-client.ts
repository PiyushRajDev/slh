/**
 * API Layer for Client Components.
 * 
 * This file is intended ONLY for execution in the browser 
 * (Client Components, Hooks). It does not import server-only 
 * Next.js modules like next/headers.
 */

import { apiRequest } from "./api-base";
import {
  AuthMeResponse,
  AnalysisListResponse,
  AnalysisRecord,
  AnalysisProgressEvent,
  AnalysisFailureCode,
} from "@/lib/analysis";
import { JriProfileResponse } from "@/lib/jri";
import {
  MarketFitAnalyzeResponse,
  MarketFitReportResponse,
  MarketFitRequest,
  MarketFitStatusResponse,
} from "@/lib/market-fit";
import { clearSessionTokens } from "@/lib/auth";

export { ApiError } from "./api-base";

/**
 * Standard logout utility for the client layer. 
 */
export async function logout(): Promise<void> {
  try {
    await fetch("/auth/logout", {
      method: "POST",
      cache: "no-store",
      credentials: "include",
    });
  } catch {
    // Ignore backend logout errors
  }
  clearSessionTokens();
}

/**
 * Common API functions for the SkillLighthouse platform.
 */

export function getMe(init?: RequestInit) {
  return apiRequest<AuthMeResponse>("/auth/me", init);
}

export function login(email: string, password: string) {
  return apiRequest<{
    success: boolean;
    data: {
      tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
    };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload: any) {
  return apiRequest<{
    success: boolean;
    data: {
      user: { id: string; email: string; role: string };
      tokens: { accessToken: string; refreshToken: string; expiresIn: number };
    };
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitAnalysis(repoUrl: string) {
  return apiRequest<{ message: string; jobId: string; repoUrl: string }>(
    "/api/projects/analyze",
    {
      method: "POST",
      body: JSON.stringify({ repoUrl }),
    }
  );
}

export function getAnalyses(limit = 50) {
  return apiRequest<AnalysisListResponse>(`/api/projects/analyses?limit=${limit}`);
}

export function getLatestAnalysis() {
  return apiRequest<AnalysisRecord>("/api/projects/analyses/latest");
}

export function getAnalysisById(id: string, init?: RequestInit) {
  return apiRequest<AnalysisRecord>(`/api/projects/analyses/${id}`, init);
}

export function submitMarketFitAnalysis(payload: MarketFitRequest) {
  return apiRequest<MarketFitAnalyzeResponse>("/market-fit/analyze", {
    method: "POST",
    body: JSON.stringify({
      role: payload.role,
      seniority: payload.seniority,
    }),
  });
}

export function getMarketFitStatus(jobId: string) {
  return apiRequest<MarketFitStatusResponse>(`/market-fit/status/${encodeURIComponent(jobId)}`);
}

export function getMarketFitReport(userId = "me") {
  return apiRequest<MarketFitReportResponse>(`/market-fit/report/${encodeURIComponent(userId)}`);
}

export function getJriProfile() {
  return apiRequest<JriProfileResponse>("/api/jri/profile");
}

export function recalculateJri(payload: any) {
  return apiRequest<JriProfileResponse>("/api/jri/recalculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyPlatformAccount(platform: "leetcode" | "codeforces", username: string, token: string) {
    return apiRequest<{ verified: boolean }>(`/api/jri/verify/${platform}/${encodeURIComponent(username)}?token=${token}`);
}

export function getOnboardingStatus() {
  return apiRequest<any>("/api/students/me/onboarding-status");
}

export function onboardCollege(payload: any) {
  return apiRequest<any>("/api/onboard/college", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function bulkImportStudents(collegeId: string, students: any[]) {
  return apiRequest<any>(`/api/onboard/colleges/${collegeId}/bulk-import`, {
    method: "POST",
    body: JSON.stringify({ students }),
  });
}

export function getAdminLeaderboard(params?: any) {
  const query = new URLSearchParams();
  if (params?.batch) query.set("batch", params.batch);
  if (params?.department) query.set("department", params.department);
  if (params?.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  return apiRequest<any>(`/api/admin/leaderboard${queryString ? `?${queryString}` : ""}`);
}

export function getBatchAnalytics(batch?: string, department?: string) {
  const query = new URLSearchParams();
  if (batch) query.set("batch", batch);
  if (department) query.set("department", department);

  const queryString = query.toString();
  return apiRequest<any>(`/api/admin/analytics/batch${queryString ? `?${queryString}` : ""}`);
}

export function getAdminAlerts() {
  return apiRequest<any>("/api/admin/analytics/alerts");
}

export function getAdminExportUrl(batch?: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  const url = new URL("/api/admin/analytics/export", apiBaseUrl);
  if (batch) url.searchParams.set("batch", batch);
  return url.toString();
}

/**
 * Event-driven analysis streaming for Client components.
 */
export function openAnalysisStream(
  jobId: string,
  handlers: {
    onProgress: (event: AnalysisProgressEvent) => void;
    onComplete: (payload: any) => void;
    onFailed: (payload: any) => void;
    onTimeout: (payload: any) => void;
    onTransportError?: (payload: any) => void;
  }
) {
  let source: EventSource | null = null;
  let closed = false;

  const closeSource = () => {
    if (closed) return;
    closed = true;
    if (source) source.close();
  };

  const initStream = async () => {
    if (closed) return;
    try {
      const response = await apiRequest<{ success: boolean; data: { streamToken: string } }>("/auth/stream-token", {
        method: "POST"
      });
      if (closed) return;

      const token = response.data.streamToken;
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
      const url = new URL(`/api/projects/analyses/${jobId}/events`, apiBaseUrl);
      url.searchParams.set("token", token);

      source = new EventSource(url.toString(), { withCredentials: true });

      source.addEventListener("progress", (event) => {
        try {
          handlers.onProgress(JSON.parse((event as MessageEvent).data) as AnalysisProgressEvent);
        } catch {
          handlers.onTransportError?.({ code: "STREAM_DISCONNECTED", error: "Stream disconnected unexpectedly." });
          closeSource();
        }
      });

      source.addEventListener("complete", (event) => {
        try {
          handlers.onComplete(JSON.parse((event as MessageEvent).data));
        } catch {
          handlers.onComplete({ success: true });
        } finally {
          closeSource();
        }
      });

      source.addEventListener("failed", (event) => {
        try {
          handlers.onFailed(JSON.parse((event as MessageEvent).data));
        } catch {
          handlers.onFailed({ error: "Analysis failed" });
        } finally {
          closeSource();
        }
      });

      source.addEventListener("timeout", (event) => {
        try {
          handlers.onTimeout(JSON.parse((event as MessageEvent).data));
        } catch {
          handlers.onTimeout({ error: "Stream timed out" });
        } finally {
          closeSource();
        }
      });

      source.onerror = () => {
        if (closed) return;
        handlers.onTransportError?.({ code: "STREAM_DISCONNECTED", error: "Stream connection error." });
        closeSource();
      };
    } catch (err) {
      if (closed) return;
      handlers.onTransportError?.({ code: "AUTH_FAILED", error: "Failed to authenticate stream" });
      closeSource();
    }
  };

  initStream();
  return closeSource;
}

export function buildGitHubConnectUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  return new URL("/auth/github", apiBaseUrl).toString();
}

export function getPublicProfile(username: string) {
  return apiRequest<any>(`/api/public/profile/${encodeURIComponent(username)}`);
}

export function getPublicLeaderboard(college: string, params?: any) {
  const query = new URLSearchParams();
  if (params?.batch) query.set("batch", params.batch);
  if (params?.department) query.set("department", params.department);
  if (params?.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  return apiRequest<any>(`/api/public/leaderboard/${encodeURIComponent(college)}${queryString ? `?${queryString}` : ""}`);
}
