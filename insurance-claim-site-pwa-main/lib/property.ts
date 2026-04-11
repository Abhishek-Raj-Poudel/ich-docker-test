import { isDevModeEnabled } from "./dev-mode";
import { getAuthToken } from "./app-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiPropertyMedia {
  id: number;
  file?: string;
  url?: string;
  label?: string;
}

interface ApiProperty {
  id: number;
  user_id?: number;
  address?: string;
  property_type: string;
  latitude?: number | string;
  longitude?: number | string;
  postcode?: string;
  created_at: string;
  updated_at: string;
  media?: ApiPropertyMedia[];
}

export interface Property {
  id: number;
  user_id: number;
  address_line: string;
  address_line_1?: string;
  address_line_2?: string;
  postcode?: string;
  property_type: "rented" | "owned" | string;
  latitude?: number;
  longitude?: number;
  ownership_verified: boolean;
  created_at: string;
  updated_at: string;
  media?: Array<{ id: number; url: string; label?: string }>;
}

export interface CreatePropertyData {
  address_line: string;
  postcode: string;
  property_type: "rented" | "owned" | string;
  latitude: number;
  longitude: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function getToken(): Promise<string> {
  return getAuthToken();
}

function mapProperty(apiProperty: ApiProperty): Property {
  const address = apiProperty.address || "";

  return {
    id: apiProperty.id,
    user_id: apiProperty.user_id || 0,
    address_line: address,
    address_line_1: address,
    postcode: apiProperty.postcode || "",
    property_type: apiProperty.property_type,
    latitude:
      typeof apiProperty.latitude === "string"
        ? parseFloat(apiProperty.latitude)
        : apiProperty.latitude,
    longitude:
      typeof apiProperty.longitude === "string"
        ? parseFloat(apiProperty.longitude)
        : apiProperty.longitude,
    ownership_verified: true,
    created_at: apiProperty.created_at,
    updated_at: apiProperty.updated_at,
    media: (apiProperty.media || []).map((media) => ({
      id: media.id,
      url: media.url || media.file || "",
      label: media.label,
    })),
  };
}

export async function createProperty(data: CreatePropertyData): Promise<{ success: boolean; property?: Property; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockCreateProperty } = await import("./mock-store");
    return mockCreateProperty(data) as { success: boolean; property?: Property; message?: string };
  }

  try {
    const token = await getToken();
    const formData = new FormData();
    formData.append("address", data.address_line);
    formData.append("property_type", data.property_type);
    formData.append("postcode", data.postcode.trim().toUpperCase());
    formData.append("latitude", String(data.latitude));
    formData.append("longitude", String(data.longitude));

    const response = await fetch(`${API_URL}/api/properties/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {
        success: false,
        message: response.ok ? "Property created successfully" : "Failed to create property",
      };
    }

    const responseData = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        property: mapProperty(responseData),
        message: responseData.message,
      };
    }

    return {
      success: false,
      message: responseData.message || responseData.error || "Failed to create property",
    };
  } catch (error) {
    console.error("Property creation error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server. Please check if the backend is running.",
    };
  }
}

export async function getMyProperties(): Promise<ApiResponse<Property[]>> {
  if (isDevModeEnabled()) {
    const { mockGetMyProperties } = await import("./mock-store");
    return mockGetMyProperties() as ApiResponse<Property[]>;
  }

  try {
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/properties/`, {
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
      const properties = Array.isArray(responseData) 
        ? responseData 
        : responseData.data ?? [];
      return {
        success: true,
        data: properties.map(mapProperty),
      };
    }

    return {
      success: false,
      message: responseData.message || "Failed to fetch properties",
    };
  } catch (error) {
    console.error("Fetch properties error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server.",
    };
  }
}

export async function getProperty(id: number): Promise<ApiResponse<Property>> {
  if (isDevModeEnabled()) {
    const { mockGetProperty } = await import("./mock-store");
    return mockGetProperty(id) as ApiResponse<Property>;
  }

  const token = await getToken();

  const response = await fetch(`${API_URL}/api/properties/${id}/`, {
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
      data: mapProperty(responseData),
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to fetch property",
  };
}

export async function updateProperty(id: number, data: Partial<CreatePropertyData>): Promise<{ success: boolean; property?: Property; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockUpdateProperty } = await import("./mock-store");
    return mockUpdateProperty(id, data) as { success: boolean; property?: Property; message?: string };
  }

  const token = await getToken();

  const formData = new FormData();
  if (data.address_line) formData.append("address", data.address_line);
  if (data.property_type) formData.append("property_type", data.property_type);
  if (data.postcode) formData.append("postcode", data.postcode.trim().toUpperCase());
  if (typeof data.latitude === "number") {
    formData.append("latitude", String(data.latitude));
  }
  if (typeof data.longitude === "number") {
    formData.append("longitude", String(data.longitude));
  }

  const response = await fetch(`${API_URL}/api/properties/${id}/`, {
    method: "PATCH",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  const responseData = await response.json();

  if (response.ok) {
    return {
      success: true,
      property: mapProperty(responseData),
      message: responseData.message,
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to update property",
  };
}

export async function deleteProperty(id: number): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockDeleteProperty } = await import("./mock-store");
    return mockDeleteProperty(id);
  }

  const token = await getToken();

  const response = await fetch(`${API_URL}/api/properties/${id}/`, {
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
    message: responseData.message || "Failed to delete property",
  };
}

export async function uploadOwnershipProof(propertyId: number, file: File): Promise<{ success: boolean; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockUploadOwnershipProof } = await import("./mock-store");
    return mockUploadOwnershipProof(propertyId, file.name);
  }

  const token = await getToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mediable_type", "property");
  formData.append("mediable_id", String(propertyId));

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
      message: responseData.message || "Document uploaded successfully",
    };
  }

  return {
    success: false,
    message: responseData.message || "Failed to upload document",
  };
}
