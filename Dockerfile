# ============================================
# Stage 1: Instalar dependencias y compilar
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar todas las dependencias (incluyendo dev para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Argumento para la URL del backend (se pasa en build time)
ARG VITE_API_URL=https://shark-app-vzrun.ondigitalocean.app/api
ENV VITE_API_URL=$VITE_API_URL

# Compilar la aplicación para producción
RUN npm run build

# ============================================
# Stage 2: Servir con Nginx
# ============================================
FROM nginx:alpine AS production

# Metadata
LABEL maintainer="Equipo Scrum"
LABEL description="Frontend React para gestión de proyectos Scrum"

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde el stage de build
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx se ejecuta en foreground
CMD ["nginx", "-g", "daemon off;"]
