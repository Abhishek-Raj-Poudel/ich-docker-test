from unittest.mock import Mock, patch

from django.conf import settings
from django.test import SimpleTestCase

from apps.report.services import fetch_property_context
from apps.report.views import _needs_property_context_refresh


class PropertyContextServiceTests(SimpleTestCase):
    @patch("apps.report.services.requests.get")
    def test_fetch_property_context_normalizes_property_and_user(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {
            "id": 44,
            "address": "123 Cedar Ave",
            "property_type": "house",
            "latitude": "27.7000000",
            "longitude": "85.3333333",
            "postcode": "44600",
            "media": [],
            "created_at": "2026-03-28T11:25:29.737078Z",
            "updated_at": "2026-03-28T11:31:56.106888Z",
            "user": {
                "id": 9,
                "name": "Sam Taylor",
                "email": "sam@example.com",
                "role_id": 2,
                "role_name": "Homeowner",
            }
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        payload = fetch_property_context(44)

        self.assertEqual(payload["property"]["id"], 44)
        self.assertEqual(payload["property"]["address_line"], "123 Cedar Ave")
        self.assertEqual(payload["property"]["postcode"], "44600")
        self.assertEqual(payload["user"]["full_name"], "Sam Taylor")
        self.assertEqual(payload["user"]["role"], "Homeowner")
        self.assertEqual(payload["user"]["role_id"], 2)
        mock_get.assert_called_once_with(
            f"{settings.PROPERTY_API_BASE_URL}properties/microservice/44/",
            timeout=10,
        )

    @patch("apps.report.services.requests.get")
    def test_fetch_property_context_supports_wrapped_property_payload_shape(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {
            "property": {
                "id": 6,
                "address": "12 Oak Street, Manchester",
                "property_type": "rented",
                "owner": {
                    "id": 1,
                    "first_name": "John",
                    "middle_name": None,
                    "last_name": "Homeowner",
                    "email": "homeowner@test.com",
                    "role": {"id": 5, "name": "Admin"},
                    "created_at": "2026-03-26 04:22:40",
                },
                "created_at": "2026-03-26 08:19:30",
            }
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        payload = fetch_property_context(6)

        self.assertEqual(payload["property"]["address_line"], "12 Oak Street, Manchester")
        self.assertEqual(payload["property"]["property_type"], "rented")
        self.assertEqual(payload["user"]["full_name"], "John Homeowner")
        self.assertEqual(payload["user"]["email"], "homeowner@test.com")
        self.assertIsNone(payload["user"]["contact_number"])
        self.assertEqual(payload["user"]["role"], "Admin")

    @patch("apps.report.services.requests.get")
    def test_fetch_property_context_supports_contact_alias(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {
            "id": 7,
            "address": "House 14, Baneshwor, Kathmandu",
            "property_type": "Residential",
            "postcode": "44600",
            "user": {
                "id": 2,
                "name": "Nischal Shrestha",
                "email": "nischal@gmail.com",
                "contact": "9865122342",
                "role_id": 2,
                "role_name": "Homeowner",
            },
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        payload = fetch_property_context(7)

        self.assertEqual(payload["user"]["contact_number"], "9865122342")


class ReportContextRefreshTests(SimpleTestCase):
    def test_refreshes_snapshot_when_contact_number_missing(self):
        should_refresh = _needs_property_context_refresh(
            {"address": "House 14, Baneshwor, Kathmandu"},
            {"name": "Nischal Shrestha", "email": "nischal@gmail.com"},
        )

        self.assertTrue(should_refresh)

    def test_keeps_snapshot_when_contact_number_present(self):
        should_refresh = _needs_property_context_refresh(
            {"address": "House 14, Baneshwor, Kathmandu"},
            {
                "name": "Nischal Shrestha",
                "email": "nischal@gmail.com",
                "contact_number": "9865122342",
            },
        )

        self.assertFalse(should_refresh)
