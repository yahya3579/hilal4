from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


#here we define the serializer for the User model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
            'password': {'write_only': True},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }
    def create(self,validated_data):
        user=User.objects.create_user(**validated_data)
        return user


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'fname', 'lname', 'email', 'password', 'contact_no', 'cnic', 'dob', 
            'gender', 'country', 'state', 'postal_address', 'email_verification', 
            'image', 'login_datetime', 'status', 'role'
        ]
        extra_kwargs = {
            'pass_field': {'write_only': True},
        }

    def create(self, validated_data):
        user = CustomUser.objects.create(**validated_data)
        return user


# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     def validate(self, attrs):
#         data = super().validate(attrs)
#         data['user_id'] = self.user.id  # Add user ID to the token response
#         data["role"] = self.user.role  # Add user role to the token response
#         print(f"Authenticated user: {type(self.user)}")
#         return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user  # <-- This should be your CustomUser instance
        print("DEBUG: Authenticated user:", user)
        print("DEBUG: User role:", getattr(user, 'role', 'ROLE NOT FOUND'))
        data['user_id'] = user.id
        data['role'] = user.role  # Make sure this line doesn't crash
        return data
    