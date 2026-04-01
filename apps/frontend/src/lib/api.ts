import {
  AnalysisFailureCode,
  AnalysisListResponse,
  AnalysisProgressEvent,
  AnalysisRecord,
  AuthMeResponse,
} from "@/lib/analysis";
import { JriProfileResponse } from "@/lib/jri";
import { clearSessionTokens, getAccessToken } from "@/lib/auth";

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

async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function buildError(response: Response): Promise<Error> {
  const payload = await parseJsonSafely(response);
  const message =
    payload?.error ??
    payload?.message ??
    `Request failed with status ${response.status}`;
  return new ApiError(message, response.status, payload?.code);
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearSessionTokens();
    }

    throw await buildError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function buildGitHubConnectUrl(): string {
  const url = new URL("/auth/github", window.location.origin);
  const token = getAccessToken();

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}

export function openAnalysisStream(
  jobId: string,
  handlers: {
    onProgress: (event: AnalysisProgressEvent) => void;
    onComplete: (payload: {
      success?: boolean;
      alreadyComplete?: boolean;
      analysisId?: string;
      status?: string;
    }) => void;
    onFailed: (payload: { error?: string; code?: AnalysisFailureCode | string }) => void;
    onTimeout: (payload: { error?: string; code?: AnalysisFailureCode | string }) => void;
    onTransportError?: (payload: { error?: string; code?: AnalysisFailureCode | string }) => void;
  }
) {
  const url = new URL(`/api/projects/analyses/${jobId}/events`, window.location.origin);
  const token = getAccessToken();
  let closed = false;

  if (token) {
    url.searchParams.set("token", token);
  }

  const source = new EventSource(url.toString());

  function closeSource() {
    if (closed) {
      return;
    }

    closed = true;
    source.close();
  }

  source.addEventListener("progress", (event) => {
    try {
      handlers.onProgress(JSON.parse((event as MessageEvent).data) as AnalysisProgressEvent);
    } catch {
      handlers.onTransportError?.({
        code: "STREAM_DISCONNECTED",
        error: "The live analysis stream disconnected.",
      });
      closeSource();
    }
  });

  source.addEventListener("complete", (event) => {
    try {
      handlers.onComplete(
        JSON.parse((event as MessageEvent).data) as {
          success?: boolean;
          alreadyComplete?: boolean;
          analysisId?: string;
          status?: string;
        }
      );
    } catch {
      handlers.onComplete({ success: true });
    } finally {
      closeSource();
    }
  });

  source.addEventListener("failed", (event) => {
    try {
      handlers.onFailed(
        JSON.parse((event as MessageEvent).data) as {
          error?: string;
          code?: AnalysisFailureCode | string;
        }
      );
    } catch {
      handlers.onFailed({ error: "Analysis failed" });
    } finally {
      closeSource();
    }
  });

  source.addEventListener("timeout", (event) => {
    try {
      handlers.onTimeout(
        JSON.parse((event as MessageEvent).data) as {
          error?: string;
          code?: AnalysisFailureCode | string;
        }
      );
    } catch {
      handlers.onTimeout({ error: "Analysis stream timed out" });
    } finally {
      closeSource();
    }
  });

  source.onerror = () => {
    if (closed) {
      return;
    }

    handlers.onTransportError?.({
      code: "STREAM_DISCONNECTED",
      error: "The live analysis stream disconnected.",
    });
    closeSource();
  };

  return closeSource;
}

