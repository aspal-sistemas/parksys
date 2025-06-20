import { db } from "./db";
import { sql } from "drizzle-orm";

export async function initializeBasicTables() {
  try {
    console.log("Inicializando tablas básicas...");
    
    // Crear tabla de municipios
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS municipalities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar Guadalajara si no existe
    await db.execute(sql`
      INSERT INTO municipalities (id, name, state) 
      VALUES (1, 'Guadalajara', 'Jalisco')
      ON CONFLICT (id) DO NOTHING
    `);

    // Crear tabla de parques
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS parks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(500),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        type VARCHAR(50),
        size INTEGER,
        municipality_id INTEGER REFERENCES municipalities(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Crear tabla de amenidades
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS amenities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de relación parques-amenidades
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS park_amenities (
        id SERIAL PRIMARY KEY,
        park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
        amenity_id INTEGER REFERENCES amenities(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(park_id, amenity_id)
      )
    `);

    // Crear tabla de imágenes de parques
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS park_images (
        id SERIAL PRIMARY KEY,
        park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Tablas básicas creadas exitosamente");
    return true;
  } catch (error) {
    console.error("Error al crear tablas básicas:", error);
    return false;
  }
}