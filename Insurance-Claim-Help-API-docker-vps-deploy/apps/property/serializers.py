from django.db import transaction
from rest_framework import serializers

from apps.media_library.models import MediaLibrary
from apps.users.models import User

from .models import Property


class PropertyMediaSerializer(serializers.ModelSerializer):
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


class PropertyUserSerializer(serializers.ModelSerializer):
    role_id = serializers.IntegerField(source="role.id", read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "contact",
            "role_id",
            "role_name",
        )
        read_only_fields = fields


class PropertySerializer(serializers.ModelSerializer):
    media = PropertyMediaSerializer(many=True, read_only=True)
    uploads = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
    )
    remove_media_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Property
        fields = (
            "id",
            "address",
            "property_type",
            "latitude",
            "longitude",
            "postcode",
            "media",
            "uploads",
            "remove_media_ids",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "media", "created_at", "updated_at")

    def create(self, validated_data):
        uploads = validated_data.pop("uploads", [])
        validated_data.pop("remove_media_ids", [])
        user = self.context["request"].user

        with transaction.atomic():
            property_instance = Property.objects.create(user=user, **validated_data)
            self._create_media(property_instance, uploads)
        return property_instance

    def update(self, instance, validated_data):
        uploads = validated_data.pop("uploads", [])
        remove_media_ids = validated_data.pop("remove_media_ids", [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        with transaction.atomic():
            instance.save()
            self._delete_media(instance, remove_media_ids)
            self._create_media(instance, uploads)
        return instance

    def _create_media(self, property_instance: Property, uploads):
        for upload in uploads:
            MediaLibrary.objects.create(mediable=property_instance, file=upload)

    def _delete_media(self, property_instance: Property, media_ids):
        if not media_ids:
            return

        media_items = list(property_instance.media.filter(id__in=media_ids))
        found_ids = {media_item.id for media_item in media_items}
        missing_ids = [media_id for media_id in media_ids if media_id not in found_ids]
        if missing_ids:
            raise serializers.ValidationError(
                {"remove_media_ids": f"Invalid media ids for this property: {missing_ids}"}
            )

        for media_item in media_items:
            if media_item.file:
                media_item.file.delete(save=False)
            media_item.delete()


class PropertyWithUserSerializer(PropertySerializer):
    user = PropertyUserSerializer(read_only=True)

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + ("user",)
        read_only_fields = PropertySerializer.Meta.read_only_fields + ("user",)


class BuilderPropertyListSerializer(serializers.ModelSerializer):
    lat = serializers.DecimalField(source="latitude", max_digits=10, decimal_places=7, read_only=True)
    long = serializers.DecimalField(
        source="longitude",
        max_digits=10,
        decimal_places=7,
        read_only=True,
    )

    class Meta:
        model = Property
        fields = (
            "id",
            "address",
            "property_type",
            "lat",
            "long",
            "postcode",
        )
        read_only_fields = fields
