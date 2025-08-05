import { Pool } from '@neondatabase/serverless';

async function checkTables() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });

  try {
    console.log('Verificando tablas de publicidad...');
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ad_campaigns', 'ad_spaces', 'advertisements', 'ad_placements', 'ad_analytics')
      ORDER BY table_name
    `);
    
    console.log('Tablas encontradas:', result.rows.map(r => r.table_name));
    
    // Verificar contenido de cada tabla
    for (const row of result.rows) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
      console.log(`${row.table_name}: ${countResult.rows[0].count} registros`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkTables();