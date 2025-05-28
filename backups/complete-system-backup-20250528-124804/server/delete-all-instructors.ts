/**
 * Script para inactivar todos los instructores en el sistema
 * Cambia el estado a "inactive" en la tabla de instructors
 */
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function deleteAllInstructors() {
  try {
    console.log('Iniciando proceso de inactivación de todos los instructores...');
    
    // 1. Obtener todos los instructores activos
    const activeInstructors = await db.execute(
      sql`SELECT id, full_name, email FROM instructors WHERE status = 'active'`
    );
    
    if (!activeInstructors.rows || activeInstructors.rows.length === 0) {
      console.log('No se encontraron instructores activos');
      return { 
        success: true,
        message: 'No se encontraron instructores activos',
        count: 0
      };
    }
    
    const instructorIds = activeInstructors.rows.map(instructor => instructor.id);
    console.log(`Se encontraron ${instructorIds.length} instructores activos: ${instructorIds.join(', ')}`);
    
    // 2. Actualizar el estado de los instructores a "inactive"
    const updateResult = await db.execute(
      sql`UPDATE instructors SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE status = 'active'`
    );
    
    const instructorsInactivated = updateResult.rowCount || 0;
    console.log(`Se actualizaron ${instructorsInactivated} instructores a estado "inactive"`);
    
    // 3. Identificar usuarios con rol "instructor"
    const instructorUsers = await db.execute(
      sql`SELECT id, username, email, role FROM users WHERE role = 'instructor'`
    );
    
    if (instructorUsers.rows && instructorUsers.rows.length > 0) {
      console.log('Los siguientes usuarios con rol "instructor" están asociados:');
      instructorUsers.rows.forEach(user => {
        console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
      });
    }
    
    return {
      success: true,
      message: `Se han inactivado ${instructorsInactivated} instructores.`,
      count: instructorIds.length,
      inactivatedInstructors: instructorsInactivated
    };
  } catch (error: any) {
    console.error('Error durante el proceso de inactivación de instructores:', error);
    return {
      success: false,
      message: `Error al inactivar instructores: ${error.message}`
    };
  }
}

// Función para inactivar un instructor específico por ID
export async function deleteInstructor(id: number) {
  try {
    console.log(`Inactivando instructor con ID: ${id}`);
    
    // Verificar si el instructor existe
    const instructorResult = await db.execute(
      sql`SELECT id, full_name, email FROM instructors WHERE id = ${id}`
    );
    
    if (!instructorResult.rows || instructorResult.rows.length === 0) {
      console.log(`No se encontró instructor con ID ${id}`);
      return { 
        success: false,
        message: `No se encontró instructor con ID ${id}` 
      };
    }
    
    // Actualizar el estado a "inactive"
    await db.execute(
      sql`UPDATE instructors SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
    );
    
    console.log(`Instructor con ID ${id} inactivado correctamente`);
    
    return {
      success: true,
      message: `Instructor inactivado correctamente`
    };
  } catch (error: any) {
    console.error(`Error al inactivar instructor con ID ${id}:`, error);
    return {
      success: false,
      message: `Error al inactivar instructor: ${error.message}`
    };
  }
}