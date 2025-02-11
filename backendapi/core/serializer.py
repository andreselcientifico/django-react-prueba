import base64
import os
import requests

from rest_framework import serializers
from django.conf import settings
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
        """Valida si el logo es una URL o una imagen Base64.
        Si es una URL, descarga la imagen y la guarda de nuevo.
        Si es Base64, elimina la imagen anterior y guarda la nueva."""
        
        if value.startswith("http://localhost:8000/media/"):
            # Extraer solo el nombre de la imagen desde la URL
            image_name = value.split("/")[-1]
            image_path = os.path.join(settings.MEDIA_ROOT, "logos", image_name)

            # Verificar si la imagen existe antes de descargarla
            if not os.path.exists(image_path):
                try:
                    response = requests.get(value)
                    response.raise_for_status()
                    
                    # Guardar la imagen descargada en la carpeta de logos
                    with open(image_path, "wb") as f:
                        f.write(response.content)
                except Exception as e:
                    raise serializers.ValidationError(f"Error al descargar la imagen: {str(e)}")

            return f"logos/{image_name}"  # Retornar solo el path relativo a media/

        try:
            # Si es Base64, primero eliminar la imagen anterior
            if hasattr(self.instance, "logo") and self.instance.logo:
                old_logo_path = str(self.instance.logo.path)
                if os.path.exists(old_logo_path):
                    os.remove(old_logo_path)  # Eliminar imagen anterior

            # Separar el formato y los datos de la imagen Base64
            format, imgstr = value.split(';base64,')
            ext = format.split('/')[-1]  # Obtener extensión (ejemplo: png, jpg)

            # Guardar la nueva imagen con un nombre único
            return ContentFile(base64.b64decode(imgstr), name=f"logos/logo_{os.urandom(8).hex()}.{ext}")

        except Exception as e:
            raise serializers.ValidationError(f"Error al procesar la imagen Base64: {str(e)}")

        return value  # Retornar el valor original si no se modificó

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