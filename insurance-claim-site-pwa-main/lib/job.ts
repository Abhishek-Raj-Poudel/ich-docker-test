import { isDevModeEnabled } from "./dev-mode";
import { getAuthToken } from "./app-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type JobStatus =
  | "not_started"
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "site_visit_booked"
  | "in_progress"
  | "completed";

export interface JobRoomMediaItem {
  id: number;
  url: string;
  label?: string;
  created_at?: string;
  estimated_material_cost?: number;
}

export interface JobRoomDimensions {
  floor_area?: number;
  ceiling_height?: number;
  wall_lengths?: number[];
  width?: number;
  length?: number;
  [key: string]: number | number[] | undefined;
}

export interface JobRoomDamage {
  type?: string;
  severity?: string;
  area?: number;
  notes?: string;
  [key: string]: string | number | undefined;
}

export interface JobRoomDetail {
  id: number;
  room_name: string;
  dimensions: JobRoomDimensions;
  damages: JobRoomDamage[];
  scan_status: string;
  media: JobRoomMediaItem[];
}

export interface Job {
  id: number;
  report_id: number;
  property_id?: number | null;
  room_id?: number | null;
  homeowner_id?: number | null;
  builder_id?: number | null;
  status: JobStatus;
  contract_amount: number;
  total_cost?: number;
  report_path?: string;
  notes?: string;
  materials_used?: string[];
  site_visit_scheduled_at?: string;
  actual_start_date?: string;
  agreed_start_date?: string;
  agreed_completion_date?: string;
  final_invoice_amount?: number;
  report_media?: {
    id: number;
    file: string;
    file_type: string;
    file_size: number;
  } | null;
  media?: { id: number; url: string; label?: string; created_at?: string }[];
  progress_updates?: Array<{
    id: number;
    notes: string;
    materials_used: { material_id: number; qty: number; cost: number }[];
    created_at: string;
  }>;
  status_history?: Array<{
    id: number;
    status: "pending" | "accepted" | "declined" | "completed" | "cancelled" | "in_progress" | "site_visit_booked";
    changed_at: string;
    changed_by_user_id: number;
    note?: string;
    changed_by?: {
      id: number;
      name: string;
      role: string;
    };
  }>;
  report?: {
    id: number;
    reference_number: string;
    total_cost: number;
    status?: "draft" | "submitted" | "approved" | "rejected" | "completed";
    property?: {
      id: number;
      address_line_1: string;
      address_line_2?: string;
      city: string;
      postcode: string;
      address_type: string;
      property_type: string;
      room_details?: JobRoomDetail[];
    };
    description?: string;
    media?: { id: number; url: string; label?: string }[];
    user?: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
    created_at: string;
  };
  builder?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  created_at: string;
  updated_at: string;
}

interface ApiJobDetail {
  id: number;
  homeowner_id: number | null;
  builder_id: number | null;
  report_id: number;
  room_id: number | null;
  property_id: number | null;
  status: JobStatus;
  total_cost: string;
  report_path: string;
  materials_used: string[];
  notes: string;
  report_media?: Job["report_media"];
  created_at: string;
  updated_at: string;
}

export interface SyncedJobDetail {
  id: number;
  room_id: number;
  homeowner_id: number | null;
  report_id: number;
  status: JobStatus;
  total_cost: string;
  report_path: string;
  materials_used: string[];
  report_media?: {
    id: number;
    file: string;
    file_type: string;
    file_size: number;
  } | null;
}

export interface JobUpdatePayload {
  status?: JobStatus;
  total_cost?: number | string;
  materials_used?: string[];
  notes?: string;
  site_visit_scheduled_at?: string;
  agreed_completion_date?: string;
}

async function getToken(): Promise<string> {
  return getAuthToken();
}

function normalizeJob(job: Job): Job {
  return {
    ...job,
    status: job.status === "pending" ? "not_started" : job.status,
  };
}

