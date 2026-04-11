from django.urls import path

from apps.materials.views import MaterialsListView


urlpatterns = [
    path("materials/", MaterialsListView.as_view(), name="materials-list"),
]
