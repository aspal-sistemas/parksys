import { db } from './db';
import * as schema from '@shared/schema';

/**
 * Script para agregar reconocimientos de muestra
 */
export async function addSampleRecognitions() {
  try {
    // Buscamos voluntarios existentes para asociar los reconocimientos
    console.log("Buscando voluntarios para asignar reconocimientos...");
    const volunteers = await db.select().from(schema.volunteers).limit(10);
    console.log(`Encontrados ${volunteers.length} voluntarios.`);

    if (volunteers.length === 0) {
      console.log("No hay voluntarios para asignar reconocimientos. Agregue primero voluntarios de muestra.");
      return;
    }

    // Lista de reconocimientos de muestra que agregaremos
    const sampleRecognitions = [
      {
        volunteerId: volunteers[0].id,
        recognitionType: "diploma",
        level: "gold",
        reason: "Contribución excepcional en la reforestación del Parque Metropolitano",
        hoursCompleted: 100,
        issuedById: 1, // Asumimos que el administrador con ID 1 es quien otorga
        additionalComments: "Demostró liderazgo y compromiso excepcional en múltiples jornadas de reforestación",
      },
      {
        volunteerId: volunteers[1].id,
        recognitionType: "medal",
        level: "silver",
        reason: "50 horas de servicio voluntario en mantenimiento de áreas verdes",
        hoursCompleted: 50,
        issuedById: 1,
        additionalComments: null,
      },
      {
        volunteerId: volunteers[2].id,
        recognitionType: "certificate",
        level: "bronze",
        reason: "Completó capacitación de primeros auxilios para actividades al aire libre",
        hoursCompleted: 25,
        issuedById: 1,
        additionalComments: "Demostró habilidades sobresalientes en los ejercicios prácticos",
      },
      {
        volunteerId: volunteers[0].id,
        recognitionType: "level-upgrade",
        level: "platinum",
        reason: "Promoción a coordinador de voluntarios por desempeño excepcional",
        hoursCompleted: 200,
        issuedById: 1,
        additionalComments: "A partir de ahora puede liderar grupos de hasta 10 voluntarios",
      },
      {
        volunteerId: volunteers[3].id,
        recognitionType: "diploma",
        level: "bronze",
        reason: "Participación destacada en programa educativo ambiental",
        hoursCompleted: 20,
        issuedById: 1,
        additionalComments: null,
      }
    ];

    // Insertar los reconocimientos en la base de datos
    console.log("Intentando insertar reconocimientos...");
    try {
      for (const recognition of sampleRecognitions) {
        console.log("Insertando reconocimiento:", recognition);
        const result = await db.insert(schema.volunteerRecognitions).values({
          ...recognition,
          issuedAt: new Date()
        }).returning();
        console.log("Resultado de inserción:", result);
      }
    } catch (insertError) {
      console.error("Error específico al insertar:", insertError);
    }

    console.log(`${sampleRecognitions.length} reconocimientos de muestra agregados exitosamente.`);

  } catch (error) {
    console.error("Error al agregar reconocimientos de muestra:", error);
    throw error;
  }
}