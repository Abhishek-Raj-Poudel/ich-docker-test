from django.contrib import admin
from unfold.admin import GenericTabularInline, ModelAdmin

from apps.media_library.admin import MediaPreviewAdminMixin
from apps.media_library.models import MediaLibrary
from .models import KYC


class KYCDocumentInline(MediaPreviewAdminMixin, GenericTabularInline):
    model = MediaLibrary
    ct_field = "mediable_type"
    ct_fk_field = "mediable_id"
    extra = 1
    fields = ("file_preview", "file", "file_type", "file_size", "created_at")
    readonly_fields = ("file_preview", "file_type", "file_size", "created_at")


@admin.register(KYC)
class KYCAdmin(ModelAdmin):
    inlines = (KYCDocumentInline,)
    list_display = (
        "id",
        "user",
        "status",
        "business_name",
        "business_email",
        "business_contact",
        "company_registration_number",
        "created_at",
    )
    list_filter = ("status", "created_at")
    list_editable = ("status",)
    search_fields = (
        "user__email",
        "business_name",
        "business_email",
        "business_contact",
        "company_registration_number",
    )
    readonly_fields = ("created_at", "updated_at")
