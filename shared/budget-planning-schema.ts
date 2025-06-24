import { pgTable, serial, integer, decimal, boolean, timestamp, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla principal para proyecciones presupuestarias
export const budgetProjections = pgTable('budget_projections', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1-12
  projectedAmount: decimal('projected_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  isApproved: boolean('is_approved').default(false),
  approvedBy: integer('approved_by'),
  approvedAt: timestamp('approved_at'),
  createdBy: integer('created_by').notNull(),
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
  updatedAt: true,
  approvedAt: true
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