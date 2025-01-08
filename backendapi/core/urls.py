from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers
from .views import *

# api versioning
router = routers.DefaultRouter()
router.register(r'Users', UserViewSet, 'users')


app_name = "core"

urlpatterns = [
    path('api/v1/login/', LoginView.as_view(), name='login'),
     path('api/v1/config/', LandingPageConfigView.as_view(), name='landing-page-config'),
      path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
     path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + router.urls