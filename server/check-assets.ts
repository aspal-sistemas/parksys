import { pool } from './db.js';

async function checkAssets() {
  try {
    const result = await pool.query("SELECT id, name, description FROM assets WHERE LOWER(name) LIKE LOWER('%resbaladilla%') OR LOWER(name) LIKE LOWER('%rebaladilla%')");
    console.log('Activos encontrados con resbaladilla/rebaladilla:');
    console.log(result.rows);

    const allAssets = await pool.query('SELECT id, name FROM assets ORDER BY name');
    console.log('\nTodos los activos:');
    allAssets.rows.forEach(asset => console.log(`ID: ${asset.id} - Nombre: ${asset.name}`));

    // Buscar activos que contengan "resba" o "rebala"
    const partialResult = await pool.query("SELECT id, name FROM assets WHERE LOWER(name) LIKE LOWER('%resba%') OR LOWER(name) LIKE LOWER('%rebala%')");
    console.log('\nActivos con "resba" o "rebala":');
    console.log(partialResult.rows);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAssets();