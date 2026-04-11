"use client";

import Link from "next/link";
import {
  Users,
  HardHat,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  Headset,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Settings,
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

export default function AdminOverviewPage() {
  const stats = [
    { label: "Total Users", value: "2,842", sub: "+124 this week", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Builders", value: "482", sub: "12 pending review", icon: HardHat, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Claims", value: "1,208", sub: "84 active now", icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending KYC", value: "32", sub: "8 urgent", icon: ShieldCheck, color: "text-red-600", bg: "bg-red-50" },
    { label: "Revenue (MTD)", value: "£142,500", sub: "+18% vs last month", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Open Tickets", value: "14", sub: "4 high priority", icon: Headset, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const recentActivity = [
    { user: "Sarah J.", action: "New Builder Registration", details: "Quality Roofing Ltd submitted docs", time: "10 mins ago", icon: UserPlus, color: "text-blue-600" },
    { user: "System", action: "Claim Auto-Assigned", details: "CLM-9238 assigned to Abhi Adjuster", time: "25 mins ago", icon: ClipboardList, color: "text-purple-600" },
    { user: "Mark R.", action: "KYC Verified", details: "Homeowner identity approved", time: "1 hour ago", icon: CheckCircle2, color: "text-teal-600" },
    { user: "Admin", action: "Builder Suspended", details: "Coastal Builders failed insurance audit", time: "2 hours ago", icon: XCircle, color: "text-red-600" },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Welcome Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif lowercase first-letter:uppercase">
            Platform Overview
          </h1>
          <p className="text-base md:text-lg font-normal text-neutral-500 max-w-xl">
            Global snapshot of system health, user growth, and operational metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/admin/analytics">
              <Button variant="outline" className="h-12 rounded-xl px-6 font-medium gap-3 bg-white border-neutral-100 text-neutral-700 shadow-none">
                <BarChart3 className="size-5 text-neutral-400" />
                Reports
              </Button>
           </Link>
           <Button className="h-12 rounded-xl px-8 font-medium gap-3 bg-red-600 text-white hover:bg-red-700 transition-all shadow-none">
              <Plus className="size-5" />
              Quick Action
           </Button>
        </div>
      </motion.div>

      {/* Grid Quick Shortcuts */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: "Review KYC Queue", href: "/admin/kyc", icon: ShieldCheck, color: "bg-red-50 text-red-600" },
           { label: "Support Tickets", href: "/admin/support", icon: Headset, color: "bg-indigo-50 text-indigo-600" },
           { label: "Manage Builders", href: "/admin/builders", icon: HardHat, color: "bg-amber-50 text-amber-600" },
           { label: "System Settings", href: "/admin/settings", icon: Settings, color: "bg-neutral-100 text-neutral-600" },
         ].map((link, i) => (
           <Link key={i} href={link.href}>
             <div className="bg-white border border-neutral-100 rounded-xl p-4 flex items-center justify-between hover:border-red-200 hover:bg-red-50/10 transition-all group">
                <div className="flex items-center gap-3">
                   <div className={cn("size-10 rounded-xl flex items-center justify-center", link.color)}>
                      <link.icon className="size-5" />
                   </div>
                   <span className="text-sm font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-900 transition-colors">
                      {link.label}
                   </span>
                </div>
                <ArrowRight className="size-4 text-neutral-300 group-hover:translate-x-1 group-hover:text-red-500 transition-all" />
             </div>
           </Link>
         ))}
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="bg-white border border-neutral-100 rounded-xl p-8 flex flex-col justify-between min-h-[160px] transition-all hover:border-red-200 hover:bg-neutral-50/30 group shadow-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                {stat.label}
              </span>
              <div className={cn(stat.bg, stat.color, "p-3 rounded-xl border border-transparent transition-all")}>
                <stat.icon className="size-5" />
              </div>
            </div>
            <div className="space-y-1 mt-4">
              <div className="text-4xl font-semibold text-neutral-900 tracking-tight group-hover:text-red-600 transition-colors">
                {stat.value}
              </div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                <span className={cn("size-1.5 rounded-full bg-current", stat.color)} />
                {stat.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
           <motion.div variants={item} className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-900 font-serif">
                System Activity
              </h2>
              <Button variant="link" className="text-red-600 font-bold uppercase text-[10px] tracking-widest gap-2 hover:no-underline">
                 View Audit Logs
                 <ArrowUpRight className="size-4" />
              </Button>
           </motion.div>

           <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-none">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-neutral-50/50 border-b border-neutral-100">
                       <th className="p-4 uppercase text-[9px] font-bold tracking-widest text-neutral-400">Time</th>
                       <th className="p-4 uppercase text-[9px] font-bold tracking-widest text-neutral-400">User</th>
                       <th className="p-4 uppercase text-[9px] font-bold tracking-widest text-neutral-400">Action</th>
                       <th className="p-4 uppercase text-[9px] font-bold tracking-widest text-neutral-400">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-neutral-100">
                    {recentActivity.map((act, i) => (
                       <tr key={i} className="hover:bg-neutral-50/30 transition-colors group">
                          <td className="p-4 text-xs text-neutral-500 whitespace-nowrap">{act.time}</td>
                          <td className="p-4">
                             <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 uppercase">
                                   {act.user.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-neutral-900">{act.user}</span>
                             </div>
                          </td>
                          <td className="p-4">
                             <div className="flex items-center gap-2">
                                <act.icon className={cn("size-3.5", act.color)} />
                                <div className="space-y-0.5">
                                   <p className="text-xs font-bold text-neutral-900">{act.action}</p>
                                   <p className="text-[10px] text-neutral-400">{act.details}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-4 text-right">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-300 hover:text-red-600 transition-colors">
                                <ArrowRight className="size-4" />
                             </Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
              <div className="p-4 bg-neutral-50/30 text-center border-t border-neutral-100">
                 <Button variant="link" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-red-600">View All activity</Button>
              </div>
           </motion.div>
        </div>

        <div className="space-y-6">
           <motion.div variants={item}>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-900 font-serif">
                System Health
              </h2>
           </motion.div>

           <motion.div variants={item} className="space-y-4">
              <div className="bg-white border border-neutral-100 rounded-xl p-6 space-y-4 shadow-none">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="size-2 rounded-full bg-teal-500" />
                       <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">Core Services</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-xl border border-teal-100">Optimal</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="size-2 rounded-full bg-teal-500" />
                       <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">AI Scanning API</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-xl border border-teal-100">Stable</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                       <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">Email Gateway</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-xl border border-amber-100">Latency</span>
                 </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3 shadow-none">
                 <div className="flex items-center gap-3">
                    <AlertTriangle className="size-5 text-red-600" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-red-900">Unusual Activity Detected</h3>
                 </div>
                 <p className="text-xs text-red-800/70 leading-relaxed font-medium">Multiple failed login attempts from IP 192.168.1.1 on Admin Account &apos;sarah_backend&apos;.</p>
                 <Button className="w-full bg-red-600 text-white hover:bg-red-700 text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl border-none shadow-none mt-2">
                    Review Security Log
                 </Button>
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
