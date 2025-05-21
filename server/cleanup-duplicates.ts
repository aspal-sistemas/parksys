import { db } from './db';
import { instructors, instructorAssignments, instructorEvaluations, instructorRecognitions } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Script para eliminar instructores duplicados en la base de datos
 * 
 * Este script:
 * 1. Identifica instructores duplicados (mismo nombre completo y email)
 * 2. Mantiene el registro más reciente para cada instructor
 * 3. Actualiza las referencias en las tablas relacionadas
 * 4. Elimina los registros duplicados antiguos
 */
async function cleanupDuplicateInstructors() {
  console.log("Iniciando limpieza de instructores duplicados...");
  
  try {
    // 1. Encontrar instructores con el mismo nombre completo y email
    const findDuplicatesQuery = sql`
      WITH duplicates AS (
        SELECT 
          id, 
          full_name, 
          email,
          ROW_NUMBER() OVER (
            PARTITION BY LOWER(full_name), LOWER(email) 
            ORDER BY created_at DESC
          ) as row_num
        FROM instructors
      )
      SELECT id, full_name, email, row_num
      FROM duplicates 
      WHERE row_num > 1
      ORDER BY full_name, email, row_num
    `;
    
    const duplicates = await db.execute(findDuplicatesQuery);
    
    if (!duplicates.rows || duplicates.rows.length === 0) {
      console.log("No se encontraron instructores duplicados.");
      return;
    }
    
    console.log(`Se encontraron ${duplicates.rows.length} instructores duplicados.`);
    
    // 2. Para cada grupo de duplicados, encontrar el ID del registro más reciente
    const duplicateGroups = new Map();
    
    // Consultar los IDs más recientes para cada grupo de duplicados
    const latestIdsQuery = sql`
      WITH latest AS (
        SELECT 
          id, 
          full_name, 
          email,
          ROW_NUMBER() OVER (
            PARTITION BY LOWER(full_name), LOWER(email) 
            ORDER BY created_at DESC
          ) as row_num
        FROM instructors
      )
      SELECT id, full_name, email
      FROM latest 
      WHERE row_num = 1
      ORDER BY full_name, email
    `;
    
    const latestResults = await db.execute(latestIdsQuery);
    
    if (!latestResults.rows || latestResults.rows.length === 0) {
      console.log("Error al identificar los registros más recientes.");
      return;
    }
    
    // Construir un mapa de nombres/emails a ID más reciente
    for (const row of latestResults.rows) {
      duplicateGroups.set(`${row.full_name.toLowerCase()}|${row.email.toLowerCase()}`, row.id);
    }
    
    // 3. Para cada registro duplicado, actualizamos las referencias y lo eliminamos
    for (const row of duplicates.rows) {
      const key = `${row.full_name.toLowerCase()}|${row.email.toLowerCase()}`;
      const targetId = duplicateGroups.get(key);
      
      if (!targetId) {
        console.log(`No se encontró un ID válido para ${row.full_name} (${row.email}). Omitiendo.`);
        continue;
      }
      
      console.log(`Procesando duplicado: ${row.id} -> ${targetId} (${row.full_name})`);
      
      // Actualizar asignaciones
      await db.execute(sql`
        UPDATE instructor_assignments 
        SET instructor_id = ${targetId} 
        WHERE instructor_id = ${row.id}
      `);
      
      // Actualizar evaluaciones
      await db.execute(sql`
        UPDATE instructor_evaluations 
        SET instructor_id = ${targetId} 
        WHERE instructor_id = ${row.id}
      `);
      
      // Actualizar reconocimientos
      await db.execute(sql`
        UPDATE instructor_recognitions 
        SET instructor_id = ${targetId} 
        WHERE instructor_id = ${row.id}
      `);
      
      // Eliminar el registro duplicado
      await db.execute(sql`
        DELETE FROM instructors 
        WHERE id = ${row.id}
      `);
      
      console.log(`Eliminado instructor duplicado ID ${row.id}`);
    }
    
    console.log("Limpieza de instructores duplicados completada con éxito.");
    
  } catch (error) {
    console.error("Error al limpiar instructores duplicados:", error);
  }
}

// Ejecutar el script
cleanupDuplicateInstructors()
  .then(() => {
    console.log("Proceso completado.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  });