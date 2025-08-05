/**
 * Script para inactivar todos los instructores directamente
 * 
 * Este script:
 * 1. Conecta directamente a la base de datos
 * 2. Marca como "inactive" a todos los instructores activos
 * 3. Muestra un resumen de la operación
 */

import { db } from "./db";
import { sql } from "drizzle-orm";
import { deleteAllInstructors } from "./delete-all-instructors";

async function inactivateAllInstructors() {
  try {
    console.log("\n==== INICIANDO PROCESO DE INACTIVACIÓN DE INSTRUCTORES ====\n");
    
    const result = await deleteAllInstructors();
    
    if (result.success) {
      console.log(`\n✅ PROCESO COMPLETADO: ${result.count} instructores fueron inactivados.\n`);
    } else {
      console.error(`\n❌ ERROR EN EL PROCESO: ${result.message}\n`);
    }
    
    // Cerramos la conexión a la base de datos
    await db.end();
    
    console.log("==== PROCESO FINALIZADO ====");
  } catch (error) {
    console.error("Error crítico durante el proceso:", error);
  }
}

// Ejecutamos el script
inactivateAllInstructors();