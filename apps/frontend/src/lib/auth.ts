/**
 * Common auth roles and helpers.
 * Note: No window or localStorage logic here for TOKEN storage. 
 * Token management is now handled by httpOnly cookies.
 */

export function isAdmin(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Triggers events for UI state synchronization across components and tabs.
 */
export function notifyAuthCleared() {
  if (typeof window !== "undefined") {
    // 1. Internal window event for the current tab
    window.dispatchEvent(new Event("auth-session-cleared"));
    
    // 2. Storage event for other tabs to synchronize
    window.localStorage.setItem("slh-logout-trigger", Date.now().toString());
  }
}

// Legacy exports kept/modified to prevent breakages during refactor.

export function getAccessToken(): string | null {
  return null;
}

export function getRefreshToken(): string | null {
  return null;
}

export function setSessionTokens(_at: string, _rt?: string | null) {
  // Logic moved to server-side cookies
}

export function clearSessionTokens() {
  notifyAuthCleared();
}
