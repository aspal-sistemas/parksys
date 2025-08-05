/**
 * Script para agregar asignaciones de activos de muestra
 * Este script demuestra el sistema de préstamos de equipamiento
 */

import { db } from "./db";
import { assetAssignments } from "@shared/schema";

export async function addSampleAssetAssignments() {
  console.log("🏗️ Creando asignaciones de activos de muestra...");
  
  try {
    // Datos de muestra para demostrar el sistema
    const sampleAssignments = [
      {
        assetId: 16, // Resbaladilla Gigante Multicolor
        instructorId: 93, // Pablo Cámara
        activityId: 1,
        assignmentDate: new Date('2025-01-01'),
        purpose: "Actividad de juegos infantiles en el parque",
        condition: "excellent",
        status: "active",
        notes: "Asignación para temporada de verano 2025"
      },
      {
        assetId: 17, // Columpio Doble con Cadenas
        instructorId: 92, // María Rojas
        activityId: 2,
        assignmentDate: new Date('2025-01-05'),
        purpose: "Programa de recreación familiar",
        condition: "good",
        status: "active",
        notes: "Revisión previa completada - todo en orden"
      },
      {
        assetId: 18, // Casa de Juegos Temática Pirata
        instructorId: 91, // Alberto Moreno
        activityId: 3,
        assignmentDate: new Date('2025-01-03'),
        returnDate: new Date('2025-01-10'),
        purpose: "Evento temático de piratas",
        condition: "good",
        status: "returned",
        notes: "Evento completado exitosamente - equipo devuelto"
      },
      {
        assetId: 19, // Siguiente activo disponible
        instructorId: 93, // Pablo Cámara
        activityId: 4,
        assignmentDate: new Date('2025-01-02'),
        purpose: "Entrenamiento deportivo juvenil",
        condition: "excellent",
        status: "active",
        notes: "Mantenimiento programado para febrero"
      },
      {
        assetId: 20, // Siguiente activo disponible
        instructorId: 92, // María Rojas
        activityId: 5,
        assignmentDate: new Date('2025-01-08'),
        purpose: "Actividad de educación ambiental",
        condition: "fair",
        status: "maintenance",
        notes: "Reportado desgaste menor - pendiente revisión"
      }
    ];

    // Insertar asignaciones de muestra
    const insertedAssignments = await db
      .insert(assetAssignments)
      .values(sampleAssignments)
      .returning();

    console.log(`✅ Creadas ${insertedAssignments.length} asignaciones de muestra`);
    
    // Mostrar resumen de asignaciones creadas
    insertedAssignments.forEach((assignment, index) => {
      console.log(`   ${index + 1}. Activo ${assignment.assetId} → Instructor ${assignment.instructorId} (${assignment.status})`);
    });

    return insertedAssignments;
  } catch (error) {
    console.error("❌ Error creando asignaciones de muestra:", error);
    throw error;
  }
}

// Ejecutar función directamente
addSampleAssetAssignments()
  .then(() => {
    console.log("🎉 Asignaciones de muestra creadas exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });