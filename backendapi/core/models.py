from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
import uuid

# Usuario personalizado
class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
class ButtonClickStats(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    button_name = models.CharField(max_length=50)
    click_count = models.IntegerField(default=1)

    def increment_click(self):
        """Incrementa el contador de clics."""
        self.click_count += 1
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.button_name}: {self.click_count}"


# Configuración de la landing page
class LandingPageConfig(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    logo = models.ImageField(upload_to='logos/')

    def __str__(self):
        return self.title
