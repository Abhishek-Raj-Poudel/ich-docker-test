from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    ForgotPasswordView,
    LoginView,
    MyProfileView,
    RegisterView,
    ResetPasswordView,
    ResendOtpView,
    VerifyOtpView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("my-profile/", MyProfileView.as_view(), name="my_profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("verify-otp/", VerifyOtpView.as_view(), name="verify_otp"),
    path("resend-otp/", ResendOtpView.as_view(), name="resend_otp"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
