"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  MapPin,
  Calendar,
  User,
  Home,
  Check,
  X,
  Building2,
  Sparkles,
  DollarSign,
  FileCheck,
  MessageSquare,
  Download,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getReport, Report, approveReport, rejectReport } from "@/lib/report";
import { toast } from "sonner";

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

const fallbackImages = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
];

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchReport = async () => {
    setIsLoading(true);
    const result = await getReport(parseInt(reportId));
    if (result.success && result.data) {
      setReport(result.data);
    } else {
      toast.error(result.message || "Failed to load report");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const handleApprove = async () => {
    setActionLoading(true);
    const result = await approveReport(parseInt(reportId));
    if (result.success) {
      toast.success("Report approved successfully");
      fetchReport();
    } else {
      toast.error(result.message || "Failed to approve report");
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActionLoading(true);
    const result = await rejectReport(parseInt(reportId), rejectReason);
    if (result.success) {
      toast.success("Report rejected");
      setShowRejectDialog(false);
      setRejectReason("");
      fetchReport();
    } else {
      toast.error(result.message || "Failed to reject report");
    }
    setActionLoading(false);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-teal-50 text-teal-600 border-teal-100";
      case "submitted":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";
      case "draft":
        return "bg-neutral-50 text-neutral-500 border-neutral-100";
      default:
        return "bg-neutral-50 text-neutral-500 border-neutral-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="size-3" />;
      case "submitted":
        return <Clock className="size-3" />;
      case "rejected":
        return <XCircle className="size-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getImageUrl = (url: string) => {
    if (!url) return fallbackImages[0];
    if (url.startsWith("http")) return url;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${API_URL}/storage/${url}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-red-600" />
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
          Loading Report...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="size-24 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300 border border-neutral-100">
          <FileText className="size-12" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-medium text-neutral-900 font-serif">
            Report Not Found
          </h3>
          <p className="text-neutral-500 max-w-sm mx-auto">
            The requested report does not exist or has been archived.
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/reports")}
          variant="outline"
          className="rounded-full h-12 px-8 border-neutral-100 font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <Link
            href="/admin/reports"
            className="group flex items-center text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-all uppercase tracking-widest w-fit"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
            Back to Reports
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
              {report.reference_number || `RPT-${report.id}`}
            </h1>
            <span
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5",
                getStatusStyles(report.status)
              )}
            >
              {getStatusIcon(report.status)}
              {report.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {report.status === "submitted" && (
            <>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="h-12 rounded-full px-8 font-bold uppercase text-[10px] tracking-widest bg-teal-600 text-white hover:bg-teal-700 shadow-none"
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Check className="mr-2 size-4" />
                )}
                Approve Report
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                className="h-12 rounded-full px-8 font-bold uppercase text-[10px] tracking-widest border-red-200 text-red-600 hover:bg-red-50 shadow-none"
              >
                <X className="mr-2 size-4" />
                Reject
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="h-12 rounded-full px-8 font-bold uppercase text-[10px] tracking-widest border-neutral-100 text-neutral-700 hover:bg-neutral-50 shadow-none"
          >
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Section */}
          <motion.div
            variants={item}
            className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-10 space-y-8"
          >
            <div className="flex items-center justify-between border-b border-neutral-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-neutral-100 rounded-full flex items-center justify-center text-black border border-neutral-100">
                  <Home className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                    Property Details
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {report.property?.address_type || "Property"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                <CheckCircle2 className="size-3.5" />
                Ownership Verified
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">
                  Street Address
                </Label>
                <p className="text-lg text-neutral-900 font-medium pl-1">
                  {[report.property?.address_line_1, report.property?.address_line_2]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">
                  Location
                </Label>
                <p className="text-lg text-neutral-900 font-medium pl-1 uppercase">
                  {report.property?.city}, {report.property?.postcode}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">
                  Address Type
                </Label>
                <p className="text-lg text-neutral-900 font-medium pl-1 capitalize">
                  {report.property?.address_type || "N/A"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">
                  Ownership
                </Label>
                <p className="text-lg text-neutral-900 font-medium pl-1 capitalize">
                  {report.property?.property_type || "N/A"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Rooms/Assessment Section */}
          <motion.div variants={item} className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Room Assessments
              </h3>
              <div className="flex items-center gap-2 text-neutral-400 font-bold uppercase text-[10px] tracking-widest">
                <Sparkles className="size-3.5" />
                AI Powered Analysis
              </div>
            </div>

            <div className="space-y-4">
              {report.property?.room_details && report.property.room_details.length > 0 ? (
                report.property.room_details.map((room, index) => (
                  <div
                    key={room.id}
                    className="bg-white border border-neutral-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-neutral-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 border border-neutral-100 overflow-hidden shrink-0">
                        {room.media && room.media[0]?.url ? (
                          <img
                            src={getImageUrl(room.media[0].url)}
                            alt={room.room_name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="italic font-serif font-bold text-lg">
                            {room.room_name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 capitalize">
                          {room.room_name}
                        </h4>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex flex-wrap items-center gap-2 mt-1">
                          <span>
                            Scan:{" "}
                            <span
                              className={
                                room.scan_status === "failed"
                                  ? "text-red-500"
                                  : room.scan_status === "pending"
                                  ? "text-blue-500"
                                  : "text-emerald-600"
                              }
                            >
                              {room.scan_status}
                            </span>
                          </span>
                          <span className="size-1 bg-neutral-200 rounded-full" />
                          <span>
                            {(
                              room.dimensions?.floor_area ||
                              (room.dimensions?.width &&
                              room.dimensions?.length
                                ? room.dimensions.width * room.dimensions.length
                                : 0)
                            ).toFixed(1)}
                            m²
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">
                          Estimated Cost
                        </p>
                        <p className="text-xl font-bold text-neutral-900">
                          £
                          {(
                            (room.dimensions?.floor_area || 0) * 125
                          ).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 rounded-full border border-neutral-100 hover:bg-neutral-50 text-neutral-400"
                      >
                        <Camera className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 border-2 border-dashed border-neutral-100 rounded-3xl text-center bg-neutral-50/30">
                  <p className="text-neutral-400 text-sm font-serif italic">
                    No room assessments attached to this report.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Assessment Summary */}
          <motion.div
            variants={item}
            className="bg-neutral-900 text-white rounded-3xl p-10 space-y-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Sparkles className="size-48" />
            </div>

            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="size-12 bg-white/10 rounded-full flex items-center justify-center">
                <Sparkles className="size-6 text-white/50" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Cost Assessment</h3>
                <p className="text-sm text-white/50">
                  Auto-calculated repair estimates
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Materials
                </p>
                <p className="text-2xl font-semibold">
                  £{report.materials_total?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Labour
                </p>
                <p className="text-2xl font-semibold">
                  £{report.labour_total?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  VAT (20%)
                </p>
                <p className="text-2xl font-semibold">
                  £{report.vat_amount?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Total
                </p>
                <p className="text-3xl font-bold text-white">
                  £{report.total_cost?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Report Info */}
          <motion.div
            variants={item}
            className="bg-white border border-neutral-100 rounded-3xl p-6 space-y-6"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              Report Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Report ID</span>
                <span className="text-sm font-bold text-neutral-900">
                  #{report.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Created</span>
                <span className="text-sm font-medium text-neutral-900">
                  {formatDate(report.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Last Updated</span>
                <span className="text-sm font-medium text-neutral-900">
                  {formatDate(report.updated_at)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Property Owner */}
          <motion.div
            variants={item}
            className="bg-white border border-neutral-100 rounded-3xl p-6 space-y-6"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              Property Owner
            </h3>
            <div className="flex items-center gap-4">
              <div className="size-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 font-bold">
                {report.property?.address_type?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-bold text-neutral-900">
                  {report.property?.address_type || "Property Owner"}
                </p>
                <p className="text-sm text-neutral-500">Homeowner</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          {report.status === "submitted" && (
            <motion.div
              variants={item}
              className="bg-blue-50 border border-blue-100 rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-blue-600" />
                <h4 className="font-bold text-blue-900">Pending Review</h4>
              </div>
              <p className="text-sm text-blue-800/80">
                This report is awaiting your review. You can approve it to notify
                eligible builders or reject it with feedback.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 h-10 rounded-full font-bold uppercase text-[10px] tracking-widest bg-teal-600 text-white hover:bg-teal-700 shadow-none"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  className="flex-1 h-10 rounded-full font-bold uppercase text-[10px] tracking-widest border-red-200 text-red-600 hover:bg-red-50 shadow-none"
                >
                  Reject
                </Button>
              </div>
            </motion.div>
          )}

          {/* Quick Links */}
          <motion.div
            variants={item}
            className="bg-white border border-neutral-100 rounded-3xl p-6 space-y-3"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">
              Quick Actions
            </h3>
            <Button
              variant="outline"
              className="w-full justify-start h-12 rounded-full border-neutral-100 text-neutral-700 font-medium shadow-none hover:bg-neutral-50"
            >
              <MessageSquare className="mr-3 size-4" />
              Contact Property Owner
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 rounded-full border-neutral-100 text-neutral-700 font-medium shadow-none hover:bg-neutral-50"
            >
              <FileCheck className="mr-3 size-4" />
              View Audit Trail
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <XCircle className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Reject Report
                </h3>
                <p className="text-sm text-neutral-500">
                  {report.reference_number || `RPT-${report.id}`}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full h-32 p-4 rounded-xl border border-neutral-100 focus:border-red-400 focus:ring-red-400 resize-none text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                }}
                className="flex-1 h-12 rounded-full font-bold uppercase text-[10px] tracking-widest border-neutral-100 shadow-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 h-12 rounded-full font-bold uppercase text-[10px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-none"
              >
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
