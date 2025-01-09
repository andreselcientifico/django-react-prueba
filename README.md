# Proyecto Full Stack (Backend + Frontend)

Este repositorio contiene el código fuente para un proyecto full stack que incluye un backend desarrollado en Django y un frontend desarrollado en React.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- Python (versión 3.12)
- Node.js (versión 16 o superior) y npm
- Git

---

## Instrucciones para ejecutar el proyecto

### 1. Clonar el repositorio

Clona este repositorio en tu máquina local usando:

```bash
git clone <https://github.com/andreselcientifico/django-react-prueba.git>
cd <django-react-prueba>
```

### 2. Configurar el Backend (Django)

#### a. Instalar las dependencias

Navega al directorio del backend y utiliza `pip` para instalar las dependencias requeridas:

```bash
cd backend
pip install -r requirements.txt
```

#### b. Configurar la clave secreta (Secret Key)

Crea un archivo `.env` en el directorio del backend y define la clave secreta de Django:

```env
DJANGO_KEY=<TU_SECRET_KEY>
```

#### c. Migrar la base de datos

Ejecuta las migraciones para configurar la base de datos:

```bash
python manage.py migrate
```

#### d. Crear usuarios iniciales

Ejecuta el script `create_users.py` para cargar los usuarios iniciales:

```bash
python create_users.py
```

#### e. Ejecutar el servidor de desarrollo de Django

Finalmente, arranca el servidor de desarrollo de Django:

```bash
python manage.py runserver
```

El backend estará disponible en `http://127.0.0.1:8000/` de lo contrario fallara la aplicacion.

---

### 3. Configurar el Frontend (React)

#### a. Instalar las dependencias

Navega al directorio del frontend y utiliza `npm` para instalar las dependencias:

```bash
cd ../frontend-api
npm install
```

#### b. Ejecutar el servidor de desarrollo de React

Inicia el servidor de desarrollo para el frontend:

```bash
npm run dev
```

El frontend estará disponible en `http://127.0.0.1:5173/` de lo contrario fallara la aplicacion.

---

## Resumen de Comandos

### Backend

1. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
2. Configurar la base de datos:
   ```bash
   python manage.py migrate
   ```
3. Crear usuarios iniciales:
   ```bash
   python create_users.py
   ```
4. Ejecutar el servidor:
   ```bash
   python manage.py runserver
   ```

### Frontend

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Ejecutar el servidor:
   ```bash
   npm run dev
   ```

---

## Notas

- Asegúrate de que tanto el backend como el frontend estén corriendo al mismo tiempo para que la aplicación funcione correctamente.
- Si encuentras algún problema, verifica que todas las dependencias estén instaladas correctamente y que las configuraciones de tu entorno sean correctas.

