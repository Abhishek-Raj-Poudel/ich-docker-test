"use client";

import { useEffect, useState } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DevModeRole,
  isDevModeAvailable,
  setDevModeEnabled,
  setDevModeRole,
} from "@/lib/dev-mode";
import { useAppStore } from "@/lib/app-store";

const roleOptions: Array<{ value: DevModeRole; label: string }> = [
  { value: "homeowner", label: "Homeowner" },
  { value: "builder", label: "Builder" },
  { value: "admin", label: "Admin" },
  { value: "claim_handler", label: "Handler" },
];

function getRoleRoute(role: DevModeRole) {
  if (role === "admin") return "/admin";
  if (role === "claim_handler") return "/handler";
  return "/dashboard";
}

export function DevModeSwitcher() {
  const enabled = useAppStore((state) => state.devModeEnabled);
  const role = useAppStore((state) => state.devModeRole);
  const isVisible = useAppStore((state) => state.devModeButtonVisible);
  const setIsVisible = useAppStore((state) => state.setDevModeButtonVisible);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey || event.key.toLowerCase() !== "d") {
        return;
      }

      event.preventDefault();
      setIsVisible(!useAppStore.getState().devModeButtonVisible);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsVisible]);

  useEffect(() => {
    if (!isVisible) {
      setOpen(false);
    }
  }, [isVisible]);

  if (!isDevModeAvailable()) return null;
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[60] md:bottom-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "h-11 rounded-full px-4 gap-2 shadow-none border",
            enabled
              ? "bg-amber-500 hover:bg-amber-500 text-black border-amber-300"
              : "bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200",
          )}
        >
          <FlaskConical className="size-4" />
          {enabled ? `Dev: ${roleOptions.find((option) => option.value === role)?.label}` : "Dev Mode"}
        </Button>
      </div>

      {open && (
        <div className="mt-3 w-72 rounded-3xl border border-neutral-200 bg-white p-4 shadow-none">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Frontend Sandbox</p>
            <p className="text-sm text-neutral-600">Run the app against local dummy data and switch roles instantly.</p>
            <p className="text-[11px] text-neutral-400">Shortcut: <span className="font-medium text-neutral-600">Ctrl/Cmd + Shift + D</span></p>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-neutral-50 p-3">
            <div>
              <p className="text-sm font-medium text-neutral-900">Mock backend</p>
              <p className="text-xs text-neutral-500">No API dependency</p>
            </div>
            <button
              type="button"
              onClick={() => setDevModeEnabled(!enabled)}
              className={cn(
                "h-7 w-12 rounded-full border transition-colors",
                enabled ? "border-amber-400 bg-amber-400" : "border-neutral-300 bg-white",
              )}
            >
              <span
                className={cn(
                  "block size-5 rounded-full bg-white transition-transform",
                  enabled ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDevModeRole(option.value)}
                className={cn(
                  "rounded-2xl border px-3 py-2 text-sm font-medium transition-colors",
                  role === option.value
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full rounded-2xl border-neutral-200"
            onClick={() => {
              if (typeof window === "undefined") return;
              window.location.href = getRoleRoute(role);
            }}
          >
            Open {roleOptions.find((option) => option.value === role)?.label} Portal
          </Button>

          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full rounded-2xl border-neutral-200"
            onClick={async () => {
              const { resetMockStore } = await import("@/lib/mock-store");
              resetMockStore();
            }}
          >
            <RotateCcw className="mr-2 size-4" />
            Reset Dummy Data
          </Button>
        </div>
      )}
    </div>
  );
}
