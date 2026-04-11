from rest_framework.permissions import BasePermission


class BuilderRequiredPermission(BasePermission):
    message = "This endpoint is only available for builders."

    def has_permission(self, request, view):
        role = getattr(getattr(request.user, "role", None), "name", "")
        return role.strip().lower() == "builder"


class ApprovedBuilderKYCRequiredPermission(BuilderRequiredPermission):
    message = "Only builders with approved KYC can access this endpoint."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        kyc = getattr(request.user, "kyc", None)
        return kyc is not None and kyc.status == "approved"
