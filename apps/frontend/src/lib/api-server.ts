/**
 * API Layer for Server Components.
 * 
 * This file uses server-only APIs like next/headers to 
 * automatically forward authentication state to the backend.
 */

import { cookies } from "next/headers";
import { apiRequest } from "./api-base";
import {
  AuthMeResponse,
  AnalysisListResponse,
  AnalysisRecord,
} from "@/lib/analysis";

/**
 * Common helper to injected cookie headers into an apiRequest.
 */
async function apiRequestServer<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const requestHeaders = new Headers(init.headers);
  const cookieString = cookieStore.toString();
  
  if (cookieString) {
    requestHeaders.set("Cookie", cookieString);
  }

  return apiRequest<T>(path, {
    ...init,
    headers: requestHeaders,
  });
}

/**
 * Server-side API functions.
 */

export function getMe() {
  return apiRequestServer<AuthMeResponse>("/auth/me");
}

export function getAnalyses(limit = 50) {
  return apiRequestServer<AnalysisListResponse>(`/api/projects/analyses?limit=${limit}`);
}

export function getLatestAnalysis() {
  return apiRequestServer<AnalysisRecord>("/api/projects/analyses/latest");
}

export function getAnalysisById(id: string) {
  return apiRequestServer<AnalysisRecord>(`/api/projects/analyses/${id}`);
}

export function getBatchAnalytics(batch?: string, department?: string) {
  const url = new URL("/api/admin/analytics/batch", "http://localhost:3000");
  if (batch) url.searchParams.set("batch", batch);
  if (department) url.searchParams.set("department", department);
  return apiRequestServer<any>(url.pathname + url.search);
}

export function getAdminAlerts() {
  return apiRequestServer<any>("/api/admin/analytics/alerts");
}

export function getAdminLeaderboard(params?: any) {
  const url = new URL("/api/admin/leaderboard", "http://localhost:3000");
  if (params?.batch) url.searchParams.set("batch", params.batch);
  if (params?.department) url.searchParams.set("department", params.department);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  return apiRequestServer<any>(url.pathname + url.search);
}

export function getPublicProfile(username: string) {
  return apiRequestServer<any>(`/api/public/profile/${encodeURIComponent(username)}`);
}

export function getPublicLeaderboard(college: string, params?: any) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  const url = new URL(`/api/public/leaderboard/${encodeURIComponent(college)}`, apiBaseUrl);
  if (params?.batch) url.searchParams.set("batch", params.batch);
  if (params?.department) url.searchParams.set("department", params.department);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  return apiRequestServer<any>(url.toString());
}
