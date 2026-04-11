"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  HardHat,
  Star,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminBuildersListPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockBuilders = [
    {
      id: "BLD-001",
      business: "Mainstone Construction",
      owner: "David Mainstone",
      location: "London, NW",
      trade: ["General", "Roofing"],
      rating: 4.8,
      status: "Verified",
      jobs: 142,
    },
    {
      id: "BLD-002",
      business: "Premium Plumbing Ltd",
      owner: "James Wilson",
      location: "Manchester",
      trade: ["Plumbing", "Heating"],
      rating: 4.5,
      status: "Verified",
      jobs: 89,
    },
    {
      id: "BLD-003",
      business: "Elite Electrical Services",
      owner: "Sarah Chen",
      location: "London, SE",
      trade: ["Electrical"],
      rating: 0.0,
      status: "Pending Review",
      jobs: 0,
    },
    {
      id: "BLD-004",
      business: "Coastal Repairs & Renovations",
      owner: "Mark Roberts",
      location: "Brighton",
      trade: ["General", "Carpentry"],
      rating: 3.2,
      status: "Suspended",
      jobs: 54,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Verified": return "bg-teal-50 text-teal-600 border-teal-100";
      case "Pending Review": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Suspended": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-neutral-50 text-neutral-500 border-neutral-100";
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-light tracking-tight text-neutral-900 font-serif lowercase first-letter:uppercase">
            Builder Network
          </h1>
          <p className="text-neutral-500 text-sm">
            Manage contractor verification, performance and compliance.
          </p>
        </div>
        <Button className="rounded-xl bg-red-600 text-white hover:bg-red-700 gap-2 h-11 px-6 shadow-none font-medium">
          <Plus className="size-4" /> Add Partner
        </Button>
      </motion.div>

      {/* Stats Summary Corner */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-neutral-100 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="size-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
               <CheckCircle2 className="size-5" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">432</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Verified Partners</p>
         </div>
         <div className="bg-white border border-neutral-100 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
               <AlertCircle className="size-5" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">12</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Applications Pending</p>
         </div>
         <div className="bg-white border border-neutral-100 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2 text-red-600 border-red-50 bg-red-50/10">
            <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
               <ShieldCheck className="size-5" />
            </div>
            <p className="text-2xl font-bold">4</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Compliance Alerts</p>
         </div>
      </motion.div>

      {/* Filters Corner */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Search by business name, owner or trade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white border-neutral-100 rounded-xl shadow-none focus-visible:ring-red-600"
          />
        </div>
        <Button variant="outline" className="h-12 border-neutral-100 bg-white rounded-xl gap-3 shadow-none text-neutral-700 font-medium px-4">
          <Filter className="size-4 text-neutral-400" />
          By Trade Specialism
          <ChevronRight className="size-4 rotate-90 ml-auto opacity-40 ml-4" />
        </Button>
        <Button variant="outline" className="h-12 border-neutral-100 bg-white rounded-xl gap-3 shadow-none text-neutral-700 font-medium px-4">
          <MapPin className="size-4 text-neutral-400" />
          Coverage: UK-wide
          <ChevronRight className="size-4 rotate-90 ml-auto opacity-40 ml-4" />
        </Button>
      </motion.div>

      {/* Builders Table */}
      <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-none mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400 whitespace-nowrap">Business / Trade</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400 whitespace-nowrap">Point of Contact</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400 whitespace-nowrap">Rating / Performance</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400 whitespace-nowrap">Verification</th>
                <th className="p-5 text-right uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400 whitespace-nowrap">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {mockBuilders.map((builder) => (
                <tr key={builder.id} className="group hover:bg-neutral-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-neutral-100 border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                        <HardHat className="size-6" />
                      </div>
                      <div className="space-y-0.5">
                        <Link href={`/admin/builders/${builder.id}`} className="font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                          {builder.business}
                        </Link>
                        <div className="flex gap-1.5 pt-0.5">
                           {builder.trade.map((t, idx) => (
                              <span key={idx} className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest border border-neutral-100 px-1.5 py-0.5 rounded-sm group-hover:border-red-100 transition-colors">{t}</span>
                           ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-medium text-neutral-900">{builder.owner}</p>
                    <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                       <MapPin className="size-3" /> {builder.location}
                    </p>
                  </td>
                  <td className="p-5">
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm font-bold text-neutral-900">
                           <Star className={cn("size-3.5", builder.rating > 0 ? "text-amber-400 fill-amber-400" : "text-neutral-200 fill-neutral-200")} />
                           {builder.rating > 0 ? builder.rating : "NR"}
                        </div>
                        <div className="h-4 w-[1px] bg-neutral-100" />
                        <div className="space-y-0.5">
                           <p className="text-xs font-bold text-neutral-900">{builder.jobs}</p>
                           <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Completed</p>
                        </div>
                     </div>
                  </td>
                  <td className="p-5">
                    <span className={cn("px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest border", getStatusStyle(builder.status))}>
                       {builder.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Link href={`/admin/builders/${builder.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-100 rounded-xl">Review Details</Button>
                       </Link>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-300 hover:text-neutral-600">
                          <MoreHorizontal className="size-4" />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
