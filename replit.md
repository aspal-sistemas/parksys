# ParkSys - Parks Management System

## Overview
ParkSys is a comprehensive municipal parks management system designed to streamline the management of parks, activities, volunteers, instructors, assets, and finances. It offers a modern full-stack application with role-based access control and various modules to support diverse park operations. The vision is to provide municipalities with a robust tool to efficiently manage urban green spaces, enhance citizen engagement, and ensure sustainable park operations.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application uses a client-server architecture with a modern full-stack:
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, Radix UI (shadcn/ui), React Query for state management, React Router for navigation, and React Hook Form with Zod for forms.
- **Backend**: Node.js with Express, TypeScript, and Multer for file uploads (local storage).
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Role-based access control system.

## Recent Changes (July 31, 2025)
- **Database Schema Updates**: Restructured sponsorship system tables:
  - Renamed `level` field to `category` in `sponsorship_packages` table
  - Renamed `level` field to `package_category` in `sponsors` table  
  - Removed `events_included` and `exposure_level` fields from `sponsorship_packages`
  - Added `benefits` field (JSON array) and `isActive` field (boolean) to sponsorship packages
- **Nature-Themed Category System**: Implemented new sponsorship hierarchy using Mexican native species (lowest to highest):
  - Trees: Colomo → Sauce → Encino → Pino → Ahuehuete → Ceiba
  - Wildlife: Ardilla → Guacmaya → Pato Real Mexicano → Halcón
  - Updated all existing database records and UI forms to use new categorization
- **UI Consistency**: Standardized sponsor management modal interactions and button text to "Guardar cambios"
- **Form Validation**: Updated Zod schemas to match new database structure with nature-themed categories
- **Component Architecture**: Separated logo upload states between create/edit modals to prevent interference
- **UI/UX Decisions**: Emphasizes a consistent design language with `Card` patterns, standardized iconography (e.g., `bg-gray-50`, `w-8 h-8 text-gray-900`, `text-3xl font-bold`), corporate color palettes (e.g., green, blue, orange, purple, teal), and responsive layouts. Design principles include visual-first approaches (e.g., photo-prominent cards), intuitive navigation (e.g., left-aligned admin navigation, simplified sidebars), and clear separation of content.
- **Technical Implementations**: Features include dynamic form handling, robust data validation, lazy loading for routes, centralized state management, and optimized image loading.
- **Feature Specifications**:
    - **Park Management**: Comprehensive CRUD for parks, amenities, multimedia (images, documents), and integration with other modules.
    - **Activity Management**: Creation, scheduling, categorization, image management, instructor assignment, and public catalog.
    - **Visitor Management**: Daily and range-based visitor counting, demographic breakdown, and statistical reporting.
    - **HR Management**: Employee directory, payroll processing (automated IMSS, ISR, INFONAVIT), vacation requests, departmental organization with organigrams, and CSV import/export.
    - **Financial Management**: Accounting (SAT codes, journal entries, cash flow matrix), expense/income categories, and budget planning.
    - **Asset Management**: Inventory tracking, maintenance scheduling, incident reporting, and asset assignments.
    - **Communication & Marketing**: Email campaigns, templates, bulk sending, analytics, and dynamic advertising spaces with impression/click tracking.
    - **Volunteer & Instructor Management**: Registration, evaluation, recognition, and profile management.
    - **Concession Management**: Contracts, active concessions, financial integration, and detailed public pages.
    - **Security**: Advanced authentication, login attempt tracking, audit logs, and password recovery.
    - **Tree Management**: Inventory, species catalog, maintenance tracking (by code or selection), and ecological data.
    - **Event Management**: General events and specific AMBU (Agencia Metropolitana de Bosques Urbanos) events with differentiated forms and cost calculators.
    - **Space Reservations**: Management of reservable spaces with automatic cost calculation and calendar views.
- **System Design Choices**: Single Source of Truth architecture ensures data consistency across modules. Internationalization (i18n) support for multiple languages (Spanish, English, Portuguese) is implemented throughout the application. Error handling is robust with detailed logging and user-friendly notifications. Optimized for Replit deployment.

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL connection.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/*** and shadcn/ui**: UI component primitives and styling.
- **drizzle-orm**: Type-safe ORM.
- **express**: Web server framework.
- **multer**: File upload handling.
- **bcryptjs**: Password hashing.
- **zod**: Schema validation.
- **Vite**: Build tool.
- **TypeScript**: Language.
- **Tailwind CSS**: Styling framework.
- **tsx**: TypeScript execution.
- **Nodemailer/SendGrid**: Email services.
- **Recharts**: Charting library.
- **PapaParse**: CSV parsing.
- **Handlebars**: Email templating.
- **node-cron**: Task scheduling.
- **wouter**: React router.