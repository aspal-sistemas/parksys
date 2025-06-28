// Script para limpiar URLs malformadas y reiniciar la aplicación

const fs = require('fs');
const path = require('path');

// Función para limpiar archivos problemáticos
function cleanProblematicFiles() {
  try {
    // Limpiar caché de Vite
    const viteCacheDir = path.join(__dirname, 'node_modules/.vite');
    if (fs.existsSync(viteCacheDir)) {
      fs.rmSync(viteCacheDir, { recursive: true, force: true });
      console.log('✅ Caché de Vite limpiado');
    }

    // Limpiar dist
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('✅ Directorio dist limpiado');
    }

    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('❌ Error durante limpieza:', error);
  }
}

cleanProblematicFiles();