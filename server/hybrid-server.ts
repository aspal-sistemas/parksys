import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Health check response
const healthResponse = {
  status: 'ok',
  message: 'ParkSys - Bosques Urbanos de Guadalajara',
  deployment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
};

const startTime = Date.now();

async function createApp() {
  const app = express();
  
  // Essential middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Static files
  app.use('/uploads', express.static('uploads'));
  
  // Health check endpoints
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/api/status', (req, res) => {
    res.status(200).json({
      ...healthResponse,
      uptime: Math.floor((Date.now() - startTime) / 1000)
    });
  });
  
  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.resolve(__dirname, '..', 'client'),
    base: '/',
  });
  
  // Use Vite's middleware
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
  
  // API routes would go here
  // app.use('/api', apiRoutes);
  
  return app;
}

// Start server
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';

createApp().then(app => {
  app.listen(port, host, () => {
    console.log(`🚀 ParkSys servidor híbrido ejecutándose en ${host}:${port}`);
    console.log(`✅ Vite + Express integrado - Frontend React completo disponible`);
  });
}).catch(error => {
  console.error('❌ Error iniciando servidor híbrido:', error);
});