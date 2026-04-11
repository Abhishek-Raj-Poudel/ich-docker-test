"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  Zap,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

import { listAvailableJobs, Job, acceptJob } from "@/lib/job";
import { toast } from "sonner";

export default function BuilderJobsPage() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    const result = await listAvailableJobs();
    if (result.success && result.data) {
      setJobs(result.data);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = async (id: number) => {
    const result = await acceptJob(id);
    if (result.success) {
      toast.success("Job accepted successfully!");
      fetchJobs();
    } else {
      toast.error(result.message || "Failed to accept job");
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 md:space-y-10"
    >
      {/* Header section */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif">
            Available Jobs
          </h1>
          <p className="text-base md:text-lg font-normal text-neutral-500 max-w-2xl">
            Review and accept incoming claims assigned to you based on your coverage radius.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-neutral-100 p-3 rounded-xl shrink-0 w-full sm:w-auto">
          <div className="size-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
             <Zap className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 leading-none">Status</p>
            <p className="text-sm font-bold text-neutral-900 mt-1">Accepting Jobs</p>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={item} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
          <Input
            placeholder="Search by Job ID or postcode..."
            className="pl-12 h-12 md:h-14 rounded-xl border-neutral-100 bg-white focus-visible:bg-white focus-visible:border-neutral-900 transition-all ring-offset-0 focus-visible:ring-0 text-base"
          />
        </div>
        <Button
          variant="outline"
          className="h-12 md:h-14 rounded-full border-neutral-100 bg-white font-medium gap-2 px-8 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-900 transition-all w-full lg:w-auto"
        >
          <Filter className="size-4" />
          Filter & Sort
        </Button>
      </motion.div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <motion.div
              key={job.id}
              variants={item}
              className={cn(
                "bg-white border rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group",
                job.status === "not_started" ? "border-amber-200 hover:border-amber-400 hover:bg-amber-50/10" : "border-neutral-100 hover:border-neutral-300"
              )}
            >
              <div className="flex items-start md:items-center gap-4 md:gap-6">
                <div className={cn(
                  "size-14 md:size-20 rounded-2xl flex items-center justify-center border transition-all duration-500 ease-out shrink-0",
                  job.status === "not_started" ? "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100" : "bg-neutral-50 text-neutral-400 border-neutral-100"
                )}>
                  <FileText className="size-7 md:size-10" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="font-bold text-neutral-900 text-base md:text-lg">
                      {job.report?.reference_number || `JOB-${job.id}`}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5",
                          job.status === "not_started" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-teal-50 text-teal-600 border-teal-100"
                        )}
                      >
                        {job.status === "not_started" ? <Clock className="size-3" /> : <CheckCircle2 className="size-3" />}
                        {job.status === "not_started" ? "Pending Action" : job.status}
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
                    <span>{job.report?.property?.postcode}</span>
                    <span className="size-1 bg-neutral-300 rounded-full" />
                    <span>Insurance Claim</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 ml-0 md:ml-auto w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                <div className="text-left md:text-right">
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-0.5 md:mb-1">
                    AI Estimate
                  </p>
                  <p className="text-xl md:text-2xl font-semibold text-neutral-905">
                    £{job.report?.total_cost?.toLocaleString() || "0"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {job.status === "not_started" && (
                    <Button
                      onClick={() => handleAcceptJob(job.id)}
                      className="h-10 md:h-12 px-6 md:px-8 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-all"
                    >
                      Accept Job
                    </Button>
                  )}
                  <Link href={`/jobs/${job.id}?from=jobs`} className="shrink-0">
                    <Button
                      variant="outline"
                      className="h-10 md:h-12 px-6 md:px-8 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full border border-neutral-100 text-neutral-900 hover:bg-neutral-50 transition-all flex items-center gap-2 md:gap-3 group/btn"
                    >
                      Details
                      <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-20 text-center bg-white border border-neutral-100 border-dashed rounded-3xl">
            <p className="text-neutral-500 font-serif italic text-lg">No available jobs in your area at the moment.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
