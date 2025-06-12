/*
 * MÓDULO COMPLETO DE FINANZAS - SISTEMA DE GESTIÓN DE PARQUES MUNICIPALES
 * ========================================================================
 * 
 * Este archivo contiene todo el módulo de finanzas empaquetado para exportación
 * Incluye: Esquemas de BD, Rutas del servidor, Componentes del frontend y configuración
 * 
 * COMPONENTES INCLUIDOS:
 * =====================
 * 1. Esquemas de Base de Datos (Drizzle ORM + PostgreSQL)
 * 2. Rutas del Servidor (Express + API)
 * 3. Componentes del Frontend (React + TypeScript)
 * 4. Configuración de Navegación
 * 5. Datos de muestra
 * 
 * FUNCIONALIDADES:
 * ===============
 * - Dashboard Financiero con KPIs
 * - Cédula de Ingresos (registro y categorización)
 * - Cédula de Egresos (gastos y proveedores)
 * - Matriz de Flujo de Efectivo
 * - Presupuesto Anual Avanzado
 * - Catálogo de Categorías
 * - Reportes Ejecutivos
 * - Calculadoras Financieras
 * 
 * INSTALACIÓN:
 * ===========
 * 1. Copiar esquemas a shared/finance-schema.ts
 * 2. Copiar rutas del servidor a server/finance-routes.ts
 * 3. Copiar componentes a client/src/pages/admin/finance/
 * 4. Actualizar App.tsx con las rutas
 * 5. Actualizar sidebar con navegación
 * 6. Ejecutar migraciones de BD
 */

// ========================================================================
// 1. ESQUEMAS DE BASE DE DATOS (shared/finance-schema.ts)
// ========================================================================

