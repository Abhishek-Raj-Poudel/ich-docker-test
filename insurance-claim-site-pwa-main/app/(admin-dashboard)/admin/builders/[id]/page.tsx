"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  FileText,
  Building2,
  HardHat,
  MapPin,
  ClipboardCheck,
  Briefcase,
  AlertTriangle,
  History,
  MoreVertical,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AdminBuilderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const verificationSteps = [
    { title: "Business Identity", status: "Verified", date: "10 Jan 2026", icon: Building2 },
    { title: "Trade Credentials", status: "Verified", date: "10 Jan 2026", icon: HardHat },
    { title: "Public Liability", status: "Expiring Soon", date: "31 Mar 2026", icon: ShieldCheck, warning: true },
    { title: "KYC Compliance", status: "Verified", date: "12 Jan 2026", icon: CheckCircle2 },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-6">
        <Link href="/admin/builders">
          <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent text-neutral-500 hover:text-neutral-900 group">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to Builders
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="size-20 rounded-xl bg-neutral-100 border border-neutral-100 flex items-center justify-center text-red-600">
                <HardHat className="size-10" />
             </div>
             <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-4xl font-light tracking-tight text-neutral-900 font-serif lowercase first-letter:uppercase">Mainstone Construction</h1>
                   <span className="px-2 py-0.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-teal-50 text-teal-600 border border-teal-100">Verified</span>
                </div>
                <p className="text-neutral-500 text-sm mt-1">Ref: {id} • Lead Partner • London & South East</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button className="h-11 px-8 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium transition-all shadow-none">
                Approve Renewal
             </Button>
             <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-neutral-100 bg-white shadow-none text-neutral-400 hover:text-neutral-900 transition-colors">
                <MoreVertical className="size-5" />
             </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
           {/* Review Checklist */}
           <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-8 space-y-6 shadow-none">
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                 <ClipboardCheck className="size-5 text-red-600" />
                 <h3 className="text-xl font-medium text-neutral-900 font-serif">Verification Checklist</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {verificationSteps.map((step, i) => (
                    <div key={i} className={cn(
                       "p-4 rounded-xl border flex items-center justify-between transition-all",
                       step.warning ? "border-amber-100 bg-amber-50/30" : "border-neutral-100 bg-neutral-50/30"
                    )}>
                       <div className="flex items-center gap-3">
                          <div className={cn(
                             "size-8 rounded-xl flex items-center justify-center",
                             step.warning ? "text-amber-600" : "text-neutral-400"
                          )}>
                             <step.icon className="size-4" />
                          </div>
                          <div className="space-y-0.5">
                             <p className="text-xs font-bold text-neutral-900">{step.title}</p>
                             <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{step.date}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className={cn(
                             "text-[9px] font-bold uppercase tracking-widest",
                             step.warning ? "text-amber-600 underline underline-offset-4" : "text-teal-600"
                          )}>{step.status}</span>
                          <ChevronRight className="size-3.5 text-neutral-300" />
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>

           {/* Business Documents */}
           <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-8 space-y-6 shadow-none">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                 <h3 className="text-xl font-medium text-neutral-900 font-serif lowercase first-letter:uppercase">Compliance Documents</h3>
                 <Button variant="link" className="text-red-600 p-0 h-auto text-[10px] uppercase tracking-widest font-bold hover:no-underline font-serif">Manage All</Button>
              </div>
              <div className="space-y-3">
                 {[
                    { name: "Public_Liability_2026.pdf", type: "Insurance", size: "2.4 MB" },
                    { name: "Gas_Safe_Certificate.pdf", type: "Credential", size: "1.1 MB" },
                    { name: "VAT_Registration.pdf", type: "Tax", size: "840 KB" },
                 ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-red-100 transition-all group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                             <FileText className="size-5" />
                          </div>
                          <div className="space-y-0.5">
                             <p className="text-sm font-medium text-neutral-900">{doc.name}</p>
                             <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{doc.type} • {doc.size}</p>
                          </div>
                       </div>
                       <Download className="size-4 text-neutral-300 group-hover:text-red-500 transition-colors" />
                    </div>
                 ))}
              </div>
           </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           {/* Performance Sidebar */}
           <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-6 space-y-6 shadow-none">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-3 text-center uppercase">Performance Snapshot</h4>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">Active Projects</span>
                    <span className="text-sm font-bold text-neutral-900">12</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">Completion Yield</span>
                    <span className="text-sm font-bold text-teal-600">98.2%</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">Avg. Response Time</span>
                    <span className="text-sm font-bold text-neutral-900">2.4 hrs</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">Last Verified</span>
                    <span className="text-sm font-bold text-neutral-900">12 Jan 2026</span>
                 </div>
              </div>
              <Button variant="outline" className="w-full h-10 text-[10px] font-bold uppercase tracking-widest border-red-100 text-red-600 hover:bg-red-50 shadow-none rounded-xl">
                 <ExternalLink className="size-3.5 mr-2" /> View Builder Portal
              </Button>
           </motion.div>

           {/* Compliance Warning */}
           <motion.div variants={item} className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4 shadow-none">
              <div className="flex items-center gap-3">
                 <AlertTriangle className="size-5 text-amber-600" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-amber-900">Upcoming Expiry</h3>
              </div>
              <p className="text-[11px] text-amber-800/70 leading-relaxed font-medium">Compliance documents for &apos;Public Liability&apos; will expire in 17 days. An automated notice has been sent to James Wilson.</p>
              <Button className="w-full bg-amber-600 text-white hover:bg-amber-700 text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl border-none shadow-none mt-2">
                 Send Manual Reminder
              </Button>
           </motion.div>

           {/* Change History */}
           <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-6 space-y-6 shadow-none">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-3 text-center uppercase">Audit Logs</h4>
              <div className="relative space-y-8 pl-6">
                 <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-100" />
                 {[
                    { event: "Account Re-verified", date: "12 Jan 2026", admin: "System" },
                    { event: "Documents Updated", date: "10 Jan 2026", admin: "David M." },
                    { event: "Insurance Audited", date: "10 Jan 2026", admin: "Sarah C." },
                 ].map((log, i) => (
                    <div key={i} className="relative group">
                       <div className="absolute -left-[27px] size-6 rounded-full border border-white bg-neutral-100 flex items-center justify-center z-10 transition-colors group-hover:bg-red-50">
                          <History className="size-3 text-neutral-400 group-hover:text-red-500" />
                       </div>
                       <div className="space-y-0.5 text-[11px]">
                          <p className="font-bold text-neutral-900">{log.event}</p>
                          <p className="text-neutral-400 font-medium">by {log.admin} • {log.date}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
