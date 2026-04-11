import { isDevModeEnabled } from "./dev-mode";
import { getAuthToken } from "./app-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Message {
  id: number;
  job_details_id: number;
  user_id: number;
  sender_name: string;
  sender_role: "client" | "builder" | "admin";
  message: string;
  type: "text" | "photo";
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

async function getToken(): Promise<string> {
  return getAuthToken();
}

export async function getChatHistory(jobId: number | string): Promise<{ success: boolean; data?: Message[]; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGetChatHistory } = await import("./mock-store");
    return mockGetChatHistory(jobId);
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/v1/jobs/${jobId}/messages`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    if (response.ok) {
      return { success: true, data: responseData.data || responseData };
    }
    return { success: false, message: responseData.message || "Failed to fetch chat history" };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function sendMessage(
  jobId: number | string, 
  data: { message: string, type: "text" | "photo", attachment_url?: string }
): Promise<{ success: boolean; data?: Message; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockSendMessage } = await import("./mock-store");
    return mockSendMessage(jobId, data);
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/v1/jobs/${jobId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (response.ok) {
      return { success: true, data: responseData.data || responseData };
    }
    return { success: false, message: responseData.message || "Failed to send message" };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function getUnreadCount(jobId: number | string): Promise<{ success: boolean; count?: number; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGetUnreadCount } = await import("./mock-store");
    return mockGetUnreadCount(jobId);
  }

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/v1/jobs/${jobId}/messages/unread`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    if (response.ok) {
      return { success: true, count: responseData.unread_count ?? responseData.count ?? 0 };
    }
    return { success: false, message: responseData.message || "Failed to fetch unread count" };
  } catch {
    return { success: false, message: "Network error" };
  }
}
