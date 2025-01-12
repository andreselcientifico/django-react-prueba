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

class LandingPageConfigSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(max_length=255)
    logo = serializers.CharField(allow_blank=True, required=False)

    def validate_logo(self, value):
        """Valida si el logo es una cadena Base64 o una URL, y lo procesa adecuadamente."""
        if value and value.startswith('data:image'):
            try:
                # Separar el formato y los datos de la imagen Base64
                format, imgstr = value.split(';base64,')
                # Decodificar la imagen y convertirla en un archivo
                return ContentFile(base64.b64decode(imgstr), name=f"logo.{format.split('/')[-1]}") 
            except Exception as e:
                raise serializers.ValidationError(f"Error al procesar la imagen Base64: {str(e)}")
        return value

    def create(self, validated_data):
        """Crea o actualiza la configuración de la página de aterrizaje."""
        logo_data = validated_data.pop('logo', None)
        return LandingPageConfig.objects.update_or_create(
            user_id=validated_data['user_id'],
            defaults={
                'title': validated_data['title'],
                'description': validated_data['description'],
                'logo': logo_data if logo_data else None,
            }
        )