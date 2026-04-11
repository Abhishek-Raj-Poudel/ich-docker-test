from django.urls import path

from apps.repair_items.views import RepairItemsByRoomView


urlpatterns = [
    path(
        "repair-items/<int:room_id>/",
        RepairItemsByRoomView.as_view(),
        name="repair-items-by-room",
    ),
]
