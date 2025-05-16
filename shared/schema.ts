import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"),
  municipalityId: integer("municipality_id"),
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
  openingHours: text("opening_hours"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
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

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  category: text("category"),
  location: text("location"),
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
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, isApproved: true });
export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true, createdAt: true, updatedAt: true, status: true });

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

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

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

export const activitiesRelations = relations(activities, ({ one }) => ({
  park: one(parks, {
    fields: [activities.parkId],
    references: [parks.id],
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

export type ExtendedPark = Park & {
  amenities?: Amenity[];
  images?: ParkImage[];
  primaryImage?: string;
  documents?: Document[];
  activities?: Activity[];
  comments?: Comment[];
  municipality?: Municipality;
};
