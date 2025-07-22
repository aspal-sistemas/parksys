// Script directo para actualizar un voluntario específico con datos de prueba
import { db } from './db.js';
import { sql } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';

async function updateVolunteer() {
  const volunteerId = 11; // ID del voluntario que queremos actualizar
  
  try {
    console.log('Actualizando voluntario ID', volunteerId);
    
    // Actualizamos los campos problemáticos directamente
    const result = await db.execute(
      sql`UPDATE volunteers SET 
          previous_experience = 'Tengo experiencia previa como voluntario en eventos deportivos y actividades comunitarias.',
          available_hours = 'evenings',
          interest_areas = '[{"id": "nature", "label": "Naturaleza"}, {"id": "education", "label": "Educación"}]'::jsonb,
          updated_at = NOW()
          WHERE id = ${volunteerId} RETURNING *`
    );
    
    if (result.rows && result.rows.length > 0) {
      console.log('✅ Voluntario actualizado correctamente:', {
        id: result.rows[0].id,
        experiencia: result.rows[0].previous_experience,
        disponibilidad: result.rows[0].available_hours,
        intereses: result.rows[0].interest_areas
      });
    } else {
      console.log('❌ No se encontró el voluntario');
    }
    
  } catch (error) {
    console.error('Error al actualizar voluntario:', error);
  }
}

updateVolunteer();