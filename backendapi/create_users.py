import os
import django

# Configura Django para que use los settings correctos
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backendapi.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Desactivar señales de Django temporalmente (si es necesario)
from django.db.models.signals import pre_save, post_save
pre_save.disconnect()
post_save.disconnect()

# Crear usuario admin
User.objects.create_superuser(username="admin", password="admin123", is_admin=True)

# Crear usuarios regulares con bulk_create
users = [
    User(username=f"user{i}", password="password123")
    for i in range(1, 36)
]

# Insertar todos los usuarios de una vez
User.objects.bulk_create(users)

# Reactivar señales si es necesario
pre_save.connect()
post_save.connect()
