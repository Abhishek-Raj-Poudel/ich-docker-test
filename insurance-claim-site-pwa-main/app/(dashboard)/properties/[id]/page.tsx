"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  MapPin,
  X,
  ArrowLeft,
  Loader2,
  Settings,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  ExternalLink,
  Info,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyForm } from "@/components/property/property-form";
import { 
  Property, 
  getProperty, 
  deleteProperty, 
  uploadOwnershipProof 
} from "@/lib/property";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";

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
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
};

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading ownership proof...");

    try {
      const result = await uploadOwnershipProof(Number(id), file);
      if (result.success) {
        toast.success(result.message || "Document uploaded successfully", { 
          id: toastId,
          description: "Our team will review your proof shortly."
        });
      } else {
        toast.error(result.message || "Failed to upload document", { id: toastId });
      }
    } catch {
      toast.error("An unexpected error occurred during upload.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const result = await deleteProperty(Number(id));
      if (result.success) {
        router.push("/properties");
      } else {
        setError(result.message || "Failed to delete property");
        setShowDeleteDialog(false);
      }
    } catch {
      setError("An unexpected error occurred while deleting the property.");
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const result = await getProperty(Number(id));
        if (result.success && result.data) {
          setProperty(result.data);
        } else {
          setError(result.message || "Failed to fetch property details");
        }
      } catch {
        setError(
          "An unexpected error occurred while fetching property details.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-neutral-500 font-medium animate-pulse">
          Loading property details...
        </p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-neutral-900">
            Property Not Found
          </h1>
          <p className="text-neutral-500">
            {error ||
              "The property you're looking for doesn't exist or you don't have permission to view it."}
          </p>
        </div>
        <Button
          asChild
          className="bg-primary text-white rounded-full px-8 h-12 font-bold uppercase text-xs tracking-widest"
        >
          <Link href="/properties">Back to Properties</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-12 pb-24 px-4 md:px-0"
    >
      {/* Breadcrumb & Actions */}
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-4">
          <Link
            href="/properties"
            className="group flex items-center text-xs font-bold text-neutral-400 hover:text-primary transition-all uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />{" "}
            Back to Properties
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif">
              Property Details
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-primary" /> {property.postcode}
              </span>
              <span className="size-1.5 bg-neutral-200 rounded-full" />
              <span className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-blue-600">
                {property.property_type}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="h-12 px-6 rounded-full border-neutral-100 text-neutral-900 font-bold uppercase text-[10px] tracking-widest hover:bg-neutral-50 gap-2 flex-1 md:flex-none"
          >
            <Settings className="size-4" /> Edit
          </Button>
          <Button className="h-12 px-8 rounded-full bg-primary text-white font-bold uppercase text-[10px] tracking-widest shadow-none hover:brightness-110 gap-2 flex-1 md:flex-none">
            <FileText className="size-4" /> Report
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-neutral-100 rounded-xl p-8 md:p-10 space-y-8"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-8">
                  <h2 className="text-2xl font-serif text-neutral-900">
                    Edit Property Details
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="h-10 px-6 rounded-full text-neutral-500 font-bold uppercase text-[10px] tracking-widest hover:bg-neutral-50"
                  >
                    <X className="mr-2 size-4" /> Cancel
                  </Button>
                </div>
                <PropertyForm
                  initialData={property}
                  onSuccess={(updated) => {
                    setProperty(updated);
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="property-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Property Card */}
                <motion.div
                  variants={item}
                  className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-none"
                >
                  <div className="p-8 md:p-10 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="space-y-8 flex-1">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                            Main Address
                          </Label>
                          <div className="space-y-1">
                            <p className="text-3xl font-medium text-neutral-900 tracking-tight">
                              {property.address_line}
                            </p>
                          </div>
                        </div>

                          <div className="grid grid-cols-2 gap-x-12 gap-y-8 border-t border-neutral-50 pt-8">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                              Postcode
                            </Label>
                            <p className="text-base font-medium text-neutral-900 uppercase">
                              {property.postcode}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                              Ownership Status
                            </Label>
                            <p className="text-base font-medium text-neutral-900 capitalize">
                              {property.property_type === "owned"
                                ? "Owner Occupied"
                                : "Rented/Tenanted"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                              Latitude
                            </Label>
                            <p className="text-base font-medium text-neutral-900">
                              {property.latitude?.toFixed(6) || "Not set"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                              Longitude
                            </Label>
                            <p className="text-base font-medium text-neutral-900">
                              {property.longitude?.toFixed(6) || "Not set"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                              Registration Date
                            </Label>
                            <p className="text-base font-medium text-neutral-900">
                              {new Date(property.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                              Claim History
                            </Label>
                            <p className="text-base font-medium text-neutral-900">
                              0 Active Claims
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 hidden md:block">
                        <div className="size-40 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-200 group-hover:text-primary/20 transition-colors">
                          <Home className="size-20" />
                        </div>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div
                      className={cn(
                        "p-6 rounded-xl border flex items-start gap-5 transition-colors",
                        property.ownership_verified
                          ? "bg-teal-50 border-teal-100 text-teal-900"
                          : "bg-orange-50 border-orange-100 text-orange-900",
                      )}
                    >
                      <div
                        className={cn(
                          "size-12 rounded-full flex items-center justify-center shrink-0 border",
                          property.ownership_verified
                            ? "bg-white text-teal-600 border-teal-100"
                            : "bg-white text-orange-500 border-orange-100",
                        )}
                      >
                        {property.ownership_verified ? (
                          <ShieldCheck className="size-6" />
                        ) : (
                          <Info className="size-6" />
                        )}
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <h4 className="text-base font-bold tracking-tight">
                          {property.ownership_verified
                            ? "Verification Confirmed"
                            : "Authentication Pending"}
                        </h4>
                        <p className="text-sm leading-relaxed opacity-80">
                          {property.ownership_verified
                            ? "This property has been successfully cross-referenced with Land Registry records via our secure API. You are eligible for expedited claim processing and lower deductible pathways."
                            : "Our team is currently verifying your ownership documents. This usually takes 24-48 hours. Preliminary claims can still be initiated during this window."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="bg-neutral-50/50 border-t border-neutral-100 px-8 py-5 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                      System Reference: #PRP-
                      {property.id.toString().padStart(5, "0")}
                    </span>
                    <Button
                      variant="ghost"
                      className="text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-white gap-2 transition-all hover:gap-3"
                    >
                      Update Records <ExternalLink className="size-3" />
                    </Button>
                  </div>
                </motion.div>

                {/* Additional Sections Grid */}
                <motion.div
                  variants={item}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-white border border-neutral-100 rounded-xl p-8 space-y-6 group hover:border-primary/20 transition-all">
                    <div className="size-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Building2 className="size-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium text-neutral-900">
                        Coverage Details
                      </h3>
                      <p className="text-sm text-neutral-500 leading-relaxed">
                        Active protection for structural integrity, accidental
                        damage, and legal liability coverage.
                      </p>
                    </div>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary font-bold uppercase text-[10px] tracking-widest hover:no-underline hover:opacity-70 transition-all"
                    >
                      View Full Policy
                    </Button>
                  </div>

                  <div className="bg-white border border-neutral-100 rounded-xl p-8 space-y-6 group hover:border-primary/20 transition-all">
                    <div className="size-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Calendar className="size-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium text-neutral-900">
                        Maintenance Log
                      </h3>
                      <p className="text-sm text-neutral-500 leading-relaxed">
                        Keep track of property inspections, repairs, and
                        enhancements to maintain asset value.
                      </p>
                    </div>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary font-bold uppercase text-[10px] tracking-widest hover:no-underline hover:opacity-70 transition-all"
                    >
                      Add History
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <motion.div
            variants={item}
            className="bg-primary text-white rounded-xl p-8 space-y-8 relative overflow-hidden group"
          >
            {/* Abstract background element */}
            <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full blur-3xl transition-all group-hover:bg-white/10" />

            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-serif font-light leading-snug">
                Expert Claims Assistance
              </h3>
              <p className="text-sm text-primary-foreground/70 leading-relaxed">
                Our dedicated handlers are ready to manage your claim from start
                to finish.
              </p>
            </div>

            <Button className="w-full bg-secondary text-primary-900 hover:brightness-110 h-14 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-none border-none relative z-10 transition-transform active:scale-95">
              Initiate New Claim
            </Button>

            <div className="flex items-center justify-between relative z-10 pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full border-2 border-primary bg-neutral-200"
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/40">
                24/7 Priority Support
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white border border-neutral-100 rounded-xl p-8 space-y-8"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              Property Management
            </h3>
            <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full justify-start h-14 px-6 rounded-full border-neutral-100 text-neutral-600 hover:text-primary hover:bg-neutral-50 hover:border-primary/20 gap-4 font-medium text-sm transition-all group/btn"
                >
                  {isUploading ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : (
                    <FileText className="size-5 text-neutral-300 group-hover/btn:text-primary" />
                  )}
                  <span>{isUploading ? "Uploading..." : "Upload Documents"}</span>
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              <Button
                variant="outline"
                className="w-full justify-start h-14 px-6 rounded-full border-neutral-100 text-neutral-600 hover:text-primary hover:bg-neutral-50 hover:border-primary/20 gap-4 font-medium text-sm transition-all group/btn"
              >
                <ShieldCheck className="size-5 text-neutral-300 group-hover/btn:text-primary" />
                <span>Policy Documents</span>
              </Button>
              <div className="pt-4 mt-4 border-t border-neutral-50">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full justify-start h-14 px-6 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 gap-4 font-medium text-sm transition-all"
                >
                  <Trash2 className="size-5" />
                  <span>Remove Property</span>
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="p-8 bg-neutral-50 rounded-xl space-y-4 border border-neutral-100"
          >
            <div className="flex items-center gap-3 text-neutral-400">
              <Info className="size-5" />
              <h4 className="text-xs font-bold uppercase tracking-widest">
                Insurance Tip
              </h4>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed italic">
              &quot;Regular maintenance photographs can significantly expedite water
              damage and structural claims by proving pre-incident condition.&quot;
            </p>
          </motion.div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          // size="sm"
          className="max-w-sm rounded-xl border border-neutral-100 shadow-none p-8"
        >
          <AlertDialogHeader className="text-center sm:text-center flex flex-col items-center">
            <AlertDialogMedia className="mx-auto rounded-xl border border-red-100 bg-red-50/50 size-20 mb-4">
              <Trash2 className="size-10 text-red-500" />
            </AlertDialogMedia>
            <div className="space-y-4">
              <AlertDialogTitle className="text-2xl font-serif font-light text-neutral-900 tracking-tight">
                Delete Property?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-neutral-500 leading-relaxed px-4">
                This will permanently remove{" "}
                <span className="text-neutral-900 font-medium">
                  &quot;{property.address_line_1}&quot;
                </span>{" "}
                and all its records. This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3 mt-8">
            <AlertDialogCancel className="h-14 rounded-full border-neutral-100 bg-white text-neutral-600 font-bold uppercase text-[10px] tracking-widest hover:bg-neutral-50 hover:text-neutral-900 transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-14 rounded-full bg-red-500 text-white hover:bg-red-600 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-none border-none transition-all active:scale-[0.98]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" /> Yes
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
