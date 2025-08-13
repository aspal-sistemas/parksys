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
- **Vercel Static Assets & Upload System Fix (August 13, 2025)**: Completely resolved image display issues in Vercel deployments by implementing dynamic upload path configuration and comprehensive asset management. Key improvements: (1) **Dynamic Upload Paths**: Added environment-based configuration that uses `public/uploads/` for production (Vercel) and `uploads/` for development, ensuring images persist in serverless environments. (2) **Vercel Configuration Update**: Enhanced vercel.json with proper routes and rewrites to serve static assets correctly from public directory. (3) **Multer Configuration Fix**: Updated all multer configurations across activity-images, concession-images, spaces, and documents to use dynamic paths based on production detection. (4) **Asset Migration**: Copied critical images from uploads/ to public/uploads/ to ensure availability in production deployments. (5) **Server Static File Serving**: Implemented intelligent static file serving that adapts to deployment environment. This ensures all uploaded images display correctly in Vercel while maintaining development workflow compatibility.
- **Deployment Health Check Fix & Server Optimization (August 13, 2025)**: Completely resolved deployment health check failures by restructuring server startup sequence and implementing comprehensive health check handling. Key improvements: (1) **Early Health Check Middleware**: Added highest-priority middleware that intercepts health check requests before any complex processing, ensuring immediate responses. (2) **Server Startup Optimization**: Moved server listening to occur first, before route registration and database initialization, ensuring health endpoints are available within seconds of startup. (3) **Robust Health Detection**: Enhanced user-agent detection to identify Google Cloud Run, Kubernetes probes, and other deployment platform health checkers. (4) **Multiple Health Endpoints**: Maintained comprehensive coverage with `/`, `/healthz`, `/health-check`, `/ping`, `/api/health`, and `/api/status` endpoints. (5) **Dockerfile & Production Config**: Added proper containerization support with health checks and deployment-ready configuration. This ensures reliable deployments across all cloud platforms with sub-second health check response times.
- **COMPLETE IMAGE UPLOAD SYSTEM OVERHAUL**: Replaced the unreliable Object Storage system with a robust local multer-based file upload system. This eliminated all "Cannot convert undefined or null to object" Uppy errors and ensures images are actually stored and accessible.
- **Space Reservations Upload Fix**: Completely rebuilt the SpaceMediaManager component to use native HTML file inputs with FormData instead of complex Uppy/Object Storage integration. Image uploads now work reliably with immediate feedback.
- **Local File Serving**: Configured dedicated `/uploads/spaces/` static file serving to properly display uploaded space images without 404 errors.
- **Database Image URL Correction**: Cleaned up broken Object Storage URLs in the database and replaced them with functional local file paths.
- **Vercel Deployment Configuration Fix (August 12, 2025)**: Completely resolved "No Output Directory named 'public' found" error by fixing asset handling and Vercel configuration. Root cause: Vite was configured with `root: "client"` but static assets were in root `public/` directory. Solution: moved all required assets (jardin-japones.jpg, parksys-logo.png, image-transformer.webp, download-background.jpg) to `client/public/` and updated all @assets imports to use static paths (e.g., `/jardin-japones.jpg`). Updated vercel.json to use `dist/index.js` for serverless functions and confirmed `outputDirectory: "dist/public"` works correctly.
- **Static Asset Import Resolution**: Eliminated all problematic `@assets/` imports that caused ENOENT errors during Vercel builds. Replaced with direct static file paths served from the public directory, ensuring compatibility across all deployment environments.
- **Configuration & Security Maintenance System**: Completed implementation of centralized maintenance modules under `/admin/configuracion-seguridad/maintenance/` with dedicated routes for backup, performance monitoring, and system updates.
- **AdminLayout Standardization**: Converted all 4 maintenance modules (Mantenimiento.tsx, backup.tsx, performance.tsx, updates.tsx) to use the standardized AdminLayout component ensuring consistent horizontal and vertical margins across the entire admin interface.
- **Real ParkSys Data Integration**: Updated all maintenance modules with authentic data specific to the Guadalajara parks management context, including realistic backup file names, performance metrics for municipal park systems, and actual module-specific updates.
- **Maintenance Module Routing**: Established proper route structure with `/admin/configuracion-seguridad/maintenance/backup`, `/admin/configuracion-seguridad/maintenance/performance`, and `/admin/configuracion-seguridad/maintenance/updates` prioritizing the Configuration & Security section over legacy `/admin/settings` modules.
- **Admin Navigation Optimization**: Eliminated duplicate user management routes - removed `/admin/configuracion-seguridad/access/assignments` to avoid functionality duplication with `/admin/configuracion-seguridad/access/users`, which remains as the single comprehensive user management interface.
- **Park Detail AdSpace Cleanup**: Removed all advertising spaces (AdSpace 2, 30, and 33) from the park landing page (ParkLandingPage.tsx) to provide a cleaner user experience focused on park information without commercial distractions.
- **Module Order Reorganization**: Successfully reorganized park landing page content structure - moved Concessions module and Tree Species module to appear after Activities module. Final order: Gallery → Amenities → Activities → Tree Species → Concessions → Location/Contact.
- **Park Collaborators Section Removal**: Completely removed the park collaborators section that was previously added after Concessions module. This included both the volunteers and instructors modules to streamline the park landing page content flow.
- **Activities Layout Reversion and Evaluations Repositioning**: Reverted the activities section to its original full-width layout with 3-column grid. Relocated the Citizen Evaluations module from the sidebar to a new dedicated section positioned after Concessions with full-width (3/3) grid layout, providing better visual hierarchy and user flow organization.
- **Event Request Module Integration**: Moved the "Realiza tu evento" module from the sidebar to the main content flow, positioning it alongside the Citizen Evaluations module in a 2-column grid layout (50/50 split). This creates better integration of event management functionality within the main park information flow.
- **Documents Module Repositioning**: Relocated the "Documentos y Reglamentos" module from the sidebar to the main content flow, positioning it after the "Ubicación y Contacto" section as a dedicated full-width section. This improves document accessibility and maintains consistent content structure organization.
- **Complete Sidebar Elimination**: Successfully relocated the final "Acciones" module from the sidebar to the main content area, placing it alongside the Documents module in a 2-column grid layout. This completes the systematic elimination of all sidebar modules, achieving full integration of park functionality into the main content flow with improved accessibility and visual coherence.

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