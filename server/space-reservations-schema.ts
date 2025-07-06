/**
 * ESQUEMA: SISTEMA DE RESERVAS DE ESPACIOS
 * =====================================
 * 
 * Complementa el módulo de asignaciones de activos para gestionar
 * espacios fijos como áreas de juegos infantiles, kioscos, etc.
 */

import { pgTable, serial, integer, timestamp, text, varchar, boolean, date, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Espacios reservables en los parques
export const reservableSpaces = pgTable("reservable_spaces", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull().references(() => parks.id),
  name: varchar("name", { length: 255 }).notNull(), // "Área de Juegos Infantiles", "Kiosco Central"
  description: text("description"),
  spaceType: varchar("space_type", { length: 100 }).notNull(), // "playground", "kiosk", "open_area", "pavilion"
  capacity: integer("capacity"), // Número máximo de personas
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default("0.00"),
  minimumHours: integer("minimum_hours").default(1),
  maximumHours: integer("maximum_hours").default(8),
  amenities: text("amenities"), // "Mesas, sillas, electricidad"
  rules: text("rules"), // Reglas específicas del espacio
  isActive: boolean("is_active").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  advanceBookingDays: integer("advance_booking_days").default(30), // Días máximos de anticipación
  images: text("images"), // URLs de imágenes del espacio
  coordinates: text("coordinates"), // Lat,Long para ubicación en mapa
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reservas de espacios
export const spaceReservations = pgTable("space_reservations", {
  id: serial("id").primaryKey(),
  spaceId: integer("space_id").notNull().references(() => reservableSpaces.id),
  eventId: integer("event_id").references(() => events.id), // Vinculado a evento si aplica
  activityId: integer("activity_id").references(() => activities.id), // Vinculado a actividad si aplica
  reservedBy: integer("reserved_by").notNull(), // ID del usuario que reserva
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  reservationDate: date("reservation_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  expectedAttendees: integer("expected_attendees"),
  purpose: text("purpose").notNull(), // "Fiesta infantil", "Evento corporativo"
  specialRequests: text("special_requests"), // Solicitudes especiales
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default("0.00"),
  depositPaid: decimal("deposit_paid", { precision: 10, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, cancelled, completed
  approvedBy: integer("approved_by"), // ID del usuario que aprobó
  approvedAt: timestamp("approved_at"),
  cancellationReason: text("cancellation_reason"),
  notes: text("notes"), // Notas internas
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Disponibilidad de espacios (para manejar horarios especiales)
export const spaceAvailability = pgTable("space_availability", {
  id: serial("id").primaryKey(),
  spaceId: integer("space_id").notNull().references(() => reservableSpaces.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Domingo, 1=Lunes, etc.
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  exceptionDate: date("exception_date"), // Para manejar días específicos
  reason: text("reason"), // Razón de no disponibilidad
  createdAt: timestamp("created_at").defaultNow(),
});

// Relaciones
export const reservableSpacesRelations = relations(reservableSpaces, ({ one, many }) => ({
  park: one(parks, {
    fields: [reservableSpaces.parkId],
    references: [parks.id],
  }),
  reservations: many(spaceReservations),
  availability: many(spaceAvailability),
}));

export const spaceReservationsRelations = relations(spaceReservations, ({ one }) => ({
  space: one(reservableSpaces, {
    fields: [spaceReservations.spaceId],
    references: [reservableSpaces.id],
  }),
  event: one(events, {
    fields: [spaceReservations.eventId],
    references: [events.id],
  }),
  activity: one(activities, {
    fields: [spaceReservations.activityId],
    references: [activities.id],
  }),
}));

// Tipos TypeScript
export type ReservableSpace = typeof reservableSpaces.$inferSelect;
export type InsertReservableSpace = typeof reservableSpaces.$inferInsert;
export type SpaceReservation = typeof spaceReservations.$inferSelect;
export type InsertSpaceReservation = typeof spaceReservations.$inferInsert;
export type SpaceAvailability = typeof spaceAvailability.$inferSelect;
export type InsertSpaceAvailability = typeof spaceAvailability.$inferInsert;