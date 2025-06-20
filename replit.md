# ParkSys - Parks Management System

## Overview

This is a comprehensive municipal parks management system built with a modern full-stack architecture. The application provides tools for managing parks, activities, volunteers, instructors, assets, finances, and various other municipal park operations. The system includes role-based access control and supports multiple modules for different aspects of park management.

## System Architecture

The application follows a client-server architecture with the following stack:

- **Frontend**: React with TypeScript, Vite for build tooling, Tailwind CSS for styling
- **Backend**: Node.js with Express server, TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Role-based authentication system with multiple user types
- **File Management**: Multer for file uploads with local storage
- **UI Components**: Radix UI components with shadcn/ui styling system

## Key Components

### Frontend Architecture
- **Component Library**: Custom UI components built on top of Radix UI primitives
- **State Management**: React Query for server state management
- **Routing**: React Router for client-side navigation
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture
- **API Structure**: RESTful API with Express router modules
- **Database Layer**: Drizzle ORM with PostgreSQL adapter
- **File Storage**: Local file system storage for uploads
- **Middleware**: Authentication, CORS, and file upload middleware

### Database Schema
The system includes comprehensive schemas for:
- **User Management**: Users, roles, authentication
- **Parks**: Parks, amenities, locations, zones
- **Activities**: Events, scheduling, categorization
- **Volunteers**: Registration, participation tracking, evaluations
- **Instructors**: Assignment management, qualifications
- **Assets**: Equipment tracking, maintenance schedules
- **Finance**: Budget management, income/expense tracking
- **Trees**: Species catalog, inventory management
- **Concessions**: Contract management, payments, locations

## Data Flow

1. **Client Requests**: React frontend makes API calls using Axios
2. **Server Processing**: Express routes handle requests with appropriate middleware
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Flow**: JSON responses sent back to client for state updates
5. **File Handling**: Multer processes file uploads to local storage

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection adapter
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web server framework
- **multer**: File upload handling
- **bcryptjs**: Password hashing
- **zod**: Schema validation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **tsx**: TypeScript execution for development

## Deployment Strategy

The application is configured for Replit deployment with:

- **Development Mode**: `npm run dev` starts both frontend and backend
- **Production Build**: `npm run build` creates optimized bundles
- **Database**: PostgreSQL module configured in Replit
- **Port Configuration**: Frontend on port 5000, auto-scaling deployment
- **File Storage**: Public directory for uploaded assets

The system uses environment variables for database connection and supports both development and production configurations.

## Changelog

