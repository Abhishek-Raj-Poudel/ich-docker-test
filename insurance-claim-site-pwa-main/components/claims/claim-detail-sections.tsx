"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  HardHat,
  ImagePlus,
  Loader2,
  MapPin,
  Pencil,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/job";
import type { Report, ReportRoomDetail } from "@/lib/report";
import type { Review } from "@/lib/review";

export type ClaimsAudience = "homeowner" | "builder" | "handler";

export type RoomMaterialRow = {
  id: string;
  name: string;
  price: number;
};

export type ClaimRecord = Report & {
  source: "job";
};

type LightboxSlide = { src: string; alt?: string };

type ClaimDetailHeaderProps = {
  claim: ClaimRecord;
  job?: Job;
  backLabel: string;
  onBack: () => void;
  isActionLoading: boolean;
  canAccept: boolean;
  canAddProgress: boolean;
  canDownloadPdf: boolean;
  canDelete: boolean;
  canSignOff: boolean;
  onAccept: () => void;
  onAddProgress: () => void;
  onDownloadReport: () => void;
  onDownloadInvoice: () => void;
  onDownloadArchive: () => void;
  onDelete: () => void;
  onSignOff: () => void;
  getStatusStyles: (status: string) => string;
  getStatusDisplay: (status: string) => string;
  getJobStatusStyles: (status: string | undefined) => string;
  formatJobStatus: (status: string | undefined) => string;
};

