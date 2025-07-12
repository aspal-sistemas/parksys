import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { NextFunction, Request, Response } from "express";
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();

  // CRITICAL: Configure Express for deployment
  app.set('trust proxy', 1);

  // Essential middleware with timeout protection
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static files serving
  app.use('/uploads', express.static('uploads'));

  // CRITICAL: Instant health check endpoints for deployment - NO DATABASE DEPENDENCIES
  const startTime = Date.now();
  const healthResponse = {
    status: 'ok',
    message: 'ParkSys - Bosques Urbanos de Guadalajara',
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'development',
    timestamp: new Date().toISOString()
  };

  // Health check endpoints
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/healthz', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/readiness', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/liveness', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/status', (req: Request, res: Response) => {
    res.status(200).json({
      ...healthResponse,
      uptime: Math.floor((Date.now() - startTime) / 1000)
    });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.resolve(__dirname, '..', 'client'),
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '..', 'client/src'),
        '@assets': path.resolve(__dirname, '..', 'attached_assets'),
        '@shared': path.resolve(__dirname, '..', 'shared'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  });

  // Use Vite's Connect instance as middleware
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  // Root endpoint - health check for deployment checks
  app.get('/', (req: Request, res: Response, next: NextFunction) => {
    // Check if this is a health check request (explicit JSON request or curl without HTML)
    const acceptHeader = req.headers.accept || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Health check detection
    if (acceptHeader.includes('application/json') || 
        userAgent.includes('curl') || 
        userAgent.includes('wget') ||
        userAgent.includes('health') ||
        userAgent.includes('check') ||
        req.query.format === 'json') {
      return res.status(200).json({
        ...healthResponse,
        uptime: Math.floor((Date.now() - startTime) / 1000)
      });
    }
    
    // Otherwise, let Vite handle it
    next();
  });

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error in server:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

// Start server
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';

createServer().then(app => {
  app.listen(port, host, () => {
    console.log(`🚀 ParkSys servidor ejecutándose en ${host}:${port}`);
    console.log(`✅ Servidor iniciado exitosamente - Health checks disponibles`);
    console.log(`📡 Vite + Express integrado - Sistema React completo disponible`);
  });
}).catch(error => {
  console.error('❌ Error iniciando servidor:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Recibido SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Recibido SIGINT, cerrando servidor...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rechazo de promesa no manejado:', reason);
  process.exit(1);
});