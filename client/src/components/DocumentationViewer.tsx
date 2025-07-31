import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { 
  ChevronLeft, 
  Search, 
  BookOpen, 
  Users,
  MapPin,
  TreeDeciduous,
  Activity,
  DollarSign,
  Shield,
  MessageSquare,
  Home,
  FileText,
  List,
  Hash
} from 'lucide-react';

interface DocumentationViewerProps {
  documentId: string;
  onBack?: () => void;
}

interface DocSection {
  id: string;
  title: string;
  level: number;
  content: string;
}

// Function to safely render Markdown content
const renderMarkdown = (content: string): string => {
  try {
    const htmlContent = marked(content, {
      breaks: true,
      gfm: true
    });
    return DOMPurify.sanitize(htmlContent as string);
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return content;
  }
};

// Mock documentation content - En producción esto vendría del servidor
const documentationContent: Record<string, { title: string; icon: React.ReactNode; sections: DocSection[] }> = {
  'visitantes-manual': {
    title: 'Manual Completo - Módulo de Visitantes',
    icon: <Users className="h-5 w-5" />,
    sections: [
      {
        id: 'intro',
        title: 'Introducción al Módulo',
        level: 1,
        content: `
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
        `
      },
      {
        id: 'dashboard',
        title: 'Dashboard de Visitantes',
        level: 1,
        content: `
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
        `
      },
      {
        id: 'conteo',
        title: 'Conteo de Visitantes',
        level: 1,
        content: `
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
        `
      },
      {
        id: 'evaluaciones',
        title: 'Evaluaciones de Visitantes',
        level: 1,
        content: `
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
        `
      },
      {
        id: 'criterios',
        title: 'Criterios de Evaluación',
        level: 1,
        content: `
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

#### Mejores Prácticas
- **Límite de Criterios**: Mantenga entre 5-8 criterios para evitar fatiga del evaluador
- **Claridad**: Use nombres y descripciones fáciles de entender
- **Consistencia**: Mantenga escalas uniformes entre criterios similares
- **Relevancia**: Enfoque en aspectos que realmente puede mejorar
        `
      },
      {
        id: 'retroalimentacion',
        title: 'Retroalimentación Ciudadana',
        level: 1,
        content: `
### Descripción
Canal directo de comunicación entre ciudadanos y administración para reportes, sugerencias y comentarios no estructurados.

### Tipos de Retroalimentación

#### Formularios Disponibles
1. **Compartir Experiencia**: Relatos positivos o negativos detallados
2. **Reportar Problema**: Incidencias específicas que requieren atención
3. **Sugerir Mejora**: Propuestas constructivas de los ciudadanos
4. **Proponer Evento**: Ideas para actividades en los parques

#### Estados de Seguimiento
- **Pendiente**: Retroalimentación recién recibida
- **En Progreso**: Se está trabajando en la respuesta/solución
- **Resuelto**: Acción completada o respuesta enviada
- **Archivado**: Comentarios para referencia histórica

### Sistema de Notificaciones Automáticas
- **Email Automático**: Se envía notificación a administradores al recibir nueva retroalimentación
- **Dashboard Alerts**: Indicadores visuales de items pendientes
- **Reportes Semanales**: Resumen automático de actividad
        `
      },
      {
        id: 'faq',
        title: 'Preguntas Frecuentes',
        level: 1,
        content: `
### Generales

**P: ¿Con qué frecuencia se actualizan los datos en el Dashboard?**
R: Los datos se actualizan en tiempo real. Al ingresar nuevos registros, las métricas se reflejan inmediatamente en todas las vistas.

**P: ¿Puedo recuperar datos si elimino accidentalmente un registro?**
R: El sistema mantiene respaldos automáticos. Contacte al administrador técnico para recuperación de datos eliminados accidentalmente.

### Conteo de Visitantes

**P: ¿Qué hago si me equivoco al ingresar un conteo?**
R: Localice el registro en la lista, haga clic en "Editar" y corrija la información. El sistema mantendrá un historial de cambios.

**P: ¿Qué método de conteo debo seleccionar?**
R: Use "Manual" para conteos realizados por personal, "Automático" para datos de sensores, y "Estimado" para aproximaciones basadas en observación.

### Evaluaciones

**P: ¿Puedo modificar una evaluación después de que un ciudadano la envió?**
R: No es recomendable modificar evaluaciones de ciudadanos. Si hay errores evidentes, documente la situación y mantenga la evaluación original para transparencia.

### Técnicas

**P: ¿Qué navegadores son compatibles?**
R: El sistema funciona en Chrome, Firefox, Safari y Edge en sus versiones más recientes.

**P: ¿Puedo acceder desde dispositivos móviles?**
R: Sí, la interfaz es completamente responsive y funciona en tablets y smartphones.
        `
      }
    ]
  },
  'parques-manual': {
    title: 'Manual Completo - Gestión de Parques',
    icon: <MapPin className="h-5 w-5" />,
    sections: [
      {
        id: 'introduccion',
        title: 'Introducción al Módulo',
        level: 1,
        content: `
El **Módulo de Parques** es el corazón del sistema ParkSys, diseñado para la gestión integral de espacios verdes urbanos en la Ciudad de Guadalajara. Este módulo centraliza toda la información relacionada con la administración, mantenimiento y optimización de los parques municipales.

### Propósito Principal
- **Centralizar** la información de todos los parques del sistema
- **Monitorear** el estado operativo y de mantenimiento
- **Gestionar** amenidades y servicios disponibles
- **Analizar** datos de evaluaciones ciudadanas
- **Facilitar** la toma de decisiones basada en datos

### Acceso al Módulo
1. Inicie sesión en ParkSys con credenciales administrativas
2. En el sidebar administrativo, localice la sección **"Gestión"**
3. Expanda el menú y seleccione **"Parques"**
4. Acceda a los siguientes submenús:
   - Dashboard de Parques
   - Gestión de Parques
   - Evaluaciones de Parques
   - Dashboard de Amenidades
        `
      },
      {
        id: 'dashboard',
        title: 'Dashboard de Parques',
        level: 1,
        content: `
### Descripción General
El Dashboard proporciona una vista ejecutiva consolidada de todos los indicadores clave de rendimiento (KPIs) relacionados con la gestión de parques urbanos.

### Características Principales

#### Métricas Fundamentales
- **Total de Parques**: Cantidad total de espacios verdes registrados
- **Parques Activos**: Espacios operativos y disponibles al público
- **Amenidades Totales**: Servicios e instalaciones disponibles
- **Evaluaciones Recibidas**: Retroalimentación ciudadana recopilada

#### Visualizaciones Interactivas
- **Gráficas de Estado**: Distribución de parques por condición operativa
- **Análisis de Amenidades**: Tipos de servicios más comunes
- **Tendencias de Evaluación**: Evolución de la satisfacción ciudadana
- **Distribución Geográfica**: Mapeo de parques por zona

### Guía de Uso Paso a Paso

#### Paso 1: Acceso al Dashboard
1. Navegue a **Gestión > Parques > Dashboard**
2. El sistema cargará automáticamente los datos más recientes
3. Verifique que las métricas se muestren correctamente

#### Paso 2: Interpretación de Métricas
- **Tarjetas Superiores**: Muestran totales absolutos y porcentajes
- **Gráficas Principales**: Representan distribuciones y tendencias
- **Indicadores de Estado**: Código de colores para alertas

#### Paso 3: Análisis de Datos
- Use los filtros disponibles para segmentar información
- Compare períodos para identificar tendencias
- Identifique parques que requieren atención prioritaria

### Casos de Uso Recomendados

#### Revisión Diaria (5-10 minutos)
- Verificar estado general del sistema
- Identificar alertas o problemas críticos
- Revisar nuevas evaluaciones ciudadanas

#### Análisis Semanal (30-45 minutos)
- Comparar métricas con semana anterior
- Identificar tendencias emergentes
- Planificar intervenciones necesarias
        `
      },
      {
        id: 'gestion',
        title: 'Gestión de Parques',
        level: 1,
        content: `
### Descripción General
La sección de Gestión permite la administración completa del inventario de parques, incluyendo creación, edición, visualización y eliminación de registros.

### Funcionalidades Principales

#### Vista de Lista de Parques
- **Listado Completo**: Todos los parques registrados en el sistema
- **Información Clave**: Nombre, ubicación, estado, amenidades principales
- **Búsqueda Avanzada**: Filtros por nombre, ubicación, estado y tipo
- **Acciones Rápidas**: Ver, editar, gestionar y eliminar parques

#### Creación de Nuevos Parques
**Información Básica Requerida:**
- Nombre oficial del parque
- Dirección completa y referencias
- Coordenadas geográficas (latitud/longitud)
- Área total en metros cuadrados
- Tipo de parque (urbano, metropolitano, vecinal, etc.)

**Información Adicional:**
- Descripción detallada del espacio
- Historia y contexto del parque
- Horarios de operación
- Contacto de administración local
- Fotografías representativas

#### Edición de Parques Existentes
1. **Acceso**: Click en "Editar" desde la lista de parques
2. **Modificación**: Actualizar cualquier campo disponible
3. **Validación**: El sistema verifica la integridad de los datos
4. **Confirmación**: Guardar cambios con registro de auditoría

### Gestión de Amenidades

#### Asignación de Amenidades
- **Selección Múltiple**: Asignar varias amenidades simultáneamente
- **Categorización**: Organizar por tipo de servicio
- **Estado**: Activar/desactivar amenidades específicas
- **Notas**: Agregar observaciones sobre condición o disponibilidad

#### Tipos de Amenidades Disponibles
**Recreación:**
- Juegos infantiles
- Canchas deportivas
- Áreas de ejercicio
- Espacios para mascotas

**Servicios:**
- Baños públicos
- Bebederos
- Estacionamiento
- Iluminación

**Infraestructura:**
- Bancas y mobiliario
- Senderos y caminos
- Áreas verdes
- Sistemas de riego
        `
      },
      {
        id: 'evaluaciones',
        title: 'Evaluaciones de Parques',
        level: 1,
        content: `
### Descripción General
Sistema integral para la gestión y análisis de evaluaciones ciudadanas sobre la calidad y servicios de los parques urbanos.

### Características del Sistema

#### Recopilación de Evaluaciones
- **Formularios Web**: Disponibles en páginas públicas de cada parque
- **Aplicación Móvil**: Evaluación in-situ por parte de visitantes
- **Encuestas Programadas**: Campañas específicas de retroalimentación
- **Integración QR**: Códigos QR en parques para evaluación rápida

#### Métricas de Evaluación
**Criterios Principales:**
- Limpieza y mantenimiento (1-5 estrellas)
- Seguridad y iluminación (1-5 estrellas)
- Calidad de amenidades (1-5 estrellas)
- Accesibilidad universal (1-5 estrellas)
- Experiencia general (1-5 estrellas)

**Información del Evaluador:**
- Nombre completo (opcional)
- Correo electrónico para seguimiento
- Edad y género (estadísticas demográficas)
- Frecuencia de visita al parque
- Motivo principal de la visita

### Análisis y Reportes

#### Dashboard de Evaluaciones
- **Resumen Ejecutivo**: Promedio general y total de evaluaciones
- **Distribución por Criterio**: Gráficas de calificaciones específicas
- **Tendencias Temporales**: Evolución de satisfacción por período
- **Ranking de Parques**: Clasificación por calificación promedio

#### Filtros y Segmentación
- **Por Parque**: Evaluaciones específicas de un espacio
- **Por Período**: Rangos de fechas personalizables
- **Por Calificación**: Filtrar por nivel de satisfacción
- **Por Evaluador**: Análisis demográfico de usuarios

#### Gestión de Retroalimentación
1. **Visualización**: Lista completa de evaluaciones recibidas
2. **Detalle Individual**: Información completa de cada evaluación
3. **Seguimiento**: Estado de atención a comentarios y sugerencias
4. **Respuesta**: Sistema de comunicación con evaluadores
        `
      },
      {
        id: 'amenidades',
        title: 'Dashboard de Amenidades',
        level: 1,
        content: `
### Descripción General
Panel especializado para la gestión integral del inventario de amenidades y servicios disponibles en todos los parques del sistema.

### Funcionalidades Principales

#### Inventario de Amenidades
- **Catálogo Completo**: Todas las amenidades registradas en el sistema
- **Clasificación por Tipo**: Categorización según función y propósito
- **Estado Operativo**: Disponible, en mantenimiento, fuera de servicio
- **Distribución por Parques**: Qué amenidades tiene cada espacio

#### Análisis de Distribución
**Gráficas de Distribución:**
- Amenidades más comunes en el sistema
- Parques con mayor cantidad de servicios
- Tipos de amenidades por zona geográfica
- Evolución del inventario por período

**Indicadores de Cobertura:**
- Porcentaje de parques con amenidades básicas
- Identificación de gaps en servicios
- Recomendaciones de equipamiento
- Análisis de necesidades no cubiertas

#### Gestión de Categorías
1. **Creación de Categorías**: Nuevos tipos de amenidades
2. **Organización**: Jerarquía y subcategorías
3. **Descripción**: Especificaciones técnicas y funcionales
4. **Iconografía**: Símbolos y representación visual

### Administración de Amenidades

#### Registro de Nuevas Amenidades
**Información Requerida:**
- Nombre descriptivo de la amenidad
- Categoría y subcategoría
- Descripción detallada
- Especificaciones técnicas
- Estado inicial (activa/inactiva)

#### Asignación a Parques
1. **Selección de Parque**: Elegir espacio específico
2. **Selección de Amenidades**: Múltiple selección disponible
3. **Configuración**: Estado y observaciones específicas
4. **Validación**: Verificar compatibilidad y requisitos

#### Mantenimiento y Actualización
- **Cambio de Estado**: Activar/desactivar servicios
- **Actualización de Información**: Modificar descripciones y especificaciones
- **Registro de Incidencias**: Reportes de problemas o daños
- **Programación de Mantenimiento**: Calendarios preventivos
        `
      },
      {
        id: 'mejores-practicas',
        title: 'Mejores Prácticas',
        level: 1,
        content: `
### Gestión de Datos

#### Calidad de la Información
1. **Completitud**: Asegurar que todos los campos obligatorios estén llenos
2. **Precisión**: Verificar coordenadas geográficas y direcciones
3. **Actualización**: Mantener información de amenidades al día
4. **Consistencia**: Usar nomenclatura estándar para categorías

#### Fotografías y Multimedia
1. **Calidad**: Imágenes de alta resolución y buena iluminación
2. **Representatividad**: Mostrar aspectos más importantes del parque
3. **Actualización**: Renovar fotos cuando cambien instalaciones
4. **Organización**: Mantener galería organizada y etiquetada

### Análisis de Evaluaciones

#### Frecuencia de Revisión
- **Evaluaciones Críticas** (1-2 estrellas): Revisión inmediata
- **Evaluaciones Generales**: Revisión diaria
- **Análisis de Tendencias**: Revisión semanal
- **Reportes Ejecutivos**: Revisión mensual

#### Respuesta a Ciudadanos
1. **Tiempo de Respuesta**: Máximo 48 horas para evaluaciones críticas
2. **Tono Profesional**: Respuestas corteses y constructivas
3. **Seguimiento**: Informar sobre acciones tomadas
4. **Cierre del Ciclo**: Confirmar resolución de problemas

### Optimización del Sistema

#### Rendimiento
1. **Carga de Imágenes**: Usar formatos optimizados (WebP preferible)
2. **Filtros Eficientes**: Combinar criterios para búsquedas rápidas
3. **Exportaciones**: Programar reportes grandes en horarios de baja demanda
4. **Cache**: Aprovechar almacenamiento temporal para consultas frecuentes

#### Seguridad
1. **Contraseñas Seguras**: Políticas robustas para cuentas administrativas
2. **Accesos Limitados**: Principio de menor privilegio
3. **Auditoría**: Registro completo de acciones administrativas
4. **Respaldos**: Exportaciones regulares de datos críticos
        `
      },
      {
        id: 'faq',
        title: 'Preguntas Frecuentes',
        level: 1,
        content: `
### Preguntas Generales

**P: ¿Cómo accedo al módulo de Parques?**
R: Inicie sesión en ParkSys, vaya al sidebar administrativo, expanda "Gestión" y seleccione "Parques". Verá los submenús disponibles según sus permisos.

**P: ¿Puedo gestionar varios parques simultáneamente?**
R: Sí, el sistema permite selección múltiple para acciones masivas como asignación de amenidades o exportación de datos.

**P: ¿Con qué frecuencia se actualizan los datos del dashboard?**
R: Los datos se actualizan en tiempo real. Las métricas reflejan información hasta el último registro ingresado en el sistema.

### Gestión de Parques

**P: ¿Qué información es obligatoria para crear un nuevo parque?**
R: Nombre, dirección, coordenadas geográficas, área total y tipo de parque son campos obligatorios.

**P: ¿Puedo modificar las coordenadas de un parque existente?**
R: Sí, desde la opción "Editar" del parque específico. Asegúrese de verificar la precisión de las nuevas coordenadas.

**P: ¿Cómo subo múltiples fotos de un parque?**
R: En la página de gestión del parque, use la sección "Gestión de Imágenes" para subir hasta 10 fotos adicionales a la imagen principal.

### Evaluaciones

**P: ¿Cómo se calculan los promedios de evaluación?**
R: Se promedian todas las calificaciones válidas recibidas. Las evaluaciones sin calificación numérica no afectan el promedio.

**P: ¿Puedo eliminar evaluaciones inapropiadas?**
R: Solo usuarios con permisos de Super Administrador pueden eliminar evaluaciones. Se recomienda marcarlas como "revisadas" en lugar de eliminarlas.

### Amenidades

**P: ¿Cómo creo una nueva categoría de amenidad?**
R: En el Dashboard de Amenidades, use la opción "Gestionar Categorías" para crear nuevos tipos de servicios.

**P: ¿Puedo asignar la misma amenidad a múltiples parques?**
R: Sí, las amenidades pueden asignarse a tantos parques como sea necesario.

### Problemas Técnicos

**P: Las imágenes no cargan correctamente, ¿qué hago?**
R: Verifique que las imágenes sean JPG, PNG o WebP y no excedan 5MB. Limpie la caché del navegador.

**P: ¿Por qué no puedo editar ciertos parques?**
R: Verifique sus permisos de usuario. Es posible que solo tenga acceso de lectura o a parques específicos.
        `
      },
      {
        id: 'soporte',
        title: 'Soporte Técnico',
        level: 1,
        content: `
### Canales de Comunicación

#### Soporte Inmediato
- **Chat en Vivo**: Disponible en horario de oficina (8:00 AM - 6:00 PM)
- **Teléfono**: +52 (33) 1234-5678 ext. 100
- **WhatsApp Business**: +52 (33) 9876-5432

#### Soporte por Email
- **Técnico**: soporte.parksys@guadalajara.gob.mx
- **Administrativo**: admin.parksys@guadalajara.gob.mx
- **Urgencias**: urgencias.parksys@guadalajara.gob.mx

### Procedimiento de Reporte de Problemas

#### Información Requerida
1. **Usuario**: Nombre y rol en el sistema
2. **Fecha/Hora**: Cuándo ocurrió el problema
3. **Acción**: Qué estaba intentando hacer
4. **Error**: Mensaje específico o comportamiento inesperado
5. **Navegador**: Tipo y versión del navegador utilizado
6. **Capturas**: Screenshots que muestren el problema

#### Categorías de Urgencia
**Crítica (Respuesta en 1 hora):**
- Sistema completamente inaccesible
- Pérdida de datos confirmada
- Problemas de seguridad

**Alta (Respuesta en 4 horas):**
- Funcionalidades principales no disponibles
- Errores que impiden operación normal
- Problemas de rendimiento severos

**Media (Respuesta en 24 horas):**
- Funcionalidades específicas con problemas
- Errores menores que permiten trabajo alternativo
- Solicitudes de mejoras importantes

### Acuerdos de Nivel de Servicio (SLA)

#### Disponibilidad del Sistema
- **Objetivo**: 99.5% de uptime mensual
- **Horario de Operación**: 24/7/365
- **Tiempo de Respuesta**: < 2 segundos para operaciones básicas
- **Tiempo de Carga**: < 5 segundos para reportes complejos

#### Soporte Técnico
- **Horario de Atención**: Lunes a viernes 8:00 AM - 6:00 PM
- **Emergencias**: 24/7 para problemas críticos
- **Resolución**: 90% de tickets resueltos en tiempo acordado
- **Satisfacción**: Meta de 95% de satisfacción en encuestas
        `
      }
    ]
  }
};

export function DocumentationViewer({ documentId, onBack }: DocumentationViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [filteredSections, setFilteredSections] = useState<DocSection[]>([]);

  const doc = documentationContent[documentId];

  useEffect(() => {
    if (!doc) return;
    
    const filtered = doc.sections.filter(section =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSections(filtered);
    
    if (filtered.length > 0 && !activeSection) {
      setActiveSection(filtered[0].id);
    }
  }, [doc, searchTerm, activeSection]);

  if (!doc) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Documento no encontrado</h3>
          <p className="text-gray-600 mb-4">El documento solicitado no está disponible.</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentSection = filteredSections.find(s => s.id === activeSection) || filteredSections[0];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          )}
          {doc.icon}
          <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
        </div>
        
        {/* Búsqueda */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar en el documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Índice lateral */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <List className="h-4 w-4" />
                Índice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-2">
                  {filteredSections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        {section.title}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {currentSection?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="prose prose-gray max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(currentSection?.content || '') 
                    }} 
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}