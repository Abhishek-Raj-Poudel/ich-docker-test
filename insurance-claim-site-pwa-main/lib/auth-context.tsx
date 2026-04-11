"use client";

import React, { createContext, useContext, useEffect } from "react";
import { login as apiLogin, logout as apiLogout, normalizeAuthUser } from "./auth";
import { getDevModeToken, isDevModeEnabled, setDevModeEnabled } from "./dev-mode";
import { AppUser, useAppStore } from "./app-store";

type User = AppUser;

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user_id?: number; email_verified?: boolean }>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const isLoading = useAppStore((state) => state.authLoading);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const devModeEnabled = useAppStore((state) => state.devModeEnabled);
  const devModeRole = useAppStore((state) => state.devModeRole);
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);
  const setTokenState = useAppStore((state) => state.setToken);
  const setUserState = useAppStore((state) => state.setUser);
  const setAuthLoading = useAppStore((state) => state.setAuthLoading);
  const clearSession = useAppStore((state) => state.clearSession);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!hasHydrated) return;

    const effectiveToken = devModeEnabled ? getDevModeToken() : token;
    let isCancelled = false;

    setAuthLoading(true);

    if (effectiveToken) {
      if (devModeEnabled) {
        void (async () => {
          const { mockGetCurrentUser } = await import("./mock-store");
          if (isCancelled) return;
          setTokenState(effectiveToken);
          setUserState(normalizeAuthUser(mockGetCurrentUser()));
          setAuthLoading(false);
        })();
        return () => {
          isCancelled = true;
        };
      }
      setAuthLoading(false);
    } else {
      setUserState(null);
      setAuthLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [token, hasHydrated, devModeEnabled, devModeRole, setAuthLoading, setTokenState, setUserState]);

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    if (result.success && result.token) {
      setTokenState(result.token);
      const normalizedUser = normalizeAuthUser(result.user);
      if (normalizedUser) {
        setUserState(normalizedUser);
      }
    }
    return result;
  };

  const logout = async () => {
    if (token) {
      await apiLogout(token);
    }
    if (isDevModeEnabled()) {
      setDevModeEnabled(false);
      setUserState(null);
    } else {
      clearSession();
    }
  };

  const setToken = (newToken: string) => {
    setTokenState(newToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
