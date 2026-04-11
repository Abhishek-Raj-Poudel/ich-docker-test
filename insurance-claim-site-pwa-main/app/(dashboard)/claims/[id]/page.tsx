"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";

const ClaimDetailExperience = dynamic(
  () => import("@/components/claims/claims-experience").then((mod) => mod.ClaimDetailExperience),
);

export default function ClaimDetailPage() {
  const { user } = useAuth();
  const audience = user?.role?.role === "builder" ? "builder" : "homeowner";

  return <ClaimDetailExperience audience={audience} backHref="/claims" />;
}
