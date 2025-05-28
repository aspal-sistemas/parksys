/**
 * Script para actualizar directamente un campo específico de voluntario
 * para pruebas de desarrollo
 */

import { pool } from "./db";

async function updateVolunteerField() {
  try {
    // ID del voluntario que queremos actualizar (ejemplo: ID 11)
    const volunteerId = 11;
    
    // Datos de ejemplo para actualizar
    const experience = "Tengo experiencia como voluntario en parques desde hace 3 años, he participado en reforestaciones y mantenimiento.";
    const availability = "weekends";
    
    console.log(`🔄 Actualizando voluntario ID ${volunteerId}...`);
    
    // Consulta SQL directa para actualizar los campos problemáticos
    const query = `
      UPDATE volunteers 
      SET 
        previous_experience = $1, 
        available_hours = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [experience, availability, volunteerId]);
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Actualización exitosa:");
      console.log({
        id: result.rows[0].id,
        experiencia: result.rows[0].previous_experience,
        disponibilidad: result.rows[0].available_hours
      });
    } else {
      console.log("❌ No se encontró el voluntario con ID:", volunteerId);
    }
  } catch (error) {
    console.error("Error al actualizar voluntario:", error);
  } finally {
    console.log("Proceso completado");
    process.exit(0);
  }
}

// Ejecutar la función
updateVolunteerField();