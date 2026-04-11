"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Loader2,
  Eye,
  MapPin,
  Calendar,
  User,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { listReports, Report, approveReport, rejectReport } from "@/lib/report";
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

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchReports = async () => {
    setIsLoading(true);
    const result = await listReports();
    if (result.success && result.data) {
      setReports(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleApprove = async (reportId: number) => {
    setActionLoading(reportId);
    const result = await approveReport(reportId);
    if (result.success) {
      toast.success("Report approved successfully");
      fetchReports();
    } else {
      toast.error(result.message || "Failed to approve report");
    }
    setActionLoading(null);
  };

  const handleReject = async (reportId: number) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActionLoading(reportId);
    const result = await rejectReport(reportId, rejectReason);
    if (result.success) {
      toast.success("Report rejected");
      setSelectedReport(null);
      setRejectReason("");
      fetchReports();
    } else {
      toast.error(result.message || "Failed to reject report");
    }
    setActionLoading(null);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchQuery === "" ||
      report.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.property?.address_line_1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.property?.postcode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingReports = reports.filter((r) => r.status === "submitted");
  const approvedReports = reports.filter((r) => r.status === "approved");
  const rejectedReports = reports.filter((r) => r.status === "rejected");

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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <Link
            href="/admin"
            className="group flex items-center text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-all uppercase tracking-[0.2em] w-fit"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif">
            Reports & Claims
          </h1>
          <p className="text-base md:text-lg font-normal text-neutral-500 max-w-2xl">
            Review and approve submitted insurance claims and repair reports.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-neutral-100 p-3 rounded-full shrink-0">
          <div className="size-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 leading-none">
              Pending Review
            </p>
            <p className="text-sm font-bold text-neutral-900 mt-1">
              {pendingReports.length} Reports
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "All Reports", value: reports.length, color: "bg-neutral-100 text-neutral-600" },
          { label: "Pending", value: pendingReports.length, color: "bg-blue-50 text-blue-600" },
          { label: "Approved", value: approvedReports.length, color: "bg-teal-50 text-teal-600" },
          { label: "Rejected", value: rejectedReports.length, color: "bg-red-50 text-red-600" },
        ].map((stat, i) => (
          <div
            key={i}
            className={cn(
              "bg-white border border-neutral-100 rounded-full p-4 flex items-center justify-between",
              stat.color
            )}
          >
            <span className="text-xs font-bold uppercase tracking-widest">{stat.label}</span>
            <span className="text-xl font-bold">{stat.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
          <Input
            placeholder="Search by reference, address, or postcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-full border-neutral-100 bg-white focus-visible:bg-white focus-visible:border-red-400 transition-all shadow-none ring-offset-0 focus-visible:ring-0 text-base"
          />
        </div>
        <div className="flex gap-2">
          {["all", "submitted", "approved", "rejected", "draft"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "h-12 rounded-full px-6 font-medium text-sm capitalize",
                statusFilter === status
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "border-neutral-100 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {status === "all" ? "All" : status}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Reports List */}
      <motion.div variants={item} className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-10 animate-spin text-red-600" />
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-neutral-100 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-red-200 hover:bg-red-50/5"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="size-14 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0">
                  <FileText className="size-7" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-neutral-900 text-lg">
                      {report.reference_number || `RPT-${report.id}`}
                    </span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5",
                        getStatusStyles(report.status)
                      )}
                    >
                      {getStatusIcon(report.status)}
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin className="size-4 text-neutral-400" />
                    <span className="text-sm">
                      {report.property?.address_line_1}, {report.property?.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDate(report.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {report.property?.address_type || "Property"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 lg:gap-10">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Total Estimate
                  </p>
                  <p className="text-2xl font-semibold text-neutral-900">
                    £{report.total_cost?.toLocaleString() || "0"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {report.status === "submitted" ? (
                    <>
                      <Button
                        onClick={() => handleApprove(report.id)}
                        disabled={actionLoading === report.id}
                        className="h-12 rounded-full px-6 font-bold uppercase text-[10px] tracking-widest bg-teal-600 text-white hover:bg-teal-700 shadow-none"
                      >
                        {actionLoading === report.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="mr-2 size-4" /> Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                        className="h-12 rounded-full px-6 font-bold uppercase text-[10px] tracking-widest border-red-200 text-red-600 hover:bg-red-50 shadow-none"
                      >
                        <X className="mr-2 size-4" /> Reject
                      </Button>
                    </>
                  ) : (
                    <Link href={`/admin/reports/${report.id}`}>
                      <Button
                        variant="outline"
                        className="h-12 rounded-full px-6 font-bold uppercase text-[10px] tracking-widest border-neutral-100 text-neutral-700 hover:bg-neutral-50 shadow-none"
                      >
                        <Eye className="mr-2 size-4" /> View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center bg-white border border-neutral-100 border-dashed rounded-3xl">
            <FileText className="size-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 font-serif italic text-lg">
              No reports found matching your criteria.
            </p>
          </div>
        )}
      </motion.div>

      {/* Reject Dialog */}
      {selectedReport && (
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
                <h3 className="text-xl font-bold text-neutral-900">Reject Report</h3>
                <p className="text-sm text-neutral-500">
                  {selectedReport.reference_number || `RPT-${selectedReport.id}`}
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
                  setSelectedReport(null);
                  setRejectReason("");
                }}
                className="flex-1 h-12 rounded-full font-bold uppercase text-[10px] tracking-widest border-neutral-100 shadow-none"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(selectedReport.id)}
                disabled={actionLoading === selectedReport.id}
                className="flex-1 h-12 rounded-full font-bold uppercase text-[10px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-none"
              >
                {actionLoading === selectedReport.id ? (
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
