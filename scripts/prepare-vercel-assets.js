#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔧 Preparando assets para Vercel...');

// Función para copiar directorio recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️ Source directory ${src} no existe`);
    return;
  }
  
  // Crear directorio destino si no existe
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copiado: ${srcPath} -> ${destPath}`);
    }
  }
}

// Directorios a copiar
const uploadDirs = [
  'park-images',
  'activity-images', 
  'concession-images',
  'spaces',
  'documents',
  'advertising',
  'fauna'
];

// Copiar cada directorio de uploads
for (const dir of uploadDirs) {
  const srcDir = path.join(rootDir, 'uploads', dir);
  const destDir = path.join(rootDir, 'public', 'uploads', dir);
  
  console.log(`📁 Copiando ${dir}...`);
  copyDir(srcDir, destDir);
}

console.log('✅ Assets preparados para Vercel');