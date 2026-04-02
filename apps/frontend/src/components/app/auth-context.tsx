"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getMe } from "@/lib/api";
import type { AuthMeResponse } from "@/lib/analysis";
import { hasSessionToken } from "@/lib/auth";

type AuthUser = AuthMeResponse["data"]["user"];

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!hasSessionToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
