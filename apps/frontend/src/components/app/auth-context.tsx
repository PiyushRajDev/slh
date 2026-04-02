"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getMe, logout } from "@/lib/api-client";
import type { AuthMeResponse } from "@/lib/analysis";
import { clearSessionTokens } from "@/lib/auth";

type AuthUser = AuthMeResponse["data"]["user"];

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthProvider (Client Component): 
 * Strictly a passive UI state provider. 
 * Does NOT perform navigation or auth-gate layouts.
 */
export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  // Sync user state from API if needed (e.g. after refresh)
  const fetchUser = useCallback(async () => {
    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    // Notify other components and tabs
    clearSessionTokens();
  }, []);

  useEffect(() => {
    // 1. Listen for local window events (e.g. from apiRequest)
    const onAuthClear = () => {
      setUser(null);
    };

    // 2. Listen for storage events from other tabs
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "slh-logout-trigger") {
        setUser(null);
      }
    };

    window.addEventListener("auth-session-cleared", onAuthClear);
    window.addEventListener("storage", onStorageChange);

    return () => {
      window.removeEventListener("auth-session-cleared", onAuthClear);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
