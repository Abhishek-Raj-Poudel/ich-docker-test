"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getAuthUser, useAppStore } from "@/lib/app-store";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  kyc_status: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  useEffect(() => {
    if (authLoading || !hasHydrated) return;

    if (!token || !user) {
      toast.error("You are not logged in. Please sign in to continue.");
      router.push("/login");
      return;
    }

    const role = typeof user.role === "object" ? user.role.role : user.role;

    if (!allowedRoles.includes(role)) {
      toast.error("You don't have permission to access this page.");
      if (role === "builder") {
        router.push("/dashboard");
      } else if (role === "claim_handler") {
        router.push("/handler");
      } else if (role === "admin" || role === "super_admin" || role === "insurer") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      return;
    }
  }, [router, allowedRoles, user, token, authLoading, hasHydrated]);

  if (authLoading || !hasHydrated || !token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = typeof user.role === "object" ? user.role.role : user.role;
  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export function getUserRole(): string | null {
  const user = getAuthUser();
  if (!user) return null;
  return typeof user.role === "object" ? user.role.role : null;
}

export function getUser(): User | null {
  const user = getAuthUser();
  if (!user) return null;
  return {
    id: user.id,
    name: user.name ?? [user.first_name, user.last_name].filter(Boolean).join(" "),
    email: user.email,
    role: typeof user.role === "object" ? user.role.role : "",
    kyc_status: user.kyc_status ?? "",
  };
}
