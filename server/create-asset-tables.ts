import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para crear las tablas relacionadas con el módulo de activos
 */
export async function createAssetTables() {
  try {
    console.log("Creando tablas para el módulo de activos...");
    
    // Crear tabla de categorías de activos
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS asset_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        color TEXT,
        parent_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Crear tabla principal de activos
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        serial_number TEXT,
        category_id INTEGER NOT NULL,
        park_id INTEGER NOT NULL,
        location_description TEXT,
        latitude TEXT,
        longitude TEXT,
        acquisition_date DATE,
        acquisition_cost DECIMAL(10, 2),
        current_value DECIMAL(10, 2),
        manufacturer TEXT,
        model TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        condition TEXT NOT NULL DEFAULT 'good',
        maintenance_frequency TEXT,
        last_maintenance_date DATE,
        next_maintenance_date DATE,
        expected_lifespan INTEGER,
        notes TEXT,
        qr_code TEXT,
        responsible_person_id INTEGER,
        photos TEXT[],
        documents TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (category_id) REFERENCES asset_categories(id),
        FOREIGN KEY (park_id) REFERENCES parks(id)
      )
    `);
    
    // Crear tabla de mantenimientos de activos
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS asset_maintenances (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER NOT NULL,
        maintenance_type TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        performer_id INTEGER,
        date DATE NOT NULL,
        cost DECIMAL(10, 2),
        description TEXT NOT NULL,
        findings TEXT,
        actions TEXT,
        next_maintenance_date DATE,
        photos TEXT[],
        status TEXT NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla de historial de cambios de activos
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS asset_history (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER NOT NULL,
        change_type TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        description TEXT NOT NULL,
        changed_by INTEGER NOT NULL,
        previous_value JSONB,
        new_value JSONB,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      )
    `);
    
    // Insertar categorías por defecto
    await db.execute(sql`
      INSERT INTO asset_categories (name, description, icon, color)
      VALUES 
        ('Mobiliario Urbano', 'Bancas, mesas, basureros y otros elementos de mobiliario', 'couch', '#3B82F6'),
        ('Equipamiento Deportivo', 'Equipos para ejercicio y práctica deportiva', 'dumbbell', '#10B981'),
        ('Juegos Infantiles', 'Columpios, resbaladillas y otros juegos para niños', 'playCircle', '#F59E0B'),
        ('Infraestructura', 'Elementos estructurales como caminos, puentes, etc.', 'building', '#6366F1'),
        ('Tecnología', 'Equipos tecnológicos como cámaras, sensores, etc.', 'wifi', '#EC4899'),
        ('Herramientas', 'Herramientas para mantenimiento y reparación', 'wrench', '#8B5CF6'),
        ('Vehículos', 'Vehículos de mantenimiento, transporte y seguridad', 'truck', '#EF4444'),
        ('Iluminación', 'Postes de luz, reflectores y otros elementos de iluminación', 'lightbulb', '#F59E0B'),
        ('Señalización', 'Señales informativas, preventivas y restrictivas', 'signpost', '#14B8A6'),
        ('Sistemas de Riego', 'Equipo para riego y mantenimiento de áreas verdes', 'droplet', '#3B82F6')
      ON CONFLICT (name) DO NOTHING
    `);
    
    console.log("Tablas para el módulo de activos creadas correctamente.");
    
    return { success: true };
  } catch (error) {
    console.error("Error al crear tablas de activos:", error);
    return { success: false, error };
  }
}