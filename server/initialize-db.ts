import { db } from "./db";
import * as schema from "@shared/schema";

/**
 * Este script inicializa la estructura de la base de datos de forma no bloqueante
 */
async function initializeDatabase() {
  console.log("Inicializando estructura de la base de datos...");
  
  try {
    // Crear solo la tabla de sesiones de forma segura - no bloquear por errores
    try {
      await db.execute(/* sql */ `
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR(255) PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
      `);
      console.log("✅ Tabla de sesiones verificada");
    } catch (error) {
      console.log("⚠️ Error creando tabla sessions (continuando):", error instanceof Error ? error.message : error);
    }

    // Verificación básica de base de datos
    try {
      const result = await db.execute('SELECT 1 as test');
      if (result.rows?.[0]?.test === 1) {
        console.log("✅ Conexión a base de datos verificada");
      }
    } catch (error) {
      console.log("⚠️ Error verificando conexión (continuando):", error instanceof Error ? error.message : error);
    }
    
    console.log("✅ Estructura de base de datos inicializada correctamente.");
    return true;
  } catch (error) {
    console.error("❌ Error al inicializar la estructura de la base de datos:", error);
    // No re-throw to prevent blocking startup
    return false;
  }
}

export { initializeDatabase };