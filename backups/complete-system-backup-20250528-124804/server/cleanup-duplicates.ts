import { db } from './db';
import { instructors, instructorAssignments, instructorEvaluations, instructorRecognitions } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Script mejorado para eliminar instructores duplicados en la base de datos
 * 
 * Este script:
 * 1. Identifica instructores duplicados (mismo nombre completo o mismo email)
 * 2. Mantiene el registro más completo y reciente para cada instructor
 * 3. Actualiza las referencias en las tablas relacionadas
 * 4. Elimina los registros duplicados antiguos
 */
async function cleanupDuplicateInstructors() {
  console.log("Iniciando limpieza exhaustiva de instructores duplicados...");
  
  try {
    // Paso 1: Limpieza por nombre completo (case insensitive)
    console.log("FASE 1: Limpieza por nombre completo...");
    await cleanupByField('full_name');
    
    // Paso 2: Limpieza por email (case insensitive)
    console.log("FASE 2: Limpieza por email...");
    await cleanupByField('email');
    
    console.log("Limpieza de instructores duplicados completada con éxito.");
    
  } catch (error) {
    console.error("Error al limpiar instructores duplicados:", error);
  }
}

/**
 * Limpia los duplicados basados en un campo específico
 * @param fieldName Nombre del campo por el que se buscarán duplicados (full_name o email)
 */
async function cleanupByField(fieldName: string) {
  // 1. Encontrar los valores duplicados del campo especificado
  const findDuplicateValuesQuery = sql`
    SELECT LOWER(${sql.raw(fieldName)}) as field_value, COUNT(*) as count
    FROM instructors
    GROUP BY LOWER(${sql.raw(fieldName)})
    HAVING COUNT(*) > 1
  `;
  
  const duplicateValues = await db.execute(findDuplicateValuesQuery);
  
  if (!duplicateValues.rows || duplicateValues.rows.length === 0) {
    console.log(`No se encontraron valores duplicados en el campo ${fieldName}.`);
    return;
  }
  
  console.log(`Se encontraron ${duplicateValues.rows.length} valores duplicados en ${fieldName}.`);
  
  // 2. Para cada valor duplicado, procesar sus registros
  for (const valueRow of duplicateValues.rows) {
    const fieldValue = valueRow.field_value;
    if (!fieldValue || fieldValue === '') continue;
    
    console.log(`Procesando duplicados con ${fieldName} = "${fieldValue}"...`);
    
    // Encontrar todos los registros con este valor
    const findRecordsQuery = sql`
      SELECT id, full_name, email, created_at, 
             CASE WHEN specialties IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN phone IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN profile_image_url IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN experience_years > 0 THEN 1 ELSE 0 END +
             CASE WHEN bio IS NOT NULL AND length(bio) > 10 THEN 1 ELSE 0 END AS completeness_score
      FROM instructors
      WHERE LOWER(${sql.raw(fieldName)}) = ${fieldValue}
      ORDER BY completeness_score DESC, created_at DESC
    `;
    
    const records = await db.execute(findRecordsQuery);
    
    if (!records.rows || records.rows.length <= 1) {
      console.log(`  Advertencia: No se encontraron múltiples registros para ${fieldName} = "${fieldValue}"`);
      continue;
    }
    
    // El primer registro es el que conservaremos (el más completo y reciente)
    const keepRecord = records.rows[0];
    const keepId = keepRecord.id;
    
    console.log(`  Manteniendo el registro ID ${keepId} (${keepRecord.full_name})`);
    
    // Procesar los demás registros (duplicados a eliminar)
    for (let i = 1; i < records.rows.length; i++) {
      const duplicateRecord = records.rows[i];
      const duplicateId = duplicateRecord.id;
      
      console.log(`  Procesando duplicado: ID ${duplicateId} -> ${keepId} (${duplicateRecord.full_name})`);
      
      // Actualizar referencias en otras tablas
      
      // 1. Asignaciones
      await db.execute(sql`
        UPDATE instructor_assignments 
        SET instructor_id = ${keepId} 
        WHERE instructor_id = ${duplicateId}
      `);
      
      // 2. Evaluaciones
      await db.execute(sql`
        UPDATE instructor_evaluations 
        SET instructor_id = ${keepId} 
        WHERE instructor_id = ${duplicateId}
      `);
      
      // 3. Reconocimientos
      await db.execute(sql`
        UPDATE instructor_recognitions 
        SET instructor_id = ${keepId} 
        WHERE instructor_id = ${duplicateId}
      `);
      
      // Nota: No actualizamos la tabla activities porque no tiene una columna instructor_id
      
      // Eliminar el registro duplicado
      await db.execute(sql`
        DELETE FROM instructors 
        WHERE id = ${duplicateId}
      `);
      
      console.log(`  Eliminado instructor duplicado ID ${duplicateId}`);
    }
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