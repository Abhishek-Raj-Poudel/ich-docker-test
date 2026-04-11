import { isDevModeEnabled } from "./dev-mode";

const MICROSERVICE_URL =
  process.env.NEXT_PUBLIC_MICROSERVICE_URL || "http://localhost:8080";

export interface RoomAnalysisDamage {
  type?: string;
  location?: string;
  severity?: string;
  area?: number;
  notes?: string;
}

export interface RoomAnalyzeResult {
  room_id: number;
  window_count: number;
  door_count: number;
  damages: RoomAnalysisDamage[];
}

function buildMockAnalysisResult(fileName: string): RoomAnalyzeResult {
  const lowerName = fileName.toLowerCase();
  const inferredType = lowerName.includes("fire")
    ? "fire"
    : lowerName.includes("storm")
      ? "storm"
      : lowerName.includes("impact")
        ? "impact"
        : lowerName.includes("subsidence")
          ? "subsidence"
          : "water";

  return {
    room_id: Date.now(),
    window_count: 1,
    door_count: 1,
    damages: [
      {
        type: inferredType,
        location: "visible surface area",
        severity: "medium",
        area: 3.5,
        notes: "Mock AI analysis generated in dev mode.",
      },
    ],
  };
}

export async function analyzeRoomImage(
  file: File,
  propertyId?: number,
): Promise<{ success: boolean; data?: RoomAnalyzeResult; message?: string }> {
  if (isDevModeEnabled()) {
    return {
      success: true,
      data: buildMockAnalysisResult(file.name),
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    if (typeof propertyId === "number") {
      formData.append("property_id", String(propertyId));
    }

    const response = await fetch(`${MICROSERVICE_URL}/api/rooms-analyze/`, {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message:
          responseData.error ||
          responseData.detail ||
          "Failed to analyze room image",
      };
    }

    return {
      success: true,
      data: responseData as RoomAnalyzeResult,
    };
  } catch {
    return {
      success: false,
      message: "Network error: Unable to reach the image analysis service.",
    };
  }
}
