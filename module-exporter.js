#!/usr/bin/env node

/**
 * EXPORTADOR AUTOMÁTICO DE MÓDULOS - ParkSys
 * ===========================================
 * 
 * Script para extraer módulos completos del sistema y crear paquetes
 * independientes listos para usar en nuevas aplicaciones.
 * 
 * Uso: node module-exporter.js [modulo] [opciones]
 * 
 * Módulos disponibles:
 * - finanzas: Sistema completo de gestión financiera
 * - hr: Recursos humanos con nómina mexicana
 * - eventos: Gestión de eventos y participantes
 * - voluntarios: Sistema de voluntariado
 * - activos: Gestión de activos y mantenimiento
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ModuleExporter {
  constructor() {
    this.baseDir = process.cwd();
    this.exportDir = path.join(this.baseDir, 'exports');
    
    // Asegurar que el directorio de exportación existe
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  async exportModule(moduleName, options = {}) {
    console.log(`Iniciando exportación del módulo: ${moduleName}`);
    
    const moduleConfig = this.getModuleConfig(moduleName);
    if (!moduleConfig) {
      throw new Error(`Módulo "${moduleName}" no encontrado. Disponibles: finanzas, hr, eventos`);
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const exportPath = path.join(this.exportDir, `${moduleName}-export-${timestamp}`);

    // Crear estructura de directorios
    this.createDirectoryStructure(exportPath);

    // Generar archivos del módulo
    await this.generatePackageJson(exportPath, moduleConfig);
    await this.generateReadme(exportPath, moduleConfig);
    await this.generateSchema(exportPath, moduleConfig);
    await this.generateRoutes(exportPath, moduleConfig);
    await this.generateComponents(exportPath, moduleConfig);
    await this.generateConfig(exportPath, moduleConfig);

    if (options.includeData) {
      await this.generateSampleData(exportPath, moduleName);
    }

    console.log(`Módulo "${moduleName}" exportado exitosamente en: ${exportPath}`);
    return exportPath;
  }

  getModuleConfig(moduleName) {
    const configs = {
      finanzas: {
        name: 'Sistema de Finanzas',
        description: 'Módulo completo de gestión financiera municipal',
        version: '2.1.0',
        tables: ['income_categories', 'expense_categories', 'actual_incomes', 'actual_expenses', 'budgets'],
        pages: ['dashboard', 'incomes', 'expenses', 'budget', 'reports']
      },
      hr: {
        name: 'Recursos Humanos',
        description: 'Sistema completo de RH con nómina mexicana',
        version: '1.5.0',
        tables: ['employees', 'payroll_periods', 'vacation_balances', 'time_records'],
        pages: ['employees', 'payroll', 'vacations', 'timesheets']
      },
      eventos: {
        name: 'Gestión de Eventos',
        description: 'Sistema completo para organización de eventos',
        version: '1.0.0',
        tables: ['events', 'event_participants', 'event_resources'],
        pages: ['events', 'participants', 'calendar', 'resources']
      }
    };

    return configs[moduleName];
  }

  createDirectoryStructure(exportPath) {
    const dirs = [
      'src/pages',
      'src/components',
      'src/lib',
      'shared',
      'server',
      'docs',
      'public'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(exportPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async generatePackageJson(exportPath, moduleConfig) {
    const packageJson = {
      name: `parksys-${moduleConfig.name.toLowerCase().replace(/\s+/g, '-')}`,
      version: moduleConfig.version,
      description: moduleConfig.description,
      type: "module",
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "server": "tsx server/index.ts",
        "db:push": "drizzle-kit push",
        "db:studio": "drizzle-kit studio"
      },
      dependencies: {
        "@tanstack/react-query": "^5.0.0",
        "drizzle-orm": "^0.29.0",
        "@neondatabase/serverless": "^0.9.0",
        "express": "^4.18.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "wouter": "^3.0.0",
        "lucide-react": "^0.300.0",
        "@radix-ui/react-select": "^2.0.0",
        "@radix-ui/react-dialog": "^1.0.5",
        "@radix-ui/react-accordion": "^1.1.2",
        "tailwindcss": "^3.3.0"
      },
      devDependencies: {
        "@types/express": "^4.17.0",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "typescript": "^5.0.0",
        "vite": "^5.0.0",
        "@vitejs/plugin-react": "^4.0.0",
        "tsx": "^4.0.0",
        "drizzle-kit": "^0.20.0"
      }
    };

    fs.writeFileSync(
      path.join(exportPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  async generateReadme(exportPath, moduleConfig) {
    const readme = `# ${moduleConfig.name}

${moduleConfig.description}

## Características

- ✅ Frontend React con TypeScript
- ✅ Backend Express con APIs REST
- ✅ Base de datos PostgreSQL con Drizzle ORM
- ✅ Componentes UI con Radix y Tailwind
- ✅ Gestión de estado con React Query
- ✅ Validación con Zod

## Instalación Rápida

\`\`\`bash
# Instalar dependencias
npm install

# Configurar base de datos
cp .env.example .env
# Editar DATABASE_URL en .env

# Crear tablas
npm run db:push

# Iniciar desarrollo
npm run dev
\`\`\`

## Estructura del Proyecto

\`\`\`
├── src/
│   ├── pages/          # Páginas React
│   ├── components/     # Componentes reutilizables
│   └── lib/           # Utilidades
├── server/            # API del servidor
├── shared/            # Esquemas compartidos
└── docs/             # Documentación
\`\`\`

## Páginas Incluidas

${moduleConfig.pages.map(page => `- **${page.charAt(0).toUpperCase() + page.slice(1)}**: Gestión de ${page}`).join('\n')}

## Base de Datos

Tablas incluidas:
${moduleConfig.tables.map(table => `- \`${table}\``).join('\n')}

## API Endpoints

Todos los endpoints siguen el patrón REST estándar:
- \`GET /api/[recurso]\` - Listar
- \`POST /api/[recurso]\` - Crear
- \`PUT /api/[recurso]/:id\` - Actualizar
- \`DELETE /api/[recurso]/:id\` - Eliminar

## Desarrollo

\`\`\`bash
# Servidor de desarrollo (frontend)
npm run dev

# Servidor backend
npm run server

# Base de datos
npm run db:studio
\`\`\`

## Personalización

1. **Colores**: Editar \`tailwind.config.js\`
2. **Logo**: Reemplazar archivos en \`public/\`
3. **Textos**: Modificar componentes en \`src/pages/\`
4. **API**: Agregar rutas en \`server/routes.ts\`

## Despliegue

El módulo está listo para desplegarse en:
- Vercel (frontend)
- Railway/Heroku (backend)
- Neon/Supabase (base de datos)

## Soporte

Para documentación completa y soporte, visita el repositorio principal de ParkSys.
`;

    fs.writeFileSync(path.join(exportPath, 'README.md'), readme);
  }

  async generateSchema(exportPath, moduleConfig) {
    let schema = `import { pgTable, text, varchar, decimal, integer, timestamp, boolean, date, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

`;

    if (moduleConfig.name.includes('Finanzas')) {
      schema += `
// Categorías de ingresos
export const incomeCategories = pgTable("income_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categorías de egresos
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ingresos reales
export const actualIncomes = pgTable("actual_incomes", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => incomeCategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Egresos reales
export const actualExpenses = pgTable("actual_expenses", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  supplier: varchar("supplier", { length: 200 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tipos Zod
export const insertIncomeCategorySchema = createInsertSchema(incomeCategories);
export const insertActualIncomeSchema = createInsertSchema(actualIncomes);
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories);
export const insertActualExpenseSchema = createInsertSchema(actualExpenses);

export type IncomeCategory = typeof incomeCategories.$inferSelect;
export type InsertIncomeCategory = typeof incomeCategories.$inferInsert;
export type ActualIncome = typeof actualIncomes.$inferSelect;
export type InsertActualIncome = typeof actualIncomes.$inferInsert;
`;
    }

    if (moduleConfig.name.includes('Recursos Humanos')) {
      schema += `
// Empleados
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  hireDate: date("hire_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Períodos de nómina
export const payrollPeriods = pgTable("payroll_periods", {
  id: serial("id").primaryKey(),
  period: varchar("period", { length: 50 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }),
  employeesCount: integer("employees_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Balance de vacaciones
export const vacationBalances = pgTable("vacation_balances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  year: integer("year").notNull(),
  totalDays: decimal("total_days", { precision: 5, scale: 2 }).default("0"),
  usedDays: decimal("used_days", { precision: 5, scale: 2 }).default("0"),
  remainingDays: decimal("remaining_days", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tipos Zod
export const insertEmployeeSchema = createInsertSchema(employees);
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;
`;
    }

    fs.writeFileSync(path.join(exportPath, 'shared/schema.ts'), schema);
  }

  async generateRoutes(exportPath, moduleConfig) {
    const routes = `import { Router, Request, Response } from "express";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import * as schema from "../shared/schema";

export function registerRoutes(router: Router) {
  console.log("Registrando rutas del módulo ${moduleConfig.name}...");

  // Health check
  router.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", module: "${moduleConfig.name}" });
  });

  // Dashboard endpoint
  router.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      // Implementar lógica específica del módulo
      res.json({ message: "Dashboard data" });
    } catch (error) {
      console.error("Error en dashboard:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // CRUD genérico para las entidades principales
  ${moduleConfig.tables.map(table => `
  // Rutas para ${table}
  router.get("/api/${table.replace(/_/g, '-')}", async (req: Request, res: Response) => {
    try {
      const results = await db.select().from(schema.${toCamelCase(table)});
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener ${table}" });
    }
  });

  router.post("/api/${table.replace(/_/g, '-')}", async (req: Request, res: Response) => {
    try {
      const [result] = await db.insert(schema.${toCamelCase(table)}).values(req.body).returning();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al crear ${table}" });
    }
  });`).join('')}
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}
`;

    fs.writeFileSync(path.join(exportPath, 'server/routes.ts'), routes);

    // Generar servidor principal
    const serverIndex = `import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const router = express.Router();
registerRoutes(router);
app.use(router);

app.listen(PORT, () => {
  console.log(\`🚀 Servidor ${moduleConfig.name} ejecutándose en puerto \${PORT}\`);
});
`;

    fs.writeFileSync(path.join(exportPath, 'server/index.ts'), serverIndex);

    // Generar configuración de base de datos
    const dbConfig = `import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL debe estar configurada");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
`;

    fs.writeFileSync(path.join(exportPath, 'server/db.ts'), dbConfig);
  }

  async generateComponents(exportPath, moduleConfig) {
    // Generar App.tsx principal
    const appComponent = `import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";

// Páginas del módulo
${moduleConfig.pages.map(page => 
  `const ${page.charAt(0).toUpperCase() + page.slice(1)}Page = React.lazy(() => import('./pages/${page}'));`
).join('\n')}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">${moduleConfig.name}</h1>
        </nav>
        
        <main className="container mx-auto p-6">
          <Switch>
            <Route path="/">
              <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
                <${moduleConfig.pages[0].charAt(0).toUpperCase() + moduleConfig.pages[0].slice(1)}Page />
              </Suspense>
            </Route>
            
            ${moduleConfig.pages.map(page => `
            <Route path="/${page}">
              <Suspense fallback={<div className="text-center py-8">Cargando ${page}...</div>}>
                <${page.charAt(0).toUpperCase() + page.slice(1)}Page />
              </Suspense>
            </Route>`).join('')}
            
            <Route>
              <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-4">Página no encontrada</h2>
                <p>La página que buscas no existe.</p>
              </div>
            </Route>
          </Switch>
        </main>
        
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
`;

    fs.writeFileSync(path.join(exportPath, 'src/App.tsx'), appComponent);

    // Generar página ejemplo
    const samplePage = `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function ${moduleConfig.pages[0].charAt(0).toUpperCase() + moduleConfig.pages[0].slice(1)}Page() {
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/${moduleConfig.tables[0].replace(/_/g, '-')}'],
  });

  const createMutation = useMutation({
    mutationFn: async (newData) => {
      const response = await fetch('/api/${moduleConfig.tables[0].replace(/_/g, '-')}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/${moduleConfig.tables[0].replace(/_/g, '-')}'] });
      setFormData({});
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">${moduleConfig.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Bienvenido al módulo ${moduleConfig.name}. 
            Esta es una página de ejemplo que puedes personalizar según tus necesidades.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Funcionalidades</h3>
              <p className="text-sm text-blue-700">
                ${moduleConfig.pages.length} páginas incluidas
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Base de Datos</h3>
              <p className="text-sm text-green-700">
                ${moduleConfig.tables.length} tablas configuradas
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Estado</h3>
              <p className="text-sm text-purple-700">
                Listo para personalizar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando datos...</div>
          ) : (
            <div>
              <p className="mb-4">Registros encontrados: {data?.length || 0}</p>
              {data?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(data.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`;

    fs.writeFileSync(path.join(exportPath, `src/pages/${moduleConfig.pages[0]}.tsx`), samplePage);

    // Generar configuración de React Query
    const queryClient = `import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(\`Error: \${response.status}\`);
        }
        
        return response.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

export const apiRequest = async (url: string, method = 'GET', data?: any) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(\`Error: \${response.status}\`);
  }

  return response.json();
};
`;

    fs.writeFileSync(path.join(exportPath, 'src/lib/queryClient.ts'), queryClient);
  }

  async generateConfig(exportPath, moduleConfig) {
    // Generar vite.config.ts
    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
`;

    fs.writeFileSync(path.join(exportPath, 'vite.config.ts'), viteConfig);

    // Generar .env.example
    const envExample = `# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_db

# Servidor
PORT=3001

# Desarrollo
NODE_ENV=development
`;

    fs.writeFileSync(path.join(exportPath, '.env.example'), envExample);

    // Generar tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["src", "shared", "server"],
      references: [{ path: "./tsconfig.node.json" }]
    };

    fs.writeFileSync(path.join(exportPath, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  }

  async generateSampleData(exportPath, moduleName) {
    const sampleData = {};
    
    if (moduleName === 'finanzas') {
      sampleData.income_categories = [
        { code: 'ING001', name: 'Cuotas de Mantenimiento', description: 'Ingresos regulares por mantenimiento', isActive: true },
        { code: 'ING002', name: 'Eventos', description: 'Ingresos por organización de eventos', isActive: true },
        { code: 'ING003', name: 'Donaciones', description: 'Donaciones de particulares y empresas', isActive: true }
      ];
      
      sampleData.expense_categories = [
        { code: 'EGR001', name: 'Personal', description: 'Gastos de nómina y prestaciones', isActive: true },
        { code: 'EGR002', name: 'Mantenimiento', description: 'Gastos de mantenimiento general', isActive: true },
        { code: 'EGR003', name: 'Servicios', description: 'Servicios públicos y privados', isActive: true }
      ];
    }

    if (moduleName === 'hr') {
      sampleData.employees = [
        { firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez@empresa.com', department: 'Administración', position: 'Gerente', isActive: true },
        { firstName: 'María', lastName: 'García', email: 'maria.garcia@empresa.com', department: 'Operaciones', position: 'Coordinadora', isActive: true },
        { firstName: 'Carlos', lastName: 'López', email: 'carlos.lopez@empresa.com', department: 'Mantenimiento', position: 'Técnico', isActive: true }
      ];
    }

    fs.writeFileSync(
      path.join(exportPath, 'sample-data.json'),
      JSON.stringify(sampleData, null, 2)
    );
  }
}

// Función helper para convertir snake_case a camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Ejecutar si se llama directamente
if (import.meta.main === true) {
  const args = process.argv.slice(2);
  const moduleName = args[0];
  const options = {};

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      options[arg.replace('--', '')] = true;
    }
  });

  if (!moduleName) {
    console.log('Uso: node module-exporter.js [modulo] [opciones]');
    console.log('Módulos disponibles: finanzas, hr, eventos');
    console.log('Opciones: --include-data');
    process.exit(1);
  }

  const exporter = new ModuleExporter();
  exporter.exportModule(moduleName, options)
    .then(exportPath => {
      console.log(`\nExportación completada: ${exportPath}`);
      console.log('Próximos pasos:');
      console.log(`   1. cd ${exportPath}`);
      console.log('   2. npm install');
      console.log('   3. cp .env.example .env');
      console.log('   4. npm run db:push');
      console.log('   5. npm run dev');
    })
    .catch(error => {
      console.error('Error durante la exportación:', error.message);
      process.exit(1);
    });
}

export default ModuleExporter;

// Ejecutar directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const moduleName = args[0];
  const options = {};

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      options[arg.replace('--', '')] = true;
    }
  });

  if (!moduleName) {
    console.log('Uso: node module-exporter.js [modulo] [opciones]');
    console.log('Módulos disponibles: finanzas, hr, eventos');
    console.log('Opciones: --include-data');
    process.exit(1);
  }

  try {
    const exporter = new ModuleExporter();
    const exportPath = await exporter.exportModule(moduleName, options);
    
    console.log(`\nExportación completada: ${exportPath}`);
    console.log('Próximos pasos:');
    console.log(`   1. cd ${exportPath}`);
    console.log('   2. npm install');
    console.log('   3. cp .env.example .env');
    console.log('   4. npm run db:push');
    console.log('   5. npm run dev');
  } catch (error) {
    console.error('Error durante la exportación:', error.message);
    process.exit(1);
  }
}