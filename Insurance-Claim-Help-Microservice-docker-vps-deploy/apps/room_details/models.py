from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from apps.media_library.models import MediaLibrary


class RoomDetail(models.Model):
    property_id = models.PositiveBigIntegerField(null=True, blank=True)
    window_count = models.PositiveIntegerField()
    door_count = models.PositiveIntegerField()
    length = models.DecimalField(max_digits=6, decimal_places=2)
    width = models.DecimalField(max_digits=6, decimal_places=2)
    height = models.DecimalField(max_digits=6, decimal_places=2)
    damages = models.TextField(blank=True, null=True)

    media = GenericRelation(
        MediaLibrary,
        content_type_field="mediable_type",
        object_id_field="mediable_id",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    processing_status = models.CharField(max_length=20, default="pending")

    nerf_output_path = models.TextField(null=True, blank=True)
    mesh_path = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Room {self.id}"

    class Meta:
        db_table = "room_details"
