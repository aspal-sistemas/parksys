/**
 * Script para crear la tabla asset_history y agregar datos de prueba
 */
import { pool } from './db';

export async function createAssetHistoryTable() {
  try {
    console.log('📋 Creando tabla asset_history...');
    
    // Crear tabla asset_history si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS asset_history (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER NOT NULL,
        date DATE NOT NULL,
        change_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        changed_by TEXT,
        previous_value TEXT,
        new_value TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabla asset_history creada');

    // Agregar algunos registros de historial para el activo 16 (Resbaladilla Gigante Multicolor)
    const historyEntries = [
      {
        asset_id: 16,
        date: '2024-01-15',
        change_type: 'acquisition',
        description: 'Adquisición inicial de la resbaladilla gigante multicolor para el Parque Metropolitano',
        changed_by: 'Sistema de Adquisiciones',
        notes: 'Compra realizada a través del proveedor autorizado PlayMax Equipment'
      },
      {
        asset_id: 16,
        date: '2024-03-10',
        change_type: 'update',
        description: 'Actualización de ubicación específica dentro del parque',
        changed_by: 'Luis Romahn',
        previous_value: 'Área general de juegos',
        new_value: 'Zona de juegos infantiles - Sector Norte',
        notes: 'Reubicación para mejor distribución del espacio'
      },
      {
        asset_id: 16,
        date: '2024-06-20',
        change_type: 'maintenance',
        description: 'Primer mantenimiento preventivo programado',
        changed_by: 'Equipo de Mantenimiento',
        notes: 'Inspección completa, limpieza y lubricación de componentes'
      },
      {
        asset_id: 16,
        date: '2024-09-15',
        change_type: 'update',
        description: 'Actualización de estado de conservación',
        changed_by: 'Inspector de Seguridad',
        previous_value: 'Excelente',
        new_value: 'Bueno',
        notes: 'Desgaste normal por uso intensivo durante temporada alta'
      },
      {
        asset_id: 16,
        date: '2024-12-01',
        change_type: 'maintenance',
        description: 'Mantenimiento correctivo por desgaste en barandillas',
        changed_by: 'Técnico Especializado',
        notes: 'Reemplazo de elementos de seguridad y aplicación de tratamiento antideslizante'
      }
    ];

    for (const entry of historyEntries) {
      await pool.query(`
        INSERT INTO asset_history (asset_id, date, change_type, description, changed_by, previous_value, new_value, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        entry.asset_id,
        entry.date,
        entry.change_type,
        entry.description,
        entry.changed_by,
        entry.previous_value || null,
        entry.new_value || null,
        entry.notes
      ]);
    }

    console.log(`✅ Se agregaron ${historyEntries.length} registros de historial para el activo 16`);

    // Verificar que se crearon correctamente
    const result = await pool.query('SELECT COUNT(*) as count FROM asset_history WHERE asset_id = $1', [16]);
    const count = result.rows[0]?.count || 0;
    console.log(`📊 Total de registros de historial para activo 16: ${count}`);

  } catch (error) {
    console.error('❌ Error al crear tabla de historial:', error);
    throw error;
  }
}

// Ejecutar directamente
createAssetHistoryTable().then(() => {
  console.log('🎉 Script completado exitosamente');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error en el script:', error);
  process.exit(1);
});