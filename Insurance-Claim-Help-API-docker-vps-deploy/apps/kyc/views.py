from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.permissions import BuilderRequiredPermission

from .models import KYC
from .serializers import KYCSerializer


class BuilderKYCView(APIView):
    permission_classes = [IsAuthenticated, BuilderRequiredPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        kyc = (
            KYC.objects.filter(user=request.user).prefetch_related("documents").first()
        )
        if kyc is None:
            return Response(
                {"detail": "KYC not found."}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(KYCSerializer(kyc).data)

    def post(self, request):
        if hasattr(request.user, "kyc"):
            return Response(
                {"detail": "KYC already exists for this user. Use PUT to update it."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = KYCSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        kyc = serializer.save()
        return Response(KYCSerializer(kyc).data, status=status.HTTP_201_CREATED)

    def put(self, request):
        try:
            kyc = request.user.kyc
        except KYC.DoesNotExist:
            return Response(
                {"detail": "KYC not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = KYCSerializer(kyc, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        kyc = serializer.save()
        return Response(KYCSerializer(kyc).data)

    def patch(self, request):
        try:
            kyc = request.user.kyc
        except KYC.DoesNotExist:
            return Response(
                {"detail": "KYC not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = KYCSerializer(
            kyc,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        kyc = serializer.save()
        return Response(KYCSerializer(kyc).data)
