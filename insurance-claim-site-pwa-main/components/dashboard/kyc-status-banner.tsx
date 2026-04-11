"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Clock, ChevronRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface KYCStatusBannerProps {
  status: {
    kyc_status: string;
    latest_submission?: {
      id: number;
      document_type: string;
      status: string;
      rejection_reason: string | null;
      submitted_at: string;
      reviewed_at: string | null;
    };
  } | null;
  itemVariants?: Variants;
  href?: string;
}

export function KYCStatusBanner({ status, itemVariants, href = "/kyc" }: KYCStatusBannerProps) {
  if (!status || ["approved", "submitted", "verified", "completed"].includes(status.kyc_status)) {
    return null;
  }

  const isPending = status?.kyc_status === "pending";
  const isRejected = status?.kyc_status === "rejected";

  return (
    <motion.div variants={itemVariants}>
      <Link href={href}>
        <div className={cn(
          "bg-white border rounded-md p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all group shadow-none relative overflow-hidden",
          isPending
            ? "border-amber-200 bg-amber-50/30 hover:bg-amber-50/50"
            : isRejected
            ? "border-red-200 bg-red-50/30 hover:bg-red-50/50"
            : "border-neutral-200 hover:border-primary/20 hover:bg-neutral-50/50"
        )}>
          <div className={cn(
            "absolute top-0 right-0 w-32 h-full -skew-x-12 translate-x-16 pointer-events-none transition-transform group-hover:translate-x-12",
            isPending ? "bg-amber-500/5" : isRejected ? "bg-red-500/5" : "bg-primary/5"
          )} />
          <div className="flex items-center gap-6 text-center sm:text-left relative z-10">
            <div className={cn(
              "size-16 rounded-md flex items-center justify-center border shrink-0 transition-colors duration-500",
              isPending
                ? "bg-amber-100 text-amber-600 border-amber-200 group-hover:bg-amber-600 group-hover:text-white"
                : isRejected
                ? "bg-red-100 text-red-600 border-red-200 group-hover:bg-red-600 group-hover:text-white"
                : "bg-primary/5 text-primary border-primary/10 group-hover:bg-primary group-hover:text-white"
            )}>
              {isPending ? (
                <Clock className="size-10" />
              ) : (
                <ShieldCheck className="size-10" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className={cn(
                "text-xl font-medium text-neutral-900 transition-colors",
                isPending ? "group-hover:text-amber-700" : isRejected ? "group-hover:text-red-700" : "group-hover:text-primary"
              )}>
                {isPending 
                  ? "Builder Verification Pending"
                  : isRejected
                  ? "Builder Verification Needs Attention"
                  : "Complete Your Builder Verification"}
              </h3>
              <p className="text-neutral-500 font-normal leading-tight">
                {isPending
                  ? "Our team is reviewing your documents. We'll notify you once verified."
                  : isRejected
                  ? "Review your details and resubmit your builder business information."
                  : "Add your builder business details before taking on work through the platform."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className={cn(
              "rounded-md h-12 border bg-white font-medium gap-2 shrink-0 transition-all shadow-none text-neutral-900 relative z-10",
              isPending
                ? "border-amber-200 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600"
                : isRejected
                ? "border-red-200 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600"
                : "border-neutral-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
            )}
          >
            {isPending ? "Check Status" : isRejected ? "Update KYC" : "Set Up KYC"}
            <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
