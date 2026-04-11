"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Download,
  FileText,
  Filter,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chat } from "@/components/chat/Chat";
import {
  AcceptJobDialog,
  AddProgressDialog,
  AffectedAreasSection,
  AudienceContextSection,
  ClaimDetailHeader,
  ClaimDossierSection,
  ClaimsAudience,
  ClaimRecord,
  DetailPageNotFound,
  EstimateSummarySection,
  item,
  JobStatusSection,
  MaterialEditDialog,
  PropertyDetailsSection,
  ReviewDialog,
  ReviewPromptSection,
  RoomMaterialRow,
  SubmittedReviewSection,
  SupportBannerSection,
} from "@/components/claims/claim-detail-sections";
import { cn } from "@/lib/utils";
import { approveReport, deleteReport, rejectReport, Report, ReportRoomDetail } from "@/lib/report";
import { acceptJob, addProgressUpdate, getJob, getJobArchiveUrl, getJobInvoiceUrl, Job, listJobs, signOffJob, updateJob } from "@/lib/job";
import { updateRoom } from "@/lib/room";
import { getJobReview, Review, submitReview } from "@/lib/review";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function getImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  return `${API_URL}${url}`;
}

function nowIso() {
  return new Date().toISOString();
}

function getJobReportUrl(job?: Job) {
  if (!job) return "";

  const reportMediaUrl = job.report_media?.file;
  if (reportMediaUrl) {
    return getImageUrl(reportMediaUrl);
  }

  if (job.report_path) {
    return getImageUrl(job.report_path);
  }

  const inlineReportUrl = job.report?.media?.[0]?.url;
  if (inlineReportUrl) {
    return getImageUrl(inlineReportUrl);
  }

  return "/report.pdf";
}

function getStatusDisplay(status: string) {
  switch (status) {
    case "submitted":
      return "In Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "draft":
      return "Draft";
    case "completed":
      return "Completed";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "approved":
      return "bg-teal-50 text-teal-600 border-teal-100";
    case "submitted":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "rejected":
      return "bg-red-50 text-red-600 border-red-100";
    case "draft":
      return "bg-neutral-50 text-neutral-500 border-neutral-100";
    case "completed":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    default:
      return "bg-neutral-50 text-neutral-500 border-neutral-100";
  }
}

function getJobStatusStyles(status: string | undefined) {
  switch (status) {
    case "accepted":
      return "bg-teal-50 text-teal-600 border-teal-100";
    case "pending":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "completed":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "in_progress":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "site_visit_booked":
      return "bg-purple-50 text-purple-600 border-purple-100";
    default:
      return "bg-neutral-50 text-neutral-500 border-neutral-100";
  }
}

function formatJobStatus(status: string | undefined) {
  if (!status) return "Not Started";
  if (status === "site_visit_booked") return "Site Visit Booked";
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
}

function getRoomBaseRepairEstimate(room: ReportRoomDetail) {
  const floorArea = typeof room?.dimensions?.floor_area === "number" ? room.dimensions.floor_area : 0;
  const damageArea = room?.damages?.reduce((total, damage) => total + (typeof damage.area === "number" ? damage.area : 0), 0) ?? 0;

  const labourBase = floorArea * 95;
  const damageBase = damageArea * 55;
  const calloutBase = (room?.damages?.length || 0) * 85;

  return Math.round(labourBase + damageBase + calloutBase);
}

function getRoomRepairEstimate(room: ReportRoomDetail, materials?: RoomMaterialRow[]) {
  const materialTotal = (materials || []).reduce((sum, material) => sum + material.price, 0);
  return getRoomBaseRepairEstimate(room) + materialTotal;
}

