import { isDevModeEnabled } from "./dev-mode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BuilderKycDocument {
  id: number;
  file: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface BuilderKycRecord {
  business_name: string;
  business_email: string;
  business_contact: string;
  business_vat_number: string;
  business_pan_number: string;
  company_registration_number: string;
  documents: BuilderKycDocument[];
  created_at: string;
  updated_at: string;
}

export interface KycStatusResponse {
  kyc_status: "not_submitted" | "submitted";
  data: BuilderKycRecord | null;
  latest_submission?: {
    id: number;
    document_type: string;
    status: string;
    rejection_reason: string | null;
    submitted_at: string;
    reviewed_at: string | null;
  };
}

export interface SaveBuilderKycInput {
  business_name: string;
  business_email: string;
  business_contact: string;
  business_vat_number?: string;
  business_pan_number?: string;
  company_registration_number?: string;
  uploads?: File[];
  remove_document_ids?: number[];
}

function toKycStatusResponse(data: BuilderKycRecord): KycStatusResponse {
  const latestDocument = data.documents[0];

  return {
    kyc_status: "submitted",
    data,
    latest_submission: latestDocument
      ? {
          id: latestDocument.id,
          document_type: latestDocument.file_type || "document",
          status: "submitted",
          rejection_reason: null,
          submitted_at: latestDocument.created_at,
          reviewed_at: null,
        }
      : undefined,
  };
}

export async function saveBuilderKYC(
  data: SaveBuilderKycInput,
  token: string,
  method: "POST" | "PATCH" = "POST",
) {
  if (isDevModeEnabled()) {
    return {
      business_name: data.business_name,
      business_email: data.business_email,
      business_contact: data.business_contact,
      business_vat_number: data.business_vat_number || "",
      business_pan_number: data.business_pan_number || "",
      company_registration_number: data.company_registration_number || "",
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } satisfies BuilderKycRecord;
  }

  const formData = new FormData();
  formData.append("business_name", data.business_name);
  formData.append("business_email", data.business_email);
  formData.append("business_contact", data.business_contact);
  if (data.business_vat_number) {
    formData.append("business_vat_number", data.business_vat_number);
  }
  if (data.business_pan_number) {
    formData.append("business_pan_number", data.business_pan_number);
  }
  if (data.company_registration_number) {
    formData.append(
      "company_registration_number",
      data.company_registration_number,
    );
  }
  for (const upload of data.uploads ?? []) {
    formData.append("uploads", upload);
  }
  for (const documentId of data.remove_document_ids ?? []) {
    formData.append("remove_document_ids", String(documentId));
  }

  const response = await fetch(`${API_URL}/api/kyc/`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      responseData.detail || responseData.message || "Failed to save KYC",
    );
  }

  return responseData as BuilderKycRecord;
}

export async function submitKYC(data: SaveBuilderKycInput, token: string) {
  return saveBuilderKYC(data, token, "POST");
}

export async function updateKYC(data: SaveBuilderKycInput, token: string) {
  return saveBuilderKYC(data, token, "PATCH");
}

export async function getKYCStatus(token: string): Promise<KycStatusResponse> {
  if (isDevModeEnabled()) {
    const { mockGetKycStatus } = await import("./mock-store");
    const mockStatus = mockGetKycStatus();
    return {
      kyc_status:
        mockStatus.kyc_status === "approved" || mockStatus.kyc_status === "submitted"
          ? "submitted"
          : "not_submitted",
      data: null,
      latest_submission: mockStatus.latest_submission
        ? {
            id: mockStatus.latest_submission.id,
            document_type: mockStatus.latest_submission.document_type,
            status: mockStatus.latest_submission.status,
            rejection_reason: mockStatus.latest_submission.rejection_reason,
            submitted_at: mockStatus.latest_submission.submitted_at,
            reviewed_at: mockStatus.latest_submission.reviewed_at,
          }
        : undefined,
    };
  }

  const response = await fetch(`${API_URL}/api/kyc/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return {
      kyc_status: "not_submitted",
      data: null,
    };
  }

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      responseData.detail || responseData.message || "Failed to fetch KYC status",
    );
  }

  return toKycStatusResponse(responseData as BuilderKycRecord);
}

export async function getAdminKYCList(token: string, page: number = 1) {
  if (isDevModeEnabled()) {
    const { mockGetAdminKycList } = await import("./mock-store");
    return mockGetAdminKycList();
  }

  const response = await fetch(`${API_URL}/api/v1/admin/kyc?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch KYC queue");
  }

  return await response.json();
}

export async function getAdminKYCDetail(token: string, kycId: string) {
  if (isDevModeEnabled()) {
    const { mockGetAdminKycDetail } = await import("./mock-store");
    return mockGetAdminKycDetail(kycId);
  }

  const response = await fetch(`${API_URL}/api/v1/admin/kyc/${kycId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch KYC detail");
  }

  return await response.json();
}

export async function approveKYC(token: string, kycId: string) {
  if (isDevModeEnabled()) {
    const { mockApproveKyc } = await import("./mock-store");
    return mockApproveKyc(kycId);
  }

  const response = await fetch(`${API_URL}/api/v1/admin/kyc/${kycId}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to approve KYC");
  }

  return await response.json();
}

export async function rejectKYC(token: string, kycId: string, reason: string) {
  if (isDevModeEnabled()) {
    const { mockRejectKyc } = await import("./mock-store");
    return mockRejectKyc(kycId, reason);
  }

  const response = await fetch(`${API_URL}/api/v1/admin/kyc/${kycId}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to reject KYC");
  }

  return await response.json();
}
