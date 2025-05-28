/**
 * Script especializado para la actualización de habilidades de voluntarios
 * Este enfoque permite aislar la funcionalidad de actualización de habilidades
 * para resolver el problema específico.
 */

import { pool } from "./db";

/**
 * Actualiza las habilidades de un voluntario
 * @param volunteerId ID del voluntario a actualizar
 * @param skills Nuevas habilidades (string separado por comas)
 * @returns Datos del voluntario actualizado o null si no se encontró
 */
export async function updateVolunteerSkills(volunteerId: number, skills: string) {
  try {
    console.log(`🔧 Iniciando actualización de habilidades para voluntario ID: ${volunteerId}`);
    console.log(`📝 Nuevas habilidades: "${skills}"`);
    
    if (!skills) {
      skills = ""; // Si no se proporciona un valor, usar cadena vacía
    }
    
    // Consulta SQL para actualizar solo las habilidades
    // Usamos parámetros para evitar inyección SQL
    const query = `
      UPDATE volunteers 
      SET skills = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await pool.query(query, [skills, volunteerId]);
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Habilidades actualizadas correctamente");
      return result.rows[0];
    } else {
      console.log("❌ No se encontró el voluntario con ID:", volunteerId);
      return null;
    }
  } catch (error) {
    console.error("Error al actualizar habilidades:", error);
    throw error;
  }
}