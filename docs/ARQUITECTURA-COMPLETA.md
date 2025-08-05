# Arquitectura Completa - ParkSys Módulos Principales

## Módulo de Configuración, Usuarios y Permisos

### Esquema de Base de Datos

#### Tabla: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  municipality_id INTEGER REFERENCES municipalities(id),
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
```

#### Tabla: roles
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 0,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: permissions
```sql
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
```

#### Tabla: role_permissions
```sql
CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by INTEGER REFERENCES users(id),
  PRIMARY KEY (role_id, permission_id)
);
```

#### Tabla: user_permissions
```sql
CREATE TABLE user_permissions (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by INTEGER REFERENCES users(id),
  expires_at TIMESTAMP,
  PRIMARY KEY (user_id, permission_id)
);
```

### API Endpoints - Configuración y Usuarios

#### Autenticación
```typescript
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
POST /api/auth/change-password
```

#### Gestión de Usuarios
```typescript
GET    /api/users                    // Listar usuarios
POST   /api/users                    // Crear usuario
GET    /api/users/:id                // Obtener usuario
PUT    /api/users/:id                // Actualizar usuario
DELETE /api/users/:id                // Eliminar usuario
GET    /api/users/:id/permissions    // Permisos del usuario
POST   /api/users/:id/permissions    // Asignar permisos
DELETE /api/users/:id/permissions/:permissionId // Revocar permiso
```

#### Gestión de Roles
```typescript
GET    /api/roles                    // Listar roles
POST   /api/roles                    // Crear rol
GET    /api/roles/:id                // Obtener rol
PUT    /api/roles/:id                // Actualizar rol
DELETE /api/roles/:id                // Eliminar rol
GET    /api/roles/:id/permissions    // Permisos del rol
POST   /api/roles/:id/permissions    // Asignar permisos al rol
```

### Componentes Frontend - Configuración

#### AdminUsers.tsx
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  municipalityId: number | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

const AdminUsers = () => {
  // Gestión completa de usuarios con tabla, filtros, modales
  // Formularios de creación/edición con validación
  // Asignación de roles y permisos individuales
  // Historial de actividad y sesiones
};
```

#### RoleManagement.tsx
```typescript
interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: Permission[];
}

const RoleManagement = () => {
  // Gestión de roles del sistema
  // Matriz de permisos por módulo
  // Jerarquía de roles y herencia
  // Plantillas de roles predefinidas
};
```

---

## Módulo de Finanzas Completo

### Esquema de Base de Datos

#### Tabla: income_categories
```sql
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
```

#### Tabla: expense_categories
```sql
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
```

#### Tabla: actual_incomes
```sql
CREATE TABLE actual_incomes (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  category_id INTEGER REFERENCES income_categories(id),
  municipality_id INTEGER REFERENCES municipalities(id),
  park_id INTEGER REFERENCES parks(id),
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
```

#### Tabla: actual_expenses
```sql
CREATE TABLE actual_expenses (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  category_id INTEGER REFERENCES expense_categories(id),
  municipality_id INTEGER REFERENCES municipalities(id),
  park_id INTEGER REFERENCES parks(id),
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
```

