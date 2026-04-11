import { isDevModeEnabled } from "./dev-mode";
import { getAuthToken } from "./app-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Room {
  id: number;
  property_id: number;
  remote_room_id?: number;
  room_name: string;
  window_count: number;
  door_count: number;
  dimensions: {
    floor_area: number;
    ceiling_height: number;
    wall_lengths?: number[];
  };
  damages: Array<{
    type: string;
    severity: string;
    area: number;
    notes: string;
  }>;
  scan_status: "pending" | "processing" | "complete";
  created_at: string;
  updated_at: string;
  media?: Array<{
    id: number;
    url: string;
    label?: string;
    created_at?: string;
    estimated_material_cost?: number;
  }>;
}

export interface CreateRoomData {
  property_id: number;
  room_name: string;
  window_count: number;
  door_count: number;
  dimensions: {
    floor_area: number;
    ceiling_height: number;
  };
  damages: Array<{
    type: string;
    severity: string;
    area: number;
    notes: string;
  }>;
  media?: Array<{
    url: string;
    label?: string;
    estimated_material_cost?: number;
  }>;
}

async function getToken(): Promise<string> {
  return getAuthToken();
}

export async function addRoom(data: CreateRoomData): Promise<{ success: boolean; data?: Room; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockAddRoom } = await import("./mock-store");
    return mockAddRoom(data);
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/room-details`, {
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
      return {
        success: true,
        data: responseData,
      };
    }

    return {
      success: false,
      message: responseData.message || "Failed to add room",
    };
  } catch (error) {
    console.error("Add room error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server.",
    };
  }
}

export async function listRooms(propertyId: number): Promise<{ success: boolean; data?: Room[]; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockListRooms } = await import("./mock-store");
    return mockListRooms(propertyId);
  }

  const token = await getToken();
  
  const response = await fetch(`${API_URL}/api/v1/room-details?property_id=${propertyId}`, {
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
      data: responseData,
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to fetch rooms",
  };
}

export async function getRoom(id: number): Promise<{ success: boolean; data?: Room; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGetRoom } = await import("./mock-store");
    return mockGetRoom(id);
  }

  const token = await getToken();
  
  const response = await fetch(`${API_URL}/api/v1/room-details/${id}`, {
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
      data: responseData,
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to fetch room detail",
  };
}

export async function uploadRoomPhoto(roomId: number, file: File): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockUploadRoomPhoto } = await import("./mock-store");
    return mockUploadRoomPhoto(roomId, file.name);
  }

  const token = await getToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mediable_type", "room_detail");
  formData.append("mediable_id", String(roomId));

  const response = await fetch(`${API_URL}/api/v1/media`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
    body: formData,
  });

  const responseData = await response.json();

  if (response.ok) {
    return {
      success: true,
      message: responseData.message || "Photo uploaded successfully",
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to upload photo",
  };
}

export interface UpdateRoomData {
  dimensions?: {
    floor_area?: number;
    ceiling_height?: number;
    wall_lengths?: number[];
  };
  damages?: Array<{
    type: string;
    severity: string;
    area: number;
    notes: string;
  }>;
  media?: Array<{
    id: number;
    url: string;
    label?: string;
    created_at?: string;
    estimated_material_cost?: number;
  }>;
}

export async function updateRoom(id: number, data: UpdateRoomData): Promise<{ success: boolean; data?: Room; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockUpdateRoom } = await import("./mock-store");
    return mockUpdateRoom(id, data as never);
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/room-details/${id}`, {
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
      };
    }

    return {
      success: false,
      message: responseData.message || "Failed to update room",
    };
  } catch (error) {
    console.error("Update room error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server.",
    };
  }
}
