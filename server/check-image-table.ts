import { pool } from './db.js';

async function checkImageTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'activity_images' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas de activity_images:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkImageTable();