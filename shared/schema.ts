import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, jsonb, date, decimal } from "drizzle-orm/pg-core";
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
  area: text("area"), // in square meters or hectares
  foundationYear: integer("foundation_year"),
  administrator: text("administrator"),
  conservationStatus: text("conservation_status"),
  regulationUrl: text("regulation_url"), // URL to PDF
  videoUrl: text("video_url"), // URL de YouTube
  openingHours: text("opening_hours"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const parkImages = pgTable("park_images", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  iconType: text("icon_type").default("system").notNull(), // "system" o "custom"
  customIconUrl: text("custom_icon_url"), // URL de la imagen personalizada
});

export const parkAmenities = pgTable("park_amenities", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  amenityId: integer("amenity_id").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size"),
  fileType: text("file_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabla para ubicaciones específicas dentro de un parque
export const parkLocations = pgTable("park_locations", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // área, zona, instalación, etc.
  amenityId: integer("amenity_id"), // relación opcional con amenidades
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Catálogo de actividades predefinidas
export const activityCatalog = pgTable("activity_catalog", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  duration: integer("duration").notNull(), // duración en minutos
  capacity: integer("capacity"),
  materials: text("materials"),
  staffRequired: integer("staff_required"),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  locationId: integer("location_id"), // relación opcional con ubicación específica
  catalogItemId: integer("catalog_item_id"), // relación opcional con el catálogo de actividades
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  category: text("category"),
  location: text("location"), // mantenemos por compatibilidad
  capacity: integer("capacity"), // número máximo de participantes
  enrollmentCount: integer("enrollment_count").default(0), // número actual de inscritos
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  content: text("content").notNull(),
  rating: integer("rating"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  reporterName: text("reporter_name").notNull(),
  reporterEmail: text("reporter_email"),
  reporterPhone: text("reporter_phone"),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// INSERT SCHEMAS
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertMunicipalitySchema = createInsertSchema(municipalities).omit({ id: true, createdAt: true });
export const insertParkSchema = createInsertSchema(parks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertParkImageSchema = createInsertSchema(parkImages).omit({ id: true, createdAt: true });
export const insertAmenitySchema = createInsertSchema(amenities).omit({ id: true });
export const insertParkAmenitySchema = createInsertSchema(parkAmenities).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertParkLocationSchema = createInsertSchema(parkLocations).omit({ id: true, createdAt: true });
export const insertActivityCatalogSchema = createInsertSchema(activityCatalog).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, isApproved: true });
export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true, createdAt: true, updatedAt: true, status: true });
// Asset schemas will be defined later

// TYPES
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Municipality = typeof municipalities.$inferSelect;
export type InsertMunicipality = z.infer<typeof insertMunicipalitySchema>;

export type Park = typeof parks.$inferSelect;
export type InsertPark = z.infer<typeof insertParkSchema>;

export type ParkImage = typeof parkImages.$inferSelect;
export type InsertParkImage = z.infer<typeof insertParkImageSchema>;

export type Amenity = typeof amenities.$inferSelect;
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;

export type ParkAmenity = typeof parkAmenities.$inferSelect;
export type InsertParkAmenity = z.infer<typeof insertParkAmenitySchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type ParkLocation = typeof parkLocations.$inferSelect;
export type InsertParkLocation = z.infer<typeof insertParkLocationSchema>;

export type ActivityCatalogItem = typeof activityCatalog.$inferSelect;
export type InsertActivityCatalogItem = z.infer<typeof insertActivityCatalogSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

// Asset types will be defined in a separate file

// PARK TYPES
export const PARK_TYPES = [
  { value: "barrial", label: "Barrial" },
  { value: "vecinal", label: "Vecinal" },
  { value: "lineal", label: "Lineal" },
  { value: "metropolitano", label: "Metropolitano" },
  { value: "ecologico", label: "Ecológico" },
  { value: "botanico", label: "Botánico" },
  { value: "deportivo", label: "Deportivo" },
] as const;

// AMENITY CATEGORIES
export const AMENITY_CATEGORIES = [
  "recreación",
  "deportes",
  "servicios",
  "accesibilidad",
  "infraestructura",
  "naturaleza",
] as const;

// PREDEFINED AMENITIES
export const DEFAULT_AMENITIES = [
  { name: "Juegos infantiles", icon: "playground", category: "recreación" },
  { name: "Baños públicos", icon: "toilet", category: "servicios" },
  { name: "Canchas deportivas", icon: "sportsCourt", category: "deportes" },
  { name: "Ciclovías", icon: "bicycle", category: "deportes" },
  { name: "Zona para mascotas", icon: "pets", category: "recreación" },
  { name: "Rampas para accesibilidad", icon: "accessibility", category: "accesibilidad" },
  { name: "Senderos para caminar", icon: "hiking", category: "recreación" },
  { name: "Estacionamiento", icon: "parking", category: "infraestructura" },
  { name: "Áreas de picnic", icon: "restaurant", category: "recreación" },
  { name: "Fuentes", icon: "water", category: "naturaleza" },
  { name: "Escenarios culturales", icon: "theater", category: "recreación" },
  { name: "Iluminación", icon: "lightbulb", category: "infraestructura" },
  { name: "Seguridad", icon: "security", category: "servicios" },
  { name: "WiFi", icon: "wifi", category: "servicios" },
  { name: "Biciestacionamientos", icon: "bikeParking", category: "infraestructura" },
] as const;

// Extended Park data with amenities and images
// Define relations
export const usersRelations = relations(users, ({ one }) => ({
  municipality: one(municipalities, {
    fields: [users.municipalityId],
    references: [municipalities.id],
  }),
}));

export const municipalitiesRelations = relations(municipalities, ({ many }) => ({
  users: many(users),
  parks: many(parks),
}));

export const parksRelations = relations(parks, ({ one, many }) => ({
  municipality: one(municipalities, {
    fields: [parks.municipalityId],
    references: [municipalities.id],
  }),
  parkImages: many(parkImages),
  parkAmenities: many(parkAmenities),
  documents: many(documents),
  locations: many(parkLocations),
  activities: many(activities),
  comments: many(comments),
  incidents: many(incidents),
}));

export const parkImagesRelations = relations(parkImages, ({ one }) => ({
  park: one(parks, {
    fields: [parkImages.parkId],
    references: [parks.id],
  }),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  parkAmenities: many(parkAmenities),
}));

export const parkAmenitiesRelations = relations(parkAmenities, ({ one }) => ({
  park: one(parks, {
    fields: [parkAmenities.parkId],
    references: [parks.id],
  }),
  amenity: one(amenities, {
    fields: [parkAmenities.amenityId],
    references: [amenities.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  park: one(parks, {
    fields: [documents.parkId],
    references: [parks.id],
  }),
}));

export const parkLocationsRelations = relations(parkLocations, ({ one }) => ({
  park: one(parks, {
    fields: [parkLocations.parkId],
    references: [parks.id],
  }),
  amenity: one(amenities, {
    fields: [parkLocations.amenityId],
    references: [amenities.id],
    relationName: "locationAmenity"
  }),
}));

export const activityCatalogRelations = relations(activityCatalog, ({ many }) => ({
  activities: many(activities, { relationName: "catalogActivities" }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  park: one(parks, {
    fields: [activities.parkId],
    references: [parks.id],
  }),
  location: one(parkLocations, {
    fields: [activities.locationId],
    references: [parkLocations.id],
    relationName: "activityLocation"
  }),
  catalogItem: one(activityCatalog, {
    fields: [activities.catalogItemId],
    references: [activityCatalog.id],
    relationName: "activityCatalogItem"
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  park: one(parks, {
    fields: [comments.parkId],
    references: [parks.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  park: one(parks, {
    fields: [incidents.parkId],
    references: [parks.id],
  }),
}));

// TABLES FOR MODULE: ASSETS are intentionally left out for now

// TABLES FOR MODULE: VOLUNTEERS

// 1. Tabla de Voluntarios
export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  // Actualizado para reflejar la estructura real de la DB
  phoneNumber: text("phone"),
  address: text("address"),
  // birthDate reemplazado por age
  age: integer("age"),
  // Estos campos no existen en la DB actual
  // emergencyContact: text("emergency_contact"),
  // emergencyPhone: text("emergency_phone"),
  email: text("email").notNull(),
  // occupation: text("occupation"),
  availability: text("available_hours"),
  // skills: text("skills"),
  // interests: text("interests"),
  previousExperience: text("previous_experience"),
  // healthConditions: text("health_conditions"),
  // additionalComments: text("additional_comments"),
  status: text("status").default("pending").notNull(),
  // totalHours: integer("total_hours").default(0),
  profileImageUrl: text("profile_image_url"),
  preferredParkId: integer("preferred_park_id"),
  legalConsent: boolean("legal_consent").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // Campos adicionales que existen en la DB
  gender: text("gender"),
  interestAreas: text("interest_areas").array(),
  availableDays: text("available_days").array(),
});

// 2. Tabla de Participación de Voluntarios
export const volunteerParticipations = pgTable("volunteer_participations", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull(),
  activityId: integer("activity_id"),
  parkId: integer("park_id").notNull(),
  activityName: text("activity_name").notNull(),
  activityDate: date("activity_date").notNull(),
  hoursContributed: integer("hours_contributed").notNull(),
  supervisorId: integer("supervisor_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 3. Tabla de Evaluaciones de Voluntarios
export const volunteerEvaluations = pgTable("volunteer_evaluations", {
  id: serial("id").primaryKey(),
  participationId: integer("participation_id").notNull(),
  volunteerId: integer("volunteer_id").notNull(),
  evaluatorId: integer("evaluator_id").notNull(),
  punctuality: integer("punctuality").notNull(), // 1-5
  attitude: integer("attitude").notNull(), // 1-5
  responsibility: integer("responsibility").notNull(), // 1-5
  overallPerformance: integer("overall_performance").notNull(), // 1-5
  comments: text("comments"),
  followUpRequired: boolean("follow_up_required").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 4. Tabla de Reconocimientos
export const volunteerRecognitions = pgTable("volunteer_recognitions", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull(),
  recognitionType: text("recognition_type").notNull(), // diploma, medal, level-upgrade
  level: text("level"), // bronze, silver, gold, platinum
  reason: text("reason").notNull(),
  hoursCompleted: integer("hours_completed"),
  certificateUrl: text("certificate_url"),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  issuedById: integer("issued_by_id").notNull(),
  additionalComments: text("additional_comments"),
});

// Definición de relaciones para voluntarios
export const volunteersRelations = relations(volunteers, ({ one, many }) => ({
  preferredPark: one(parks, {
    fields: [volunteers.preferredParkId],
    references: [parks.id],
  }),
  participations: many(volunteerParticipations),
  evaluations: many(volunteerEvaluations),
  recognitions: many(volunteerRecognitions),
}));

export const volunteerParticipationsRelations = relations(volunteerParticipations, ({ one }) => ({
  volunteer: one(volunteers, {
    fields: [volunteerParticipations.volunteerId],
    references: [volunteers.id],
  }),
  activity: one(activities, {
    fields: [volunteerParticipations.activityId],
    references: [activities.id],
    relationName: "activityParticipation",
  }),
  park: one(parks, {
    fields: [volunteerParticipations.parkId],
    references: [parks.id],
  }),
  supervisor: one(users, {
    fields: [volunteerParticipations.supervisorId],
    references: [users.id],
    relationName: "participationSupervisor",
  }),
}));

export const volunteerEvaluationsRelations = relations(volunteerEvaluations, ({ one }) => ({
  participation: one(volunteerParticipations, {
    fields: [volunteerEvaluations.participationId],
    references: [volunteerParticipations.id],
  }),
  volunteer: one(volunteers, {
    fields: [volunteerEvaluations.volunteerId],
    references: [volunteers.id],
  }),
  evaluator: one(users, {
    fields: [volunteerEvaluations.evaluatorId],
    references: [users.id],
    relationName: "evaluator",
  }),
}));

export const volunteerRecognitionsRelations = relations(volunteerRecognitions, ({ one }) => ({
  volunteer: one(volunteers, {
    fields: [volunteerRecognitions.volunteerId],
    references: [volunteers.id],
  }),
  issuedBy: one(users, {
    fields: [volunteerRecognitions.issuedById],
    references: [users.id],
    relationName: "recognitionIssuer",
  }),
}));

// Esquemas de inserción para el módulo de voluntariado
export const insertVolunteerSchema = createInsertSchema(volunteers)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    status: true 
  })
  .extend({
    fullName: z.string().min(1, "El nombre completo es obligatorio"),
    email: z.string().min(1, "El correo electrónico es obligatorio").email("Ingrese un correo electrónico válido"),
    phoneNumber: z.string().min(1, "El número de teléfono es obligatorio"),
    address: z.string().min(1, "La dirección es obligatoria"),
    birthDate: z.date({required_error: "La fecha de nacimiento es obligatoria"}),
    emergencyContact: z.string().min(1, "El contacto de emergencia es obligatorio"),
    emergencyPhone: z.string().min(1, "El teléfono de emergencia es obligatorio"),
    occupation: z.string().min(1, "La ocupación es obligatoria"),
    availability: z.string().min(1, "La disponibilidad es obligatoria"),
    skills: z.string().min(1, "Las habilidades son obligatorias"),
    interests: z.string().min(1, "Los intereses son obligatorios"),
    previousExperience: z.string().min(1, "La experiencia previa es obligatoria"),
    healthConditions: z.string().min(1, "Las condiciones de salud son obligatorias"),
    legalConsent: z.boolean().refine(val => val === true, {
      message: "Debe aceptar el consentimiento legal"
    })
  });

export const insertVolunteerParticipationSchema = createInsertSchema(volunteerParticipations).omit({ 
  id: true, 
  createdAt: true 
});

export const insertVolunteerEvaluationSchema = createInsertSchema(volunteerEvaluations).omit({ 
  id: true, 
  createdAt: true 
});

export const insertVolunteerRecognitionSchema = createInsertSchema(volunteerRecognitions).omit({ 
  id: true, 
  issuedAt: true 
});

// Tipos para el módulo de voluntariado
export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;

export type VolunteerParticipation = typeof volunteerParticipations.$inferSelect;
export type InsertVolunteerParticipation = z.infer<typeof insertVolunteerParticipationSchema>;

export type VolunteerEvaluation = typeof volunteerEvaluations.$inferSelect;
export type InsertVolunteerEvaluation = z.infer<typeof insertVolunteerEvaluationSchema>;

export type VolunteerRecognition = typeof volunteerRecognitions.$inferSelect;
export type InsertVolunteerRecognition = z.infer<typeof insertVolunteerRecognitionSchema>;

// Tipos extendidos para la interfaz
export type ExtendedVolunteer = Volunteer & {
  participations?: VolunteerParticipation[];
  evaluations?: VolunteerEvaluation[];
  recognitions?: VolunteerRecognition[];
  totalHours?: number;
  preferredPark?: Park;
};

// TABLES FOR MODULE: INSTRUCTORS

// 1. Tabla de Instructores
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone"),
  address: text("address"),
  age: integer("age"),
  email: text("email").notNull(),
  availability: text("available_hours"),
  specialties: text("specialties"),
  experience: integer("experience_years").notNull(),
  bio: text("bio"),
  status: text("status").default("active").notNull(),
  profileImageUrl: text("profile_image_url"),
  preferredParkId: integer("preferred_park_id"),
  cvUrl: text("cv_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  gender: text("gender"),
  availableDays: text("available_days").array(),
  education: text("education"),
  certifications: text("certifications").array(),
});

// 2. Tabla de Asignaciones de Instructores
export const instructorAssignments = pgTable("instructor_assignments", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull(),
  activityId: integer("activity_id").notNull(),
  parkId: integer("park_id").notNull(),
  activityName: text("activity_name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  hoursAssigned: integer("hours_assigned").notNull(),
  assignedById: integer("assigned_by_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 3. Tabla de Evaluaciones de Instructores (adaptada a la estructura EXACTA de la DB)
export const instructorEvaluations = pgTable("instructor_evaluations", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  instructorId: integer("instructor_id").notNull(),
  evaluatorId: integer("evaluator_id"),
  
  // Criterios básicos de evaluación (escala 1-5)
  knowledge: integer("knowledge"), // 1-5 Conocimiento de la materia
  communication: integer("communication"), // 1-5 Habilidades de comunicación
  methodology: integer("methodology"), // 1-5 Metodología de enseñanza
  overallPerformance: integer("overall_performance"), // 1-5 Desempeño general
  
  // Comentarios y evaluación cualitativa
  comments: text("comments"), // Observaciones adicionales
  
  // Campos de auditoría (solo el que realmente existe)
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// 4. Tabla de Reconocimientos de Instructores
export const instructorRecognitions = pgTable("instructor_recognitions", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull(),
  recognitionType: text("recognition_type").notNull(), // certification, award, special-mention
  level: text("level"), // basic, intermediate, advanced, expert
  reason: text("reason").notNull(),
  hoursCompleted: integer("hours_completed"),
  certificateUrl: text("certificate_url"),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  issuedById: integer("issued_by_id").notNull(),
  additionalComments: text("additional_comments"),
});

// Definición de relaciones para instructores
export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  preferredPark: one(parks, {
    fields: [instructors.preferredParkId],
    references: [parks.id],
  }),
  assignments: many(instructorAssignments),
  evaluations: many(instructorEvaluations),
  recognitions: many(instructorRecognitions),
}));

export const instructorAssignmentsRelations = relations(instructorAssignments, ({ one }) => ({
  instructor: one(instructors, {
    fields: [instructorAssignments.instructorId],
    references: [instructors.id],
  }),
  activity: one(activities, {
    fields: [instructorAssignments.activityId],
    references: [activities.id],
  }),
  park: one(parks, {
    fields: [instructorAssignments.parkId],
    references: [parks.id],
  }),
}));

export const instructorEvaluationsRelations = relations(instructorEvaluations, ({ one }) => ({
  instructor: one(instructors, {
    fields: [instructorEvaluations.instructorId],
    references: [instructors.id],
  }),
  assignment: one(instructorAssignments, {
    fields: [instructorEvaluations.assignmentId],
    references: [instructorAssignments.id],
  }),
}));

export const instructorRecognitionsRelations = relations(instructorRecognitions, ({ one }) => ({
  instructor: one(instructors, {
    fields: [instructorRecognitions.instructorId],
    references: [instructors.id],
  }),
}));

// Esquemas para validación de datos de instructores
export const insertInstructorSchema = createInsertSchema(instructors).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertInstructorAssignmentSchema = createInsertSchema(instructorAssignments).omit({ 
  id: true, 
  createdAt: true 
});

export const insertInstructorEvaluationSchema = createInsertSchema(instructorEvaluations).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

export const insertInstructorRecognitionSchema = createInsertSchema(instructorRecognitions).omit({ 
  id: true, 
  issuedAt: true 
});

// Tipos para el módulo de instructores
export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;

export type InstructorAssignment = typeof instructorAssignments.$inferSelect;
export type InsertInstructorAssignment = z.infer<typeof insertInstructorAssignmentSchema>;

export type InstructorEvaluation = typeof instructorEvaluations.$inferSelect;
export type InsertInstructorEvaluation = z.infer<typeof insertInstructorEvaluationSchema>;

export type InstructorRecognition = typeof instructorRecognitions.$inferSelect;
export type InsertInstructorRecognition = z.infer<typeof insertInstructorRecognitionSchema>;

// Tipos extendidos para la interfaz
export type ExtendedInstructor = Instructor & {
  assignments?: InstructorAssignment[];
  evaluations?: InstructorEvaluation[];
  recognitions?: InstructorRecognition[];
  totalHours?: number;
  preferredPark?: Park;
};

export type ExtendedPark = Park & {
  amenities?: Amenity[];
  images?: ParkImage[];
  primaryImage?: string;
  documents?: Document[];
  activities?: Activity[];
  comments?: Comment[];
  municipality?: Municipality;
};
