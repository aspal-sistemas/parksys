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
- **Park Management**: Comprehensive CRUD for parks, amenities, and multimedia.
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
**System Design Choices**: Single Source of Truth architecture ensures data consistency across modules. Clear separation between organizational users (with login access) and external catalogs (employees, volunteers, instructors, concessionaires as independent databases). Email-based invitation system for instructor registration with token validation and expiration. Internationalization (i18n) support for multiple languages (Spanish, English, Portuguese) is implemented throughout the application. Error handling is robust with detailed logging and user-friendly notifications. Optimized for Replit deployment.

## Recent Changes (August 2025)
- **Image Upload System Fix**: Resolved critical Object Storage compatibility issue where uploaded images received non-servable URLs (`/objects/uploads/...`). Implemented automatic URL correction system that detects and replaces problematic URLs with valid `/uploads/advertising/` paths.
- **Space Reservations Image Management**: Fixed broken image display across both admin panel (`/admin/space-reservations/spaces/edit/[id]`) and public reservations page. All reservation spaces now have functional image display.
- **Automatic Image Correction**: Enhanced preventive system that automatically detects Object Storage URLs (including `storage.googleapis.com` and `replit-objstore`) and replaces them with valid functional image URLs from a curated list. System now works proactively during upload without manual intervention.
- **TypeScript Error Resolution**: Fixed compilation errors in SpaceMediaManager component and reservable spaces routes to ensure proper functionality.
- **Admin Navigation Optimization**: Eliminated duplicate user management routes - removed `/admin/configuracion-seguridad/access/assignments` to avoid functionality duplication with `/admin/configuracion-seguridad/access/users`, which remains as the single comprehensive user management interface.
- **Space Media Management**: Fixed image deletion functionality and upload system in space reservations admin interface. Removed duplicate API routes that caused conflicts and ensured proper error handling.

## Previous Changes (January 2025)
- **Architecture Refactor**: Implemented complete separation of organizational users from catalog entities, eliminating data duplication across employees, volunteers, instructors, and concessionaires tables.
- **Instructor Invitation System**: Built email-based invitation system with dedicated registration flow, token validation, and automatic expiration management.
- **Database Schema Updates**: Updated all catalog tables to be independent with optional user_id references only where needed for organizational roles.

## External Dependencies
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI (shadcn/ui), React Query, React Router, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Multer, bcryptjs.
- **Database**: PostgreSQL, Drizzle ORM, @neondatabase/serverless.
- **Email Services**: Nodemailer (configured with Gmail), Handlebars.
- **Data Handling**: PapaParse.
- **Charting**: Recharts.
- **Scheduling**: node-cron.
- **Routing**: wouter.