function toNumber(rawValue: string | number | undefined | null): number {
  const value = Number(rawValue ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function mapJob(job: ApiJobDetail): Job {
  const totalCost = toNumber(job.total_cost);

  return {
    id: job.id,
    report_id: job.report_id,
    property_id: job.property_id,
    room_id: job.room_id,
    homeowner_id: job.homeowner_id,
    builder_id: job.builder_id,
    status: job.status,
    contract_amount: totalCost,
    total_cost: totalCost,
    notes: job.notes || "",
    materials_used: job.materials_used || [],
    report_path: job.report_path || "",
    report_media: job.report_media || null,
    report: {
      id: job.report_id,
      reference_number: `RPT-${job.report_id}`,
      total_cost: totalCost,
      property: {
        id: job.property_id || 0,
        address_line_1: "",
        address_line_2: "",
        city: "",
        postcode: "",
        address_type: "",
        property_type: "",
        room_details: [],
      },
      description: job.notes || "",
      media: job.report_media
        ? [
            {
              id: job.report_media.id,
              url: job.report_media.file,
              label: "Job report",
            },
          ]
        : [],
      created_at: job.created_at,
    },
    created_at: job.created_at,
    updated_at: job.updated_at,
  };
}

async function parseApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<{ success: boolean; data?: T; message?: string }> {
  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 502) {
      return {
        success: false,
        message:
          responseData.detail ||
          responseData.message ||
          "Job sync backend is unavailable. This route still depends on unfinished upstream services.",
      };
    }

    return {
      success: false,
      message:
        responseData.detail || responseData.message || responseData.error || fallbackMessage,
    };
  }

  return {
    success: true,
    data: responseData as T,
  };
}

export async function syncJobFromRoom(
  roomId: number,
): Promise<{ success: boolean; data?: SyncedJobDetail; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockCreateClaimFromRoom } = await import("./mock-store");
    const result = mockCreateClaimFromRoom(roomId);
    return {
      success: result.success,
      data: result.data
        ? {
            ...result.data,
            status: result.data.status === "pending" ? "not_started" : result.data.status,
          }
        : undefined,
      message: result.message,
    };
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/job-details/sync/${roomId}/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return parseApiResponse<SyncedJobDetail>(
      response,
      "Failed to create job from analyzed room",
    );
  } catch {
    return {
      success: false,
      message: "Network error",
    };
  }
}

export async function listAvailableJobs(): Promise<{
  success: boolean;
  data?: Job[];
  message?: string;
}> {
  if (isDevModeEnabled()) {
    const { mockListAvailableJobs } = await import("./mock-store");
    const result = mockListAvailableJobs();
    return {
      ...result,
      data: result.data?.map((job) => normalizeJob(job as Job)),
    };
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/job-details/all/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json().catch(() => []);
    if (response.ok) {
      const jobs = Array.isArray(responseData) ? responseData : responseData.data ?? [];
      return { success: true, data: jobs.map(mapJob) };
    }

    return {
      success: false,
      message:
        responseData.detail || responseData.message || "Failed to fetch available jobs",
    };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function listJobs(): Promise<{
  success: boolean;
  data?: Job[];
  message?: string;
}> {
  if (isDevModeEnabled()) {
    const { mockListJobs } = await import("./mock-store");
    const result = mockListJobs();
    return {
      ...result,
      data: result.data?.map((job) => normalizeJob(job as Job)),
    };
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/job-details/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json().catch(() => []);
    if (response.ok) {
      const jobs = Array.isArray(responseData) ? responseData : responseData.data ?? [];
      return { success: true, data: jobs.map(mapJob) };
    }

    return {
      success: false,
      message: responseData.detail || responseData.message || "Failed to fetch jobs",
    };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function getJob(
  id: number | string,
): Promise<{ success: boolean; data?: Job; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGetJob } = await import("./mock-store");
    const result = mockGetJob(id);
    return {
      ...result,
      data: result.data ? normalizeJob(result.data as Job) : undefined,
    };
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/job-details/${id}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json().catch(() => ({}));
    if (response.ok) {
      return { success: true, data: mapJob(responseData as ApiJobDetail) };
    }

    return {
      success: false,
      message:
        responseData.detail || responseData.message || "Failed to fetch job details",
    };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function updateJob(
  id: number | string,
  data: JobUpdatePayload,
): Promise<{ success: boolean; data?: Job; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockUpdateJob } = await import("./mock-store");
    const result = await mockUpdateJob(id, data as never);
    return {
      success: result.success,
      data: result.data ? normalizeJob(result.data as Job) : undefined,
      message: result.message,
    };
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/job-details-update/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json().catch(() => ({}));
    if (response.ok) {
      return {
        success: true,
        data: mapJob(responseData as ApiJobDetail),
      };
    }

    return {
      success: false,
      message:
        responseData.detail || responseData.message || "Failed to update job",
    };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function signOffJob(
  id: number | string,
): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockSignOffJob } = await import("./mock-store");
    return mockSignOffJob(id);
  }

  return {
    success: false,
    message: "Job sign-off is not available in the current backend yet.",
  };
}

export async function acceptJob(
  jobId: number,
): Promise<{ success: boolean; data?: Job; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockAcceptJob } = await import("./mock-store");
    const result = await mockAcceptJob(jobId);
    return {
      success: result.success,
      data: result.data ? normalizeJob(result.data as Job) : undefined,
      message: result.message,
    };
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/job-accept/${jobId}/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json().catch(() => ({}));
    if (response.ok) {
      return {
        success: true,
        data: mapJob(responseData as ApiJobDetail),
      };
    }

    return {
      success: false,
      message:
        responseData.detail || responseData.message || "Failed to accept job",
    };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function startJob(
  id: number | string,
): Promise<{ success: boolean; data?: Job; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockStartJob } = await import("./mock-store");
    const result = await mockStartJob(id);
    return {
      success: result.success,
      data: result.data ? normalizeJob(result.data as Job) : undefined,
      message: result.message,
    };
  }

  return updateJob(id, { status: "in_progress" });
}

export async function completeJob(
  id: number | string,
  finalInvoiceAmount?: number,
  notes?: string,
): Promise<{ success: boolean; data?: Job; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockCompleteJob } = await import("./mock-store");
    const result = await mockCompleteJob(id, finalInvoiceAmount, notes);
    return {
      success: result.success,
      data: result.data ? normalizeJob(result.data as Job) : undefined,
      message: result.message,
    };
  }

  const payload: JobUpdatePayload = {
    status: "completed",
  };
  if (typeof finalInvoiceAmount === "number" && Number.isFinite(finalInvoiceAmount)) {
    payload.total_cost = finalInvoiceAmount.toFixed(2);
  }
  if (notes) {
    payload.notes = notes;
  }

  return updateJob(id, payload);
}

export async function addProgressUpdate(
  id: number | string,
  notes: string,
  materialsUsed?: { material_id: number; qty: number; cost: number }[],
): Promise<{ success: boolean; data?: Job; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockAddProgressUpdate } = await import("./mock-store");
    const result = await mockAddProgressUpdate(id, notes, materialsUsed);
    return {
      success: result.success,
      data: result.data ? normalizeJob(result.data as Job) : undefined,
      message: result.message,
    };
  }

  return updateJob(id, {
    status: "in_progress",
    notes,
    materials_used: (materialsUsed || []).map(
      (material) => `Material ${material.material_id} x${material.qty}`,
    ),
  });
}

export async function uploadProgressPhoto(
  jobId: number | string,
  file: File,
): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockUploadProgressPhoto } = await import("./mock-store");
    return mockUploadProgressPhoto(jobId, file.name);
  }

  return {
    success: false,
    message: "Job photo uploads are not available in the current backend yet.",
  };
}

export async function getJobInvoiceUrl(
  id: number | string,
): Promise<{ success: boolean; url?: string; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGetJobInvoiceUrl } = await import("./mock-store");
    return mockGetJobInvoiceUrl(id);
  }

  return {
    success: false,
    message: "Job invoice downloads are not available in the current backend yet.",
  };
}

export async function getJobArchiveUrl(
  id: number | string,
): Promise<{ success: boolean; url?: string; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGetJobArchiveUrl } = await import("./mock-store");
    return mockGetJobArchiveUrl(id);
  }

  return {
    success: false,
    message: "Job archive downloads are not available in the current backend yet.",
  };
}
