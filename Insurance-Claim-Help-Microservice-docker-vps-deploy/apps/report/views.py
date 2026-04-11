import ast
import json
import logging
import time
import uuid
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import Http404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.report.pdf import build_report_pdf
from apps.report.models import Report
from apps.report.services import fetch_property_context_safe
from apps.repair_items.models import RepairItem
from apps.room_details.models import RoomDetail

logger = logging.getLogger(__name__)


def _has_meaningful_property_context(property_snapshot: dict, user_snapshot: dict) -> bool:
    property_snapshot = property_snapshot or {}
    user_snapshot = user_snapshot or {}

    property_has_values = any(
        property_snapshot.get(field)
        for field in ["address_line", "address", "property_type", "latitude", "longitude"]
    )
    user_has_values = any(
        user_snapshot.get(field)
        for field in [
            "name",
            "full_name",
            "first_name",
            "last_name",
            "email",
            "contact_number",
        ]
    )

    return property_has_values or user_has_values


def _needs_property_context_refresh(property_snapshot: dict, user_snapshot: dict) -> bool:
    if not _has_meaningful_property_context(property_snapshot, user_snapshot):
        return True

    user_snapshot = user_snapshot or {}
    return not user_snapshot.get("contact_number")


def _parse_damages(value):
    if value in (None, ""):
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (TypeError, ValueError):
            try:
                parsed = ast.literal_eval(value)
            except (ValueError, SyntaxError):
                return value
            return parsed
    return value


def _build_media_url(request, media) -> str:
    file_name = media.file.name

    if media.file.storage.exists(file_name):
        return request.build_absolute_uri(media.file.url)

    if file_name.startswith("media/"):
        normalized_name = file_name.removeprefix("media/")
        if media.file.storage.exists(normalized_name):
            return request.build_absolute_uri(f"{settings.MEDIA_URL}{normalized_name}")

    return request.build_absolute_uri(media.file.url)


def _media_local_path(media) -> str | None:
    file_name = media.file.name

    if media.file.storage.exists(file_name):
        return getattr(media.file, "path", None)

    if file_name.startswith("media/"):
        normalized_name = file_name.removeprefix("media/")
        if media.file.storage.exists(normalized_name):
            return str(Path(settings.MEDIA_ROOT) / normalized_name)

    return getattr(media.file, "path", None)


def _serialize_repair_items(repair_items):
    return [
        {
            "id": repair_item.id,
            "material_id": repair_item.material_id,
            "material": repair_item.material.material,
            "quantity": repair_item.quantity,
            "cost": str(repair_item.cost),
        }
        for repair_item in repair_items
    ]


