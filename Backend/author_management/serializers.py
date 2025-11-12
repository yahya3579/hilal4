# serializers.py

from rest_framework import serializers
from api.models import CustomUser  # adjust the import path if needed

class AuthorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'fname', 'lname', 'email', 'role', 'status']
        read_only_fields = ['id']
