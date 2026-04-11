from decimal import Decimal, InvalidOperation
from urllib.parse import urlparse

from django.contrib.contenttypes.models import ContentType
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.media_library.models import MediaLibrary
from apps.permissions import ApprovedBuilderKYCRequiredPermission
from apps.property.models import Property
from apps.property.serializers import PropertyWithUserSerializer

from .models import HomeownerReview, JobDetail, JobStatus
from .pdf import build_job_detail_report
from .serializers import HomeownerReviewSerializer
from .services import (
    JobInfoFetchError,
    ReportDownloadError,
    RoomResultFetchError,
    download_report_file,
    fetch_job_info,
    fetch_room_result,
)


def _parse_total_cost(raw_total_cost) -> Decimal:
    try:
        return Decimal(str(raw_total_cost))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError("Microservice returned an invalid total_cost value.") from exc


def _normalize_material_item(item) -> dict:
    if isinstance(item, str):
        material_name = item.strip()
        if not material_name:
            raise ValueError("materials_used must contain non-empty strings only.")
        return {
            "material": material_name,
            "quantity": None,
            "cost": None,
        }

    if not isinstance(item, dict):
        raise ValueError("materials_used must be a list of strings or material objects.")

    material_name = str(item.get("material") or item.get("name") or "").strip()
    if not material_name and item.get("material_id") is not None:
        material_name = f"Material #{item['material_id']}"
    if not material_name:
        raise ValueError("Microservice returned a repair item without a material.")

    quantity = item.get("quantity", item.get("qty"))
    if quantity in ("", None):
        normalized_quantity = None
    else:
        try:
            normalized_quantity = float(quantity)
        except (TypeError, ValueError) as exc:
            raise ValueError("materials_used contains an invalid quantity value.") from exc

    cost = item.get("cost")
    if cost in ("", None):
        normalized_cost = None
    else:
        try:
            normalized_cost = str(Decimal(str(cost)))
        except (InvalidOperation, TypeError, ValueError) as exc:
            raise ValueError("materials_used contains an invalid cost value.") from exc

    return {
        "material": material_name,
        "quantity": normalized_quantity,
        "cost": normalized_cost,
    }


def _extract_material_items(repair_items) -> list[dict]:
    if not isinstance(repair_items, list):
        raise ValueError("Microservice returned an invalid repair_items value.")

    return [_normalize_material_item(item) for item in repair_items]


def _serialize_report_media(request, media: MediaLibrary | None) -> dict | None:
    if media is None:
        return None

    return {
        "id": media.id,
        "file": request.build_absolute_uri(media.file.url),
        "file_type": media.file_type,
        "file_size": media.file_size,
    }


def _serialize_materials_used(job_detail: JobDetail, *, include_live_items: bool = False) -> list[dict]:
    stored_materials = job_detail.materials_used or []
    try:
        normalized_materials = [_normalize_material_item(item) for item in stored_materials]
    except ValueError:
        normalized_materials = []

    has_pricing_data = any(
        material.get("quantity") is not None or material.get("cost") is not None
        for material in normalized_materials
    )
    if normalized_materials and (has_pricing_data or not include_live_items):
        return normalized_materials

    if include_live_items and job_detail.room_id:
        try:
            payload = fetch_job_info(job_detail.room_id)
            return _extract_material_items(payload.get("repair_items", []))
        except (JobInfoFetchError, ValueError):
            return normalized_materials

    return normalized_materials


def _serialize_property(request, property_id: int | None) -> dict | None:
    if not property_id:
        return None

    property_instance = (
        Property.objects.select_related("user__role")
        .prefetch_related("media")
        .filter(id=property_id)
        .first()
    )
    if property_instance is None:
        return None

    return PropertyWithUserSerializer(
        property_instance,
        context={"request": request},
    ).data


def _serialize_room_detail(room_payload: dict | None) -> dict | None:
    if not room_payload:
        return None

    length = room_payload.get("length")
    width = room_payload.get("width")
    height = room_payload.get("height")
    floor_area = None
    try:
        if length is not None and width is not None:
            floor_area = float(length) * float(width)
    except (TypeError, ValueError):
        floor_area = None

    return {
        "id": room_payload.get("room_id"),
        "room_name": f"Room #{room_payload.get('room_id')}",
        "dimensions": {
            "length": length,
            "width": width,
            "ceiling_height": height,
            "floor_area": floor_area,
        },
        "damages": [],
        "scan_status": room_payload.get("status", ""),
        "media": [
            {
                "id": media.get("id"),
                "url": media.get("file", ""),
                "label": media.get("file_type") or "Room analysis upload",
                "created_at": media.get("created_at"),
            }
            for media in room_payload.get("media", [])
            if isinstance(media, dict)
        ],
    }


