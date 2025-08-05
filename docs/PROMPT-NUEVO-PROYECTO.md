# 🚀 Prompt para Crear Sistema de Gestión Empresarial Completo

## Contexto del Proyecto
Crear una aplicación web completa de gestión empresarial con arquitectura modular, que incluya tres módulos principales: **Configuración/Usuarios**, **Finanzas** y **Recursos Humanos**. La aplicación debe ser profesional, escalable y lista para producción.

## Stack Tecnológico Requerido
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL + Drizzle ORM
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **Autenticación**: JWT + bcrypt
- **Estado**: React Query (TanStack Query)
- **Formularios**: React Hook Form + Zod
- **Routing**: Wouter
- **Archivos**: Multer para uploads

## Arquitectura del Sistema

### 1. MÓDULO DE CONFIGURACIÓN Y USUARIOS

#### Base de Datos
```sql
-- Usuarios principales
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  municipality_id INTEGER,
  phone VARCHAR(20),
  profile_image_url TEXT,
  bio TEXT,
  gender VARCHAR(20),
  birth_date DATE,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sistema de roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 0,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permisos granulares
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Relaciones de permisos
CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by INTEGER REFERENCES users(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_permissions (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by INTEGER REFERENCES users(id),
  expires_at TIMESTAMP,
  PRIMARY KEY (user_id, permission_id)
);
```

#### API Endpoints Configuración
```typescript
// Autenticación
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password

// Usuarios
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/:id/permissions
POST   /api/users/:id/permissions

// Roles y Permisos
GET    /api/roles
POST   /api/roles
PUT    /api/roles/:id
DELETE /api/roles/:id
GET    /api/permissions
```

### 2. MÓDULO DE FINANZAS COMPLETO

#### Base de Datos Financiera
```sql
-- Categorías de ingresos
CREATE TABLE income_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES income_categories(id),
  color VARCHAR(7) DEFAULT '#00a587',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categorías de gastos
CREATE TABLE expense_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES expense_categories(id),
  color VARCHAR(7) DEFAULT '#dc2626',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ingresos reales
CREATE TABLE actual_incomes (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  category_id INTEGER REFERENCES income_categories(id),
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  notes TEXT,
  receipt_url TEXT,
  source_module VARCHAR(50),
  source_id INTEGER,
  integration_data JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gastos reales
CREATE TABLE actual_expenses (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  category_id INTEGER REFERENCES expense_categories(id),
  supplier VARCHAR(255),
  invoice_number VARCHAR(100),
  payment_method VARCHAR(50),
  notes TEXT,
  receipt_url TEXT,
  source_module VARCHAR(50),
  source_id INTEGER,
  integration_data JSONB,
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Presupuestos
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  year INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_income DECIMAL(12,2) DEFAULT 0,
  total_expense DECIMAL(12,2) DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Elementos del presupuesto
CREATE TABLE budget_items (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
  category_id INTEGER,
  description VARCHAR(255) NOT NULL,
  budgeted_amount DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  month_1 DECIMAL(12,2) DEFAULT 0,
  month_2 DECIMAL(12,2) DEFAULT 0,
  month_3 DECIMAL(12,2) DEFAULT 0,
  month_4 DECIMAL(12,2) DEFAULT 0,
  month_5 DECIMAL(12,2) DEFAULT 0,
  month_6 DECIMAL(12,2) DEFAULT 0,
  month_7 DECIMAL(12,2) DEFAULT 0,
  month_8 DECIMAL(12,2) DEFAULT 0,
  month_9 DECIMAL(12,2) DEFAULT 0,
  month_10 DECIMAL(12,2) DEFAULT 0,
  month_11 DECIMAL(12,2) DEFAULT 0,
  month_12 DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Flujo de efectivo
CREATE TABLE cash_flow_projections (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  opening_balance DECIMAL(12,2) DEFAULT 0,
  projected_income DECIMAL(12,2) DEFAULT 0,
  actual_income DECIMAL(12,2) DEFAULT 0,
  projected_expense DECIMAL(12,2) DEFAULT 0,
  actual_expense DECIMAL(12,2) DEFAULT 0,
  closing_balance DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### API Endpoints Finanzas
```typescript
// Catálogos
GET/POST/PUT/DELETE /api/finance/income-categories
GET/POST/PUT/DELETE /api/finance/expense-categories

