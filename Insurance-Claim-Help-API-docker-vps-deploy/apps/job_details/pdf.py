from decimal import Decimal
from io import BytesIO
from pathlib import Path
from urllib import error, request
from urllib.parse import urlparse

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image as RLImage
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _money(value: Decimal | str) -> str:
    return f"${Decimal(str(value)):,.2f}"


def _label_value_table(rows):
    table = Table(rows, colWidths=[42 * mm, 128 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def _is_image_source(source: str, file_type: str | None = None) -> bool:
    if file_type and file_type.startswith("image/"):
        return True

    suffix = Path(urlparse(source).path).suffix.lower()
    return suffix in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}


def _read_image_bytes(source: str) -> bytes | None:
    try:
        if source.startswith(("http://", "https://")):
            with request.urlopen(source, timeout=10) as response:
                return response.read()

        return Path(source).read_bytes()
    except (OSError, error.URLError, error.HTTPError):
        return None


def _image_flowable(source: str, *, max_width_mm: int = 78, max_height_mm: int = 58):
    payload = _read_image_bytes(source)
    if not payload:
        return None

    image = RLImage(BytesIO(payload))
    width = float(image.imageWidth or 1)
    height = float(image.imageHeight or 1)
    scale = min((max_width_mm * mm) / width, (max_height_mm * mm) / height, 1)
    image.drawWidth = width * scale
    image.drawHeight = height * scale
    h_padding = max(((max_width_mm * mm) - image.drawWidth) / 2, 0)
    v_padding = max(((max_height_mm * mm) - image.drawHeight) / 2, 0)

    return Table(
        [[image]],
        colWidths=[max_width_mm * mm],
        rowHeights=[max_height_mm * mm],
        hAlign="LEFT",
        style=TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), h_padding),
                ("RIGHTPADDING", (0, 0), (-1, -1), h_padding),
                ("TOPPADDING", (0, 0), (-1, -1), v_padding),
                ("BOTTOMPADDING", (0, 0), (-1, -1), v_padding),
            ]
        ),
    )


def _image_gallery(title: str, sources: list[str], section_style, styles):
    image_cells = []
    for source in sources[:6]:
        image_flowable = _image_flowable(source)
        if image_flowable is not None:
            image_cells.append(image_flowable)

    if not image_cells:
        return []

    rows = []
    for index in range(0, len(image_cells), 2):
        row = image_cells[index : index + 2]
        if len(row) == 1:
            row.append("")
        rows.append(row)

    gallery = Table(
        rows,
        colWidths=[82 * mm, 82 * mm],
        hAlign="LEFT",
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        ),
    )
    return [Paragraph(title, section_style), gallery]


def build_job_detail_report(
    *,
    job_detail,
    property_obj,
    homeowner,
    builder,
    report_media_url: str,
    property_image_sources: list[str] | None = None,
    room_image_sources: list[str] | None = None,
) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = styles["Heading1"]
    title_style.textColor = colors.HexColor("#003153")
    section_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading3"],
        textColor=colors.HexColor("#003153"),
        spaceAfter=6,
        spaceBefore=12,
    )
    normal = styles["BodyText"]
    elements = [
        Paragraph("Damage and Expense Report", title_style),
        Paragraph(
            "Updated builder-facing report with current status, cost, materials, and notes.",
            normal,
        ),
        Spacer(1, 8),
        _label_value_table(
            [
                ["Room", f"#{job_detail.room_id or '-'}"],
                ["Reference", _reference_number(job_detail.report_path, job_detail.report_id)],
                ["Status", job_detail.get_status_display()],
                ["Total Cost", _money(job_detail.total_cost)],
                ["Materials", str(len(job_detail.materials_used or []))],
            ]
        ),
        Paragraph("Property Details", section_style),
        _label_value_table(
            [
                ["Property ID", str(job_detail.property_id or "-")],
                ["Address", getattr(property_obj, "address", "-") or "-"],
                ["Type", getattr(property_obj, "property_type", "-") or "-"],
                ["Postcode", getattr(property_obj, "postcode", "-") or "-"],
            ]
        ),
        Paragraph("People", section_style),
        _label_value_table(
            [
                ["Homeowner", getattr(homeowner, "name", "-") or "-"],
                ["Homeowner Email", getattr(homeowner, "email", "-") or "-"],
                ["Homeowner Contact", getattr(homeowner, "contact", "-") or "-"],
                ["Builder", getattr(builder, "name", "-") or "Unassigned"],
                ["Builder Email", getattr(builder, "email", "-") or "-"],
            ]
        ),
        Paragraph("Materials Used", section_style),
        _materials_table(job_detail.materials_used or []),
        Paragraph("Notes", section_style),
        Paragraph((job_detail.notes or "No builder notes added."), normal),
        Spacer(1, 10),
        Paragraph(f"Report File: {report_media_url}", normal),
    ]
    elements.extend(
        _image_gallery(
            "Property Images",
            property_image_sources or [],
            section_style,
            styles,
        )
    )
    elements.extend(
        _image_gallery(
            "Room Analysis Images",
            room_image_sources or [],
            section_style,
            styles,
        )
    )
    doc.build(elements)
    return buffer.getvalue()


def _materials_table(materials):
    rows = [["#", "Material"]]
    if materials:
        for index, material in enumerate(materials, start=1):
            if isinstance(material, dict):
                material_name = str(material.get("material") or "-")
                quantity = material.get("quantity")
                cost = material.get("cost")
                details = material_name
                if quantity is not None:
                    details = f"{details} x{quantity:g}" if isinstance(quantity, (int, float)) else f"{details} x{quantity}"
                if cost not in (None, ""):
                    details = f"{details} (${Decimal(str(cost)):,.2f})"
                rows.append([str(index), details])
            else:
                rows.append([str(index), str(material)])
    else:
        rows.append(["-", "No materials recorded"])

    table = Table(rows, colWidths=[15 * mm, 155 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#003153")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def _reference_number(report_path: str, report_id: int) -> str:
    if report_path:
        path = urlparse(report_path).path
        filename = path.rsplit("/", 1)[-1]
        if filename.endswith(".pdf"):
            return filename[:-4]
    return f"RPT-{report_id}"