def _serialize_property_with_room(
    request,
    property_id: int | None,
    room_id: int | None,
) -> dict | None:
    payload = _serialize_property(request, property_id)
    if payload is None:
        return None

    payload["room_details"] = []
    if not room_id:
        return payload

    try:
        room_payload = fetch_room_result(room_id)
    except RoomResultFetchError:
        return payload

    serialized_room = _serialize_room_detail(room_payload)
    if serialized_room is not None:
        payload["room_details"].append(serialized_room)

    return payload


def _can_preview_job_detail(user, job_detail: JobDetail) -> bool:
    if user.id in {job_detail.homeowner_id, job_detail.builder_id}:
        return True

    if job_detail.builder_id is not None or job_detail.status != JobStatus.NOT_STARTED:
        return False

    builder_permission = ApprovedBuilderKYCRequiredPermission()
    request_stub = type("RequestStub", (), {"user": user})()
    return builder_permission.has_permission(request_stub, None)


def _serialize_job_detail(request, job_detail: JobDetail, *, include_property: bool = False) -> dict:
    report_media = job_detail.media.order_by("id").first()
    payload = {
        "id": job_detail.id,
        "homeowner_id": job_detail.homeowner_id,
        "builder_id": job_detail.builder_id,
        "report_id": job_detail.report_id,
        "room_id": job_detail.room_id,
        "property_id": job_detail.property_id,
        "status": job_detail.status,
        "total_cost": str(job_detail.total_cost),
        "report_path": job_detail.report_path,
        "materials_used": _serialize_materials_used(
            job_detail,
            include_live_items=include_property,
        ),
        "notes": job_detail.notes,
        "report_media": _serialize_report_media(request, report_media),
        "created_at": job_detail.created_at,
        "updated_at": job_detail.updated_at,
    }

    if include_property:
        payload["property"] = _serialize_property_with_room(
            request,
            job_detail.property_id,
            job_detail.room_id,
        )

    return payload


def _serialize_homeowner_review(review: HomeownerReview) -> dict:
    return {
        "id": review.id,
        "job_detail_id": review.job_detail_id,
        "user_id": review.user_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
    }


def _store_report_media_bytes(
    job_detail: JobDetail, pdf_bytes: bytes, content_type: str, reference_number: str
) -> MediaLibrary:
    filename = f"job-reports/{reference_number}.pdf"
    content = ContentFile(pdf_bytes, name=filename)
    existing_media = job_detail.media.order_by("id").first()

    if existing_media is not None:
        old_name = existing_media.file.name
        existing_media.file.save(filename, content, save=False)
        existing_media.file_type = content_type
        existing_media.file_size = len(pdf_bytes)
        existing_media.save(
            update_fields=["file", "file_type", "file_size", "updated_at"]
        )
        if (
            old_name
            and old_name != existing_media.file.name
            and default_storage.exists(old_name)
        ):
            default_storage.delete(old_name)
        return existing_media

    job_detail_ct = ContentType.objects.get_for_model(JobDetail)
    return MediaLibrary.objects.create(
        file=content,
        file_type=content_type,
        file_size=len(pdf_bytes),
        mediable_type=job_detail_ct,
        mediable_id=job_detail.id,
    )


def _store_report_media(
    job_detail: JobDetail,
    report_url: str,
    reference_number: str,
    auth_header: str | None = None,
) -> MediaLibrary:
    pdf_bytes, content_type = download_report_file(report_url, auth_header=auth_header)
    return _store_report_media_bytes(job_detail, pdf_bytes, content_type, reference_number)


def _parse_property_id(raw_property_id) -> int:
    try:
        property_id = int(raw_property_id)
    except (TypeError, ValueError) as exc:
        raise ValueError("Microservice returned an invalid property_id value.") from exc

    if property_id <= 0:
        raise ValueError("Microservice returned an invalid property_id value.")

    return property_id


def _get_or_create_job_detail(report_id: int) -> tuple[JobDetail, bool]:
    job_detail = JobDetail.objects.filter(report_id=report_id).order_by("id").first()
    if job_detail is None:
        return JobDetail(report_id=report_id), True
    return job_detail, False


def _parse_reference_number(report_path: str, report_id: int) -> str:
    if report_path:
        path = urlparse(report_path).path
        filename = path.rsplit("/", 1)[-1]
        if filename.endswith(".pdf"):
            return filename[:-4]
    return f"RPT-{report_id}"


def _parse_materials_used(value) -> list[dict]:
    if value is None:
        return []
    if not isinstance(value, list):
        raise ValueError("materials_used must be a list.")

    return [_normalize_material_item(item) for item in value]


