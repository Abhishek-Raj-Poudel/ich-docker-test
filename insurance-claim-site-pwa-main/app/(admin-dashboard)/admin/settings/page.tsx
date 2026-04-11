"use client";

import {
  Settings,
  Shield,
  Bell,
  Globe,
  Lock,
  Database,
  Grid,
  CreditCard,
  MessageSquare,
  Cpu,
  Mail,
  Zap,
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

export default function AdminSettingsPage() {
  const settingsSections = [
    {
      title: "Core Platform",
      icon: Grid,
      settings: [
        { label: "Environment Mode", value: "Production", type: "text", desc: "Current system deployment stage" },
        { label: "Default Currency", value: "GBP (£)", type: "text", desc: "Base currency for all UK claims" },
        { label: "System Maintenance", value: false, type: "toggle", desc: "Place platform in read-only mode" },
      ]
    },
    {
      title: "AI & Claims Config",
      icon: Cpu,
      settings: [
        { label: "Auto-Assignment Threshold", value: "£2,500", type: "text", desc: "Claims below this value auto-assign to Level 1 Handlers" },
        { label: "AI Scanner Sensitivity", value: "High", type: "text", desc: "Detection threshold for material damage hot-spots" },
        { label: "BOM Calculation Engine", value: "v2.4.0", type: "text", desc: "Active logic for UK repair material pricing" },
      ]
    },
    {
      title: "Builder Compliance",
      icon: Shield,
      settings: [
        { label: "Strict KYC Enforcement", value: true, type: "toggle", desc: "Prevent builders from viewing jobs before full verification" },
        { label: "Commission Rate (%)", value: "8.5", type: "text", desc: "Platform fee on accepted contractor quotes" },
        { label: "Radius Constraint (mi)", value: "25", type: "text", desc: "Default search radius for job matching" },
      ]
    },
    {
      title: "Security & API",
      icon: Lock,
      settings: [
        { label: "Two-Factor Auth (Support)", value: true, type: "toggle", desc: "Force 2FA for all administrative support accounts" },
        { label: "API Rate Limiting", value: "1,000 req/min", type: "text", desc: "Global limit for public data endpoints" },
        { label: "Webhook Secret", value: "••••••••••••••••", type: "password", desc: "Used to sign outgoing event payloads" },
      ]
    }
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-4xl font-light tracking-tight text-neutral-900 font-serif lowercase first-letter:uppercase">
          System Configuration
        </h1>
        <p className="text-neutral-500 text-sm">
          Global platform settings and operational controls.
        </p>
      </motion.div>

      <div className="space-y-16">
        {settingsSections.map((section, idx) => (
          <motion.div key={idx} variants={item} className="space-y-6">
            <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
              <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                <section.icon className="size-5" />
              </div>
              <h2 className="text-xl font-medium text-neutral-900 font-serif">{section.title}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {section.settings.map((setting, sIdx) => (
                <div key={sIdx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{setting.label}</label>
                      <p className="text-[10px] text-neutral-400 leading-relaxed max-w-[200px]">{setting.desc}</p>
                    </div>
                    {setting.type === "toggle" && (
                      <div className={cn(
                        "w-12 h-6 rounded-full p-1 transition-colors cursor-pointer",
                        setting.value ? "bg-red-600" : "bg-neutral-200"
                      )}>
                        <div className={cn(
                          "h-4 w-4 bg-white rounded-full transition-transform",
                          setting.value ? "translate-x-6" : "translate-x-0"
                        )} />
                      </div>
                    )}
                  </div>
                  {setting.type !== "toggle" && (
                    <Input 
                       defaultValue={setting.value as string} 
                       type={setting.type === "password" ? "password" : "text"}
                       className="h-11 bg-white border-neutral-100 rounded-xl focus-visible:ring-red-600 shadow-none text-sm font-medium" 
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="pt-10 border-t border-neutral-100 flex items-center justify-between">
         <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
            <Zap className="size-3.5 text-amber-500 fill-amber-500" />
            Changes apply globally in real-time
         </p>
         <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Reset to Defaults</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700 h-11 px-8 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-none">Save All Settings</Button>
         </div>
      </motion.div>
    </motion.div>
  );
}