def _build_report_response_payload(request, room_id):
    request_id = uuid.uuid4().hex[:12]
    started_at = time.monotonic()
    auth_header = request.headers.get("Authorization")
    logger.info("[job-info:%s] Starting payload build for room_id=%s", request_id, room_id)

    try:
        room = RoomDetail.objects.prefetch_related("media", "repair_items__material").get(id=room_id)
    except RoomDetail.DoesNotExist as exc:
        logger.warning("[job-info:%s] Room not found for room_id=%s", request_id, room_id)
        raise Http404("Room not found") from exc

    logger.info(
        "[job-info:%s] Loaded room room_id=%s property_id=%s status=%s in %.2fs",
        request_id,
        room.id,
        room.property_id,
        getattr(room, "processing_status", None),
        time.monotonic() - started_at,
    )

    report = Report.objects.filter(room_detail_id=room_id).order_by("-id").first()
    repair_items = RepairItem.objects.filter(room_detail_id=room_id).select_related("material")
    property_context = {"property": {}, "user": {}}

    if report is not None:
        if not _needs_property_context_refresh(
            report.property_snapshot,
            report.user_snapshot,
        ):
            property_context = {
                "property": report.property_snapshot or {},
                "user": report.user_snapshot or {},
            }
            logger.info(
                "[job-info:%s] Reused cached property context for room_id=%s report_id=%s in %.2fs",
                request_id,
                room_id,
                report.id,
                time.monotonic() - started_at,
            )
        elif room.property_id:
            property_context_started_at = time.monotonic()
            property_context = fetch_property_context_safe(
                room.property_id,
                auth_header=auth_header,
            )
            logger.info(
                "[job-info:%s] Refreshed property context for property_id=%s in %.2fs",
                request_id,
                room.property_id,
                time.monotonic() - property_context_started_at,
            )
            if property_context["property"] or property_context["user"]:
                report.property_snapshot = property_context["property"]
                report.user_snapshot = property_context["user"]
                report.save(update_fields=["property_snapshot", "user_snapshot"])
    elif room.property_id:
        property_context_started_at = time.monotonic()
        property_context = fetch_property_context_safe(
            room.property_id,
            auth_header=auth_header,
        )
        logger.info(
            "[job-info:%s] Loaded property context for property_id=%s in %.2fs",
            request_id,
            room.property_id,
            time.monotonic() - property_context_started_at,
        )

    media_items = [
        {
            "id": media.id,
            "file": _build_media_url(request, media),
            "file_type": media.file_type,
            "image_path": _media_local_path(media),
        }
        for media in room.media.all().order_by("id")
    ]
    repair_item_rows = _serialize_repair_items(repair_items)
    total_repair_cost = sum(
        (Decimal(str(item["cost"])) for item in repair_item_rows),
        Decimal("0.00"),
    )

    logger.info(
        "[job-info:%s] Prepared room assets media=%s repair_items=%s in %.2fs",
        request_id,
        len(media_items),
        len(repair_item_rows),
        time.monotonic() - started_at,
    )

    if report is None:
        report = Report.objects.create(
            reference_number=f"RPT-{uuid.uuid4().hex[:10].upper()}",
            estimated_completion_time=timezone.now() + timedelta(days=max(1, len(repair_item_rows))),
            total_cost=total_repair_cost,
            status=Report.Status.CREATED,
            property_snapshot=property_context["property"],
            user_snapshot=property_context["user"],
            room_detail=room,
        )
        logger.info(
            "[job-info:%s] Created report report_id=%s reference=%s in %.2fs",
            request_id,
            report.id,
            report.reference_number,
            time.monotonic() - started_at,
        )

    context = {
        "primary_color": "#003153",
        "room_id": room.id,
        "damages": _parse_damages(room.damages),
        "media": media_items,
        "repair_items": repair_item_rows,
        "report": {
            "id": report.id,
            "reference_number": report.reference_number,
            "estimated_completion_time": report.estimated_completion_time,
            "total_cost": str(report.total_cost),
            "status": report.status,
        },
        "total_repair_cost": f"{total_repair_cost:.2f}",
        "repair_item_count": len(repair_item_rows),
        "damage_count": len(_parse_damages(room.damages)),
        "media_count": len(media_items),
        "property": property_context["property"],
        "user": property_context["user"],
    }
    pdf_bytes = build_report_pdf(
        {
            "room_id": room.id,
            "property_id": room.property_id,
            "reference_number": context["report"]["reference_number"],
            "report_id": str(context["report"]["id"]),
            "report_status": context["report"]["status"].title(),
            "estimated_completion_time": str(context["report"]["estimated_completion_time"]),
            "total_cost": context["report"]["total_cost"],
            "repair_item_count": context["repair_item_count"],
            "damages": context["damages"],
            "repair_items": context["repair_items"],
            "media": context["media"],
        "property": context["property"],
        "user": context["user"],
        }
    )
    logger.info(
        "[job-info:%s] Built PDF bytes=%s for report_id=%s in %.2fs",
        request_id,
        len(pdf_bytes),
        report.id,
        time.monotonic() - started_at,
    )
    filename = f"{context['report']['reference_number']}.pdf"
    storage_path = f"reports/{filename}"

    if default_storage.exists(storage_path):
        default_storage.delete(storage_path)

    saved_path = default_storage.save(storage_path, ContentFile(pdf_bytes))
    pdf_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{saved_path}")

    logger.info(
        "[job-info:%s] Saved PDF path=%s and completed room_id=%s report_id=%s total_time=%.2fs",
        request_id,
        saved_path,
        room_id,
        report.id,
        time.monotonic() - started_at,
    )

    return {
        "room_id": room.id,
        "report_id": context["report"]["id"],
        "reference_number": context["report"]["reference_number"],
        "pdf_url": pdf_url,
        "total_cost": context["report"]["total_cost"],
        "repair_items": repair_item_rows,
    }


class ReportsByRoomView(APIView):
    def get(self, request, room_id):
        payload = _build_report_response_payload(request, room_id)
        return Response(
            {
                "room_id": payload["room_id"],
                "report_id": payload["report_id"],
                "reference_number": payload["reference_number"],
                "pdf_url": payload["pdf_url"],
            },
            status=200,
        )


class JobInfoView(APIView):
    def get(self, request, room_id):
        payload = _build_report_response_payload(request, room_id)
        return Response(payload, status=200)
