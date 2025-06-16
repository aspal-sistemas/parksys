# Parks Management System

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

## Recent Features

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