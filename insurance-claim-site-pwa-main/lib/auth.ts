import { isDevModeEnabled } from "./dev-mode";
import type { AppUser } from "./app-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RegisterResponse {
  success: boolean;
  message?: string;
  user_id?: number;
  email?: string;
  contact?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  token?: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  access?: string;
  refresh?: string;
  user_id?: number;
  email_verified?: boolean;
  verification_required?: boolean;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    name?: string;
    email: string;
    contact_number?: string;
    contact?: string;
    is_active?: number;
    role_id?: number;
    role_name?: string;
    role?: string | { id: number; role: string };
    created_at?: string;
    kyc_status?: string;
    email_verified?: boolean;
  };
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  is_active: number;
  role: {
    id: number;
    role: string;
  };
  created_at: string;
  kyc_status?: string;
  email_verified?: boolean;
}

interface ProfileResponse {
  success: boolean;
  data?: ProfileData;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
  contact?: string
): Promise<RegisterResponse> {
  const payload: Record<string, unknown> = {
    name: name.trim(),
    email,
    password,
    role,
  };

  if (contact) {
    payload.contact = contact;
    payload.contact_number = contact;
  }

  const response = await fetch(`${API_URL}/api/register/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {
      success: response.ok,
      message: response.ok ? "Registration successful" : "Request failed",
    };
  }

  const data = await response.json();
  return {
    success: response.ok,
    message: data.message ?? data.detail,
    user_id: data.user_id ?? data.id ?? data.user?.id,
    email: data.email ?? email,
    contact: data.contact ?? data.contact_number ?? contact,
  };
}

export async function verifyEmailOTP(
  email: string,
  otp: string
): Promise<VerifyOTPResponse> {
  const response = await fetch(`${API_URL}/api/verify-otp/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  return {
    success: response.ok,
    message: data.message ?? data.detail,
    token: data.token ?? data.access,
  };
}

export async function resendOTP(
  email: string | null
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_URL}/api/resend-otp/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  return {
    success: response.ok,
    message: data.message ?? data.detail,
  };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  if (isDevModeEnabled()) {
    const { mockLogin } = await import("./mock-store");
    return mockLogin(email);
  }

  const response = await fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  const token = data.token ?? data.access;
  const user =
    data.user ??
    data.data?.user ??
    data.data ??
    (token || data.role || data.role_name || data.role_id
      ? {
          id: data.user_id ?? data.id,
          name: data.name,
          email: data.email,
          contact_number: data.contact_number ?? data.contact,
          role: data.role,
          role_id: data.role_id,
          role_name: data.role_name,
          email_verified: data.email_verified,
        }
      : undefined);
  const verificationRequired =
    Boolean(data.verification_required) ||
    Boolean(data.email_verified === false) ||
    String(data.message ?? data.detail ?? "").toLowerCase().includes("verify");

  return {
    success: response.ok,
    message: data.message ?? data.detail,
    token,
    access: data.access,
    refresh: data.refresh,
    user_id: data.user_id ?? data.id ?? user?.id,
    email_verified: data.email_verified,
    verification_required: verificationRequired,
    user,
  };
}

export async function getProfile(token: string): Promise<ProfileResponse> {
  if (isDevModeEnabled()) {
    const { mockGetProfile } = await import("./mock-store");
    return mockGetProfile();
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    const data = await response.json();
    return {
      success: response.ok,
      data: response.ok ? (data.data ?? data) : undefined,
    };
  } catch {
    return {
      success: false,
    };
  }
}

export async function logout(token: string): Promise<{ success: boolean }> {
  if (isDevModeEnabled()) {
    const { mockLogout } = await import("./mock-store");
    return mockLogout();
  }

  const response = await fetch(`${API_URL}/api/v1/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  return { success: response.ok };
}

export function normalizeAuthUser(user: LoginResponse["user"]): AppUser | null {
  if (!user) return null;

  const normalizedRoleName =
    user.role_name ??
    (typeof user.role === "object" ? user.role.role : user.role) ??
    "homeowner";
  const appRole = normalizedRoleName.toLowerCase();
  const normalizedRoleId =
    user.role_id ?? (typeof user.role === "object" ? user.role.id : 0);
  const role = {
    id: normalizedRoleId,
    role: appRole,
  };

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    name: user.name,
    email: user.email,
    contact_number: user.contact_number ?? user.contact,
    is_active: user.is_active ?? 1,
    role,
    created_at: user.created_at ?? new Date().toISOString(),
    kyc_status: user.kyc_status,
    email_verified: user.email_verified,
  };
}

export function getRoleFromId(id: number): string {
  const roles: Record<number, string> = {
    1: "homeowner",
    2: "builder",
    3: "admin",
  };
  return roles[id] || "homeowner";
}

export function getDashboardPathForRole(role: string | undefined): string {
  if (!role) return "/dashboard";
  if (["admin", "super_admin", "insurer"].includes(role)) return "/admin";
  if (role === "claim_handler") return "/handler";
  return "/dashboard";
}

export function getKycStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_submitted: "Not Submitted",
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  };
  return labels[status] || status;
}
