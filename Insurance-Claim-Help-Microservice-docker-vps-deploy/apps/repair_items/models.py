from django.db import models

from apps.materials.models import Materials
from apps.room_details.models import RoomDetail


class RepairItem(models.Model):
    room_detail = models.ForeignKey(
        RoomDetail,
        on_delete=models.CASCADE,
        related_name="repair_items",
    )
    material = models.ForeignKey(
        Materials,
        on_delete=models.CASCADE,
        related_name="repair_items",
    )
    quantity = models.PositiveIntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Repair item {self.id}"

    class Meta:
        db_table = "repair_items"
