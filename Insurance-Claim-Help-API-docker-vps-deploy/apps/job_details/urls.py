from django.urls import path

from .views import (
    AllJobDetailListView,
    BuilderAssignedJobDetailListView,
    HomeownerReviewListCreateView,
    JobDetailAcceptView,
    JobDetailDetailView,
    JobDetailListView,
    JobDetailSyncView,
    JobDetailUpdateView,
)


urlpatterns = [
    path("job-details/", JobDetailListView.as_view(), name="job-detail-list"),
    path(
        "job-details/all/", AllJobDetailListView.as_view(), name="job-detail-list-all"
    ),
    path(
        "job-details/assigned/",
        BuilderAssignedJobDetailListView.as_view(),
        name="job-detail-list-assigned",
    ),
    path(
        "job-accept/<int:job_detail_id>/",
        JobDetailAcceptView.as_view(),
        name="job-detail-accept",
    ),
    path(
        "job-details/<int:job_detail_id>/",
        JobDetailDetailView.as_view(),
        name="job-detail-detail",
    ),
    path(
        "job-details-update/<int:job_detail_id>/",
        JobDetailUpdateView.as_view(),
        name="job-details-update",
    ),
    path(
        "job-details/sync/<int:room_id>/",
        JobDetailSyncView.as_view(),
        name="job-detail-sync",
    ),
    path(
        "job-details/reviews/<int:job_detail_id>/",
        HomeownerReviewListCreateView.as_view(),
        name="homeowner-review-list-create",
    ),
]
