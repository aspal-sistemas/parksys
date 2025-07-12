#!/usr/bin/env node

/**
 * Build simple script to create a production-ready frontend
 * This creates a deployable version of the React app
 */

import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildFrontend() {
  console.log('🔨 Building frontend for production...');
  
  try {
    await build({
      root: path.join(__dirname, 'client'),
      build: {
        outDir: path.join(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
          input: path.join(__dirname, 'client/index.html'),
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'client/src'),
          '@assets': path.resolve(__dirname, 'attached_assets'),
          '@shared': path.resolve(__dirname, 'shared'),
        },
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
      },
    });
    
    console.log('✅ Frontend built successfully!');
    console.log('📁 Output directory: ./dist/');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildFrontend();