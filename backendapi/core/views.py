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
        user_session = UserSession.objects.filter(user_id=str(user_id).replace('-',''), logout_time__isnull=True).latest('login_time')

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
        user_id = serializer.validated_data['user_id']

        # Buscar la configuración de la landing page
        landing_page_config = LandingPageConfig.objects.get(user_id=user_id)

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
        return Response({
            'users': [
                {
                    'user': user_session.user.username,
                    'login_time': user_session.login_time,
                    'logout_time': user_session.logout_time,
                    'session_duration': user_session.session_duration.total_seconds() if user_session.session_duration else None,
                    'button_stats': {
                        1: next((stat.click_count for stat in ButtonClickStats.objects.filter(
                            user_id=str(user_session.user.id).replace('-', ''), button_name='button1')), 0),
                        2: next((stat.click_count for stat in ButtonClickStats.objects.filter(
                            user_id=str(user_session.user.id).replace('-', ''), button_name='button2')), 0),
                    }
                }
                for user_session in UserSession.objects.filter(logout_time__isnull=False)
            ]
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Ocurrió un error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def post_data(request):
    serializer = LandingPageConfigSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Configuración procesada correctamente!'}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)