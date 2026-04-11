import mimetypes

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class MediaLibrary(models.Model):
    file = models.FileField(upload_to="media-library/")
    file_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    mediable_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="media_library_items",
    )
    mediable_id = models.PositiveBigIntegerField()
    mediable = GenericForeignKey("mediable_type", "mediable_id")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "media_library"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["mediable_type", "mediable_id"]),
        ]

    def save(self, *args, **kwargs):
        if self.file and hasattr(self.file, "size"):
            self.file_size = self.file.size or 0
            guessed_type, _ = mimetypes.guess_type(self.file.name)
            self.file_type = guessed_type or self.file_type or ""
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.file.name
