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
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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

// Tabla de presupuestos anuales por parque
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  year: integer("year").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("draft"), // draft, approved, active
  totalIncomeProjected: decimal("total_income_projected", { precision: 15, scale: 2 }).default("0"),
  totalExpenseProjected: decimal("total_expense_projected", { precision: 15, scale: 2 }).default("0"),
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

// Relaciones
export const incomeCategoriesRelations = relations(incomeCategories, ({ many }) => ({
  subcategories: many(incomeSubcategories),
  budgetLines: many(budgetIncomeLines),
  actualIncomes: many(actualIncomes),
}));

export const incomeSubcategoriesRelations = relations(incomeSubcategories, ({ one, many }) => ({
  category: one(incomeCategories, {
    fields: [incomeSubcategories.categoryId],
    references: [incomeCategories.id],
  }),
  budgetLines: many(budgetIncomeLines),
  actualIncomes: many(actualIncomes),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  subcategories: many(expenseSubcategories),
  budgetLines: many(budgetExpenseLines),
  actualExpenses: many(actualExpenses),
}));

export const expenseSubcategoriesRelations = relations(expenseSubcategories, ({ one, many }) => ({
  category: one(expenseCategories, {
    fields: [expenseSubcategories.categoryId],
    references: [expenseCategories.id],
  }),
  budgetLines: many(budgetExpenseLines),
  actualExpenses: many(actualExpenses),
}));

export const budgetsRelations = relations(budgets, ({ many }) => ({
  incomeLines: many(budgetIncomeLines),
  expenseLines: many(budgetExpenseLines),
  actualIncomes: many(actualIncomes),
  actualExpenses: many(actualExpenses),
  cashFlowProjections: many(cashFlowProjections),
}));

export const budgetIncomeLinesRelations = relations(budgetIncomeLines, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetIncomeLines.budgetId],
    references: [budgets.id],
  }),
  category: one(incomeCategories, {
    fields: [budgetIncomeLines.categoryId],
    references: [incomeCategories.id],
  }),
  subcategory: one(incomeSubcategories, {
    fields: [budgetIncomeLines.subcategoryId],
    references: [incomeSubcategories.id],
  }),
}));

export const budgetExpenseLinesRelations = relations(budgetExpenseLines, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetExpenseLines.budgetId],
    references: [budgets.id],
  }),
  category: one(expenseCategories, {
    fields: [budgetExpenseLines.categoryId],
    references: [expenseCategories.id],
  }),
  subcategory: one(expenseSubcategories, {
    fields: [budgetExpenseLines.subcategoryId],
    references: [expenseSubcategories.id],
  }),
}));

export const actualIncomesRelations = relations(actualIncomes, ({ one }) => ({
  budget: one(budgets, {
    fields: [actualIncomes.budgetId],
    references: [budgets.id],
  }),
  category: one(incomeCategories, {
    fields: [actualIncomes.categoryId],
    references: [incomeCategories.id],
  }),
  subcategory: one(incomeSubcategories, {
    fields: [actualIncomes.subcategoryId],
    references: [incomeSubcategories.id],
  }),
}));

export const actualExpensesRelations = relations(actualExpenses, ({ one }) => ({
  budget: one(budgets, {
    fields: [actualExpenses.budgetId],
    references: [budgets.id],
  }),
  category: one(expenseCategories, {
    fields: [actualExpenses.categoryId],
    references: [expenseCategories.id],
  }),
  subcategory: one(expenseSubcategories, {
    fields: [actualExpenses.subcategoryId],
    references: [expenseSubcategories.id],
  }),
}));

export const cashFlowProjectionsRelations = relations(cashFlowProjections, ({ one }) => ({
  budget: one(budgets, {
    fields: [cashFlowProjections.budgetId],
    references: [budgets.id],
  }),
}));

// Schemas de validación
export const insertIncomeCategorySchema = createInsertSchema(incomeCategories);
export const selectIncomeCategorySchema = createSelectSchema(incomeCategories);
export type InsertIncomeCategory = z.infer<typeof insertIncomeCategorySchema>;
export type IncomeCategory = z.infer<typeof selectIncomeCategorySchema>;

export const insertIncomeSubcategorySchema = createInsertSchema(incomeSubcategories);
export const selectIncomeSubcategorySchema = createSelectSchema(incomeSubcategories);
export type InsertIncomeSubcategory = z.infer<typeof insertIncomeSubcategorySchema>;
export type IncomeSubcategory = z.infer<typeof selectIncomeSubcategorySchema>;

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories);
export const selectExpenseCategorySchema = createSelectSchema(expenseCategories);
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = z.infer<typeof selectExpenseCategorySchema>;

export const insertExpenseSubcategorySchema = createInsertSchema(expenseSubcategories);
export const selectExpenseSubcategorySchema = createSelectSchema(expenseSubcategories);
export type InsertExpenseSubcategory = z.infer<typeof insertExpenseSubcategorySchema>;
export type ExpenseSubcategory = z.infer<typeof selectExpenseSubcategorySchema>;

export const insertBudgetSchema = createInsertSchema(budgets);
export const selectBudgetSchema = createSelectSchema(budgets);
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = z.infer<typeof selectBudgetSchema>;

export const insertBudgetIncomeLineSchema = createInsertSchema(budgetIncomeLines);
export const selectBudgetIncomeLineSchema = createSelectSchema(budgetIncomeLines);
export type InsertBudgetIncomeLine = z.infer<typeof insertBudgetIncomeLineSchema>;
export type BudgetIncomeLine = z.infer<typeof selectBudgetIncomeLineSchema>;

export const insertBudgetExpenseLineSchema = createInsertSchema(budgetExpenseLines);
export const selectBudgetExpenseLineSchema = createSelectSchema(budgetExpenseLines);
export type InsertBudgetExpenseLine = z.infer<typeof insertBudgetExpenseLineSchema>;
export type BudgetExpenseLine = z.infer<typeof selectBudgetExpenseLineSchema>;

export const insertActualIncomeSchema = createInsertSchema(actualIncomes);
export const selectActualIncomeSchema = createSelectSchema(actualIncomes);
export type InsertActualIncome = z.infer<typeof insertActualIncomeSchema>;
export type ActualIncome = z.infer<typeof selectActualIncomeSchema>;

export const insertActualExpenseSchema = createInsertSchema(actualExpenses);
export const selectActualExpenseSchema = createSelectSchema(actualExpenses);
export type InsertActualExpense = z.infer<typeof insertActualExpenseSchema>;
export type ActualExpense = z.infer<typeof selectActualExpenseSchema>;

export const insertCashFlowProjectionSchema = createInsertSchema(cashFlowProjections);
export const selectCashFlowProjectionSchema = createSelectSchema(cashFlowProjections);
export type InsertCashFlowProjection = z.infer<typeof insertCashFlowProjectionSchema>;
export type CashFlowProjection = z.infer<typeof selectCashFlowProjectionSchema>;