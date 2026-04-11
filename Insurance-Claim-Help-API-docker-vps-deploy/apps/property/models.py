from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models


class Property(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties",
        db_column="user_id",
    )
    address = models.TextField()
    property_type = models.CharField(max_length=100, db_column="type")
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    postcode = models.CharField(max_length=20)
    media = GenericRelation(
        "media_library.MediaLibrary",
        content_type_field="mediable_type",
        object_id_field="mediable_id",
        related_query_name="property",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "properties"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.property_type} - {self.address}"