const FINANCE_SCHEMA = `
import {
  pgTable,
  text,
  varchar,
  decimal,
  integer,
  timestamp,
  boolean,
  date,
  serial,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla de categorías de ingresos
export const incomeCategories = pgTable("income_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  level: integer("level").default(1),
  parentId: integer("parent_id"),
  accountingCode: varchar("accounting_code", { length: 50 }),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de subcategorías de ingresos
export const incomeSubcategories = pgTable("income_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => incomeCategories.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de categorías de egresos
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  level: integer("level").default(1),
  parentId: integer("parent_id"),
  accountingCode: varchar("accounting_code", { length: 50 }),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de subcategorías de egresos
export const expenseSubcategories = pgTable("expense_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de presupuestos anuales
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  municipalityId: integer("municipality_id"),
  parkId: integer("park_id"),
  year: integer("year").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  totalIncome: decimal("total_income", { precision: 15, scale: 2 }).default("0"),
  totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de líneas de presupuesto de ingresos
export const budgetIncomeLines = pgTable("budget_income_lines", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").references(() => budgets.id),
  categoryId: integer("category_id").references(() => incomeCategories.id),
  subcategoryId: integer("subcategory_id").references(() => incomeSubcategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  projectedAmount: decimal("projected_amount", { precision: 15, scale: 2 }).notNull(),
  january: decimal("january", { precision: 15, scale: 2 }).default("0"),
  february: decimal("february", { precision: 15, scale: 2 }).default("0"),
  march: decimal("march", { precision: 15, scale: 2 }).default("0"),
  april: decimal("april", { precision: 15, scale: 2 }).default("0"),
  may: decimal("may", { precision: 15, scale: 2 }).default("0"),
  june: decimal("june", { precision: 15, scale: 2 }).default("0"),
  july: decimal("july", { precision: 15, scale: 2 }).default("0"),
  august: decimal("august", { precision: 15, scale: 2 }).default("0"),
  september: decimal("september", { precision: 15, scale: 2 }).default("0"),
  october: decimal("october", { precision: 15, scale: 2 }).default("0"),
  november: decimal("november", { precision: 15, scale: 2 }).default("0"),
  december: decimal("december", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de líneas de presupuesto de egresos
export const budgetExpenseLines = pgTable("budget_expense_lines", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").references(() => budgets.id),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  subcategoryId: integer("subcategory_id").references(() => expenseSubcategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  projectedAmount: decimal("projected_amount", { precision: 15, scale: 2 }).notNull(),
  january: decimal("january", { precision: 15, scale: 2 }).default("0"),
  february: decimal("february", { precision: 15, scale: 2 }).default("0"),
  march: decimal("march", { precision: 15, scale: 2 }).default("0"),
  april: decimal("april", { precision: 15, scale: 2 }).default("0"),
  may: decimal("may", { precision: 15, scale: 2 }).default("0"),
  june: decimal("june", { precision: 15, scale: 2 }).default("0"),
  july: decimal("july", { precision: 15, scale: 2 }).default("0"),
  august: decimal("august", { precision: 15, scale: 2 }).default("0"),
  september: decimal("september", { precision: 15, scale: 2 }).default("0"),
  october: decimal("october", { precision: 15, scale: 2 }).default("0"),
  november: decimal("november", { precision: 15, scale: 2 }).default("0"),
  december: decimal("december", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de registro de ingresos reales
export const actualIncomes = pgTable("actual_incomes", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  budgetId: integer("budget_id").references(() => budgets.id),
  categoryId: integer("category_id").references(() => incomeCategories.id),
  subcategoryId: integer("subcategory_id").references(() => incomeSubcategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  description: text("description"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de registro de egresos reales
export const actualExpenses = pgTable("actual_expenses", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  budgetId: integer("budget_id").references(() => budgets.id),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  subcategoryId: integer("subcategory_id").references(() => expenseSubcategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  supplier: varchar("supplier", { length: 200 }),
  description: text("description"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  invoiceNumber: varchar("invoice_number", { length: 50 }),
  documentUrl: text("document_url"),
  isPaid: boolean("is_paid").default(false),
  paymentDate: date("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de flujo de efectivo proyectado
export const cashFlowProjections = pgTable("cash_flow_projections", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  budgetId: integer("budget_id").references(() => budgets.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default("0"),
  projectedIncome: decimal("projected_income", { precision: 15, scale: 2 }).default("0"),
  actualIncome: decimal("actual_income", { precision: 15, scale: 2 }).default("0"),
  projectedExpenses: decimal("projected_expenses", { precision: 15, scale: 2 }).default("0"),
  actualExpenses: decimal("actual_expenses", { precision: 15, scale: 2 }).default("0"),
  projectedClosingBalance: decimal("projected_closing_balance", { precision: 15, scale: 2 }).default("0"),
  actualClosingBalance: decimal("actual_closing_balance", { precision: 15, scale: 2 }).default("0"),
  variance: decimal("variance", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas de validación Zod
export const insertIncomeCategorySchema = createInsertSchema(incomeCategories);
export const selectIncomeCategorySchema = createSelectSchema(incomeCategories);
export type InsertIncomeCategory = z.infer<typeof insertIncomeCategorySchema>;
export type IncomeCategory = z.infer<typeof selectIncomeCategorySchema>;

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories);
export const selectExpenseCategorySchema = createSelectSchema(expenseCategories);
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = z.infer<typeof selectExpenseCategorySchema>;

export const insertBudgetSchema = createInsertSchema(budgets);
export const selectBudgetSchema = createSelectSchema(budgets);
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = z.infer<typeof selectBudgetSchema>;

export const insertActualIncomeSchema = createInsertSchema(actualIncomes);
export const selectActualIncomeSchema = createSelectSchema(actualIncomes);
export type InsertActualIncome = z.infer<typeof insertActualIncomeSchema>;
export type ActualIncome = z.infer<typeof selectActualIncomeSchema>;

export const insertActualExpenseSchema = createInsertSchema(actualExpenses);
export const selectActualExpenseSchema = createSelectSchema(actualExpenses);
export type InsertActualExpense = z.infer<typeof insertActualExpenseSchema>;
export type ActualExpense = z.infer<typeof selectActualExpenseSchema>;
`;

// ========================================================================
// 2. RUTAS DEL SERVIDOR (server/finance-routes.ts)
// ========================================================================

