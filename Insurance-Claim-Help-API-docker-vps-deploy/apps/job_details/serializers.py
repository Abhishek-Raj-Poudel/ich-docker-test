from rest_framework import serializers

from .models import HomeownerReview


class HomeownerReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeownerReview
        fields = (
            "id",
            "job_detail",
            "user",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "job_detail", "user", "created_at", "updated_at")

    def validate_rating(self, value):
        if not isinstance(value, int):
            raise serializers.ValidationError("rating must be a whole number between 1 and 5.")
        if value < 1 or value > 5:
            raise serializers.ValidationError("rating must be between 1 and 5.")
        return value

    def validate_comment(self, value):
        normalized_value = value.strip()
        if not normalized_value:
            raise serializers.ValidationError("comment is required.")
        return normalized_value
