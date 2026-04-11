from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    MyProfileSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    ResendOtpSerializer,
    VerifyOtpSerializer,
)
from .services import (
    generate_otp,
    otp_expiry,
    send_password_reset_otp_email,
    send_verification_otp_email,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        otp = generate_otp()
        user.set_otp(otp, otp_expiry())
        user.save(update_fields=["otp_code", "otp_expires_at"])
        send_verification_otp_email(user, otp)

        return Response(
            {
                "message": "Registration successful. Verify your email with the OTP sent.",
                "user_id": user.id,
                "email": user.email,
                "contact": user.contact,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        if not user.is_email_verified:
            return Response(
                {"detail": "Email is not verified. Please verify OTP first."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "contact": user.contact,
                    "role_id": user.role_id,
                    "role_name": user.role.name,
                },
            }
        )


class VerifyOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = (
            User.objects.filter(email__iexact=serializer.validated_data["email"])
            .select_related("role")
            .first()
        )
        if user is None:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_email_verified:
            return Response({"message": "Email is already verified."})

        if not user.verify_otp(serializer.validated_data["otp"]):
            return Response({"detail": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.email_verified_at = timezone.now()
        user.clear_otp()
        user.save(
            update_fields=[
                "is_email_verified",
                "email_verified_at",
                "otp_code",
                "otp_expires_at",
            ]
        )

        return Response({"message": "Email verified successfully."})


class ResendOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if user is None:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_email_verified:
            return Response({"message": "Email is already verified."})

        otp = generate_otp()
        user.set_otp(otp, otp_expiry())
        user.save(update_fields=["otp_code", "otp_expires_at"])
        send_verification_otp_email(user, otp)

        return Response({"message": "A new OTP has been sent to your email."})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if user is None:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        otp = generate_otp()
        user.set_otp(otp, otp_expiry())
        user.save(update_fields=["otp_code", "otp_expires_at"])
        send_password_reset_otp_email(user, otp)

        return Response({"message": "Password reset OTP has been sent to your email."})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["new_password"])
        user.clear_otp()
        user.save(update_fields=["password", "otp_code", "otp_expires_at"])

        return Response({"message": "Password has been reset successfully."})


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = User.objects.select_related("role").get(pk=request.user.pk)
        return Response(MyProfileSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response({"message": "Password changed successfully."})
