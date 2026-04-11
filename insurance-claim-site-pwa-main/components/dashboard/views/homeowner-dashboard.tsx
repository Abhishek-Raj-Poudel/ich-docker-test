"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  FileText,
  TrendingUp,
  MapPin,
  Calendar,
  Search,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Home as HomeIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getMyProperties, Property } from "@/lib/property";
import { listJobs, Job } from "@/lib/job";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function HomeownerDashboardView() {
  const { token, user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const claims = jobs.map((job) => ({
    id: job.id,
    reference_number: job.report?.reference_number || `JOB-${job.id}`,
    total_cost: job.contract_amount ?? job.total_cost ?? 0,
    status: job.status,
    created_at: job.created_at,
    property: job.report?.property,
  }));

  const getFirstName = () => {
    if (user?.first_name) return user.first_name;
    if (user?.name) return user.name.split(" ")[0];
    return "";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const [propertiesData, jobsData] =
          await Promise.all([
            getMyProperties(),
            listJobs(),
          ]);

        if (propertiesData.success && propertiesData.data)
          setProperties(propertiesData.data);
        if (jobsData.success && jobsData.data) setJobs(jobsData.data);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const activeClaims = claims.filter(
    (claim) => claim.status !== "completed",
  );
  const upcomingVisits = jobs.filter(
    (j) => j.status === "accepted" && j.site_visit_scheduled_at,
  );

  const fallbackImages = [
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  ];

  const categories = [
    {
      label: "New Claim",
      icon: Plus,
      href: "/scan",
      color: "bg-black text-white",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-0 md:pt-0">
      {/* Uber Eats Style Header/Search */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 "
      >
        {/* Welcome Text (Mobile-first) */}
        <motion.div variants={item} className="px-1">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            Hi, {getFirstName()} 👋
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {activeClaims.length > 0
              ? `You have ${activeClaims.length} active insurance claims.`
              : "Ready to start your first insurance claim?"}
          </p>
        </motion.div>

        {/* Categories (Horizontal Scroll on Mobile) */}
        <Link
          href={"/scan"}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className={cn(
              "size-16 rounded-2xl flex items-center gap-2 justify-center transition-all group-hover:scale-105 active:scale-95 bg-primary w-full  text-white",
            )}
          >
            <PlusIcon className="size-5 text-white" />
            <span className="font-semibold">New Claim</span>
          </div>
        </Link>

        {/* Claims List ("Restaurants" style) */}
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Active Claims
            </h2>
            <Link
              href="/claims"
              className="text-sm font-bold text-neutral-400 hover:text-black transition-colors uppercase tracking-widest"
            >
              See All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-video bg-neutral-200 rounded-3xl w-full" />
                  <div className="space-y-2 px-2">
                    <div className="h-4 bg-neutral-200 rounded-3xl w-2/3" />
                    <div className="h-3 bg-neutral-100 rounded-3xl w-1/3" />
                  </div>
                </div>
              ))
            ) : claims.length > 0 ? (
              claims.slice(0, 6).map((claim) => (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id}`}
                  className="group block"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video overflow-hidden rounded-3xl bg-neutral-100">
                      {/* Uber Eats style tag */}
                      <div className="absolute top-4 left-4 z-10">
                        <div
                          className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-black/10",
                            claim.status === "completed"
                              ? "bg-emerald-500 text-white"
                              : "bg-neutral-900 text-white",
                          )}
                        >
                          {claim.status.replaceAll("_", " ")}
                        </div>
                      </div>

                      <Image
                        src={fallbackImages[claim.id % fallbackImages.length]}
                        alt={claim.property?.address_line_1 || "Claim"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute bottom-4 right-4 z-10">
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black tracking-tight text-neutral-900">
                          EST £{claim.total_cost?.toLocaleString() || "0"}
                        </div>
                      </div>
                    </div>

                    <div className="px-1 flex justify-between items-start capitalize">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-neutral-900 leading-tight">
                          {claim.property?.address_line_1 || "Untitled Claim"}
                        </h4>
                        <p className="text-sm text-neutral-500 font-medium">
                          {claim.reference_number || `CLM-${claim.id}`} •{" "}
                          {new Date(claim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="size-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                        <ChevronRight className="size-4 text-neutral-400 group-hover:text-black transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center rounded-3xl border-2 border-dashed border-neutral-100">
                <div className="size-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="size-8 text-neutral-300" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  No insurance claims yet
                </h3>
                <p className="text-neutral-400 text-sm mt-1 max-w-xs mx-auto">
                  Start a scan of your property damages to generate an
                  insurance-ready report instantly.
                </p>
                <Link href="/scan" className="mt-6 inline-block">
                  <Button className="bg-black text-white rounded-full h-12 px-8 font-bold uppercase text-xs tracking-widest transition-all">
                    Start Scan
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        {upcomingVisits.length > 0 && (
          <motion.div variants={item} className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                Scheduled Visits
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar">
              {upcomingVisits.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-neutral-100 rounded-3xl p-5 min-w-70 space-y-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-900 border border-neutral-100">
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">
                        Surveyor Assessment
                      </h4>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        {new Date(
                          job.site_visit_scheduled_at!,
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        •
                        {new Date(
                          job.site_visit_scheduled_at!,
                        ).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <MapPin className="size-3" />
                    <span className="truncate">
                      {job.report?.property?.address_line_1}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-full h-10 border-neutral-100 text-xs font-bold uppercase tracking-widest"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
