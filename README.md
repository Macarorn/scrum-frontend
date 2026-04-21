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
