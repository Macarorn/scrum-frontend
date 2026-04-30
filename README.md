# Scrum App Frontend

Interfaz de usuario para el sistema de gestión de proyectos Scrum, desarrollado con React + Vite.

## Requisitos Previos

- Node.js v16+
- npm o yarn

## Instalación

1. **Instalar dependencias**

```bash
npm install
```

2. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con la URL del backend (ej: http://localhost:3000)
```

3. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

## Usuarios de Prueba

Para probar la aplicación, usa estos usuarios (asegúrate de que el backend esté corriendo y la base de datos creada):

- **sofia@gmail.com** / **Sofia1234** (Product Owner)
- **mariana@gmail.com** / **Mariana1234** (Scrum Master)
- **jefferson@gmail.com** / **Jefferson1234** (Developer)
- **johan@gmail.com** / **Johan1234** (Developer)

## Tecnologías

- React 18
- Vite
- React Router
- Axios para API calls
- CSS Modules para estilos

## Centro de notificaciones

El módulo de notificaciones ya consume los endpoints reales del backend:

- `GET /api/notificaciones` para cargar alertas del usuario autenticado.
- `POST /api/notificaciones/:id_notificacion/leida` para marcar una alerta como leída.
- `GET /api/solicitudes` para mostrar el estado de las solicitudes enviadas.
- `GET /api/solicitudes/pendientes?proyecto=<id>` para revisar solicitudes pendientes por proyecto.
- `POST /api/solicitudes/:id_solicitud/aprobar` y `POST /api/solicitudes/:id_solicitud/rechazar` para el flujo de aprobación.

### Escenario validado

1. Un usuario entra a `Unirse a un Proyecto` y envía una solicitud.
2. El centro de notificaciones muestra la solicitud en estado `Pendiente`.
3. El aprobador ve la solicitud pendiente del proyecto y la aprueba o rechaza.
4. El usuario recibe la notificación de cambio de estado y ve el estado actualizado en su historial.

### Nota técnica

La actualización en tiempo real se resuelve con polling cada 15 segundos, porque en esta base no existe un canal SSE/WebSocket ya disponible para notificaciones push.

## Estructura del Proyecto

```
src/
├── components/     - Componentes reutilizables
├── pages/         - Páginas de la aplicación
├── services/      - Servicios para API
├── styles/        - Estilos globales
├── assets/        - Imágenes y recursos
└── main.jsx       - Punto de entrada
```
