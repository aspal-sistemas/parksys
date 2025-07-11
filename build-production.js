#!/usr/bin/env node

/**
 * Production build script for ParkSys
 * This script handles the complete build process for deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting ParkSys production build...');

try {
  // Step 1: Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  if (fs.existsSync('public')) {
    fs.rmSync('public', { recursive: true, force: true });
  }

  // Step 2: Build frontend with Vite
  console.log('🏗️ Building frontend with Vite...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Step 3: Verify build output
  console.log('✅ Verifying build output...');
  const distPath = path.join(process.cwd(), 'dist');
  const publicPath = path.join(process.cwd(), 'public');
  
  if (fs.existsSync(distPath)) {
    // Move dist to public for proper serving
    if (fs.existsSync(publicPath)) {
      fs.rmSync(publicPath, { recursive: true, force: true });
    }
    fs.renameSync(distPath, publicPath);
    console.log('📁 Build output moved to public directory');
  }

  // Step 4: Verify essential files exist
  const essentialFiles = [
    'public/index.html',
    'server/index.ts',
    'package.json'
  ];

  for (const file of essentialFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Essential file missing: ${file}`);
    }
  }

  // Step 5: Create production-ready package info
  console.log('📦 Creating production configuration...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  const prodInfo = {
    name: packageJson.name,
    version: packageJson.version,
    description: 'ParkSys - Bosques Urbanos de Guadalajara',
    main: 'server/index.ts',
    scripts: {
      start: 'NODE_ENV=production tsx server/index.ts',
      dev: packageJson.scripts.dev
    },
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
    type: packageJson.type,
    engines: {
      node: '>=18.0.0'
    }
  };

  fs.writeFileSync('package.prod.json', JSON.stringify(prodInfo, null, 2));

  console.log('✅ Production build completed successfully!');
  console.log('📊 Build summary:');
  console.log(`   - Frontend: Built and ready in public/`);
  console.log(`   - Backend: Ready to start with tsx server/index.ts`);
  console.log(`   - Health checks: Available at /, /health, /api/status`);
  console.log(`   - Production mode: NODE_ENV=production`);

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}