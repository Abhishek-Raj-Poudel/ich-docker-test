from __future__ import annotations

import logging
import time
from urllib.parse import urljoin

import requests
from django.conf import settings


logger = logging.getLogger(__name__)


class PropertyContextError(Exception):
    pass


def _property_api_base_url() -> str:
    return (
        getattr(settings, "INTERNAL_PROPERTY_API_BASE_URL", "").strip()
        or settings.PROPERTY_API_BASE_URL
    )


def fetch_property_context(
    property_id: int, auth_header: str | None = None
) -> dict:
    if property_id <= 0:
        raise PropertyContextError("property_id must be a positive integer.")

    base_url = _property_api_base_url().rstrip("/") + "/"
    url = urljoin(base_url, f"properties/microservice/{property_id}/")
    started_at = time.monotonic()

    logger.info(
        "[property-context] Requesting property_id=%s from %s",
        property_id,
        url,
    )

    try:
        headers = {}
        if auth_header:
            headers["Authorization"] = auth_header
        response = requests.get(url, timeout=10, headers=headers)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.exception(
            "[property-context] Failed property_id=%s after %.2fs from %s",
            property_id,
            time.monotonic() - started_at,
            url,
        )
        raise PropertyContextError(
            f"Failed to fetch property context for property_id={property_id} from {url}."
        ) from exc

    logger.info(
        "[property-context] Received property_id=%s status=%s in %.2fs",
        property_id,
        response.status_code,
        time.monotonic() - started_at,
    )

    try:
        payload = response.json()
    except ValueError as exc:
        logger.exception(
            "[property-context] Invalid JSON for property_id=%s after %.2fs from %s",
            property_id,
            time.monotonic() - started_at,
            url,
        )
        raise PropertyContextError(
            f"Invalid property context response for property_id={property_id} from {url}."
        ) from exc

    property_payload = payload.get("property") or payload
    if not isinstance(property_payload, dict):
        raise PropertyContextError(
            f"Missing property payload for property_id={property_id}."
        )

    user_payload = property_payload.get("owner") or property_payload.get("user") or {}
    if not isinstance(user_payload, dict):
        user_payload = {}

    role_payload = user_payload.get("role") or {}
    if isinstance(role_payload, dict):
        normalized_role = role_payload.get("role") or role_payload.get("name")
    elif isinstance(role_payload, str):
        normalized_role = role_payload
    else:
        normalized_role = None

    full_name = " ".join(
        part
        for part in [
            user_payload.get("first_name"),
            user_payload.get("middle_name"),
            user_payload.get("last_name"),
        ]
        if part
    ).strip()
    normalized_name = user_payload.get("name") or user_payload.get("full_name") or full_name

    property_snapshot = {
        "id": property_payload.get("id", property_id),
        "address_line": property_payload.get("address_line") or property_payload.get("address"),
        "address": property_payload.get("address") or property_payload.get("address_line"),
        "property_type": property_payload.get("property_type"),
        "latitude": property_payload.get("latitude"),
        "longitude": property_payload.get("longitude"),
        "postcode": property_payload.get("postcode"),
        "ownership_verified": property_payload.get("ownership_verified"),
        "ownership_verified_at": property_payload.get("ownership_verified_at"),
        "ownership_rejected": property_payload.get("ownership_rejected"),
        "ownership_reject_reason": property_payload.get("ownership_reject_reason"),
        "media": property_payload.get("media") or [],
        "created_at": property_payload.get("created_at"),
        "updated_at": property_payload.get("updated_at"),
    }
    user_snapshot = {
        "id": user_payload.get("id"),
        "first_name": user_payload.get("first_name"),
        "middle_name": user_payload.get("middle_name"),
        "last_name": user_payload.get("last_name"),
        "name": normalized_name,
        "full_name": normalized_name,
        "email": user_payload.get("email"),
        "contact_number": user_payload.get("contact_number")
        or user_payload.get("contact"),
        "address_line_1": user_payload.get("address_line_1"),
        "city": user_payload.get("city"),
        "postcode": user_payload.get("postcode"),
        "property_type": user_payload.get("property_type"),
        "email_verified": user_payload.get("email_verified")
        if "email_verified" in user_payload
        else user_payload.get("is_email_verified"),
        "email_verified_at": user_payload.get("email_verified_at"),
        "kyc_status": user_payload.get("kyc_status"),
        "kyc_approved_at": user_payload.get("kyc_approved_at"),
        "agree_to_terms": user_payload.get("agree_to_terms"),
        "role_id": user_payload.get("role_id") or role_payload.get("id")
        if isinstance(role_payload, dict)
        else user_payload.get("role_id"),
        "role_name": user_payload.get("role_name") or normalized_role,
        "role": user_payload.get("role_name") or normalized_role,
        "created_at": user_payload.get("created_at"),
        "updated_at": user_payload.get("updated_at"),
    }

    return {
        "property": property_snapshot,
        "user": user_snapshot,
    }


def fetch_property_context_safe(
    property_id: int | None, auth_header: str | None = None
) -> dict:
    if not property_id:
        return {"property": {}, "user": {}}

    try:
        return fetch_property_context(property_id, auth_header=auth_header)
    except PropertyContextError:
        logger.exception(
            "Unable to load property context for property_id=%s",
            property_id,
        )
        return {"property": {}, "user": {}}
