/**
 * Script para crear las tablas relacionadas con el módulo de arbolado
 */
import { db } from "./db";
import { treeSpecies, trees, treeMaintenances } from "@shared/schema";

export async function createTreeTables() {
  try {
    console.log("Creando tablas para el módulo de arbolado...");
    
    // Crear tabla de especies de árboles
    await db.query(`
      CREATE TABLE IF NOT EXISTS tree_species (
        id SERIAL PRIMARY KEY,
        common_name TEXT NOT NULL,
        scientific_name TEXT NOT NULL,
        family TEXT,
        origin TEXT,
        climate_zone TEXT,
        growth_rate TEXT,
        height_mature DECIMAL(5,2),
        canopy_diameter DECIMAL(5,2),
        lifespan INTEGER,
        image_url TEXT,
        description TEXT,
        maintenance_requirements TEXT,
        water_requirements TEXT,
        sun_requirements TEXT,
        soil_requirements TEXT,
        ecological_benefits TEXT,
        ornamental_value TEXT,
        common_uses TEXT,
        is_endangered BOOLEAN DEFAULT false,
        icon_color TEXT DEFAULT '#4CAF50',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Tabla tree_species creada correctamente");

    // Crear tabla de árboles individuales
    await db.query(`
      CREATE TABLE IF NOT EXISTS trees (
        id SERIAL PRIMARY KEY,
        species_id INTEGER NOT NULL REFERENCES tree_species(id),
        park_id INTEGER NOT NULL REFERENCES parks(id),
        identifier TEXT,
        planting_date DATE,
        height DECIMAL(4,2),
        diameter DECIMAL(4,2),
        health_status TEXT DEFAULT 'bueno',
        location_description TEXT,
        latitude TEXT,
        longitude TEXT,
        last_inspection_date DATE,
        notes TEXT,
        image_url TEXT,
        is_protected BOOLEAN DEFAULT false,
        age_estimate INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Tabla trees creada correctamente");

    // Crear tabla de mantenimiento de árboles
    await db.query(`
      CREATE TABLE IF NOT EXISTS tree_maintenances (
        id SERIAL PRIMARY KEY,
        tree_id INTEGER NOT NULL REFERENCES trees(id),
        maintenance_type TEXT NOT NULL,
        maintenance_date DATE NOT NULL,
        performed_by TEXT,
        user_id INTEGER,
        description TEXT,
        cost DECIMAL(8,2),
        health_before_service TEXT,
        health_after_service TEXT,
        image_url TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Tabla tree_maintenances creada correctamente");

    console.log("Todas las tablas del módulo de arbolado creadas correctamente.");
    
    return { success: true, message: "Tablas de arbolado creadas correctamente" };
  } catch (error) {
    console.error("Error al crear las tablas del módulo de arbolado:", error);
    return { success: false, message: "Error al crear las tablas", error };
  }
}

// Ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  createTreeTables()
    .then(() => {
      console.log("Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error en el proceso:", error);
      process.exit(1);
    });
}