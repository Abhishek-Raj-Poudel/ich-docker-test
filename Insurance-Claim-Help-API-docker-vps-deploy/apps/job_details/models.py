from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models


class JobStatus(models.TextChoices):
    NOT_STARTED = "not_started", "Not Started"
    ACCEPTED = "accepted", "Accepted"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"


class JobDetail(models.Model):
    homeowner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="posted_job_details",
        db_column="homeowner_id",
    )
    builder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="job_details",
        db_column="builder_id",
    )
    report_id = models.PositiveBigIntegerField()
    room_id = models.PositiveBigIntegerField(null=True, blank=True)
    property_id = models.PositiveBigIntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.NOT_STARTED,
    )
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    report_path = models.URLField(blank=True, default="")
    materials_used = models.JSONField(default=list, blank=True)
    media = GenericRelation(
        "media_library.MediaLibrary",
        content_type_field="mediable_type",
        object_id_field="mediable_id",
        related_query_name="job_detail",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_details"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"JobDetail #{self.id} for report {self.report_id}"


class HomeownerReview(models.Model):
    job_detail = models.ForeignKey(
        JobDetail,
        on_delete=models.CASCADE,
        related_name="homeowner_reviews",
        db_column="job_detail_id",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="homeowner_reviews",
        db_column="user_id",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "homeowner_reviews"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["job_detail", "user"],
                name="unique_homeowner_review_per_job_detail_user",
            )
        ]

    def __str__(self) -> str:
        return f"HomeownerReview #{self.id} for job {self.job_detail_id}"
