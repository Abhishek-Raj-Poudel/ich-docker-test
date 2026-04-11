from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models


class KYC(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="kyc",
    )
    business_name = models.CharField(max_length=255)
    business_email = models.EmailField()
    business_contact = models.CharField(max_length=50)
    business_vat_number = models.CharField(max_length=100, blank=True)
    business_pan_number = models.CharField(max_length=100, blank=True)
    company_registration_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    documents = GenericRelation(
        "media_library.MediaLibrary",
        content_type_field="mediable_type",
        object_id_field="mediable_id",
        related_query_name="kyc",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "kyc"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"KYC - {self.business_name}"
