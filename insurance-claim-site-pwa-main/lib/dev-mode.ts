"use client";

import { useAppStore } from "./app-store";

export const DEV_MODE_ENABLED_KEY = "claimhelp.devMode.enabled";
export const DEV_MODE_ROLE_KEY = "claimhelp.devMode.role";
export const DEV_MODE_EVENT = "claimhelp-dev-mode-change";

export type DevModeRole = "homeowner" | "builder" | "admin" | "claim_handler";

const DEFAULT_ROLE: DevModeRole = "homeowner";

function emitDevModeChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event(DEV_MODE_EVENT));
}

export function isDevModeAvailable(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_MODE !== "false";
}

export function isDevModeEnabled(): boolean {
  if (!isDevModeAvailable()) return false;
  return useAppStore.getState().devModeEnabled;
}

export function setDevModeEnabled(enabled: boolean) {
  useAppStore.getState().setDevModeEnabled(enabled);
  emitDevModeChange();
}

export function getDevModeRole(): DevModeRole {
  return useAppStore.getState().devModeRole ?? DEFAULT_ROLE;
}

export function setDevModeRole(role: DevModeRole) {
  useAppStore.getState().setDevModeRole(role);
  emitDevModeChange();
}

export function getDevModeToken(): string {
  return `dev-mode-token:${getDevModeRole()}`;
}
