import { pool } from './db.js';

async function fixAssetHistory() {
  try {
    console.log('🗑️ Eliminando tabla asset_history existente...');
    await pool.query('DROP TABLE IF EXISTS asset_history');
    console.log('✅ Tabla eliminada');

    console.log('📋 Creando nueva tabla asset_history...');
    await pool.query(`
      CREATE TABLE asset_history (
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
    console.log('✅ Nueva tabla creada');

    const historyEntries = [
      [16, '2024-01-15', 'acquisition', 'Adquisición inicial de la resbaladilla gigante multicolor para el Parque Metropolitano', 'Sistema de Adquisiciones', null, null, 'Compra realizada a través del proveedor autorizado PlayMax Equipment'],
      [16, '2024-03-10', 'update', 'Actualización de ubicación específica dentro del parque', 'Luis Romahn', 'Área general de juegos', 'Zona de juegos infantiles - Sector Norte', 'Reubicación para mejor distribución del espacio'],
      [16, '2024-06-20', 'maintenance', 'Primer mantenimiento preventivo programado', 'Equipo de Mantenimiento', null, null, 'Inspección completa, limpieza y lubricación de componentes'],
      [16, '2024-09-15', 'update', 'Actualización de estado de conservación', 'Inspector de Seguridad', 'Excelente', 'Bueno', 'Desgaste normal por uso intensivo durante temporada alta'],
      [16, '2024-12-01', 'maintenance', 'Mantenimiento correctivo por desgaste en barandillas', 'Técnico Especializado', null, null, 'Reemplazo de elementos de seguridad y aplicación de tratamiento antideslizante']
    ];

    for (const entry of historyEntries) {
      await pool.query(`
        INSERT INTO asset_history (asset_id, date, change_type, description, changed_by, previous_value, new_value, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, entry);
    }

    console.log(`✅ Se agregaron ${historyEntries.length} registros de historial para el activo 16`);

    const result = await pool.query('SELECT COUNT(*) as count FROM asset_history WHERE asset_id = $1', [16]);
    const count = result.rows[0]?.count || 0;
    console.log(`📊 Total de registros de historial para activo 16: ${count}`);

    console.log('🎉 Script completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAssetHistory();