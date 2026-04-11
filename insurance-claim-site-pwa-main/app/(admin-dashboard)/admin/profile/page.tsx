"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, Bell, Shield, Key, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProfilePage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-12 pb-20"
    >
      <motion.div variants={item} className="space-y-2 text-center">
        <h1 className="text-4xl font-light tracking-tight text-neutral-900 font-serif">
          Admin Profile
        </h1>
        <p className="text-neutral-500 text-sm">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-8 relative overflow-hidden">
        {/* Subtle background flair */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield className="size-32" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 relative z-10">
          <Avatar className="h-24 w-24 rounded-xl border border-neutral-100 shadow-none">
            <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
            <AvatarFallback className="bg-primary/5 text-primary text-xl rounded-xl font-serif">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-serif text-neutral-900">Alex Administrator</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2">
               <p className="text-neutral-500">alex.admin@insuranceclaimhelp.co.uk</p>
               <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none rounded-xl shadow-none font-medium">Platform Admin</Badge>
            </div>
            <p className="text-xs text-neutral-400 mt-2">Member since Jan 2024 • Last login: Today, 09:15 AM</p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
           <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                 <User className="size-4" />
                 Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Full Name</label>
                    <Input defaultValue="Alex Administrator" className="bg-neutral-50 border-neutral-100 shadow-none rounded-xl h-11" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Phone Number</label>
                    <Input defaultValue="+44 (0) 7700 900000" className="bg-neutral-50 border-neutral-100 shadow-none rounded-xl h-11" />
                 </div>
                 <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Email Address</label>
                    <Input defaultValue="alex.admin@insuranceclaimhelp.co.uk" disabled className="bg-neutral-100 border-neutral-100 shadow-none rounded-xl h-11 text-neutral-500 cursor-not-allowed" />
                 </div>
              </div>
           </div>

           <div className="pt-6 border-t border-neutral-100 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                 <Key className="size-4" />
                 Security
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-neutral-50/50">
                    <div className="space-y-0.5">
                       <p className="text-sm font-medium text-neutral-900">Two-Factor Authentication</p>
                       <p className="text-xs text-neutral-500">Secure your account with an Authenticator app.</p>
                    </div>
                    <Badge className="bg-teal-50 text-teal-600 hover:bg-teal-50 border-none rounded-xl shadow-none flex items-center gap-1">
                       <CheckCircle2 className="size-3" />
                       Enabled
                    </Badge>
                 </div>
                 <Button variant="outline" className="w-full sm:w-auto rounded-xl shadow-none border-neutral-100 hover:bg-neutral-50">
                    Change Password
                 </Button>
              </div>
           </div>

           <div className="pt-6 border-t border-neutral-100 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                 <Bell className="size-4" />
                 Notifications
              </h3>
              <div className="space-y-3">
                 {[
                    { label: "New Builder KYC Submissions", defaultChecked: true },
                    { label: "High Value Claims (>£50k) Created", defaultChecked: true },
                    { label: "System Alerts & Maintenance", defaultChecked: true },
                    { label: "Weekly Platform Analytics Report", defaultChecked: false },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-sm text-neutral-600">{item.label}</span>
                       <div className={`w-10 h-5 rounded-full p-1 transition-colors cursor-pointer ${item.defaultChecked ? 'bg-primary' : 'bg-neutral-200'}`}>
                          <div className={`h-3 w-3 bg-white rounded-full transition-transform ${item.defaultChecked ? 'translate-x-5' : 'translate-x-0'}`} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto rounded-xl">
                 <LogOut className="w-4 h-4 mr-2" />
                 Sign Out
              </Button>
              <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:brightness-110 rounded-xl shadow-none px-8">
                 Save Changes
              </Button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
