"use client";

import dynamic from "next/dynamic";

const ClaimsListExperience = dynamic(
  () => import("@/components/claims/claims-experience").then((mod) => mod.ClaimsListExperience),
);

export default function HandlerClaimsListPage() {
  return <ClaimsListExperience audience="handler" detailBasePath="/handler/claims" />;
}
