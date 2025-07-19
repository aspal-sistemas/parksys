# Especificaciones Optimizadas de Video para Publicidad

## Recomendaciones por Tipo de Contenedor

### 1. Banner Principal (1200x150px)
- **Resolución:** 1200x150px exacta
- **Peso máximo:** 3-5 MB
- **Duración:** 10-15 segundos
- **Bitrate:** 1-2 Mbps
- **Uso ideal:** Videos panorámicos, texto animado

### 2. Sidebar Vertical (ancho completo, 264px altura)
- **Resolución:** 640x264px
- **Peso máximo:** 2-4 MB
- **Duración:** 15-20 segundos
- **Bitrate:** 1-3 Mbps
- **Uso ideal:** Productos, servicios, llamadas a la acción

### 3. Contenedores Promocionales Sidebar
- **Resolución:** 400x160px
- **Peso máximo:** 2-3 MB
- **Duración:** 10-15 segundos
- **Bitrate:** 1-2 Mbps
- **Uso ideal:** Promociones rápidas, ofertas destacadas

### 4. Hero/Header (variable)
- **Resolución:** 720p (1280x720)
- **Peso máximo:** 5-8 MB
- **Duración:** 20-30 segundos
- **Bitrate:** 2-4 Mbps
- **Uso ideal:** Presentaciones institucionales, eventos

## Configuraciones Técnicas Recomendadas

### Formato de Archivo
- **Contenedor:** MP4 (H.264)
- **Codec de Video:** H.264 (AVC)
- **Codec de Audio:** AAC (opcional - mejor sin audio para publicidad)
- **Frame Rate:** 24-30 fps

### Optimización de Performance
- **Autoplay:** ✅ Habilitado por defecto
- **Muted:** ✅ Siempre activado (política de navegadores)
- **Loop:** ✅ Repetición automática
- **Controls:** ❌ Ocultos para mejor experiencia publicitaria
- **Preload:** metadata (carga rápida)

### Herramientas de Conversión Recomendadas
1. **FFmpeg** (línea de comandos):
   ```bash
   # Para banner (1200x150px, 15 segundos máximo)
   ffmpeg -i input.mp4 -vf scale=1200:150 -t 15 -c:v libx264 -b:v 1.5M output.mp4
   
   # Para sidebar (640x264px, 20 segundos máximo)
   ffmpeg -i input.mp4 -vf scale=640:264 -t 20 -c:v libx264 -b:v 2M output.mp4
   ```

2. **Online:** Convertio.co, CloudConvert
3. **Software:** HandBrake, Adobe Media Encoder

## URLs de Video de Prueba (Libres de Derechos)

### Videos Cortos para Testing:
1. **Promocional Deportivo:** `https://sample-videos.com/zip/10/mp4/360/mp4-sample-360-15s.mp4`
2. **Naturaleza:** `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
3. **Corporativo:** `https://www.w3schools.com/html/mov_bbb.mp4`

### Dimensiones Reales de Contenedores Activos:
- Banner Homepage: 1200x150px (ID espacio: 14)
- Banner Parks: 1200x150px (ID espacio: 31)
- Sidebar Activities: 264px altura (ID espacio: 6)
- Sidebar Parks: 264px altura (ID espacio: varios)

## Pasos para Probar Videos:

1. **Acceder al Administrador:** `/admin/advertising/advertisements`
2. **Crear Nuevo Anuncio:** Botón "Nuevo Anuncio"
3. **Configurar:**
   - Tipo de Contenido: **Video**
   - Método: **URL Externa**
   - URL: Usar una de las URLs de prueba
   - Duración: Especificar segundos del video
4. **Asignar a Espacio:** Ir a `/admin/advertising/assignments`
5. **Ver Resultado:** Visitar página pública correspondiente

## Monitoreo de Performance:

El sistema incluye:
- ✅ Tracking automático de impresiones
- ✅ Registro de clicks/interacciones
- ✅ Cache-busting para actualizaciones inmediatas
- ✅ Fallback automático a imagen en caso de error
- ✅ Responsive design adaptativo

---

**Nota:** Los videos se reproducen automáticamente sin sonido cumpliendo las políticas de navegadores modernos y mejorando la experiencia del usuario.