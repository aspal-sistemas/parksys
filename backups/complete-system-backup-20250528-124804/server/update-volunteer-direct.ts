/**
 * Script para actualizar directamente los campos problemáticos de un voluntario
 * Este script es una solución directa y temporal hasta que se pueda integrar correctamente en la aplicación
 */

import { pool } from "./db";

/**
 * Actualiza los campos de experiencia, disponibilidad, días disponibles, intereses y habilidades de un voluntario
 * @param volunteerId ID del voluntario a actualizar
 * @param data Objeto con los datos a actualizar
 * @returns El voluntario actualizado
 */
export async function updateVolunteerFields(
  volunteerId: number,
  data: {
    experience?: string;
    availability?: string;
    availableDays?: string[] | string;
    interestAreas?: string[] | string;
    skills?: string;
  }
) {
  try {
    console.log("🔄 Actualizando campos del voluntario ID:", volunteerId);
    console.log("Datos recibidos:", data);
    
    // Formatear correctamente los arrays para PostgreSQL
    // PostgreSQL acepta el formato '{item1,item2,item3}' para arrays
    const formattedDays = Array.isArray(data.availableDays) 
      ? `{${data.availableDays.join(',')}}` 
      : (typeof data.availableDays === 'string' ? data.availableDays : null);
      
    const formattedInterests = Array.isArray(data.interestAreas) 
      ? `{${data.interestAreas.join(',')}}` 
      : (typeof data.interestAreas === 'string' ? data.interestAreas : null);
    
    // Consulta SQL directa para actualizar todos los campos problemáticos
    const query = `
      UPDATE volunteers 
      SET 
        previous_experience = $1, 
        available_hours = $2,
        available_days = $3,
        interest_areas = $4,
        skills = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    
    console.log("⭐ Actualizando habilidades:", data.skills);
    
    const result = await pool.query(query, [
      data.experience || null, 
      data.availability || "flexible",
      formattedDays,
      formattedInterests,
      data.skills || null,
      volunteerId
    ]);
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Actualización directa exitosa de todos los campos");
      return result.rows[0];
    } else {
      console.error("❌ No se encontró el voluntario con ID:", volunteerId);
      return null;
    }
  } catch (error) {
    console.error("Error al actualizar voluntario:", error);
    return null;
  }
}

// Ejecutar inmediatamente para probar
const voluntarioDemo = {
  // ID del voluntario a actualizar (ajustar según necesidad)
  volunteerId: 11,
  
  // Datos de prueba
  experience: "He participado como voluntario en diversos eventos de reforestación y mantenimiento de áreas verdes durante los últimos 3 años.",
  availability: "weekends",
  availableDays: ["saturday", "sunday"],
  interestAreas: ["nature", "education", "maintenance"]
};

// Auto-ejecutar la función
(async () => {
  try {
    const resultado = await updateVolunteerFields(voluntarioDemo.volunteerId, voluntarioDemo);
    if (resultado) {
      console.log("Resultado completo:", resultado);
      console.log("Proceso completado con éxito");
    } else {
      console.log("No se pudo completar la actualización");
    }
  } catch (err) {
    console.error("Error en la ejecución:", err);
  }
})();