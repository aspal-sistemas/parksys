import { pool } from './db.js';

async function testSearch() {
  try {
    console.log('=== Probando búsqueda de activos ===');
    
    // Probar búsquedas diferentes
    const searches = ['rebaladilla', 'resbaladilla', 'resba', 'rebala', 'gigante'];
    
    for (const search of searches) {
      console.log(`\nBuscando: "${search}"`);
      
      const searchTerm = search.toLowerCase();
      const conditions = [];
      const queryParams = [];
      
      conditions.push(`(
        LOWER(a.name) LIKE LOWER($1) 
        OR LOWER(COALESCE(a.description, '')) LIKE LOWER($2)
        OR LOWER(a.name) LIKE LOWER($3)
        OR LOWER(a.name) LIKE LOWER($4)
      )`);
      
      queryParams.push(
        `%${search}%`, 
        `%${search}%`,
        `%${searchTerm.replace('rebaladilla', 'resbaladilla')}%`,
        `%${searchTerm.replace('resbaladilla', 'rebaladilla')}%`
      );
      
      const whereClause = `WHERE ${conditions.join(' AND ')}`;
      
      const query = `
        SELECT a.id, a.name, a.description
        FROM assets a
        ${whereClause}
        ORDER BY a.name
      `;
      
      const result = await pool.query(query, queryParams);
      console.log(`Resultados encontrados: ${result.rows.length}`);
      result.rows.forEach(asset => console.log(`  - ID: ${asset.id}, Nombre: ${asset.name}`));
    }
  } catch (error) {
    console.error('Error en test:', error);
  }
}

testSearch();