#### Tabla: budgets
```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  year INTEGER NOT NULL,
  municipality_id INTEGER REFERENCES municipalities(id),
  park_id INTEGER REFERENCES parks(id),
  status VARCHAR(50) DEFAULT 'draft',
  total_income DECIMAL(12,2) DEFAULT 0,
  total_expense DECIMAL(12,2) DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: budget_items
```sql
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
```

#### Tabla: cash_flow_projections
```sql
CREATE TABLE cash_flow_projections (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  opening_balance DECIMAL(12,2) DEFAULT 0,
  projected_income DECIMAL(12,2) DEFAULT 0,
  actual_income DECIMAL(12,2) DEFAULT 0,
  projected_expense DECIMAL(12,2) DEFAULT 0,
  actual_expense DECIMAL(12,2) DEFAULT 0,
  closing_balance DECIMAL(12,2) DEFAULT 0,
  municipality_id INTEGER REFERENCES municipalities(id),
  park_id INTEGER REFERENCES parks(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints - Finanzas

#### Catálogos
```typescript
GET    /api/finance/income-categories      // Categorías de ingresos
POST   /api/finance/income-categories      // Crear categoría ingreso
PUT    /api/finance/income-categories/:id  // Actualizar categoría
DELETE /api/finance/income-categories/:id  // Eliminar categoría

GET    /api/finance/expense-categories     // Categorías de gastos
POST   /api/finance/expense-categories     // Crear categoría gasto
PUT    /api/finance/expense-categories/:id // Actualizar categoría
DELETE /api/finance/expense-categories/:id // Eliminar categoría
```

#### Ingresos
```typescript
GET    /api/finance/incomes               // Listar ingresos
POST   /api/finance/incomes               // Registrar ingreso
GET    /api/finance/incomes/:id           // Obtener ingreso
PUT    /api/finance/incomes/:id           // Actualizar ingreso
DELETE /api/finance/incomes/:id           // Eliminar ingreso
GET    /api/finance/incomes/summary       // Resumen de ingresos
GET    /api/finance/incomes/by-category   // Ingresos por categoría
GET    /api/finance/incomes/by-period     // Ingresos por período
```

#### Egresos
```typescript
GET    /api/finance/expenses              // Listar gastos
POST   /api/finance/expenses              // Registrar gasto
GET    /api/finance/expenses/:id          // Obtener gasto
PUT    /api/finance/expenses/:id          // Actualizar gasto
DELETE /api/finance/expenses/:id          // Eliminar gasto
POST   /api/finance/expenses/:id/approve  // Aprobar gasto
GET    /api/finance/expenses/pending      // Gastos pendientes
GET    /api/finance/expenses/summary      // Resumen de gastos
```

#### Presupuestos
```typescript
GET    /api/finance/budgets               // Listar presupuestos
POST   /api/finance/budgets               // Crear presupuesto
GET    /api/finance/budgets/:id           // Obtener presupuesto
PUT    /api/finance/budgets/:id           // Actualizar presupuesto
DELETE /api/finance/budgets/:id           // Eliminar presupuesto
POST   /api/finance/budgets/:id/approve   // Aprobar presupuesto
GET    /api/finance/budgets/:id/execution // Ejecución presupuestal
GET    /api/finance/budgets/:id/variance  // Análisis de variaciones
```

#### Flujo de Efectivo
```typescript
GET    /api/finance/cash-flow             // Flujo de efectivo
GET    /api/finance/cash-flow/projection  // Proyección de flujo
POST   /api/finance/cash-flow/projection  // Crear proyección
GET    /api/finance/cash-flow/daily       // Flujo diario
GET    /api/finance/cash-flow/monthly     // Flujo mensual
GET    /api/finance/cash-flow/annual      // Flujo anual
```

#### Reportes
```typescript
GET    /api/finance/reports/balance-sheet    // Estado de situación
GET    /api/finance/reports/income-statement // Estado de resultados
GET    /api/finance/reports/cash-flow        // Estado de flujo efectivo
GET    /api/finance/reports/budget-vs-actual // Presupuesto vs Real
GET    /api/finance/reports/financial-ratios // Ratios financieros
POST   /api/finance/reports/custom          // Reporte personalizado
GET    /api/finance/reports/export/:format  // Exportar (PDF/Excel)
```

### Componentes Frontend - Finanzas

#### FinanceDashboard.tsx
```typescript
const FinanceDashboard = () => {
  // KPIs principales: ingresos, gastos, flujo neto
  // Gráficos: tendencias, comparaciones, distribución por categorías
  // Alertas: presupuesto excedido, flujo negativo, gastos pendientes
  // Resumen ejecutivo con métricas clave
};
```

#### IncomeManager.tsx
```typescript
interface Income {
  id: number;
  description: string;
  amount: number;
  date: Date;
  category: IncomeCategory;
  paymentMethod: string;
  receiptUrl: string;
}

const IncomeManager = () => {
  // Registro de ingresos con validación
  // Filtros por fecha, categoría, monto
  // Importación masiva desde CSV/Excel
  // Integración con otros módulos
};
```

#### ExpenseManager.tsx
```typescript
interface Expense {
  id: number;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  supplier: string;
  invoiceNumber: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

const ExpenseManager = () => {
  // Registro y aprobación de gastos
  // Workflow de autorización por montos
  // Seguimiento de facturas y comprobantes
  // Control de proveedores
};
```

#### BudgetPlanner.tsx
```typescript
const BudgetPlanner = () => {
  // Creación de presupuestos anuales
  // Distribución mensual automática
  // Comparación presupuesto vs real
  // Análisis de variaciones y ajustes
  // Proyecciones y escenarios
};
```

#### CashFlowAnalyzer.tsx
```typescript
const CashFlowAnalyzer = () => {
  // Matriz de flujo de efectivo
  // Proyecciones a corto y largo plazo
  // Identificación de patrones estacionales
  // Alertas de liquidez
  // Optimización de timing de pagos
};
```

---

## Módulo de Recursos Humanos Completo

### Esquema de Base de Datos

#### Tabla: employees
```sql
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
  employment_type VARCHAR(50), -- 'full_time', 'part_time', 'contractor'
  salary DECIMAL(10,2),
  salary_type VARCHAR(20), -- 'monthly', 'hourly', 'daily'
  manager_id INTEGER REFERENCES employees(id),
  
  -- Información fiscal mexicana
  rfc VARCHAR(13),
  curp VARCHAR(18),
  nss VARCHAR(11),
  clabe VARCHAR(18),
  bank_name VARCHAR(100),
  
  -- Información adicional
  skills TEXT[],
  certifications TEXT[],
  notes TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: departments
```sql
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
```

#### Tabla: payroll_periods
```sql
CREATE TABLE payroll_periods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pay_date DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'quincenal', -- quincenal, mensual, semanal
  status VARCHAR(20) DEFAULT 'draft', -- draft, processing, approved, paid
  total_gross DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  total_net DECIMAL(12,2) DEFAULT 0,
  processed_by INTEGER REFERENCES users(id),
  processed_at TIMESTAMP,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: payroll_concepts
```sql
CREATE TABLE payroll_concepts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- 'ingreso', 'deduccion', 'prestacion'
  category VARCHAR(50), -- 'salario', 'bono', 'impuesto', 'seguro_social'
  formula TEXT,
  is_taxable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: payroll_receipts
```sql
CREATE TABLE payroll_receipts (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  period_id INTEGER REFERENCES payroll_periods(id),
  gross_salary DECIMAL(10,2) NOT NULL,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  
  -- Conceptos principales
  base_salary DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  bonuses DECIMAL(10,2) DEFAULT 0,
  commissions DECIMAL(10,2) DEFAULT 0,
  
  -- Deducciones
  imss_employee DECIMAL(10,2) DEFAULT 0,
  isr DECIMAL(10,2) DEFAULT 0,
  infonavit DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  
  -- Información fiscal
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
```

#### Tabla: payroll_receipt_concepts
```sql
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
```

#### Tabla: vacation_requests
```sql
CREATE TABLE vacation_requests (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  days_available INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  requested_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: time_entries
```sql
CREATE TABLE time_entries (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  break_duration INTEGER DEFAULT 0, -- minutos
  total_hours DECIMAL(4,2),
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  entry_type VARCHAR(20) DEFAULT 'regular', -- regular, overtime, holiday
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  notes TEXT,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, date)
);
```

#### Tabla: training_programs
```sql
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
```

#### Tabla: training_enrollments
```sql
CREATE TABLE training_enrollments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  program_id INTEGER REFERENCES training_programs(id),
  enrollment_date DATE NOT NULL,
  start_date DATE,
  completion_date DATE,
  status VARCHAR(20) DEFAULT 'enrolled', -- enrolled, in_progress, completed, cancelled
  score DECIMAL(5,2),
  certification_url TEXT,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints - Recursos Humanos

#### Gestión de Personal
```typescript
GET    /api/hr/employees                 // Listar empleados
POST   /api/hr/employees                 // Crear empleado
GET    /api/hr/employees/:id             // Obtener empleado
PUT    /api/hr/employees/:id             // Actualizar empleado
DELETE /api/hr/employees/:id             // Eliminar empleado
POST   /api/hr/employees/import          // Importar desde CSV
GET    /api/hr/employees/export          // Exportar a CSV
GET    /api/hr/employees/orgchart        // Organigrama
```

#### Departamentos
```typescript
GET    /api/hr/departments               // Listar departamentos
POST   /api/hr/departments               // Crear departamento
PUT    /api/hr/departments/:id           // Actualizar departamento
DELETE /api/hr/departments/:id           // Eliminar departamento
GET    /api/hr/departments/hierarchy     // Jerarquía completa
```

#### Nómina
```typescript
GET    /api/hr/payroll/periods           // Períodos de nómina
POST   /api/hr/payroll/periods           // Crear período
GET    /api/hr/payroll/periods/:id       // Obtener período
POST   /api/hr/payroll/periods/:id/process // Procesar nómina
POST   /api/hr/payroll/periods/:id/approve // Aprobar nómina

GET    /api/hr/payroll/concepts          // Conceptos de nómina
POST   /api/hr/payroll/concepts          // Crear concepto
PUT    /api/hr/payroll/concepts/:id      // Actualizar concepto
DELETE /api/hr/payroll/concepts/:id      // Eliminar concepto

GET    /api/hr/payroll/receipts          // Recibos de nómina
GET    /api/hr/payroll/receipts/:id      // Obtener recibo
GET    /api/hr/payroll/receipts/:id/pdf  // Generar PDF
POST   /api/hr/payroll/receipts/:id/send // Enviar por email
```

#### Vacaciones y Permisos
```typescript
GET    /api/hr/vacations                 // Solicitudes de vacaciones
POST   /api/hr/vacations                 // Crear solicitud
PUT    /api/hr/vacations/:id             // Actualizar solicitud
POST   /api/hr/vacations/:id/approve     // Aprobar solicitud
POST   /api/hr/vacations/:id/reject      // Rechazar solicitud
GET    /api/hr/vacations/calendar        // Calendario de vacaciones
GET    /api/hr/vacations/balance/:employeeId // Saldo de vacaciones
```

#### Control de Horas
```typescript
GET    /api/hr/time-entries              // Entradas de tiempo
POST   /api/hr/time-entries              // Registrar entrada
PUT    /api/hr/time-entries/:id          // Actualizar entrada
DELETE /api/hr/time-entries/:id          // Eliminar entrada
POST   /api/hr/time-entries/check-in     // Marcar entrada
POST   /api/hr/time-entries/check-out    // Marcar salida
GET    /api/hr/time-entries/summary      // Resumen de horas
GET    /api/hr/time-entries/report       // Reporte de asistencia
```

#### Capacitación
```typescript
GET    /api/hr/training/programs         // Programas de capacitación
POST   /api/hr/training/programs         // Crear programa
PUT    /api/hr/training/programs/:id     // Actualizar programa
DELETE /api/hr/training/programs/:id     // Eliminar programa

GET    /api/hr/training/enrollments      // Inscripciones
POST   /api/hr/training/enrollments      // Inscribir empleado
PUT    /api/hr/training/enrollments/:id  // Actualizar inscripción
GET    /api/hr/training/certificates     // Certificados obtenidos
```

### Componentes Frontend - Recursos Humanos

#### HRDashboard.tsx
```typescript
const HRDashboard = () => {
  // Métricas clave: empleados activos, rotación, asistencia
  // Gráficos: distribución por departamento, antigüedad, género
  // Alertas: cumpleaños, aniversarios, capacitaciones vencidas
  // Calendario: vacaciones, capacitaciones, evaluaciones
};
```

#### EmployeeDirectory.tsx
```typescript
interface Employee {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  position: string;
  hireDate: Date;
  manager: Employee | null;
  skills: string[];
  certifications: string[];
}

const EmployeeDirectory = () => {
  // Directorio completo con búsqueda y filtros
  // Tarjetas de perfil con información clave
  // Organigrama interactivo
  // Importación/exportación CSV
  // Gestión de perfiles y fotografías
};
```

#### PayrollManager.tsx
```typescript
const PayrollManager = () => {
  // Gestión completa de períodos de nómina
  // Configuración de conceptos personalizables
  // Procesamiento automático con cálculos fiscales
  // Generación de recibos PDF con logo corporativo
  // Integración con módulo de finanzas
};
```

#### VacationManager.tsx
```typescript
interface VacationRequest {
  id: number;
  employee: Employee;
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

const VacationManager = () => {
  // Solicitudes de vacaciones con workflow de aprobación
  // Calendario visual de ausencias
  // Cálculo automático de saldos de vacaciones
  // Políticas configurables por departamento
  // Historial y reportes de ausentismo
};
```

#### TimeTracking.tsx
```typescript
const TimeTracking = () => {
  // Control de entrada y salida con reloj integrado
  // Registro de horas extras y descansos
  // Reportes de asistencia por empleado/departamento
  // Integración con sistema de nómina
  // Alertas de incumplimiento de horarios
};
```

#### TrainingCenter.tsx
```typescript
const TrainingCenter = () => {
  // Catálogo de programas de capacitación
  // Inscripciones y seguimiento de progreso
  // Certificados digitales y historial académico
  // Evaluación de efectividad de entrenamientos
  // Planes de desarrollo profesional
};
```

---

## Sistema de Login y Permisos para Administradores

### Middleware de Autenticación
```typescript
// server/middleware/auth.ts
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const hasPermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    
    const hasPermission = await checkUserPermission(userId, module, action);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    
    next();
  };
};

export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Rol insuficiente' });
    }
    next();
  };
};
```

### Componente de Login
```typescript
// client/src/components/Login.tsx
const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  
  const loginMutation = useMutation({
    mutationFn: async (creds: LoginCredentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      
      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redireccionar según rol
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    }
  });
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión - ParkSys</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                placeholder="Usuario"
                value={credentials.username}
                onChange={(e) => setCredentials({
                  ...credentials,
                  username: e.target.value
                })}
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={(e) => setCredentials({
                  ...credentials,
                  password: e.target.value
                })}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Iniciando...' : 'Ingresar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Hook de Permisos
