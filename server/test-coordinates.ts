import { pool } from './db.js';

async function testCoordinates() {
  try {
    console.log('=== PROBANDO SISTEMA DE COORDENADAS ===');
    
    // Verificar coordenadas del activo 16
    const result = await pool.query(
      'SELECT id, name, latitude, longitude, updated_at FROM assets WHERE id = $1',
      [16]
    );
    
    if (result.rows.length > 0) {
      const asset = result.rows[0];
      console.log('Activo encontrado:', {
        id: asset.id,
        name: asset.name,
        latitude: asset.latitude,
        longitude: asset.longitude,
        updated_at: asset.updated_at
      });
      
      if (asset.latitude && asset.longitude) {
        console.log('✅ Coordenadas presentes en base de datos');
        console.log(`📍 Ubicación: ${asset.latitude}, ${asset.longitude}`);
        
        // Verificar que son números válidos
        const lat = parseFloat(asset.latitude);
        const lng = parseFloat(asset.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log('✅ Coordenadas son números válidos');
          
          // Verificar que están en el rango de Guadalajara
          if (lat > 20.5 && lat < 20.8 && lng > -103.5 && lng < -103.2) {
            console.log('✅ Coordenadas están en el rango de Guadalajara');
          } else {
            console.log('⚠️ Coordenadas fuera del rango esperado de Guadalajara');
          }
        } else {
          console.log('❌ Coordenadas no son números válidos');
        }
      } else {
        console.log('❌ No hay coordenadas en base de datos');
      }
    } else {
      console.log('❌ Activo 16 no encontrado');
    }
    
    // Verificar otros activos con coordenadas
    const allWithCoords = await pool.query(
      'SELECT id, name, latitude, longitude FROM assets WHERE latitude IS NOT NULL AND longitude IS NOT NULL LIMIT 5'
    );
    
    console.log(`\n📊 Activos con coordenadas: ${allWithCoords.rows.length}`);
    allWithCoords.rows.forEach(asset => {
      console.log(`  - ID ${asset.id}: ${asset.name} (${asset.latitude}, ${asset.longitude})`);
    });
    
  } catch (error) {
    console.error('Error en test de coordenadas:', error);
  }
}

testCoordinates();