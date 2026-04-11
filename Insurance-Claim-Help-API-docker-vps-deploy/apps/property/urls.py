from django.urls import path

from .views import (
    BuilderPropertyListView,
    PropertyDetailView,
    PropertyListCreateView,
    PropertyMicroserviceDetailView,
)


urlpatterns = [
    path("properties/all/", BuilderPropertyListView.as_view(), name="property_list_all"),
    path(
        "properties/microservice/<int:property_id>/",
        PropertyMicroserviceDetailView.as_view(),
        name="property_microservice_detail",
    ),
    path("properties/", PropertyListCreateView.as_view(), name="property_list_create"),
    path("properties/<int:property_id>/", PropertyDetailView.as_view(), name="property_detail"),
]
