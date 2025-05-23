/**
 * Script para sincronizar el perfil de instructor cuando se actualiza un usuario
 */

import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Sincroniza los datos entre un usuario y su perfil de instructor
 * 
 * @param userId ID del usuario con rol 'instructor'
 * @returns Resultado de la operación
 */
export async function syncInstructorProfileWithUser(userId: number) {
  try {
    console.log(`🔄 Sincronizando perfil de instructor para usuario ID: ${userId}`);
    
    // 1. Verificar que el usuario existe y tiene rol instructor
    const userResult = await db.execute(
      sql`SELECT * FROM users WHERE id = ${userId} AND role = 'instructor'`
    );
    
    if (!userResult.rows || userResult.rows.length === 0) {
      console.log(`❌ No se encontró un usuario con ID ${userId} y rol instructor`);
      return { success: false, message: "Usuario no encontrado o no es instructor" };
    }
    
    const user = userResult.rows[0];
    console.log(`✅ Usuario encontrado: ${user.username}, Nombre: ${user.fullName || `${user.firstName} ${user.lastName}`}`);
    
    // 2. Verificar si existe un registro de instructor asociado
    const instructorResult = await db.execute(
      sql`SELECT * FROM instructors WHERE user_id = ${userId}`
    );
    
    // 3. Obtener el nombre completo del usuario (priorizar firstName + lastName)
    let fullName;
    if (user.firstName && user.lastName) {
      // Prioridad 1: Usar firstName y lastName actuales
      fullName = `${user.firstName} ${user.lastName}`;
    } else if (user.fullName) {
      // Prioridad 2: Usar fullName si está disponible
      fullName = user.fullName;
    }
    
    // 4. Sincronizar datos básicos
    if (instructorResult.rows && instructorResult.rows.length > 0) {
      // Actualizar instructor existente
      const instructor = instructorResult.rows[0];
      console.log(`✅ Perfil de instructor encontrado con ID: ${instructor.id}`);
      
      // Preparar datos para actualización (forzar actualización del nombre)
      const updateResult = await db.execute(
        sql`UPDATE instructors 
            SET full_name = ${fullName ? fullName : instructor.full_name},
                email = ${user.email || instructor.email},
                phone = ${user.phone || instructor.phone},
                profile_image_url = ${user.profileImageUrl || instructor.profile_image_url},
                gender = ${user.gender || instructor.gender},
                address = ${user.address || instructor.address},
                bio = ${user.bio || instructor.bio},
                updated_at = NOW()
            WHERE id = ${instructor.id}
            RETURNING *`
      );
      
      console.log(`✅ Perfil de instructor actualizado correctamente: ${updateResult.rows[0].full_name}`);
      return { 
        success: true, 
        message: "Perfil de instructor actualizado correctamente",
        data: updateResult.rows[0]
      };
    } else {
      // No hay instructor asociado, verificar si hay algún instructor con el mismo email
      const emailCheckResult = await db.execute(
        sql`SELECT * FROM instructors WHERE email = ${user.email} LIMIT 1`
      );
      
      if (emailCheckResult.rows && emailCheckResult.rows.length > 0) {
        // Conectar instructor existente con usuario
        const instructorByEmail = emailCheckResult.rows[0];
        
        const linkResult = await db.execute(
          sql`UPDATE instructors 
              SET user_id = ${userId}, 
                  full_name = ${fullName || instructorByEmail.full_name},
                  email = ${user.email || instructorByEmail.email},
                  profile_image_url = ${user.profileImageUrl || instructorByEmail.profile_image_url},
                  phone = ${user.phone || instructorByEmail.phone},
                  updated_at = NOW()
              WHERE id = ${instructorByEmail.id}
              RETURNING *`
        );
        
        console.log(`✅ Instructor existente vinculado al usuario: ${linkResult.rows[0].full_name}`);
        return { 
          success: true, 
          message: "Instructor existente vinculado al usuario",
          data: linkResult.rows[0]
        };
      } else {
        console.log(`⚠️ No se encontró un perfil de instructor para vincular. Se creará uno nuevo.`);
        
        // Crear nuevo instructor con datos básicos
        const newInstructorResult = await db.execute(
          sql`INSERT INTO instructors (
                full_name, 
                email, 
                phone,
                gender,
                bio,
                specialties,
                experience_years,
                status,
                profile_image_url,
                user_id,
                created_at,
                updated_at
              ) VALUES (
                ${fullName},
                ${user.email},
                ${user.phone || null},
                ${user.gender || null},
                ${user.bio || null},
                ${user.specialties ? JSON.stringify(user.specialties).replace(/[\[\]"]/g, '') : 'Actividades generales'},
                ${user.experience ? parseInt(user.experience) : 1},
                'active',
                ${user.profileImageUrl || null},
                ${userId},
                NOW(),
                NOW()
              ) RETURNING *`
        );
        
        console.log(`✅ Nuevo perfil de instructor creado: ${newInstructorResult.rows[0].full_name}`);
        return { 
          success: true, 
          message: "Nuevo perfil de instructor creado",
          data: newInstructorResult.rows[0]
        };
      }
    }
  } catch (error) {
    console.error("❌ Error al sincronizar perfil de instructor:", error);
    return { 
      success: false, 
      message: "Error al sincronizar perfil de instructor",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}