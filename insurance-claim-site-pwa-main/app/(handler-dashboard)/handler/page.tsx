"use client";

import Link from "next/link";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HandlerDashboardPage() {
  const pendingClaims = [
    {
      id: "CLM-9238",
      address: "22 Baker Street, London",
      date: "2 Mar 2026",
      priority: "High",
      type: "Water Damage",
    },
    {
      id: "CLM-8142",
      address: "15 Kensington Gdns, London",
      date: "28 Feb 2026",
      priority: "Medium",
      type: "Fire & Smoke",
    },
    {
      id: "CLM-7521",
      address: "88 Canary Wharf, London",
      date: "1 Mar 2026",
      priority: "Low",
      type: "Impact",
    },
  ];

  const recentActivity = [
    {
      type: "approved",
      desc: "Claim CLM-7122 approved and sent to insurer",
      time: "2 hours ago",
      icon: CheckCircle2,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      type: "rejected",
      desc: "Claim CLM-6981 rejected - insufficient evidence",
      time: "5 hours ago",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      type: "report",
      desc: "PDF Report generated for CLM-9238",
      time: "Yesterday",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header Section */}
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif lowercase first-letter:uppercase">
            Adjustment Overview
          </h1>
          <p className="text-base md:text-lg font-normal text-neutral-500 max-w-xl">
            Welcome back. You have <span className="text-neutral-900 font-medium">8 claims</span> awaiting your validation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-full px-6 font-medium gap-3 bg-white border-neutral-100 text-neutral-700 shadow-none"
          >
            <Calendar className="size-5" />
            March 2026
          </Button>
        </div>
      </motion.div>

      {/* Alert Banner for Urgent Claims */}
      <motion.div variants={item}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between gap-6 shadow-none">
          <div className="flex items-center gap-6">
            <div className="size-12 bg-white rounded-xl flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
              <AlertCircle className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-amber-900">
                3 Urgent Claims Pending &gt; 48 Hours
              </h3>
              <p className="text-amber-700/80 text-sm">
                These claims require immediate review to meet SLA requirements.
              </p>
            </div>
          </div>
          <Link href="/handler/claims?filter=urgent">
            <Button className="bg-amber-600 text-white hover:bg-amber-700 rounded-full h-10 px-6 font-medium shadow-none outline-none border-none">
              Review Now
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Pending Reviews",
            value: "8",
            sub: "3 high priority",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50/50",
          },
          {
            label: "Approved (MTD)",
            value: "24",
            sub: "+12% from Feb",
            icon: CheckCircle2,
            color: "text-teal-600",
            bg: "bg-teal-50/50",
          },
          {
            label: "Rejected (MTD)",
            value: "3",
            sub: "-5% from Feb",
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50/50",
          },
          {
            label: "Avg. Process Time",
            value: "1.4d",
            sub: "Within target",
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-blue-50/50",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="bg-white border border-neutral-100 rounded-xl p-6 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:border-[#1F7A6D]/20 hover:bg-neutral-50/30 group shadow-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                {stat.label}
              </span>
              <div className={cn(stat.bg, stat.color, "p-2 rounded-xl border border-transparent transition-all")}>
                <stat.icon className="size-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-neutral-900 tracking-tight group-hover:text-[#1F7A6D] transition-colors">
                {stat.value}
              </div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full bg-current", stat.color)} />
                {stat.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Pending Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item} className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-900 font-serif">
              Pending Reviews
            </h2>
            <Link href="/handler/claims">
              <Button
                variant="link"
                className="text-[#1F7A6D] font-bold uppercase text-[10px] tracking-widest gap-2 hover:no-underline group"
              >
                View all claims
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </motion.div>

          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <motion.div
                key={claim.id}
                variants={item}
                className="bg-white border border-neutral-100 rounded-xl p-5 flex items-center justify-between gap-4 transition-all hover:border-[#1F7A6D]/30 hover:bg-[#1F7A6D]/5 group shadow-none"
              >
                <div className="flex items-center gap-5">
                  <div className="size-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 border border-neutral-100 group-hover:bg-[#1F7A6D] group-hover:text-white transition-all duration-500">
                    <ClipboardCheck className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-neutral-900">{claim.id}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border",
                        claim.priority === "High" ? "bg-red-50 text-red-600 border-red-100" :
                        claim.priority === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-neutral-50 text-neutral-500 border-neutral-100"
                      )}>
                        {claim.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-900">{claim.address}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                      {claim.type} • Submitted {claim.date}
                    </p>
                  </div>
                </div>
                <Link href={`/handler/claims/${claim.id}`}>
                  <Button variant="ghost" size="icon" className="rounded-full border border-neutral-100 bg-white group-hover:border-[#1F7A6D] group-hover:text-[#1F7A6D] transition-all">
                    <ChevronRight className="size-5" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-6">
          <motion.div variants={item}>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-900 font-serif">
              Activity
            </h2>
          </motion.div>

          <motion.div 
            variants={item}
            className="bg-white border border-neutral-100 rounded-xl p-6 relative overflow-hidden shadow-none"
          >
            <div className="absolute left-9 top-10 bottom-10 w-px bg-neutral-100" />
            <div className="space-y-8 relative">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={cn(
                    "size-6 rounded-full flex items-center justify-center shrink-0 z-10 border border-white",
                    activity.bg, activity.color
                  )}>
                    <activity.icon className="size-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-900 leading-tight">
                      {activity.desc}
                    </p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              className="w-full mt-8 rounded-full border border-neutral-100 bg-white font-medium text-xs uppercase tracking-widest h-10 hover:bg-neutral-50 shadow-none text-neutral-700"
            >
              View History
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
