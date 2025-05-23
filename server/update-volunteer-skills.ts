/**
 * Script especializado para actualizar el campo de habilidades (skills) de un voluntario
 */

import { pool } from "./db";

/**
 * Actualiza directamente las habilidades de un voluntario
 * 
 * @param volunteerId ID del voluntario
 * @param skills Nuevas habilidades
 * @returns Resultado de la operación
 */
export async function updateVolunteerSkills(
  volunteerId: number,
  skills: string
) {
  try {
    console.log("🔧 Actualizando SOLO LAS HABILIDADES del voluntario ID:", volunteerId);
    console.log("Nuevas habilidades:", skills);
    
    // Query directa y simple para actualizar ÚNICAMENTE las habilidades
    const query = `
      UPDATE volunteers 
      SET skills = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await pool.query(query, [skills, volunteerId]);
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Habilidades actualizadas correctamente a:", skills);
      return result.rows[0];
    } else {
      console.error("❌ No se encontró el voluntario con ID:", volunteerId);
      return null;
    }
  } catch (error) {
    console.error("Error al actualizar habilidades:", error);
    return null;
  }
}