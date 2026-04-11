"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  MoreVertical,
  User,
  HardHat,
  FileText,
  AlertTriangle,
  ArrowRight,
  Search,
  ChevronLeft,
  Filter,
  MoreHorizontal,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getAdminKYCList } from "@/lib/kyc";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface KYCSubmission {
  id: number;
  user_id: number;
  document_type: string;
  document_number: string;
  issued_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  user: {
    id: number;
    first_name?: string;
    last_name?: string;
    name: string;
    email: string;
    role: {
      role: string;
    };
  };
}

interface PaginationData {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from: number;
  to: number;
}

export default function AdminKYCQueuePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token) {
      fetchSubmissions(activePage);
    }
  }, [token, activePage]);

  const fetchSubmissions = async (page: number) => {
    setLoading(true);
    try {
      const result = await getAdminKYCList(token!, page);
      setSubmissions(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
        from: result.from,
        to: result.to,
      });
    } catch (error) {
      toast.error("Failed to load KYC queue");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const userName = sub.user?.first_name && sub.user?.last_name 
      ? `${sub.user.first_name} ${sub.user.last_name}` 
      : sub.user?.name || "";
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.document_type || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
      case "approved": return "bg-teal-50 text-teal-600 border-teal-100";
      case "verified": return "bg-teal-50 text-teal-600 border-teal-100";
      case "rejected": return "bg-red-50 text-red-600 border-red-100";
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
            KYC Verification Queue
          </h1>
          <p className="text-neutral-500 text-sm">
            Review and approve identity credentials for platform compliance and security.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-neutral-100 bg-white shadow-none text-neutral-700 font-medium gap-2">
            Export Audit Log
          </Button>
        </div>
      </motion.div>

      {/* Advanced Filters Corner */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-neutral-100 rounded-xl shadow-none focus-visible:ring-red-600"
          />
        </div>
        <Button variant="outline" className="h-12 border-neutral-100 bg-white rounded-xl gap-3 shadow-none text-neutral-700 font-medium justify-between px-4">
          <span className="flex items-center gap-2">
            <Filter className="size-4 text-neutral-400" /> Status: All
          </span>
          <ChevronRight className="size-4 rotate-90 opacity-40" />
        </Button>
        <div className="flex items-center justify-end gap-2 bg-red-50 px-4 rounded-xl border border-red-100">
             <AlertTriangle className="size-4 text-red-600" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-red-700">{pagination?.total || 0} Submissions Pending</span>
        </div>
      </motion.div>

      {/* Main Table */}
      <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-none mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Submission Details</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">User / Identity</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Document Info</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Verification Date</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Status</th>
                <th className="p-5 text-right uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="size-8 text-red-600 animate-spin mx-auto" />
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Synchronising Audit Data...</p>
                  </td>
                </tr>
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="group hover:bg-neutral-50/50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-neutral-100 border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                          <ShieldCheck className="size-5" />
                        </div>
                        <div className="space-y-0.5">
                          <Link href={`/admin/kyc/${sub.id}`} className="font-bold text-neutral-900 group-hover:text-red-600 transition-colors block">
                            KYC-{sub.id.toString().padStart(5, '0')}
                          </Link>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">v1.2 Secure</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-neutral-900 whitespace-nowrap">
                          {sub.user?.first_name && sub.user?.last_name 
                            ? `${sub.user.first_name} ${sub.user.last_name}` 
                            : sub.user?.name || "Unknown"}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <Mail className="size-3 text-neutral-300" />
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest underline decoration-neutral-200">{sub.user?.email || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <FileText className="size-3 text-red-500" />
                           <span className="text-[10px] text-neutral-700 font-bold tracking-widest uppercase">{sub.document_type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-medium">#{sub.document_number}</p>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-neutral-900">
                        {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[9px] text-neutral-400 tracking-widest font-bold uppercase">Submitted</p>
                    </td>
                    <td className="p-5">
                      <span className={cn("px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest border whitespace-nowrap", getStatusStyle(sub.status))}>
                         {sub.status}
                      </span>
                    </td>
                    <td className="p-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                         <Link href={`/admin/kyc/${sub.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-100 rounded-xl">Auditing</Button>
                         </Link>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-300 hover:text-red-600 transition-colors">
                            <MoreHorizontal className="size-4" />
                         </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <CheckCircle2 className="size-10 text-neutral-100 mx-auto" />
                    <h3 className="mt-4 text-xl font-serif text-neutral-900">Verification queue cleared</h3>
                    <p className="text-sm text-neutral-500 mt-1">No pending identities require review at this moment.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.last_page > 1 && (
          <div className="p-5 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
             <p className="text-xs text-neutral-500">
                Showing <span className="font-medium text-neutral-900">{pagination.from} to {pagination.to}</span> of {pagination.total} submissions
             </p>
             <div className="flex items-center gap-2">
                <Button 
                    onClick={() => setActivePage(prev => Math.max(1, prev - 1))}
                    disabled={activePage === 1}
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[9px] uppercase font-bold tracking-widest bg-white border-neutral-100 px-4 rounded-xl"
                >
                    Prev
                </Button>
                <Button 
                    onClick={() => setActivePage(prev => Math.min(pagination.last_page, prev + 1))}
                    disabled={activePage === pagination.last_page}
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[9px] uppercase font-bold tracking-widest bg-white border-neutral-100 px-4 rounded-xl hover:bg-neutral-50"
                >
                    Next
                </Button>
             </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
