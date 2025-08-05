import { pool } from './db.js';

async function addMissingColumns() {
  try {
    console.log('🔧 Agregando columnas faltantes a la tabla activities...');
    
    // Agregar columnas que faltan
    const alterQueries = [
      `ALTER TABLE activities ADD COLUMN IF NOT EXISTS end_time TEXT`,
      `ALTER TABLE activities ADD COLUMN IF NOT EXISTS target_market JSONB`,
      `ALTER TABLE activities ADD COLUMN IF NOT EXISTS special_needs JSONB`
    ];
    
    for (const query of alterQueries) {
      try {
        await pool.query(query);
        console.log(`✅ Ejecutado: ${query}`);
      } catch (error) {
        console.log(`⚠️ Ya existe o error: ${query}`);
      }
    }
    
    console.log('✅ Columnas agregadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

addMissingColumns();