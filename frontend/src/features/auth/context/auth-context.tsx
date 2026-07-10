"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, type LoginPayload } from "../services/authService";
import {
  clearSession,
  getSession,
  saveSession,
  type AuthSession,
} from "@/lib/auth";

type AuthContextValue = {
  user: AuthSession | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  logout: () => void;
  recargar: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const loadSession = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const localSession = getSession();

    if (!localSession?.token) {
      setUser(null);
      return;
    }

    setUser(localSession);

    try {
      const currentUser = await authService.me();

      const mergedSession: AuthSession = {
        ...localSession,
        ...currentUser,
        token: localSession.token,
        tipo: localSession.tipo,
      };

      saveSession(mergedSession);
      setUser(mergedSession);
    } catch {
      clearSession();
      setUser(null);
    }
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "Error desconocido");
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setError(null);

    const session = await authService.login(payload);
    saveSession(session);
    setUser(session);

    return session;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user?.token),
      login,
      logout,
      recargar: loadSession,
    }),
    [user, loading, error, login, logout, loadSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}