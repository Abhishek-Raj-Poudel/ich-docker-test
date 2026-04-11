from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import GenericTabularInline, ModelAdmin

from apps.media_library.admin import MediaPreviewAdminMixin
from apps.media_library.models import MediaLibrary

from .models import HomeownerReview, JobDetail


class JobDetailMediaInline(MediaPreviewAdminMixin, GenericTabularInline):
    model = MediaLibrary
    ct_field = "mediable_type"
    ct_fk_field = "mediable_id"
    extra = 0
    fields = ("file_preview", "file", "file_type", "file_size", "created_at")
    readonly_fields = ("file_preview", "file_type", "file_size", "created_at")


class HomeownerReviewInline(admin.StackedInline):
    model = HomeownerReview
    extra = 0
    can_delete = False
    readonly_fields = ("user_display", "comment_display", "timestamps")
    verbose_name = "Homeowner review"
    verbose_name_plural = "Homeowner reviews"
    fieldsets = (
        (None, {"fields": ("user_display",)}),
        (None, {"fields": ("comment_display",)}),
        (None, {"fields": ("timestamps",)}),
    )

    def has_add_permission(self, request, obj=None):
        return False

    @admin.display(description="User")
    def user_display(self, obj: HomeownerReview) -> str:
        if obj.user_id is None:
            return "-"
        return f"{obj.user.name} ({obj.user.email})"

    @admin.display(description="Comment")
    def comment_display(self, obj: HomeownerReview) -> str:
        comment = obj.comment.strip() if obj.comment else "-"
        return format_html(
            '<div style="white-space: pre-wrap; line-height: 1.5;">{}</div>',
            comment,
        )

    @admin.display(description="Timestamps")
    def timestamps(self, obj: HomeownerReview) -> str:
        return format_html(
            "<strong>Created:</strong> {}<br><strong>Updated:</strong> {}",
            obj.created_at,
            obj.updated_at,
        )


@admin.register(JobDetail)
class JobDetailAdmin(ModelAdmin):
    inlines = (JobDetailMediaInline, HomeownerReviewInline)
    fields = (
        "homeowner",
        "builder",
        "report_id",
        "room_id",
        "property_id",
        "status",
        "total_cost",
        "report_path_link",
        "materials_used",
        "notes",
        "created_at",
        "updated_at",
    )
    list_display = (
        "id",
        "homeowner",
        "builder",
        "report_id",
        "status",
        "total_cost",
        "report_path_link",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "homeowner__email",
        "homeowner__name",
        "builder__email",
        "builder__name",
        "report_id",
        "notes",
    )
    readonly_fields = ("report_path_link", "created_at", "updated_at")

    @admin.display(description="Report path")
    def report_path_link(self, obj: JobDetail) -> str:
        if not obj.report_path:
            return "-"

        return format_html(
            '<a href="{}" target="_blank" rel="noopener noreferrer">{}</a>',
            obj.report_path,
            obj.report_path,
        )


@admin.register(HomeownerReview)
class HomeownerReviewAdmin(ModelAdmin):
    fields = (
        "job_detail",
        "user",
        "comment",
        "created_at",
        "updated_at",
    )
    list_display = ("id", "job_detail", "user", "created_at", "updated_at")
    search_fields = ("job_detail__id", "user__email", "user__name", "comment")
    readonly_fields = ("created_at", "updated_at")
