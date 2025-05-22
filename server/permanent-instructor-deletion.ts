/**
 * Script para eliminar permanentemente todos los instructores de la base de datos
 * 
 * ADVERTENCIA: Este script elimina PERMANENTEMENTE los registros y no se pueden recuperar
 */

import { db } from "./db";
import { sql } from "drizzle-orm";

async function permanentlyDeleteInstructors() {
  try {
    console.log("\n==== INICIANDO PROCESO DE ELIMINACIÓN PERMANENTE DE INSTRUCTORES ====\n");
    
    // 1. Contar cuántos instructores hay antes de la eliminación
    const countResult = await db.execute(
      sql`SELECT COUNT(*) FROM instructors`
    );
    
    const totalInstructors = parseInt(countResult.rows?.[0]?.count || '0');
    console.log(`Total de instructores encontrados: ${totalInstructors}`);
    
    if (totalInstructors === 0) {
      console.log("No hay instructores para eliminar");
      return;
    }
    
    // 2. Primero eliminamos las evaluaciones y reconocimientos para evitar problemas de integridad referencial
    console.log("Eliminando evaluaciones de instructores...");
    await db.execute(
      sql`DELETE FROM instructor_evaluations`
    );
    
    console.log("Eliminando reconocimientos de instructores...");
    await db.execute(
      sql`DELETE FROM instructor_recognitions`
    );
    
    console.log("Eliminando asignaciones de instructores...");
    await db.execute(
      sql`DELETE FROM instructor_assignments`
    );
    
    // 3. Finalmente, eliminamos los instructores
    console.log("Eliminando instructores...");
    const deleteResult = await db.execute(
      sql`DELETE FROM instructors`
    );
    
    const deletedCount = deleteResult.rowCount || 0;
    
    console.log(`\n✅ PROCESO COMPLETADO: ${deletedCount} instructores han sido eliminados permanentemente\n`);
    
    console.log("==== PROCESO FINALIZADO ====");
  } catch (error) {
    console.error("Error crítico durante el proceso:", error);
  }
}

// Ejecutamos el script
permanentlyDeleteInstructors();