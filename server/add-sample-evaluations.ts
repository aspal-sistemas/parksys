import { db } from './db';
import { evaluations } from '@shared/schema';

/**
 * Script para agregar evaluaciones de muestra
 */
export async function addSampleEvaluations() {
  try {
    // Buscamos participaciones existentes para asociar las evaluaciones
    const participations = await db.query.participations.findMany({
      limit: 10,
    });

    if (participations.length === 0) {
      console.log("No hay participaciones para asignar evaluaciones. Agregue primero participaciones de muestra.");
      return;
    }

    // Lista de evaluaciones de muestra que agregaremos
    const sampleEvaluations = [
      {
        participationId: participations[0].id,
        volunteerId: participations[0].volunteerId,
        evaluatorId: 1, // Asumimos que el administrador con ID 1 es el evaluador
        punctuality: 4,
        attitude: 5,
        responsibility: 4,
        overallPerformance: 4,
        comments: "Excelente actitud y puntualidad. Siempre dispuesto a ayudar más allá de sus responsabilidades.",
        followUpRequired: false,
      },
      {
        participationId: participations[1].id,
        volunteerId: participations[1].volunteerId,
        evaluatorId: 1,
        punctuality: 3,
        attitude: 4,
        responsibility: 3,
        overallPerformance: 3,
        comments: "Buen trabajo en general, pero necesita mejorar su puntualidad.",
        followUpRequired: true,
      },
      {
        participationId: participations[2].id,
        volunteerId: participations[2].volunteerId,
        evaluatorId: 1,
        punctuality: 5,
        attitude: 4,
        responsibility: 5,
        overallPerformance: 5,
        comments: "Voluntario ejemplar, siempre cumple con sus tareas a tiempo y con buena actitud.",
        followUpRequired: false,
      },
      {
        participationId: participations[3].id,
        volunteerId: participations[3].volunteerId,
        evaluatorId: 1,
        punctuality: 4,
        attitude: 3,
        responsibility: 4,
        overallPerformance: 4,
        comments: "Buen desempeño técnico, pero podría mejorar su trato con los demás voluntarios.",
        followUpRequired: true,
      },
      {
        participationId: participations[4].id,
        volunteerId: participations[4].volunteerId,
        evaluatorId: 1,
        punctuality: 5,
        attitude: 5,
        responsibility: 5,
        overallPerformance: 5,
        comments: "Desempeño sobresaliente en todos los aspectos. Candidato ideal para roles de liderazgo.",
        followUpRequired: false,
      }
    ];

    // Insertar las evaluaciones en la base de datos
    for (const evaluation of sampleEvaluations) {
      await db.insert(evaluations).values({
        ...evaluation,
        createdAt: new Date()
      });
    }

    console.log(`${sampleEvaluations.length} evaluaciones de muestra agregadas exitosamente.`);

  } catch (error) {
    console.error("Error al agregar evaluaciones de muestra:", error);
    throw error;
  }
}