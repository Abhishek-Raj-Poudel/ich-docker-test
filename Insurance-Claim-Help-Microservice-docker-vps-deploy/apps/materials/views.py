from rest_framework.response import Response
from rest_framework.views import APIView

from apps.materials.services import get_materials_catalog


class MaterialsListView(APIView):
    def get(self, request):
        return Response(get_materials_catalog(), status=200)
