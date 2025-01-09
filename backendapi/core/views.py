from rest_framework import viewsets, status
from .serializer import *
from .models import *
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

@api_view(['POST'])
def login(request):
    # Autenticación del usuario
    User = get_object_or_404(CustomUser, username=request.data['username'])
    if not User.check_password(request.data['password']):
        return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
    
    UserSession.objects.create(user=User, login_time=now())

    token, created = Token.objects.get_or_create(user=User)
    return Response({
        'created' : created,
        'access': token.key,
        'is_admin': User.is_admin,
        'user_id': User.id,
        'user' : User.username
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def logout(request):
    # Obtener el usuario autenticado
    user = request.data['username']

    # Verificar si el usuario tiene una sesión activa
    try:
        user_session = UserSession.objects.filter(user=user, logout_time__isnull=True).latest('login_time')
        user_session.logout_time = now()
        user_session.session_duration = user_session.logout_time - user_session.login_time
        user_session.save()

        return Response({'message': 'Logout exitoso'}, status=status.HTTP_200_OK)

    except UserSession.DoesNotExist:
        return Response({'error': 'No se encontró una sesión activa para el usuario'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def verify_token(request):
    return Response({'detail': 'Token es válido'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def click(request):
    # Crear un nuevo clic con el nombre del botón
    button_name = request.data['button_name']
    if not button_name:
        return Response({'detail': 'El nombre del botón es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

    button_click_stats, created = ButtonClickStats.objects.get_or_create(
        user=request.user, button_name=button_name
    )

    # Si el registro existe, incrementamos el contador de clics
    if not created:
        button_click_stats.increment_click()

    # Serializar el objeto para devolverlo en la respuesta
    return Response(
        {'detail': 'Clic registrado con éxito.', 'click_count': button_click_stats.click_count},
        status=status.HTTP_201_CREATED
    )

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def Usersession(request):
    user = request.user
    UserSession.objects.create(user=user)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_data(request):
    try:
        # Obtener la configuración para el usuario autenticado
        landing_page_config = LandingPageConfig.objects.get(user=request.user)
        
        # Construir la URL completa del logo
        if landing_page_config.logo:
            logo_url = request.build_absolute_uri(landing_page_config.logo.url)

        # Responder con los datos de configuración
        return Response({
            'title': landing_page_config.title,
            'description': landing_page_config.description,
            'logo': logo_url  # URL completa del logo
        }, status=status.HTTP_200_OK)

    except LandingPageConfig.DoesNotExist:
        # Si no existe configuración, devolver valores vacíos
        return Response({
            'title': '',
            'description': '',
            'logo': None  # Logo vacío
        }, status=status.HTTP_200_OK)

    except Exception as e:
        # Manejar errores generales
        return Response({'error': f'Ocurrió un error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def post_data(request):
    try:
        print(request.data)

        # Procesar el logo si está en formato Base64
        logo_data = request.data.get('logo', None)
        logo_file = None

        if logo_data and logo_data.startswith('data:image'):
            try:
                # Separar el formato y los datos de la imagen
                format, imgstr = logo_data.split(';base64,')
                # Decodificar la imagen y convertirla en un archivo
                logo_file = ContentFile(base64.b64decode(imgstr), name=f"logo.{format.split('/')[-1]}")# Obtener la extensión de la imagen (png, jpeg, etc.)
            except Exception as e:
                return Response({'error': f'Error al procesar la imagen Base64: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear o actualizar la configuración de la página de aterrizaje
        landing_page_config, created = LandingPageConfig.objects.update_or_create(
            user_id=request.data.get('user_id'),
            defaults={
                'title': request.data.get('title', ''),
                'description': request.data.get('description', ''),
                'logo': logo_file if logo_file else None,  # Asignar el archivo procesado si existe
            }
        )

        # Responder dependiendo de si se creó o actualizó
        if created:
            return Response({'message': 'Configuración creada exitosamente!'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Configuración actualizada exitosamente!'}, status=status.HTTP_200_OK)

    except Exception as e:
        # Manejar errores generales
        return Response({'error': f'Ocurrió un error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)