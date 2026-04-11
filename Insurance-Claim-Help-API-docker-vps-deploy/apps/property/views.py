from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.permissions import ApprovedBuilderKYCRequiredPermission

from .models import Property
from .serializers import (
    BuilderPropertyListSerializer,
    PropertySerializer,
    PropertyWithUserSerializer,
)


class HomeownerPropertyBaseView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def _ensure_homeowner(self, user):
        if user.role.name.strip().lower() != "homeowner":
            raise PermissionDenied("Property management is only available for homeowners.")


class BuilderPropertyListView(APIView):
    permission_classes = [IsAuthenticated, ApprovedBuilderKYCRequiredPermission]

    def get(self, request):
        properties = Property.objects.all()
        return Response(BuilderPropertyListSerializer(properties, many=True).data)


class PropertyMicroserviceDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, property_id):
        property_instance = get_object_or_404(
            Property.objects.select_related("user__role").prefetch_related("media"),
            id=property_id,
        )
        return Response(PropertyWithUserSerializer(property_instance).data)


class PropertyListCreateView(HomeownerPropertyBaseView):
    def get(self, request):
        self._ensure_homeowner(request.user)
        properties = Property.objects.filter(user=request.user).prefetch_related("media")
        return Response(PropertySerializer(properties, many=True).data)

    def post(self, request):
        self._ensure_homeowner(request.user)
        serializer = PropertySerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        property_instance = serializer.save()
        return Response(
            PropertySerializer(property_instance).data,
            status=status.HTTP_201_CREATED,
        )


class PropertyDetailView(HomeownerPropertyBaseView):
    def get(self, request, property_id):
        self._ensure_homeowner(request.user)
        property_instance = self._get_property(request.user, property_id)
        return Response(PropertySerializer(property_instance).data)

    def put(self, request, property_id):
        self._ensure_homeowner(request.user)
        property_instance = self._get_property(request.user, property_id)
        serializer = PropertySerializer(
            property_instance,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        property_instance = serializer.save()
        return Response(PropertySerializer(property_instance).data)

    def patch(self, request, property_id):
        self._ensure_homeowner(request.user)
        property_instance = self._get_property(request.user, property_id)
        serializer = PropertySerializer(
            property_instance,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        property_instance = serializer.save()
        return Response(PropertySerializer(property_instance).data)

    def delete(self, request, property_id):
        self._ensure_homeowner(request.user)
        property_instance = self._get_property(request.user, property_id)
        property_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _get_property(self, user, property_id):
        property_instance = get_object_or_404(
            Property.objects.prefetch_related("media"),
            id=property_id,
        )
        if property_instance.user_id != user.id:
            raise PermissionDenied("You do not have permission to access this property.")
        return property_instance
