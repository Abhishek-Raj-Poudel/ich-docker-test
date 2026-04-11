import json
import socket
from urllib import error, parse, request

from django.conf import settings


class JobInfoFetchError(Exception):
    pass


class ReportDownloadError(Exception):
    pass


class RoomResultFetchError(Exception):
    pass


def _build_request(url: str, auth_header: str | None = None) -> request.Request:
    headers = {
        "Accept": "application/json, application/pdf;q=0.9, */*;q=0.8",
        "User-Agent": "insurance-claim-help-api/1.0",
    }
    if auth_header:
        headers["Authorization"] = auth_header
    return request.Request(url, headers=headers)


def _microservice_origin() -> str:
    base_url = settings.MICROSERVICE_API_BASE_URL.rstrip("/") + "/"
    parsed_base = parse.urlsplit(base_url)
    return parse.urlunsplit(
        (parsed_base.scheme, parsed_base.netloc, "", "", "")
    ).rstrip("/")


def _resolve_report_download_url(report_url: str) -> str:
    parsed_report_url = parse.urlsplit(report_url)
    microservice_origin = _microservice_origin()
    parsed_microservice_origin = parse.urlsplit(microservice_origin)

    if not parsed_report_url.scheme or not parsed_report_url.netloc:
        return parse.urljoin(microservice_origin + "/", report_url.lstrip("/"))

    if parsed_report_url.hostname in {"127.0.0.1", "localhost", "0.0.0.0"}:
        return parse.urlunsplit(
            (
                parsed_microservice_origin.scheme,
                parsed_microservice_origin.netloc,
                parsed_report_url.path,
                parsed_report_url.query,
                parsed_report_url.fragment,
            )
        )

    return report_url


def fetch_job_info(room_id: int, auth_header: str | None = None) -> dict:
    base_url = settings.MICROSERVICE_API_BASE_URL.rstrip("/") + "/"
    url = parse.urljoin(base_url, f"job-info/{room_id}/")

    try:
        with request.urlopen(_build_request(url, auth_header), timeout=10) as response:
            payload = response.read().decode("utf-8")
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise JobInfoFetchError(
            f"Microservice returned HTTP {exc.code} for room {room_id}: {detail}"
        ) from exc
    except error.URLError as exc:
        raise JobInfoFetchError(
            f"Failed to reach microservice for room {room_id}: {exc.reason}"
        ) from exc
    except (TimeoutError, socket.timeout) as exc:
        raise JobInfoFetchError(
            f"Microservice timed out for room {room_id} after {MICROSERVICE_FETCH_TIMEOUT_SECONDS} seconds."
        ) from exc

    try:
        return json.loads(payload)
    except json.JSONDecodeError as exc:
        raise JobInfoFetchError(
            f"Microservice returned invalid JSON for room {room_id}."
        ) from exc


def fetch_room_result(room_id: int, auth_header: str | None = None) -> dict:
    base_url = settings.MICROSERVICE_API_BASE_URL.rstrip("/") + "/"
    url = parse.urljoin(base_url, f"rooms-result/{room_id}/")

    try:
        with request.urlopen(_build_request(url, auth_header), timeout=10) as response:
            payload = response.read().decode("utf-8")
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RoomResultFetchError(
            f"Microservice returned HTTP {exc.code} for room {room_id}: {detail}"
        ) from exc
    except error.URLError as exc:
        raise RoomResultFetchError(
            f"Failed to reach microservice for room {room_id}: {exc.reason}"
        ) from exc
    except (TimeoutError, socket.timeout) as exc:
        raise RoomResultFetchError(
            f"Microservice timed out for room {room_id} after {MICROSERVICE_FETCH_TIMEOUT_SECONDS} seconds."
        ) from exc

    try:
        return json.loads(payload)
    except json.JSONDecodeError as exc:
        raise RoomResultFetchError(
            f"Microservice returned invalid JSON for room {room_id}."
        ) from exc


def download_report_file(
    report_url: str, auth_header: str | None = None
) -> tuple[bytes, str]:
    resolved_report_url = _resolve_report_download_url(report_url)

    try:
        with request.urlopen(
            _build_request(resolved_report_url, auth_header), timeout=15
        ) as response:
            content_type = response.headers.get_content_type() or "application/pdf"
            payload = response.read()
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise ReportDownloadError(
            f"Report download failed with HTTP {exc.code}: {detail}"
        ) from exc
    except error.URLError as exc:
        raise ReportDownloadError(
            f"Failed to download report from {resolved_report_url}: {exc.reason}"
        ) from exc

    return payload, content_type