// Transacciones
GET/POST/PUT/DELETE /api/finance/incomes
GET/POST/PUT/DELETE /api/finance/expenses
POST /api/finance/expenses/:id/approve

// Presupuestos
GET/POST/PUT/DELETE /api/finance/budgets
POST /api/finance/budgets/:id/approve
GET /api/finance/budgets/:id/execution
GET /api/finance/budgets/:id/variance

// Flujo de efectivo
GET /api/finance/cash-flow
GET /api/finance/cash-flow/projection
GET /api/finance/cash-flow/daily
GET /api/finance/cash-flow/monthly

// Reportes
GET /api/finance/reports/balance-sheet
GET /api/finance/reports/income-statement
GET /api/finance/reports/cash-flow
GET /api/finance/reports/budget-vs-actual
```

### 3. MÓDULO DE RECURSOS HUMANOS

#### Base de Datos RH
```sql
-- Empleados
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  employee_number VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  address TEXT,
  
  -- Información laboral
  hire_date DATE NOT NULL,
  termination_date DATE,
  department_id INTEGER REFERENCES departments(id),
  position VARCHAR(100),
  employment_type VARCHAR(50),
  salary DECIMAL(10,2),
  salary_type VARCHAR(20),
  manager_id INTEGER REFERENCES employees(id),
  
  -- Información fiscal mexicana
  rfc VARCHAR(13),
  curp VARCHAR(18),
  nss VARCHAR(11),
  clabe VARCHAR(18),
  bank_name VARCHAR(100),
  
  skills TEXT[],
  certifications TEXT[],
  notes TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Departamentos
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  hierarchy_level INTEGER DEFAULT 5,
  parent_department_id INTEGER REFERENCES departments(id),
  manager_id INTEGER REFERENCES employees(id),
  budget DECIMAL(12,2),
  color_code VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Períodos de nómina
CREATE TABLE payroll_periods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pay_date DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'quincenal',
  status VARCHAR(20) DEFAULT 'draft',
  total_gross DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  total_net DECIMAL(12,2) DEFAULT 0,
  processed_by INTEGER REFERENCES users(id),
  processed_at TIMESTAMP,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conceptos de nómina
CREATE TABLE payroll_concepts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- 'ingreso', 'deduccion', 'prestacion'
  category VARCHAR(50),
  formula TEXT,
  is_taxable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recibos de nómina
CREATE TABLE payroll_receipts (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  period_id INTEGER REFERENCES payroll_periods(id),
  gross_salary DECIMAL(10,2) NOT NULL,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  
  base_salary DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  bonuses DECIMAL(10,2) DEFAULT 0,
  commissions DECIMAL(10,2) DEFAULT 0,
  
  imss_employee DECIMAL(10,2) DEFAULT 0,
  isr DECIMAL(10,2) DEFAULT 0,
  infonavit DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  
  isr_base DECIMAL(10,2) DEFAULT 0,
  subsidy_applied DECIMAL(10,2) DEFAULT 0,
  
  worked_days INTEGER DEFAULT 0,
  sick_days INTEGER DEFAULT 0,
  vacation_days INTEGER DEFAULT 0,
  
  receipt_number VARCHAR(50) UNIQUE,
  pdf_url TEXT,
  xml_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, period_id)
);

