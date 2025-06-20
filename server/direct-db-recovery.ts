import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { parks } from "@shared/schema";

// Configuración específica para recuperación
neonConfig.webSocketConstructor = ws;

/**
 * Script para recuperar directamente todos los parques de la base de datos original
 */
export async function recoverOriginalParks() {
  let pool: Pool | null = null;
  
  try {
    console.log("Conectando a la base de datos original...");
    
    // Crear pool específico con timeout corto
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000 // 5 segundos
    });
    
    const db = drizzle(pool, { schema: { parks } });
    
    // Consulta directa con timeout
    const queryPromise = db.select().from(parks);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), 8000)
    );
    
    const allParks = await Promise.race([queryPromise, timeoutPromise]);
    
    console.log(`✓ Encontrados ${allParks.length} parques en la base de datos original`);
    
    // Mostrar los primeros parques para verificar
    allParks.slice(0, 5).forEach((park, index) => {
      console.log(`${index + 1}. ${park.name} (ID: ${park.id})`);
    });
    
    if (allParks.length > 5) {
      console.log(`... y ${allParks.length - 5} parques más`);
    }
    
    return allParks;
  } catch (error) {
    console.error("Error al recuperar parques originales:", error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  recoverOriginalParks()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}