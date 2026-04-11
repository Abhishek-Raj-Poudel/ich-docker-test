from rest_framework.response import Response
from rest_framework.views import APIView

from apps.repair_items.models import RepairItem


class RepairItemsByRoomView(APIView):
    def get(self, request, room_id):
        repair_items = RepairItem.objects.filter(room_detail_id=room_id).select_related(
            "material"
        )
        return Response(
            [
                {
                    "id": repair_item.id,
                    "material_id": repair_item.material_id,
                    "material": repair_item.material.material,
                    "quantity": repair_item.quantity,
                    "cost": str(repair_item.cost),
                }
                for repair_item in repair_items
            ],
            status=200,
        )
