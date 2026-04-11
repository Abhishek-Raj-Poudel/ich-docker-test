"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HardHat,
  ChevronRight,
  ClipboardList,
  Loader2,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Job, listAvailableJobs, listJobs } from "@/lib/job";

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
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
};

export default function BuilderProjectsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJobs = async () => {
    setIsLoading(true);
    const [assignedResult, allJobsResult] = await Promise.all([listJobs(), listAvailableJobs()]);
    const mergedJobs = new Map<number, Job>();

    if (assignedResult.success && assignedResult.data) {
      assignedResult.data.forEach((job) => mergedJobs.set(job.id, job));
    }

    if (allJobsResult.success && allJobsResult.data) {
      allJobsResult.data.forEach((job) => mergedJobs.set(job.id, job));
    }

    if (mergedJobs.size > 0) {
      setJobs(
        Array.from(mergedJobs.values()).filter((job) =>
          ["accepted", "site_visit_booked", "in_progress", "completed"].includes(job.status),
        ),
      );
    } else {
      setJobs([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchJobs();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.report?.reference_number?.toLowerCase().includes(searchLower) ||
      job.report?.property?.address_line_1?.toLowerCase().includes(searchLower) ||
      job.report?.property?.postcode?.toLowerCase().includes(searchLower)
    );
  });

  const activeJobs = filteredJobs.filter((job) =>
    ["accepted", "site_visit_booked", "in_progress"].includes(job.status),
  );
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "in_progress":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "site_visit_booked":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "completed":
        return "bg-teal-50 text-teal-600 border-teal-100";
      default:
        return "bg-neutral-50 text-neutral-500 border-neutral-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-3" />;
      case "accepted":
      case "in_progress":
      case "site_visit_booked":
        return <Clock className="size-3" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "in_progress":
        return "In Progress";
      case "site_visit_booked":
        return "Site Visit Booked";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const displayJobs = filteredJobs.length > 0 ? filteredJobs : jobs;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 md:space-y-10"
    >
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif">
            My Projects
          </h1>
          <p className="text-base md:text-lg font-normal text-neutral-500 max-w-2xl">
            Track ongoing repairs, view completed jobs, and manage your payouts.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-neutral-100 p-3 rounded-xl shadow-none shrink-0 w-full sm:w-auto">
          <div className="size-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
             <ClipboardList className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 leading-none">Total Active</p>
            <p className="text-sm font-bold text-neutral-900 mt-1">{activeJobs.length} Projects</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
          <Input
            placeholder="Search by reference, address, or postcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 md:h-14 rounded-xl border-neutral-100 bg-white focus-visible:bg-white focus-visible:border-neutral-900 transition-all shadow-none ring-offset-0 focus-visible:ring-0 text-base"
          />
        </div>
        <Button
          variant="outline"
          className="h-12 md:h-14 rounded-xl border-neutral-100 bg-white font-medium gap-2 px-8 shadow-none text-neutral-700 hover:bg-neutral-50 hover:border-neutral-900 transition-all w-full lg:w-auto"
        >
          <Filter className="size-4" />
          Filter Projects
        </Button>
      </motion.div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : displayJobs.length > 0 ? (
          displayJobs.map((job) => (
            <motion.div
              key={job.id}
              variants={item}
              className="bg-white border rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-none border-neutral-100 hover:border-neutral-300 group"
            >
              <div className="flex items-start md:items-center gap-4 md:gap-6">
                <div className="size-14 md:size-20 bg-neutral-50 text-neutral-400 rounded-xl flex items-center justify-center border border-neutral-100 transition-all duration-500 ease-out shrink-0">
                  <HardHat className="size-7 md:size-10" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="font-bold text-neutral-900 text-base md:text-lg">
                      {job.report?.reference_number || `JOB-${job.id}`}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "px-2 md:px-2.5 py-0.5 md:py-1 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5",
                          getStatusStyles(job.status)
                        )}
                      >
                        {getStatusIcon(job.status)}
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-medium text-neutral-900 flex items-start md:items-center gap-2 text-base md:text-lg leading-snug">
                    <MapPin className="size-4 text-neutral-400 mt-1 md:mt-0 shrink-0" />
                    {job.report?.property
                      ? [job.report.property.address_line_1, job.report.property.postcode]
                          .filter(Boolean)
                          .join(", ")
                      : "Address not specified"}
                  </h4>
                  <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mt-1 md:mt-2">
                    <span>{job.report?.property?.postcode || "N/A"}</span>
                    <span className="size-1 bg-neutral-300 rounded-full" />
                    <span>Insurance Claim</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-6 md:gap-10 ml-0 md:ml-auto w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs">
                    <Calendar className="size-3.5" />
                    <span>Updated: {formatDate(job.updated_at)}</span>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-0.5 md:mb-1">
                    Contract Value
                  </p>
                  <p className="text-lg md:text-2xl font-semibold text-neutral-905">
                    £{job.contract_amount?.toLocaleString() || "0"}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link href={`/jobs/${job.id}?from=projects`} className="shrink-0 w-full sm:w-auto">
                    <Button
                      className="h-10 md:h-12 px-6 md:px-8 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl border text-neutral-900 transition-all duration-300 flex items-center gap-2 md:gap-3 group/btn shadow-none bg-white border-neutral-100 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white w-full"
                    >
                      Manage
                      <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-20 text-center bg-white border border-neutral-100 border-dashed rounded-3xl space-y-3">
            <HardHat className="size-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-900 font-medium text-lg">No accepted builder projects found.</p>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Accepted and active jobs will appear here so you can jump into the manage flow and update them.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
