from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.materials.models import Materials
from apps.repair_items.models import RepairItem
from apps.report.models import Report
from apps.room_details.models import RoomDetail


class RoomAnalyzeViewTests(APITestCase):
    @patch("apps.room_details.views.fetch_property_context_safe", return_value={"property": {}, "user": {}})
    @patch("apps.room_details.views.run_gemini_room_workflow")
    def test_rooms_analyze_uses_single_workflow_call_and_creates_related_records(
        self,
        mock_workflow,
        _mock_property_context,
    ):
        Materials.objects.create(material="Interior Paint")
        mock_workflow.return_value = {
            "window_count": 2,
            "door_count": 1,
            "damages": [
                {
                    "type": "water stain",
                    "location": "ceiling",
                    "severity": "medium",
                }
            ],
            "repair_items": [
                {
                    "material_id": 1,
                    "quantity": 2,
                    "cost": 120.0,
                }
            ],
        }

        response = self.client.post(
            reverse("room-analyze"),
            data={
                "property_id": "42",
                "file": SimpleUploadedFile(
                    "room.jpg",
                    b"fake-image-content",
                    content_type="image/jpeg",
                ),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_workflow.call_count, 1)
        self.assertEqual(response.data["window_count"], 2)
        self.assertEqual(response.data["door_count"], 1)
        self.assertEqual(len(response.data["repair_items"]), 1)
        self.assertEqual(RoomDetail.objects.count(), 1)
        self.assertEqual(RepairItem.objects.count(), 1)
        self.assertEqual(Report.objects.count(), 1)

