/**
 * Script de fuerza para sincronizar un instructor específico
 */

import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Fuerza la sincronización entre usuario e instructor para un ID específico
 */
export async function forceSyncInstructor(instructorId: number) {
  try {
    // 1. Obtener el instructor
    const instructorResult = await db.execute(
      sql`SELECT * FROM instructors WHERE id = ${instructorId}`
    );
    
    if (!instructorResult.rows || instructorResult.rows.length === 0) {
      console.log(`❌ No se encontró un instructor con ID ${instructorId}`);
      return { success: false, message: "Instructor no encontrado" };
    }
    
    const instructor = instructorResult.rows[0];
    console.log(`✅ Instructor encontrado: ${instructor.full_name}, ID: ${instructor.id}`);
    
    // 2. Si no tiene user_id, no podemos sincronizar
    if (!instructor.user_id) {
      console.log(`❌ El instructor no está vinculado a un usuario del sistema`);
      return { success: false, message: "El instructor no está vinculado a un usuario" };
    }
    
    // 3. Obtener el usuario vinculado
    const userResult = await db.execute(
      sql`SELECT * FROM users WHERE id = ${instructor.user_id}`
    );
    
    if (!userResult.rows || userResult.rows.length === 0) {
      console.log(`❌ No se encontró un usuario con ID ${instructor.user_id}`);
      return { success: false, message: "Usuario vinculado no encontrado" };
    }
    
    const user = userResult.rows[0];
    console.log(`✅ Usuario encontrado: ${user.username}, ID: ${user.id}`);
    
    // 4. Obtener el nombre completo actualizado
    let fullName;
    if (user.firstName && user.lastName) {
      // Prioridad 1: Usar firstName y lastName si están disponibles
      fullName = `${user.firstName} ${user.lastName}`;
    } else if (user.fullName) {
      // Prioridad 2: Usar fullName si está disponible
      fullName = user.fullName;
    } else {
      // Conservar el nombre actual
      fullName = instructor.full_name;
    }
    
    console.log(`🔄 Actualizando instructor con nombre: ${fullName}`);
    
    // 5. Actualizar el perfil de instructor
    const updateResult = await db.execute(
      sql`UPDATE instructors 
          SET full_name = ${fullName},
              email = ${user.email || instructor.email},
              phone = ${user.phone || instructor.phone},
              profile_image_url = ${user.profileImageUrl || instructor.profile_image_url},
              gender = ${user.gender || instructor.gender},
              bio = ${user.bio || instructor.bio},
              updated_at = NOW()
          WHERE id = ${instructor.id}
          RETURNING *`
    );
    
    if (!updateResult.rows || updateResult.rows.length === 0) {
      console.log(`❌ Error al actualizar el instructor`);
      return { success: false, message: "Error al actualizar el instructor" };
    }
    
    console.log(`✅ Instructor actualizado correctamente: ${updateResult.rows[0].full_name}`);
    return { 
      success: true, 
      message: "Instructor actualizado correctamente",
      data: updateResult.rows[0]
    };
  } catch (error) {
    console.error("❌ Error al sincronizar instructor:", error);
    return { 
      success: false, 
      message: "Error al sincronizar instructor",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}