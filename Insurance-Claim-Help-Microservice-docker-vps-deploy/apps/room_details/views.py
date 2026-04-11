import os
import uuid
import logging
from datetime import timedelta
from decimal import Decimal

from django.contrib.contenttypes.models import ContentType
from django.core.files.storage import default_storage
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import AnonRateThrottle

from apps.room_details.models import RoomDetail
from apps.media_library.models import MediaLibrary
from apps.materials.services import get_materials_catalog
from apps.repair_items.models import RepairItem
from apps.report.models import Report
from apps.report.services import fetch_property_context_safe
from .gemini import GeminiConfigurationError, run_gemini_room_workflow
from .tasks import run_nerf_pipeline

logger = logging.getLogger(__name__)

MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/jpg"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MIME_MAP = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}

SCAN_MAX_FILE_SIZE_MB = 500
SCAN_MAX_FILE_SIZE_BYTES = SCAN_MAX_FILE_SIZE_MB * 1024 * 1024

SCAN_ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/jpg"}
SCAN_ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

SCAN_ALLOWED_VIDEO_MIME_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo"}
SCAN_ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi"}

SCAN_ALLOWED_MIME_TYPES = SCAN_ALLOWED_IMAGE_MIME_TYPES | SCAN_ALLOWED_VIDEO_MIME_TYPES
SCAN_ALLOWED_EXTENSIONS = SCAN_ALLOWED_IMAGE_EXTENSIONS | SCAN_ALLOWED_VIDEO_EXTENSIONS


class RoomAnalyzeThrottle(AnonRateThrottle):
    scope = "room_analyze"


def _parse_property_id(raw_value) -> tuple[int | None, str | None]:
    if raw_value in (None, ""):
        return None, None

    try:
        property_id = int(raw_value)
    except (TypeError, ValueError):
        return None, "property_id must be a positive integer."

    if property_id <= 0:
        return None, "property_id must be a positive integer."

    return property_id, None


class RoomListView(APIView):
    def get(self, request, property_id=None):
        if property_id is None:
            raw_property_id = request.query_params.get("property_id")
        else:
            raw_property_id = property_id

        property_id, property_error = _parse_property_id(raw_property_id)
        if property_error:
            return Response({"error": property_error}, status=400)

        rooms = RoomDetail.objects.all().order_by("id")
        if property_id is not None:
            rooms = rooms.filter(property_id=property_id)

        return Response(
            [{"room_id": room.id} for room in rooms.only("id")],
            status=200,
        )


def _validate_file(file) -> tuple[bool, str | None]:
    """Validate a single image for RoomAnalyzeView."""
    if file.size > MAX_FILE_SIZE_BYTES:
        return False, f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB."

    content_type = getattr(file, "content_type", "")
    if content_type not in ALLOWED_MIME_TYPES:
        return False, (
            f"Invalid file type '{content_type}'. "
            f"Allowed types: {', '.join(sorted(ALLOWED_MIME_TYPES))}."
        )

    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, (
            f"Invalid file extension '{ext}'. "
            f"Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
        )

    return True, None


def _validate_scan_file(file) -> tuple[bool, str | None]:
    """Validate a single image or video for RoomScanView."""
    if file.size > SCAN_MAX_FILE_SIZE_BYTES:
        return False, (
            f"File '{file.name}' is too large. "
            f"Maximum allowed size is {SCAN_MAX_FILE_SIZE_MB} MB."
        )

    content_type = getattr(file, "content_type", "")
    if content_type not in SCAN_ALLOWED_MIME_TYPES:
        return False, (
            f"Invalid file type '{content_type}' for '{file.name}'. "
            f"Allowed types: images (jpg, png) or videos (mp4, mov, avi)."
        )

    ext = os.path.splitext(file.name)[1].lower()
    if ext not in SCAN_ALLOWED_EXTENSIONS:
        return False, (
            f"Invalid file extension '{ext}' for '{file.name}'. "
            f"Allowed extensions: {', '.join(sorted(SCAN_ALLOWED_EXTENSIONS))}."
        )

    return True, None


def _is_video(file) -> bool:
    ext = os.path.splitext(file.name)[1].lower()
    return ext in SCAN_ALLOWED_VIDEO_EXTENSIONS


def _cleanup(room: RoomDetail | None, media: MediaLibrary | None) -> None:
    if media is not None:
        try:
            if media.file and default_storage.exists(media.file.name):
                default_storage.delete(media.file.name)
            media.delete()
        except Exception:
            logger.exception("Cleanup failed for MediaLibrary id=%s", media.pk)

    if room is not None:
        try:
            room.delete()
        except Exception:
            logger.exception("Cleanup failed for RoomDetail id=%s", room.pk)


def _create_repair_items_and_reports(
    room: RoomDetail,
    repair_estimate: dict,
    materials_catalog: list[dict],
) -> tuple[list[dict], str | None]:
    created_items = []
    reference_number = None
    repair_items = repair_estimate.get("repair_items", [])
    materials_by_id = {
        material["id"]: material["material"] for material in materials_catalog
    }

    if not repair_items:
        return created_items, reference_number

    total_cost = sum(Decimal(str(item["cost"])) for item in repair_items)
    estimated_completion_time = timezone.now() + timedelta(days=max(1, len(repair_items)))
    reference_number = f"RPT-{uuid.uuid4().hex[:10].upper()}"
    property_context = fetch_property_context_safe(room.property_id)

    with transaction.atomic():
        for item in repair_items:
            repair_item = RepairItem.objects.create(
                room_detail=room,
                material_id=item["material_id"],
                quantity=item["quantity"],
                cost=Decimal(str(item["cost"])),
            )
            created_items.append(
                {
                    "id": repair_item.id,
                    "material_id": repair_item.material_id,
                    "material": materials_by_id.get(repair_item.material_id),
                    "quantity": repair_item.quantity,
                    "cost": str(repair_item.cost),
                }
            )

        Report.objects.create(
            reference_number=reference_number,
            estimated_completion_time=estimated_completion_time,
            total_cost=total_cost,
            status=Report.Status.CREATED,
            property_snapshot=property_context.get("property", {}),
            user_snapshot=property_context.get("user", {}),
            room_detail=room,
        )

    return created_items, reference_number


