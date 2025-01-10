from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers
from .views import *
from django.contrib.auth import logout

app_name = "core"

urlpatterns = [
    path('api/v1/login/', login, name='login'),
    path('api/v1/verify-token/', verify_token, name='verify-token'),
    path('api/v1/register-button-click/', click, name='click'),
    path('api/v1/get-data/', get_data, name='get-data'),
    path('api/v1/post-data/', post_data, name='post-data'),
    path('api/v1/logout/', logout_user, name='logout'),
    path('api/v1/get_data_users/', get_data_users, name= 'data_users')
]