import { isDevModeEnabled } from "./dev-mode";
import { getAuthToken } from "./app-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Review {
  id: number;
  job_details_id: number;
  user_id: number;
  rating: number;
  review: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

async function getToken(): Promise<string> {
  return getAuthToken();
}

export async function submitReview(
  jobDetailsId: number, 
  rating: number, 
  review: string
): Promise<{ success: boolean; data?: Review; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockSubmitReview } = await import("./mock-store");
    return mockSubmitReview(jobDetailsId, rating, review);
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        job_details_id: jobDetailsId,
        rating,
        review
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
      message: responseData.message || "Failed to submit review",
    };
  } catch (error) {
    console.error("Submit review error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server.",
    };
  }
}

export async function listReviews(): Promise<{ success: boolean; data?: Review[]; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockListReviews } = await import("./mock-store");
    return mockListReviews();
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/reviews`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    
    if (response.ok) {
      const reviews = Array.isArray(responseData) ? responseData : responseData.data ?? [];
      return {
        success: true,
        data: reviews,
      };
    }

    return {
      success: false,
      message: responseData.message || "Failed to fetch reviews",
    };
  } catch (error) {
    console.error("List reviews error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server.",
    };
  }
}

export async function getJobReview(jobDetailsId: number): Promise<{ success: boolean; data?: Review; message?: string }> {
  if (isDevModeEnabled()) {
    const { mockGetJobReview } = await import("./mock-store");
    return mockGetJobReview(jobDetailsId);
  }

  try {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/reviews?job_details_id=${jobDetailsId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    
    if (response.ok) {
      const reviews = Array.isArray(responseData) ? responseData : responseData.data ?? [];
      return {
        success: true,
        data: reviews[0],
      };
    }

    return {
      success: false,
      message: responseData.message || "Failed to fetch review",
    };
  } catch (error) {
    console.error("Get review error:", error);
    return {
      success: false,
      message: "Network error: Unable to connect to the server.",
    };
  }
}
