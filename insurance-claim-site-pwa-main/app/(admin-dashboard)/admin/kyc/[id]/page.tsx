"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  ChevronLeft,
  Calendar,
  User,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  AlertCircle,
  Loader2,
  HardHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getAdminKYCDetail, approveKYC, rejectKYC } from "@/lib/kyc";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface KYCDetail {
  id: number;
  user: {
    id: number;
    first_name?: string;
    last_name?: string;
    name: string;
    email: string;
    role: string | { role: string };
  };
  document_type: string;
  document_number: string;
  issued_date: string;
  expiry_date: string;
  status: string;
  front_image_url: string;
  back_image_url: string | null;
  selfie_url: string;
  submitted_at: string;
}

export default function AdminKYCDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { token } = useAuth();
  const [kyc, setKyc] = useState<KYCDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectionBox, setShowRejectionBox] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (token && id) {
      fetchDetail();
    }
  }, [token, id]);

  const fetchDetail = async () => {
    try {
      const data = await getAdminKYCDetail(token!, id as string);
      setKyc(data);
    } catch (error) {
      toast.error("Failed to load submission details");
      router.push("/admin/kyc");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approveKYC(token!, id as string);
      toast.success("Submission approved successfully");
      router.push("/admin/kyc");
    } catch (error) {
      toast.error("Failed to approve submission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setSubmitting(true);
    try {
      await rejectKYC(token!, id as string, rejectionReason);
      toast.success("Submission rejected successfully");
      router.push("/admin/kyc");
    } catch (error) {
      toast.error("Failed to reject submission");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="size-10 text-red-600 animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Loading Files...</p>
      </div>
    );
  }

  if (!kyc) return null;

  const userRole = typeof kyc.user?.role === "object" ? kyc.user.role.role : kyc.user?.role;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-20 max-w-[1400px] mx-auto"
    >
      {/* Top Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="group hover:bg-neutral-100 rounded-xl font-bold uppercase text-[10px] tracking-widest text-neutral-400 hover:text-neutral-900 transition-all"
        >
          <ChevronLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
          Back to Queue
        </Button>

        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Submission ID:</span>
            <Badge variant="outline" className="rounded-xl border-neutral-100 text-neutral-600 font-bold px-3 py-1">
                KYC-{kyc.id.toString().padStart(6, '0')}
            </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Media Review */}
        <div className="lg:col-span-2 space-y-8">
            <motion.div variants={item} className="space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Evidence Inspection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Front Document */}
                    <div className="group relative aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-neutral-100  cursor-zoom-in" onClick={() => setSelectedImage(kyc.front_image_url)}>
                        <Image src={kyc.front_image_url} alt="ID Front" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="text-white size-8" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                            <Badge className="bg-white/90 text-neutral-900 border-none font-bold uppercase text-[9px] tracking-widest">Document Front</Badge>
                        </div>
                    </div>

                    {/* Selfie */}
                    <div className="group relative aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-neutral-100  cursor-zoom-in" onClick={() => setSelectedImage(kyc.selfie_url)}>
                        <Image src={kyc.selfie_url} alt="Selfie" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="text-white size-8" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                            <Badge className="bg-white/90 text-neutral-900 border-none font-bold uppercase text-[9px] tracking-widest">Live Verification (Selfie)</Badge>
                        </div>
                    </div>
                </div>

                {kyc.back_image_url && (
                    <div className="group relative aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-neutral-100  cursor-zoom-in max-w-md" onClick={() => setSelectedImage(kyc.back_image_url)}>
                         <Image src={kyc.back_image_url} alt="ID Back" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute top-4 left-4">
                            <Badge className="bg-white/90 text-neutral-900 border-none">Document Back</Badge>
                         </div>
                    </div>
                )}
            </motion.div>

            {/* Document Data Card */}
            <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-8 ">
                <div className="flex items-center gap-3 mb-8 border-b border-neutral-50 pb-6">
                    <div className="size-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
                        <FileText className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 uppercase text-[10px] tracking-widest">Extracted Metadata</h3>
                        <p className="text-sm text-neutral-500">Cross-reference these with the provided images.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Document Type</Label>
                            <p className="text-lg font-medium text-neutral-900 capitalize italic">{kyc.document_type.replace('_', ' ')}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Identity Number</Label>
                            <p className="text-xl font-bold font-serif tracking-tight text-neutral-900">{kyc.document_number}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Issued Date</Label>
                            <div className="flex items-center gap-2 text-neutral-900 font-medium">
                                <Calendar className="size-4 text-neutral-400" />
                                <span>{new Date(kyc.issued_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Expiry Date</Label>
                            <div className="flex items-center gap-2 text-neutral-900 font-medium">
                                <Calendar className="size-4 text-red-400" />
                                <span>{new Date(kyc.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Right Column: User Info & Actions */}
        <div className="space-y-8">
            <motion.div variants={item} className="bg-neutral-900 rounded-xl p-8 text-white ">
                <div className="flex items-center gap-6 mb-8">
                    <div className="size-16 rounded-xl bg-white border border-neutral-800 flex items-center justify-center text-neutral-900 shrink-0">
                        {userRole === "builder" ? <HardHat className="size-8" /> : <User className="size-8" />}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            {kyc.user?.first_name && kyc.user?.last_name 
                                ? `${kyc.user.first_name} ${kyc.user.last_name}` 
                                : kyc.user?.name || "Unknown"}
                        </h1>
                        <p className="text-xs font-medium text-neutral-400">{kyc.user?.email || "N/A"}</p>
                        <Badge className="mt-3 bg-red-600 text-[9px] font-bold uppercase tracking-widest border-none">
                            {userRole || "user"} Partner
                        </Badge>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-neutral-800">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 uppercase font-bold tracking-widest">Submission Time</span>
                        <span className="font-medium">{new Date(kyc.submitted_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 uppercase font-bold tracking-widest">Verification Status</span>
                        <Badge variant="outline" className="border-amber-400/30 text-amber-500 font-bold uppercase text-[8px] tracking-widest">{kyc.status}</Badge>
                    </div>
                </div>
            </motion.div>

            {/* Verdict Box */}
            <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl p-8  space-y-6">
                <div className="space-y-2">
                    <h3 className="font-bold text-neutral-900 uppercase text-[10px] tracking-widest">Final Verdict</h3>
                    <p className="text-sm text-neutral-500">Decide the outcome of this verification request.</p>
                </div>

                <div className="space-y-4">
                    <Button 
                        onClick={handleApprove}
                        disabled={submitting || showRejectionBox}
                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-none rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {submitting ? <Loader2 className="animate-spin size-4" /> : <CheckCircle2 className="size-5" />}
                        Approve Submission
                    </Button>

                    <Button 
                        onClick={() => setShowRejectionBox(!showRejectionBox)}
                        disabled={submitting}
                        variant="outline"
                        className={cn(
                            "w-full h-14 font-bold uppercase text-[10px] tracking-widest shadow-none rounded-xl transition-all flex items-center justify-center gap-3",
                            showRejectionBox ? "bg-red-50 text-red-600 border-red-200" : "border-neutral-100 hover:bg-red-50 hover:text-red-600"
                        )}
                    >
                        <XCircle className="size-5" />
                        Reject Documents
                    </Button>
                </div>

                <AnimatePresence>
                    {showRejectionBox && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4"
                        >
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Rejection Reason</Label>
                                <Textarea 
                                    placeholder="Missing selfie, document expired, blurry image..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-[120px] rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-red-600 shadow-none ring-0 focus-visible:ring-0"
                                />
                            </div>
                            <Button 
                                onClick={handleReject}
                                disabled={submitting || !rejectionReason.trim()}
                                className="w-full h-12 bg-neutral-900 text-white hover:bg-black rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-none flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="animate-spin size-4" />}
                                Finalise Rejection
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-4 flex items-start gap-3 bg-neutral-50 p-4 rounded text-[11px] text-neutral-500 leading-relaxed border border-neutral-100">
                    <AlertCircle className="size-4 text-neutral-400 shrink-0 mt-0.5" />
                    <span>Warning: This action is irreversible. Approved users will gain immediate access to high-value platform features.</span>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {selectedImage && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-6 md:p-12 cursor-zoom-out"
                onClick={() => setSelectedImage(null)}
            >
                <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
                    <Image src={selectedImage} alt="Focused Inspection" fill className="object-contain" />
                </div>
                <div className="absolute top-10 right-10 flex items-center gap-8">
                    <div className="text-white space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Inspection Mode</p>
                        <p className="text-xs font-medium">Use mouse to pan or scroll to zoom (Native Browser)</p>
                    </div>
                    <Button variant="ghost" className="size-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all p-0">
                        <XCircle className="size-6" />
                    </Button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
