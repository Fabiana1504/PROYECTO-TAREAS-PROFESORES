# School Tasks Monorepo

Sistema de gestión de tareas escolares para profesores y estudiantes.

## Estructura del Proyecto

```
school-tasks-monorepo/
├── backend/          # API REST con Node.js/Express
├── frontend/         # Aplicación web con React/Next.js
├── README.md         # Este archivo
└── .gitignore        # Archivos a ignorar en Git
```

## Características

- **Roles**: Profesor, Estudiante
- **Colecciones**:
  - Usuarios (autenticación y perfiles)
  - Tareas (creación, asignación, seguimiento)
  - Entregas (con soporte para archivos PDF)

## Tecnologías

### Backend
- Node.js + Express
- MongoDB (base de datos)
- JWT (autenticación)
- Multer (manejo de archivos)

### Frontend
- React + Next.js
- TypeScript
- Tailwind CSS
- Axios (cliente HTTP)

## Desarrollo

### Prerrequisitos
- Node.js (v18+)
- MongoDB (local o Docker)
- Git

### Opciones para MongoDB
1. **Docker (Recomendado)**: `docker run -d -p 27017:27017 --name mongodb mongo:latest`
2. **MongoDB Local**: Descargar desde https://www.mongodb.com/try/download/community
3. **MongoDB Atlas**: Base de datos en la nube (gratis)

### Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd school-tasks-monorepo
```

2. Instalar dependencias:
```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

3. Configurar variables de entorno:
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# Frontend
cp frontend/.env.example frontend/.env.local
# Editar frontend/.env.local con tus configuraciones
```

### Ejecutar en desarrollo

#### Opción 1: Scripts automáticos (Windows)
```bash
# Ejecutar todo automáticamente
start-all.bat

# O ejecutar por separado
start-project.bat    # Solo backend
start-frontend.bat   # Solo frontend
```

#### Opción 2: Comandos manuales
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario

### Tareas
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `GET /api/tasks/:id` - Obtener tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

### Entregas
- `GET /api/submissions` - Listar entregas
- `POST /api/submissions` - Crear entrega
- `GET /api/submissions/:id` - Obtener entrega
- `PUT /api/submissions/:id` - Actualizar entrega

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
