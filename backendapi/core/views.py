from rest_framework import status
from .serializer import *
from .models import *
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
def logout_user(request):
    # Validar los datos usando el serializer
    serializer = LogoutUserSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Obtener el user_id validado
        user_id = serializer.validated_data['user_id']

        # Verificar si el usuario tiene una sesión activa
        user_session = UserSession.objects.filter(user_id=user_id, logout_time__isnull=True).latest('login_time')

        # Actualizar los datos de logout y duración de la sesión
        user_session.logout_time = now()
        user_session.session_duration = user_session.logout_time - user_session.login_time
        user_session.save()

        return Response({'message': 'Logout exitoso'}, status=status.HTTP_200_OK)

    except UserSession.DoesNotExist:
        return Response({'error': 'No se encontró una sesión activa para el usuario'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': f'Ocurrió un error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

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
def get_data(request):
    # Validar los datos usando el serializer
    serializer = GetDataSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Obtener el user_id validado
        user_id = serializer.validated_data['user_id'].replace('-', '')
        
        

        # Buscar la configuración de la landing page
        landing_page_config = LandingPageConfig.objects.get_or_create(id=user_id)
        
        # Construir la URL completa del logo (si existe)
        logo_url = request.build_absolute_uri(landing_page_config.logo.url) if landing_page_config.logo else None
        
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
def get_data_users(request):
    try:
        # Obtener todos los usuarios que tienen sesiones activas
        user_sessions = UserSession.objects.all()  # O puedes filtrarlo según tu lógica

        # Usar list comprehension para construir la lista de usuarios
        users_data = [
            {
                'user': user_session.user.username,
                'login_time': user_session.login_time,
                'logout_time': user_session.logout_time,
                'session_duration': user_session.session_duration.total_seconds() if user_session.session_duration else None,
                'button_stats': {
                    1: next((stat.click_count for stat in ButtonClickStats.objects.filter(user=user_session.user, button_name=1)), 0),
                    2: next((stat.click_count for stat in ButtonClickStats.objects.filter(user=user_session.user, button_name=2)), 0),
                }
            }
            for user_session in user_sessions
        ]

        # Responder con los datos de todos los usuarios
        return Response({
            'users': users_data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def post_data(request):
    try:
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