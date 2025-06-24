# Configurar Gmail para ParkSys

## Paso a paso para agregar tus credenciales:

### 1. Agregar GMAIL_USER
1. Ve al panel de Replit (parte izquierda)
2. Busca la sección "Secrets" (candado)
3. Haz clic en "Add new secret"
4. En el campo "Key" escribe: `GMAIL_USER`
5. En el campo "Value" escribe tu email de Gmail: `tuempresa@gmail.com`
6. Haz clic en "Add secret"

### 2. Agregar GMAIL_APP_PASSWORD
1. Haz clic en "Add new secret" nuevamente
2. En el campo "Key" escribe: `GMAIL_APP_PASSWORD`
3. En el campo "Value" escribe la contraseña de aplicación que generaste en Google (16 caracteres)
4. Haz clic en "Add secret"

### 3. Verificar configuración
1. Reinicia el servidor (se reinicia automáticamente al agregar secrets)
2. Ve a `/admin/system/email-settings` en la aplicación
3. Haz clic en "Probar Conexión"
4. Si está bien configurado, verás "Conectado usando Gmail/Google Workspace"

## Ejemplo de secrets:
```
GMAIL_USER = miempresa@gmail.com
GMAIL_APP_PASSWORD = abcd efgh ijkl mnop
```

## ¿Dónde está la sección Secrets?
- En el panel izquierdo de Replit
- Icono de candado
- Bajo "Tools" o directamente visible

¡Listo! El sistema automáticamente detectará las nuevas credenciales.