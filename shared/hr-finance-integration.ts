import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== INTEGRACIÓN HR-FINANZAS ==========

// Tabla de empleados para HR
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  employeeCode: varchar("employee_code", { length: 20 }).notNull().unique(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  parkId: integer("park_id").references(() => parks.id),
  hireDate: date("hire_date").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  salaryType: varchar("salary_type", { length: 20 }).default("monthly"), // monthly, biweekly, hourly
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, vacation, sick_leave
  contractType: varchar("contract_type", { length: 20 }).default("permanent"), // permanent, temporary, contractor
  workSchedule: varchar("work_schedule", { length: 50 }).default("full_time"),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  education: text("education"),
  certifications: text("certifications"), // JSON array as text
  skills: text("skills"), // JSON array as text
  profileImageUrl: text("profile_image_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conceptos de nómina (salarios, prestaciones, deducciones)
export const payrollConcepts = pgTable("payroll_concepts", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // income, deduction, benefit
  category: varchar("category", { length: 50 }).notNull(), // salary, overtime, bonus, tax, insurance
  isFixed: boolean("is_fixed").default(false), // true for fixed amounts, false for calculated
  formula: text("formula"), // For calculated concepts
  isActive: boolean("is_active").default(true),
  expenseCategoryId: integer("expense_category_id").references(() => expenseCategories.id), // Conexión con finanzas
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Registros de nómina por periodo
export const payrollPeriods = pgTable("payroll_periods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(), // monthly, biweekly, weekly
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  payDate: date("pay_date").notNull(),
  status: varchar("status", { length: 20 }).default("draft"), // draft, calculated, approved, paid
  totalGross: decimal("total_gross", { precision: 15, scale: 2 }).default("0"),
  totalDeductions: decimal("total_deductions", { precision: 15, scale: 2 }).default("0"),
  totalNet: decimal("total_net", { precision: 15, scale: 2 }).default("0"),
  budgetId: integer("budget_id").references(() => budgets.id), // Conexión con presupuesto
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Detalle de nómina por empleado
export const payrollDetails = pgTable("payroll_details", {
  id: serial("id").primaryKey(),
  payrollPeriodId: integer("payroll_period_id").references(() => payrollPeriods.id),
  employeeId: integer("employee_id").references(() => employees.id),
  conceptId: integer("concept_id").references(() => payrollConcepts.id),
  hours: decimal("hours", { precision: 8, scale: 2 }).default("0"), // For hourly concepts
  rate: decimal("rate", { precision: 10, scale: 2 }).default("0"), // Rate per hour/unit
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Proyecciones automáticas de nómina en presupuesto
export const payrollProjections = pgTable("payroll_projections", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").references(() => budgets.id),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  departmentId: integer("department_id"),
  parkId: integer("park_id").references(() => parks.id),
  conceptId: integer("concept_id").references(() => payrollConcepts.id),
  projectedAmount: decimal("projected_amount", { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 12, scale: 2 }).default("0"),
  variance: decimal("variance", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relaciones
export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  park: one(parks, {
    fields: [employees.parkId],
    references: [parks.id],
  }),
  payrollDetails: many(payrollDetails),
}));

export const payrollConceptsRelations = relations(payrollConcepts, ({ one, many }) => ({
  expenseCategory: one(expenseCategories, {
    fields: [payrollConcepts.expenseCategoryId],
    references: [expenseCategories.id],
  }),
  payrollDetails: many(payrollDetails),
  projections: many(payrollProjections),
}));

export const payrollPeriodsRelations = relations(payrollPeriods, ({ one, many }) => ({
  budget: one(budgets, {
    fields: [payrollPeriods.budgetId],
    references: [budgets.id],
  }),
  details: many(payrollDetails),
}));

export const payrollDetailsRelations = relations(payrollDetails, ({ one }) => ({
  period: one(payrollPeriods, {
    fields: [payrollDetails.payrollPeriodId],
    references: [payrollPeriods.id],
  }),
  employee: one(employees, {
    fields: [payrollDetails.employeeId],
    references: [employees.id],
  }),
  concept: one(payrollConcepts, {
    fields: [payrollDetails.conceptId],
    references: [payrollConcepts.id],
  }),
}));

export const payrollProjectionsRelations = relations(payrollProjections, ({ one }) => ({
  budget: one(budgets, {
    fields: [payrollProjections.budgetId],
    references: [budgets.id],
  }),
  park: one(parks, {
    fields: [payrollProjections.parkId],
    references: [parks.id],
  }),
  concept: one(payrollConcepts, {
    fields: [payrollProjections.conceptId],
    references: [payrollConcepts.id],
  }),
}));

// Esquemas de validación
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertPayrollConceptSchema = createInsertSchema(payrollConcepts);
export const insertPayrollPeriodSchema = createInsertSchema(payrollPeriods);
export const insertPayrollDetailSchema = createInsertSchema(payrollDetails);
export const insertPayrollProjectionSchema = createInsertSchema(payrollProjections);

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type PayrollConcept = typeof payrollConcepts.$inferSelect;
export type InsertPayrollConcept = z.infer<typeof insertPayrollConceptSchema>;
export type PayrollPeriod = typeof payrollPeriods.$inferSelect;
export type InsertPayrollPeriod = z.infer<typeof insertPayrollPeriodSchema>;
export type PayrollDetail = typeof payrollDetails.$inferSelect;
export type InsertPayrollDetail = z.infer<typeof insertPayrollDetailSchema>;
export type PayrollProjection = typeof payrollProjections.$inferSelect;
export type InsertPayrollProjection = z.infer<typeof insertPayrollProjectionSchema>;