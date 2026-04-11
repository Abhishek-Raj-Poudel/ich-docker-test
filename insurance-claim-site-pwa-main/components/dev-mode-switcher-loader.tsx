"use client";

import dynamic from "next/dynamic";

export const DevModeSwitcherLoader = dynamic(
  () => import("@/components/dev-mode-switcher").then((mod) => mod.DevModeSwitcher),
  { ssr: false },
);
