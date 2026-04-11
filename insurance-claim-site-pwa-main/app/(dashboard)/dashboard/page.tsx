"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { HomeownerDashboardView } from "@/components/dashboard/views/homeowner-dashboard";
import { BuilderDashboardView } from "@/components/dashboard/views/builder-dashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  const role = user?.role?.role || "homeowner";

  return role === "builder" ? <BuilderDashboardView /> : <HomeownerDashboardView />;
}
