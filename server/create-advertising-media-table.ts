import { db } from './db';
import { adMediaFiles } from '@shared/advertising-schema';

async function createAdvertisingMediaTable() {
  try {
    console.log('🔧 Creando tabla ad_media_files...');
    
    // Crear la tabla directamente con SQL
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ad_media_files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size INTEGER NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        media_type VARCHAR(20) NOT NULL,
        duration INTEGER,
        dimensions VARCHAR(50),
        file_hash VARCHAR(64),
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Tabla ad_media_files creada exitosamente');
    
    // Verificar que la tabla existe
    const result = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ad_media_files'
      )
    `);
    
    console.log('🔍 Verificación de tabla:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error creando tabla ad_media_files:', error);
  }
}

// Ejecutar directamente
createAdvertisingMediaTable().then(() => {
  console.log('✅ Proceso de creación de tabla completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error en proceso:', error);
  process.exit(1);
});