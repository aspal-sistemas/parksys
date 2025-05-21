import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para limpieza definitiva de instructores duplicados
 * usando estrategia manual de eliminación directa
 */
async function forceCleanupDuplicates() {
  try {
    console.log("Iniciando limpieza forzada de instructores duplicados...");

    // 1. Primero vamos a obtener todos los instructores duplicados agrupados por nombre
    const duplicatesByNameQuery = sql`
      SELECT LOWER(full_name) as name_key, COUNT(*) as count
      FROM instructors
      GROUP BY LOWER(full_name)
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    const duplicateNames = await db.execute(duplicatesByNameQuery);
    console.log(`Se encontraron ${duplicateNames.rows?.length || 0} nombres duplicados.`);

    // 2. Para cada nombre duplicado, vamos a conservar solo el registro más reciente
    for (const item of duplicateNames.rows || []) {
      const nameKey = item.name_key;
      console.log(`\nProcesando duplicados para nombre: "${nameKey}" (${item.count} registros)`);

      // Obtenemos todos los registros con este nombre
      const recordsQuery = sql`
        SELECT id, full_name, email, created_at
        FROM instructors
        WHERE LOWER(full_name) = ${nameKey}
        ORDER BY created_at DESC
      `;

      const records = await db.execute(recordsQuery);
      
      if (!records.rows || records.rows.length <= 1) {
        console.log(`  No se encontraron múltiples registros para este nombre.`);
        continue;
      }

      // El primer registro es el que conservaremos (el más reciente)
      const keepRecord = records.rows[0];
      console.log(`  Manteniendo registro: ID ${keepRecord.id} (${keepRecord.full_name})`);

      // Eliminar los demás registros
      for (let i = 1; i < records.rows.length; i++) {
        const deleteId = records.rows[i].id;
        console.log(`  Eliminando duplicado: ID ${deleteId}`);
        
        try {
          // Eliminar directamente
          await db.execute(sql`DELETE FROM instructors WHERE id = ${deleteId}`);
          console.log(`  ✓ Eliminado: ID ${deleteId}`);
        } catch (err) {
          console.error(`  ✗ Error al eliminar ID ${deleteId}:`, err);
        }
      }
    }

    // 3. Ahora hacemos lo mismo para duplicados por email
    const duplicatesByEmailQuery = sql`
      SELECT LOWER(email) as email_key, COUNT(*) as count
      FROM instructors
      GROUP BY LOWER(email)
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    const duplicateEmails = await db.execute(duplicatesByEmailQuery);
    console.log(`\nSe encontraron ${duplicateEmails.rows?.length || 0} emails duplicados.`);

    // Para cada email duplicado, conservamos solo el registro más reciente
    for (const item of duplicateEmails.rows || []) {
      const emailKey = item.email_key;
      console.log(`\nProcesando duplicados para email: "${emailKey}" (${item.count} registros)`);

      // Obtenemos todos los registros con este email
      const recordsQuery = sql`
        SELECT id, full_name, email, created_at
        FROM instructors
        WHERE LOWER(email) = ${emailKey}
        ORDER BY created_at DESC
      `;

      const records = await db.execute(recordsQuery);
      
      if (!records.rows || records.rows.length <= 1) {
        console.log(`  No se encontraron múltiples registros para este email.`);
        continue;
      }

      // El primer registro es el que conservaremos (el más reciente)
      const keepRecord = records.rows[0];
      console.log(`  Manteniendo registro: ID ${keepRecord.id} (${keepRecord.full_name})`);

      // Eliminar los demás registros
      for (let i = 1; i < records.rows.length; i++) {
        const deleteId = records.rows[i].id;
        console.log(`  Eliminando duplicado: ID ${deleteId}`);
        
        try {
          // Eliminar directamente
          await db.execute(sql`DELETE FROM instructors WHERE id = ${deleteId}`);
          console.log(`  ✓ Eliminado: ID ${deleteId}`);
        } catch (err) {
          console.error(`  ✗ Error al eliminar ID ${deleteId}:`, err);
        }
      }
    }

    console.log("\nLimpieza forzada completada con éxito.");
  } catch (error) {
    console.error("Error en la limpieza forzada:", error);
  }
}

// Ejecutar el script
forceCleanupDuplicates()
  .then(() => {
    console.log("Proceso completado.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  });