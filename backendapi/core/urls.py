from django.urls import path
from django.urls import include
from rest_framework import routers
from .views import *

# api versioning
router = routers.DefaultRouter()
router.register(r'Users', UserViewSet, 'users')


app_name = "core"

urlpatterns = [
    path('api/v1/', include(router.urls) )
]