export function ClaimDetailHeader({
  claim,
  job,
  backLabel,
  onBack,
  isActionLoading,
  canAccept,
  canAddProgress,
  canDownloadPdf,
  canDelete,
  canSignOff,
  onAccept,
  onAddProgress,
  onDownloadReport,
  onDownloadInvoice,
  onDownloadArchive,
  onDelete,
  onSignOff,
  getStatusStyles,
  getStatusDisplay,
  getJobStatusStyles,
  formatJobStatus,
}: ClaimDetailHeaderProps) {
  return (
    <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-4">
        <button onClick={onBack} className="group flex items-center text-xs font-bold text-neutral-400 hover:text-primary transition-all uppercase tracking-[0.2em]">
          <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
          {backLabel}
        </button>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">{claim.reference_number || `CLM-${claim.id}`}</h1>
          <Badge className={cn("rounded-full font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 border", getStatusStyles(claim.status))}>
            {getStatusDisplay(claim.status)}
          </Badge>
          {job?.status ? (
            <Badge className={cn("rounded-full font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 border", getJobStatusStyles(job.status))}>
              {formatJobStatus(job.status)}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {canAccept ? (
          <Button
            onClick={onAccept}
            disabled={isActionLoading}
            className="h-12 px-6 rounded-full font-bold uppercase text-[10px] tracking-widest bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <CalendarDays className="mr-2 size-4" />
            Accept Job
          </Button>
        ) : null}
        {canAddProgress ? (
          <Button
            onClick={onAddProgress}
            disabled={isActionLoading}
            className="h-12 px-6 rounded-full font-bold uppercase text-[10px] tracking-widest bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <CheckCircle2 className="mr-2 size-4" />
            Add Progress
          </Button>
        ) : null}
        {canDownloadPdf ? (
          <Button
            onClick={onDownloadReport}
            disabled={isActionLoading}
            variant="outline"
            className="h-12 px-6 rounded-full font-bold uppercase text-[10px] tracking-widest border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          >
            <FileText className="mr-2 size-4" />
            Download Report
          </Button>
        ) : null}
        {canDelete ? (
          <Button onClick={onDelete} disabled={isActionLoading} variant="outline" className="h-12 px-6 rounded-full font-bold uppercase text-[10px] tracking-widest border-red-100 text-red-600 hover:bg-red-50">
            <Trash2 className="mr-2 size-4" />
            Delete Claim
          </Button>
        ) : null}
        {canSignOff ? (
          <Button onClick={onSignOff} disabled={isActionLoading} className="h-12 px-8 rounded-full font-bold uppercase text-[10px] tracking-widest bg-emerald-600 text-white hover:bg-emerald-700">
            {isActionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
            Sign Off Work
          </Button>
        ) : null}
        {job?.status === "completed" ? (
          <>
            <Button onClick={onDownloadInvoice} disabled={isActionLoading} variant="outline" className="h-12 px-6 rounded-full font-bold uppercase text-[10px] tracking-widest border-neutral-200 text-neutral-700 hover:bg-neutral-50">
              <FileText className="mr-2 size-4" />
              Invoice
            </Button>
            <Button onClick={onDownloadArchive} disabled={isActionLoading} variant="outline" className="h-12 px-6 rounded-full font-bold uppercase text-[10px] tracking-widest border-neutral-200 text-neutral-700 hover:bg-neutral-50">
              <Archive className="mr-2 size-4" />
              Archive
            </Button>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}

export function PropertyDetailsSection({ claim }: { claim: ClaimRecord }) {
  return (
    <motion.div variants={item} className="bg-primary text-white border border-primary/80 rounded-3xl p-8 md:p-10 space-y-8 shadow-[0_1px_0_rgba(0,49,83,0.18)]">
      <div className="flex items-center justify-between border-b border-white/15 pb-6">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10">
            <MapPin className="size-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Property Details</h3>
        </div>
        <div className="flex items-center gap-2 text-white bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/15">
          <ShieldCheck className="size-3.5" />
          Verified
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DetailField label="Street Address" value={[claim.property?.address_line_1, claim.property?.address_line_2].filter(Boolean).join(", ")} className="text-white" />
        <DetailField label="Postcode" value={claim.property?.postcode || "N/A"} className="text-white uppercase" />
        <DetailField label="Property Type" value={claim.property?.property_type || "N/A"} className="text-white capitalize" />
        <DetailField label="Ownership Type" value={claim.property?.property_type || "N/A"} className="text-white capitalize" />
      </div>
    </motion.div>
  );
}

type JobStatusSectionProps = {
  job: Job;
  audience: ClaimsAudience;
  getJobStatusStyles: (status: string | undefined) => string;
  formatJobStatus: (status: string | undefined) => string;
};

export function JobStatusSection({
  job,
  audience,
  getJobStatusStyles,
  formatJobStatus,
}: JobStatusSectionProps) {
  return (
    <motion.div variants={item} className="bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 border border-violet-100 rounded-3xl p-8 md:p-10 space-y-8">
      <div className="flex items-center justify-between border-b border-violet-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
            <HardHat className="size-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">{audience === "handler" ? "Case Progress" : "Job Status"}</h3>
        </div>
        <Badge className={cn("rounded-full font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 border", getJobStatusStyles(job.status))}>
          {formatJobStatus(job.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JobInfoCard label="Builder" value={job.builder?.name || "Awaiting Assignment"} />
        <JobInfoCard label="Contract Amount" value={`£${(job.contract_amount || 0).toLocaleString()}`} />
        {job.site_visit_scheduled_at ? (
          <JobInfoCard
            label="Site Visit"
            value={new Date(job.site_visit_scheduled_at).toLocaleDateString("en-GB")}
            tone="purple"
          />
        ) : null}
        {job.agreed_completion_date ? (
          <JobInfoCard
            label="Target Completion"
            value={new Date(job.agreed_completion_date).toLocaleDateString("en-GB")}
            tone="emerald"
          />
        ) : null}
      </div>

      {job.progress_updates?.length ? (
        <div className="pt-6 border-t border-neutral-100">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4 block">Progress Updates</Label>
          <div className="space-y-3">
            {job.progress_updates.map((update) => (
              <div key={update.id} className="p-4 bg-white rounded-xl border border-violet-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{new Date(update.created_at).toLocaleDateString("en-GB")}</span>
                </div>
                <p className="text-neutral-700 text-sm">{update.notes}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {job.status_history?.length ? (
        <div className="pt-6 border-t border-neutral-100">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4 block">Status Timeline</Label>
          <div className="space-y-3">
            {job.status_history.map((entry, index) => (
              <div key={`${entry.id}-${entry.changed_at}-${entry.status}-${index}`} className="p-4 bg-white rounded-xl border border-violet-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{formatJobStatus(entry.status)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      {entry.changed_by?.name || "System"} • {new Date(entry.changed_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <Badge className={cn("rounded-full font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 border", getJobStatusStyles(entry.status))}>
                    {formatJobStatus(entry.status)}
                  </Badge>
                </div>
                {entry.note ? <p className="mt-3 text-sm text-neutral-700">{entry.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

type AffectedAreasSectionProps = {
  audience: ClaimsAudience;
  claim: ClaimRecord;
  roomMediaDrafts: Record<number, Array<{ id: number; url: string; label?: string; created_at?: string; estimated_material_cost?: number }>>;
  roomMaterialDrafts: Record<number, RoomMaterialRow[]>;
  canEditRoomEvidence: boolean;
  canManageMaterials: boolean;
  isActionLoading: boolean;
  onAddRoomImage: (roomId: number, file?: File) => Promise<void>;
  onReplaceRoomImage: (roomId: number, mediaId: number, file?: File) => Promise<void>;
  onRemoveRoomImage: (roomId: number, mediaId: number) => Promise<void>;
  onSaveRoomEvidence: (roomId: number) => Promise<void>;
  onOpenLightbox: (slides: LightboxSlide[], index: number) => void;
  onEditMaterial: (roomId: number, material: RoomMaterialRow) => void;
  onDeleteMaterial: (roomId: number, materialId: string) => void;
  getImageUrl: (url: string | undefined | null) => string;
  getRoomRepairEstimate: (room: ReportRoomDetail, materials?: RoomMaterialRow[]) => number;
  getRoomMaterialRows: (room: ReportRoomDetail) => RoomMaterialRow[];
};

export function AffectedAreasSection({
  audience,
  claim,
  roomMediaDrafts,
  roomMaterialDrafts,
  canEditRoomEvidence,
  canManageMaterials,
  isActionLoading,
  onAddRoomImage,
  onReplaceRoomImage,
  onRemoveRoomImage,
  onSaveRoomEvidence,
  onOpenLightbox,
  onEditMaterial,
  onDeleteMaterial,
  getImageUrl,
  getRoomRepairEstimate,
  getRoomMaterialRows,
}: AffectedAreasSectionProps) {
  return (
    <motion.div variants={item} className="space-y-6 rounded-[2rem] bg-gradient-to-br from-amber-50/70 via-white to-orange-50/70 border border-amber-100 p-6 md:p-8">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Affected Areas & Assessment</h3>
        <div className="flex items-center gap-2 text-neutral-400 font-bold uppercase text-[10px] tracking-widest">
          <Sparkles className="size-3.5" />
          Shared Claim View
        </div>
      </div>

      <div className="space-y-4">
        {claim.property?.room_details?.length ? (
          claim.property.room_details.map((room) => {
            const roomMaterials = roomMaterialDrafts[room.id] || getRoomMaterialRows(room);
            const roomEstimate = getRoomRepairEstimate(room, roomMaterials);
            const roomMedia = roomMediaDrafts[room.id] || room.media || [];

            return (
              <div key={room.id} className="rounded-3xl flex flex-col gap-6 transition-all hover:border-amber-300 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="size-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-100 overflow-hidden shrink-0">
                      {room.media?.[0]?.url ? (
                        <Image src={getImageUrl(room.media[0].url)} alt={room.room_name} width={64} height={64} className="size-full object-cover" />
                      ) : (
                        <span className="italic font-serif font-bold text-lg">{room.room_name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 capitalize">{room.room_name}</h4>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex flex-wrap items-center gap-2">
                        <span>Scan {room.scan_status}</span>
                        <span className="size-1 bg-neutral-200 rounded-full" />
                        <span>{typeof room.dimensions?.floor_area === "number" ? room.dimensions.floor_area : 0}m²</span>
                        <span className="size-1 bg-neutral-200 rounded-full" />
                        <span>{roomMedia.length || 0} photo{roomMedia.length === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Repair Estimate</p>
                    <p className="text-xl font-bold text-neutral-900">£{roomEstimate.toLocaleString()}</p>
                  </div>
                </div>

                {roomMedia.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {roomMedia.map((media, mediaIndex) => (
                      <div key={`${room.id}-${media.id}-${mediaIndex}`} className="space-y-3">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenLightbox(
                              roomMedia.map((entry) => ({
                                src: getImageUrl(entry.url),
                                alt: entry.label || room.room_name,
                              })),
                              mediaIndex,
                            )
                          }
                          className="w-full rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 transition-colors hover:border-neutral-300"
                        >
                          <div className="relative aspect-[4/3]">
                            <Image src={getImageUrl(media.url)} alt={media.label || room.room_name} fill className="object-cover" />
                          </div>
                        </button>

                        {canEditRoomEvidence ? (
                          <div className="rounded-2xl border border-amber-100 bg-white p-3 space-y-3">
                            <label className="block">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => void onReplaceRoomImage(room.id, media.id, event.target.files?.[0])}
                              />
                              <span className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-700 transition-colors hover:bg-neutral-50">
                                <ImagePlus className="mr-2 size-4" />
                                Replace Image
                              </span>
                            </label>
                            {audience === "builder" ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => void onRemoveRoomImage(room.id, media.id)}
                                disabled={isActionLoading}
                                className="h-10 w-full rounded-full border-red-100 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Remove Image
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {canEditRoomEvidence && audience === "builder" ? (
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => void onAddRoomImage(room.id, event.target.files?.[0])}
                      />
                      <span className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-700 transition-colors hover:bg-neutral-50 sm:w-auto">
                        <ImagePlus className="mr-2 size-4" />
                        Add New Image
                      </span>
                    </label>
                    <Button onClick={() => void onSaveRoomEvidence(room.id)} disabled={isActionLoading} variant="outline" className="rounded-full border-neutral-200 bg-white">
                      {isActionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                      Save Room Evidence
                    </Button>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xl md:text-2xl font-medium text-neutral-900 font-serif">Material Required</p>
                    </div>
                    <ChevronDown className="size-5 text-neutral-400" />
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(90px,0.7fr)_minmax(88px,0.5fr)] gap-3 border-b border-amber-100 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                      <span>Name</span>
                      <span>Price</span>
                      <span className="text-right">Action</span>
                    </div>

                    <div className="divide-y divide-amber-100">
                      {roomMaterials.map((material) => (
                        <div key={material.id} className="grid grid-cols-[minmax(0,1.6fr)_minmax(90px,0.7fr)_minmax(88px,0.5fr)] gap-3 px-4 py-4 items-center">
                          <p className="text-sm md:text-base font-medium text-neutral-900">{material.name}</p>
                          <p className="text-sm md:text-base font-semibold text-neutral-900">£{material.price.toLocaleString()}</p>
                          <div className="flex items-center justify-end">
                            {canManageMaterials ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onEditMaterial(room.id, material)}
                                  className="rounded-2xl border border-neutral-200 bg-white p-3 hover:bg-neutral-50"
                                >
                                  <Pencil className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteMaterial(room.id, material.id)}
                                  className=" rounded-2xl border border-red-100 bg-red-50 p-3 text-red-600 hover:bg-red-100"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                                Scope
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 border-2 border-dashed border-neutral-100 rounded-xl text-center bg-neutral-50/30">
            <p className="text-neutral-400 text-sm font-serif italic">No room assessments are attached to this claim.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function EstimateSummarySection({
  claim,
  materialsTotal,
  totalCost,
}: {
  claim: ClaimRecord;
  materialsTotal: number;
  totalCost: number;
}) {
  return (
    <motion.div variants={item} className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-slate-800 text-white rounded-3xl p-10 space-y-8 relative overflow-hidden border border-white/10">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="size-12 bg-white/10 rounded-md flex items-center justify-center text-white border border-white/10">
          <Sparkles className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-medium">Shared Estimate Summary</h3>
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Role-aware details, same core structure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <SummaryValue label="Materials" value={`£${materialsTotal.toLocaleString()}`} />
        <SummaryValue label="Labour" value={`£${(claim.labour_total || 0).toLocaleString()}`} />
        <SummaryValue label="VAT" value={`£${(claim.vat_amount || 0).toLocaleString()}`} />
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Total Claim Value</p>
          <p className="text-4xl font-bold text-white tracking-tight">£{totalCost.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ClaimDossierSection({ claim, isJobBackedClaim }: { claim: ClaimRecord; isJobBackedClaim: boolean }) {
  return (
    <motion.div variants={item} className="bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200 rounded-3xl p-8 space-y-8">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-6">Claim Dossier</h3>
      <div className="space-y-6">
        <DossierRow icon={<Clock className="size-5 text-neutral-400" />} label="Created" value={new Date(claim.created_at).toLocaleDateString("en-GB")} />
        <DossierRow icon={<Sparkles className="size-5 text-neutral-400" />} label="Updated" value={new Date(claim.updated_at).toLocaleDateString("en-GB")} />
        {claim.insurer_notes ? (
          <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Notes</p>
            <p className="text-sm text-neutral-700">{claim.insurer_notes}</p>
          </div>
        ) : null}
        {isJobBackedClaim ? (
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Backend Source</p>
            <p className="text-sm text-blue-700">
              This claim view is currently powered by `job-details` because the reports route is not available.
            </p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

type AudienceContextSectionProps = {
  audience: ClaimsAudience;
  claim: ClaimRecord;
  job?: Job;
  isActionLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export function AudienceContextSection({
  audience,
  claim,
  job,
  isActionLoading,
  onApprove,
  onReject,
}: AudienceContextSectionProps) {
  if (audience === "handler") {
    return (
      <motion.div variants={item} className="bg-white border border-neutral-100 rounded-3xl p-8 space-y-6">
        <AudienceCardHeader icon={<ShieldCheck className="size-6" />} iconClassName="bg-red-50 text-red-600 border-red-100" eyebrow="Processing Tools" title="Restricted Internal Actions" />
        <p className="text-xs text-neutral-500 leading-relaxed">Handlers see the same claim structure, with additional approval controls and insurer notes layered on top.</p>
        {claim.status === "approved" ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Claim Approved</p>
            <p className="text-sm text-emerald-700">This claim has been approved and the action controls are now locked.</p>
          </div>
        ) : claim.status === "rejected" ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2">Claim Rejected</p>
            <p className="text-sm text-red-700">This claim has been rejected and the action controls are now locked.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={onApprove} disabled={isActionLoading} className="w-full h-11 rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
              <CheckCircle2 className="mr-2 size-4" />
              Approve Claim
            </Button>
            <Button onClick={onReject} disabled={isActionLoading} variant="outline" className="w-full h-11 rounded-full border-red-100 text-red-600 hover:bg-red-50">
              <X className="mr-2 size-4" />
              Reject Claim
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  if (audience === "builder") {
    return null;
  }

  return (
    <motion.div variants={item} className="bg-white border border-neutral-100 rounded-3xl p-8 space-y-6">
      <AudienceCardHeader icon={<HardHat className="size-6" />} iconClassName="bg-purple-50 text-purple-600 border-purple-100" eyebrow="Assigned Builder" title={job?.builder?.name || "Awaiting Match"} />
      <p className="text-xs text-neutral-500 leading-relaxed">You see the same claim record the team sees, with client-safe actions and messaging only.</p>
    </motion.div>
  );
}

export function ReviewPromptSection({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div variants={item} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-3xl p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
          <Star className="size-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Job Complete</p>
          <p className="text-lg font-bold text-neutral-900">Leave a Review</p>
        </div>
      </div>
      <Button onClick={onOpen} className="w-full h-12 rounded-full font-bold uppercase text-[10px] tracking-widest bg-amber-500 text-white hover:bg-amber-600">
        <Star className="mr-2 size-4" />
        Write Review
      </Button>
    </motion.div>
  );
}

export function SubmittedReviewSection({ review }: { review: Review }) {
  return (
    <motion.div variants={item} className="bg-white border border-neutral-100 rounded-3xl p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 border border-teal-100">
          <Star className="size-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Review</p>
          <p className="text-lg font-bold text-neutral-900">Submitted</p>
        </div>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={cn("size-5", star <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200")} />
        ))}
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{review.review}</p>
    </motion.div>
  );
}

export function SupportBannerSection({ audience }: { audience: ClaimsAudience }) {
  return (
    <motion.div variants={item} className="bg-emerald-600 text-white p-8 rounded-3xl space-y-4 relative overflow-hidden">
      <h4 className="font-bold text-lg leading-tight">{audience === "handler" ? "Internal Review Queue" : audience === "builder" ? "Project Coordination" : "Claims Support"}</h4>
      <p className="text-xs text-white/80 leading-relaxed font-normal">
        {audience === "handler"
          ? "Same claim spine, extra restricted controls."
          : audience === "builder"
            ? "Same claim spine, builder-safe execution details."
            : "Same claim spine, homeowner-safe actions and support."}
      </p>
    </motion.div>
  );
}

type ReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewRating: number;
  reviewText: string;
  isActionLoading: boolean;
  onRatingChange: (rating: number) => void;
  onReviewTextChange: (value: string) => void;
  onSubmit: () => void;
};

export function ReviewDialog({
  open,
  onOpenChange,
  reviewRating,
  reviewText,
  isActionLoading,
  onRatingChange,
  onReviewTextChange,
  onSubmit,
}: ReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Leave a Review</DialogTitle>
          <DialogDescription>How was your experience with the builder?</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => onRatingChange(star)} className="p-1 transition-transform hover:scale-110">
                  <Star className={cn("size-8 transition-colors", star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-neutral-200 hover:text-amber-200")} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Your Review</Label>
            <Textarea placeholder="Tell us about your experience..." value={reviewText} onChange={(event) => onReviewTextChange(event.target.value)} rows={4} className="rounded-xl border-neutral-200" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
          <Button onClick={onSubmit} disabled={isActionLoading || !reviewText} className="rounded-full bg-amber-500 hover:bg-amber-600">
            {isActionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type AcceptJobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitDate: string;
  isActionLoading: boolean;
  onVisitDateChange: (value: string) => void;
  onSubmit: () => void;
};

export function AcceptJobDialog({
  open,
  onOpenChange,
  visitDate,
  isActionLoading,
  onVisitDateChange,
  onSubmit,
}: AcceptJobDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Accept Job</DialogTitle>
          <DialogDescription>Choose the site visit date before accepting this job.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Visit Date</Label>
          <Input
            type="date"
            value={visitDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => onVisitDateChange(event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isActionLoading || !visitDate} className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800">
            {isActionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
            Confirm Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ProgressMaterialDraft = {
  id: string;
  name: string;
  qty: number;
  cost: number;
};

type AddProgressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressNotes: string;
  materials: ProgressMaterialDraft[];
  isActionLoading: boolean;
  onNotesChange: (value: string) => void;
  onMaterialChange: (id: string, field: "name" | "qty" | "cost", value: string) => void;
  onAddMaterial: () => void;
  onRemoveMaterial: (id: string) => void;
  onSubmit: () => void;
};

export function AddProgressDialog({
  open,
  onOpenChange,
  progressNotes,
  materials,
  isActionLoading,
  onNotesChange,
  onMaterialChange,
  onAddMaterial,
  onRemoveMaterial,
  onSubmit,
}: AddProgressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Progress Update</DialogTitle>
          <DialogDescription>Capture what happened on site and what materials were used.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label>Work Completed</Label>
            <Textarea
              value={progressNotes}
              onChange={(event) => onNotesChange(event.target.value)}
              rows={4}
              placeholder="Describe the work completed during this visit..."
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Materials Used</Label>
              <Button type="button" variant="outline" onClick={onAddMaterial} className="rounded-full">
                Add Material
              </Button>
            </div>

            <div className="space-y-3">
              {materials.map((material) => (
                <div key={material.id} className="grid grid-cols-1 md:grid-cols-[minmax(0,1.5fr)_110px_120px_auto] gap-3 rounded-2xl border border-neutral-200 p-3">
                  <Input
                    value={material.name}
                    onChange={(event) => onMaterialChange(material.id, "name", event.target.value)}
                    placeholder="Material name"
                    className="h-11 rounded-xl"
                  />
                  <Input
                    type="number"
                    min="1"
                    value={material.qty}
                    onChange={(event) => onMaterialChange(material.id, "qty", event.target.value)}
                    placeholder="Qty"
                    className="h-11 rounded-xl"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={material.cost}
                    onChange={(event) => onMaterialChange(material.id, "cost", event.target.value)}
                    placeholder="Cost"
                    className="h-11 rounded-xl"
                  />
                  <Button type="button" variant="outline" onClick={() => onRemoveMaterial(material.id)} className="h-11 rounded-xl border-red-100 text-red-600 hover:bg-red-50">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isActionLoading || !progressNotes.trim()} className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800">
            {isActionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
            Save Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type MaterialEditDialogProps = {
  editingMaterial: { roomId: number; material: RoomMaterialRow } | null;
  onOpenChange: (open: boolean) => void;
  onEditingMaterialChange: (value: { roomId: number; material: RoomMaterialRow } | null) => void;
  onSave: () => void;
};

export function MaterialEditDialog({
  editingMaterial,
  onOpenChange,
  onEditingMaterialChange,
  onSave,
}: MaterialEditDialogProps) {
  return (
    <Dialog open={Boolean(editingMaterial)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>Update the material name and price for this room scope.</DialogDescription>
        </DialogHeader>
        {editingMaterial ? (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Material Name</Label>
              <Input
                value={editingMaterial.material.name}
                onChange={(event) =>
                  onEditingMaterialChange({
                    ...editingMaterial,
                    material: { ...editingMaterial.material, name: event.target.value },
                  })
                }
                className="h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                min="0"
                value={editingMaterial.material.price}
                onChange={(event) =>
                  onEditingMaterialChange({
                    ...editingMaterial,
                    material: { ...editingMaterial.material, price: Number(event.target.value || 0) },
                  })
                }
                className="h-12 rounded-2xl"
              />
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onEditingMaterialChange(null)} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={onSave} className="rounded-full">
            Save Material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DetailPageNotFound({
  backLabel,
  onBack,
}: {
  backLabel: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
      <div className="size-24 bg-neutral-100 rounded-3xl flex items-center justify-center text-neutral-300 border border-neutral-100">
        <AlertCircle className="size-12" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-medium text-neutral-900 font-serif">Claim Not Found</h3>
        <p className="text-neutral-500 max-w-sm mx-auto">The requested claim does not exist or is no longer available.</p>
      </div>
      <Button onClick={onBack} variant="outline" className="rounded-full h-12 px-8 border-neutral-100 font-bold uppercase text-xs tracking-widest">
        <ArrowLeft className="mr-2 size-4" />
        {backLabel}
      </Button>
    </div>
  );
}

export const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/8 p-4">
      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">{label}</Label>
      <p className={cn("text-lg font-medium pl-1", className)}>{value || "N/A"}</p>
    </div>
  );
}

function JobInfoCard({
  label,
  value,
  tone = "white",
}: {
  label: string;
  value: string;
  tone?: "white" | "purple" | "emerald";
}) {
  const toneClasses =
    tone === "purple"
      ? "bg-purple-50 border-purple-100"
      : tone === "emerald"
        ? "bg-emerald-50 border-emerald-100"
        : "bg-white border-violet-100";
  const labelClasses =
    tone === "purple"
      ? "text-purple-600"
      : tone === "emerald"
        ? "text-emerald-600"
        : "text-neutral-500";

  return (
    <div className={cn("space-y-2 p-4 rounded-xl border", toneClasses)}>
      <Label className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", labelClasses)}>{label}</Label>
      <p className="text-lg font-medium text-neutral-900">{value}</p>
    </div>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="text-2xl font-serif">{value}</p>
    </div>
  );
}

function DossierRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
        <p className="text-sm font-medium text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

function AudienceCardHeader({
  icon,
  iconClassName,
  eyebrow,
  title,
}: {
  icon: ReactNode;
  iconClassName: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("size-12 rounded-2xl flex items-center justify-center border", iconClassName)}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{eyebrow}</p>
        <p className="text-lg font-bold text-neutral-900">{title}</p>
      </div>
    </div>
  );
}
