import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, jsonb, date, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  url: text("url").notNull(),
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
  quantity: integer("quantity").default(1),
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

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  activityType: text("activity_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  capacity: integer("capacity"),
  registrationRequired: boolean("registration_required").default(false),
  status: text("status").default("active"),
  imageUrl: text("image_url"),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
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
  // surfaceArea: decimal("surface_area"), // Comentado porque la columna no existe en la BD
  openingHours: text("opening_hours"),
  // closingHours: text("closing_hours"), // Comentado porque la columna no existe en la BD
  // active: boolean("active").notNull().default(true), // Comentado porque la columna no existe en la BD
  // mainImageUrl: text("main_image_url"), // Comentado porque la columna no existe en la BD
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
  category: one(incomeCategories, {
    fields: [incomeRecords.categoryId],
    references: [incomeCategories.id]
  }),
  subcategory: one(incomeSubcategories, {
    fields: [incomeRecords.subcategoryId],
    references: [incomeSubcategories.id]
  }),
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