def _regenerate_local_report(request, job_detail: JobDetail) -> MediaLibrary:
    property_obj = None
    property_image_sources: list[str] = []
    if job_detail.property_id:
        property_obj = Property.objects.prefetch_related("media").filter(id=job_detail.property_id).first()
        if property_obj is not None:
            property_image_sources = [
                media.file.path
                for media in property_obj.media.all()
                if getattr(media, "file_type", "").startswith("image/")
            ]
    homeowner = job_detail.homeowner
    builder = job_detail.builder
    room_image_sources: list[str] = []
    if job_detail.room_id:
        try:
            room_payload = fetch_room_result(job_detail.room_id)
            room_image_sources = [
                media.get("file", "")
                for media in room_payload.get("media", [])
                if isinstance(media, dict)
                and str(media.get("file_type", "")).startswith("image/")
                and media.get("file")
            ]
        except RoomResultFetchError:
            room_image_sources = []
    reference_number = _parse_reference_number(job_detail.report_path, job_detail.report_id)
    report_media_url = request.build_absolute_uri(f"/media/job-reports/{reference_number}.pdf")
    pdf_bytes = build_job_detail_report(
        job_detail=job_detail,
        property_obj=property_obj,
        homeowner=homeowner,
        builder=builder,
        report_media_url=report_media_url,
        property_image_sources=property_image_sources,
        room_image_sources=room_image_sources,
    )
    report_media = _store_report_media_bytes(
        job_detail,
        pdf_bytes,
        "application/pdf",
        reference_number,
    )
    job_detail.report_path = request.build_absolute_uri(report_media.file.url)
    job_detail.save(update_fields=["report_path", "updated_at"])
    return report_media


class JobDetailSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id):
        auth_header = request.headers.get("Authorization")
        try:
            room_payload = fetch_room_result(room_id, auth_header=auth_header)
            property_id = _parse_property_id(room_payload["property_id"])
            payload = fetch_job_info(room_id, auth_header=auth_header)
            report_id = int(payload["report_id"])
            total_cost = _parse_total_cost(payload.get("total_cost", "0.00"))
            materials_used = _extract_material_items(payload.get("repair_items", []))
            report_path = payload["pdf_url"]
            reference_number = payload["reference_number"]
        except KeyError as exc:
            return Response(
                {"detail": f"Microservice response is missing '{exc.args[0]}'."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except JobInfoFetchError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except RoomResultFetchError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not Property.objects.filter(
            id=property_id, user_id=request.user.id
        ).exists():
            raise PermissionDenied(
                "You do not have permission to create a job for this room."
            )

        job_detail, created = _get_or_create_job_detail(report_id)
        job_detail.homeowner = request.user
        job_detail.builder = None
        job_detail.room_id = room_id
        job_detail.property_id = property_id
        job_detail.status = JobStatus.NOT_STARTED
        job_detail.total_cost = total_cost
        job_detail.report_path = report_path
        job_detail.materials_used = materials_used
        job_detail.save()

        try:
            report_media = _store_report_media(
                job_detail,
                report_path,
                reference_number,
                auth_header=auth_header,
            )
        except ReportDownloadError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        job_detail.report_path = request.build_absolute_uri(report_media.file.url)
        job_detail.save(update_fields=["report_path", "updated_at"])

        return Response(
            {
                "id": job_detail.id,
                "room_id": room_id,
                "homeowner_id": job_detail.homeowner_id,
                "report_id": job_detail.report_id,
                "status": job_detail.status,
                "total_cost": str(job_detail.total_cost),
                "report_path": job_detail.report_path,
                "materials_used": job_detail.materials_used,
                "report_media": _serialize_report_media(request, report_media),
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class JobDetailListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        job_details = (
            JobDetail.objects.filter(homeowner=request.user)
            .select_related("homeowner", "builder")
            .prefetch_related("media")
            .order_by("-created_at")
        )
        return Response(
            [_serialize_job_detail(request, job_detail) for job_detail in job_details]
        )


class JobDetailDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_detail_id):
        job_detail = (
            JobDetail.objects.select_related("homeowner", "builder")
            .prefetch_related("media")
            .filter(id=job_detail_id)
            .first()
        )
        if job_detail is None:
            return Response(
                {"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND
            )
        if not _can_preview_job_detail(request.user, job_detail):
            raise PermissionDenied("You do not have permission to access this job.")
        return Response(_serialize_job_detail(request, job_detail, include_property=True))


class JobDetailUpdateView(APIView):
    permission_classes = [IsAuthenticated, ApprovedBuilderKYCRequiredPermission]

    def patch(self, request, job_detail_id):
        job_detail = get_object_or_404(
            JobDetail.objects.select_related("homeowner", "builder").prefetch_related("media"),
            id=job_detail_id,
        )
        if job_detail.builder_id != request.user.id:
            raise PermissionDenied("Only the assigned builder can modify this job.")

        if job_detail.status == JobStatus.COMPLETED and (
            "total_cost" in request.data or "materials_used" in request.data
        ):
            return Response(
                {
                    "detail": "Completed jobs cannot have total_cost or materials_used changed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_statuses = {choice for choice, _ in JobStatus.choices}
        if "status" in request.data:
            status_value = str(request.data["status"])
            if status_value not in allowed_statuses:
                return Response(
                    {"detail": "Invalid status value."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            job_detail.status = status_value

        if "total_cost" in request.data:
            try:
                job_detail.total_cost = _parse_total_cost(request.data["total_cost"])
            except ValueError as exc:
                return Response(
                    {"detail": str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "materials_used" in request.data:
            try:
                job_detail.materials_used = _parse_materials_used(request.data["materials_used"])
            except ValueError as exc:
                return Response(
                    {"detail": str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "notes" in request.data:
            if request.data["notes"] is None:
                job_detail.notes = ""
            elif not isinstance(request.data["notes"], str):
                return Response(
                    {"detail": "notes must be a string."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:
                job_detail.notes = request.data["notes"]

        job_detail.save()
        _regenerate_local_report(request, job_detail)
        return Response(_serialize_job_detail(request, job_detail, include_property=True))


class AllJobDetailListView(APIView):
    permission_classes = [IsAuthenticated, ApprovedBuilderKYCRequiredPermission]

    def get(self, request):
        job_details = (
            JobDetail.objects.filter(status=JobStatus.NOT_STARTED)
            .select_related("homeowner", "builder")
            .prefetch_related("media")
            .order_by("-created_at")
        )
        return Response(
            [_serialize_job_detail(request, job_detail) for job_detail in job_details]
        )


class BuilderAssignedJobDetailListView(APIView):
    permission_classes = [IsAuthenticated, ApprovedBuilderKYCRequiredPermission]

    def get(self, request):
        job_details = (
            JobDetail.objects.filter(builder=request.user)
            .select_related("homeowner", "builder")
            .prefetch_related("media")
            .order_by("-created_at")
        )
        return Response(
            [_serialize_job_detail(request, job_detail, include_property=True) for job_detail in job_details]
        )


class JobDetailAcceptView(APIView):
    permission_classes = [IsAuthenticated, ApprovedBuilderKYCRequiredPermission]

    def post(self, request, job_detail_id):
        job_detail = (
            JobDetail.objects.select_related("homeowner", "builder")
            .prefetch_related("media")
            .filter(id=job_detail_id)
            .first()
        )
        if job_detail is None:
            return Response(
                {"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if job_detail.status != JobStatus.NOT_STARTED:
            return Response(
                {"detail": "Only not_started jobs can be accepted."},
                status=status.HTTP_409_CONFLICT,
            )

        job_detail.builder = request.user
        job_detail.status = JobStatus.ACCEPTED
        job_detail.save(update_fields=["builder", "status", "updated_at"])
        _regenerate_local_report(request, job_detail)
        return Response(
            _serialize_job_detail(request, job_detail, include_property=True),
            status=status.HTTP_200_OK,
        )


class HomeownerReviewListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_detail_id):
        job_detail = get_object_or_404(JobDetail, id=job_detail_id)
        if request.user.id not in {job_detail.homeowner_id, job_detail.builder_id}:
            raise PermissionDenied("You do not have permission to view reviews for this job.")

        reviews = (
            HomeownerReview.objects.filter(job_detail_id=job_detail_id)
            .select_related("user", "job_detail")
            .order_by("-created_at")
        )
        return Response([_serialize_homeowner_review(review) for review in reviews])

    def post(self, request, job_detail_id):
        job_detail = get_object_or_404(
            JobDetail.objects.select_related("homeowner", "builder"),
            id=job_detail_id,
        )

        if job_detail.homeowner_id != request.user.id:
            raise PermissionDenied(
                "Only the homeowner assigned to this job can create a review."
            )

        serializer = HomeownerReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review, created = HomeownerReview.objects.update_or_create(
            job_detail=job_detail,
            user=request.user,
            defaults={
                "rating": serializer.validated_data["rating"],
                "comment": serializer.validated_data["comment"],
            },
        )

        response_status = (
            status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
        return Response(
            _serialize_homeowner_review(review),
            status=response_status,
        )
