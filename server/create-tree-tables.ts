/**
 * Script para crear las tablas relacionadas con el módulo de arbolado
 */
import { db } from "./db";
import { treeSpecies, trees, treeMaintenances } from "@shared/schema";

export async function createTreeTables() {
  try {
    console.log("Creando tablas para el módulo de arbolado...");
    
    // Verificar si las tablas ya existen
    const tableExists = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tree_species'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log("Las tablas del módulo de arbolado ya existen.");
      return { success: true, message: "Las tablas ya existen" };
    }
    
    // Crear las tablas en orden: primero especies, luego árboles, luego mantenimientos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tree_species (
        id SERIAL PRIMARY KEY,
        common_name VARCHAR(255) NOT NULL,
        scientific_name VARCHAR(255) NOT NULL,
        family VARCHAR(100),
        origin VARCHAR(100),
        climate_zone VARCHAR(100),
        growth_rate VARCHAR(50),
        height_mature INTEGER,
        canopy_diameter INTEGER,
        lifespan INTEGER,
        image_url TEXT,
        description TEXT,
        maintenance_requirements TEXT,
        water_requirements VARCHAR(50),
        sun_requirements VARCHAR(50),
        soil_requirements VARCHAR(100),
        ecological_benefits TEXT,
        ornamental_value VARCHAR(50),
        common_uses TEXT,
        is_endangered BOOLEAN DEFAULT false,
        icon_color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS trees (
        id SERIAL PRIMARY KEY,
        species_id INTEGER REFERENCES tree_species(id),
        park_id INTEGER REFERENCES parks(id),
        location_description VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        height DECIMAL(5, 2),
        trunk_diameter DECIMAL(5, 2),
        condition VARCHAR(50),
        health_status VARCHAR(50),
        planting_date DATE,
        notes TEXT,
        last_maintenance_date DATE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS tree_maintenances (
        id SERIAL PRIMARY KEY,
        tree_id INTEGER REFERENCES trees(id),
        maintenance_date DATE NOT NULL,
        maintenance_type VARCHAR(100) NOT NULL,
        description TEXT,
        performed_by INTEGER REFERENCES users(id),
        notes TEXT,
        next_maintenance_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Índices para mejorar el rendimiento de consultas comunes
      CREATE INDEX idx_trees_species_id ON trees(species_id);
      CREATE INDEX idx_trees_park_id ON trees(park_id);
      CREATE INDEX idx_tree_maintenances_tree_id ON tree_maintenances(tree_id);
      CREATE INDEX idx_trees_health_status ON trees(health_status);
    `);
    
    console.log("Tablas para el módulo de arbolado creadas correctamente.");
    return { success: true, message: "Tablas creadas correctamente" };
  } catch (error) {
    console.error("Error al crear las tablas del módulo de arbolado:", error);
    return { success: false, message: "Error al crear tablas", error };
  }
}

// Para ES modules no podemos usar require.main === module
// En lugar de eso, exportamos la función directamente