import secrets
from datetime import timedelta
from email.mime.image import MIMEImage

from django.conf import settings
from django.contrib.staticfiles import finders
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone


OTP_EXPIRY_MINUTES = 10


def generate_otp() -> str:
    return f"{secrets.randbelow(1000000):06d}"


def otp_expiry():
    return timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)


def send_otp_email(user, otp: str, *, subject: str, heading: str, intro: str):
    logo_path = finders.find("logo.png")
    logo_cid = "insurance-claim-help-logo"

    context = {
        "user": user,
        "otp": otp,
        "expiry_minutes": OTP_EXPIRY_MINUTES,
        "logo_cid": logo_cid,
        "heading": heading,
        "intro": intro,
    }
    text_content = (
        f"Hello {user.name},\n\n"
        f"{intro}\n"
        f"Your OTP is {otp}. It expires in {OTP_EXPIRY_MINUTES} minutes.\n"
    )
    html_content = render_to_string("users/emails/otp_email.html", context)
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")

    if logo_path:
        with open(logo_path, "rb") as logo_file:
            logo = MIMEImage(logo_file.read())
            logo.add_header("Content-ID", f"<{logo_cid}>")
            logo.add_header("Content-Disposition", "inline", filename="logo.png")
            email.attach(logo)

    email.send(fail_silently=False)


def send_verification_otp_email(user, otp: str):
    send_otp_email(
        user,
        otp,
        subject="Verify your email",
        heading="Verify your email",
        intro="Use the one-time password below to verify your email address.",
    )


def send_password_reset_otp_email(user, otp: str):
    send_otp_email(
        user,
        otp,
        subject="Reset your password",
        heading="Reset your password",
        intro="Use the one-time password below to reset your account password.",
    )
