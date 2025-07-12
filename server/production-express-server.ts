import express from "express";
import { createServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { NextFunction, Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createProductionServer() {
  const app = express();

  // Configure Express for deployment
  app.set('trust proxy', 1);

  // Essential middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Create Vite server for development
  let viteServer;
  try {
    viteServer = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '..'),
      configFile: path.resolve(__dirname, '../vite.config.ts'),
      envFile: path.resolve(__dirname, '../.env')
    });
  } catch (error) {
    console.warn('Vite server creation failed, proceeding with static files only:', error);
  }

  // Static files serving
  app.use('/uploads', express.static('uploads'));

  // Check if built files exist and serve them first
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  } else if (viteServer) {
    // Use Vite dev server for development
    app.use(viteServer.middlewares);
  }

  // Serve client files
  app.use(express.static(path.join(__dirname, '../client')));
  
  // Serve public files as fallback
  app.use(express.static(path.join(__dirname, '../public')));

  // Health response template
  const healthResponse = {
    status: 'healthy',
    service: 'ParkSys',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();

  // All health check endpoints
  app.get('/', (req: Request, res: Response) => {
    const acceptsHtml = req.get('Accept')?.includes('text/html');
    
    if (acceptsHtml) {
      // Serve frontend for browsers
      // Try built version first (dist)
      const builtIndexPath = path.join(__dirname, '../dist/index.html');
      if (fs.existsSync(builtIndexPath)) {
        return res.sendFile(builtIndexPath);
      }
      
      // Try development version (client)
      const devIndexPath = path.join(__dirname, '../client/index.html');
      if (fs.existsSync(devIndexPath)) {
        return res.sendFile(devIndexPath);
      }
      
      // Final fallback to public version
      const publicIndexPath = path.join(__dirname, '../public/index.html');
      if (fs.existsSync(publicIndexPath)) {
        return res.sendFile(publicIndexPath);
      }
      
      // If no frontend available, return health check
      res.status(200).json({
        ...healthResponse,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        message: 'ParkSys - Frontend not available'
      });
    } else {
      // Return JSON health check for non-browser requests
      res.status(200).json({
        ...healthResponse,
        uptime: Math.floor((Date.now() - startTime) / 1000)
      });
    }
  });

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      message: 'Health check OK',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/healthz', (req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  app.get('/readiness', (req: Request, res: Response) => {
    res.status(200).json({ 
      ready: true,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/liveness', (req: Request, res: Response) => {
    res.status(200).json({ 
      alive: true,
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
      message: 'API Health Check OK',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  // Catch-all for SPA routing
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Try built version first (dist)
    const builtIndexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(builtIndexPath)) {
      return res.sendFile(builtIndexPath);
    }
    
    // Try development version (client)
    const devIndexPath = path.join(__dirname, '../client/index.html');
    if (fs.existsSync(devIndexPath)) {
      return res.sendFile(devIndexPath);
    }
    
    // Final fallback to public version
    const publicIndexPath = path.join(__dirname, '../public/index.html');
    if (fs.existsSync(publicIndexPath)) {
      return res.sendFile(publicIndexPath);
    }
    
    // If no frontend available, return health check
    res.status(200).json({
      ...healthResponse,
      message: 'ParkSys - Frontend not available'
    });
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Express error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ 
      error: message,
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

createProductionServer().then((app) => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 ParkSys Production Server running on ${HOST}:${PORT}`);
    console.log(`✅ Health checks available at multiple endpoints`);
    console.log(`📡 Vite integration for development mode`);
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
  console.error('Failed to start production server:', error);
  process.exit(1);
});