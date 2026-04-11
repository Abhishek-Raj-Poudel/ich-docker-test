from django.contrib import admin
from unfold.admin import GenericTabularInline, ModelAdmin

from apps.media_library.admin import MediaPreviewAdminMixin
from apps.media_library.models import MediaLibrary

from .models import Property


class PropertyMediaInline(MediaPreviewAdminMixin, GenericTabularInline):
    model = MediaLibrary
    ct_field = "mediable_type"
    ct_fk_field = "mediable_id"
    extra = 1
    fields = ("file_preview", "file", "file_type", "file_size", "created_at")
    readonly_fields = ("file_preview", "file_type", "file_size", "created_at")


@admin.register(Property)
class PropertyAdmin(ModelAdmin):
    inlines = (PropertyMediaInline,)
    list_display = (
        "id",
        "user",
        "property_type",
        "postcode",
        "latitude",
        "longitude",
        "created_at",
    )
    search_fields = ("user__email", "address", "property_type", "postcode")
    readonly_fields = ("created_at", "updated_at")
