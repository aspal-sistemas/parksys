import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Verifica el estado del sistema de códigos de árboles
 */
async function verifyTreeCodes() {
  try {
    console.log('🔍 Verificando sistema de códigos de árboles...\n');

    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_trees,
        COUNT(CASE WHEN code IS NOT NULL AND code != '' THEN 1 END) as trees_with_code,
        COUNT(CASE WHEN code IS NULL OR code = '' THEN 1 END) as trees_without_code
      FROM trees
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    console.log('📊 Estadísticas Generales:');
    console.log(`   Total de árboles: ${stats.total_trees}`);
    console.log(`   ✅ Con código: ${stats.trees_with_code}`);
    console.log(`   ❌ Sin código: ${stats.trees_without_code}`);
    console.log(`   📈 Completado: ${((stats.trees_with_code / stats.total_trees) * 100).toFixed(1)}%\n`);

    // Distribución por parque
    const parkQuery = `
      SELECT 
        p.name as park_name,
        COUNT(t.id) as total_trees,
        COUNT(CASE WHEN t.code IS NOT NULL THEN 1 END) as coded_trees
      FROM trees t
      JOIN parks p ON t.park_id = p.id
      GROUP BY p.name
      ORDER BY total_trees DESC
    `;
    
    const parkResult = await pool.query(parkQuery);
    
    console.log('🏞️  Distribución por Parque:');
    parkResult.rows.forEach(row => {
      const percentage = ((row.coded_trees / row.total_trees) * 100).toFixed(1);
      console.log(`   ${row.park_name}: ${row.coded_trees}/${row.total_trees} (${percentage}%)`);
    });

    // Distribución por especie
    const speciesQuery = `
      SELECT 
        ts.common_name as species_name,
        COUNT(t.id) as total_trees,
        COUNT(CASE WHEN t.code IS NOT NULL THEN 1 END) as coded_trees
      FROM trees t
      JOIN tree_species ts ON t.species_id = ts.id
      GROUP BY ts.common_name
      ORDER BY total_trees DESC
      LIMIT 10
    `;
    
    const speciesResult = await pool.query(speciesQuery);
    
    console.log('\n🌳 Top 10 Especies con más árboles:');
    speciesResult.rows.forEach(row => {
      const percentage = ((row.coded_trees / row.total_trees) * 100).toFixed(1);
      console.log(`   ${row.species_name}: ${row.coded_trees}/${row.total_trees} (${percentage}%)`);
    });

    // Ejemplos de códigos por formato
    const sampleQuery = `
      SELECT 
        t.code,
        ts.common_name as species_name,
        p.name as park_name,
        t.health_status
      FROM trees t
      JOIN tree_species ts ON t.species_id = ts.id
      JOIN parks p ON t.park_id = p.id
      WHERE t.code IS NOT NULL
      ORDER BY t.code
      LIMIT 15
    `;
    
    const sampleResult = await pool.query(sampleQuery);
    
    console.log('\n🏷️  Ejemplos de códigos generados:');
    sampleResult.rows.forEach(row => {
      console.log(`   ${row.code} → ${row.species_name} en ${row.park_name} (${row.health_status})`);
    });

    // Verificar duplicados
    const duplicateQuery = `
      SELECT code, COUNT(*) as count
      FROM trees
      WHERE code IS NOT NULL
      GROUP BY code
      HAVING COUNT(*) > 1
    `;
    
    const duplicateResult = await pool.query(duplicateQuery);
    
    if (duplicateResult.rows.length > 0) {
      console.log('\n⚠️  Códigos duplicados encontrados:');
      duplicateResult.rows.forEach(row => {
        console.log(`   ${row.code}: ${row.count} árboles`);
      });
    } else {
      console.log('\n✅ No se encontraron códigos duplicados');
    }

    // Árboles sin código (si los hay)
    if (stats.trees_without_code > 0) {
      const missingQuery = `
        SELECT 
          t.id,
          ts.common_name as species_name,
          p.name as park_name
        FROM trees t
        JOIN tree_species ts ON t.species_id = ts.id
        JOIN parks p ON t.park_id = p.id
        WHERE t.code IS NULL OR t.code = ''
        LIMIT 10
      `;
      
      const missingResult = await pool.query(missingQuery);
      
      console.log('\n❌ Árboles sin código:');
      missingResult.rows.forEach(row => {
        console.log(`   ID ${row.id}: ${row.species_name} en ${row.park_name}`);
      });
    }

    console.log('\n🎉 Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar verificación
verifyTreeCodes();

export { verifyTreeCodes };