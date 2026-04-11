from django.db import models

from apps.room_details.models import RoomDetail


class Report(models.Model):
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        UNDER_REVIEW = "under_review", "Under Review"
        ACCEPTED = "accepted", "Accepted"

    reference_number = models.CharField(max_length=255)
    estimated_completion_time = models.DateTimeField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED,
    )
    property_snapshot = models.JSONField(default=dict, blank=True)
    user_snapshot = models.JSONField(default=dict, blank=True)
    room_detail = models.ForeignKey(
        RoomDetail,
        on_delete=models.CASCADE,
        related_name="reports",
    )

    def __str__(self):
        return self.reference_number

    class Meta:
        db_table = "reports"