export function getMe() {
  return apiRequest<AuthMeResponse>("/auth/me");
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

export function register(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  department: string;
  semester: number;
  batch: string;
  collegeId?: string;
}) {
  return apiRequest<{
    success: boolean;
    data: {
      user: {
        id: string;
        email: string;
        role: string;
      };
      tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
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

export function getAnalysisById(id: string) {
  return apiRequest<AnalysisRecord>(`/api/projects/analyses/${id}`);
}

export function getJriProfile() {
  return apiRequest<JriProfileResponse>("/api/jri/profile");
}

export function recalculateJri(payload: {
  leetcodeUsername?: string;
  codeforcesHandle?: string;
  weights?: {
    dsa?: number;
    projects?: number;
  };
}) {
  return apiRequest<JriProfileResponse>("/api/jri/recalculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyPlatformAccount(platform: "leetcode" | "codeforces", username: string, token: string) {
  const url = new URL(`/api/jri/verify/${platform}/${encodeURIComponent(username)}`, window.location.origin);
  url.searchParams.set("token", token);
  return apiRequest<{ verified: boolean }>(url.toString());
}

// --- Public APIs ---

export function getPublicProfile(username: string) {
  return apiRequest<any>(`/api/public/profile/${encodeURIComponent(username)}`);
}

export function getPublicLeaderboard(college: string, params?: { batch?: string; department?: string; limit?: number }) {
  const url = new URL(`/api/public/leaderboard/${encodeURIComponent(college)}`, window.location.origin);
  if (params?.batch) url.searchParams.set("batch", params.batch);
  if (params?.department) url.searchParams.set("department", params.department);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  return apiRequest<{
    college: { name: string; shortName: string };
    total: number;
    leaderboard: Array<{
      rank: number;
      name: string;
      department: string;
      batch: string;
      githubUsername: string | null;
      isPlaced: boolean;
      jriScore: number;
      tier: string;
    }>;
  }>(url.toString());
}

// --- Onboarding APIs ---

export function getOnboardingStatus() {
  return apiRequest<{
    studentId: string;
    firstName: string;
    percentComplete: number;
    isFullyOnboarded: boolean;
    steps: Array<{
      key: string;
      label: string;
      complete: boolean;
      connectedAt?: string | null;
      platforms?: string[];
      jriScore?: number | null;
      calculatedAt?: string | null;
      projectScore?: number | null;
      analyzedAt?: string | null;
    }>;
  }>("/api/students/me/onboarding-status");
}

export function onboardCollege(payload: {
  name: string;
  shortName: string;
  domain?: string;
  location?: string;
  website?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}) {
  return apiRequest<{
    college: {
      id: string;
      name: string;
      shortName: string;
      domain: string | null;
      location: string | null;
      website: string | null;
      createdAt: string;
    };
    adminEmail: string;
  }>("/api/onboard/college", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function bulkImportStudents(
  collegeId: string,
  students: Array<{
    firstName: string;
    lastName: string;
    rollNumber: string;
    email: string;
    department: string;
    semester: number;
    batch: string;
    section?: string;
  }>
) {
  return apiRequest<{
    collegeId: string;
    created: number;
    skipped: number;
    errors: Array<{ row: number; email: string; reason: string }>;
    total: number;
  }>(`/api/onboard/colleges/${collegeId}/bulk-import`, {
    method: "POST",
    body: JSON.stringify({ students }),
  });
}

// --- Admin APIs ---

export function getAdminLeaderboard(params?: { batch?: string; department?: string; limit?: number }) {
  const url = new URL("/api/admin/leaderboard", window.location.origin);
  if (params?.batch) url.searchParams.set("batch", params.batch);
  if (params?.department) url.searchParams.set("department", params.department);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  return apiRequest<{
    total: number;
    leaderboard: Array<{
      rank: number;
      studentId: string;
      name: string;
      rollNumber: string;
      department: string;
      batch: string;
      githubUsername: string | null;
      isPlaced: boolean;
      companyName: string | null;
      jriScore: number;
      dsaScore: number;
      githubScore: number;
      bestProjectScore: number | null;
      tier: string;
      lastUpdated: string | null;
    }>;
  }>(url.toString());
}

export function getBatchAnalytics(batch?: string, department?: string) {
  const url = new URL("/api/admin/analytics/batch", window.location.origin);
  if (batch) url.searchParams.set("batch", batch);
  if (department) url.searchParams.set("department", department);
  return apiRequest<any>(url.toString());
}

export function getAdminAlerts() {
  return apiRequest<any>("/api/admin/analytics/alerts");
}

export function getAdminExportUrl(batch?: string) {
  const url = new URL("/api/admin/analytics/export", window.location.origin);
  if (batch) url.searchParams.set("batch", batch);
  const token = getAccessToken();
  if (token) url.searchParams.set("token", token);
  return url.toString();
}
