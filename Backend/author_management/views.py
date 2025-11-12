# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models import CustomUser  # adjust the import if necessary
from .serializers import AuthorUserSerializer
from rest_framework.permissions import AllowAny

class GetAllAuthorsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        authors = CustomUser.objects.filter(role='author')
        serializer = AuthorUserSerializer(authors, many=True)
        return Response({
            "message": "Authors retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
