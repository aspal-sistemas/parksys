import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Función para generar código aleatorio basado en especie y parque
function generateTreeCode(speciesName, parkName) {
  // Obtener primeras 3 letras de la especie
  const speciesCode = speciesName.substring(0, 3).toUpperCase();
  
  // Obtener primeras 3 letras del parque
  const parkCode = parkName.substring(0, 3).toUpperCase();
  
  // Generar número aleatorio de 3 dígitos
  const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${speciesCode}-${parkCode}-${randomNumber}`;
}

// Función para verificar si un código ya existe
async function codeExists(code) {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM trees WHERE code = $1', [code]);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error('Error verificando código:', error);
    return false;
  }
}

// Función para generar código único
async function generateUniqueTreeCode(speciesName, parkName) {
  let code = generateTreeCode(speciesName, parkName);
  let attempts = 0;
  
  while (await codeExists(code) && attempts < 10) {
    code = generateTreeCode(speciesName, parkName);
    attempts++;
  }
  
  return code;
}

// Función principal para asignar códigos
async function assignTreeCodes() {
  try {
    console.log('🌳 Iniciando asignación de códigos a árboles...');
    
    // Obtener todos los árboles sin código o con código null
    const treesQuery = `
      SELECT 
        t.id,
        t.species_id,
        t.park_id,
        t.code,
        ts.common_name as species_name,
        p.name as park_name
      FROM trees t
      JOIN tree_species ts ON t.species_id = ts.id
      JOIN parks p ON t.park_id = p.id
      WHERE t.code IS NULL OR t.code = ''
      ORDER BY p.name, ts.common_name
    `;
    
    const treesResult = await pool.query(treesQuery);
    const trees = treesResult.rows;
    
    console.log(`📊 Encontrados ${trees.length} árboles sin código`);
    
    if (trees.length === 0) {
      console.log('✅ Todos los árboles ya tienen código asignado');
      return;
    }
    
    let processed = 0;
    let errors = 0;
    
    // Procesar cada árbol
    for (const tree of trees) {
      try {
        // Generar código único
        const newCode = await generateUniqueTreeCode(tree.species_name, tree.park_name);
        
        // Actualizar el árbol con el nuevo código
        await pool.query(
          'UPDATE trees SET code = $1 WHERE id = $2',
          [newCode, tree.id]
        );
        
        console.log(`✅ Árbol ${tree.id} (${tree.species_name} - ${tree.park_name}): ${newCode}`);
        processed++;
        
        // Pequeña pausa para evitar saturar la base de datos
        if (processed % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Error procesando árbol ${tree.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📈 Resumen de asignación:`);
    console.log(`✅ Procesados correctamente: ${processed}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total procesados: ${trees.length}`);
    
    // Verificar resultados
    const verificationQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN code IS NOT NULL AND code != '' THEN 1 END) as with_code
      FROM trees
    `;
    
    const verificationResult = await pool.query(verificationQuery);
    const stats = verificationResult.rows[0];
    
    console.log(`\n🔍 Verificación final:`);
    console.log(`📊 Total de árboles: ${stats.total}`);
    console.log(`✅ Con código asignado: ${stats.with_code}`);
    console.log(`❌ Sin código: ${stats.total - stats.with_code}`);
    
  } catch (error) {
    console.error('❌ Error en asignación de códigos:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar script
assignTreeCodes()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

export { generateTreeCode, generateUniqueTreeCode };