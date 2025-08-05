import { pgTable, text, varchar, decimal, integer, timestamp, boolean, date, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";


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
