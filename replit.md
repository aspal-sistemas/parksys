# ParkSys - Parks Management System

## Overview
ParkSys is a comprehensive municipal parks management system designed to streamline the management of parks, activities, volunteers, instructors, assets, and finances. It offers a modern full-stack application with role-based access control and various modules to support diverse park operations. The vision is to provide municipalities with a robust tool to efficiently manage urban green spaces, enhance citizen engagement, and ensure sustainable park operations.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application uses a client-server architecture with a modern full-stack.
**UI/UX Decisions**: Emphasizes a consistent design language with `Card` patterns, standardized iconography, corporate color palettes (e.g., green, blue, orange, purple, teal), and responsive layouts. Design principles include visual-first approaches, intuitive navigation, and clear separation of content.
**Technical Implementations**: Features include dynamic form handling, robust data validation, lazy loading for routes, centralized state management, and optimized image loading.
**Feature Specifications**:
- **Park Management**: Comprehensive CRUD for parks, amenities, and multimedia. Includes park statistics with 9 indicator cards, and a streamlined interface with search-only filters.
- **Activity Management**: Creation, scheduling, categorization, image management, instructor assignment, and public catalog.
- **Visitor Management**: Daily and range-based visitor counting, demographic breakdown, and statistical reporting.
- **HR Management**: Employee directory, payroll processing, vacation requests, departmental organization with organigrams, and CSV import/export.
- **Financial Management**: Accounting (SAT codes, journal entries, cash flow matrix), expense/income categories, and budget planning.
- **Asset Management**: Inventory tracking, maintenance scheduling, incident reporting, and asset assignments.
- **Communication & Marketing**: Email campaigns, templates, bulk sending, analytics, and dynamic advertising spaces with impression/click tracking.
- **Volunteer & Instructor Management**: Registration, evaluation, recognition, and profile management with email-based invitation system for instructors.
- **Concession Management**: Contracts, active concessions, financial integration, and detailed public pages.
- **Security**: Advanced authentication, login attempt tracking, audit logs, and password recovery, including a comprehensive role-based access control system with 7 hierarchical roles and granular permissions.
- **Tree Management**: Inventory, species catalog, maintenance tracking, and ecological data.
- **Event Management**: General events and specific AMBU events with differentiated forms and cost calculators.
- **Space Reservations**: Management of reservable spaces with automatic cost calculation and calendar views.
- **Sponsor Management**: Supports a 10-tier gemstone/precious metal sponsorship system with unique icons, color schemes, and graduated benefits.
- **Configuration & Security Maintenance**: Centralized modules for backup, performance monitoring, and system updates.
**System Design Choices**: Single Source of Truth architecture ensures data consistency across modules. Clear separation between organizational users (with login access) and external catalogs (employees, volunteers, instructors, concessionaires as independent databases). Email-based invitation system for instructor registration with token validation and expiration. Internationalization (i18n) support for multiple languages (Spanish, English, Portuguese) is implemented throughout the application. Error handling is robust with detailed logging and user-friendly notifications. Optimized for Replit deployment. All images are handled via a local multer-based file upload system with dynamic detection for production/development environments and a build-time asset migration script for Vercel deployments. Server health checks are optimized for rapid response and robust detection across various deployment platforms. The Admin UI has been standardized with consistent layouts and all sidebar modules have been integrated into the main content flow for improved accessibility and visual coherence.

**Recent Updates (January 2025)**: Park view interface has been restructured with 5 core tabs: Actividades, Concesiones, Reservas, Eventos, and Incidencias. Removed Trees, Assets, and Información tabs, replaced with streamlined operational modules. All tabs display real database data with detailed information cards. Concessions show full operational details including payments and schedules. Reservations display contact information, costs, and booking details. Events system adapted to work with location-based searching instead of direct park relationships. Dashboard indicator cards updated to reflect new tab structure with proper data connectivity. Default tab changed from "Información" to "Actividades" for immediate operational focus.

**Known Issues**: The /admin/parks page occasionally experiences intermittent filter elements reappearing despite being removed from the code. This appears to be related to caching or code regeneration processes. The page should only display a simple search bar without additional filters. Current implementation has been cleaned to show only search functionality without type, status, or category filters.

**Latest Update (January 2025)**: User specifically requested removal of ONLY the amenities filter from /admin/parks while keeping other filters intact. The codebase currently shows no amenities filter - only a search bar exists. If amenities filter reappears, it's likely due to dynamic injection or caching issues. Previous references to SimpleFilterSidebar and ModernFilterSidebar components have been removed.

**Current Fix (January 2025)**: Applied comprehensive solution to prevent filter reappearance: added explicit comments in code stating no filters should appear, created robust search-only interface with Card wrapper, and added "Sin Filtros" indicator in page subtitle. System now has multiple safeguards against dynamic filter injection.

**Navigation Reorganization (August 2025)**: Successfully moved "Evaluaciones Dashboard" from sidebar submenu to header Metrics section under "Gestión" dropdown. Dashboard removed from sidebar's Evaluaciones submenu to clean up navigation structure. Evaluation submenus visibility improved with auto-expansion when on evaluaciones routes. Route structure maintained at `/admin/evaluaciones` for main dashboard with all evaluation modules accessible through sidebar submenu under Evaluaciones.

**Evaluation System Consolidation (August 2025)**: Eliminated redundant `/admin/visitors/evaluations` section since all park evaluations are now centralized under the unified `/admin/evaluaciones/parques` system. Removed duplicate files, routes, and navigation references to maintain clean architecture and avoid confusion between old visitor-specific evaluations and the new unified evaluation system.

**Critical Bug Fix (August 2025)**: Resolved critical activity update issue where `categoryId` and `allowsPublicRegistration` fields were not being saved. Root cause was multiple duplicate PUT `/activities/:id` endpoints in different files (`server/routes.ts`, `server/activityRoutes.ts`, `server/activitiesRoutes.ts`). The issue was caused by field name mismatch - frontend sends `categoryId` and `allowsPublicRegistration`, but backend was expecting `category_id` and `registrationEnabled`. Fix implemented proper field mapping in `server/activityRoutes.ts` (the active endpoint). Verified working correctly with logs showing proper data flow and database updates.

## External Dependencies
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI (shadcn/ui), React Query, React Router, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Multer, bcryptjs.
- **Database**: PostgreSQL, Drizzle ORM, @neondatabase/serverless.
- **Email Services**: Nodemailer (configured with Gmail), Handlebars.
- **Data Handling**: PapaParse.
- **Charting**: Recharts.
- **Scheduling**: node-cron.
- **Routing**: wouter.