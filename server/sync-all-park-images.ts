/**
 * SCRIPT DE SINCRONIZACIÓN DE IMÁGENES DE PARQUES
 * ==============================================
 * 
 * Script para verificar y sincronizar todas las imágenes de parques
 * con las landing pages automáticas.
 */

import { syncAllParkImages } from './park-landing-automation';

/**
 * Ejecuta la sincronización completa de imágenes de parques
 */
export async function runParkImageSync() {
  console.log('🚀 INICIANDO SINCRONIZACIÓN COMPLETA DE IMÁGENES DE PARQUES');
  console.log('=' * 60);
  
  try {
    const result = await syncAllParkImages();
    
    if (result.success) {
      console.log('\n✅ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE');
      console.log(`📊 Total de parques: ${result.totalParks}`);
      console.log(`🖼️ Parques con imágenes: ${result.parksWithImages}`);
      console.log(`📈 Porcentaje con multimedia: ${Math.round((result.parksWithImages / result.totalParks) * 100)}%`);
      
      console.log('\n📋 DETALLE POR PARQUE:');
      result.details.forEach(park => {
        const status = park.totalImages > 0 ? '✅' : '⚠️';
        const primaryStatus = park.hasPrimary ? '🏆' : '📷';
        console.log(`${status} ${park.parkName} (ID: ${park.parkId}): ${park.totalImages} imágenes ${primaryStatus}`);
      });
      
    } else {
      console.log('\n❌ ERROR EN LA SINCRONIZACIÓN');
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO:', error);
  }
  
  console.log('\n' + '=' * 60);
  console.log('🏁 SINCRONIZACIÓN FINALIZADA');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runParkImageSync();
}