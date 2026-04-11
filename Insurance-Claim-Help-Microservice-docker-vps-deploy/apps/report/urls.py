from django.urls import path

from apps.report.views import JobInfoView, ReportsByRoomView


urlpatterns = [
    path("reports/<int:room_id>/", ReportsByRoomView.as_view(), name="reports-by-room"),
    path("job-info/<int:room_id>/", JobInfoView.as_view(), name="job-info"),
]
