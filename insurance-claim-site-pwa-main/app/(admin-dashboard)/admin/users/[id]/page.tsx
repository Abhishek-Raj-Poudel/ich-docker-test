"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Camera,
  Layers,
  MapPin,
  ClipboardList,
  AlertCircle,
  FileText,
  History,
  Lock,
  Edit2,
  Trash2,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  getAdminUser, 
  updateAdminUser,
  suspendAdminUser,
  User,
  getRoleLabel,
  getRoleStyle,
  getStatusStyle,
  getStatusLabel,
  getUserName,
} from "@/lib/admin";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface ActivityItem {
  event: string;
  time: string;
  ip?: string;
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const activities: ActivityItem[] = user ? [
    { event: "Account Created", time: new Date(user.created_at).toLocaleString("en-GB", { 
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
    }) },
    { event: user.email_verified ? "Email Verified" : "Email Pending Verification", time: "" },
  ] : [];

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const result = await getAdminUser(Number(id));
        if (result.success && result.data) {
          setUser(result.data);
        } else {
          setError(result.message || "Failed to fetch user details");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching user details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSuspend = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const result = await suspendAdminUser(user.id);
      if (result.success && result.data) {
        setUser(result.data);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-10 animate-spin text-red-500" />
        <p className="text-neutral-500 font-medium animate-pulse">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-neutral-900">User Not Found</h1>
          <p className="text-neutral-500">{error || "The user you're looking for doesn't exist."}</p>
        </div>
        <Button 
          asChild
          className="bg-red-600 text-white rounded-xl px-8 h-12 font-bold uppercase text-xs tracking-widest"
        >
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  const roleLabel = getRoleLabel(user.role.id);
  const statusLabel = getStatusLabel(user.is_active, user.kyc_status);
  const userName = getUserName(user);
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-6">
        <Link href="/admin/users">
          <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent text-neutral-500 hover:text-neutral-900 group">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to Users
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="size-20 rounded-xl bg-neutral-100 border border-neutral-100 flex items-center justify-center text-3xl font-bold text-neutral-300 font-serif">
               {initials}
             </div>
             <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-light tracking-tight text-neutral-900 font-serif lowercase first-letter:uppercase">{userName}</h1>
                  <span className={cn("px-2 py-0.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border", getStatusStyle(user.is_active, user.kyc_status))}>
                    {statusLabel}
                  </span>
               </div>
               <p className="text-neutral-500 text-sm mt-1">
                 Ref: USR-{user.id.toString().padStart(5, "0")} • {roleLabel} Account
               </p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-11 px-6 rounded-xl border-neutral-100 bg-white shadow-none text-neutral-700 font-medium gap-2">
                <Edit2 className="size-4" /> Edit Profile
             </Button>
             <Button 
               variant="outline" 
               className="h-11 px-6 rounded-xl border-red-100 bg-white shadow-none text-red-600 font-medium gap-2 hover:bg-red-50 hover:border-red-200"
               onClick={handleSuspend}
               disabled={isUpdating || user.is_active === 0}
             >
               {isUpdating ? (
                 <Loader2 className="size-4 animate-spin" />
               ) : (
                 <Trash2 className="size-4" />
               )}
               {user.is_active === 0 ? "Suspended" : "Suspend Account"}
             </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
           {/* Information Grid */}
           <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-8 space-y-6 shadow-none">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                 <h3 className="text-xl font-medium text-neutral-900 font-serif">Contact Information</h3>
                 <Button variant="ghost" size="icon" className="text-neutral-300"><MoreVertical className="size-4" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email Address</label>
                       <div className="flex items-center gap-2 group cursor-pointer">
                          <p className="text-base font-medium text-neutral-900 group-hover:text-red-600 transition-colors">{user.email}</p>
                          <Mail className="size-3 text-neutral-300" />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Phone Number</label>
                       <div className="flex items-center gap-2 group cursor-pointer">
                          <p className="text-base font-medium text-neutral-900 group-hover:text-red-600 transition-colors">{user.contact_number || "Not provided"}</p>
                          <Phone className="size-3 text-neutral-300" />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Account Role</label>
                       <span className={cn("inline-block px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest border", getRoleStyle(roleLabel))}>
                         {roleLabel}
                       </span>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Communication</label>
                       <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded-xl bg-neutral-100 text-neutral-600 border border-neutral-100 text-[8px] font-bold uppercase tracking-widest">SMS</span>
                          <span className="px-2 py-0.5 rounded-xl bg-neutral-100 text-neutral-600 border border-neutral-100 text-[8px] font-bold uppercase tracking-widest">Email</span>
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* User's Data Tabs */}
           <motion.div variants={item} className="space-y-4">
              <div className="flex items-center gap-6 border-b border-neutral-100 pb-px">
                 <button className="text-[10px] font-bold uppercase tracking-widest text-red-600 border-b-2 border-red-600 pb-3 px-1 transition-all">Properties</button>
                 <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 pb-3 px-1 transition-all">Claims</button>
                 <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 pb-3 px-1 transition-all">KYC Documents</button>
              </div>

              <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-8 text-center">
                <div className="size-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100">
                  <Layers className="size-6 text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500">Properties will be displayed here</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">Connect to API for live data</p>
              </div>
           </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           {/* Identity Badge */}
           <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-6 space-y-6 shadow-none">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-3 text-center">Identity & Security</h4>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">KYC Status</span>
                    <div className={cn("flex items-center gap-2", 
                      user.kyc_status === "approved" ? "text-teal-600" : 
                      user.kyc_status === "pending" ? "text-amber-600" : "text-neutral-400"
                    )}>
                       {user.kyc_status === "approved" ? (
                         <CheckCircle2 className="size-3.5" />
                       ) : user.kyc_status === "pending" ? (
                         <Clock className="size-3.5" />
                       ) : (
                         <XCircle className="size-3.5" />
                       )}
                       <span className="text-[10px] font-bold uppercase tracking-widest">
                         {user.kyc_status === "approved" ? "Verified" : 
                          user.kyc_status === "pending" ? "Pending" : "Not Submitted"}
                       </span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">Email Status</span>
                    <div className={cn("flex items-center gap-2", user.email_verified ? "text-teal-600" : "text-amber-600")}>
                       {user.email_verified ? (
                         <CheckCircle2 className="size-3.5" />
                       ) : (
                         <Clock className="size-3.5" />
                       )}
                       <span className="text-[10px] font-bold uppercase tracking-widest">
                         {user.email_verified ? "Verified" : "Pending"}
                       </span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">Account Status</span>
                    <div className={cn("flex items-center gap-2", user.is_active === 1 ? "text-teal-600" : "text-red-600")}>
                       {user.is_active === 1 ? (
                         <CheckCircle2 className="size-3.5" />
                       ) : (
                         <XCircle className="size-3.5" />
                       )}
                       <span className="text-[10px] font-bold uppercase tracking-widest">
                         {user.is_active === 1 ? "Active" : "Suspended"}
                       </span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-xs font-medium text-neutral-500">Joined</span>
                    <span className="text-xs font-bold text-neutral-900">
                      {new Date(user.created_at).toLocaleDateString("en-GB", { 
                        day: "numeric", month: "short", year: "numeric" 
                      })}
                    </span>
                 </div>
              </div>
              <Button variant="outline" className="w-full h-10 text-[10px] font-bold uppercase tracking-widest border-red-100 text-red-600 hover:bg-red-50 shadow-none rounded-xl">
                 <Lock className="size-3.5 mr-2" /> Force Password Reset
              </Button>
           </motion.div>

           {/* Event Log */}
           <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-6 space-y-6 shadow-none">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-3">Audit Timeline</h4>
              <div className="relative space-y-8 pl-6">
                 <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-100" />
                 {activities.filter(a => a.time).map((act, i) => (
                    <div key={i} className="relative group">
                       <div className="absolute -left-[27px] size-6 rounded-full border border-white bg-neutral-100 flex items-center justify-center z-10">
                          <History className="size-3 text-neutral-400" />
                       </div>
                       <div className="space-y-0.5 text-xs text-neutral-900">
                          <p className="font-bold">{act.event}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">{act.time}</p>
                       </div>
                    </div>
                 ))}
                 {activities.length === 0 && (
                   <p className="text-xs text-neutral-400 text-center py-4">No activity recorded</p>
                 )}
              </div>
              <Button variant="link" className="text-neutral-400 p-0 h-auto text-[10px] uppercase font-bold tracking-widest w-full text-center hover:text-red-600 hover:no-underline font-normal">Download access logs</Button>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