```typescript
// client/src/hooks/usePermissions.ts
export const usePermissions = () => {
  const user = useAuthStore(state => state.user);
  
  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    
    // Administradores tienen acceso total
    if (user.role === 'admin') return true;
    
    // Verificar permisos específicos del usuario
    return user.permissions?.some(p => 
      p.module === module && p.action === action
    ) || false;
  };
  
  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };
  
  const canAccessModule = (moduleName: string): boolean => {
    switch (moduleName) {
      case 'finance':
        return hasPermission('finance', 'read') || hasRole(['admin', 'finance_manager']);
      case 'hr':
        return hasPermission('hr', 'read') || hasRole(['admin', 'hr_manager']);
      case 'configuration':
        return hasRole(['admin']);
      default:
        return false;
    }
  };
  
  return {
    hasPermission,
    hasRole,
    canAccessModule,
    user
  };
};
```

### Rutas Protegidas
```typescript
// client/src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: { module: string; action: string };
  requiredRole?: string[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback = <div>Acceso denegado</div>
}) => {
  const { hasPermission, hasRole } = usePermissions();
  
  // Verificar permisos
  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(
      requiredPermission.module, 
      requiredPermission.action
    );
    if (!hasRequiredPermission) {
      return fallback;
    }
  }
  
  // Verificar roles
  if (requiredRole) {
    const hasRequiredRole = hasRole(requiredRole);
    if (!hasRequiredRole) {
      return fallback;
    }
  }
  
  return <>{children}</>;
};
```

