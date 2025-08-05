/**
 * Script para probar la actualización de un voluntario
 */
import { updateExperienceAndAvailability } from './volunteer-fields-updater';
import { pool } from "./db";

async function testVolunteerUpdate() {
  try {
    console.log("📋 Iniciando prueba de actualización de voluntario...");

    const volunteerId = 11;
    const experience = "He trabajado como voluntario en proyectos de reforestación durante 5 años y tengo experiencia en trabajo comunitario.";
    const availability = "weekends";

    // Verificamos el estado actual del voluntario
    const currentQuery = `SELECT previous_experience, available_hours FROM volunteers WHERE id = $1`;
    const currentResult = await pool.query(currentQuery, [volunteerId]);
    
    if (currentResult.rows.length === 0) {
      console.log("❌ No se encontró el voluntario con ID:", volunteerId);
      return;
    }

    console.log("📊 Estado actual del voluntario:", {
      experiencia: currentResult.rows[0].previous_experience,
      disponibilidad: currentResult.rows[0].available_hours
    });

    // Actualizamos el voluntario usando nuestro nuevo método
    console.log("🔄 Actualizando voluntario con nueva experiencia y disponibilidad...");
    const updatedVolunteer = await updateExperienceAndAvailability(
      volunteerId,
      experience,
      availability
    );

    if (!updatedVolunteer) {
      console.log("❌ No se pudo actualizar el voluntario");
      return;
    }

    console.log("✅ Voluntario actualizado exitosamente");
    console.log("📊 Nuevos valores:", {
      experiencia: updatedVolunteer.previous_experience,
      disponibilidad: updatedVolunteer.available_hours
    });

    // Verificamos que los valores se hayan guardado en la base de datos
    const verifyQuery = `SELECT previous_experience, available_hours FROM volunteers WHERE id = $1`;
    const verifyResult = await pool.query(verifyQuery, [volunteerId]);
    
    console.log("📊 Valores verificados en base de datos:", {
      experiencia: verifyResult.rows[0].previous_experience,
      disponibilidad: verifyResult.rows[0].available_hours
    });

    console.log("✅ Prueba completada con éxito");
  } catch (error) {
    console.error("❌ Error durante la prueba:", error);
  } finally {
    // Cerramos la conexión
    await pool.end();
  }
}

// Ejecutamos la prueba
testVolunteerUpdate();