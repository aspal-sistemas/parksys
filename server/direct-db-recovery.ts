import { db } from "./db";
import { parks } from "@shared/schema";

/**
 * Script para recuperar directamente todos los parques de la base de datos original
 */
export async function recoverOriginalParks() {
  try {
    console.log("Conectando a la base de datos original...");
    
    // Consulta directa a la tabla parks
    const allParks = await db.select().from(parks);
    
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
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  recoverOriginalParks()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}