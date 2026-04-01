const ACCESS_TOKEN_KEY = "slh_token";
const REFRESH_TOKEN_KEY = "slh_refresh_token";
const EXPIRY_SKEW_MS = 15_000;

type JwtPayload = {
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const encodedPayload = token.split(".")[1];
  if (!encodedPayload) {
    return null;
  }

  const decodeBase64 =
    typeof globalThis.atob === "function" ? globalThis.atob.bind(globalThis) : null;
  if (!decodeBase64) {
    return null;
  }

  const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : `${normalized}${"=".repeat(4 - padding)}`;

  try {
    const decoded = decodeBase64(padded);
    const payload = JSON.parse(decoded) as unknown;
    if (!payload || typeof payload !== "object") {
      return null;
    }

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

function isAccessTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
    return true;
  }

  const expiresAtMs = payload.exp * 1000;
  return Date.now() >= expiresAtMs - EXPIRY_SKEW_MS;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    return null;
  }

  if (isAccessTokenExpired(token)) {
    clearSessionTokens();
    return null;
  }

  return token;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setSessionTokens(accessToken: string, refreshToken?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearSessionTokens() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasSessionToken(): boolean {
  return getAccessToken() !== null;
}

export function getUserRoleFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token) as any;
  return payload?.role || null;
}
