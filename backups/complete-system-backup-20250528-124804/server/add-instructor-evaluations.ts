import { db } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Script para agregar evaluaciones de instructores de muestra
 */
export async function addInstructorEvaluations() {
  try {
    console.log("Buscando instructores y asignaciones existentes...");
    
    // Obtenemos instructores existentes
    const instructors = await db.select().from(schema.instructors).limit(10);
    console.log(`Encontrados ${instructors.length} instructores`);
    
    if (instructors.length === 0) {
      console.log("No hay instructores en la base de datos. Por favor, agregue instructores primero.");
      return;
    }
    
    // Obtenemos asignaciones existentes o las creamos si no existen
    const assignments = await db.select().from(schema.instructorAssignments).limit(10);
    console.log(`Encontradas ${assignments.length} asignaciones`);
    
    if (assignments.length === 0) {
      console.log("No hay asignaciones. Creando asignaciones de muestra...");
      
      // Obtenemos actividades existentes
      const activities = await db.select().from(schema.activities).limit(10);
      
      if (activities.length === 0) {
        console.log("No hay actividades para asignar. Por favor, agregue actividades primero.");
        return;
      }
      
      // Creamos algunas asignaciones de muestra
      for (let i = 0; i < Math.min(instructors.length, activities.length); i++) {
        await db.insert(schema.instructorAssignments).values({
          instructorId: instructors[i].id,
          activityId: activities[i].id,
          parkId: activities[i].parkId,
          title: activities[i].title,
          description: `Asignación para ${instructors[i].fullName || instructors[i].full_name || 'Instructor'} en ${activities[i].title}`,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Una semana después
          status: "active",
          createdBy: 1, // Admin user ID
        });
      }
      
      // Obtenemos las asignaciones recién creadas
      const newAssignments = await db.select().from(schema.instructorAssignments).limit(10);
      console.log(`Creadas ${newAssignments.length} asignaciones nuevas`);
      
      if (newAssignments.length === 0) {
        console.log("Error al crear asignaciones. No se pueden agregar evaluaciones.");
        return;
      }
      
      // Actualizamos nuestra variable de asignaciones
      assignments.push(...newAssignments);
    }
    
    // Lista de evaluaciones de instructores de muestra
    const sampleEvaluations = [];
    
    // Para cada instructor con asignación, creamos evaluaciones
    for (let i = 0; i < Math.min(instructors.length, assignments.length); i++) {
      // Creamos una evaluación positiva
      sampleEvaluations.push({
        instructorId: instructors[i].id,
        assignmentId: assignments[i].id,
        evaluatorId: 1, // Admin o supervisor
        evaluatorType: "supervisor",
        evaluationDate: new Date(),
        professionalism: 4,
        teachingClarity: 5,
        activeParticipation: 4,
        communication: 5,
        groupManagement: 4,
        knowledge: 5,
        methodology: 4,
        overallPerformance: 4,
        comments: "Excelente desempeño. Demuestra gran profesionalismo y habilidades de enseñanza.",
        followUpRequired: false,
      });
      
      // Para algunos instructores, agregamos una segunda evaluación
      if (i % 2 === 0) {
        sampleEvaluations.push({
          instructorId: instructors[i].id,
          assignmentId: assignments[i].id,
          evaluatorId: 2, // Otro evaluador
          evaluatorType: "supervisor",
          evaluationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Un mes atrás
          professionalism: 3,
          teachingClarity: 4,
          activeParticipation: 3,
          communication: 4,
          groupManagement: 3,
          knowledge: 4,
          methodology: 3,
          overallPerformance: 3,
          comments: "Buen instructor, pero debe mejorar en la gestión de grupos y participación activa.",
          followUpRequired: true,
          followUpNotes: "Programar reunión de seguimiento para revisar técnicas de participación activa.",
        });
      }
    }
    
    console.log(`Preparadas ${sampleEvaluations.length} evaluaciones para insertar`);
    
    // Insertar las evaluaciones en la base de datos
    console.log("Insertando evaluaciones de instructores...");
    
    try {
      // Para compatibilidad con la estructura de la tabla
      for (const evaluation of sampleEvaluations) {
        // Utilizamos SQL directo para tener más control sobre la inserción
        const result = await db.execute(sql`
          INSERT INTO "instructor_evaluations" (
            "instructor_id", 
            "assignment_id", 
            "evaluator_id", 
            "evaluator_type", 
            "evaluation_date", 
            "professionalism", 
            "teaching_clarity", 
            "active_participation", 
            "communication", 
            "group_management", 
            "knowledge", 
            "methodology", 
            "overall_performance", 
            "comments", 
            "follow_up_required", 
            "follow_up_notes"
          ) VALUES (
            ${evaluation.instructorId}, 
            ${evaluation.assignmentId}, 
            ${evaluation.evaluatorId}, 
            ${evaluation.evaluatorType}, 
            ${evaluation.evaluationDate}, 
            ${evaluation.professionalism}, 
            ${evaluation.teachingClarity}, 
            ${evaluation.activeParticipation}, 
            ${evaluation.communication}, 
            ${evaluation.groupManagement}, 
            ${evaluation.knowledge}, 
            ${evaluation.methodology}, 
            ${evaluation.overallPerformance}, 
            ${evaluation.comments}, 
            ${evaluation.followUpRequired}, 
            ${evaluation.followUpNotes || null}
          ) RETURNING id
        `);
        
        console.log("Evaluación insertada con ID:", result.rows[0]?.id);
      }
      
      console.log(`${sampleEvaluations.length} evaluaciones de instructores agregadas exitosamente.`);
    } catch (insertError) {
      console.error("Error al insertar evaluaciones:", insertError);
    }
  } catch (error) {
    console.error("Error general al agregar evaluaciones de instructores:", error);
    throw error;
  }
}