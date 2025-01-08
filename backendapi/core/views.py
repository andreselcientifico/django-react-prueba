from rest_framework import viewsets, status
from .serializer import *
from .models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        # Autenticación del usuario
        user = authenticate(username=username, password=password)

        if user is not None:
            # Generamos el token para el usuario autenticado
            refresh = RefreshToken.for_user(user)
            # Retornamos el token y el campo is_admin
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'is_admin': user.is_admin
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class LandingPageConfigView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            return Response(LandingPageConfigSerializer(LandingPageConfig.objects.get(user=request.user)).data)
        except LandingPageConfig.DoesNotExist:
            return Response({
                'title': '',
                'description': '',
                'logo': ''
            }, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        config, created = LandingPageConfig.objects.get_or_create(
            user=request.user,
            defaults={
                'title': request.data.get('title'),
                'description': request.data.get('description'),
                'logo': request.data.get('logo')
            }
        )

        if not created:
            serializer = LandingPageConfigSerializer(config, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(LandingPageConfigSerializer(config).data, status=status.HTTP_201_CREATED)
