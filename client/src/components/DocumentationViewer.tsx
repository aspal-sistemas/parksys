import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
                      __html: currentSection?.content.replace(/\n/g, '<br/>') || '' 
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