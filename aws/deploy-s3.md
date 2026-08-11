# Despliegue de Frontend en AWS S3 + CloudFront

Esta guía documenta los pasos para desplegar la aplicación React/Vite en Amazon S3 para alojamiento estático.

## Prerrequisitos
1. Tener instalado [AWS CLI](https://aws.amazon.com/cli/).
2. Haber configurado tus credenciales de IAM (`aws configure`).
3. Tener un Bucket de S3 creado y configurado para *Static Website Hosting*.

## Paso 1: Construir la aplicación
Debes generar los archivos estáticos listos para producción.
```bash
npm install
npm run build
```
Esto generará una carpeta `dist/`.

## Paso 2: Sincronizar con S3
Usa el AWS CLI para subir el contenido de la carpeta `dist` a tu bucket.

```bash
aws s3 sync dist/ s3://scrum-frontend-2856 --delete
```
El flag `--delete` asegura que los archivos antiguos en S3 que ya no existen en tu carpeta `dist/` sean eliminados.

## Paso 3: Invalidar caché de CloudFront (Si aplica)
Si tienes CloudFront frente a tu S3 (recomendado para HTTPS y mejor rendimiento global), debes invalidar la caché para que los usuarios vean los cambios inmediatamente.
```bash
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths "/*"
```
