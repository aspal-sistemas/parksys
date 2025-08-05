# Manual de Usuario - Módulo de Visitantes
## Sistema ParkSys - Bosques Urbanos de Guadalajara

---

## Tabla de Contenidos
1. [Introducción al Módulo](#introducción-al-módulo)
2. [Dashboard de Visitantes](#dashboard-de-visitantes)
3. [Conteo de Visitantes](#conteo-de-visitantes)
4. [Evaluaciones de Visitantes](#evaluaciones-de-visitantes)
5. [Criterios de Evaluación](#criterios-de-evaluación)
6. [Retroalimentación Ciudadana](#retroalimentación-ciudadana)
7. [Flujos de Trabajo Recomendados](#flujos-de-trabajo-recomendados)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción al Módulo

El **Módulo de Visitantes** es una herramienta integral diseñada para la gestión completa de la experiencia ciudadana en los parques urbanos de Guadalajara. Este módulo permite el monitoreo, análisis y mejora continua de la satisfacción de los visitantes mediante cinco componentes principales:

### ¿Para qué sirve?
- **Monitorear** el flujo de visitantes en tiempo real
- **Medir** la satisfacción ciudadana de manera sistemática
- **Analizar** tendencias de uso y preferencias
- **Mejorar** la calidad del servicio basado en datos reales
- **Reportar** métricas ejecutivas para toma de decisiones

### Acceso al Módulo
1. Inicie sesión en ParkSys con sus credenciales administrativas
2. En el sidebar administrativo, localice la sección **"Visitantes"**
3. Expanda el menú para acceder a las cinco funcionalidades

---

## Dashboard de Visitantes

### Descripción
El Dashboard proporciona una vista ejecutiva consolidada de todas las métricas relacionadas con visitantes, evaluaciones y retroalimentación ciudadana.

### Características Principales
- **Métricas Unificadas**: Total de visitantes, evaluaciones recibidas y promedio de calificaciones
- **Análisis Temporal**: Tendencias de visitación por períodos configurables
- **Vista por Parques**: Filtrado específico por ubicación
- **Gráficas Interactivas**: Visualización de datos mediante charts dinámicos

### Cómo Usar el Dashboard

#### Paso 1: Acceso
- Navegue a **Visitantes > Dashboard** en el sidebar administrativo
- El sistema cargará automáticamente los datos más recientes

#### Paso 2: Interpretación de Métricas
Las tarjetas superiores muestran:
- **Total Visitantes**: Suma histórica de todos los registros
- **Evaluaciones**: Cantidad total de evaluaciones recibidas
- **Promedio General**: Calificación promedio del sistema (escala 1-5 estrellas)
- **Retroalimentación**: Cantidad de comentarios y sugerencias

#### Paso 3: Filtrado de Información
- Use el **selector de parques** para filtrar datos específicos
- Seleccione **"Todos los parques"** para vista general
- Los datos se actualizarán automáticamente según su selección

#### Paso 4: Análisis de Tendencias
- Revise las gráficas de tendencias temporales
- Identifique picos y valles en la visitación
- Correlacione eventos específicos con cambios en métricas

### Casos de Uso Recomendados
- **Reuniones Ejecutivas**: Presentar métricas consolidadas mensualmente
- **Análisis de Performance**: Evaluar el impacto de mejoras implementadas
- **Planificación Estratégica**: Identificar parques que requieren atención prioritaria

---

## Conteo de Visitantes

### Descripción
Sistema integral para el registro, seguimiento y análisis de la afluencia de visitantes en todos los parques del sistema.

### Funcionalidades Disponibles

#### Registro Manual de Visitantes
Permite capturar datos de visitación cuando no se cuenta con sistemas automáticos.

**Campos de Registro:**
- **Fecha**: Selección de fecha específica de registro
- **Parque**: Ubicación donde se realiza el conteo
- **Cantidad**: Número total de visitantes registrados
- **Método de Conteo**: Manual, Automático, o Estimado
- **Condiciones Climáticas**: Soleado, Nublado, Lluvioso, Otro
- **Observaciones**: Notas adicionales relevantes

#### Paso a Paso: Registrar Conteo Manual

1. **Acceso al Formulario**
   - Vaya a **Visitantes > Conteo**
   - Haga clic en **"Nuevo Registro"**

2. **Completar Información Básica**
   - Seleccione la **fecha** del conteo
   - Elija el **parque** correspondiente
   - Ingrese la **cantidad** de visitantes

3. **Especificar Método y Condiciones**
   - Seleccione **"Manual"** en método de conteo
   - Indique las **condiciones climáticas** observadas
   - Agregue **observaciones** si son relevantes

4. **Guardar Registro**
   - Revise la información ingresada
   - Haga clic en **"Guardar"**
   - El sistema confirmará el registro exitoso

#### Importación Masiva de Datos
Para volúmenes grandes de información histórica o datos de sistemas externos.

**Proceso de Importación:**

1. **Descargar Plantilla**
   - Haga clic en **"Descargar Plantilla CSV"**
   - Abra el archivo en Excel o aplicación similar

2. **Preparar Datos**
   - Complete las columnas requeridas:
     - `fecha` (formato: YYYY-MM-DD)
     - `parque_id` (ID numérico del parque)
     - `cantidad` (número entero)
     - `metodo` (Manual/Automático/Estimado)
     - `clima` (sunny/cloudy/rainy/other)
   - Verifique que no haya celdas vacías en campos obligatorios

3. **Importar Archivo**
   - Haga clic en **"Importar CSV"**
   - Seleccione su archivo preparado
   - El sistema validará automáticamente los datos

4. **Revisar Resultados**
   - Confirme los registros procesados correctamente
   - Revise cualquier error reportado por el sistema
   - Los datos se integrarán inmediatamente a las métricas

#### Sistema de Reportes y Análisis

**Filtros Disponibles:**
- **Rango de Fechas**: Período específico de análisis
- **Parque Específico**: Datos de una ubicación particular
- **Método de Conteo**: Comparar precisión entre métodos
- **Condiciones Climáticas**: Analizar impacto del clima

**Visualizaciones Incluidas:**
- **Gráfica Temporal**: Tendencia de visitación por días/semanas/meses
- **Comparativo por Parques**: Ranking de parques más visitados
- **Distribución Climática**: Impacto de condiciones meteorológicas
- **Tabla Detallada**: Registros individuales con paginación

#### Exportación de Datos
- **CSV Completo**: Todos los registros con filtros aplicados
- **Excel Profesional**: Formato ejecutivo con gráficas incluidas
- **PDF de Reportes**: Documento listo para presentaciones

---

## Evaluaciones de Visitantes

### Descripción
Sistema completo para capturar, gestionar y analizar la satisfacción de los visitantes mediante evaluaciones estructuradas.

### Componentes del Sistema

#### Formularios de Evaluación
Los ciudadanos pueden completar evaluaciones que incluyen:
- **Calificación General**: Escala de 1 a 5 estrellas
- **Criterios Específicos**: Limpieza, seguridad, amenidades, etc.
- **Comentarios Escritos**: Retroalimentación cualitativa
- **Datos del Evaluador**: Información demográfica opcional

#### Gestión Administrativa

**Vista de Lista:**
- Tabla completa de todas las evaluaciones recibidas
- Filtros por parque, calificación, fecha
- Paginación para manejo eficiente de volumen
- Exportación a CSV/Excel

**Vista de Fichas:**
- Formato visual tipo tarjetas
- Información resumida por evaluación
- Acceso rápido a detalles completos
- Ideal para revisión ejecutiva

#### Paso a Paso: Gestionar Evaluaciones

1. **Acceso al Módulo**
   - Navegue a **Visitantes > Evaluaciones**
   - Elija entre vista de lista o fichas

2. **Filtrar Información**
   - Use el **buscador** para encontrar evaluaciones específicas
   - Aplique **filtros por parque** para análisis localizado
   - Seleccione **rango de fechas** para períodos específicos

3. **Revisar Evaluaciones Individuales**
   - Haga clic en **"Ver Detalles"** en cualquier evaluación
   - Revise la calificación general y específica
   - Lea los comentarios del visitante

4. **Análisis de Tendencias**
   - Observe patrones en calificaciones bajas
   - Identifique comentarios recurrentes
   - Documente áreas de mejora identificadas

5. **Acciones de Seguimiento**
   - Para evaluaciones negativas, documente acciones correctivas
   - Comparta insights con equipos operativos
   - Monitoree mejoras en evaluaciones posteriores

#### Análisis de Datos
- **Promedio de Calificaciones**: Por parque y período
- **Distribución de Puntajes**: Histograma de satisfacción
- **Análisis de Comentarios**: Identificación de temas recurrentes
- **Tendencias Temporales**: Evolución de la satisfacción

#### Exportación y Reportes
- **Exportación Completa**: Todas las evaluaciones con filtros
- **Reportes Ejecutivos**: Resúmenes con estadísticas clave
- **Análisis de Sentimientos**: Categorización de comentarios

---

## Criterios de Evaluación

### Descripción
Módulo de configuración que permite definir y personalizar los parámetros de evaluación que utilizarán los visitantes.

### Gestión de Criterios

#### Criterios Predefinidos
El sistema incluye criterios base como:
- **Limpieza General**: Estado de limpieza del parque
- **Seguridad**: Percepción de seguridad personal
- **Amenidades**: Calidad de instalaciones (baños, bancas, etc.)
- **Mantenimiento**: Estado de conservación general
- **Accesibilidad**: Facilidad de acceso para personas con discapacidad

#### Cómo Agregar Nuevos Criterios

1. **Acceso al Módulo**
   - Vaya a **Visitantes > Criterios**
   - Haga clic en **"Nuevo Criterio"**

2. **Definir Criterio**
   - **Nombre**: Título descriptivo del criterio
   - **Descripción**: Explicación detallada para evaluadores
   - **Tipo de Escala**: Numérica, estrellas, o categórica
   - **Peso**: Importancia relativa en calificación general

3. **Configurar Opciones**
   - Para escalas numéricas: rango mínimo y máximo
   - Para escalas categóricas: opciones disponibles
   - Para estrellas: cantidad de estrellas (típicamente 5)

4. **Activar Criterio**
   - Seleccione **"Activo"** para incluir en nuevas evaluaciones
   - Los criterios inactivos no aparecerán en formularios públicos

#### Edición de Criterios Existentes

1. **Localizar Criterio**
   - Use la lista de criterios disponibles
   - Filtre por estado (activo/inactivo) si necesario

2. **Modificar Configuración**
   - Haga clic en **"Editar"** junto al criterio deseado
   - Actualice los campos necesarios
   - Considere el impacto en evaluaciones históricas

3. **Gestionar Estado**
   - **Desactivar**: Quita el criterio de nuevos formularios
   - **Eliminar**: Solo disponible si no hay evaluaciones asociadas

#### Mejores Prácticas
- **Límite de Criterios**: Mantenga entre 5-8 criterios para evitar fatiga del evaluador
- **Claridad**: Use nombres y descripciones fáciles de entender
- **Consistencia**: Mantenga escalas uniformes entre criterios similares
- **Relevancia**: Enfoque en aspectos que realmente puede mejorar

---

## Retroalimentación Ciudadana

### Descripción
Canal directo de comunicación entre ciudadanos y administración para reportes, sugerencias y comentarios no estructurados.

### Tipos de Retroalimentación

#### Formularios Disponibles
1. **Compartir Experiencia**: Relatos positivos o negativos detallados
2. **Reportar Problema**: Incidencias específicas que requieren atención
3. **Sugerir Mejora**: Propuestas constructivas de los ciudadanos
4. **Proponer Evento**: Ideas para actividades en los parques

#### Gestión de Retroalimentación

**Vista Consolidada:**
- Lista completa de todos los comentarios recibidos
- Filtros por tipo de formulario, parque, y estado
- Sistema de paginación para manejo eficiente
- Búsqueda por texto libre

**Estados de Seguimiento:**
- **Pendiente**: Retroalimentación recién recibida
- **En Progreso**: Se está trabajando en la respuesta/solución
- **Resuelto**: Acción completada o respuesta enviada
- **Archivado**: Comentarios para referencia histórica

#### Paso a Paso: Gestionar Retroalimentación

1. **Revisar Nuevas Entradas**
   - Acceda a **Visitantes > Retroalimentación**
   - Filtre por **"Estado: Pendiente"**
   - Priorice según urgencia y tipo

2. **Evaluar Contenido**
   - Lea el comentario completo del ciudadano
   - Revise información de contacto si está disponible
   - Clasifique según tipo de acción requerida

3. **Asignar Estado Apropiado**
   - **En Progreso**: Para items que requieren investigación
   - **Resuelto**: Para comentarios que no requieren acción
   - **Pendiente**: Mantener si necesita más información

4. **Tomar Acciones Correspondientes**
   - **Problemas**: Reporte a equipos de mantenimiento
   - **Sugerencias**: Evalúe viabilidad y escalamiento
   - **Experiencias**: Documente para análisis de tendencias

5. **Seguimiento y Cierre**
   - Actualice estado según progreso
   - Documente acciones tomadas
   - Marque como resuelto al completar

#### Sistema de Notificaciones Automáticas
- **Email Automático**: Se envía notificación a administradores al recibir nueva retroalimentación
- **Dashboard Alerts**: Indicadores visuales de items pendientes
- **Reportes Semanales**: Resumen automático de actividad

#### Análisis de Patrones
- **Temas Recurrentes**: Identifique problemas sistemáticos
- **Participación por Parque**: Compare engagement ciudadano
- **Temporalidad**: Analice patrones estacionales o de eventos

#### Exportación y Reportes
- **Excel Ejecutivo**: Resumen con categorización automática
- **CSV Completo**: Datos detallados para análisis avanzado
- **Reportes de Tendencias**: Análisis de evolución temporal

---

## Flujos de Trabajo Recomendados

### Rutina Diaria
1. **Morning Check (9:00 AM)**
   - Revisar Dashboard para métricas del día anterior
   - Verificar nueva retroalimentación pendiente
   - Priorizar acciones urgentes

2. **Registro de Conteo**
   - Actualizar conteos manuales si corresponde
   - Verificar funcionamiento de contadores automáticos
   - Documentar cualquier evento especial

3. **Seguimiento de Retroalimentación**
   - Procesar nuevos comentarios recibidos
   - Actualizar estados de seguimiento
   - Comunicar acciones a equipos relevantes

### Rutina Semanal
1. **Análisis de Tendencias**
   - Revisar gráficas de visitación semanal
   - Comparar con semanas anteriores
   - Identificar patrones o anomalías

2. **Revisión de Evaluaciones**
   - Analizar nuevas evaluaciones recibidas
   - Calcular promedios semanales por parque
   - Documentar insights para mejoras

3. **Reporte Ejecutivo**
   - Generar reportes semanales consolidados
   - Preparar presentación de métricas clave
   - Distribuir a stakeholders relevantes

### Rutina Mensual
1. **Análisis Profundo**
   - Exportar datos completos del mes
   - Realizar análisis estadístico avanzado
   - Identificar correlaciones entre variables

2. **Revisión de Criterios**
   - Evaluar efectividad de criterios actuales
   - Considerar ajustes basados en feedback
   - Implementar mejoras si es necesario

3. **Planificación Estratégica**
   - Revisar cumplimiento de KPIs
   - Definir objetivos para próximo período
   - Ajustar estrategias según resultados

---

## Preguntas Frecuentes

### Generales

**P: ¿Con qué frecuencia se actualizan los datos en el Dashboard?**
R: Los datos se actualizan en tiempo real. Al ingresar nuevos registros, las métricas se reflejan inmediatamente en todas las vistas.

**P: ¿Puedo recuperar datos si elimino accidentalmente un registro?**
R: El sistema mantiene respaldos automáticos. Contacte al administrador técnico para recuperación de datos eliminados accidentalmente.

**P: ¿Cómo puedo cambiar mi contraseña de acceso?**
R: Vaya al menú de usuario (esquina superior derecha) y seleccione "Cambiar Contraseña".

### Conteo de Visitantes

**P: ¿Qué hago si me equivoco al ingresar un conteo?**
R: Localice el registro en la lista, haga clic en "Editar" y corrija la información. El sistema mantendrá un historial de cambios.

**P: ¿Puedo registrar conteos de fechas pasadas?**
R: Sí, el sistema permite registro retroactivo. Seleccione la fecha correspondiente en el formulario.

**P: ¿Qué método de conteo debo seleccionar?**
R: Use "Manual" para conteos realizados por personal, "Automático" para datos de sensores, y "Estimado" para aproximaciones basadas en observación.

### Evaluaciones

**P: ¿Puedo modificar una evaluación después de que un ciudadano la envió?**
R: No es recomendable modificar evaluaciones de ciudadanos. Si hay errores evidentes, documente la situación y mantenga la evaluación original para transparencia.

**P: ¿Cómo respondo a evaluaciones muy negativas?**
R: Use el sistema de retroalimentación para contactar al ciudadano si proporcionó información de contacto. Documente acciones correctivas tomadas.

### Criterios de Evaluación

**P: ¿Puedo cambiar criterios mientras hay evaluaciones activas?**
R: Sí, pero los cambios solo afectarán nuevas evaluaciones. Las evaluaciones existentes mantendrán los criterios originales.

**P: ¿Cuántos criterios debo tener activos?**
R: Recomendamos entre 5-8 criterios para balance entre información detallada y facilidad de uso.

### Retroalimentación

**P: ¿Debo responder a toda la retroalimentación recibida?**
R: No es obligatorio, pero es recomendable reconocer comentarios constructivos y resolver problemas reportados.

**P: ¿Cómo priorizo la retroalimentación?**
R: Priorice problemas de seguridad, luego temas que afecten múltiples usuarios, y finalmente sugerencias de mejora.

### Técnicas

**P: ¿Qué navegadores son compatibles?**
R: El sistema funciona en Chrome, Firefox, Safari y Edge en sus versiones más recientes.

**P: ¿Puedo acceder desde dispositivos móviles?**
R: Sí, la interfaz es completamente responsive y funciona en tablets y smartphones.

**P: ¿Hay límites en el tamaño de archivos para importación?**
R: Los archivos CSV no deben exceder 10MB. Para archivos más grandes, divida en múltiples importaciones.

---

## Contacto y Soporte

Para soporte técnico o preguntas no cubiertas en este manual:
- **Email**: soporte@parquesdemexico.org
- **Teléfono**: +52 (33) 1234-5678
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM

---

*Manual de Usuario - Módulo de Visitantes v1.0*  
*Sistema ParkSys - Bosques Urbanos de Guadalajara*  
*Última actualización: Enero 2025*