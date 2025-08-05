/**
 * Script directo para actualizar habilidades de un voluntario específico
 * 
 * Este script se ejecuta una sola vez para actualizar el campo skills
 * de un voluntario en la base de datos.
 */

import { pool } from "./db";

async function updateVolunteerSkillsDirectly() {
  // ID del voluntario a actualizar - estamos usando el ID 11 basado en los logs previos
  const volunteerId = 11;
  
  // Nuevas habilidades a establecer
  const newSkills = "Jardinería, plomería, carpintería";
  
  try {
    console.log(`📝 Actualizando habilidades para el voluntario ID ${volunteerId}`);
    console.log(`Nuevas habilidades: "${newSkills}"`);
    
    // Consulta SQL directa con solo un parámetro para minimizar problemas
    const query = `
      UPDATE volunteers 
      SET skills = '${newSkills}', updated_at = NOW() 
      WHERE id = ${volunteerId} 
      RETURNING *
    `;
    
    const result = await pool.query(query);
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Habilidades actualizadas correctamente");
      console.log("Resultado:", result.rows[0]);
    } else {
      console.error("❌ No se encontró el voluntario o no se pudo actualizar");
    }
  } catch (error) {
    console.error("Error al actualizar habilidades:", error);
  }
}

// Ejecutar inmediatamente
updateVolunteerSkillsDirectly();