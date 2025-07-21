#!/usr/bin/env node

// Script para eliminar registros duplicados de Elena Morales de manera segura
// Maneja todas las restricciones de clave foránea correctamente

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function cleanElenaDuplicates() {
  try {
    console.log('🧹 Iniciando limpieza de registros duplicados de Elena Morales...');
    
    // Obtener todos los IDs de Elena Morales
    const elenaUsers = await db.execute(sql`
      SELECT id FROM users WHERE full_name = 'Elena Morales' ORDER BY id
    `);
    
    console.log(`📊 Encontrados ${elenaUsers.rows.length} registros de Elena Morales`);
    
    // Mantener solo el primer registro (más antiguo) y eliminar el resto
    if (elenaUsers.rows.length > 1) {
      const keepId = elenaUsers.rows[0].id;
      const deleteIds = elenaUsers.rows.slice(1).map(row => row.id);
      
      console.log(`✅ Manteniendo registro ID: ${keepId}`);
      console.log(`🗑️ Eliminando registros IDs: ${deleteIds.join(', ')}`);
      
      // Eliminar cada registro de manera segura
      for (const userId of deleteIds) {
        console.log(`\n🔄 Procesando usuario ID: ${userId}`);
        
        try {
          await db.execute(sql`
            BEGIN;
            
            -- Eliminar en orden de dependencias
            DELETE FROM instructor_evaluations WHERE instructor_id IN (
              SELECT id FROM instructors WHERE user_id = ${userId}
            );
            DELETE FROM instructor_assignments WHERE instructor_id IN (
              SELECT id FROM instructors WHERE user_id = ${userId}
            );
            DELETE FROM instructors WHERE user_id = ${userId};
            DELETE FROM volunteers WHERE user_id = ${userId};
            DELETE FROM concessionaire_profiles WHERE user_id = ${userId};
            DELETE FROM user_park_favorites WHERE user_id = ${userId};
            DELETE FROM park_evaluations WHERE user_id = ${userId};
            DELETE FROM activity_registrations WHERE user_id = ${userId};
            DELETE FROM incidents WHERE reported_by = ${userId};
            DELETE FROM asset_assignments WHERE assigned_to = ${userId};
            DELETE FROM vacation_requests WHERE employee_id = ${userId};
            DELETE FROM employee_balances WHERE employee_id = ${userId};
            DELETE FROM activity_images WHERE uploaded_by = ${userId};
            DELETE FROM park_images WHERE uploaded_by = ${userId};
            DELETE FROM park_documents WHERE uploaded_by = ${userId};
            
            -- Finalmente eliminar el usuario
            DELETE FROM users WHERE id = ${userId};
            
            COMMIT;
          `);
          
          console.log(`✅ Usuario ID ${userId} eliminado exitosamente`);
          
        } catch (error) {
          console.error(`❌ Error eliminando usuario ID ${userId}:`, error.message);
          try {
            await db.execute(sql`ROLLBACK;`);
          } catch (rollbackError) {
            console.error('Error en rollback:', rollbackError.message);
          }
        }
      }
    }
    
    // Verificar resultado final
    const finalCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM users WHERE full_name = 'Elena Morales'
    `);
    
    console.log(`\n📈 Resultado final: ${finalCount.rows[0].count} registro(s) de Elena Morales`);
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error en la limpieza:', error);
  }
}

cleanElenaDuplicates();