class RoomAnalyzeView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    throttle_classes = [RoomAnalyzeThrottle]

    def post(self, request):
        request_id = uuid.uuid4().hex[:12]
        property_id, property_error = _parse_property_id(request.data.get("property_id"))
        if property_error:
            return Response({"error": property_error}, status=400)

        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded."}, status=400)

        is_valid, error_msg = _validate_file(file)
        if not is_valid:
            logger.warning("[%s] File validation failed: %s", request_id, error_msg)
            return Response({"error": error_msg}, status=400)

        ext = os.path.splitext(file.name)[1].lower()
        mime_type = getattr(file, "content_type", "") or MIME_MAP.get(ext, "image/jpeg")
        image_bytes = file.read()
        file.seek(0)

        materials_catalog = get_materials_catalog()

        try:
            workflow_result = run_gemini_room_workflow(
                image_bytes=image_bytes,
                mime_type=mime_type,
                request_id=request_id,
                materials_catalog=materials_catalog,
            )
        except GeminiConfigurationError as exc:
            logger.warning("[%s] Gemini configuration error: %s", request_id, exc)
            return Response(
                {
                    "error": (
                        "AI analysis is not configured. Set GEMINI_API_KEY in the "
                        "microservice environment and try again."
                    )
                },
                status=503,
            )
        except Exception:
            logger.exception("[%s] Gemini analysis failed before persistence.", request_id)
            return Response(
                {"error": "AI analysis failed. Please try again or contact support."},
                status=500,
            )

        room: RoomDetail | None = None
        media: MediaLibrary | None = None

        try:
            room = RoomDetail.objects.create(
                property_id=property_id,
                window_count=workflow_result["window_count"],
                door_count=workflow_result["door_count"],
                length=0,
                width=0,
                height=0,
                damages=workflow_result["damages"],
            )
            room_ct = ContentType.objects.get_for_model(RoomDetail)
            media = MediaLibrary.objects.create(
                file=file,
                file_type=file.content_type,
                mediable_type=room_ct,
                mediable_id=room.id,
            )
        except Exception:
            logger.exception("[%s] Failed to persist uploaded file.", request_id)
            _cleanup(room, media)
            return Response(
                {"error": "Failed to save uploaded file. Please try again."},
                status=500,
            )

        repair_items = []
        report_reference_number = None
        repair_estimate_error = None

        if materials_catalog:
            try:
                repair_items, report_reference_number = _create_repair_items_and_reports(
                    room=room,
                    repair_estimate={"repair_items": workflow_result["repair_items"]},
                    materials_catalog=materials_catalog,
                )
            except Exception as exc:
                repair_estimate_error = str(exc)
                logger.warning(
                    "[%s] Repair estimate skipped for RoomDetail id=%s: %s",
                    request_id,
                    room.pk,
                    repair_estimate_error,
                )

        logger.info(
            "[%s] Analysis saved: room_id=%s windows=%d doors=%d damages=%d",
            request_id,
            room.id,
            workflow_result["window_count"],
            workflow_result["door_count"],
            len(workflow_result["damages"]),
        )

        return Response(
            {
                "room_id": room.id,
                "property_id": room.property_id,
                "window_count": workflow_result["window_count"],
                "door_count": workflow_result["door_count"],
                "damages": workflow_result["damages"],
                "repair_items": repair_items,
                "report_reference_number": report_reference_number,
                "repair_estimate_status": (
                    "failed" if repair_estimate_error else "created"
                ),
                "repair_estimate_error": repair_estimate_error,
            },
            status=200,
        )


class RoomScanView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    MIN_IMAGES = 10

    def post(self, request):
        property_id, property_error = _parse_property_id(request.data.get("property_id"))
        if property_error:
            return Response({"error": property_error}, status=400)

        files = request.FILES.getlist("files")

        if not files:
            return Response({"error": "No files uploaded."}, status=400)

        for file in files:
            is_valid, error_msg = _validate_scan_file(file)
            if not is_valid:
                return Response({"error": error_msg}, status=400)

        has_video = any(_is_video(f) for f in files)
        if not has_video and len(files) < self.MIN_IMAGES:
            return Response(
                {
                    "error": (
                        f"At least {self.MIN_IMAGES} images are required for 3D "
                        f"reconstruction. Upload more images or a video instead."
                    )
                },
                status=400,
            )

        room = RoomDetail.objects.create(
            property_id=property_id,
            window_count=0,
            door_count=0,
            length=0,
            width=0,
            height=0,
            damages=[],
            processing_status="pending",
        )

        room_ct = ContentType.objects.get_for_model(RoomDetail)

        for file in files:
            MediaLibrary.objects.create(
                file=file,
                file_type=file.content_type,
                mediable_type=room_ct,
                mediable_id=room.id,
            )

        run_nerf_pipeline.delay(room.id)

        return Response(
            {"room_id": room.id, "property_id": room.property_id, "status": "processing"}
        )


class RoomResultView(APIView):

    def get(self, request, room_id):
        try:
            room = RoomDetail.objects.get(id=room_id)
        except RoomDetail.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        return Response(
            {
                "room_id": room.id,
                "property_id": room.property_id,
                "status": room.processing_status,
                "length": room.length,
                "width": room.width,
                "height": room.height,
                "mesh_path": room.mesh_path,
            }
        )
