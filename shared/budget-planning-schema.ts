import { pgTable, serial, integer, decimal, boolean, timestamp, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla principal para proyecciones presupuestarias
export const budgetProjections = pgTable('budget_projections', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull(),
  categoryId: integer('category_id').notNull(),
  categoryType: varchar('category_type', { length: 50 }).notNull(), // 'income' | 'expense'
  month1: decimal('month_1', { precision: 15, scale: 2 }).default('0'),
  month2: decimal('month_2', { precision: 15, scale: 2 }).default('0'),
  month3: decimal('month_3', { precision: 15, scale: 2 }).default('0'),
  month4: decimal('month_4', { precision: 15, scale: 2 }).default('0'),
  month5: decimal('month_5', { precision: 15, scale: 2 }).default('0'),
  month6: decimal('month_6', { precision: 15, scale: 2 }).default('0'),
  month7: decimal('month_7', { precision: 15, scale: 2 }).default('0'),
  month8: decimal('month_8', { precision: 15, scale: 2 }).default('0'),
  month9: decimal('month_9', { precision: 15, scale: 2 }).default('0'),
  month10: decimal('month_10', { precision: 15, scale: 2 }).default('0'),
  month11: decimal('month_11', { precision: 15, scale: 2 }).default('0'),
  month12: decimal('month_12', { precision: 15, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabla para plantillas de presupuesto reutilizables
export const budgetTemplates = pgTable('budget_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').notNull(),
  templateAmount: decimal('template_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  monthlyDistribution: text('monthly_distribution'), // JSON con distribución por mes
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Schemas para validación
export const insertBudgetProjectionSchema = createInsertSchema(budgetProjections).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBudgetTemplateSchema = createInsertSchema(budgetTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Tipos TypeScript
export type BudgetProjection = typeof budgetProjections.$inferSelect;
export type InsertBudgetProjection = z.infer<typeof insertBudgetProjectionSchema>;

export type BudgetTemplate = typeof budgetTemplates.$inferSelect;
export type InsertBudgetTemplate = z.infer<typeof insertBudgetTemplateSchema>;

export interface BudgetEntry {
  categoryId: number;
  categoryName: string;
  categoryType?: string;
  categoryColor?: string;
  months: { [month: number]: number };
  total: number;
  totalYear?: number;
}

export interface BudgetMatrix {
  year: number;
  incomeCategories: BudgetEntry[];
  expenseCategories: BudgetEntry[];
  monthlyTotals: {
    income: { [month: number]: number };
    expense: { [month: number]: number };
    net: { [month: number]: number };
  };
  yearlyTotals: {
    income: number;
    expense: number;
    net: number;
  };
}

// Función helper para extraer valores mensuales de una proyección
export function extractMonthlyValues(projection: any): number[] {
  return [
    parseFloat(projection.month_1 || '0'),
    parseFloat(projection.month_2 || '0'),
    parseFloat(projection.month_3 || '0'),
    parseFloat(projection.month_4 || '0'),
    parseFloat(projection.month_5 || '0'),
    parseFloat(projection.month_6 || '0'),
    parseFloat(projection.month_7 || '0'),
    parseFloat(projection.month_8 || '0'),
    parseFloat(projection.month_9 || '0'),
    parseFloat(projection.month_10 || '0'),
    parseFloat(projection.month_11 || '0'),
    parseFloat(projection.month_12 || '0')
  ];
}

// Interfaz para entrada de presupuesto
export interface BudgetEntry {
  categoryId: number;
  categoryName: string;
  categoryType: 'income' | 'expense';
  categoryColor: string;
  months: {
    [month: number]: number;
  };
  totalYear: number;
}

// Interfaz para matriz presupuestaria
export interface BudgetMatrix {
  year: number;
  incomeCategories: BudgetEntry[];
  expenseCategories: BudgetEntry[];
  monthlyTotals: {
    income: { [month: number]: number };
    expense: { [month: number]: number };
    net: { [month: number]: number };
  };
  yearlyTotals: {
    income: number;
    expense: number;
    net: number;
  };
}

// Interfaz para CSV import/export
export interface BudgetCSVRow {
  categoria: string;
  tipo: 'ingreso' | 'gasto';
  enero: number;
  febrero: number;
  marzo: number;
  abril: number;
  mayo: number;
  junio: number;
  julio: number;
  agosto: number;
  septiembre: number;
  octubre: number;
  noviembre: number;
  diciembre: number;
}