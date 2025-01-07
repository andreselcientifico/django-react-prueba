from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

# Usuario personalizado
class CustomUser(AbstractUser):
    is_admin = models.BooleanField(default=False)


# Modelo para registrar los eventos de los usuarios
class UserSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    login_time = models.DateTimeField(default=now)
    logout_time = models.DateTimeField(null=True, blank=True)
    session_duration = models.DurationField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.login_time} - {self.logout_time}"


# Modelo para registrar los clics de los botones
class ButtonClick(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    button_name = models.CharField(max_length=50)
    click_time = models.DateTimeField(auto_now_add=True)


# Configuración de la landing page
class LandingPageConfig(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    logo = models.ImageField(upload_to='logos/')
