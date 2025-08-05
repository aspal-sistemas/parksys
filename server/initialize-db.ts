import { db } from "./db";
import * as schema from "@shared/schema";

/**
 * Este script inicializa la estructura de la base de datos basándose en el esquema definido
 */
async function initializeDatabase() {
  console.log("Inicializando estructura de la base de datos...");
  
  try {
    // Verificar si las tablas existen
    console.log("Verificando tablas existentes...");
    const tablesExist = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      );
    `);
    
    if (tablesExist.rows[0].exists) {
      console.log("Las tablas básicas ya existen. Verificando campos...");
    }
    
    // Crear tabla de sesiones si no existe
    await db.execute(/* sql */ `
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);
    
    // Verificar si las tablas principales existen y agregar campos si es necesario
    const usersExists = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (usersExists.rows[0].exists) {
      // Verificar si la columna created_at existe en users
      const createdAtExists = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'created_at'
        );
      `);
      
      if (!createdAtExists.rows[0].exists) {
        console.log("Agregando columnas faltantes a la tabla users...");
        await db.execute(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
      }
    }
    
    // Verificar tablas de parques
    const parksExists = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parks'
      );
    `);
    
    if (parksExists.rows[0].exists) {
      // Verificar si la columna created_at existe en parks
      const createdAtExists = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'parks' 
          AND column_name = 'created_at'
        );
      `);
      
      if (!createdAtExists.rows[0].exists) {
        console.log("Agregando columnas faltantes a la tabla parks...");
        await db.execute(`
          ALTER TABLE parks 
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
      }
    }
    
    console.log("Estructura de base de datos inicializada correctamente.");
    return true;
  } catch (error) {
    console.error("Error al inicializar la estructura de la base de datos:", error);
    throw error;
  }
}

export { initializeDatabase };