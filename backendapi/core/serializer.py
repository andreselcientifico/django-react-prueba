from rest_framework import serializers
import base64
from django.core.files.base import ContentFile
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

class LandingPageConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandingPageConfig
        fields = '__all__'

class ButtonClickSerializer(serializers.ModelSerializer):
    class Meta:
        model = ButtonClickStats
        fields = '__all__'
        read_only_fields = ['user']

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = '__all__'
        read_only_fields = ['user']

class LandingPageConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandingPageConfig
        fields = '__all__'
        read_only_fields = ['id', 'user']

class GetDataSerializer(serializers.Serializer):
    user_id = serializers.UUIDField(format='hex', required=True)

class LogoutUserSerializer(serializers.Serializer):
    user_id = serializers.UUIDField(format='hex', required=True)

