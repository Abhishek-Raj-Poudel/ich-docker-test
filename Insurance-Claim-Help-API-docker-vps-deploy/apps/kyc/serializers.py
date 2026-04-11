from django.db import transaction
from rest_framework import serializers

from apps.media_library.models import MediaLibrary

from .models import KYC


class MediaLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaLibrary
        fields = (
            "id",
            "file",
            "file_type",
            "file_size",
            "created_at",
        )
        read_only_fields = fields


class KYCSerializer(serializers.ModelSerializer):
    documents = MediaLibrarySerializer(many=True, read_only=True)
    uploads = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
    )
    remove_document_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        required=False,
    )

    class Meta:
        model = KYC
        fields = (
            "status",
            "business_name",
            "business_email",
            "business_contact",
            "business_vat_number",
            "business_pan_number",
            "company_registration_number",
            "documents",
            "uploads",
            "remove_document_ids",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("status", "created_at", "updated_at", "documents")

    def create(self, validated_data):
        uploads = validated_data.pop("uploads", [])
        validated_data.pop("remove_document_ids", [])
        user = self.context["request"].user

        with transaction.atomic():
            kyc = KYC.objects.create(user=user, **validated_data)
            self._create_documents(kyc, uploads)
        return kyc

    def update(self, instance, validated_data):
        uploads = validated_data.pop("uploads", [])
        remove_document_ids = validated_data.pop("remove_document_ids", [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        with transaction.atomic():
            instance.save()
            self._delete_documents(instance, remove_document_ids)
            self._create_documents(instance, uploads)
        return instance

    def _create_documents(self, kyc: KYC, uploads):
        for upload in uploads:
            MediaLibrary.objects.create(mediable=kyc, file=upload)

    def _delete_documents(self, kyc: KYC, document_ids):
        if not document_ids:
            return

        documents = list(kyc.documents.filter(id__in=document_ids))
        found_ids = {document.id for document in documents}
        missing_ids = [document_id for document_id in document_ids if document_id not in found_ids]
        if missing_ids:
            raise serializers.ValidationError(
                {"remove_document_ids": f"Invalid document ids for this KYC: {missing_ids}"}
            )

        for document in documents:
            if document.file:
                document.file.delete(save=False)
            document.delete()
