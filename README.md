# Scrum App Frontend

Interfaz de usuario para el sistema de gestión de proyectos Scrum, desarrollado con React + Vite.

## Requisitos Previos

- Node.js v16+ 
- npm o yarn

## Clonar el repositorio

- git clone <URL_DEL_REPOSITORIO>
- cd scrum-app-frontend

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

## La aplicación estará disponible en:

- http://localhost:5173


## Usuarios de Prueba

Para probar la aplicación, usa estos usuarios (asegúrate de que el backend esté corriendo y la base de datos creada):


**Rol**	              **Usuario**	          **Contraseña**
---------------------------------------------------------------
Product Owner	|   sofia@gmail.com	       |    Sofia1234    
---------------------------------------------------------------
Scrum Master	|   mariana@gmail.com	   |    Mariana1234   
---------------------------------------------------------------
Developer	    |   jefferson@gmail.com	   |    Jefferson1234 
---------------------------------------------------------------
Developer	    |   johan@gmail.com	       |    Johan1234    
---------------------------------------------------------------


---------------------------------------------------------------
Nuevo integrante:
Developer           giraldor99x@gmail.com  


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

## Backend

Este frontend depende de un backend en ejecución.
Asegúrate de configurar correctamente la URL en el archivo .env.


## Soporte

Si tiene problemas o dudas sobre el proyecto, puede:

- Revisar la documentación del repositorio
- Contactar al equipo de desarrollo
- Reportar errores o sugerencias mediante issues en el repositorio