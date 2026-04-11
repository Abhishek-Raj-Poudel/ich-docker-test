from django.urls import path
from .views import RoomAnalyzeView, RoomListView, RoomResultView, RoomScanView

urlpatterns = [
    path("rooms/", RoomListView.as_view(), name="room-list"),
    path("rooms/<int:property_id>/", RoomListView.as_view(), name="room-list-by-property"),
    path("rooms-analyze/", RoomAnalyzeView.as_view(), name="room-analyze"),
    path("rooms-scan/", RoomScanView.as_view(), name="room-scan"),
    path("rooms-result/<int:room_id>/", RoomResultView.as_view(), name="room-result"),
]
