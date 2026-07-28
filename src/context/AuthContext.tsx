"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@/types";
import { authService } from "@/services/auth";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getSession()
      .then(setSession)
      .finally(() => setLoading(false));

    // Keep the session in sync with the backend (login, logout, token refresh,
    // cross-tab). No-op for backends that don't implement `subscribe`.
    const unsubscribe = authService.subscribe?.(setSession);
    return () => unsubscribe?.();
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      setSession(await authService.signUp(fullName, email, password));
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    setSession(await authService.login(email, password));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isAdmin: session?.user.role === "admin",
        signUp,
        login,
        logout,
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
