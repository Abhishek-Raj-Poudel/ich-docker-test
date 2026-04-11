"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  Activity,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const revenueData = [
  { name: "Jan", rev: 120000 },
  { name: "Feb", rev: 145000 },
  { name: "Mar", rev: 172000 },
  { name: "Apr", rev: 168000 },
  { name: "May", rev: 195000 },
  { name: "Jun", rev: 210000 },
];

const incidentData = [
  { name: "Water", value: 45, color: "#1F7A6D" },
  { name: "Fire", value: 15, color: "#ef4444" },
  { name: "Impact", value: 20, color: "#ffb41f" },
  { name: "Storm", value: 20, color: "#3b82f6" },
];

export default function AdminAnalyticsPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif lowercase first-letter:uppercase">
            Intelligence Center
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl">
            Real-time analytics across marketplace volume, claim processing velocity, and builder performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 border-neutral-100 bg-white rounded-xl gap-3 shadow-none text-neutral-700 font-medium px-6">
            <Calendar className="size-4 text-neutral-400" />
            Last 30 Days
            <ChevronDown className="size-4 opacity-40 ml-2" />
          </Button>
          <Button className="h-12 rounded-xl px-6 font-medium gap-3 bg-red-600 text-white hover:bg-red-700 transition-all shadow-none">
            <Download className="size-5" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
            { label: "Claims Processed", value: "1,208", trend: "+12.5%", color: "text-teal-600", icon: Layers },
            { label: "Marketplace Revenue", value: "£42,840", trend: "+8.2%", color: "text-teal-600", icon: TrendingUp },
            { label: "Avg. Validation Delay", value: "4.2 hrs", trend: "-15.0%", color: "text-teal-600", icon: Activity },
            { label: "Support Resolution", value: "98.4%", trend: "-1.2%", color: "text-red-500", icon: TrendingDown },
         ].map((stat, i) => (
            <motion.div key={i} variants={item} className="bg-white border border-neutral-100 rounded-xl p-6 space-y-4 shadow-none">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{stat.label}</span>
                  <stat.icon className="size-4 text-neutral-300" />
               </div>
               <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-neutral-900 font-serif">{stat.value}</h3>
                  <div className={cn("text-[10px] font-bold flex items-center gap-1 mb-1", stat.color)}>
                     {stat.trend}
                     {stat.trend.startsWith("+") ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  </div>
               </div>
            </motion.div>
         ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Chart */}
         <motion.div variants={item} className="lg:col-span-2 bg-white border border-neutral-100 rounded-xl p-8 space-y-8 shadow-none">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-medium text-neutral-900 font-serif">Platform Volume Trend</h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="size-2 rounded-full bg-red-600" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Monthly Revenue</span>
                  </div>
               </div>
            </div>
            
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#a3a3a3'}} 
                        dy={10}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#a3a3a3'}}
                        tickFormatter={(value) => `£${value/1000}k`}
                     />
                     <Tooltip 
                        contentStyle={{borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: 'none'}}
                        labelStyle={{fontWeight: 700, fontSize: '12px', marginBottom: '4px'}}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="rev" 
                        stroke="#dc2626" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorRev)" 
                        animationDuration={2000}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Distribution Chart */}
         <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-8 space-y-8 shadow-none">
            <h3 className="text-xl font-medium text-neutral-900 font-serif">Incident Breakdown</h3>
            <div className="h-[250px] w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={incidentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1500}
                     >
                        {incidentData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-neutral-900">1.2k</span>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Claims</span>
               </div>
            </div>
            
            <div className="space-y-4 pt-4">
               {incidentData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">{item.name}</span>
                     </div>
                     <span className="text-xs font-bold text-neutral-900">{item.value}%</span>
                  </div>
               ))}
            </div>
         </motion.div>
      </div>

      {/* Intelligence Reports Bar */}
      <motion.div variants={item} className="bg-neutral-50 border border-neutral-100 rounded-xl p-10 flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl font-serif text-neutral-900 font-light">Custom Report Engine</h3>
            <p className="text-neutral-500 text-sm leading-relaxed font-normal">Generate granular audit reports for insurance underwriting and regulatory compliance. All exports are digitally signed for authenticity.</p>
         </div>
         <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button variant="outline" className="w-full sm:w-auto px-8 h-12 bg-white border-neutral-100 text-neutral-900 font-bold uppercase text-[10px] tracking-widest shadow-none">BOM Valuation Analysis</Button>
            <Button className="w-full sm:w-auto px-8 h-12 bg-red-600 text-white hover:bg-red-700 font-bold uppercase text-[10px] tracking-widest shadow-none">Builder Payout Audit</Button>
         </div>
      </motion.div>
    </motion.div>
  );
}
