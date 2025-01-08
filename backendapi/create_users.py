import os
import django

# Configura Django para que use los settings correctos
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backendapi.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Crear usuario admin
User.objects.create_superuser(username="admin", password="admin123", is_admin=True)

# Crear 35 usuarios regulares
for i in range(1, 36):
    User.objects.create_user(username=f"user{i}", password="password123")
