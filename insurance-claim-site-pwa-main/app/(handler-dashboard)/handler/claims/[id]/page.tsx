"use client";

import dynamic from "next/dynamic";

const ClaimDetailExperience = dynamic(
  () => import("@/components/claims/claims-experience").then((mod) => mod.ClaimDetailExperience),
);

export default function HandlerClaimDetailPage() {
  return <ClaimDetailExperience audience="handler" backHref="/handler/claims" />;
}
