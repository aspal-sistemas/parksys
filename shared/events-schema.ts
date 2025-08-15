import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  integer, 
  boolean,
  date,
  time,
  json,
  primaryKey
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla principal de eventos
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull(), // deportivo, cultural, ambiental, etc.
  targetAudience: varchar("target_audience", { length: 100 }), // niños, jóvenes, adultos mayores, familias
  status: varchar("status", { length: 20 }).default("draft").notNull(), // borrador, publicado, cancelado, pospuesto
  featuredImageUrl: varchar("featured_image_url", { length: 500 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: json("recurrence_pattern"), // JSON con la configuración de recurrencia
  location: varchar("location", { length: 255 }), // Ubicación dentro del parque
  capacity: integer("capacity"), // Capacidad máxima de asistentes
  registrationType: varchar("registration_type", { length: 20 }).default("free"), // libre o con registro
  organizerName: varchar("organizer_name", { length: 100 }),
  organizerEmail: varchar("organizer_email", { length: 100 }),
  organizerPhone: varchar("organizer_phone", { length: 20 }),
  geolocation: json("geolocation"), // Coordenadas de ubicación {lat, lng}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdById: integer("created_by_id"), // ID del usuario que creó el evento
});

// Tabla de relación entre eventos y parques (un evento puede estar en varios parques)
export const eventParks = pgTable("event_parks", {
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  parkId: integer("park_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    pk: primaryKey(table.eventId, table.parkId)
  };
});

// Tabla para recursos asignados a un evento
export const eventResources = pgTable("event_resources", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  resourceType: varchar("resource_type", { length: 50 }).notNull(), // espacio, equipamiento, servicio
  resourceId: integer("resource_id"), // ID del recurso en su tabla correspondiente
  resourceName: varchar("resource_name", { length: 255 }), // Nombre del recurso
  quantity: integer("quantity").default(1),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("pending"), // pendiente, confirmado, rechazado
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla para registros de participantes
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  registrationDate: timestamp("registration_date").defaultNow(),
  status: varchar("status", { length: 20 }).default("registered"), // registrado, confirmado, cancelado, asistió
  qrCode: varchar("qr_code", { length: 100 }),
  notes: text("notes"),
  customFields: json("custom_fields"), // Campos personalizados según el evento
  attendeeCount: integer("attendee_count").default(1), // Número de personas incluidas en esta inscripción
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla para personal y voluntarios asignados a un evento
export const eventStaff = pgTable("event_staff", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id"), // Para personal interno
  volunteerId: integer("volunteer_id"), // Para voluntarios
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 50 }).notNull(), // coordinador, logística, registro, etc.
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: varchar("status", { length: 20 }).default("assigned"), // asignado, confirmado, cancelado
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabla para evaluaciones de eventos
export const eventEvaluations = pgTable("event_evaluations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  respondentType: varchar("respondent_type", { length: 20 }).notNull(), // asistente, organizador, staff
  respondentId: integer("respondent_id"), // ID del respondiente si es usuario registrado
  rating: integer("rating"), // Valoración general (1-5)
  feedback: text("feedback"), // Comentarios de texto libre
  surveyResponses: json("survey_responses"), // Respuestas a encuesta estructurada
  submissionDate: timestamp("submission_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Esquemas de validación Zod para creación y actualización de eventos
export const insertEventSchema = createInsertSchema(events, {
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  eventType: z.string().min(2).max(50),
  targetAudience: z.string().max(100).optional(),
  status: z.enum(["draft", "published", "cancelled", "postponed"]).default("draft"),
  featuredImageUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  registrationType: z.enum(["free", "registration"]).default("free"),
  organizerName: z.string().max(100).optional(),
  organizerEmail: z.string().email().optional().or(z.literal('')),
  organizerPhone: z.string().max(20).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  parkIds: z.array(z.number()).min(1, "Debe seleccionar al menos un parque")
});

// Tipos para TypeScript
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventPark = typeof eventParks.$inferSelect;
export type EventResource = typeof eventResources.$inferSelect;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type EventStaff = typeof eventStaff.$inferSelect;
export type EventEvaluation = typeof eventEvaluations.$inferSelect;

// Enumeraciones para los valores predefinidos
export const EventTypes = [
  { value: "sports", label: "Deportivo" },
  { value: "cultural", label: "Cultural" },
  { value: "environmental", label: "Ambiental" },
  { value: "social", label: "Social" },
  { value: "educational", label: "Educativo" },
  { value: "recreational", label: "Recreativo" },
  { value: "health", label: "Salud" },
  { value: "other", label: "Otro" }
];

export const TargetAudiences = [
  { value: "children", label: "Niños" },
  { value: "youth", label: "Jóvenes" },
  { value: "adults", label: "Adultos" },
  { value: "seniors", label: "Adultos Mayores" },
  { value: "families", label: "Familias" },
  { value: "all", label: "Todos los públicos" }
];

export const EventStatuses = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "postponed", label: "Pospuesto" },
  { value: "completed", label: "Completado" }
];

export const RegistrationTypes = [
  { value: "free", label: "Entrada libre" },
  { value: "registration", label: "Con registro previo" }
];