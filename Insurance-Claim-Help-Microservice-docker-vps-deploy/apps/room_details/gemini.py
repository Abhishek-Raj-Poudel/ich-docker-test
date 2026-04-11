import os
import json
import base64
import logging
import concurrent.futures

import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)

GEMINI_TIMEOUT_SECONDS = 30

GEMINI_PROMPT = """
You are an expert room inspector. Analyse this room image carefully and return ONLY a
valid JSON object — no markdown, no extra text — in exactly this shape:

{
  "window_count": <integer>,
  "door_count": <integer>,
  "damages": [
    {
      "type": "<damage type, e.g. crack, water stain, mould, peeling paint, broken tile>",
      "location": "<where in the room, e.g. ceiling, left wall, floor>",
      "severity": "<low | medium | high>"
    }
  ]
}

Rules:
- Count every visible window and door, including partially visible ones.
- List every type of damage you can see. If there is no damage, return an empty array.
- Return ONLY the JSON. No explanation, no markdown code fences.
"""

GEMINI_ROOM_WORKFLOW_PROMPT_TEMPLATE = """
You are an expert room inspector and insurance repair estimator. Analyse this room image
carefully and return ONLY a valid JSON object, with no markdown and no extra text, in
exactly this shape:

{{
  "window_count": <integer>,
  "door_count": <integer>,
  "damages": [
    {{
      "type": "<damage type, e.g. crack, water stain, mould, peeling paint, broken tile>",
      "location": "<where in the room, e.g. ceiling, left wall, floor>",
      "severity": "<low | medium | high>"
    }}
  ],
  "repair_items": [
    {{
      "material_id": <integer from the available materials list>,
      "quantity": <integer greater than 0>,
      "cost": <number with up to 2 decimal places>
    }}
  ]
}}

Rules:
- Count every visible window and door, including partially visible ones.
- List every visible type of damage. If there is no damage, return an empty array.
- Use only material_id values from the available materials list for repair_items.
- Include repair items only when there is visible damage or a clearly necessary repair.
- If no repair is needed, return an empty array for repair_items.
- Quantity must be a positive integer.
- Cost must be a non-negative number.
- Return ONLY the JSON. No explanation, no markdown code fences.

Available materials:
{materials_catalog}
"""

def _get_gemini_model():
    api_key = (
        getattr(settings, "GEMINI_API_KEY", None)
        or os.environ.get("GEMINI_API_KEY")
        or getattr(settings, "GOOGLE_API_KEY", None)
        or os.environ.get("GOOGLE_API_KEY")
    )

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. "
            "Define it before calling the room-analysis endpoint."
        )

    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-flash")


def _run_with_timeout(callable_):
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(callable_)
            try:
                return future.result(timeout=GEMINI_TIMEOUT_SECONDS)
            except concurrent.futures.TimeoutError:
                raise RuntimeError(
                    f"Gemini API timed out after {GEMINI_TIMEOUT_SECONDS}s."
                )
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"Gemini API call failed: {exc}") from exc


def _parse_json_response(response, request_id: str, log_label: str) -> dict:
    raw_text = response.text.strip()
    logger.debug("[%s] Gemini %s response: %s", request_id, log_label, raw_text)

    if raw_text.startswith("```"):
        parts = raw_text.split("```")
        raw_text = parts[1] if len(parts) > 1 else raw_text
        if raw_text.lower().startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as exc:
        logger.error("[%s] Non-JSON Gemini %s response: %s", request_id, log_label, raw_text)
        raise RuntimeError(f"Gemini returned non-JSON response: {exc}") from exc


def run_gemini_room_workflow(
    image_bytes: bytes,
    mime_type: str,
    request_id: str,
    materials_catalog: list[dict] | None = None,
) -> dict:
    image_part = {
        "inline_data": {
            "mime_type": mime_type,
            "data": base64.b64encode(image_bytes).decode("utf-8"),
        }
    }

    prompt = GEMINI_ROOM_WORKFLOW_PROMPT_TEMPLATE.format(
        materials_catalog=json.dumps(materials_catalog or [], ensure_ascii=True),
    )

    response = _run_with_timeout(
        lambda: _get_gemini_model().generate_content([prompt, image_part])
    )
    data = _parse_json_response(response, request_id, "workflow")

    result = {
        "window_count": _safe_int(data.get("window_count", 0)),
        "door_count": _safe_int(data.get("door_count", 0)),
        "damages": data.get("damages", []),
        "repair_items": [],
    }

    valid_material_ids = {item["id"] for item in materials_catalog or []}
    for item in data.get("repair_items", []):
        if not isinstance(item, dict):
            continue

        material_id = _safe_int(item.get("material_id"))
        quantity = _safe_int(item.get("quantity"))
        cost = _safe_float(item.get("cost"))

        if material_id not in valid_material_ids:
            continue
        if quantity <= 0 or cost < 0:
            continue

        result["repair_items"].append(
            {
                "material_id": material_id,
                "quantity": quantity,
                "cost": cost,
            }
        )

    logger.info(
        "[%s] Gemini workflow complete: windows=%d doors=%d damages=%d repair_items=%d",
        request_id,
        result["window_count"],
        result["door_count"],
        len(result["damages"]),
        len(result["repair_items"]),
    )
    return result


def run_gemini_analysis(image_bytes: bytes, mime_type: str, request_id: str) -> dict:
    result = run_gemini_room_workflow(
        image_bytes=image_bytes,
        mime_type=mime_type,
        request_id=request_id,
        materials_catalog=[],
    )
    return {
        "window_count": result["window_count"],
        "door_count": result["door_count"],
        "damages": result["damages"],
    }


def run_gemini_repair_estimate(
    image_bytes: bytes,
    mime_type: str,
    request_id: str,
    room_analysis: dict,
    materials_catalog: list[dict],
) -> dict:
    del room_analysis
    result = run_gemini_room_workflow(
        image_bytes=image_bytes,
        mime_type=mime_type,
        request_id=request_id,
        materials_catalog=materials_catalog,
    )
    return {"repair_items": result["repair_items"]}


def _safe_int(value, default: int = 0) -> int:
    """Coerce *value* to int, returning *default* on any failure."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _safe_float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default
