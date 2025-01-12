import os
import django
from tqdm import tqdm  # Importa tqdm para la barra de progreso

# Configura Django para que use los settings correctos
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backendapi.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Crear usuario admin si no existe
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser(username="admin", password="admin123", is_admin=True)
    print("Superusuario creado con éxito.")
else:
    print("El superusuario ya existe.")

# Crear usuarios regulares con contraseñas hash
users = []
for i in tqdm(range(1, 36), desc="Creando usuarios"):
    username = f"user{i}"
    if not User.objects.filter(username=username).exists():
        users.append(User(username=username).set_password("password123"))

# Guardar los usuarios
if users:
    User.objects.bulk_create(users)  # Inserta todos los usuarios a la vez
    print(f"{len(users)} usuarios creados con éxito.")
else:
    print("No se crearon usuarios nuevos.")
