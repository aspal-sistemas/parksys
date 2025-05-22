import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para eliminar todos los usuarios con rol "voluntario"
 * Este script realiza un soft delete cambiando el estado a "inactive"
 * en la tabla de volunteers si existe un registro correspondiente.
 */
async function deleteAllVolunteerUsers() {
  try {
    console.log('Iniciando proceso de eliminación de todos los usuarios voluntarios...');
    
    // 1. Obtener todos los usuarios con rol "voluntario"
    const volunteerUsers = await db.execute(
      sql`SELECT * FROM users WHERE role = 'voluntario'`
    );
    
    if (!volunteerUsers.rows || volunteerUsers.rows.length === 0) {
      console.log('No se encontraron usuarios con rol "voluntario"');
      return;
    }
    
    console.log(`Se encontraron ${volunteerUsers.rows.length} usuarios con rol "voluntario"`);
    
    // 2. Para cada usuario voluntario, buscar si existe en la tabla volunteers y actualizarlo
    let volunteerRecordsUpdated = 0;
    
    for (const user of volunteerUsers.rows) {
      console.log(`Procesando usuario: ${user.id} - ${user.username} (${user.email})`);
      
      // Buscar si existe en la tabla volunteers
      const volunteerResult = await db.execute(
        sql`SELECT * FROM volunteers WHERE email = ${user.email}`
      );
      
      if (volunteerResult.rows && volunteerResult.rows.length > 0) {
        // Si existe, actualizar su estado a "inactive"
        const volunteerId = volunteerResult.rows[0].id;
        await db.execute(
          sql`UPDATE volunteers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ${volunteerId}`
        );
        console.log(`  - Actualizado voluntario ID ${volunteerId} a estado "inactive"`);
        volunteerRecordsUpdated++;
      } else {
        console.log(`  - No se encontró registro en tabla volunteers para ${user.email}`);
      }
    }
    
    console.log('\n=== RESUMEN ===');
    console.log(`Total de usuarios con rol "voluntario": ${volunteerUsers.rows.length}`);
    console.log(`Total de registros en tabla volunteers actualizados: ${volunteerRecordsUpdated}`);
    console.log('=== FIN DEL PROCESO ===\n');
    
    return {
      totalUsers: volunteerUsers.rows.length,
      updatedRecords: volunteerRecordsUpdated,
      users: volunteerUsers.rows.map(u => ({ id: u.id, username: u.username, email: u.email }))
    };
  } catch (error) {
    console.error('Error durante el proceso:', error);
    throw error;
  }
}

// Ejecución directa
deleteAllVolunteerUsers()
  .then(result => {
    console.log('Proceso completado con éxito.');
    console.log(result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el proceso:', error);
    process.exit(1);
  });