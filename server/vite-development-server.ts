import express from "express";
import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { NextFunction, Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createViteDevServer() {
  const app = express();
  
  // Create Vite development server
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    base: '/',
    root: path.join(__dirname, '..'),
    configFile: path.join(__dirname, '../vite.config.ts'),
    envFile: path.join(__dirname, '..', '.env'),
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.join(__dirname, '../client/index.html')
        }
      }
    }
  });

  // Health check responses
  const healthResponse = {
    status: 'healthy',
    service: 'ParkSys',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();

  // All health check endpoints
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      ...healthResponse,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      message: 'ParkSys Vite Development Server'
    });
  });

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json(healthResponse);
  });

  app.get('/healthz', (req: Request, res: Response) => {
    res.status(200).json(healthResponse);
  });

  app.get('/readiness', (req: Request, res: Response) => {
    res.status(200).json(healthResponse);
  });

  app.get('/liveness', (req: Request, res: Response) => {
    res.status(200).json(healthResponse);
  });

  app.get('/api/status', (req: Request, res: Response) => {
    res.status(200).json({
      ...healthResponse,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json(healthResponse);
  });

  // Enable CORS for development
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Use Vite's dev server
  app.use(vite.middlewares);

  // Error handling
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  });

  return app;
}

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

createViteDevServer().then((app) => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 ParkSys Vite Development Server running on ${HOST}:${PORT}`);
    console.log(`✅ Health checks available at multiple endpoints`);
    console.log(`📡 Development environment with hot module replacement`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}).catch((error) => {
  console.error('Failed to start Vite development server:', error);
  process.exit(1);
});