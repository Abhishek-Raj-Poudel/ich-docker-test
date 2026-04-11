from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Role, User

REGISTRATION_ROLE_NAMES = {
    "homeowner": "Homeowner",
    "builder": "Builder",
}


def validate_user_password(password: str, user: User):
    email = (getattr(user, "email", "") or "").strip().lower()
    password_lower = password.lower()

    if email and email in password_lower:
        raise serializers.ValidationError(
            {"non_field_errors": ["The password is too similar to the email."]}
        )

    email_local_part = email.split("@", 1)[0] if email else ""
    if email_local_part and len(email_local_part) >= 3 and email_local_part in password_lower:
        raise serializers.ValidationError(
            {"non_field_errors": ["The password is too similar to the email."]}
        )

    validate_password(password, user=user)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("name", "email", "contact", "password", "role")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        normalized_value = value.strip().lower()
        if normalized_value not in REGISTRATION_ROLE_NAMES:
            raise serializers.ValidationError(
                "Role must be either 'homeowner' or 'builder'."
            )
        return REGISTRATION_ROLE_NAMES[normalized_value]

    def validate_contact(self, value):
        normalized_value = value.strip()
        if not normalized_value:
            raise serializers.ValidationError("Contact is required.")
        return normalized_value

    def validate(self, attrs):
        user = User(
            email=attrs.get("email", ""),
            name=attrs.get("name", ""),
            contact=attrs.get("contact", ""),
        )
        validate_user_password(attrs["password"], user)
        return attrs

    def create(self, validated_data):
        role_name = validated_data.pop("role")
        role, _ = Role.objects.get_or_create(name=role_name)

        return User.objects.create_user(role=role, **validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        request = self.context.get("request")
        user = authenticate(
            request=request,
            email=attrs["email"],
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        attrs["user"] = user
        return attrs


class VerifyOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class ResendOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        user = User.objects.filter(email__iexact=value).first()
        if user is None:
            raise serializers.ValidationError("User not found.")
        self.user = user
        return value

    def validate(self, attrs):
        user = getattr(self, "user", None)
        if user is None:
            raise serializers.ValidationError({"email": "User not found."})

        if not user.verify_otp(attrs["otp"]):
            raise serializers.ValidationError({"otp": "Invalid or expired OTP."})

        if user.check_password(attrs["new_password"]):
            raise serializers.ValidationError(
                {"new_password": "New password must be different from the current password."}
            )

        validate_user_password(attrs["new_password"], user)
        attrs["user"] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        if user.check_password(attrs["new_password"]):
            raise serializers.ValidationError(
                {"new_password": "New password must be different from the current password."}
            )

        validate_user_password(attrs["new_password"], user)
        return attrs


class MyProfileSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = User
        fields = ("name", "contact", "email", "role")