- June 16, 2025. Initial setup
- June 16, 2025. Sistema completo de internacionalización implementado - Soporte para español, inglés y portugués con selector de idioma integrado
- June 16, 2025. Traducciones completas del sidebar aplicadas - Todo el sistema de navegación responde al cambio de idioma
- June 16, 2025. Landing page comercial implementada - Página profesional de ventas con branding "Parques de México" disponible en /ventas
- June 16, 2025. Paleta de colores corporativa aplicada - Toda la aplicación usa los colores oficiales de Parques de México (#00a587, #067f5f, #bcd256, #8498a5)
- June 16, 2025. Rebranding completo implementado - Cambio de nombre de "ParquesMX" a "ParkSys" en toda la aplicación
- June 17, 2025. Logo oficial de Parques de México integrado al sistema de recibos de nómina - Template PDF profesional con branding corporativo, campos fiscales mexicanos (RFC, CURP, NSS) y cumplimiento legal completo
- June 17, 2025. Sistema de recibos de nómina completamente funcional - Página de descarga operativa en /api/recibo-nomina, PDF con logo oficial generado (38KB), servidor configurado para archivos estáticos, integración completa con colores corporativos
- June 17, 2025. Documentación completa de arquitectura empresarial generada - Prompt profesional para nuevos proyectos con módulos Configuration/Users/Permissions, Finance integral y HR completo. Sistema modular exportable para crear aplicaciones especializadas
- June 17, 2025. Sistema CRUD completo para categorías financieras implementado - Funcionalidad completa de crear, leer, actualizar y eliminar categorías de ingresos y egresos. Protección de integridad que previene eliminación de categorías en uso. Interface con botones de edición y eliminación integrados
- June 18, 2025. Sistema completo de integración Concesiones → Finanzas implementado - Patrón idéntico al exitoso HR/Nómina aplicado a ingresos por concesiones. Automatización completa de sincronización entre módulos con categorización inteligente y trazabilidad total
- June 18, 2025. Integración Users ↔ Concesionarios completada y funcional - Usuarios con rol "concesionario" aparecen automáticamente en /admin/concessions/concessionaires. Endpoint /api/concessionaires operativo con formateo correcto de datos (name/fullName). Relaciones Drizzle corregidas en shared/schema.ts. Sistema totalmente integrado entre módulos
- June 18, 2025. Sistema automático Concesiones → Finanzas implementado y funcional - Contratos de concesión generan automáticamente ingresos en actual_incomes. Hook automático en creación de contratos activo. Categorización inteligente por tipo de concesión. Trazabilidad completa con campos de integración. Flujo completo: Contrato → Ingreso Automático → Flujo de Efectivo
- June 18, 2025. Integración Concesiones → Finanzas completamente operativa - Hook automático corregido para nuevos contratos. Sistema probado con 5 contratos ($10K, $30K, $15K, $25K, $20K) y sus correspondientes ingresos financieros (IDs 37-41). Paginación implementada en página de ingresos (10 registros por página). Sistema robusto que mantiene la creación de contratos aún si falla la integración financiera
- June 18, 2025. Sistema de prorrateo mensual implementado y verificado - Contratos de concesión generan automáticamente ingresos mensuales prorrateados. Contrato de $10,000 del 17/Junio-31/Diciembre 2025 crea correctamente 7 ingresos de $1,428.57 c/u. Datos verificados en base de datos (IDs 55-61) con categorización "Concesiones". Botón "Actualizar" agregado a interface financiera para refrescar datos
- June 20, 2025. Iconos personalizados completamente funcionales - Corregido endpoint backend para incluir custom_icon_url en consultas de amenidades de parque. Interface ParkAmenity actualizada con customIconUrl. Componente AmenityIcon detecta correctamente iconos personalizados vs sistema. Problema de eliminación de amenidades resuelto - frontend ahora pasa ID correcto de park_amenities en lugar de amenity_id
- June 20, 2025. Iconos de Amenidades Disponibles corregidos - Solucionado problema de renderizado de iconos en página /admin/parks/amenities donde componente AmenityIcon no recibía parámetros correctos (iconType, customIconUrl, size). Todos los 27 iconos de amenidades disponibles ahora se muestran correctamente

## Recent Features

### Sistema de Iconos Personalizados con Tamaños Optimizados - COMPLETADO TOTALMENTE
**Implementado**: Sistema completo de iconos personalizados con tamaños aumentados 50% en toda la aplicación
- **Tamaño Base**: 96px por defecto (era 64px) para máxima visibilidad
- **Tamaños Específicos Optimizados**: 
  - Fichas de parques (ExtendedParksList): 24px (era 12px) - duplicado para mejor legibilidad
  - Detalles de parque (ParkDetail): 36px para información clara
  - Tarjetas de parque: 30px para balance visual
  - Filtros simples: 36px para facilidad de selección
  - Filtros avanzados: 48px para mejor identificación
  - Filtros modernos: 60px para experiencia premium
- **Soporte Completo**: Iconos personalizados y del sistema con detección automática (`amenity.icon === 'custom'`)
- **Consistencia Visual**: Todos los componentes actualizados para mantener proporción y legibilidad
- **Estado**: Sistema completamente funcional con iconos visibles en todas las secciones incluyendo fichas de parques

### Sistema de Paginación de Parques - COMPLETADO
**Implementado**: Sistema completo de paginación con 10 registros por página en /parks
- **Paginación Inteligente**: Muestra 10 parques por página con navegación fluida
- **Controles Completos**: Botones "Anterior/Siguiente" con iconos y navegación por números de página
- **Información Detallada**: Contador que muestra "Página X de Y - Mostrando A-B de C parques"
- **Auto-reset**: Regresa automáticamente a página 1 cuando cambian los filtros
- **Navegación Visual**: Hasta 5 números de página visibles con lógica inteligente de centrado
- **Colores Corporativos**: Página activa usa verde principal (#00a587), hover states optimizados
- **Estado Responsive**: Se oculta automáticamente cuando hay 10 o menos parques
- **Cálculos Precisos**: Total de páginas, índices de inicio/fin, y contadores exactos
- **Estado**: Sistema de paginación completamente funcional y optimizado

### Página de Parques Layout Pantalla Completa - COMPLETADO
**Implementado**: Rediseño completo con layout extendido en español y colores corporativos Parques de México
- **Layout de 2 Columnas**: Búsqueda y tipos de parque en columna izquierda, ilustración en columna derecha
- **Tipos de Parque Actualizados**: urbano, natural, lineal, metropolitano, vecinal, de bolsillo, temático
- **Ilustración Integrada**: Imagen isométrica de parque con overlay "Espacios verdes para toda la familia"
- **Localización Completa**: Todo el interface traducido al español (títulos, labels, botones, placeholders)
- **Paleta Corporativa**: Headers con colores oficiales (#00a587, #067f5f, #8498a5, #bcd256)
- **Organización Vertical**: Búsqueda arriba, tipos de parque abajo en columna izquierda
- **Lista Extendida**: Parques mostrados en formato single-column con foto, amenidades y descripción
- **Botones en Español**: "Buscar Parques" y "Limpiar Filtros" con colores corporativos
- **Estado**: Sistema completamente funcional con diseño balanceado de 2 columnas

### Módulo de Vacaciones Optimizado - COMPLETADO
**Implementado**: Interface simplificada con botón único y filtros esenciales para gestión estratégica
- **Botón Único**: "Nueva Solicitud" posicionado en header principal accesible desde ambas pestañas
- **Filtros Simplificados**: Eliminados campos de fecha de contratación para interface más limpia
- **Filtros Esenciales**: Empleado, departamento, año y mes para análisis granular
- **Estructura Tabbed**: Balances de Vacaciones y Solicitudes de Tiempo Libre organizados en pestañas
- **UX Mejorada**: Interface optimizada para directores de HR con navegación intuitiva
- **Estado**: Sistema completamente funcional con filtrado estratégico operativo

### Sistema de Nómina Completo - IMPLEMENTADO TOTALMENTE
**Implementado**: Módulo completo de nómina con procesamiento automático y integración financiera
- **Interface Completa**: Dashboard con métricas, gestión de períodos, empleados activos, conceptos y reportes
- **Conceptos Personalizables**: Sistema para crear conceptos de nómina personalizados (salarios, deducciones, bonos)
- **Edición de Conceptos**: Funcionalidad completa para editar conceptos existentes con formulario dedicado
- **Visualización de Períodos**: Dialog detallado para ver información completa de períodos de nómina
- **Procesamiento Automático**: Cálculo automático de IMSS (2.375%), ISR e INFONAVIT
- **Integración Financiera**: Generación automática de gastos en módulo de Finanzas
- **Flujo Completo**: Personal → Nómina → Finanzas con trazabilidad total
- **Conceptos Preconfigurados**: 6 conceptos básicos (Salario, Bonificaciones, Horas Extra, IMSS, ISR, INFONAVIT)
- **Formulario Avanzado**: Creación de conceptos con tipos (ingreso/deducción/prestación), categorías y fórmulas
- **Ejemplos Integrados**: Aguinaldo, Prima Vacacional, Vales de Despensa con fórmulas predefinidas
- **CRUD Completo**: Crear, leer, actualizar conceptos de nómina con botones de edición integrados
- **Estado**: Sistema completamente funcional con procesamiento de nómina operativo y edición completa

### Sistema de Gestión de Empleados HR - COMPLETADO TOTALMENTE
**Implementado**: Sistema completo de gestión de empleados con todas las funcionalidades operativas y diseño mejorado
- **Routing Corregido**: Unificación de endpoints API bajo `/api/hr/employees` para consistencia
- **Eliminación de Empleados**: Funcionalidad completa con confirmación doble y llamadas API correctas
- **Edición de Empleados**: Sistema corregido que permite editar sin conflictos de email
- **Visualización de Empleados**: Modal completo para ver detalles con información personal, laboral, contacto de emergencia, habilidades y certificaciones
- **Directorio Avanzado**: Sistema de filtros por nombre, departamento, jerarquía, antigüedad y ordenamiento múltiple
- **Tarjetas de Perfil**: Diseño mejorado con avatares, información jerárquica, habilidades y certificaciones
- **Módulo Departamentos**: Diseño colorido con gradientes por nivel jerárquico, resumen estadístico y acciones integradas
- **Organigrama Renovado**: Estructura visual completa con iconos, colores por nivel, indicadores jerárquicos y gestión de empleados sin departamento
- **Paleta de Colores**: Sistema de colores vibrante (púrpura=Dirección, azul=Asistencias, verde=Coordinaciones, naranja=Áreas, teal=Operativo)
- **Paginación Optimizada**: 10 empleados por página para mejor experiencia de usuario
- **Validación Inteligente**: Email validation que excluye empleado actual durante edición
- **Manejo de Errores**: Sistema robusto para respuestas del servidor
- **Estado**: Todas las operaciones CRUD completamente funcionales con interfaz visual mejorada

### Creación Automática de Usuarios para Empleados - COMPLETADO
**Implementado**: Flujo integrado HR → Usuarios que automatiza la gestión de accesos del personal
- **Funcionalidad**: Al crear empleado en HR se genera automáticamente su usuario del sistema
- **Características**: Asignación automática de rol 'employee', generación de contraseñas temporales, vinculación empleado-usuario
- **Beneficios**: Reducción de trabajo manual, garantiza acceso para todo el personal, datos consistentes
- **Flujo**: Empleado → Usuario automático → Credenciales temporales → Primer acceso obliga cambio
- **Estado**: Sistema de creación automática implementado y funcional

### Sistema de Integraciones Financieras Múltiples - COMPLETADO
**Implementado**: Sistema completo de integración automática entre múltiples módulos y el sistema financiero
- **Módulos de Ingresos**: Concesiones, Eventos, Marketing (automatizados)
- **Módulos de Egresos**: HR/Nómina (completado), Activos, Árboles, Voluntarios, Incidentes (estructurados)
- **Arquitectura**: "Fuente única de verdad" - cada módulo controla sus datos, Finanzas recibe automáticamente
- **Características**: Trazabilidad completa, badges visuales, restricciones de solo lectura, categorización automática
- **API Endpoints**: Sistema completo de sincronización, análisis y dashboard para todas las integraciones
- **Demo Pages**: Páginas de demostración interactivas en `/admin/multi-finance-demo` y `/admin/hr-finance-demo`
- **Base de Datos**: Esquema extendido con campos de integración para actual_incomes y actual_expenses
- **Estado**: Sistema de integraciones múltiples implementado completamente con HR como base funcional

### Sistema Jerárquico Organizacional HR + CSV Import/Export - COMPLETADO
**Implementado**: Sistema completo de jerarquías organizacionales con organigrama automático e importación/exportación CSV
- **Jerarquías**: 5 niveles (1-Dirección, 2-Asistencias, 3-Coordinaciones, 4-Áreas, 5-Operativo)
- **Departamentos**: Cada departamento tiene nombre + nivel jerárquico asignado
- **Organigrama Automático**: Se genera automáticamente basado en jerarquías de empleados
- **Gestión Visual**: Interface organizada por niveles con colores distintivos
- **Asignación Automática**: Empleados aparecen en organigrama según su departamento
- **Funcionalidades**: Crear, editar, eliminar departamentos con nivel jerárquico
- **Paginación**: Sistema completo con botones de eliminar empleado
- **Importar CSV**: Carga masiva con plantilla, vista previa, mapeo automático/manual de columnas
- **Exportar CSV**: Dos formatos (simple/completa), respeta filtros activos, descarga automática
- **Formulario Completo**: Formulario integral con personal, laboral, emergencia, educación y habilidades
- **Integración Backend**: Conexión completa frontend-backend para persistencia de datos
- **Estado**: Sistema jerárquico + CSV + formulario completamente funcional

### Sistema de Internacionalización (i18n) - COMPLETADO TOTALMENTE  
**Implementado**: Sistema completo de múltiples idiomas con traducción automática de todo el sitio
- **Idiomas soportados**: Español (predeterminado), Inglés, Portugués
- **Cobertura completa**: Sidebar, dashboard, gestión de usuarios, gestión de parques, formularios, botones, mensajes
- **Estructura**: Traducciones embebidas directamente en el código para máximo rendimiento
- **Funcionalidades**: Detección automática, persistencia en localStorage, cambio dinámico instantáneo
- **Alcance**: 200+ claves de traducción, todas las páginas administrativas principales
- **Extensibilidad**: Sistema preparado para agregar nuevos idiomas fácilmente
- **Estado**: Traducción automática completa del sitio implementada exitosamente

## User Preferences

Preferred communication style: Simple, everyday language.