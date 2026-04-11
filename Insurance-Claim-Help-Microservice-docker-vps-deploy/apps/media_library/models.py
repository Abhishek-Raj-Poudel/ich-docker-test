from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class MediaLibrary(models.Model):

    file = models.FileField(upload_to="media/")
    file_type = models.CharField(max_length=50, blank=True, null=True)

    mediable_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)

    mediable_id = models.PositiveIntegerField()

    mediable = GenericForeignKey("mediable_type", "mediable_id")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.file.name} ({self.file_type})"

    class Meta:
        db_table = "media_library"
        verbose_name = "Media Library"
        verbose_name_plural = "Media Libraries"
        indexes = [
            models.Index(fields=["mediable_type", "mediable_id"]),
        ]
