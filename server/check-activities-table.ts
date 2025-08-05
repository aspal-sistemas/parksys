import { pool } from './db.js';

async function checkActivitiesTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activities' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas de la tabla activities:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkActivitiesTable();