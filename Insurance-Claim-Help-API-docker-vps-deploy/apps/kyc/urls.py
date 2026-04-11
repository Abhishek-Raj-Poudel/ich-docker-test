from django.urls import path

from .views import BuilderKYCView


urlpatterns = [
    path("kyc/", BuilderKYCView.as_view(), name="builder_kyc"),
]
