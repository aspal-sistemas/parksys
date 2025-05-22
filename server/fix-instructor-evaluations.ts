import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para insertar evaluaciones de instructores de muestra
 * adaptado a la estructura actual de la tabla
 */
export async function addSimpleInstructorEvaluations() {
  try {
    console.log("Buscando instructores y asignaciones existentes...");
    
    // Obtenemos instructores existentes
    const instructors = await db.select().from(sql`instructors`).limit(10);
    console.log(`Encontrados ${instructors.length} instructores`);
    
    if (instructors.length === 0) {
      console.log("No hay instructores en la base de datos. Por favor, agregue instructores primero.");
      return;
    }
    
    // Obtenemos asignaciones existentes o las creamos si no existen
    const assignments = await db.select().from(sql`instructor_assignments`).limit(10);
    console.log(`Encontradas ${assignments.length} asignaciones`);
    
    if (assignments.length === 0) {
      console.log("No hay asignaciones. Necesitamos asignaciones existentes.");
      return;
    }
    
    // Insertamos algunas evaluaciones directamente con SQL
    console.log("Insertando evaluaciones sencillas...");
    
    for (let i = 0; i < Math.min(instructors.length, assignments.length); i++) {
      try {
        const instructorId = instructors[i].id;
        const assignmentId = assignments[i].id;
        
        // Inserción básica con solo los campos que sabemos que existen
        const result = await db.execute(sql`
          INSERT INTO instructor_evaluations (
            instructor_id, 
            assignment_id, 
            evaluator_id,
            knowledge,
            communication,
            methodology,
            overall_performance,
            comments
          ) VALUES (
            ${instructorId},
            ${assignmentId},
            1,
            ${Math.floor(Math.random() * 2) + 4}, 
            ${Math.floor(Math.random() * 2) + 4},
            ${Math.floor(Math.random() * 2) + 4},
            ${Math.floor(Math.random() * 2) + 4},
            ${'Evaluación de muestra generada automáticamente para pruebas.'}
          )
        `);
        
        console.log(`Evaluación insertada para instructor ${instructorId} y asignación ${assignmentId}`);
      } catch (err) {
        console.error(`Error al insertar evaluación para instructor ${instructors[i].id}:`, err);
      }
    }
    
    console.log("Proceso de inserción de evaluaciones completado.");
    return { success: true, message: "Evaluaciones de muestra insertadas correctamente" };
  } catch (error) {
    console.error("Error general:", error);
    return { success: false, error };
  }
}