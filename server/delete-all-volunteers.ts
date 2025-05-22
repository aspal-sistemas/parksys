import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para eliminar (soft delete) todos los usuarios con rol de voluntario
 * Cambia el estado a "inactive" en la tabla de volunteers
 * y establece un status especial en la tabla de users
 */
export async function deleteAllVolunteers() {
  try {
    console.log('Iniciando proceso de eliminación de todos los voluntarios...');
    
    // 1. Identificar todos los usuarios con rol "voluntario"
    const volunteerUsers = await db.execute(
      sql`SELECT id, username, email, role FROM users WHERE role = 'voluntario'`
    );
    
    if (!volunteerUsers.rows || volunteerUsers.rows.length === 0) {
      console.log('No se encontraron usuarios con rol de voluntario');
      return { 
        success: true,
        message: 'No se encontraron usuarios con rol de voluntario',
        count: 0
      };
    }
    
    const userIds = volunteerUsers.rows.map(user => user.id);
    console.log(`Se encontraron ${userIds.length} usuarios con rol de voluntario: ${userIds.join(', ')}`);
    
    // 2. Actualizar el estado de los registros en la tabla volunteers a "inactive"
    const volunteerUpdateResult = await db.execute(
      sql`UPDATE volunteers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
          WHERE id IN (
            SELECT v.id FROM volunteers v
            JOIN users u ON v.email = u.email
            WHERE u.role = 'voluntario'
          )`
    );
    
    const volunteersInactivated = volunteerUpdateResult.rowCount || 0;
    console.log(`Se actualizaron ${volunteersInactivated} registros en la tabla volunteers a estado "inactive"`);
    
    // 3. No eliminamos los usuarios, solo imprimimos la información
    console.log('Los siguientes usuarios con rol "voluntario" podrían ser eliminados:');
    volunteerUsers.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    return {
      success: true,
      message: `Se han inactivado ${volunteersInactivated} registros de voluntarios.`,
      count: userIds.length,
      inactivatedVolunteers: volunteersInactivated,
      volunteerUserIds: userIds
    };
  } catch (error) {
    console.error('Error durante el proceso de eliminación de voluntarios:', error);
    return {
      success: false,
      message: `Error al eliminar voluntarios: ${error.message}`,
      error
    };
  }
}

// Función para eliminar un voluntario específico
export async function deleteVolunteer(id: number) {
  try {
    console.log(`Iniciando proceso de eliminación del voluntario con ID ${id}...`);
    
    // 1. Verificar si el usuario existe y tiene rol de voluntario
    const userResult = await db.execute(
      sql`SELECT id, username, email, role FROM users WHERE id = ${id}`
    );
    
    if (!userResult.rows || userResult.rows.length === 0) {
      console.log(`No se encontró ningún usuario con ID ${id}`);
      return { 
        success: false,
        message: `No se encontró ningún usuario con ID ${id}`
      };
    }
    
    const user = userResult.rows[0];
    if (user.role !== 'voluntario') {
      console.log(`El usuario con ID ${id} no tiene rol de voluntario, su rol es: ${user.role}`);
      return { 
        success: false,
        message: `El usuario con ID ${id} no tiene rol de voluntario, su rol es: ${user.role}`
      };
    }
    
    // 2. Actualizar el estado del registro en la tabla volunteers a "inactive"
    const volunteerUpdateResult = await db.execute(
      sql`UPDATE volunteers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
          WHERE email = ${user.email}`
    );
    
    const volunteersInactivated = volunteerUpdateResult.rowCount || 0;
    console.log(`Se actualizaron ${volunteersInactivated} registros en la tabla volunteers a estado "inactive" para el usuario ${user.email}`);
    
    return {
      success: true,
      message: `El voluntario con ID ${id} (${user.username}) ha sido inactivado correctamente.`,
      inactivatedVolunteers: volunteersInactivated
    };
  } catch (error) {
    console.error(`Error durante el proceso de eliminación del voluntario con ID ${id}:`, error);
    return {
      success: false,
      message: `Error al eliminar el voluntario con ID ${id}: ${error.message}`,
      error
    };
  }
}