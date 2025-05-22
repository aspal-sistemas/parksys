import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para insertar evaluaciones de instructores de muestra
 * adaptado a la estructura actual de la tabla
 */
export async function addSimpleInstructorEvaluations() {
  try {
    console.log("Buscando instructores existentes...");
    
    // Obtenemos instructores existentes
    const result = await db.execute(sql`SELECT * FROM instructors LIMIT 10`);
    const instructors = result.rows || [];
    console.log(`Encontrados ${instructors.length} instructores`);
    
    if (instructors.length === 0) {
      console.log("No hay instructores en la base de datos. Por favor, agregue instructores primero.");
      return { success: false, message: "No hay instructores en la base de datos" };
    }
    
    // Obtenemos asignaciones existentes
    const assignmentsResult = await db.execute(sql`SELECT * FROM instructor_assignments LIMIT 10`);
    const assignments = assignmentsResult.rows || [];
    console.log(`Encontradas ${assignments.length} asignaciones`);
    
    if (assignments.length === 0) {
      console.log("No hay asignaciones. Creando asignaciones de prueba...");
      
      // Obtener algunas actividades
      const activitiesResult = await db.execute(sql`SELECT * FROM activities LIMIT 10`);
      const activities = activitiesResult.rows || [];
      
      if (activities.length === 0) {
        return { success: false, message: "No hay actividades para crear asignaciones" };
      }
      
      // Crear asignaciones
      for (let i = 0; i < Math.min(5, instructors.length, activities.length); i++) {
        try {
          await db.execute(sql`
            INSERT INTO instructor_assignments (
              instructor_id, 
              activity_id, 
              park_id,
              title,
              description,
              start_date,
              end_date,
              status,
              created_by
            ) VALUES (
              ${instructors[i].id},
              ${activities[i].id},
              ${activities[i].park_id || 1},
              ${activities[i].title || 'Actividad asignada'},
              ${'Asignación de prueba para evaluaciones'},
              ${new Date().toISOString()},
              ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()},
              ${'active'},
              ${1}
            )
          `);
        } catch (err) {
          console.error("Error al crear asignación:", err);
        }
      }
      
      // Obtener las asignaciones creadas
      const newAssignmentsResult = await db.execute(sql`SELECT * FROM instructor_assignments LIMIT 10`);
      const newAssignments = newAssignmentsResult.rows || [];
      
      if (newAssignments.length === 0) {
        return { success: false, message: "No se pudieron crear asignaciones" };
      }
      
      assignments.push(...newAssignments);
    }
    
    // Crear evaluaciones
    console.log("Insertando evaluaciones de instructores...");
    let createdCount = 0;
    
    for (let i = 0; i < Math.min(10, instructors.length, assignments.length); i++) {
      try {
        // Usar valores aleatorios para las evaluaciones
        const knowledge = Math.floor(Math.random() * 2) + 4; // 4-5
        const communication = Math.floor(Math.random() * 2) + 4; // 4-5
        const methodology = Math.floor(Math.random() * 2) + 4; // 4-5
        const overallPerformance = Math.floor((knowledge + communication + methodology) / 3);
        
        // SQL simplificado usando solo los campos que existen en la tabla real
        await db.execute(sql`
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
            ${instructors[i].id},
            ${assignments[i].id},
            ${1},
            ${knowledge},
            ${communication},
            ${methodology},
            ${overallPerformance},
            ${'Evaluación generada automáticamente para pruebas. El instructor demuestra buenas habilidades de comunicación y metodología.'}
          )
        `);
        
        createdCount++;
        console.log(`Evaluación ${createdCount} creada para instructor ID ${instructors[i].id}`);
      } catch (err) {
        console.error(`Error al insertar evaluación:`, err);
      }
    }
    
    console.log(`Se crearon ${createdCount} evaluaciones de instructores con éxito`);
    return { success: true, message: `${createdCount} evaluaciones creadas con éxito` };
  } catch (error) {
    console.error("Error general:", error);
    return { success: false, error: error.message };
  }
}