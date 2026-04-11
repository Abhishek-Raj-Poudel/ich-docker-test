"use client";

import { create } from "zustand";
import type { DevModeRole } from "./dev-mode";

interface AppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  contact_number?: string;
  is_active: number;
  role: {
    id: number;
    role: string;
  };
  created_at: string;
  kyc_status?: string;
  email_verified?: boolean;
}

interface AppStoreState {
  token: string | null;
  user: AppUser | null;
  authLoading: boolean;
  hasHydrated: boolean;
  devModeEnabled: boolean;
  devModeRole: DevModeRole;
  devModeButtonVisible: boolean;
  hydrateFromStorage: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: AppUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setDevModeEnabled: (enabled: boolean) => void;
  setDevModeRole: (role: DevModeRole) => void;
  setDevModeButtonVisible: (visible: boolean) => void;
  clearSession: () => void;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";
const DEV_MODE_ENABLED_KEY = "claimhelp.devMode.enabled";
const DEV_MODE_ROLE_KEY = "claimhelp.devMode.role";
const DEV_MODE_BUTTON_VISIBLE_KEY = "claimhelp.devMode.buttonVisible";
const DEFAULT_DEV_ROLE: DevModeRole = "homeowner";

function readUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

function emitStorageEvents() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("storage"));
}

export const useAppStore = create<AppStoreState>((set) => ({
  token: null,
  user: null,
  authLoading: true,
  hasHydrated: false,
  devModeEnabled: false,
  devModeRole: DEFAULT_DEV_ROLE,
  devModeButtonVisible: true,
  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    set({
      token: localStorage.getItem(TOKEN_KEY),
      user: readUser(),
      hasHydrated: true,
      devModeEnabled: localStorage.getItem(DEV_MODE_ENABLED_KEY) === "true",
      devModeRole: (localStorage.getItem(DEV_MODE_ROLE_KEY) as DevModeRole | null) ?? DEFAULT_DEV_ROLE,
      devModeButtonVisible: localStorage.getItem(DEV_MODE_BUTTON_VISIBLE_KEY) !== "false",
    });
  },
  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      emitStorageEvents();
    }
    set({ token });
  },
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
      emitStorageEvents();
    }
    set({ user });
  },
  setAuthLoading: (authLoading) => set({ authLoading }),
  setDevModeEnabled: (enabled) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEV_MODE_ENABLED_KEY, String(enabled));
      emitStorageEvents();
    }
    set({ devModeEnabled: enabled });
  },
  setDevModeRole: (role) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEV_MODE_ROLE_KEY, role);
      emitStorageEvents();
    }
    set({ devModeRole: role });
  },
  setDevModeButtonVisible: (visible) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEV_MODE_BUTTON_VISIBLE_KEY, String(visible));
      emitStorageEvents();
    }
    set({ devModeButtonVisible: visible });
  },
  clearSession: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      emitStorageEvents();
    }
    set({ token: null, user: null });
  },
}));

export function getAuthToken(): string {
  return useAppStore.getState().token ?? "";
}

export function getAuthUser(): AppUser | null {
  return useAppStore.getState().user;
}

export type { AppUser };