-- Conceptos por recibo
CREATE TABLE payroll_receipt_concepts (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER REFERENCES payroll_receipts(id) ON DELETE CASCADE,
  concept_id INTEGER REFERENCES payroll_concepts(id),
  amount DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(8,2) DEFAULT 1,
  rate DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Solicitudes de vacaciones
CREATE TABLE vacation_requests (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  days_available INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  requested_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Control de horas
CREATE TABLE time_entries (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  break_duration INTEGER DEFAULT 0,
  total_hours DECIMAL(4,2),
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  entry_type VARCHAR(20) DEFAULT 'regular',
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, date)
);

-- Programas de capacitación
CREATE TABLE training_programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(255),
  duration_hours INTEGER,
  cost DECIMAL(10,2),
  max_participants INTEGER,
  category VARCHAR(100),
  required_for_positions TEXT[],
  certification_provided BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inscripciones a capacitación
CREATE TABLE training_enrollments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  program_id INTEGER REFERENCES training_programs(id),
  enrollment_date DATE NOT NULL,
  start_date DATE,
  completion_date DATE,
  status VARCHAR(20) DEFAULT 'enrolled',
  score DECIMAL(5,2),
  certification_url TEXT,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### API Endpoints RH
```typescript
// Personal
GET/POST/PUT/DELETE /api/hr/employees
POST /api/hr/employees/import
GET /api/hr/employees/export
GET /api/hr/employees/orgchart

// Departamentos
GET/POST/PUT/DELETE /api/hr/departments
GET /api/hr/departments/hierarchy

// Nómina
GET/POST /api/hr/payroll/periods
POST /api/hr/payroll/periods/:id/process
POST /api/hr/payroll/periods/:id/approve
GET/POST/PUT/DELETE /api/hr/payroll/concepts
GET /api/hr/payroll/receipts
GET /api/hr/payroll/receipts/:id/pdf

// Vacaciones
GET/POST/PUT /api/hr/vacations
POST /api/hr/vacations/:id/approve
POST /api/hr/vacations/:id/reject
GET /api/hr/vacations/calendar

// Control de horas
GET/POST/PUT/DELETE /api/hr/time-entries
POST /api/hr/time-entries/check-in
POST /api/hr/time-entries/check-out
GET /api/hr/time-entries/summary

// Capacitación
GET/POST/PUT/DELETE /api/hr/training/programs
GET/POST/PUT /api/hr/training/enrollments
GET /api/hr/training/certificates
```

## Frontend - Componentes Principales

### 1. Sistema de Autenticación
```typescript
// Login.tsx - Pantalla de login profesional
const Login = () => {
  // Formulario con validación
  // Manejo de errores
  // Redirección por roles
  // Diseño responsive
};

// ProtectedRoute.tsx - Rutas protegidas
const ProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
  // Verificación de permisos
  // Manejo de acceso denegado
  // Integración con sistema de roles
};
```

### 2. Dashboard Principal
```typescript
// AdminDashboard.tsx - Panel de control principal
const AdminDashboard = () => {
  // KPIs principales de todos los módulos
  // Gráficos y métricas
  // Accesos rápidos a funciones principales
  // Notificaciones y alertas
};
```

### 3. Módulo de Configuración
```typescript
// AdminUsers.tsx - Gestión de usuarios
const AdminUsers = () => {
  // CRUD completo de usuarios
  // Asignación de roles y permisos
  // Búsqueda y filtros avanzados
  // Importación/exportación
};

// RoleManagement.tsx - Gestión de roles
const RoleManagement = () => {
  // Matriz de permisos
  // Jerarquía de roles
  // Plantillas predefinidas
};
```

### 4. Módulo de Finanzas
```typescript
// FinanceDashboard.tsx - Dashboard financiero
const FinanceDashboard = () => {
  // KPIs financieros
  // Gráficos de tendencias
  // Alertas de presupuesto
  // Estado de flujo de efectivo
};

// IncomeManager.tsx - Gestión de ingresos
const IncomeManager = () => {
  // Registro de ingresos
  // Categorización automática
  // Comprobantes y documentos
  // Reportes por período
};

// ExpenseManager.tsx - Gestión de gastos
const ExpenseManager = () => {
  // Registro y aprobación de gastos
  // Workflow de autorización
  // Control de proveedores
  // Seguimiento de facturas
};

// BudgetPlanner.tsx - Planificación presupuestal
const BudgetPlanner = () => {
  // Creación de presupuestos
  // Distribución mensual
  // Análisis de variaciones
  // Proyecciones
};

// CashFlowAnalyzer.tsx - Análisis de flujo
const CashFlowAnalyzer = () => {
  // Matriz de flujo de efectivo
  // Proyecciones automáticas
  // Identificación de patrones
  // Optimización de liquidez
};
```

### 5. Módulo de RH
```typescript
// HRDashboard.tsx - Dashboard de RH
const HRDashboard = () => {
  // Métricas de personal
  // Indicadores de rotación
  // Calendario de eventos
  // Alertas de cumpleaños/aniversarios
};

// EmployeeDirectory.tsx - Directorio de empleados
const EmployeeDirectory = () => {
  // Directorio completo con búsqueda
  // Organigrama interactivo
  // Perfiles detallados
  // Importación CSV
  // Gestión de fotografías
};

// PayrollManager.tsx - Gestión de nómina
const PayrollManager = () => {
  // Períodos de nómina
  // Conceptos personalizables
  // Procesamiento automático
  // Cálculos fiscales mexicanos
  // Generación de recibos PDF
  // Integración con finanzas
};

// VacationManager.tsx - Gestión de vacaciones
const VacationManager = () => {
  // Solicitudes con workflow
  // Calendario de ausencias
  // Cálculo de saldos
  // Políticas por departamento
  // Reportes de ausentismo
};

// TimeTracking.tsx - Control de horas
const TimeTracking = () => {
  // Reloj de entrada/salida
  // Registro de horas extras
  // Reportes de asistencia
  // Integración con nómina
  // Alertas de incumplimiento
};

// TrainingCenter.tsx - Centro de capacitación
const TrainingCenter = () => {
  // Catálogo de programas
  // Inscripciones y seguimiento
  // Certificados digitales
  // Evaluación de efectividad
  // Planes de desarrollo
};
```

## Middleware de Seguridad

```typescript
// Autenticación JWT
export const isAuthenticated = (req, res, next) => {
  // Verificación de token
  // Validación de usuario activo
  // Renovación automática
};

// Control de permisos
export const hasPermission = (module, action) => {
  // Verificación granular de permisos
  // Cache de permisos
  // Logging de accesos
};

// Control de roles
export const hasRole = (roles) => {
  // Verificación de jerarquía
  // Roles múltiples
  // Herencia de permisos
};
```

## Configuración de Proyecto

### package.json
```json
{
  "name": "sistema-gestion-empresarial",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "server": "tsx server/index.ts",
    "build": "vite build",
    "start": "node dist/server.js",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "@tanstack/react-query": "^5.0.0",
    "@radix-ui/react-*": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "express": "^4.18.0",
    "drizzle-orm": "^0.29.0",
    "drizzle-zod": "^0.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.22.0",
    "wouter": "^3.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

### Variables de Entorno
```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/empresa_db

# Servidor
PORT=3001
NODE_ENV=development

# Autenticación
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=24h

# Configuración empresarial
COMPANY_NAME="Mi Empresa"
COMPANY_RFC="XAXX010101000"
TIMEZONE="America/Mexico_City"
CURRENCY="MXN"

# Upload de archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@empresa.com
SMTP_PASS=tu_password
```

## Estructura de Archivos
```
proyecto/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Componentes shadcn/ui
│   │   │   ├── auth/         # Componentes de autenticación
│   │   │   ├── finance/      # Componentes de finanzas
│   │   │   └── hr/           # Componentes de RH
│   │   ├── pages/
│   │   │   ├── admin/        # Páginas de administración
│   │   │   ├── finance/      # Páginas de finanzas
│   │   │   └── hr/           # Páginas de RH
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilidades y configuración
│   │   └── App.tsx
├── server/
│   ├── api/
│   │   ├── auth/             # Rutas de autenticación
│   │   ├── users/            # Rutas de usuarios
│   │   ├── finance/          # Rutas de finanzas
│   │   └── hr/               # Rutas de RH
│   ├── middleware/           # Middleware de seguridad
│   ├── utils/                # Utilidades del servidor
│   ├── db.ts                 # Configuración de BD
│   └── index.ts              # Servidor principal
├── shared/
│   └── schema.ts             # Esquemas de Drizzle
├── uploads/                  # Archivos subidos
├── docs/                     # Documentación
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Características Específicas Requeridas

### 🔐 Sistema de Autenticación Robusto
- Login seguro con JWT
- Permisos granulares por módulo y acción
- Roles jerárquicos con herencia
- Sesiones con renovación automática
- Audit trail de accesos

### 💰 Módulo Financiero Completo
- Catálogos de ingresos y gastos personalizables
- Registro de transacciones con comprobantes
- Sistema de aprobaciones por monto
- Presupuestos anuales con seguimiento mensual
- Flujo de efectivo con proyecciones automáticas
- Reportes financieros profesionales (Balance, P&L, Cash Flow)
- Dashboard con KPIs en tiempo real
- Integración con otros módulos

### 👥 Sistema de RH Integral
- Directorio completo de empleados con organigrama
- Gestión de departamentos con jerarquías
- Sistema de nómina con cálculos fiscales mexicanos (IMSS, ISR, INFONAVIT)
- Recibos de nómina en PDF con logo corporativo
- Conceptos de nómina personalizables
- Gestión de vacaciones con workflow de aprobación
- Control de horas con entrada/salida
- Centro de capacitación con certificados
- Reportes de RH y métricas de personal
- Importación/exportación CSV
- Integración automática con módulo de finanzas

### 🎨 Diseño Profesional
- Interfaz moderna con Radix UI y Tailwind CSS
- Diseño responsive para móvil, tablet y desktop
- Tema consistente con paleta de colores corporativa
- Componentes reutilizables y modulares
- Animaciones suaves y micro-interacciones
- Iconografía coherente con Lucide React

### 📊 Reportes y Analytics
- Dashboard ejecutivo con métricas clave
- Gráficos interactivos con Recharts
- Exportación a PDF y Excel
- Reportes programados
- Filtros avanzados y búsquedas
- Análisis de tendencias

### 🔧 Funcionalidades Avanzadas
- Sistema modular y escalable
- Integraciones entre módulos
- Audit trail completo
- Backup automático
- Notificaciones en tiempo real
- API REST bien documentada
- Validación robusta con Zod
- Manejo de errores profesional
- Logging detallado
- Performance optimizado

## Instrucciones de Implementación

1. **Configurar base de datos PostgreSQL** con todas las tablas del esquema
2. **Crear la estructura de archivos** siguiendo la organización modular
3. **Implementar el sistema de autenticación** como base fundamental
4. **Desarrollar cada módulo incrementalmente** comenzando por configuración
5. **Integrar los módulos** con flujos de datos automáticos
6. **Aplicar el diseño visual** con componentes consistentes
7. **Implementar reportes y dashboards** con métricas relevantes
8. **Agregar validaciones y manejo de errores** robusto
9. **Optimizar performance** y experiencia de usuario
10. **Documentar el sistema** para mantenimiento futuro

## Casos de Uso Principales

### Para Administradores
- Gestión completa de usuarios y permisos
- Configuración de catálogos y parámetros
- Supervisión de todas las operaciones
- Reportes ejecutivos consolidados

### Para Gerencia Financiera
- Control total del módulo financiero
- Aprobación de gastos y presupuestos
- Análisis de rentabilidad y cash flow
- Reportes para toma de decisiones

### Para Recursos Humanos
- Gestión integral de personal
- Procesamiento de nómina
- Control de vacaciones y asistencia
- Administración de capacitación

### Para Empleados
- Acceso a información personal
- Solicitud de vacaciones
- Consulta de recibos de nómina
- Registro de horas trabajadas

El sistema debe ser **profesional, escalable, seguro y fácil de usar**, con arquitectura modular que permita crecimiento futuro y adaptación a diferentes tipos de empresa.

---

## ✅ Checklist de Completitud

- [ ] Sistema de autenticación completo
- [ ] Módulo de configuración y usuarios
- [ ] Módulo financiero integral
- [ ] Módulo de recursos humanos
- [ ] Permisos granulares por función
- [ ] Diseño responsive y profesional
- [ ] Integración entre módulos
- [ ] Reportes y dashboards
- [ ] API REST documentada
- [ ] Validaciones robustas
- [ ] Manejo de errores
- [ ] Base de datos optimizada
- [ ] Documentación completa

**Este prompt está diseñado para crear un sistema empresarial completo y profesional listo para producción.**