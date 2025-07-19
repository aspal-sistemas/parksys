# URLs de Videos de Prueba para Publicidad

## Videos Optimizados para Testing (Libres de Derechos)

### Videos Cortos (10-15 segundos) - Ideales para Banners
```
https://sample-videos.com/zip/10/mp4/480/SampleVideo_360x240_1mb.mp4
https://sample-videos.com/zip/10/mp4/480/SampleVideo_640x360_1mb.mp4
https://sample-videos.com/zip/10/mp4/720/SampleVideo_1280x720_1mb.mp4
```

### Videos Promocionales (15-30 segundos)
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4
```

### Videos de Ejemplo Técnico (W3Schools)
```
https://www.w3schools.com/html/mov_bbb.mp4
https://www.w3schools.com/html/movie.mp4
```

## Pasos para Probar Videos:

### Opción 1: URL Externa (Recomendada para Testing)
1. Ve a `/admin/advertising/advertisements`
2. Clic en "Nuevo Anuncio"
3. Configura:
   - **Título:** "Video de Prueba - Banner"
   - **Campaña:** Selecciona cualquier campaña existente
   - **Tipo de Contenido:** Video
   - **Método de Almacenamiento:** URL Externa
   - **URL del Contenido:** Pega una de las URLs de arriba
   - **Duración:** 15 (segundos)
   - **Texto del Botón:** "Ver Video Completo"
4. Clic en "Crear Anuncio"

### Opción 2: Subir Archivo Local
1. Mismo proceso pero selecciona "Subir Archivo"
2. El selector ahora debe permitir elegir archivos .mp4, .webm, .mov, etc.
3. Máximo 10MB

### Asignar a Espacio Publicitario:
1. Ve a `/admin/advertising/assignments`
2. Clic en "Nueva Asignación"
3. Selecciona el anuncio de video que creaste
4. Selecciona un espacio (recomiendo Banner Homepage ID:14)
5. Establece fechas de vigencia
6. Guarda

### Ver el Resultado:
- **Banner Homepage:** Visita la página principal
- **Banner Parks:** Ve a `/parks`
- **Sidebar:** Ve a cualquier página con sidebar publicitario

## Especificaciones Técnicas por Contenedor:

- **Banner (1200x150px):** Video panorámico, 10-15s máximo
- **Sidebar (264px altura):** Video cuadrado/vertical, 15-20s máximo
- **Promotional Cards:** Video compacto, 10-15s máximo

El video se reproducirá automáticamente sin sonido y en loop.