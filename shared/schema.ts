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
  surfaceArea: decimal("surface_area"),
  openingHours: text("opening_hours"),
  closingHours: text("closing_hours"),
  active: boolean("active").notNull().default(true),
  mainImageUrl: text("main_image_url"),
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
  maintenance_type: text("maintenance_type").notNull(),
  maintenance_date: date("maintenance_date").notNull(),
  performed_by: text("performed_by"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow()
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
  created_at: true,
  updated_at: true
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