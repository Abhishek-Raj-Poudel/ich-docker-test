"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";

const ClaimsListExperience = dynamic(
  () => import("@/components/claims/claims-experience").then((mod) => mod.ClaimsListExperience),
);

export default function ClaimsListPage() {
  const { user } = useAuth();
  const audience = user?.role?.role === "builder" ? "builder" : "homeowner";

  return <ClaimsListExperience audience={audience} detailBasePath="/claims" />;
}
