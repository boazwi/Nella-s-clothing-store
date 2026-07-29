"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@/types";
import { authService } from "@/services/auth";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isPaid: boolean;
  signUp: (fullName: string, email: string, password: string) => Promise<Session>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

async function fetchIsPaid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch("/api/me/subscription", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { status: string | null };
    return data.status !== null && ACTIVE_STATUSES.has(data.status);
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authService
      .getSession()
      .then(async (s) => {
        if (cancelled) return;
        setSession(s);
        setIsPaid(await fetchIsPaid(s?.token));
      })
      .finally(() => !cancelled && setLoading(false));

    // Keep the session in sync with the backend (login, logout, token refresh,
    // cross-tab). No-op for backends that don't implement `subscribe`.
    const unsubscribe = authService.subscribe?.((s) => {
      setSession(s);
      fetchIsPaid(s?.token).then((paid) => !cancelled && setIsPaid(paid));
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const s = await authService.signUp(fullName, email, password);
      setSession(s);
      return s;
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const s = await authService.login(email, password);
    setSession(s);
    setIsPaid(await fetchIsPaid(s.token));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
    setIsPaid(false);
  }, []);

  const refreshSession = useCallback(async () => {
    const s = (await authService.refreshSession?.()) ?? (await authService.getSession());
    setSession(s);
    setIsPaid(await fetchIsPaid(s?.token));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isAdmin: session?.user.role === "admin",
        isPaid,
        signUp,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
