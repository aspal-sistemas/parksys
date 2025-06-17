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

## Recent Features

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