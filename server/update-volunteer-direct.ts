import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';

async function updateVolunteerProfile() {
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: No DATABASE_URL encontrado en variables de entorno");
    return;
  }

  // Conecta directamente a la base de datos
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    // ID del voluntario que queremos actualizar
    const volunteerId = 11;
    
    // Actualiza el perfil directamente con SQL plano
    const query = `
      UPDATE volunteers 
      SET 
        previous_experience = 'Tengo experiencia previa como voluntario en eventos deportivos y comunitarios.', 
        available_hours = 'evenings',
        available_days = '["weekdays"]',
        interest_areas = '["nature", "education"]',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [volunteerId]);
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Voluntario actualizado exitosamente:", result.rows[0]);
    } else {
      console.log("❌ No se encontró el voluntario");
    }
  } catch (error) {
    console.error("Error al actualizar el voluntario:", error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la función
updateVolunteerProfile()
  .then(() => console.log("Script completado"))
  .catch(err => console.error("Error en script:", err));