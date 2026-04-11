import { isDevModeEnabled } from "./dev-mode";
import { getAuthToken } from "./app-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
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

export interface UserListItem {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
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
  properties_count?: number;
  reports_count?: number;
}

export function getUserName(user: { first_name?: string; last_name?: string; name?: string }): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.name || "Unknown";
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  message?: string;
}

async function getToken(): Promise<string> {
  return getAuthToken();
}

export async function getAdminUsers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<PaginatedResponse<UserListItem>> {
  if (isDevModeEnabled()) {
    const { mockGetAdminUsers } = await import("./mock-store");
    return mockGetAdminUsers(params);
  }

  const token = await getToken();
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.per_page) queryParams.set("per_page", String(params.per_page));
  if (params?.search) queryParams.set("search", params.search);
  if (params?.role) queryParams.set("role", params.role);
  if (params?.status) queryParams.set("status", params.status);

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_URL}/api/v1/admin/users?${queryString}`
    : `${API_URL}/api/v1/admin/users`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {
      success: false,
      message: "Invalid response from server",
    };
  }

  const responseData = await response.json();

  if (response.ok) {
    const users = Array.isArray(responseData) 
      ? responseData 
      : responseData.data ?? [];
    return {
      success: true,
      data: users,
      total: responseData.total,
      per_page: responseData.per_page,
      current_page: responseData.current_page,
      last_page: responseData.last_page,
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to fetch users",
  };
}

export async function getAdminUser(id: number): Promise<ApiResponse<User>> {
  if (isDevModeEnabled()) {
    const { mockGetAdminUser } = await import("./mock-store");
    return mockGetAdminUser(id);
  }

  const token = await getToken();

  const response = await fetch(`${API_URL}/api/v1/admin/users/${id}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {
      success: false,
      message: "Invalid response from server",
    };
  }

  const responseData = await response.json();

  if (response.ok) {
    return {
      success: true,
      data: responseData,
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to fetch user",
  };
}

export async function updateAdminUser(
  id: number, 
  data: Partial<{ name: string; contact_number: string; role_id: number; is_active: number }>
): Promise<ApiResponse<User>> {
  if (isDevModeEnabled()) {
    const { mockUpdateAdminUser } = await import("./mock-store");
    return mockUpdateAdminUser(id, data);
  }

  const token = await getToken();

  const response = await fetch(`${API_URL}/api/v1/admin/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (response.ok) {
    return {
      success: true,
      data: responseData,
      message: responseData.message,
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to update user",
  };
}

export async function deleteAdminUser(id: number): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockDeleteAdminUser } = await import("./mock-store");
    return mockDeleteAdminUser(id);
  }

  const token = await getToken();

  const response = await fetch(`${API_URL}/api/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return { success: true };
  }

  const responseData = await response.json();
  return {
    success: false,
    message: responseData.message || "Failed to delete user",
  };
}

export async function suspendAdminUser(id: number): Promise<ApiResponse<User>> {
  return updateAdminUser(id, { is_active: 0 });
}

export async function activateAdminUser(id: number): Promise<ApiResponse<User>> {
  return updateAdminUser(id, { is_active: 1 });
}

export function getRoleLabel(roleId: number): string {
  const roles: Record<number, string> = {
    1: "Client",
    2: "Builder",
    3: "Admin",
  };
  return roles[roleId] || "Unknown";
}

export function getRoleStyle(role: string): string {
  switch (role.toLowerCase()) {
    case "admin": return "bg-red-50 text-red-600 border-red-100";
    case "builder": return "bg-blue-50 text-blue-600 border-blue-100";
    case "client": return "bg-neutral-50 text-neutral-600 border-neutral-100";
    default: return "bg-neutral-50 text-neutral-600 border-neutral-100";
  }
}

export function getStatusStyle(isActive: number, kycStatus?: string): string {
  if (isActive === 0) return "bg-red-50 text-red-600 border-red-100";
  if (kycStatus === "pending") return "bg-amber-50 text-amber-600 border-amber-100";
  if (kycStatus === "approved") return "bg-teal-50 text-teal-600 border-teal-100";
  return "bg-neutral-50 text-neutral-500 border-neutral-100";
}

export function getStatusLabel(isActive: number, kycStatus?: string): string {
  if (isActive === 0) return "Suspended";
  if (kycStatus === "pending") return "Pending";
  if (kycStatus === "approved") return "Active";
  return "Inactive";
}