### Configuración de Permisos por Defecto
```sql
-- Insertar roles del sistema
INSERT INTO roles (name, display_name, description, level, is_system_role) VALUES
('admin', 'Administrador', 'Acceso total al sistema', 1, true),
('finance_manager', 'Gerente Financiero', 'Gestión completa del módulo financiero', 2, true),
('hr_manager', 'Gerente de RH', 'Gestión completa del módulo de recursos humanos', 2, true),
('employee', 'Empleado', 'Acceso básico a información personal', 5, true);

-- Insertar permisos por módulo
INSERT INTO permissions (name, display_name, module, action, resource) VALUES
-- Configuración
('config.users.read', 'Ver Usuarios', 'configuration', 'read', 'users'),
('config.users.create', 'Crear Usuarios', 'configuration', 'create', 'users'),
('config.users.update', 'Actualizar Usuarios', 'configuration', 'update', 'users'),
('config.users.delete', 'Eliminar Usuarios', 'configuration', 'delete', 'users'),
('config.roles.manage', 'Gestionar Roles', 'configuration', 'manage', 'roles'),

-- Finanzas
('finance.read', 'Ver Información Financiera', 'finance', 'read', '*'),
('finance.incomes.create', 'Registrar Ingresos', 'finance', 'create', 'incomes'),
('finance.expenses.create', 'Registrar Gastos', 'finance', 'create', 'expenses'),
('finance.expenses.approve', 'Aprobar Gastos', 'finance', 'approve', 'expenses'),
('finance.budgets.manage', 'Gestionar Presupuestos', 'finance', 'manage', 'budgets'),
('finance.reports.view', 'Ver Reportes Financieros', 'finance', 'view', 'reports'),

-- Recursos Humanos
('hr.read', 'Ver Información de RH', 'hr', 'read', '*'),
('hr.employees.manage', 'Gestionar Empleados', 'hr', 'manage', 'employees'),
('hr.payroll.process', 'Procesar Nómina', 'hr', 'process', 'payroll'),
('hr.payroll.approve', 'Aprobar Nómina', 'hr', 'approve', 'payroll'),
('hr.vacations.approve', 'Aprobar Vacaciones', 'hr', 'approve', 'vacations'),
('hr.training.manage', 'Gestionar Capacitación', 'hr', 'manage', 'training');

-- Asignar permisos a roles
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin'; -- Admin tiene todos los permisos

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'finance_manager' AND p.module = 'finance';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'hr_manager' AND p.module = 'hr';
```

Esta arquitectura completa proporciona:

✅ **Sistema de usuarios y permisos granular**
✅ **Módulo financiero integral con todos los componentes**
✅ **Sistema de RH completo con nómina mexicana**
✅ **Autenticación y autorización robusta**
✅ **APIs RESTful bien estructuradas**
✅ **Componentes frontend modulares y reutilizables**
✅ **Base de datos normalizada y escalable**
✅ **Integración entre módulos**
✅ **Reportes y análisis avanzados**

El sistema está diseñado para ser modular, escalable y fácil de mantener, siguiendo las mejores prácticas de desarrollo enterprise.