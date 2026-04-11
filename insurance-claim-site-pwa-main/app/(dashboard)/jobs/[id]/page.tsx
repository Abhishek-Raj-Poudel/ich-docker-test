"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const ClaimDetailExperience = dynamic(
  () => import("@/components/claims/claims-experience").then((mod) => mod.ClaimDetailExperience),
);

export default function JobDetailPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const backHref = from === "projects" ? "/projects" : "/jobs";
  const backLabel = from === "projects" ? "Back to Projects" : "Back to Jobs";

  return <ClaimDetailExperience audience="builder" backHref={backHref} backLabel={backLabel} />;
}
