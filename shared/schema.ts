import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, jsonb, date, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ========== MÓDULO DE FINANZAS ==========

// Categorías de ingresos
export const incomeCategories = pgTable("income_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  level: integer("level").default(1),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categorías de egresos
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  level: integer("level").default(1),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Presupuestos anuales
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

// Ingresos reales
export const actualIncomes = pgTable("actual_incomes", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  categoryId: integer("category_id").references(() => incomeCategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  description: text("description"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Egresos reales
export const actualExpenses = pgTable("actual_expenses", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  supplier: varchar("supplier", { length: 200 }),
  description: text("description"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  invoiceNumber: varchar("invoice_number", { length: 50 }),
  isPaid: boolean("is_paid").default(false),
  paymentDate: date("payment_date"),
  // Campos para integraciones automáticas  
  isPayrollGenerated: boolean("is_payroll_generated").default(false),
  payrollPeriodId: integer("payroll_period_id"),
  isAssetsGenerated: boolean("is_assets_generated").default(false),
  assetId: integer("asset_id"),
  assetMaintenanceId: integer("asset_maintenance_id"),
  isTreesGenerated: boolean("is_trees_generated").default(false), 
  isVolunteersGenerated: boolean("is_volunteers_generated").default(false),
  isIncidentsGenerated: boolean("is_incidents_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas de validación para finanzas
export const insertIncomeCategorySchema = createInsertSchema(incomeCategories);
export const selectIncomeCategorySchema = createInsertSchema(incomeCategories);
export type InsertIncomeCategory = z.infer<typeof insertIncomeCategorySchema>;
export type IncomeCategory = typeof incomeCategories.$inferSelect;

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories);
export const selectExpenseCategorySchema = createInsertSchema(expenseCategories);
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

export const insertActualIncomeSchema = createInsertSchema(actualIncomes);
export const insertActualExpenseSchema = createInsertSchema(actualExpenses);
export type InsertActualIncome = z.infer<typeof insertActualIncomeSchema>;
export type InsertActualExpense = z.infer<typeof insertActualExpenseSchema>;

// ========== MÓDULO DE RECURSOS HUMANOS ==========

// Tabla de empleados - Matching actual database structure
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  employeeCode: varchar("employee_code", { length: 20 }).unique(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  parkId: integer("park_id").references(() => parks.id),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }),
  salaryType: varchar("salary_type", { length: 20 }).default("monthly"),
  hireDate: date("hire_date").notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  contractType: varchar("contract_type", { length: 20 }).default("permanent"),
  workSchedule: varchar("work_schedule", { length: 100 }),
  education: text("education"),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  skills: text("skills").array(),
  certifications: text("certifications").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conceptos de nómina
export const payrollConcepts = pgTable("payroll_concepts", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // income, deduction, benefit
  category: varchar("category", { length: 50 }).notNull(), // salary, overtime, bonus, tax, insurance
  isFixed: boolean("is_fixed").default(false),
  formula: text("formula"),
  isActive: boolean("is_active").default(true),
  expenseCategoryId: integer("expense_category_id").references(() => expenseCategories.id),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Periodos de nómina - Matching actual database structure
export const payrollPeriods = pgTable("payroll_periods", {
  id: serial("id").primaryKey(),
  period: varchar("period", { length: 7 }).notNull(), // Format: YYYY-MM
  name: varchar("name", { length: 100 }), // Period name for HR-Finance integration
  periodType: varchar("period_type", { length: 20 }).default("monthly"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  payDate: date("pay_date"), // Payment date for HR integration
  status: varchar("status", { length: 20 }).default("draft"),
  processedAt: timestamp("processed_at"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  totalGross: decimal("total_gross", { precision: 12, scale: 2 }),
  totalDeductions: decimal("total_deductions", { precision: 12, scale: 2 }),
  totalNet: decimal("total_net", { precision: 12, scale: 2 }),
  employeesCount: integer("employees_count"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Detalle de nómina - Matching actual database structure
export const payrollDetails = pgTable("payroll_details", {
  id: serial("id").primaryKey(),
  periodId: integer("period_id").references(() => payrollPeriods.id),
  payrollPeriodId: integer("payroll_period_id").references(() => payrollPeriods.id), // For HR integration compatibility
  employeeId: integer("employee_id").references(() => employees.id),
  conceptId: integer("concept_id").references(() => payrollConcepts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).default("1"),
  hours: decimal("hours", { precision: 8, scale: 2 }),
  rate: decimal("rate", { precision: 10, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Actualizar la tabla existente de gastos para incluir campos de nómina
export const actualExpensesWithPayroll = pgTable("actual_expenses", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  concept: varchar("concept", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  supplier: varchar("supplier", { length: 200 }),
  description: text("description"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  isPaid: boolean("is_paid").default(false),
  // Campos adicionales para integración con nómina
  payrollPeriodId: integer("payroll_period_id").references(() => payrollPeriods.id),
  isPayrollGenerated: boolean("is_payroll_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relaciones HR
export const employeesRelations = relations(employees, ({ many }) => ({
  payrollDetails: many(payrollDetails),
}));

export const payrollConceptsRelations = relations(payrollConcepts, ({ many }) => ({
  payrollDetails: many(payrollDetails),
}));

export const payrollPeriodsRelations = relations(payrollPeriods, ({ many }) => ({
  details: many(payrollDetails),
}));

export const payrollDetailsRelations = relations(payrollDetails, ({ one }) => ({
  period: one(payrollPeriods, {
    fields: [payrollDetails.periodId],
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

// Esquemas HR
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertPayrollConceptSchema = createInsertSchema(payrollConcepts);
export const insertPayrollPeriodSchema = createInsertSchema(payrollPeriods);
export const insertPayrollDetailSchema = createInsertSchema(payrollDetails);

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type PayrollConcept = typeof payrollConcepts.$inferSelect;
export type InsertPayrollConcept = z.infer<typeof insertPayrollConceptSchema>;
export type PayrollPeriod = typeof payrollPeriods.$inferSelect;
export type InsertPayrollPeriod = z.infer<typeof insertPayrollPeriodSchema>;
export type PayrollDetail = typeof payrollDetails.$inferSelect;
export type InsertPayrollDetail = z.infer<typeof insertPayrollDetailSchema>;

// ========== FIN MÓDULO DE RECURSOS HUMANOS ==========

// Tabla para almacenar sesiones (requerida para la autenticación con Replit)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Tablas para el módulo de arbolado
export const treeEnvironmentalServices = pgTable("tree_environmental_services", {
  id: serial("id").primaryKey(),
  treeId: integer("tree_id").notNull(),
  co2CaptureAnnual: decimal("co2_capture_annual", { precision: 10, scale: 2 }),
  co2CaptureLifetime: decimal("co2_capture_lifetime", { precision: 10, scale: 2 }),
  o2ProductionAnnual: decimal("o2_production_annual", { precision: 10, scale: 2 }),
  pollutantRemovalNO2: decimal("pollutant_removal_no2", { precision: 10, scale: 2 }),
  pollutantRemovalSO2: decimal("pollutant_removal_so2", { precision: 10, scale: 2 }),
  pollutantRemovalPM25: decimal("pollutant_removal_pm25", { precision: 10, scale: 2 }),
  stormwaterInterception: decimal("stormwater_interception", { precision: 10, scale: 2 }),
  shadeArea: decimal("shade_area", { precision: 10, scale: 2 }),
  temperatureReduction: decimal("temperature_reduction", { precision: 5, scale: 2 }),
  economicValueAnnual: decimal("economic_value_annual", { precision: 10, scale: 2 }),
  calculationDate: date("calculation_date").notNull(),
  calculationMethod: text("calculation_method"),
  notes: text("notes"),
  calculatedById: integer("calculated_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type TreeEnvironmentalService = typeof treeEnvironmentalServices.$inferSelect;
export type InsertTreeEnvironmentalService = typeof treeEnvironmentalServices.$inferInsert;

export const insertTreeEnvironmentalServiceSchema = createInsertSchema(treeEnvironmentalServices).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const treeRiskAssessments = pgTable("tree_risk_assessments", {
  id: serial("id").primaryKey(),
  treeId: integer("tree_id").notNull(),
  assessmentDate: date("assessment_date").notNull(),
  riskLevel: text("risk_level").notNull(),
  methodology: text("methodology"),
  assessedById: integer("assessed_by_id"),
  observations: text("observations"),
  recommendedActions: text("recommended_actions"),
  reassessmentDate: date("reassessment_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type TreeRiskAssessment = typeof treeRiskAssessments.$inferSelect;
export type InsertTreeRiskAssessment = typeof treeRiskAssessments.$inferInsert;

export const insertTreeRiskAssessmentSchema = createInsertSchema(treeRiskAssessments).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const treeInterventions = pgTable("tree_interventions", {
  id: serial("id").primaryKey(),
  treeId: integer("tree_id").notNull(),
  interventionType: text("intervention_type").notNull(),
  interventionDate: date("intervention_date"),
  scheduledDate: date("scheduled_date"),
  status: text("status").default("scheduled"),
  priority: text("priority").default("medium"),
  description: text("description"),
  performedById: integer("performed_by_id"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type TreeIntervention = typeof treeInterventions.$inferSelect;
export type InsertTreeIntervention = typeof treeInterventions.$inferInsert;

export const insertTreeInterventionSchema = createInsertSchema(treeInterventions).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"),
  fullName: text("full_name").notNull(),
  municipalityId: integer("municipality_id"),
  phone: text("phone"),
  gender: text("gender"),
  birthDate: date("birth_date"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Elementos adicionales necesarios para el funcionamiento del sistema
export const parkImages = pgTable("park_images", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const parkAmenities = pgTable("park_amenities", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  amenityId: integer("amenity_id").notNull(),
  description: text("description"),
  moduleName: text("module_name"),
  locationLatitude: decimal("location_latitude", { precision: 10, scale: 8 }),
  locationLongitude: decimal("location_longitude", { precision: 11, scale: 8 }),
  surfaceArea: decimal("surface_area", { precision: 10, scale: 2 }),
  status: text("status").default("Activa"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  description: text("description"),
  uploadedById: integer("uploaded_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Categorías de actividades
export const activityCategories = pgTable("activity_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#00a587"),
  icon: varchar("icon", { length: 50 }).default("calendar"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  category: text("category"), // Campo de texto para categoría legacy
  createdAt: timestamp("created_at").notNull().defaultNow(),
  location: text("location"),
  categoryId: integer("category_id").references(() => activityCategories.id)
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  rating: integer("rating"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  incidentType: text("incident_type").notNull(),
  status: text("status").default("reported"),
  priority: text("priority").default("medium"),
  reportedById: integer("reported_by_id"),
  assignedToId: integer("assigned_to_id"),
  locationDetails: text("location_details"),
  imageUrls: text("image_urls").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at")
});

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
  address: text("address"),
  preferredParkId: integer("preferred_park_id"),
  previousExperience: text("previous_experience"),
  availableDays: text("available_days").array(),
  availableHours: text("available_hours"),
  interestAreas: text("interest_areas").array(),
  skills: text("skills"),
  legalConsent: boolean("legal_consent").default(false),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const volunteerParticipations = pgTable("volunteer_participations", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull(),
  activityId: integer("activity_id"),
  parkId: integer("park_id").notNull(),
  participationDate: date("participation_date").notNull(),
  hoursServed: decimal("hours_served", { precision: 4, scale: 2 }).notNull(),
  tasks: text("tasks").notNull(),
  feedback: text("feedback"),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const volunteerEvaluations = pgTable("volunteer_evaluations", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull(),
  evaluatorId: integer("evaluator_id").notNull(),
  evaluationDate: date("evaluation_date").notNull(),
  attendanceRating: integer("attendance_rating").notNull(),
  attitudeRating: integer("attitude_rating").notNull(),
  skillsRating: integer("skills_rating").notNull(),
  teamworkRating: integer("teamwork_rating").notNull(),
  overallRating: integer("overall_rating").notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const volunteerRecognitions = pgTable("volunteer_recognitions", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull(),
  recognitionType: text("recognition_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  issuedDate: date("issued_date").notNull(),
  issuedById: integer("issued_by_id").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Constantes y tipos adicionales
export const PARK_TYPES = [
  "urbano",
  "natural",
  "lineal",
  "metropolitano",
  "vecinal",
  "de bolsillo",
  "temático"
];

export const DEFAULT_AMENITIES = [
  "Juegos Infantiles", 
  "Área de Picnic", 
  "Baños", 
  "Estacionamiento", 
  "Senderos", 
  "Área Deportiva",
  "Fuente", 
  "Iluminación", 
  "Bancas", 
  "Área de Mascotas"
];

// Tipos extendidos
export type ExtendedPark = typeof parks.$inferSelect & {
  municipality?: typeof municipalities.$inferSelect;
  amenities?: typeof amenities.$inferSelect[];
  images?: typeof parkImages.$inferSelect[];
  primaryImage?: string | null;
  mainImageUrl?: string | null;
};

export type ExtendedVolunteer = typeof volunteers.$inferSelect & {
  user?: typeof users.$inferSelect;
  park?: typeof parks.$inferSelect;
};

// Tipos para las tablas
export type ParkImage = typeof parkImages.$inferSelect;
export type InsertParkImage = typeof parkImages.$inferInsert;

export const insertParkImageSchema = createInsertSchema(parkImages).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Amenity = typeof amenities.$inferSelect;
export type InsertAmenity = typeof amenities.$inferInsert;

export type ParkAmenity = typeof parkAmenities.$inferSelect;
export type InsertParkAmenity = typeof parkAmenities.$inferInsert;

export const insertParkAmenitySchema = createInsertSchema(parkAmenities).omit({ 
  id: true,
  createdAt: true
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  fileType: z.string().optional() // Hacer fileType opcional para URLs externas
});

export type ActivityCategory = typeof activityCategories.$inferSelect;
export type InsertActivityCategory = typeof activityCategories.$inferInsert;

export const insertActivityCategorySchema = createInsertSchema(activityCategories).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const insertCommentSchema = createInsertSchema(comments).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

export const insertIncidentSchema = createInsertSchema(incidents).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = typeof volunteers.$inferInsert;

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type VolunteerParticipation = typeof volunteerParticipations.$inferSelect;
export type InsertVolunteerParticipation = typeof volunteerParticipations.$inferInsert;

export const insertVolunteerParticipationSchema = createInsertSchema(volunteerParticipations).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type VolunteerEvaluation = typeof volunteerEvaluations.$inferSelect;
export type InsertVolunteerEvaluation = typeof volunteerEvaluations.$inferInsert;

export const insertVolunteerEvaluationSchema = createInsertSchema(volunteerEvaluations).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type VolunteerRecognition = typeof volunteerRecognitions.$inferSelect;
export type InsertVolunteerRecognition = typeof volunteerRecognitions.$inferInsert;

export const insertVolunteerRecognitionSchema = createInsertSchema(volunteerRecognitions).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

// Perfiles de concesionarios
export const concessionaireProfiles = pgTable("concessionaire_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // persona_fisica, persona_moral
  rfc: varchar("rfc", { length: 20 }).notNull().unique(),
  taxAddress: text("tax_address").notNull(),
  legalRepresentative: varchar("legal_representative", { length: 200 }),
  registrationDate: date("registration_date").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("activo"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type ConcessionaireProfile = typeof concessionaireProfiles.$inferSelect;
export type InsertConcessionaireProfile = typeof concessionaireProfiles.$inferInsert;

export const insertConcessionaireProfileSchema = createInsertSchema(concessionaireProfiles).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

// Documentos de concesionarios
export const concessionaireDocuments = pgTable("concessionaire_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  documentType: varchar("document_type", { length: 50 }).notNull(), // rfc, identificacion, acta_constitutiva, poder_notarial, etc.
  documentName: varchar("document_name", { length: 200 }).notNull(),
  documentUrl: varchar("document_url", { length: 255 }).notNull(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  expiryDate: date("expiry_date"),
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  verifiedById: integer("verified_by_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ConcessionaireDocument = typeof concessionaireDocuments.$inferSelect;
export type InsertConcessionaireDocument = typeof concessionaireDocuments.$inferInsert;

export const insertConcessionaireDocumentSchema = createInsertSchema(concessionaireDocuments).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

// Relaciones para las tablas de concesionarios
export const concessionaireProfilesRelations = relations(concessionaireProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [concessionaireProfiles.userId],
    references: [users.id]
  })
}));

export const concessionaireDocumentsRelations = relations(concessionaireDocuments, ({ one }) => ({
  user: one(users, {
    fields: [concessionaireDocuments.userId],
    references: [users.id]
  })
}));

// Relaciones de usuarios - incluyendo perfiles de concesionarios
export const usersRelations = relations(users, ({ one, many }) => ({
  concessionaireProfile: one(concessionaireProfiles, {
    fields: [users.id],
    references: [concessionaireProfiles.userId]
  })
}));

// Definición de tablas de instructores
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  specialties: text("specialties").array(),
  certifications: text("certifications").array(),
  experience: text("experience"),
  availability: text("availability").array(),
  preferredParkId: integer("preferred_park_id"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  status: text("status").default("active"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const instructorAssignments = pgTable("instructor_assignments", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull(),
  activityId: integer("activity_id").notNull(),
  parkId: integer("park_id").notNull(),
  assignmentDate: date("assignment_date").notNull(),
  status: text("status").default("assigned"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const instructorEvaluations = pgTable("instructor_evaluations", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull(),
  evaluatorId: integer("evaluator_id").notNull(),
  evaluationDate: date("evaluation_date").notNull(),
  knowledgeRating: integer("knowledge_rating").notNull(),
  teachingRating: integer("teaching_rating").notNull(),
  punctualityRating: integer("punctuality_rating").notNull(),
  communicationRating: integer("communication_rating").notNull(),
  overallRating: integer("overall_rating").notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const instructorRecognitions = pgTable("instructor_recognitions", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull(),
  recognitionType: text("recognition_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  issuedDate: date("issued_date").notNull(),
  issuedById: integer("issued_by_id").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Tipos para las tablas de instructores
export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = typeof instructors.$inferInsert;

export const insertInstructorSchema = createInsertSchema(instructors).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InstructorAssignment = typeof instructorAssignments.$inferSelect;
export type InsertInstructorAssignment = typeof instructorAssignments.$inferInsert;

export const insertInstructorAssignmentSchema = createInsertSchema(instructorAssignments).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InstructorEvaluation = typeof instructorEvaluations.$inferSelect;
export type InsertInstructorEvaluation = typeof instructorEvaluations.$inferInsert;

export const insertInstructorEvaluationSchema = createInsertSchema(instructorEvaluations).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InstructorRecognition = typeof instructorRecognitions.$inferSelect;
export type InsertInstructorRecognition = typeof instructorRecognitions.$inferInsert;

export const insertInstructorRecognitionSchema = createInsertSchema(instructorRecognitions).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

// Creando tipos para las categorías de incidentes
export const incidentCategories = pgTable("incident_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6B7280"),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type IncidentCategory = typeof incidentCategories.$inferSelect;
export type InsertIncidentCategory = typeof incidentCategories.$inferInsert;

export const incidentSubcategories = pgTable("incident_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type IncidentSubcategory = typeof incidentSubcategories.$inferSelect;
export type InsertIncidentSubcategory = typeof incidentSubcategories.$inferInsert;

export const incidentComments = pgTable("incident_comments", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export type IncidentComment = typeof incidentComments.$inferSelect;
export type InsertIncidentComment = typeof incidentComments.$inferInsert;

export const incidentHistory = pgTable("incident_history", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id").notNull(),
  userId: integer("user_id").notNull(),
  actionType: text("action_type").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export type IncidentHistory = typeof incidentHistory.$inferSelect;
export type InsertIncidentHistory = typeof incidentHistory.$inferInsert;

export const incidentNotifications = pgTable("incident_notifications", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id").notNull(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export type IncidentNotification = typeof incidentNotifications.$inferSelect;
export type InsertIncidentNotification = typeof incidentNotifications.$inferInsert;

export const municipalities = pgTable("municipalities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  logoUrl: text("logo_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const parks = pgTable("parks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  municipalityId: integer("municipality_id").notNull(),
  parkType: text("park_type").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  postalCode: text("postal_code"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  area: text("area"), // Superficie total
  greenArea: text("green_area"), // Área permeable
  foundationYear: integer("foundation_year"),
  administrator: text("administrator"),
  conservationStatus: text("conservation_status"),
  regulationUrl: text("regulation_url"),
  openingHours: text("opening_hours"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  videoUrl: text("video_url"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Tablas para el módulo de árboles
export const treeSpecies = pgTable("tree_species", {
  id: serial("id").primaryKey(),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name").notNull(),
  family: text("family"),
  origin: text("origin"), // Nativo, Introducido, etc.
  climateZone: text("climate_zone"),
  growthRate: text("growth_rate"), // Lento, Medio, Rápido
  heightMature: decimal("height_mature", { precision: 5, scale: 2 }), // altura máxima en metros
  canopyDiameter: decimal("canopy_diameter", { precision: 5, scale: 2 }), // diámetro de copa en metros
  lifespan: integer("lifespan"), // años aproximados
  imageUrl: text("image_url"), // URL de la imagen
  description: text("description"),
  maintenanceRequirements: text("maintenance_requirements"),
  waterRequirements: text("water_requirements"), // Bajo, Medio, Alto
  sunRequirements: text("sun_requirements"), // Sombra, Parcial, Pleno sol
  soilRequirements: text("soil_requirements"),
  ecologicalBenefits: text("ecological_benefits"),
  ornamentalValue: text("ornamental_value"), // Bajo, Medio, Alto
  commonUses: text("common_uses"),
  isEndangered: boolean("is_endangered").default(false),
  iconColor: text("icon_color").default("#4CAF50"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const trees = pgTable("trees", {
  id: serial("id").primaryKey(),
  species_id: integer("species_id").references(() => treeSpecies.id),
  park_id: integer("park_id").references(() => parks.id),
  last_maintenance_date: date("last_maintenance_date"),
  created_by: integer("created_by"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  // Datos de geolocalización
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  // Datos físicos
  height: decimal("height"),
  trunk_diameter: decimal("trunk_diameter"),
  // Datos administrativos
  planting_date: date("planting_date"),
  location_description: varchar("location_description", { length: 255 }),
  notes: text("notes"),
  // Estado
  condition: varchar("condition", { length: 50 }),
  health_status: varchar("health_status", { length: 50 })
});

export const treeMaintenances = pgTable("tree_maintenances", {
  id: serial("id").primaryKey(),
  tree_id: integer("tree_id").references(() => trees.id),
  maintenance_type: varchar("maintenance_type").notNull(),
  maintenance_date: date("maintenance_date").notNull(),
  description: text("description"),
  performed_by: integer("performed_by"),
  notes: text("notes"),
  next_maintenance_date: date("next_maintenance_date"),
  created_at: timestamp("created_at").notNull().defaultNow()
});

// Esquemas de inserción
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMunicipalitySchema = createInsertSchema(municipalities).omit({ 
  id: true,
  createdAt: true
});

export const insertParkSchema = createInsertSchema(parks).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

// Categorías de eventos (diferente de actividades)
export const eventCategories = pgTable("event_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3B82F6"), // Color hex para UI
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Eventos generales (diferente de actividades)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  park_id: integer("park_id").references(() => parks.id),
  category_id: integer("category_id").references(() => eventCategories.id),
  capacity: integer("capacity"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  location: varchar("location", { length: 255 }), // Ubicación específica dentro del parque
  contact_email: varchar("contact_email", { length: 255 }),
  contact_phone: varchar("contact_phone", { length: 20 }),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("programado"), // programado, en_curso, completado, cancelado
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tipos para eventos
export type EventCategory = typeof eventCategories.$inferSelect;
export type InsertEventCategory = typeof eventCategories.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const insertTreeSpeciesSchema = createInsertSchema(treeSpecies).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTreeSchema = createInsertSchema(trees).omit({ 
  id: true,
  created_at: true,
  updated_at: true
});

export const insertTreeMaintenanceSchema = createInsertSchema(treeMaintenances).omit({ 
  id: true,
  created_at: true
});

// Tipos
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Municipality = typeof municipalities.$inferSelect;
export type InsertMunicipality = z.infer<typeof insertMunicipalitySchema>;

export type Park = typeof parks.$inferSelect;
export type InsertPark = z.infer<typeof insertParkSchema>;

export type TreeSpecies = typeof treeSpecies.$inferSelect;
export type InsertTreeSpecies = z.infer<typeof insertTreeSpeciesSchema>;

export type Tree = typeof trees.$inferSelect;
export type InsertTree = z.infer<typeof insertTreeSchema>;

export type TreeMaintenance = typeof treeMaintenances.$inferSelect;
export type InsertTreeMaintenance = z.infer<typeof insertTreeMaintenanceSchema>;

// Relaciones
export const treesRelations = relations(trees, ({ one }) => ({
  species: one(treeSpecies, {
    fields: [trees.species_id],
    references: [treeSpecies.id],
  }),
  park: one(parks, {
    fields: [trees.park_id],
    references: [parks.id],
  })
}));

export const treeMaintenancesRelations = relations(treeMaintenances, ({ one }) => ({
  tree: one(trees, {
    fields: [treeMaintenances.tree_id],
    references: [trees.id],
  })
}));

export const parksRelations = relations(parks, ({ one }) => ({
  municipality: one(municipalities, {
    fields: [parks.municipalityId],
    references: [municipalities.id],
  })
}));

// Enumeraciones
export const impactLevelEnum = pgEnum('impact_level', ['bajo', 'medio', 'alto', 'muy_alto']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue', 'cancelled', 'refunded']);
export const paymentTypeEnum = pgEnum('payment_type', ['monthly', 'quarterly', 'biannual', 'annual', 'one_time', 'variable']);
export const evaluationStatusEnum = pgEnum('evaluation_status', ['draft', 'completed', 'pending_review', 'approved', 'rejected']);
export const sanctionStatusEnum = pgEnum('sanction_status', ['pending', 'resolved', 'appealed', 'cancelled']);

// Tabla para el catálogo de tipos de concesiones
export const concessionTypes = pgTable("concession_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  technicalRequirements: text("technical_requirements"),
  legalRequirements: text("legal_requirements"),
  operatingRules: text("operating_rules"),
  impactLevel: impactLevelEnum("impact_level").notNull().default('bajo'),
  isActive: boolean("is_active").notNull().default(true),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type ConcessionType = typeof concessionTypes.$inferSelect;
export type InsertConcessionType = typeof concessionTypes.$inferInsert;

export const insertConcessionTypeSchema = createInsertSchema(concessionTypes).omit({
  id: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
});

// Tabla para las concesiones asignadas a parques específicos
export const concessions = pgTable("concessions", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  concessionTypeId: integer("concession_type_id").notNull(),
  vendorName: varchar("vendor_name", { length: 100 }).notNull(),
  vendorContact: varchar("vendor_contact", { length: 100 }),
  vendorEmail: varchar("vendor_email", { length: 100 }),
  vendorPhone: varchar("vendor_phone", { length: 20 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: varchar("status", { length: 20 }).notNull().default('activa'),
  location: text("location"),
  notes: text("notes"),
  contractFile: varchar("contract_file", { length: 255 }),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type Concession = typeof concessions.$inferSelect;
export type InsertConcession = typeof concessions.$inferInsert;

export const insertConcessionSchema = createInsertSchema(concessions).omit({
  id: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
});

// Tabla para contratos de concesiones
export const concessionContracts = pgTable("concession_contracts", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  concessionaireId: integer("concessionaire_id").notNull(),
  concessionTypeId: integer("concession_type_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
  exclusivityClauses: text("exclusivity_clauses"),
  restrictions: text("restrictions"),
  contractFileUrl: text("contract_file_url"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  hasExtension: boolean("has_extension").default(false),
  extensionDate: date("extension_date"),
  notes: text("notes"),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Tabla para ubicación y georreferenciación de concesiones
export const concessionLocations = pgTable("concession_locations", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  zoneName: varchar("zone_name", { length: 100 }),
  subzoneName: varchar("subzone_name", { length: 100 }),
  coordinates: text("coordinates"), // Almacenamos como texto 'lat,lng'
  areaSqm: decimal("area_sqm", { precision: 10, scale: 2 }).notNull(),
  mapReference: text("map_reference"),
  locationDescription: text("location_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Tabla para gestión financiera de concesiones
export const concessionPayments = pgTable("concession_payments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default('pending'),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  invoiceUrl: text("invoice_url"),
  notes: text("notes"),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Tabla para evaluación y cumplimiento de concesiones
export const concessionEvaluations = pgTable("concession_evaluations", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  evaluationDate: date("evaluation_date").notNull(),
  evaluatorId: integer("evaluator_id"),
  sanitaryRating: integer("sanitary_rating"),
  operationalRating: integer("operational_rating"),
  technicalRating: integer("technical_rating"),
  complianceRating: integer("compliance_rating"),
  customerSatisfactionRating: integer("customer_satisfaction_rating"),
  overallRating: decimal("overall_rating", { precision: 3, scale: 1 }),
  findings: text("findings"),
  recommendations: text("recommendations"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date"),
  status: evaluationStatusEnum("status").default('draft'),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Tabla para checklists personalizables
export const concessionEvaluationChecklists = pgTable("concession_evaluation_checklists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  items: jsonb("items").notNull(),
  isActive: boolean("is_active").default(true),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Tabla para sanciones e incidencias
export const concessionSanctions = pgTable("concession_sanctions", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  evaluationId: integer("evaluation_id"),
  sanctionDate: date("sanction_date").notNull(),
  sanctionType: varchar("sanction_type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  resolutionStatus: sanctionStatusEnum("resolution_status").default('pending'),
  resolutionDate: date("resolution_date"),
  resolutionNotes: text("resolution_notes"),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type ConcessionContract = typeof concessionContracts.$inferSelect;
export type InsertConcessionContract = typeof concessionContracts.$inferInsert;

export type ConcessionLocation = typeof concessionLocations.$inferSelect;
export type InsertConcessionLocation = typeof concessionLocations.$inferInsert;

export type ConcessionPayment = typeof concessionPayments.$inferSelect;
export type InsertConcessionPayment = typeof concessionPayments.$inferInsert;

export type ConcessionEvaluation = typeof concessionEvaluations.$inferSelect;
export type InsertConcessionEvaluation = typeof concessionEvaluations.$inferInsert;

export type ConcessionEvaluationChecklist = typeof concessionEvaluationChecklists.$inferSelect;
export type InsertConcessionEvaluationChecklist = typeof concessionEvaluationChecklists.$inferInsert;

export type ConcessionSanction = typeof concessionSanctions.$inferSelect;
export type InsertConcessionSanction = typeof concessionSanctions.$inferInsert;

export const insertConcessionContractSchema = createInsertSchema(concessionContracts).omit({
  id: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
});

export const insertConcessionLocationSchema = createInsertSchema(concessionLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertConcessionPaymentSchema = createInsertSchema(concessionPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertConcessionEvaluationSchema = createInsertSchema(concessionEvaluations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertConcessionEvaluationChecklistSchema = createInsertSchema(concessionEvaluationChecklists).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertConcessionSanctionSchema = createInsertSchema(concessionSanctions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Relaciones para los contratos de concesiones
export const concessionContractsRelations = relations(concessionContracts, ({ one, many }) => ({
  park: one(parks, {
    fields: [concessionContracts.parkId],
    references: [parks.id]
  }),
  concessionaire: one(users, {
    fields: [concessionContracts.concessionaireId],
    references: [users.id]
  }),
  concessionType: one(concessionTypes, {
    fields: [concessionContracts.concessionTypeId],
    references: [concessionTypes.id]
  }),
  // Nuevas relaciones para las funcionalidades extendidas
  locations: many(concessionLocations),
  payments: many(concessionPayments),
  evaluations: many(concessionEvaluations),
  sanctions: many(concessionSanctions)
}));

// Relaciones para ubicaciones de concesiones
export const concessionLocationsRelations = relations(concessionLocations, ({ one }) => ({
  contract: one(concessionContracts, {
    fields: [concessionLocations.contractId],
    references: [concessionContracts.id]
  })
}));

// Relaciones para pagos de concesiones
export const concessionPaymentsRelations = relations(concessionPayments, ({ one }) => ({
  contract: one(concessionContracts, {
    fields: [concessionPayments.contractId],
    references: [concessionContracts.id]
  })
}));

// Relaciones para evaluaciones de concesiones
export const concessionEvaluationsRelations = relations(concessionEvaluations, ({ one, many }) => ({
  contract: one(concessionContracts, {
    fields: [concessionEvaluations.contractId],
    references: [concessionContracts.id]
  }),
  evaluator: one(users, {
    fields: [concessionEvaluations.evaluatorId],
    references: [users.id]
  }),
  sanctions: many(concessionSanctions)
}));

// Relaciones para sanciones de concesiones
export const concessionSanctionsRelations = relations(concessionSanctions, ({ one }) => ({
  contract: one(concessionContracts, {
    fields: [concessionSanctions.contractId],
    references: [concessionContracts.id]
  }),
  evaluation: one(concessionEvaluations, {
    fields: [concessionSanctions.evaluationId],
    references: [concessionEvaluations.id]
  })
}));

// ============ CATÁLOGO DE PROVEEDORES ============
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  businessName: varchar("business_name", { length: 200 }),
  taxId: varchar("tax_id", { length: 20 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  country: varchar("country", { length: 50 }).default('México'),
  providerType: varchar("provider_type", { length: 50 }), // servicios, productos, construcción, etc.
  paymentTerms: varchar("payment_terms", { length: 100 }), // 30 días, contado, etc.
  bankAccount: varchar("bank_account", { length: 50 }),
  bank: varchar("bank", { length: 100 }),
  website: varchar("website", { length: 200 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default('activo'),
  rating: integer("rating").default(5), // 1-5 estrellas
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  code: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
});

// ============ CATÁLOGO DE INGRESOS ============
export const incomeRecords = pgTable("income_records", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  categoryId: integer("category_id").notNull(),
  subcategoryId: integer("subcategory_id"),
  description: text("description").notNull(),
  source: varchar("source", { length: 200 }), // fuente del ingreso: empresa, gobierno, etc.
  referenceNumber: varchar("reference_number", { length: 50 }), // número de referencia o folio
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('MXN'),
  incomeDate: date("income_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }), // efectivo, transferencia, cheque, etc.
  bankAccount: varchar("bank_account", { length: 50 }),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('0.00'),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default('0.00'),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }),
  parkId: integer("park_id"),
  projectId: integer("project_id"),
  notes: text("notes"),
  attachments: json("attachments").$type<string[]>(),
  status: varchar("status", { length: 20 }).notNull().default('registrado'),
  verifiedBy: integer("verified_by"),
  verifiedAt: timestamp("verified_at"),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type IncomeRecord = typeof incomeRecords.$inferSelect;
export type InsertIncomeRecord = typeof incomeRecords.$inferInsert;

export const insertIncomeRecordSchema = createInsertSchema(incomeRecords).omit({
  id: true,
  code: true,
  netAmount: true,
  verifiedBy: true,
  verifiedAt: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
});

// Relaciones para las concesiones
export const concessionsRelations = relations(concessions, ({ one }) => ({
  park: one(parks, {
    fields: [concessions.parkId],
    references: [parks.id]
  }),
  concessionType: one(concessionTypes, {
    fields: [concessions.concessionTypeId],
    references: [concessionTypes.id]
  })
}));

// Relaciones para proveedores
export const providersRelations = relations(providers, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [providers.createdById],
    references: [users.id]
  })
}));

// Relaciones para registros de ingresos
export const incomeRecordsRelations = relations(incomeRecords, ({ one }) => ({
  park: one(parks, {
    fields: [incomeRecords.parkId],
    references: [parks.id]
  }),
  createdBy: one(users, {
    fields: [incomeRecords.createdById],
    references: [users.id]
  }),
  verifier: one(users, {
    fields: [incomeRecords.verifiedBy],
    references: [users.id]
  })
}));

// Relaciones para amenidades
export const amenitiesRelations = relations(amenities, ({ many }) => ({
  parkAmenities: many(parkAmenities)
}));

// ============ MÓDULO DE ACTIVOS ============

// Tabla de categorías de activos
export const assetCategories = pgTable("asset_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // Nombre del icono a mostrar en la UI
  color: text("color"), // Color asociado a la categoría para visualización 
  parentId: integer("parent_id"), // Para categorías jerárquicas
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabla principal de activos
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  serialNumber: text("serial_number"), // Número de serie o identificador único del activo
  categoryId: integer("category_id").notNull(),
  parkId: integer("park_id").notNull(), // Parque donde se encuentra el activo
  amenityId: integer("amenity_id"), // Amenidad donde se encuentra el activo (opcional)
  locationDescription: text("location_description"), // Descripción textual de la ubicación
  latitude: text("latitude"), // Coordenadas para ubicación exacta
  longitude: text("longitude"),
  acquisitionDate: date("acquisition_date"), // Fecha de adquisición
  acquisitionCost: decimal("acquisition_cost", { precision: 10, scale: 2 }), // Costo de adquisición
  currentValue: decimal("current_value", { precision: 10, scale: 2 }), // Valor actual después de depreciación
  manufacturer: text("manufacturer"), // Fabricante
  model: text("model"), // Modelo
  status: text("status").notNull().default("active"), // active, maintenance, damaged, retired
  condition: text("condition").notNull().default("good"), // excellent, good, fair, poor
  maintenanceFrequency: text("maintenance_frequency"), // daily, weekly, monthly, quarterly, yearly
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  expectedLifespan: integer("expected_lifespan"), // Vida útil esperada en meses
  notes: text("notes"),
  qrCode: text("qr_code"), // URL o identificador del código QR para escaneo
  responsiblePersonId: integer("responsible_person_id"), // Persona responsable del activo
  photos: text("photos").array(), // URLs de fotos del activo
  documents: text("documents").array(), // URLs de documentos relacionados
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabla de mantenimientos de activos
export const assetMaintenances = pgTable("asset_maintenances", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  maintenanceType: text("maintenance_type").notNull(), // preventive, corrective, emergency
  description: text("description").notNull(),
  date: date("date"), // Fixed to match actual database column
  performedBy: text("performed_by"), // Nombre del técnico o empresa
  performerId: integer("performer_id"), // ID del técnico
  cost: decimal("cost", { precision: 10, scale: 2 }),
  findings: text("findings"), // Hallazgos
  actions: text("actions"), // Acciones realizadas
  nextMaintenanceDate: date("next_maintenance_date"), // Próximo mantenimiento
  photos: text("photos").array(), // Fotos
  status: text("status").notNull().default("completed"), // completed, scheduled, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabla de asignaciones de activos
export const assetAssignments = pgTable("asset_assignments", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  instructorId: integer("instructor_id"), // Instructor responsable
  activityId: integer("activity_id"), // Actividad donde se usa el activo
  assignmentDate: date("assignment_date").notNull(),
  returnDate: date("return_date"),
  purpose: text("purpose"), // Propósito de la asignación
  condition: text("condition").notNull().default("good"), // Estado al momento de asignación
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, returned, overdue
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabla de imágenes de activos
export const assetImages = pgTable("asset_images", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  imageUrl: text("image_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"), // Tamaño en bytes
  mimeType: text("mime_type").notNull(),
  caption: text("caption"),
  isPrimary: boolean("is_primary").notNull().default(false),
  uploadedById: integer("uploaded_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tipos exportados para activos
export type AssetCategory = typeof assetCategories.$inferSelect;
export type InsertAssetCategory = typeof assetCategories.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

export type AssetMaintenance = typeof assetMaintenances.$inferSelect;
export type InsertAssetMaintenance = typeof assetMaintenances.$inferInsert;

export type AssetAssignment = typeof assetAssignments.$inferSelect;
export type InsertAssetAssignment = typeof assetAssignments.$inferInsert;

export type AssetImage = typeof assetImages.$inferSelect;
export type InsertAssetImage = typeof assetImages.$inferInsert;

// Esquemas de inserción para activos
export const insertAssetCategorySchema = createInsertSchema(assetCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAssetMaintenanceSchema = createInsertSchema(assetMaintenances).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAssetAssignmentSchema = createInsertSchema(assetAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAssetImageSchema = createInsertSchema(assetImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Relaciones para activos
export const assetCategoriesRelations = relations(assetCategories, ({ many, one }) => ({
  assets: many(assets),
  parent: one(assetCategories, {
    fields: [assetCategories.parentId],
    references: [assetCategories.id]
  }),
  children: many(assetCategories)
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  category: one(assetCategories, {
    fields: [assets.categoryId],
    references: [assetCategories.id]
  }),
  park: one(parks, {
    fields: [assets.parkId],
    references: [parks.id]
  }),
  amenity: one(amenities, {
    fields: [assets.amenityId],
    references: [amenities.id]
  }),
  responsiblePerson: one(users, {
    fields: [assets.responsiblePersonId],
    references: [users.id]
  }),
  maintenances: many(assetMaintenances),
  assignments: many(assetAssignments),
  images: many(assetImages)
}));

export const assetMaintenancesRelations = relations(assetMaintenances, ({ one }) => ({
  asset: one(assets, {
    fields: [assetMaintenances.assetId],
    references: [assets.id]
  })
}));

export const assetImagesRelations = relations(assetImages, ({ one }) => ({
  asset: one(assets, {
    fields: [assetImages.assetId],
    references: [assets.id]
  }),
  uploadedBy: one(users, {
    fields: [assetImages.uploadedById],
    references: [users.id]
  })
}));

export const assetAssignmentsRelations = relations(assetAssignments, ({ one }) => ({
  asset: one(assets, {
    fields: [assetAssignments.assetId],
    references: [assets.id]
  }),
  instructor: one(instructors, {
    fields: [assetAssignments.instructorId],
    references: [instructors.id]
  }),
  activity: one(activities, {
    fields: [assetAssignments.activityId],
    references: [activities.id]
  })
}));

// ========== MÓDULO DE RECIBOS DE NÓMINA ==========

// Estados de recibos
export const payrollReceiptStatusEnum = pgEnum("payroll_receipt_status", [
  "draft",
  "generated", 
  "sent",
  "confirmed"
]);

// Tabla de recibos de nómina
export const payrollReceipts = pgTable("payroll_receipts", {
  id: serial("id").primaryKey(),
  periodId: integer("period_id").notNull().references(() => payrollPeriods.id),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull().unique(),
  generatedDate: timestamp("generated_date").defaultNow(),
  payDate: date("pay_date").notNull(),
  
  // Datos del empleado al momento de la generación
  employeeName: varchar("employee_name", { length: 200 }).notNull(),
  employeePosition: varchar("employee_position", { length: 100 }),
  employeeDepartment: varchar("employee_department", { length: 100 }),
  employeeRFC: varchar("employee_rfc", { length: 20 }),
  
  // Totales del recibo
  totalGross: decimal("total_gross", { precision: 15, scale: 2 }).notNull(),
  totalDeductions: decimal("total_deductions", { precision: 15, scale: 2 }).notNull(),
  totalNet: decimal("total_net", { precision: 15, scale: 2 }).notNull(),
  
  // Archivo PDF
  pdfFileName: varchar("pdf_file_name", { length: 255 }),
  pdfPath: text("pdf_path"),
  pdfGenerated: boolean("pdf_generated").default(false),
  
  // Estado y metadatos
  status: payrollReceiptStatusEnum("status").default("draft"),
  notes: text("notes"),
  generatedById: integer("generated_by_id").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Detalles de conceptos en recibos
export const payrollReceiptDetails = pgTable("payroll_receipt_details", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").notNull().references(() => payrollReceipts.id),
  conceptId: integer("concept_id").notNull().references(() => payrollConcepts.id),
  
  // Datos del concepto al momento de la generación
  conceptCode: varchar("concept_code", { length: 20 }).notNull(),
  conceptName: varchar("concept_name", { length: 100 }).notNull(),
  conceptType: varchar("concept_type", { length: 20 }).notNull(), // income, deduction, benefit
  conceptCategory: varchar("concept_category", { length: 50 }).notNull(),
  
  // Valores calculados
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00"),
  rate: decimal("rate", { precision: 15, scale: 2 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  
  // Metadatos
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Schemas de validación para recibos
export const insertPayrollReceiptSchema = createInsertSchema(payrollReceipts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPayrollReceiptDetailSchema = createInsertSchema(payrollReceiptDetails).omit({
  id: true,
  createdAt: true
});

export type InsertPayrollReceipt = z.infer<typeof insertPayrollReceiptSchema>;
export type PayrollReceipt = typeof payrollReceipts.$inferSelect;
export type InsertPayrollReceiptDetail = z.infer<typeof insertPayrollReceiptDetailSchema>;
export type PayrollReceiptDetail = typeof payrollReceiptDetails.$inferSelect;

// Relaciones para recibos de nómina
export const payrollReceiptsRelations = relations(payrollReceipts, ({ one, many }) => ({
  period: one(payrollPeriods, {
    fields: [payrollReceipts.periodId],
    references: [payrollPeriods.id]
  }),
  employee: one(employees, {
    fields: [payrollReceipts.employeeId],
    references: [employees.id]
  }),
  generatedBy: one(users, {
    fields: [payrollReceipts.generatedById],
    references: [users.id]
  }),
  details: many(payrollReceiptDetails)
}));

export const payrollReceiptDetailsRelations = relations(payrollReceiptDetails, ({ one }) => ({
  receipt: one(payrollReceipts, {
    fields: [payrollReceiptDetails.receiptId],
    references: [payrollReceipts.id]
  }),
  concept: one(payrollConcepts, {
    fields: [payrollReceiptDetails.conceptId],
    references: [payrollConcepts.id]
  })
}));

// ========== MÓDULO DE VACACIONES Y PERMISOS ==========

// Tipos de solicitudes
export const requestTypeEnum = pgEnum("request_type", [
  "vacation",        // Vacaciones
  "permission",      // Permisos
  "sick_leave",      // Incapacidad médica
  "maternity_leave", // Licencia de maternidad
  "paternity_leave", // Licencia de paternidad
  "personal_leave",  // Licencia personal
  "bereavement",     // Luto
  "study_leave",     // Licencia de estudios
  "unpaid_leave"     // Licencia sin goce de sueldo
]);

// Estados de solicitudes
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled"
]);

// Tabla de solicitudes de vacaciones, permisos e incapacidades
export const timeOffRequests = pgTable("time_off_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  requestType: requestTypeEnum("request_type").notNull(),
  
  // Fechas
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  requestedDays: decimal("requested_days", { precision: 5, scale: 2 }).notNull(),
  
  // Detalles
  reason: text("reason").notNull(),
  description: text("description"),
  medicalCertificate: text("medical_certificate"), // URL del certificado médico
  attachments: text("attachments").array(), // URLs de archivos adjuntos
  
  // Aprobación
  status: requestStatusEnum("status").default("pending"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  
  // Metadatos
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla de balance de vacaciones por empleado
export const vacationBalances = pgTable("vacation_balances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  year: integer("year").notNull(),
  
  // Días disponibles
  totalDays: decimal("total_days", { precision: 5, scale: 2 }).notNull(), // Días totales por año
  usedDays: decimal("used_days", { precision: 5, scale: 2 }).default("0.00"), // Días utilizados
  pendingDays: decimal("pending_days", { precision: 5, scale: 2 }).default("0.00"), // Días pendientes de aprobación
  availableDays: decimal("available_days", { precision: 5, scale: 2 }).notNull(), // Días disponibles
  
  // Fechas
  startDate: date("start_date").notNull(), // Inicio del período
  endDate: date("end_date").notNull(), // Fin del período
  
  // Metadatos
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ========== MÓDULO DE CONTROL DE HORAS TRABAJADAS ==========

// Tipos de registros de tiempo
export const timeRecordTypeEnum = pgEnum("time_record_type", [
  "check_in",        // Entrada
  "check_out",       // Salida
  "break_start",     // Inicio de descanso
  "break_end",       // Fin de descanso
  "overtime_start",  // Inicio de horas extra
  "overtime_end"     // Fin de horas extra
]);

// Tabla de registros de tiempo (check-in/check-out)
export const timeRecords = pgTable("time_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  
  // Datos del registro
  recordType: timeRecordTypeEnum("record_type").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  date: date("date").notNull(),
  
  // Ubicación
  latitude: text("latitude"),
  longitude: text("longitude"),
  location: text("location"), // Descripción de la ubicación
  
  // Metadatos
  notes: text("notes"),
  isManualEntry: boolean("is_manual_entry").default(false),
  manualReason: text("manual_reason"),
  registeredBy: integer("registered_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Tabla de resumen diario de horas trabajadas
export const dailyTimeSheets = pgTable("daily_time_sheets", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  date: date("date").notNull(),
  
  // Horarios
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  
  // Horas calculadas
  regularHours: decimal("regular_hours", { precision: 5, scale: 2 }).default("0.00"),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0.00"),
  breakHours: decimal("break_hours", { precision: 5, scale: 2 }).default("0.00"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }).default("0.00"),
  
  // Estado del día
  isLate: boolean("is_late").default(false),
  lateMinutes: integer("late_minutes").default(0),
  isEarlyLeave: boolean("is_early_leave").default(false),
  earlyLeaveMinutes: integer("early_leave_minutes").default(0),
  isAbsent: boolean("is_absent").default(false),
  
  // Justificaciones
  absenceReason: text("absence_reason"),
  lateReason: text("late_reason"),
  isJustified: boolean("is_justified").default(false),
  
  // Metadatos
  notes: text("notes"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla de horarios de trabajo por empleado
export const workSchedules = pgTable("work_schedules", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  
  // Días de la semana
  monday: boolean("monday").default(true),
  tuesday: boolean("tuesday").default(true),
  wednesday: boolean("wednesday").default(true),
  thursday: boolean("thursday").default(true),
  friday: boolean("friday").default(true),
  saturday: boolean("saturday").default(false),
  sunday: boolean("sunday").default(false),
  
  // Horarios
  startTime: text("start_time").notNull(), // Formato HH:MM
  endTime: text("end_time").notNull(), // Formato HH:MM
  breakStartTime: text("break_start_time"), // Hora de inicio de descanso
  breakEndTime: text("break_end_time"), // Hora de fin de descanso
  
  // Configuración
  regularHoursPerDay: decimal("regular_hours_per_day", { precision: 5, scale: 2 }).default("8.00"),
  toleranceMinutes: integer("tolerance_minutes").default(15), // Tolerancia para llegadas tarde
  
  // Fechas de vigencia
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  
  // Metadatos
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Schemas de validación para vacaciones y permisos
export const insertTimeOffRequestSchema = createInsertSchema(timeOffRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertVacationBalanceSchema = createInsertSchema(vacationBalances).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTimeRecordSchema = createInsertSchema(timeRecords).omit({
  id: true,
  createdAt: true
});

export const insertDailyTimeSheetSchema = createInsertSchema(dailyTimeSheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertWorkScheduleSchema = createInsertSchema(workSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Tipos TypeScript
export type InsertTimeOffRequest = z.infer<typeof insertTimeOffRequestSchema>;
export type TimeOffRequest = typeof timeOffRequests.$inferSelect;
export type InsertVacationBalance = z.infer<typeof insertVacationBalanceSchema>;
export type VacationBalance = typeof vacationBalances.$inferSelect;
export type InsertTimeRecord = z.infer<typeof insertTimeRecordSchema>;
export type TimeRecord = typeof timeRecords.$inferSelect;
export type InsertDailyTimeSheet = z.infer<typeof insertDailyTimeSheetSchema>;
export type DailyTimeSheet = typeof dailyTimeSheets.$inferSelect;
export type InsertWorkSchedule = z.infer<typeof insertWorkScheduleSchema>;
export type WorkSchedule = typeof workSchedules.$inferSelect;

// Relaciones para vacaciones y permisos
export const timeOffRequestsRelations = relations(timeOffRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [timeOffRequests.employeeId],
    references: [employees.id]
  }),
  approver: one(users, {
    fields: [timeOffRequests.approvedBy],
    references: [users.id]
  })
}));

export const vacationBalancesRelations = relations(vacationBalances, ({ one }) => ({
  employee: one(employees, {
    fields: [vacationBalances.employeeId],
    references: [employees.id]
  })
}));

// Relaciones para control de horas
export const timeRecordsRelations = relations(timeRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [timeRecords.employeeId],
    references: [employees.id]
  }),
  registeredBy: one(users, {
    fields: [timeRecords.registeredBy],
    references: [users.id]
  })
}));

export const dailyTimeSheetsRelations = relations(dailyTimeSheets, ({ one }) => ({
  employee: one(employees, {
    fields: [dailyTimeSheets.employeeId],
    references: [employees.id]
  }),
  approver: one(users, {
    fields: [dailyTimeSheets.approvedBy],
    references: [users.id]
  })
}));

export const workSchedulesRelations = relations(workSchedules, ({ one }) => ({
  employee: one(employees, {
    fields: [workSchedules.employeeId],
    references: [employees.id]
  }),
  createdBy: one(users, {
    fields: [workSchedules.createdBy],
    references: [users.id]
  })
}));

// ========== MÓDULO DE COBRO HÍBRIDO PARA CONCESIONES ==========

// Enums para el sistema de cobro híbrido
export const paymentFrequencyEnum = pgEnum("payment_frequency", [
  "monthly",    // Mensual
  "quarterly",  // Trimestral
  "biannual",   // Semestral
  "annual"      // Anual
]);

export const chargeTypeEnum = pgEnum("charge_type", [
  "fixed",         // Pago fijo periódico
  "percentage",    // Porcentaje de ingresos
  "per_unit",      // Por unidad de servicio
  "per_m2",        // Por metro cuadrado
  "minimum_guarantee" // Garantía mínima
]);

export const bonusTypeEnum = pgEnum("bonus_type", [
  "bonus",    // Bonificación
  "penalty"   // Penalización
]);

export const bonusFrequencyEnum = pgEnum("bonus_frequency", [
  "once",     // Una sola vez
  "monthly",  // Mensual
  "annual"    // Anual
]);

// Tabla principal de configuración de cobro para contratos
export const contractPaymentConfigs = pgTable("contract_payment_configs", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => concessionContracts.id),
  
  // Configuraciones generales
  hasFixedPayment: boolean("has_fixed_payment").default(false),
  hasPercentagePayment: boolean("has_percentage_payment").default(false),
  hasPerUnitPayment: boolean("has_per_unit_payment").default(false),
  hasSpacePayment: boolean("has_space_payment").default(false),
  hasMinimumGuarantee: boolean("has_minimum_guarantee").default(false),
  
  // Garantía mínima mensual
  minimumGuaranteeAmount: decimal("minimum_guarantee_amount", { precision: 10, scale: 2 }),
  
  // Metadatos
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla de cargos específicos (pago fijo, porcentaje, etc.)
export const contractCharges = pgTable("contract_charges", {
  id: serial("id").primaryKey(),
  paymentConfigId: integer("payment_config_id").notNull().references(() => contractPaymentConfigs.id),
  
  // Tipo de cargo
  chargeType: chargeTypeEnum("charge_type").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Configuración del cargo
  fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }),
  percentage: decimal("percentage", { precision: 5, scale: 2 }), // Para porcentajes (ej: 15.50%)
  perUnitAmount: decimal("per_unit_amount", { precision: 10, scale: 2 }),
  perM2Amount: decimal("per_m2_amount", { precision: 10, scale: 2 }),
  
  // Frecuencia de cobro
  frequency: paymentFrequencyEnum("frequency").notNull(),
  
  // Configuraciones adicionales
  unitType: varchar("unit_type", { length: 50 }), // "boleto", "bicicleta", "alimento", etc.
  spaceM2: decimal("space_m2", { precision: 8, scale: 2 }), // Metros cuadrados ocupados
  
  // Estado
  isActive: boolean("is_active").default(true),
  startDate: date("start_date"),
  endDate: date("end_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla de registro de inversión inicial
export const contractInvestments = pgTable("contract_investments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => concessionContracts.id),
  
  // Detalles de la inversión
  description: text("description").notNull(),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }).notNull(),
  actualValue: decimal("actual_value", { precision: 12, scale: 2 }),
  
  // Fechas
  deadlineDate: date("deadline_date").notNull(),
  completedDate: date("completed_date"),
  
  // Amortización
  isAmortizable: boolean("is_amortizable").default(false),
  amortizationMonths: integer("amortization_months"),
  monthlyAmortization: decimal("monthly_amortization", { precision: 10, scale: 2 }),
  
  // Estado
  status: varchar("status", { length: 20 }).default("pending"), // pending, in_progress, completed, overdue
  
  // Documentación
  documentation: text("documentation"),
  attachments: jsonb("attachments"), // URLs de archivos adjuntos
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla de bonificaciones y penalizaciones por desempeño
export const contractBonuses = pgTable("contract_bonuses", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => concessionContracts.id),
  
  // Tipo y descripción
  bonusType: bonusTypeEnum("bonus_type").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  
  // Configuración financiera
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: bonusFrequencyEnum("frequency").notNull(),
  
  // Condiciones de aplicación
  conditions: text("conditions"), // Condiciones específicas para aplicar
  evaluationCriteria: jsonb("evaluation_criteria"), // Criterios de evaluación
  
  // Estado
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla de servicios autorizados para el concesionario
export const contractAuthorizedServices = pgTable("contract_authorized_services", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => concessionContracts.id),
  
  // Servicio
  serviceName: varchar("service_name", { length: 100 }).notNull(),
  serviceDescription: text("service_description"),
  serviceCategory: varchar("service_category", { length: 50 }), // "comida", "tours", "renta", etc.
  
  // Configuración de precios
  canChargePublic: boolean("can_charge_public").default(true),
  maxPublicRate: decimal("max_public_rate", { precision: 10, scale: 2 }),
  rateDescription: text("rate_description"), // Descripción de la tarifa
  
  // Restricciones
  restrictions: text("restrictions"),
  requiredPermits: text("required_permits"),
  
  // Estado
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla de reportes mensuales de ingresos del concesionario
export const contractIncomeReports = pgTable("contract_income_reports", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => concessionContracts.id),
  
  // Período del reporte
  reportMonth: integer("report_month").notNull(), // 1-12
  reportYear: integer("report_year").notNull(),
  
  // Ingresos reportados
  grossIncome: decimal("gross_income", { precision: 12, scale: 2 }).notNull(),
  netIncome: decimal("net_income", { precision: 12, scale: 2 }),
  
  // Detalles por servicio
  serviceBreakdown: jsonb("service_breakdown"), // Desglose por tipo de servicio
  unitsSold: jsonb("units_sold"), // Unidades vendidas por tipo
  
  // Documentación de soporte
  supportingDocuments: jsonb("supporting_documents"), // URLs de facturas, reportes, etc.
  notes: text("notes"),
  
  // Control de calidad
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  
  // Estado
  status: varchar("status", { length: 20 }).default("submitted"), // submitted, under_review, approved, rejected
  
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla de cálculo de pagos mensuales
export const contractMonthlyPayments = pgTable("contract_monthly_payments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => concessionContracts.id),
  incomeReportId: integer("income_report_id").references(() => contractIncomeReports.id),
  
  // Período
  paymentMonth: integer("payment_month").notNull(),
  paymentYear: integer("payment_year").notNull(),
  
  // Cálculos de pago
  fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }).default("0.00"),
  percentageAmount: decimal("percentage_amount", { precision: 10, scale: 2 }).default("0.00"),
  perUnitAmount: decimal("per_unit_amount", { precision: 10, scale: 2 }).default("0.00"),
  spaceAmount: decimal("space_amount", { precision: 10, scale: 2 }).default("0.00"),
  
  // Subtotal antes de ajustes
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  
  // Aplicación de garantía mínima
  minimumGuaranteeApplied: boolean("minimum_guarantee_applied").default(false),
  minimumGuaranteeAdjustment: decimal("minimum_guarantee_adjustment", { precision: 10, scale: 2 }).default("0.00"),
  
  // Bonificaciones y penalizaciones
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).default("0.00"),
  penaltyAmount: decimal("penalty_amount", { precision: 10, scale: 2 }).default("0.00"),
  
  // Amortización de inversión
  investmentAmortization: decimal("investment_amortization", { precision: 10, scale: 2 }).default("0.00"),
  
  // Total final
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Estado del pago
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, paid, overdue, partial
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  paidDate: date("paid_date"),
  
  // Detalles del cálculo
  calculationDetails: jsonb("calculation_details"), // JSON con el desglose completo
  notes: text("notes"),
  
  // Metadatos
  calculatedBy: integer("calculated_by").references(() => users.id),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Schemas de validación para el sistema de cobro híbrido
export const insertContractPaymentConfigSchema = createInsertSchema(contractPaymentConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContractChargeSchema = createInsertSchema(contractCharges).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContractInvestmentSchema = createInsertSchema(contractInvestments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContractBonusSchema = createInsertSchema(contractBonuses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContractAuthorizedServiceSchema = createInsertSchema(contractAuthorizedServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContractIncomeReportSchema = createInsertSchema(contractIncomeReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true
});

export const insertContractMonthlyPaymentSchema = createInsertSchema(contractMonthlyPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  calculatedAt: true
});

// Tipos TypeScript para el sistema de cobro híbrido
export type ContractPaymentConfig = typeof contractPaymentConfigs.$inferSelect;
export type InsertContractPaymentConfig = z.infer<typeof insertContractPaymentConfigSchema>;

export type ContractCharge = typeof contractCharges.$inferSelect;
export type InsertContractCharge = z.infer<typeof insertContractChargeSchema>;

export type ContractInvestment = typeof contractInvestments.$inferSelect;
export type InsertContractInvestment = z.infer<typeof insertContractInvestmentSchema>;

export type ContractBonus = typeof contractBonuses.$inferSelect;
export type InsertContractBonus = z.infer<typeof insertContractBonusSchema>;

export type ContractAuthorizedService = typeof contractAuthorizedServices.$inferSelect;
export type InsertContractAuthorizedService = z.infer<typeof insertContractAuthorizedServiceSchema>;

export type ContractIncomeReport = typeof contractIncomeReports.$inferSelect;
export type InsertContractIncomeReport = z.infer<typeof insertContractIncomeReportSchema>;

export type ContractMonthlyPayment = typeof contractMonthlyPayments.$inferSelect;
export type InsertContractMonthlyPayment = z.infer<typeof insertContractMonthlyPaymentSchema>;

// Relaciones para el sistema de cobro híbrido
export const contractPaymentConfigsRelations = relations(contractPaymentConfigs, ({ one, many }) => ({
  contract: one(concessionContracts, {
    fields: [contractPaymentConfigs.contractId],
    references: [concessionContracts.id]
  }),
  charges: many(contractCharges)
}));

export const contractChargesRelations = relations(contractCharges, ({ one }) => ({
  paymentConfig: one(contractPaymentConfigs, {
    fields: [contractCharges.paymentConfigId],
    references: [contractPaymentConfigs.id]
  })
}));

export const contractInvestmentsRelations = relations(contractInvestments, ({ one }) => ({
  contract: one(concessionContracts, {
    fields: [contractInvestments.contractId],
    references: [concessionContracts.id]
  })
}));

export const contractBonusesRelations = relations(contractBonuses, ({ one }) => ({
  contract: one(concessionContracts, {
    fields: [contractBonuses.contractId],
    references: [concessionContracts.id]
  })
}));

export const contractAuthorizedServicesRelations = relations(contractAuthorizedServices, ({ one }) => ({
  contract: one(concessionContracts, {
    fields: [contractAuthorizedServices.contractId],
    references: [concessionContracts.id]
  })
}));

export const contractIncomeReportsRelations = relations(contractIncomeReports, ({ one, many }) => ({
  contract: one(concessionContracts, {
    fields: [contractIncomeReports.contractId],
    references: [concessionContracts.id]
  }),
  verifiedByUser: one(users, {
    fields: [contractIncomeReports.verifiedBy],
    references: [users.id]
  }),
  monthlyPayments: many(contractMonthlyPayments)
}));

export const contractMonthlyPaymentsRelations = relations(contractMonthlyPayments, ({ one }) => ({
  contract: one(concessionContracts, {
    fields: [contractMonthlyPayments.contractId],
    references: [concessionContracts.id]
  }),
  incomeReport: one(contractIncomeReports, {
    fields: [contractMonthlyPayments.incomeReportId],
    references: [contractIncomeReports.id]
  }),
  calculatedByUser: one(users, {
    fields: [contractMonthlyPayments.calculatedBy],
    references: [users.id]
  })
}));

// Tipos TypeScript para el sistema de cobro híbrido
export type ContractPaymentConfig = typeof contractPaymentConfigs.$inferSelect;
export type InsertContractPaymentConfig = z.infer<typeof insertContractPaymentConfigSchema>;
export type ContractCharge = typeof contractCharges.$inferSelect;
export type InsertContractCharge = z.infer<typeof insertContractChargeSchema>;
export type ContractInvestment = typeof contractInvestments.$inferSelect;
export type InsertContractInvestment = z.infer<typeof insertContractInvestmentSchema>;
export type ContractBonus = typeof contractBonuses.$inferSelect;
export type InsertContractBonus = z.infer<typeof insertContractBonusSchema>;
export type ContractAuthorizedService = typeof contractAuthorizedServices.$inferSelect;
export type InsertContractAuthorizedService = z.infer<typeof insertContractAuthorizedServiceSchema>;
export type ContractIncomeReport = typeof contractIncomeReports.$inferSelect;
export type InsertContractIncomeReport = z.infer<typeof insertContractIncomeReportSchema>;
export type ContractMonthlyPayment = typeof contractMonthlyPayments.$inferSelect;
export type InsertContractMonthlyPayment = z.infer<typeof insertContractMonthlyPaymentSchema>;