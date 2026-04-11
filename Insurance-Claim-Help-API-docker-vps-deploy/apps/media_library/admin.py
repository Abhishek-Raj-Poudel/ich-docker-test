import os

from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from .models import MediaLibrary


class MediaPreviewAdminMixin:
    @admin.display(description="Preview")
    def file_preview(self, obj: MediaLibrary) -> str:
        if not obj or not obj.file:
            return "-"

        file_url = obj.file.url
        file_name = os.path.basename(obj.file.name)

        if (obj.file_type or "").startswith("image/"):
            return format_html(
                '<a href="{}" target="_blank" rel="noopener noreferrer">'
                '<img src="{}" alt="{}" style="max-height: 96px; max-width: 96px; '
                'object-fit: cover; border-radius: 8px;" />'
                "</a>",
                file_url,
                file_url,
                file_name,
            )

        return format_html(
            '<a href="{}" target="_blank" rel="noopener noreferrer">{}</a>',
            file_url,
            file_name,
        )


@admin.register(MediaLibrary)
class MediaLibraryAdmin(MediaPreviewAdminMixin, ModelAdmin):
    list_display = (
        "id",
        "file_preview",
        "file",
        "file_type",
        "file_size",
        "mediable_type",
        "mediable_id",
        "created_at",
    )
    list_filter = ("mediable_type", "file_type")
    search_fields = ("file", "mediable_id")
    readonly_fields = ("file_preview", "file_size", "created_at", "updated_at")
    fields = (
        "file_preview",
        "file",
        "file_type",
        "file_size",
        "mediable_type",
        "mediable_id",
        "created_at",
        "updated_at",
    )
