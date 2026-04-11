"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Briefcase,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getKYCStatus } from "@/lib/kyc";
import { KYCStatusBanner } from "@/components/dashboard/kyc-status-banner";

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
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface KYCStatusResponse {
  kyc_status: string;
  latest_submission?: {
    id: number;
    document_type: string;
    status: string;
    rejection_reason: string | null;
    submitted_at: string;
    reviewed_at: string | null;
  };
}

import { listAvailableJobs, Job, acceptJob } from "@/lib/job";
import { toast } from "sonner";

export function BuilderDashboardView() {
  const { token, user } = useAuth();
  
  const getFirstName = () => {
    if (user?.first_name) return user.first_name;
    if (user?.name) return user.name.split(' ')[0];
    return '';
  };
  const [kycStatus, setKycStatus] = useState<KYCStatusResponse | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingJobId, setAcceptingJobId] = useState<number | null>(null);

  const handleAcceptJob = async (jobId: number) => {
    setAcceptingJobId(jobId);
    const result = await acceptJob(jobId);
    if (result.success) {
      toast.success("Job accepted successfully!");
      setAvailableJobs(prev => prev.filter(j => j.id !== jobId));
    } else {
      toast.error(result.message || "Failed to accept job");
    }
    setAcceptingJobId(null);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const [kycData, availResult] = await Promise.all([
          getKYCStatus(token),
          listAvailableJobs()
        ]);
        setKycStatus(kycData);
        if (availResult.success && availResult.data) setAvailableJobs(availResult.data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const stats = [
    { label: "Pending Invitations", value: availableJobs.length.toString().padStart(2, '0'), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Active Projects", value: "00", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Earnings", value: "Backend gap", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const pendingJobs = availableJobs.slice(0, 3);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-medium text-neutral-900 tracking-tight leading-none pt-2">
            Welcome back, <span className="font-bold">{getFirstName()}</span>
          </h1>
          <p className="text-lg font-normal text-neutral-500">
            {isLoading ? "Loading your invitations..." : `You have ${availableJobs.length} new job invitations in your area.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Link href="/jobs">
                <Button variant="outline" className="h-14 px-8 rounded-xl border border-neutral-100 bg-white font-medium gap-3 hover:bg-neutral-50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <MapPin className="size-5 text-neutral-400" />
                    Available Jobs
                </Button>
            </Link>
          <Link href="/projects">
            <Button className="h-14 px-8 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-all font-medium gap-3 hover:scale-[1.02] active:scale-[0.98]">
              <Briefcase className="size-5 text-neutral-400" />
              Active Projects
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KYC Alert Banner */}
      <KYCStatusBanner status={kycStatus} itemVariants={item} href="/kyc" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="bg-white p-8 rounded-3xl border border-neutral-100 flex items-center justify-between group hover:border-neutral-900 transition-all"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-3xl font-medium text-neutral-900 tracking-tight leading-none pt-2">{stat.value}</p>
            </div>
            <div className={cn("size-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon className="size-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-neutral-900 tracking-tight">Pending Invitations</h2>
            <Link href="/jobs" className="text-sm font-bold text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors">View All</Link>
          </div>
          <div className="bg-white border border-neutral-100 rounded-3xl overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-neutral-400 italic">Finding invitations...</div>
            ) : pendingJobs.length > 0 ? (
              pendingJobs.map((job, i) => (
                <div key={job.id} className={cn(
                  "p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-neutral-50 transition-all cursor-pointer group",
                  i !== pendingJobs.length - 1 && "border-b border-neutral-100"
                )}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-bold text-neutral-900 leading-none capitalize">
                        {job.report?.property?.address_line_1 || "Insurance Claim"}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        {job.report?.reference_number || `JOB-${job.id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-neutral-500 text-sm">
                      <div className="flex items-center gap-2">
                          <MapPin className="size-4" />
                          {job.report?.property
                            ? [job.report.property.address_line_1, job.report.property.postcode]
                                .filter(Boolean)
                                .join(", ")
                            : "Location pending"}
                      </div>
                      <div className="flex items-center gap-2 font-bold text-neutral-900">
                          £{job.report?.total_cost?.toLocaleString() || "0"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleAcceptJob(job.id)}
                      disabled={acceptingJobId === job.id}
                      className="rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 transition-all font-bold text-[10px] uppercase tracking-widest px-6 group-hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {acceptingJobId === job.id ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
                      Accept
                    </Button>
                    <Link href={`/jobs/${job.id}`}>
                      <Button
                        className="rounded-xl h-12 bg-white border border-neutral-100 hover:bg-neutral-900 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest px-8 group-hover:scale-[1.02] active:scale-[0.98] text-neutral-900"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-neutral-400 italic font-serif">No pending invitations.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <h2 className="text-2xl font-medium text-neutral-900 tracking-tight">Performance Statistics</h2>
          <div className="bg-neutral-950 text-white p-10 rounded-3xl space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <TrendingUp className="size-40" />
             </div>
             <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Partner Rating</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-medium tracking-tighter">4.9</p>
                    <p className="text-neutral-500 text-lg font-normal italic">/ 5.0</p>
                </div>
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span className="text-neutral-400">Monthly Target</span>
                    <span>85%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[85%]" />
                </div>
                <p className="text-[10px] text-neutral-500 font-normal italic">You are £2,400 away from your next achievement bonus.</p>
             </div>
          </div>
          
           <div className="p-8 bg-neutral-900 rounded-3xl text-white flex flex-col items-center text-center gap-6 group cursor-pointer hover:bg-neutral-800 transition-all">
             <div className="size-16 bg-white/10 rounded-xl flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-neutral-900 transition-all">
                <Plus className="size-8" />
             </div>
             <div className="space-y-1">
                <h4 className="text-lg font-bold tracking-tight">Register New Project</h4>
                <p className="text-sm text-neutral-500">Add an offline job to track it via ClaimHelp.</p>
             </div>
             <ArrowUpRight className="size-6 text-neutral-700" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
