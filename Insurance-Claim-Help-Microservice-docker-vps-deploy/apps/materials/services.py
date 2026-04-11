from apps.materials.models import Materials


def get_materials_catalog() -> list[dict]:
    return list(
        Materials.objects.all()
        .order_by("id")
        .values("id", "material")
    )
