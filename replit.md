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

## Recent Changes (August 1, 2025)
- **COMPLETED: Database Structure Optimization**:
  - **Sponsors Table Reset**: All sponsor records cleared and ID sequence restarted from 1 for clean manual data entry
  - **Package ID Reordering**: Restructured sponsorship packages with consecutive IDs (1-10) ordered by price ascending:
    - ID 1: Amigo Colomo ($7,000) - Lowest price
    - ID 10: Amigo Halcón ($2,000,000) - Highest price
  - **Data Integrity**: All related cascade operations handled properly, maintaining referential integrity
- **COMPLETED: Sponsor Management Form Validation and Date Format Issues**:
  - **Fixed Critical Form Submission Bug**: Resolved date format mismatch (ISO vs yyyy-MM-dd) preventing sponsor updates
  - **Enhanced Backend Validation**: Improved schema validation to handle both string and number types automatically
  - **Date Format Standardization**: All date inputs now properly format to yyyy-MM-dd for HTML compatibility
  - **Error Handling**: Added comprehensive logging and validation error reporting in backend
  - **Type Safety**: Corrected TypeScript type annotations throughout sponsor management components
- **COMPLETED: Activity Registration Management System with Email Automation**:
  - **Admin Interface**: Comprehensive management dashboard with filters (status, activity, search), pagination (10 items per page), grid/table view toggle
  - **Registration Details**: Complete modal views showing participant information, activity details, and action buttons for approval/rejection
  - **Automated Email System**: Two-stage email workflow using Gmail integration:
    - **Registration Confirmation**: Automatic email sent immediately upon public registration with activity details and approval status
    - **Approval Confirmation**: Professional email sent when admin approves registration with instructions and event details
  - **Real-time Statistics**: Dynamic display of available slots, current registrations, and pending approvals on activity detail pages
  - **Database Integration**: Full CRUD operations with proper validation and error handling
- **Email Integration**: Successfully adapted to use existing Gmail configuration instead of SendGrid:
  - Professional HTML email templates with responsive design
  - Proper error handling and logging for email delivery
  - Integration with existing `emailService` from server/email/emailService.ts
- **Previous: 10-Tier Gemstone & Precious Metal Sponsor System**: Completely redesigned sponsorship categories:
  - **Replaced 4-tier system** (Bronce, Plata, Oro, Platino) with **10-tier gemstone/precious metal system**
  - **New Tiers**: Amatista ($25k), Esmeralda ($50k), Zafiro ($75k), Ónix ($125k), Cobre ($200k), Bronce ($300k), Plata ($450k), Oro ($650k), Platino ($900k), Diamante ($1.2M)
  - **Each tier includes**: Unique gemstone/metal emoji icon, tier-specific color scheme, graduated benefits package, descriptive status titles
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