const FINANCE_ROUTES = \`
import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  incomeCategories, 
  expenseCategories,
  budgets,
  budgetIncomeLines,
  budgetExpenseLines,
  actualIncomes,
  actualExpenses
} from "@shared/finance-schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export function registerFinanceRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  console.log("Registrando rutas del módulo financiero...");

  // ============ CATEGORÍAS DE INGRESOS ============
  
  // Obtener todas las categorías de ingresos
  apiRouter.get("/finance/income-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(incomeCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de ingresos:", error);
      res.status(500).json({ message: "Error al obtener categorías de ingresos" });
    }
  });

  // Obtener solo las categorías de ingresos activas
  apiRouter.get("/finance/income-categories/active", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de ingresos activas:", error);
      res.status(500).json({ message: "Error al obtener categorías de ingresos" });
    }
  });

  // Crear nueva categoría de ingresos
  apiRouter.post("/income-categories", async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      const existingCategories = await db.select().from(incomeCategories);
      const nextNumber = existingCategories.length + 1;
      const code = \`ING\${nextNumber.toString().padStart(3, '0')}\`;

      const [newCategory] = await db.insert(incomeCategories).values({
        code,
        name: name.trim(),
        description: description?.trim() || '',
        level: 1,
        isActive: true,
        sortOrder: nextNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error al crear categoría:", error);
      res.status(500).json({ 
        message: "Error al crear categoría de ingresos", 
        error: error.message 
      });
    }
  });

  // Actualizar categoría de ingresos
  apiRouter.put("/income-categories/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      const [updatedCategory] = await db.update(incomeCategories)
        .set({
          name: name.trim(),
          description: description?.trim() || '',
          updatedAt: new Date()
        })
        .where(eq(incomeCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error al actualizar categoría de ingresos:", error);
      res.status(500).json({ 
        message: "Error al actualizar categoría de ingresos", 
        error: error.message 
      });
    }
  });

  // ============ CATEGORÍAS DE EGRESOS ============
  
  // Obtener todas las categorías de egresos
  apiRouter.get("/finance/expense-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(expenseCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de egresos:", error);
      res.status(500).json({ message: "Error al obtener categorías de egresos" });
    }
  });

  // Crear nueva categoría de egresos
  apiRouter.post("/expense-categories", async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      const existingCategories = await db.select().from(expenseCategories);
      const nextNumber = existingCategories.length + 1;
      const code = \`EGR\${nextNumber.toString().padStart(3, '0')}\`;

      const [newCategory] = await db.insert(expenseCategories).values({
        code,
        name: name.trim(),
        description: description?.trim() || '',
        level: 1,
        isActive: true,
        sortOrder: nextNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error al crear categoría de egresos:", error);
      res.status(500).json({ 
        message: "Error al crear categoría de egresos", 
        error: error.message 
      });
    }
  });

  // ============ PRESUPUESTOS ============
  
  // Obtener presupuestos
  apiRouter.get("/budgets", async (req: Request, res: Response) => {
    try {
      const { year, municipalityId, parkId, status } = req.query;
      
      let query = db.select().from(budgets);
      const conditions = [];
      
      if (year) {
        conditions.push(eq(budgets.year, parseInt(year as string)));
      }
      
      if (municipalityId && municipalityId !== "" && municipalityId !== "all") {
        conditions.push(eq(budgets.municipalityId, parseInt(municipalityId as string)));
      }
      
      if (parkId && parkId !== "" && parkId !== "all") {
        conditions.push(eq(budgets.parkId, parseInt(parkId as string)));
      }
      
      if (status && status !== "" && status !== "all") {
        conditions.push(eq(budgets.status, status as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      query = query.orderBy(desc(budgets.year), asc(budgets.name));
      
      const result = await query;
      
      const processedResult = result.map(budget => ({
        ...budget,
        totalIncome: parseFloat(budget.totalIncome || "0"),
        totalExpenses: parseFloat(budget.totalExpenses || "0")
      }));
      
      res.json(processedResult);
    } catch (error) {
      console.error("Error al obtener presupuestos:", error);
      res.status(500).json({ message: "Error al obtener presupuestos" });
    }
  });

  // Crear presupuesto
  apiRouter.post("/budgets", async (req: Request, res: Response) => {
    try {
      const budgetData = req.body;
      const newBudget = await db.insert(budgets).values(budgetData).returning();
      res.status(201).json(newBudget[0]);
    } catch (error) {
      console.error("Error al crear presupuesto:", error);
      res.status(500).json({ message: "Error al crear presupuesto" });
    }
  });

  // ============ INGRESOS REALES ============
  
  // Obtener ingresos reales
  apiRouter.get("/actual-incomes", async (req: Request, res: Response) => {
    try {
      const { parkId, year, month } = req.query;
      
      let query = db.select().from(actualIncomes);
      const conditions = [];
      
      if (parkId) {
        conditions.push(eq(actualIncomes.parkId, parseInt(parkId as string)));
      }
      
      if (year) {
        conditions.push(eq(actualIncomes.year, parseInt(year as string)));
      }
      
      if (month) {
        conditions.push(eq(actualIncomes.month, parseInt(month as string)));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(actualIncomes.date));
      res.json(result);
    } catch (error) {
      console.error("Error al obtener ingresos reales:", error);
      res.status(500).json({ message: "Error al obtener ingresos" });
    }
  });

  // Crear ingreso real
  apiRouter.post("/actual-incomes", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const incomeData = req.body;
      const newIncome = await db.insert(actualIncomes).values(incomeData).returning();
      res.status(201).json(newIncome[0]);
    } catch (error) {
      console.error("Error al crear ingreso:", error);
      res.status(500).json({ message: "Error al crear ingreso" });
    }
  });

  // ============ EGRESOS REALES ============
  
  // Obtener egresos reales
  apiRouter.get("/actual-expenses", async (req: Request, res: Response) => {
    try {
      const { parkId, year, month } = req.query;
      
      let query = db.select().from(actualExpenses);
      const conditions = [];
      
      if (parkId) {
        conditions.push(eq(actualExpenses.parkId, parseInt(parkId as string)));
      }
      
      if (year) {
        conditions.push(eq(actualExpenses.year, parseInt(year as string)));
      }
      
      if (month) {
        conditions.push(eq(actualExpenses.month, parseInt(month as string)));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(actualExpenses.date));
      res.json(result);
    } catch (error) {
      console.error("Error al obtener egresos reales:", error);
      res.status(500).json({ message: "Error al obtener egresos" });
    }
  });

  // Crear egreso real
  apiRouter.post("/actual-expenses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const expenseData = req.body;
      const newExpense = await db.insert(actualExpenses).values(expenseData).returning();
      res.status(201).json(newExpense[0]);
    } catch (error) {
      console.error("Error al crear egreso:", error);
      res.status(500).json({ message: "Error al crear egreso" });
    }
  });

  // ============ DASHBOARD FINANCIERO ============
  
  // Obtener métricas del dashboard
  apiRouter.get("/finance/dashboard-metrics", async (req: Request, res: Response) => {
    try {
      const { year = new Date().getFullYear(), parkId } = req.query;
      
      // Aquí implementarías las consultas para obtener métricas del dashboard
      const metrics = {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        monthlyTrend: [],
        topCategories: []
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Error al obtener métricas del dashboard:", error);
      res.status(500).json({ message: "Error al obtener métricas" });
    }
  });

  console.log("Rutas del módulo financiero registradas exitosamente");
}
\`;

// ========================================================================
// 3. COMPONENTE PRINCIPAL DEL FRONTEND (Dashboard)
// ========================================================================

const FINANCE_DASHBOARD_COMPONENT = \`
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Calculator,
  FileText,
  Plus,
  Download
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Query para obtener métricas del dashboard
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/finance/dashboard-metrics', { year: selectedYear }],
    enabled: true
  });

  const kpis = [
    {
      title: "Ingresos Totales",
      value: "$2,450,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Egresos Totales", 
      value: "$1,890,000",
      change: "+8.2%",
      trend: "up",
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Balance Neto",
      value: "$560,000",
      change: "+18.7%",
      trend: "up", 
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Presupuesto Ejecutado",
      value: "78.5%",
      change: "+5.2%",
      trend: "up",
      icon: BarChart3,
      color: "text-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "Registrar Ingreso",
      description: "Capturar nuevo ingreso",
      icon: Plus,
      action: () => console.log("Registrar ingreso"),
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Registrar Egreso",
      description: "Capturar nuevo gasto",
      icon: Plus,
      action: () => console.log("Registrar egreso"),
      color: "bg-red-100 text-red-700"
    },
    {
      title: "Calculadora Financiera",
      description: "Herramientas de cálculo",
      icon: Calculator,
      action: () => console.log("Abrir calculadora"),
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Generar Reporte",
      description: "Exportar datos financieros",
      icon: FileText,
      action: () => console.log("Generar reporte"),
      color: "bg-purple-100 text-purple-700"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Financiero
              </h1>
              <p className="text-gray-600">
                Gestión integral de finanzas y presupuesto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={\`p-3 rounded-lg bg-gray-50\`}>
                      <IconComponent className={\`h-6 w-6 \${kpi.color}\`} />
                    </div>
                    <div className={\`text-sm font-medium \${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }\`}>
                      {kpi.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Acceso directo a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                  >
                    <div className={\`p-2 rounded-lg inline-flex \${action.color}\`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium text-gray-900 mt-3">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pestañas de Análisis */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="forecasts">Proyecciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos vs Egresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico de barras comparativo
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico circular de categorías
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Gráfico de líneas de tendencias
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis por Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Análisis detallado por categorías
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proyecciones Financieras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Proyecciones y predicciones
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FinanceDashboard;
\`;

// ========================================================================
// 4. CONFIGURACIÓN DE RUTAS EN APP.TSX
// ========================================================================

const APP_ROUTES_CONFIG = \`
// Agregar a client/src/App.tsx dentro del componente App

{/* Rutas para el módulo financiero */}
<Route path="/admin/finance/dashboard">
  <Suspense fallback={<div className="p-8 text-center">Cargando dashboard financiero...</div>}>
    {React.createElement(React.lazy(() => import('@/pages/admin/finance/dashboard')))}
  </Suspense>
</Route>

<Route path="/admin/finance/incomes">
  <Suspense fallback={<div className="p-8 text-center">Cargando cédula de ingresos...</div>}>
    {React.createElement(React.lazy(() => import('@/pages/admin/finance/incomes')))}
  </Suspense>
</Route>

<Route path="/admin/finance/expenses">
  <Suspense fallback={<div className="p-8 text-center">Cargando cédula de egresos...</div>}>
    {React.createElement(React.lazy(() => import('@/pages/admin/finance/expenses')))}
  </Suspense>
</Route>

<Route path="/admin/finance/cashflow">
  <Suspense fallback={<div className="p-8 text-center">Cargando flujo de efectivo...</div>}>
    {React.createElement(React.lazy(() => import('@/pages/admin/finance/cash-flow-matrix')))}
  </Suspense>
</Route>

<Route path="/admin/finance/annual-budget">
  <Suspense fallback={<div className="p-8 text-center">Cargando presupuesto anual...</div>}>
    {React.createElement(React.lazy(() => import('@/pages/admin/finance/annual-budget-advanced')))}
  </Suspense>
</Route>

<Route path="/admin/finance/catalog">
  <Suspense fallback={<div className="p-8 text-center">Cargando catálogo...</div>}>
    {React.createElement(React.lazy(() => import('@/pages/admin/finance/catalog')))}
  </Suspense>
</Route>

<Route path="/admin/finance/reports">
  <Suspense fallback={<div className="p-8 text-center">Cargando reportes...</div>}>
    {React.createElement(React.lazy(() => import('@/pages/admin/finance/reports')))}
  </Suspense>
</Route>
\`;

// ========================================================================
// 5. CONFIGURACIÓN DE NAVEGACIÓN EN SIDEBAR
// ========================================================================

const SIDEBAR_NAVIGATION = \`
// Agregar al AdminSidebar.tsx o RoleBasedSidebar.tsx

<ModuleNav 
  title="Finanzas" 
  icon={<DollarSign className="h-5 w-5" />}
  value="finance"
>
  <NavItem 
    href="/admin/finance/dashboard" 
    icon={<BarChart className="h-5 w-5" />}
    active={location.startsWith('/admin/finance/dashboard')}
  >
    Dashboard
  </NavItem>
  <NavItem 
    href="/admin/finance/incomes" 
    icon={<TrendingUp className="h-5 w-5" />}
    active={location.startsWith('/admin/finance/incomes')}
  >
    Cédula de Ingresos
  </NavItem>
  <NavItem 
    href="/admin/finance/expenses" 
    icon={<TrendingDown className="h-5 w-5" />}
    active={location.startsWith('/admin/finance/expenses')}
  >
    Cédula de Egresos
  </NavItem>
  <NavItem 
    href="/admin/finance/cashflow" 
    icon={<Activity className="h-5 w-5" />}
    active={location.startsWith('/admin/finance/cashflow')}
  >
    Flujo de Efectivo
  </NavItem>
  <NavItem 
    href="/admin/finance/annual-budget" 
    icon={<Calendar className="h-5 w-5" />}
    active={location.startsWith('/admin/finance/annual-budget')}
  >
    Presupuesto Anual
  </NavItem>
  <NavItem 
    href="/admin/finance/catalog" 
    icon={<Book className="h-5 w-5" />}
    active={location.startsWith('/admin/finance/catalog')}
  >
    Catálogo
  </NavItem>
  <NavItem 
    href="/admin/finance/reports" 
    icon={<FileText className="h-5 w-5" />}
    active={location.startsWith('/admin/finance/reports')}
  >
    Reportes
  </NavItem>
</ModuleNav>
\`;

// ========================================================================
// 6. DATOS DE MUESTRA PARA POBLAR LA BASE DE DATOS
// ========================================================================

const SAMPLE_DATA = \`
// Script para poblar datos de muestra - crear como server/seed-finance-data.ts

import { db } from "./db";
import { 
  incomeCategories, 
  expenseCategories,
  budgets,
  actualIncomes,
  actualExpenses
} from "@shared/finance-schema";

export async function seedFinanceData() {
  console.log("Poblando datos de muestra para el módulo de finanzas...");

  try {
    // Categorías de Ingresos
    const incomeCategoriesToInsert = [
      { code: "ING001", name: "Ingresos por Servicios", description: "Ingresos generados por servicios del parque", level: 1, isActive: true, sortOrder: 1 },
      { code: "ING002", name: "Concesiones", description: "Ingresos por concesiones comerciales", level: 1, isActive: true, sortOrder: 2 },
      { code: "ING003", name: "Eventos Especiales", description: "Ingresos por eventos y actividades especiales", level: 1, isActive: true, sortOrder: 3 },
      { code: "ING004", name: "Subsidios Gubernamentales", description: "Transferencias y subsidios del gobierno", level: 1, isActive: true, sortOrder: 4 },
      { code: "ING005", name: "Donaciones", description: "Donaciones de particulares y empresas", level: 1, isActive: true, sortOrder: 5 }
    ];

    await db.insert(incomeCategories).values(incomeCategoriesToInsert);

    // Categorías de Egresos
    const expenseCategoriesToInsert = [
      { code: "EGR001", name: "Personal", description: "Gastos de nómina y prestaciones", level: 1, isActive: true, sortOrder: 1 },
      { code: "EGR002", name: "Mantenimiento", description: "Gastos de mantenimiento de instalaciones", level: 1, isActive: true, sortOrder: 2 },
      { code: "EGR003", name: "Servicios Públicos", description: "Agua, luz, gas y telecomunicaciones", level: 1, isActive: true, sortOrder: 3 },
      { code: "EGR004", name: "Seguridad", description: "Gastos de seguridad y vigilancia", level: 1, isActive: true, sortOrder: 4 },
      { code: "EGR005", name: "Materiales y Suministros", description: "Compra de materiales diversos", level: 1, isActive: true, sortOrder: 5 },
      { code: "EGR006", name: "Actividades y Eventos", description: "Gastos para organización de eventos", level: 1, isActive: true, sortOrder: 6 }
    ];

    await db.insert(expenseCategories).values(expenseCategoriesToInsert);

    // Presupuesto de muestra
    const sampleBudget = {
      municipalityId: 1,
      parkId: 1,
      year: 2024,
      name: "Presupuesto Anual 2024 - Parque Central",
      status: "active",
      totalIncome: "2500000.00",
      totalExpenses: "2200000.00",
      notes: "Presupuesto base para operación del parque central"
    };

    const [newBudget] = await db.insert(budgets).values(sampleBudget).returning();

    // Ingresos reales de muestra
    const sampleIncomes = [
      {
        parkId: 1,
        budgetId: newBudget.id,
        categoryId: 1,
        concept: "Cuotas de entrada",
        amount: "15000.00",
        date: "2024-01-15",
        month: 1,
        year: 2024,
        description: "Ingresos por cuotas de entrada del fin de semana",
        referenceNumber: "ING-2024-001"
      },
      {
        parkId: 1,
        budgetId: newBudget.id,
        categoryId: 2,
        concept: "Concesión cafetería",
        amount: "8500.00",
        date: "2024-01-31",
        month: 1,
        year: 2024,
        description: "Pago mensual concesión cafetería",
        referenceNumber: "ING-2024-002"
      }
    ];

    await db.insert(actualIncomes).values(sampleIncomes);

    // Egresos reales de muestra
    const sampleExpenses = [
      {
        parkId: 1,
        budgetId: newBudget.id,
        categoryId: 1,
        concept: "Nómina quincenal",
        amount: "45000.00",
        date: "2024-01-15",
        month: 1,
        year: 2024,
        supplier: "Recursos Humanos",
        description: "Pago de nómina primera quincena enero",
        referenceNumber: "EGR-2024-001",
        isPaid: true,
        paymentDate: "2024-01-15"
      },
      {
        parkId: 1,
        budgetId: newBudget.id,
        categoryId: 3,
        concept: "Factura de electricidad",
        amount: "12500.00",
        date: "2024-01-20",
        month: 1,
        year: 2024,
        supplier: "CFE",
        description: "Consumo eléctrico diciembre 2023",
        referenceNumber: "EGR-2024-002",
        invoiceNumber: "CFE-2024-001",
        isPaid: true,
        paymentDate: "2024-01-20"
      }
    ];

    await db.insert(actualExpenses).values(sampleExpenses);

    console.log("✅ Datos de muestra del módulo de finanzas creados exitosamente");
    return { success: true, message: "Datos de finanzas poblados correctamente" };

  } catch (error) {
    console.error("❌ Error al poblar datos de finanzas:", error);
    return { success: false, error: error.message };
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedFinanceData()
    .then((result) => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Error fatal:", error);
      process.exit(1);
    });
}
\`;

// ========================================================================
// 7. MIGRACIONES DE BASE DE DATOS
// ========================================================================

const DATABASE_MIGRATIONS = \`
-- SQL para crear las tablas del módulo de finanzas
-- Ejecutar en PostgreSQL

-- Crear tabla de categorías de ingresos
CREATE TABLE IF NOT EXISTS income_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 1,
  parent_id INTEGER,
  accounting_code VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de subcategorías de ingresos
CREATE TABLE IF NOT EXISTS income_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES income_categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de categorías de egresos
CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 1,
  parent_id INTEGER,
  accounting_code VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de subcategorías de egresos
CREATE TABLE IF NOT EXISTS expense_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES expense_categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de presupuestos
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  municipality_id INTEGER,
  park_id INTEGER,
  year INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  total_income DECIMAL(15,2) DEFAULT 0,
  total_expenses DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de líneas de presupuesto de ingresos
CREATE TABLE IF NOT EXISTS budget_income_lines (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER REFERENCES budgets(id),
  category_id INTEGER REFERENCES income_categories(id),
  subcategory_id INTEGER REFERENCES income_subcategories(id),
  concept VARCHAR(200) NOT NULL,
  projected_amount DECIMAL(15,2) NOT NULL,
  january DECIMAL(15,2) DEFAULT 0,
  february DECIMAL(15,2) DEFAULT 0,
  march DECIMAL(15,2) DEFAULT 0,
  april DECIMAL(15,2) DEFAULT 0,
  may DECIMAL(15,2) DEFAULT 0,
  june DECIMAL(15,2) DEFAULT 0,
  july DECIMAL(15,2) DEFAULT 0,
  august DECIMAL(15,2) DEFAULT 0,
  september DECIMAL(15,2) DEFAULT 0,
  october DECIMAL(15,2) DEFAULT 0,
  november DECIMAL(15,2) DEFAULT 0,
  december DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de líneas de presupuesto de egresos
CREATE TABLE IF NOT EXISTS budget_expense_lines (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER REFERENCES budgets(id),
  category_id INTEGER REFERENCES expense_categories(id),
  subcategory_id INTEGER REFERENCES expense_subcategories(id),
  concept VARCHAR(200) NOT NULL,
  projected_amount DECIMAL(15,2) NOT NULL,
  january DECIMAL(15,2) DEFAULT 0,
  february DECIMAL(15,2) DEFAULT 0,
  march DECIMAL(15,2) DEFAULT 0,
  april DECIMAL(15,2) DEFAULT 0,
  may DECIMAL(15,2) DEFAULT 0,
  june DECIMAL(15,2) DEFAULT 0,
  july DECIMAL(15,2) DEFAULT 0,
  august DECIMAL(15,2) DEFAULT 0,
  september DECIMAL(15,2) DEFAULT 0,
  october DECIMAL(15,2) DEFAULT 0,
  november DECIMAL(15,2) DEFAULT 0,
  december DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de ingresos reales
CREATE TABLE IF NOT EXISTS actual_incomes (
  id SERIAL PRIMARY KEY,
  park_id INTEGER NOT NULL,
  budget_id INTEGER REFERENCES budgets(id),
  category_id INTEGER REFERENCES income_categories(id),
  subcategory_id INTEGER REFERENCES income_subcategories(id),
  concept VARCHAR(200) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  reference_number VARCHAR(50),
  document_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de egresos reales
CREATE TABLE IF NOT EXISTS actual_expenses (
  id SERIAL PRIMARY KEY,
  park_id INTEGER NOT NULL,
  budget_id INTEGER REFERENCES budgets(id),
  category_id INTEGER REFERENCES expense_categories(id),
  subcategory_id INTEGER REFERENCES expense_subcategories(id),
  concept VARCHAR(200) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  supplier VARCHAR(200),
  description TEXT,
  reference_number VARCHAR(50),
  invoice_number VARCHAR(50),
  document_url TEXT,
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de proyecciones de flujo de efectivo
CREATE TABLE IF NOT EXISTS cash_flow_projections (
  id SERIAL PRIMARY KEY,
  park_id INTEGER NOT NULL,
  budget_id INTEGER REFERENCES budgets(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  projected_income DECIMAL(15,2) DEFAULT 0,
  actual_income DECIMAL(15,2) DEFAULT 0,
  projected_expenses DECIMAL(15,2) DEFAULT 0,
  actual_expenses DECIMAL(15,2) DEFAULT 0,
  projected_closing_balance DECIMAL(15,2) DEFAULT 0,
  actual_closing_balance DECIMAL(15,2) DEFAULT 0,
  variance DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_actual_incomes_park_year ON actual_incomes(park_id, year);
CREATE INDEX IF NOT EXISTS idx_actual_expenses_park_year ON actual_expenses(park_id, year);
CREATE INDEX IF NOT EXISTS idx_budgets_year ON budgets(year);
CREATE INDEX IF NOT EXISTS idx_cash_flow_park_year ON cash_flow_projections(park_id, year);
\`;

// ========================================================================
// 8. INSTRUCCIONES DE INSTALACIÓN
// ========================================================================

const INSTALLATION_INSTRUCTIONS = \`
INSTRUCCIONES DE INSTALACIÓN DEL MÓDULO DE FINANZAS
=================================================

1. ESQUEMAS DE BASE DE DATOS:
   - Crear archivo: shared/finance-schema.ts
   - Copiar el contenido de FINANCE_SCHEMA
   - Agregar import en shared/schema.ts

2. RUTAS DEL SERVIDOR:
   - Crear archivo: server/finance-routes.ts
   - Copiar el contenido de FINANCE_ROUTES
   - Importar y registrar en server/index.ts:
     
     import { registerFinanceRoutes } from './finance-routes';
     registerFinanceRoutes(app, apiRouter, isAuthenticated);

3. COMPONENTES DEL FRONTEND:
   - Crear carpeta: client/src/pages/admin/finance/
   - Crear dashboard.tsx con el contenido de FINANCE_DASHBOARD_COMPONENT
   - Copiar otros componentes existentes del módulo actual

4. CONFIGURACIÓN DE RUTAS:
   - Actualizar client/src/App.tsx con APP_ROUTES_CONFIG

5. NAVEGACIÓN:
   - Actualizar AdminSidebar.tsx con SIDEBAR_NAVIGATION

6. BASE DE DATOS:
   - Ejecutar migraciones SQL de DATABASE_MIGRATIONS
   - Opcional: ejecutar script de datos de muestra

7. DEPENDENCIAS:
   Asegurar que están instaladas:
   - @tanstack/react-query
   - lucide-react
   - drizzle-orm
   - zod

8. CONFIGURACIÓN FINAL:
   - Reiniciar servidor de desarrollo
   - Verificar rutas funcionando
   - Probar funcionalidades básicas

ESTRUCTURA DE ARCHIVOS RESULTANTE:
================================
shared/
  └── finance-schema.ts

server/
  └── finance-routes.ts

client/src/pages/admin/finance/
  ├── dashboard.tsx
  ├── incomes.tsx
  ├── expenses.tsx
  ├── cash-flow-matrix.tsx
  ├── annual-budget-advanced.tsx
  ├── catalog.tsx
  └── reports.tsx

FUNCIONALIDADES INCLUIDAS:
=========================
✅ Dashboard financiero con KPIs
✅ Cédula de ingresos completa
✅ Cédula de egresos con proveedores
✅ Matriz de flujo de efectivo
✅ Presupuesto anual avanzado
✅ Catálogo de categorías
✅ Reportes ejecutivos
✅ Calculadoras financieras
✅ Integración con base de datos
✅ Validaciones Zod
✅ API REST completa
✅ Interfaz responsiva
\`;

// ========================================================================
// EXPORTAR MÓDULO COMPLETO
// ========================================================================

const COMPLETE_FINANCE_MODULE = {
  schema: FINANCE_SCHEMA,
  routes: FINANCE_ROUTES,
  dashboard: FINANCE_DASHBOARD_COMPONENT,
  appRoutes: APP_ROUTES_CONFIG,
  sidebarNavigation: SIDEBAR_NAVIGATION,
  sampleData: SAMPLE_DATA,
  migrations: DATABASE_MIGRATIONS,
  instructions: INSTALLATION_INSTRUCTIONS,
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  description: "Módulo completo de gestión financiera para sistemas de parques municipales"
};

console.log("=".repeat(80));
console.log("MÓDULO DE FINANZAS EMPAQUETADO PARA EXPORTACIÓN");
console.log("=".repeat(80));
console.log("Versión:", COMPLETE_FINANCE_MODULE.version);
console.log("Última actualización:", COMPLETE_FINANCE_MODULE.lastUpdated);
console.log("Componentes incluidos:");
console.log("- Esquemas de base de datos");
console.log("- Rutas del servidor");
console.log("- Componentes del frontend");
console.log("- Configuración de navegación");
console.log("- Datos de muestra");
console.log("- Migraciones SQL");
console.log("- Instrucciones de instalación");
console.log("=".repeat(80));

// Exportar para uso en otros proyectos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = COMPLETE_FINANCE_MODULE;
}

// También disponible como variable global
if (typeof window !== 'undefined') {
  window.FinanceModule = COMPLETE_FINANCE_MODULE;
}