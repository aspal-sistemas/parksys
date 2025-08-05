/**
 * Script para actualizar campos específicos del perfil de voluntario
 * Utiliza consultas SQL simples para mayor confiabilidad
 */

import { pool } from "./db";

/**
 * Actualiza la experiencia previa de un voluntario
 * @param volunteerId ID del voluntario
 * @param experience Texto de experiencia previa
 */
export async function updateVolunteerExperience(volunteerId: number, experience: string): Promise<boolean> {
  try {
    console.log(`Actualizando experiencia para voluntario #${volunteerId}:`, experience);
    
    const query = `
      UPDATE volunteers 
      SET previous_experience = $1, updated_at = NOW() 
      WHERE id = $2
    `;
    
    const result = await pool.query(query, [experience || "", volunteerId]);
    
    if (result.rowCount && result.rowCount > 0) {
      console.log("✅ Experiencia actualizada correctamente");
      return true;
    } else {
      console.log("❌ No se encontró el voluntario");
      return false;
    }
  } catch (error) {
    console.error("Error al actualizar experiencia:", error);
    return false;
  }
}

/**
 * Actualiza la disponibilidad de un voluntario
 * @param volunteerId ID del voluntario
 * @param availability Texto de disponibilidad
 */
export async function updateVolunteerAvailability(volunteerId: number, availability: string): Promise<boolean> {
  try {
    console.log(`Actualizando disponibilidad para voluntario #${volunteerId}:`, availability);
    
    const query = `
      UPDATE volunteers 
      SET available_hours = $1, updated_at = NOW() 
      WHERE id = $2
    `;
    
    const result = await pool.query(query, [availability || "flexible", volunteerId]);
    
    if (result.rowCount && result.rowCount > 0) {
      console.log("✅ Disponibilidad actualizada correctamente");
      return true;
    } else {
      console.log("❌ No se encontró el voluntario");
      return false;
    }
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    return false;
  }
}

/**
 * Actualiza días disponibles de un voluntario
 * @param volunteerId ID del voluntario
 * @param days Array o string con días disponibles
 */
export async function updateVolunteerDays(volunteerId: number, days: string[] | string): Promise<boolean> {
  try {
    console.log(`Actualizando días disponibles para voluntario #${volunteerId}:`, days);
    
    // Convierte a formato de string JSON si es un array
    const daysValue = Array.isArray(days) ? JSON.stringify(days) : days;
    
    const query = `
      UPDATE volunteers 
      SET available_days = $1, updated_at = NOW() 
      WHERE id = $2
    `;
    
    const result = await pool.query(query, [daysValue || "[]", volunteerId]);
    
    if (result.rowCount && result.rowCount > 0) {
      console.log("✅ Días disponibles actualizados correctamente");
      return true;
    } else {
      console.log("❌ No se encontró el voluntario");
      return false;
    }
  } catch (error) {
    console.error("Error al actualizar días disponibles:", error);
    return false;
  }
}

/**
 * Actualiza áreas de interés de un voluntario
 * @param volunteerId ID del voluntario
 * @param interestAreas Array o string con áreas de interés
 */
export async function updateVolunteerInterests(volunteerId: number, interestAreas: string[] | string): Promise<boolean> {
  try {
    console.log(`Actualizando áreas de interés para voluntario #${volunteerId}:`, interestAreas);
    
    // Convierte a formato de string JSON si es un array
    const interestsValue = Array.isArray(interestAreas) ? JSON.stringify(interestAreas) : interestAreas;
    
    const query = `
      UPDATE volunteers 
      SET interest_areas = $1, updated_at = NOW() 
      WHERE id = $2
    `;
    
    const result = await pool.query(query, [interestsValue || "[]", volunteerId]);
    
    if (result.rowCount && result.rowCount > 0) {
      console.log("✅ Áreas de interés actualizadas correctamente");
      return true;
    } else {
      console.log("❌ No se encontró el voluntario");
      return false;
    }
  } catch (error) {
    console.error("Error al actualizar áreas de interés:", error);
    return false;
  }
}