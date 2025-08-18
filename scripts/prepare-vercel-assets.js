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

// CREAR TODAS LAS ESTRUCTURAS DE DIRECTORIOS PRIMERO
const distPublicDir = path.join(rootDir, 'dist', 'public');
fs.mkdirSync(distPublicDir, { recursive: true });
fs.mkdirSync(path.join(distPublicDir, 'images'), { recursive: true });
fs.mkdirSync(path.join(distPublicDir, 'uploads'), { recursive: true });
fs.mkdirSync(path.join(distPublicDir, 'fonts'), { recursive: true });
fs.mkdirSync(path.join(distPublicDir, 'locales'), { recursive: true });

// 1. COPIAR DIRECTORIO PUBLIC/IMAGES COMPLETO
console.log('📸 Copiando directorio /public/images/...');
const publicImagesSource = path.join(rootDir, 'public', 'images');
const publicImagesDest = path.join(rootDir, 'dist', 'public', 'images');
copyDir(publicImagesSource, publicImagesDest);

// 2. COPIAR DIRECTORIO PUBLIC/UPLOADS COMPLETO  
console.log('📁 Copiando directorio /public/uploads/...');
const publicUploadsSource = path.join(rootDir, 'public', 'uploads');
const publicUploadsDest = path.join(rootDir, 'dist', 'public', 'uploads');
copyDir(publicUploadsSource, publicUploadsDest);

// 3. COPIAR DIRECTORIO UPLOADS A DIST/PUBLIC/UPLOADS
console.log('📦 Copiando directorio /uploads/ -> /dist/public/uploads/...');
const uploadsSource = path.join(rootDir, 'uploads');
const uploadsDest = path.join(rootDir, 'dist', 'public', 'uploads');
copyDir(uploadsSource, uploadsDest);

// 4. COPIAR FONTS
console.log('🔤 Copiando fuentes...');
const fontsSource = path.join(rootDir, 'public', 'fonts');
const fontsDest = path.join(rootDir, 'dist', 'public', 'fonts');
copyDir(fontsSource, fontsDest);

// 5. COPIAR LOCALES
console.log('🌐 Copiando archivos de idioma...');
const localesSource = path.join(rootDir, 'public', 'locales');
const localesDest = path.join(rootDir, 'dist', 'public', 'locales');
copyDir(localesSource, localesDest);

// 6. COPIAR ARCHIVOS INDIVIDUALES IMPORTANTES
const importantFiles = [
  'parksys-logo.png',
  'parques-mexico-logo.jpg', 
  'volunteer-1.png',
  'volunteer-2.png',
  'volunteer-3.webp',
  'volunteer-4.jpg',
  'volunteer-garden.jpg',
  'jardin-japones.jpg'
];

console.log('📄 Copiando archivos importantes...');
for (const filename of importantFiles) {
  const srcFile = path.join(rootDir, 'public', filename);
  const destFile = path.join(rootDir, 'dist', 'public', filename);
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`✅ Copiado: ${filename}`);
  } else {
    console.log(`⚠️ No encontrado: ${filename}`);
  }
}

console.log('✅ Assets preparados para Vercel');