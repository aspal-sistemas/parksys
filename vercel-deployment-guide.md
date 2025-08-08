# Guía de Despliegue en Vercel - ParkSys

## Archivos Creados

### 1. `vercel.json`
Configuración principal para Vercel que:
- Define el servidor Node.js como función serverless
- Configura rutas para API y archivos estáticos
- Establece headers CORS
- Configura el comando de build

### 2. `.vercelignore`
Define qué archivos excluir del despliegue para optimizar el tamaño.

## Variables de Entorno Requeridas

Debes configurar estas variables en el dashboard de Vercel:

### Base de Datos
```
DATABASE_URL=postgresql://usuario:password@host:puerto/database
```

### Google Cloud Storage (para imágenes)
```
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=tu-service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\ntu-private-key\n-----END PRIVATE KEY-----
GOOGLE_CLOUD_STORAGE_BUCKET=tu-bucket-name
```

### Email (Nodemailer con Gmail)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=tu-email@gmail.com
```

### Stripe (si usas pagos)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Otras variables
```
NODE_ENV=production
JWT_SECRET=tu-jwt-secret-muy-seguro
SESSION_SECRET=tu-session-secret-muy-seguro
```

## Pasos para Desplegar

1. **Conecta tu repositorio** en el dashboard de Vercel
2. **Configura las variables de entorno** en la sección Settings > Environment Variables
3. **Asegúrate de que tu base de datos** esté accesible desde internet (Neon, Supabase, etc.)
4. **Vercel detectará automáticamente** la configuración y desplegará

## Consideraciones Importantes

### Base de Datos
- El proyecto usa PostgreSQL con Drizzle ORM
- Asegúrate de que tu base de datos esté en un servicio como Neon, Supabase, o PlanetScale
- Las migraciones se deben ejecutar manualmente: `npm run db:push`

### Archivos Estáticos
- El servidor maneja archivos subidos en `/uploads/` y `/objects/`
- Para producción considera usar Google Cloud Storage completamente

### Limitaciones de Vercel
- Las funciones serverless tienen límite de tiempo (30 segundos)
- No hay almacenamiento persistente de archivos
- Considera migrar archivos subidos a servicios externos

## Estructura de Routing

- `/api/*` → Funciones API del backend
- `/uploads/*` → Archivos subidos por usuarios
- `/objects/*` → Object Storage de Google Cloud
- `/*` → Frontend React (SPA)

## Troubleshooting

### Error de build
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que no haya imports relativos incorrectos

### Error de conexión a base de datos
- Verifica la variable `DATABASE_URL`
- Asegúrate de que la base de datos acepte conexiones externas

### Error 404 en rutas
- Verifica que el `vercel.json` tenga las rutas configuradas correctamente
- El proyecto usa routing client-side con wouter