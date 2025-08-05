import { pool } from './db';

async function addVisitorColumns() {
  try {
    console.log('🌐 Agregando columnas faltantes a visitor_counts...');
    
    // Verificar si las columnas ya existen
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'visitor_counts'
      AND column_name IN ('seniors', 'pets')
    `);
    
    const existingColumns = checkColumns.rows.map(row => row.column_name);
    
    if (!existingColumns.includes('seniors')) {
      await pool.query(`
        ALTER TABLE visitor_counts 
        ADD COLUMN seniors INTEGER DEFAULT 0 NOT NULL
      `);
      console.log('✅ Columna "seniors" agregada correctamente');
    } else {
      console.log('ℹ️  Columna "seniors" ya existe');
    }
    
    if (!existingColumns.includes('pets')) {
      await pool.query(`
        ALTER TABLE visitor_counts 
        ADD COLUMN pets INTEGER DEFAULT 0 NOT NULL
      `);
      console.log('✅ Columna "pets" agregada correctamente');
    } else {
      console.log('ℹ️  Columna "pets" ya existe');
    }
    
    // Hacer day_type y weather opcionales (permitir NULL)
    await pool.query(`
      ALTER TABLE visitor_counts 
      ALTER COLUMN day_type DROP NOT NULL
    `);
    
    await pool.query(`
      ALTER TABLE visitor_counts 
      ALTER COLUMN weather DROP NOT NULL
    `);
    
    console.log('✅ Campos day_type y weather ahora son opcionales');
    console.log('🎉 Actualización de visitor_counts completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error actualizando tabla visitor_counts:', error);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addVisitorColumns();
}

export { addVisitorColumns };