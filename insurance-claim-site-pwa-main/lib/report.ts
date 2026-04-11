import { Job } from "./job";
import { isDevModeEnabled } from "./dev-mode";
import { getAuthToken } from "./app-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const REPORTS_API_ENABLED = false;

export interface ReportMediaItem {
  id: number;
  url: string;
  label?: string;
  created_at?: string;
  estimated_material_cost?: number;
}

export interface ReportRoomDimensions {
  floor_area?: number;
  ceiling_height?: number;
  wall_lengths?: number[];
  width?: number;
  length?: number;
  [key: string]: number | number[] | undefined;
}

export interface ReportRoomDamage {
  type?: string;
  severity?: string;
  area?: number;
  notes?: string;
  [key: string]: string | number | undefined;
}

export interface ReportRoomDetail {
  id: number;
  room_name: string;
  dimensions: ReportRoomDimensions;
  damages: ReportRoomDamage[];
  scan_status: string;
  media: ReportMediaItem[];
}

export interface Report {
  id: number;
  reference_number: string;
  total_cost: number;
  vat_amount: number;
  labour_total: number;
  materials_total: number;
  status: "draft" | "submitted" | "approved" | "rejected" | "completed";
  job?: Job;
  insurer_notes?: string;
  property?: {
    id: number;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    postcode: string;
    address_type: string;
    property_type: string;
    room_details?: ReportRoomDetail[];
  };
  created_at: string;
  updated_at: string;
}

async function getToken(): Promise<string> {
  return getAuthToken();
}

function normalizeReport(report: Report): Report {
  if (!report.job) {
    return report;
  }

  const rawStatus = report.job.status as string;

  return {
    ...report,
    job: {
      ...report.job,
      status: rawStatus === "pending" ? "not_started" : report.job.status,
    } as Job,
  };
}

export async function generateReport(propertyId: number): Promise<{ success: boolean; data?: Report; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGenerateReport } = await import("./mock-store");
    const result = mockGenerateReport(propertyId);
    return {
      ...result,
      data: result.data ? normalizeReport(result.data as Report) : undefined,
    };
  }

  if (!REPORTS_API_ENABLED) {
    return {
      success: false,
      message: "Reports are temporarily disabled because the backend route is unavailable.",
    };
  }

  const token = await getToken();
  
  const response = await fetch(`${API_URL}/api/v1/reports/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      property_id: propertyId,
      estimated_completion_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') // 30 days from now
    }),
  });

  const responseData = await response.json();
  
  if (response.ok) {
    return {
      success: true,
      data: responseData,
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to generate claim report",
  };
}

export async function submitReport(reportId: number): Promise<{ success: boolean; data?: Report; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockSubmitReport } = await import("./mock-store");
    const result = mockSubmitReport(reportId);
    return {
      ...result,
      data: result.data ? normalizeReport(result.data as Report) : undefined,
    };
  }

  if (!REPORTS_API_ENABLED) {
    return {
      success: false,
      message: "Reports are temporarily disabled because the backend route is unavailable.",
    };
  }

  const token = await getToken();
  
  const response = await fetch(`${API_URL}/api/v1/reports/${reportId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: "submitted"
    }),
  });

  const responseData = await response.json();
  
  if (response.ok) {
    return {
      success: true,
      data: responseData,
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to submit claim report",
  };
}

export async function listReports(): Promise<{ success: boolean; data?: Report[]; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockListReports } = await import("./mock-store");
    const result = mockListReports();
    return {
      ...result,
      data: result.data?.map((report) => normalizeReport(report as Report)),
    };
  }

  if (!REPORTS_API_ENABLED) {
    return {
      success: true,
      data: [],
      message: "Reports are temporarily disabled because the backend route is unavailable.",
    };
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/reports`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    
    if (response.ok) {
      const reports = Array.isArray(responseData) ? responseData : responseData.data ?? [];
      return {
        success: true,
        data: reports,
      };
    }

    return {
      success: false,
      message: responseData.message || "Failed to fetch claims list",
    };
  } catch (error) {
    console.error("List reports error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server.",
    };
  }
}
export async function getReport(id: number): Promise<{ success: boolean; data?: Report; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGetReport } = await import("./mock-store");
    const result = mockGetReport(id);
    return {
      ...result,
      data: result.data ? normalizeReport(result.data as Report) : undefined,
    };
  }

  if (!REPORTS_API_ENABLED) {
    return {
      success: false,
      message: "Reports are temporarily disabled because the backend route is unavailable.",
    };
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/reports/${id}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data: responseData.data || responseData,
      };
    }

    return {
      success: false,
      message: responseData.message || "Failed to fetch claim details",
    };
  } catch (error) {
    console.error("Get report error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server.",
    };
  }
}

export async function approveReport(id: number, insurerNotes?: string): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockApproveReport } = await import("./mock-store");
    return mockApproveReport(id, insurerNotes);
  }

  if (!REPORTS_API_ENABLED) {
    return {
      success: false,
      message: "Reports are temporarily disabled because the backend route is unavailable.",
    };
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/reports/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: "approved",
        insurer_notes: insurerNotes || "Claim approved. Works authorised."
      }),
    });

    const responseData = await response.json();
    return {
      success: response.ok,
      message: responseData.message || (response.ok ? "Report approved" : "Failed to approve report"),
    };
  } catch (error) {
    console.error("Approve report error:", error);
    return {
      success: false,
      message: "Network error: Unable to approve report.",
    };
  }
}

export async function rejectReport(id: number, reason: string): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockRejectReport } = await import("./mock-store");
    return mockRejectReport(id, reason);
  }

  if (!REPORTS_API_ENABLED) {
    return {
      success: false,
      message: "Reports are temporarily disabled because the backend route is unavailable.",
    };
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/reports/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: "rejected",
        insurer_notes: reason
      }),
    });

    const responseData = await response.json();
    return {
      success: response.ok,
      message: responseData.message || (response.ok ? "Report rejected" : "Failed to reject report"),
    };
  } catch (error) {
    console.error("Reject report error:", error);
    return {
      success: false,
      message: "Network error: Unable to reject report.",
    };
  }
}

export async function deleteReport(id: number): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockDeleteReport } = await import("./mock-store");
    return mockDeleteReport(id);
  }

  return {
    success: false,
    message: "Claim deletion is only available in dev mode right now.",
  };
}
