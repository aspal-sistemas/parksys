import { db } from './db';

async function updateAdvertisementsTable() {
  try {
    console.log('🔧 Actualizando tabla advertisements...');
    
    // Agregar columnas faltantes
    await db.execute(`
      ALTER TABLE advertisements 
      ADD COLUMN IF NOT EXISTS content TEXT,
      ADD COLUMN IF NOT EXISTS storage_type VARCHAR(20) DEFAULT 'url',
      ADD COLUMN IF NOT EXISTS media_file_id INTEGER REFERENCES ad_media_files(id),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS duration INTEGER,
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'banner',
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'
    `);

    console.log('✅ Tabla advertisements actualizada exitosamente');
    
    // Verificar las columnas existentes
    const result = await db.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'advertisements'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas en tabla advertisements:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error actualizando tabla advertisements:', error);
  }
}

// Ejecutar directamente
updateAdvertisementsTable().then(() => {
  console.log('✅ Proceso de actualización completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error en proceso:', error);
  process.exit(1);
});