function getRoomSuggestedMaterials(room: ReportRoomDetail) {
  const damageTypes = new Set((room?.damages || []).map((damage) => damage.type?.toLowerCase()).filter(Boolean));
  const materials = new Set<string>();

  materials.add("Protective sheeting");
  materials.add("Primer and paint");

  if (damageTypes.has("water")) {
    materials.add("Moisture-resistant plasterboard");
    materials.add("Joint compound");
    materials.add("Anti-mould treatment");
  }

  if (damageTypes.has("fire")) {
    materials.add("Smoke-seal primer");
    materials.add("Replacement skirting");
  }

  if (damageTypes.has("impact")) {
    materials.add("Filler compound");
    materials.add("Replacement plasterboard patch");
  }

  if (damageTypes.has("storm")) {
    materials.add("Sealant");
    materials.add("Insulation rolls");
  }

  if (damageTypes.has("subsidence")) {
    materials.add("Crack repair mesh");
    materials.add("Flexible filler");
  }

  if (room?.room_name?.toLowerCase().includes("bath")) {
    materials.add("Silicone sealant");
    materials.add("Waterproof membrane");
  }

  if (room?.room_name?.toLowerCase().includes("kitchen")) {
    materials.add("Cabinet end panels");
    materials.add("Tile adhesive");
  }

  return Array.from(materials).slice(0, 6);
}

function getRoomMaterialRows(room: ReportRoomDetail): RoomMaterialRow[] {
  const estimate = getRoomBaseRepairEstimate(room);
  const materials = getRoomSuggestedMaterials(room);

  if (materials.length === 0) {
    return [];
  }

  const weightedRows = materials.map((name, index) => {
    const baseWeight = Math.max(materials.length - index, 1);
    return { name, weight: baseWeight };
  });

  const totalWeight = weightedRows.reduce((sum, item) => sum + item.weight, 0);

  return weightedRows.map((item, index) => {
    const proportionalPrice = Math.round((estimate * 0.42 * item.weight) / totalWeight);

    return {
      id: `${room.id}-${index}-${item.name}`,
      name: item.name,
      price: proportionalPrice,
    };
  });
}

function getAudienceCopy(audience: ClaimsAudience) {
  if (audience === "builder") {
    return {
      title: "Claims",
      description: "Track assigned claim scopes with the same structure the client and handler see.",
      primaryHref: "/jobs",
      primaryLabel: "View Jobs",
      secondaryLabel: "Assigned Projects",
    };
  }
  if (audience === "handler") {
    return {
      title: "Claims",
      description: "Review claim intake, compare estimates, and move work forward from one queue.",
      primaryHref: "",
      primaryLabel: "",
      secondaryLabel: "Processing Queue",
    };
  }
  return {
    title: "Claims",
    description: "Manage your damage reports and follow the exact same claim journey the team sees.",
    primaryHref: "/scan",
    primaryLabel: "New Claim",
    secondaryLabel: "My Claims",
  };
}

function hasChat(job?: Job) {
  return Boolean(job && ["accepted", "in_progress", "completed", "site_visit_booked"].includes(job.status));
}

function mapJobStatusToClaimStatus(status: Job["status"]): Report["status"] {
  switch (status) {
    case "completed":
      return "completed";
    case "accepted":
    case "site_visit_booked":
    case "in_progress":
      return "approved";
    case "pending":
    case "not_started":
      return "submitted";
    default:
      return "submitted";
  }
}

function mapJobToClaim(job: Job): ClaimRecord {
  const totalCost = job.contract_amount ?? job.total_cost ?? 0;
  const derivedStatus = job.report?.status || mapJobStatusToClaimStatus(job.status);

  return {
    id: job.id,
    source: "job",
    reference_number: job.report?.reference_number || `JOB-${job.id}`,
    total_cost: totalCost,
    vat_amount: 0,
    labour_total: 0,
    materials_total: 0,
    status: derivedStatus,
    job,
    property: job.report?.property
      ? {
        ...job.report.property,
        room_details: job.report.property.room_details ?? [],
      }
      : undefined,
    created_at: job.created_at,
    updated_at: job.updated_at,
  };
}

export function ClaimsListExperience({
  audience,
  detailBasePath,
}: {
  audience: ClaimsAudience;
  detailBasePath: string;
}) {
  const copy = getAudienceCopy(audience);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [claimToDelete, setClaimToDelete] = useState<ClaimRecord | null>(null);

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listJobs();
      if (result.success && result.data) {
        setClaims(result.data.map(mapJobToClaim));
      } else {
        toast.error(result.message || "Failed to load claims");
      }
    } catch {
      toast.error("An error occurred while fetching claims");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClaims();
  }, [fetchClaims]);

  const filteredClaims = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return claims;
    return claims.filter((claim) => {
      const haystack = [
        claim.reference_number,
        claim.property?.address_line_1,
        claim.property?.postcode,
        claim.job?.builder?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [claims, query]);

  const counts = useMemo(() => {
    return {
      total: claims.length,
      active: claims.filter((claim) => ["submitted", "approved", "completed"].includes(claim.status)).length,
      withBuilder: claims.filter((claim) => claim.job?.builder).length,
      draft: claims.filter((claim) => claim.status === "draft").length,
    };
  }, [claims]);

  const handleDeleteClaim = useCallback(async (reportId: number) => {
    const result = await deleteReport(reportId);
    if (result.success) {
      toast.success(result.message || "Claim deleted");
      await fetchClaims();
    } else {
      toast.error(result.message || "Failed to delete claim");
    }
  }, [fetchClaims]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8 md:space-y-10">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif">{copy.title}</h1>
          <p className="text-base md:text-lg font-normal text-neutral-500 max-w-2xl">{copy.description}</p>
        </div>
        {copy.primaryHref ? (
          <Link href={copy.primaryHref} className="w-full sm:w-auto">
            <Button size="lg" className="h-12 rounded-full px-8 font-medium gap-3 w-full sm:w-auto bg-primary text-primary-foreground hover:brightness-110 transition-all hover:scale-[1.02]">
              <Plus className="size-5" />
              {copy.primaryLabel}
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="h-12 rounded-full px-8 border-neutral-100 bg-white text-neutral-700 hover:bg-neutral-50 w-full sm:w-auto">
            <Download className="size-4 mr-2" />
            Export
          </Button>
        )}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-100 rounded-3xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{copy.secondaryLabel}</p>
          <p className="text-3xl font-semibold text-neutral-900 mt-2">{counts.total}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-3xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Active</p>
          <p className="text-3xl font-semibold text-neutral-900 mt-2">{counts.active}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-3xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Builder Linked</p>
          <p className="text-3xl font-semibold text-neutral-900 mt-2">{counts.withBuilder}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-3xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Drafts</p>
          <p className="text-3xl font-semibold text-neutral-900 mt-2">{counts.draft}</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by reference, address, postcode, or builder..."
            className="pl-12 h-12 md:h-14 rounded-xl border-neutral-100 bg-white focus-visible:bg-white focus-visible:border-primary transition-all ring-offset-0 focus-visible:ring-0 text-base"
          />
        </div>
        <Button variant="outline" className="h-12 md:h-14 rounded-full border-neutral-100 bg-white font-medium gap-2 px-8 text-neutral-700 hover:bg-neutral-50 transition-all w-full lg:w-auto">
          <Filter className="size-4" />
          All Claims
        </Button>
      </motion.div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white border border-neutral-100 rounded-3xl">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Loading claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="text-center py-20 bg-white border border-neutral-100 rounded-3xl">
            <p className="text-neutral-500 mb-4 font-serif text-lg italic">No claims matched your search.</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <motion.div key={claim.id} variants={item} className="pt-10 md:pt-5 bg-white border border-neutral-100 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-black hover:bg-neutral-50/30 group">
              <div className="flex items-start md:items-center gap-4 md:gap-6">
                <div className="hidden md:flex size-14 md:size-20 bg-neutral-50 rounded-2xl items-center justify-center text-neutral-400 border border-neutral-100 group-hover:bg-black group-hover:text-white transition-all duration-500 shrink-0">
                  <FileText className="size-7 md:size-10" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="font-bold text-neutral-900 text-base md:text-lg">{claim.reference_number || `CLM-${claim.id}`}</span>
                    <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border", getStatusStyles(claim.status))}>
                      {getStatusDisplay(claim.status)}
                    </span>
                    {claim.job?.status ? (
                      <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border", getJobStatusStyles(claim.job.status))}>
                        {formatJobStatus(claim.job.status)}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="font-medium text-neutral-900 flex items-start md:items-center gap-2 group-hover:text-primary transition-colors text-base md:text-lg leading-snug">
                    <MapPin className="size-4 text-neutral-400 mt-1 md:mt-0 shrink-0" />
                    {claim.property
                      ? [claim.property.address_line_1, claim.property.postcode]
                        .filter(Boolean)
                        .join(", ")
                      : `Property #${claim.id}`}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                    <span>{new Date(claim.created_at).toLocaleDateString("en-GB")}</span>
                    <span className="size-1 bg-neutral-300 rounded-full" />
                    <span>Estimate £{claim.total_cost?.toLocaleString() || "0"}</span>
                    {claim.job?.builder?.name ? (
                      <>
                        <span className="size-1 bg-neutral-300 rounded-full" />
                        <span>{audience === "handler" ? `Builder ${claim.job.builder.name}` : "Builder Assigned"}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 ml-0 md:ml-auto w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">
                    {audience === "handler" ? "Scope Value" : audience === "builder" ? "Contract Value" : "Claim Value"}
                  </p>
                  <p className="text-xl md:text-2xl font-semibold text-neutral-900">£{(claim.job?.contract_amount ?? claim.total_cost ?? 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  {audience === "homeowner" && claim.job?.report_id ? (
                    <Button
                      variant="outline"
                      onClick={() => setClaimToDelete(claim)}
                      className="h-10 md:h-12 px-4 md:px-5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-2xl border-red-100 bg-white text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                  <Link href={`${detailBasePath}/${claim.id}`} className="shrink-0">
                    <Button variant="outline" className="h-10 md:h-12 px-6 md:px-8 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-2xl border-neutral-100 bg-white text-neutral-900 hover:bg-black hover:text-white hover:border-black transition-all duration-300 flex items-center gap-2 md:gap-3 group/btn">
                      Details
                      <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog open={Boolean(claimToDelete)} onOpenChange={(open) => !open && setClaimToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete claim?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the claim from local dev data for both homeowner and builder views. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const reportId = claimToDelete?.job?.report_id;
                if (reportId) {
                  void handleDeleteClaim(reportId);
                }
                setClaimToDelete(null);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Claim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export function ClaimDetailExperience({
  audience,
  backHref,
  backLabel = "Back to Claims",
}: {
  audience: ClaimsAudience;
  backHref: string;
  backLabel?: string;
}) {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<ClaimRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showAddProgressDialog, setShowAddProgressDialog] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [progressMaterials, setProgressMaterials] = useState<Array<{ id: string; name: string; qty: number; cost: number }>>([
    { id: "1", name: "", qty: 1, cost: 0 },
  ]);
  const [lightboxState, setLightboxState] = useState<{
    slides: Array<{ src: string; alt?: string }>;
    index: number;
  } | null>(null);
  const [roomMediaDrafts, setRoomMediaDrafts] = useState<
    Record<
      number,
      Array<{
        id: number;
        url: string;
        label?: string;
        created_at?: string;
        estimated_material_cost?: number;
      }>
    >
  >({});
  const [roomMaterialDrafts, setRoomMaterialDrafts] = useState<Record<number, RoomMaterialRow[]>>({});
  const [editingMaterial, setEditingMaterial] = useState<{ roomId: number; material: RoomMaterialRow } | null>(null);

  const fetchClaimDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getJob(parseInt(claimId, 10));
      if (result.success && result.data) {
        const mappedClaim = mapJobToClaim(result.data);
        setClaim(mappedClaim);
        setRoomMediaDrafts(
          Object.fromEntries(
            (mappedClaim.property?.room_details || []).map((room) => [room.id, [...(room.media || [])]]),
          ),
        );
        setRoomMaterialDrafts(
          Object.fromEntries(
            (mappedClaim.property?.room_details || []).map((room) => [room.id, getRoomMaterialRows(room)]),
          ),
        );
        if (result.data.id) {
          const reviewResult = await getJobReview(result.data.id);
          if (reviewResult.success && reviewResult.data) {
            setExistingReview(reviewResult.data);
          } else {
            setExistingReview(null);
          }
        }
      } else {
        toast.error(result.message || "Failed to load claim details");
      }
    } catch {
      toast.error("An error occurred while fetching details");
    } finally {
      setIsLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    if (claimId) {
      void fetchClaimDetails();
    }
  }, [claimId, fetchClaimDetails]);

  const job = claim?.job as Job | undefined;
  const isJobBackedClaim = claim?.source === "job";
  const claimSummary = useMemo(() => {
    if (!claim?.property?.room_details?.length) {
      return {
        materialsTotal: claim?.materials_total || 0,
        totalCost: claim?.total_cost || 0,
      };
    }

    const materialsTotal = claim.property.room_details.reduce((sum, room) => {
      const roomMaterials = roomMaterialDrafts[room.id] || getRoomMaterialRows(room);
      return sum + roomMaterials.reduce((roomSum, material) => roomSum + material.price, 0);
    }, 0);

    const baseWithoutMaterials = (claim.total_cost || 0) - (claim.materials_total || 0);

    return {
      materialsTotal,
      totalCost: Math.max(baseWithoutMaterials + materialsTotal, 0),
    };
  }, [claim, roomMaterialDrafts]);
  const canChat = hasChat(job);
  const canAccept =
    audience === "builder" &&
    Boolean(job?.id) &&
    Boolean(job?.status && ["not_started", "pending"].includes(job.status));
  const canAddProgress =
    audience === "builder" &&
    Boolean(job?.id) &&
    Boolean(job?.status && ["accepted", "site_visit_booked", "in_progress"].includes(job.status));
  const canSignOff = audience === "homeowner" && job?.status === "completed" && Boolean(job.final_invoice_amount);
  const canReview = audience === "homeowner" && job?.status === "completed" && !existingReview;
  const canDelete = audience === "homeowner" && Boolean(job?.report_id);
  const canDownloadPdf = Boolean(claim?.id);
  const canEditRoomEvidence =
    audience === "homeowner" ||
    (audience === "builder" &&
      Boolean(job?.status && ["accepted", "site_visit_booked", "in_progress", "completed"].includes(job.status)));
  const canManageMaterials =
    audience === "builder" &&
    Boolean(job?.status && ["accepted", "site_visit_booked", "in_progress", "completed"].includes(job.status));

  const handleSignOff = async () => {
    if (!job?.id) return;
    setIsActionLoading(true);
    const result = await signOffJob(job.id);
    if (result.success) {
      toast.success("Work signed off successfully");
      await fetchClaimDetails();
    } else {
      toast.error(result.message || "Failed to sign off");
    }
    setIsActionLoading(false);
  };

  const handleAcceptWithVisitDate = async () => {
    if (!job?.id || !visitDate) return;

    setIsActionLoading(true);

    const accepted = await acceptJob(job.id);
    if (!accepted.success) {
      toast.error(accepted.message || "Failed to accept job");
      setIsActionLoading(false);
      return;
    }

    const scheduledVisitAt = new Date(`${visitDate}T09:00:00`).toISOString();
    const updated = await updateJob(job.id, {
      status: "site_visit_booked",
      site_visit_scheduled_at: scheduledVisitAt,
      notes: `Site visit booked for ${visitDate}.`,
    });

    if (updated.success) {
      toast.success("Job accepted and site visit booked");
      setShowAcceptDialog(false);
      setVisitDate("");
      await fetchClaimDetails();
    } else {
      toast.error(updated.message || "Job accepted, but failed to save the visit date");
      await fetchClaimDetails();
    }

    setIsActionLoading(false);
  };

  const handleSubmitProgressUpdate = async () => {
    if (!job?.id || !progressNotes.trim()) return;

    setIsActionLoading(true);

    const materialSummary = progressMaterials
      .filter((material) => material.name.trim())
      .map((material) => `${material.name} x${material.qty} (£${material.cost})`);

    const composedNotes = materialSummary.length
      ? `${progressNotes.trim()}\n\nMaterials used: ${materialSummary.join(", ")}`
      : progressNotes.trim();

    const result = await addProgressUpdate(
      job.id,
      composedNotes,
      progressMaterials
        .filter((material) => material.name.trim())
        .map((material, index) => ({
          material_id: index + 1,
          qty: Number(material.qty || 0),
          cost: Number(material.cost || 0),
        })),
    );

    if (result.success) {
      toast.success("Progress update saved");
      setShowAddProgressDialog(false);
      setProgressNotes("");
      setProgressMaterials([{ id: "1", name: "", qty: 1, cost: 0 }]);
      await fetchClaimDetails();
    } else {
      toast.error(result.message || "Failed to save progress update");
    }

    setIsActionLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!job?.id) return;
    setIsActionLoading(true);
    const result = await submitReview(job.id, reviewRating, reviewText);
    if (result.success) {
      toast.success("Review submitted");
      setShowReviewModal(false);
      setReviewText("");
      await fetchClaimDetails();
    } else {
      toast.error(result.message || "Failed to submit review");
    }
    setIsActionLoading(false);
  };

  const handleDownloadReport = () => {
    const reportUrl = getJobReportUrl(job);
    window.open(reportUrl, "_blank");
  };

  const handleDownloadInvoice = async () => {
    if (!job?.id) return;
    setIsActionLoading(true);
    const result = await getJobInvoiceUrl(job.id);
    if (result.success && result.url) {
      window.open(result.url, "_blank");
    } else {
      toast.error(result.message || "Failed to get invoice");
    }
    setIsActionLoading(false);
  };

  const handleDownloadArchive = async () => {
    if (!job?.id) return;
    setIsActionLoading(true);
    const result = await getJobArchiveUrl(job.id);
    if (result.success && result.url) {
      window.open(result.url, "_blank");
    } else {
      toast.error(result.message || "Failed to get archive");
    }
    setIsActionLoading(false);
  };

  const handleApprove = async () => {
    const reportId = job?.report_id;
    if (!reportId) return;

    setIsActionLoading(true);
    const result = await approveReport(reportId, "Claim approved. Works authorised.");
    if (result.success) {
      toast.success(result.message || "Claim approved");
      await fetchClaimDetails();
    } else {
      toast.error(result.message || "Failed to approve claim");
    }
    setIsActionLoading(false);
  };

  const handleReject = async () => {
    const reportId = job?.report_id;
    if (!reportId) return;

    setIsActionLoading(true);
    const result = await rejectReport(reportId, "Claim rejected pending further review.");
    if (result.success) {
      toast.success(result.message || "Claim rejected");
      await fetchClaimDetails();
    } else {
      toast.error(result.message || "Failed to reject claim");
    }
    setIsActionLoading(false);
  };

  const handleDelete = async () => {
    const reportId = job?.report_id;
    if (!reportId) return;

    setIsActionLoading(true);
    const result = await deleteReport(reportId);
    if (result.success) {
      toast.success(result.message || "Claim deleted");
      router.push(backHref);
    } else {
      toast.error(result.message || "Failed to delete claim");
    }
    setIsActionLoading(false);
  };

  const createPreviewDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });

  const persistRoomMedia = useCallback(async (
    roomId: number,
    media: Array<{
      id: number;
      url: string;
      label?: string;
      created_at?: string;
      estimated_material_cost?: number;
    }>,
  ) => {
    setIsActionLoading(true);
    const result = await updateRoom(roomId, { media });
    if (result.success) {
      toast.success("Room evidence updated");
      await fetchClaimDetails();
    } else {
      toast.error(result.message || "Failed to update room evidence");
    }
    setIsActionLoading(false);
  }, [fetchClaimDetails]);

  const handleReplaceRoomImage = async (roomId: number, mediaId: number, file?: File) => {
    if (!file) return;

    try {
      const previewUrl = await createPreviewDataUrl(file);
      const nextMedia = (roomMediaDrafts[roomId] || []).map((media) =>
        media.id === mediaId
          ? {
            ...media,
            url: previewUrl,
            label: file.name,
            created_at: nowIso(),
          }
          : media,
      );

      setRoomMediaDrafts((current) => ({
        ...current,
        [roomId]: nextMedia,
      }));

      if (audience === "homeowner") {
        await persistRoomMedia(roomId, nextMedia);
      }
    } catch (error) {
      console.error("[claims] Failed to replace room image", {
        roomId,
        mediaId,
        error,
      });
      toast.error("Failed to load the replacement image.");
    }
  };

  const handleAddRoomImage = async (roomId: number, file?: File) => {
    if (audience !== "builder" || !file) return;

    try {
      const previewUrl = await createPreviewDataUrl(file);
      const nextMedia = [
        ...(roomMediaDrafts[roomId] || []),
        {
          id: -Date.now(),
          url: previewUrl,
          label: file.name,
          created_at: nowIso(),
          estimated_material_cost: 0,
        },
      ];

      setRoomMediaDrafts((current) => ({
        ...current,
        [roomId]: nextMedia,
      }));
    } catch (error) {
      console.error("[claims] Failed to add room image", {
        roomId,
        error,
      });
      toast.error("Failed to load the new image.");
    }
  };

  const handleRemoveRoomImage = async (roomId: number, mediaId: number) => {
    if (audience !== "builder") return;

    const nextMedia = (roomMediaDrafts[roomId] || []).filter((media) => media.id !== mediaId);

    setRoomMediaDrafts((current) => ({
      ...current,
      [roomId]: nextMedia,
    }));
  };

  const handleSaveRoomEvidence = async (roomId: number) => {
    const media = roomMediaDrafts[roomId];
    if (!media) return;
    await persistRoomMedia(roomId, media);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Loading claim...</p>
      </div>
    );
  }

  if (!claim) {
    return <DetailPageNotFound backLabel={backLabel} onBack={() => router.push(backHref)} />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <ClaimDetailHeader
        claim={claim}
        job={job}
        backLabel={backLabel}
        onBack={() => router.push(backHref)}
        isActionLoading={isActionLoading}
        canAccept={canAccept}
        canAddProgress={canAddProgress}
        canDownloadPdf={canDownloadPdf}
        canDelete={canDelete}
        canSignOff={canSignOff}
        onAccept={() => setShowAcceptDialog(true)}
        onAddProgress={() => setShowAddProgressDialog(true)}
        onDownloadReport={handleDownloadReport}
        onDownloadInvoice={handleDownloadInvoice}
        onDownloadArchive={handleDownloadArchive}
        onDelete={() => setShowDeleteDialog(true)}
        onSignOff={handleSignOff}
        getStatusStyles={getStatusStyles}
        getStatusDisplay={getStatusDisplay}
        getJobStatusStyles={getJobStatusStyles}
        formatJobStatus={formatJobStatus}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete claim?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the claim from local dev data for both homeowner and builder views. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Claim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Lightbox
        open={Boolean(lightboxState)}
        close={() => setLightboxState(null)}
        slides={lightboxState?.slides || []}
        index={lightboxState?.index || 0}
      />

      <MaterialEditDialog
        editingMaterial={editingMaterial}
        onOpenChange={(open) => !open && setEditingMaterial(null)}
        onEditingMaterialChange={setEditingMaterial}
        onSave={() => {
          if (!editingMaterial) return;
          setRoomMaterialDrafts((current) => ({
            ...current,
            [editingMaterial.roomId]: (current[editingMaterial.roomId] || []).map((entry) =>
              entry.id === editingMaterial.material.id ? editingMaterial.material : entry,
            ),
          }));
          setEditingMaterial(null);
        }}
      />

      <AcceptJobDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        visitDate={visitDate}
        isActionLoading={isActionLoading}
        onVisitDateChange={setVisitDate}
        onSubmit={handleAcceptWithVisitDate}
      />

      <AddProgressDialog
        open={showAddProgressDialog}
        onOpenChange={setShowAddProgressDialog}
        progressNotes={progressNotes}
        materials={progressMaterials}
        isActionLoading={isActionLoading}
        onNotesChange={setProgressNotes}
        onMaterialChange={(id, field, value) =>
          setProgressMaterials((current) =>
            current.map((material) =>
              material.id === id
                ? {
                  ...material,
                  [field]: field === "name" ? value : Number(value || 0),
                }
                : material,
            ),
          )
        }
        onAddMaterial={() =>
          setProgressMaterials((current) => [
            ...current,
            { id: `${Date.now()}-${current.length}`, name: "", qty: 1, cost: 0 },
          ])
        }
        onRemoveMaterial={(id) =>
          setProgressMaterials((current) =>
            current.length === 1 ? current : current.filter((material) => material.id !== id),
          )
        }
        onSubmit={handleSubmitProgressUpdate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <PropertyDetailsSection claim={claim} />
          {job ? (
            <JobStatusSection
              job={job}
              audience={audience}
              getJobStatusStyles={getJobStatusStyles}
              formatJobStatus={formatJobStatus}
            />
          ) : null}
          <AffectedAreasSection
            audience={audience}
            claim={claim}
            roomMediaDrafts={roomMediaDrafts}
            roomMaterialDrafts={roomMaterialDrafts}
            canEditRoomEvidence={canEditRoomEvidence}
            canManageMaterials={canManageMaterials}
            isActionLoading={isActionLoading}
            onAddRoomImage={handleAddRoomImage}
            onReplaceRoomImage={handleReplaceRoomImage}
            onRemoveRoomImage={handleRemoveRoomImage}
            onSaveRoomEvidence={handleSaveRoomEvidence}
            onOpenLightbox={(slides, index) => setLightboxState({ slides, index })}
            onEditMaterial={(roomId, material) => setEditingMaterial({ roomId, material })}
            onDeleteMaterial={(roomId, materialId) =>
              setRoomMaterialDrafts((current) => ({
                ...current,
                [roomId]: (current[roomId] || []).filter((entry) => entry.id !== materialId),
              }))
            }
            getImageUrl={getImageUrl}
            getRoomRepairEstimate={getRoomRepairEstimate}
            getRoomMaterialRows={getRoomMaterialRows}
          />
          <EstimateSummarySection
            claim={claim}
            materialsTotal={claimSummary.materialsTotal}
            totalCost={claimSummary.totalCost}
          />
        </div>

        <div className="space-y-10">
          <ClaimDossierSection claim={claim} isJobBackedClaim={Boolean(isJobBackedClaim)} />
          <AudienceContextSection
            audience={audience}
            claim={claim}
            job={job}
            isActionLoading={isActionLoading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
          {canReview ? <ReviewPromptSection onOpen={() => setShowReviewModal(true)} /> : null}
          {existingReview ? <SubmittedReviewSection review={existingReview} /> : null}
          <SupportBannerSection audience={audience} />
        </div>
      </div>

      {canChat && job ? (
        <Chat
          jobId={job.id}
          currentUserRole={audience === "builder" ? "builder" : audience === "handler" ? "admin" : "client"}
          otherPartyName={audience === "builder" ? "Homeowner" : job.builder?.name || "Assigned Builder"}
          otherPartyRole={audience === "builder" ? "client" : job.builder ? "builder" : "client"}
        />
      ) : null}

      <ReviewDialog
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        reviewRating={reviewRating}
        reviewText={reviewText}
        isActionLoading={isActionLoading}
        onRatingChange={setReviewRating}
        onReviewTextChange={setReviewText}
        onSubmit={handleSubmitReview}
      />
    </motion.div>
  );
}
