import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { NextFunction, Request, Response } from "express";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT_ID;

// CRITICAL: Configure Express for deployment
app.set('trust proxy', 1);

// Essential middleware with timeout protection
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files serving
app.use('/uploads', express.static('uploads'));

// Health check configuration
const startTime = Date.now();
const healthResponse = {
  status: 'ok',
  message: 'ParkSys - Bosques Urbanos de Guadalajara',
  deployment: process.env.REPLIT_DEPLOYMENT_ID || 'development',
  timestamp: new Date().toISOString()
};

// Health check endpoints - these must work for deployment
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
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

async function createServer() {
  if (isProduction) {
    // Production mode: serve built files
    app.use(express.static('dist'));
    
    // Root endpoint - serve frontend for browsers, JSON for health checks
    app.get('/', (req: Request, res: Response) => {
      const acceptHeader = req.headers.accept || '';
      const userAgent = req.headers['user-agent'] || '';
      
      // Return JSON for health checks
      if (acceptHeader.includes('application/json') || 
          (userAgent.includes('curl') && !acceptHeader.includes('text/html')) ||
          req.query.healthcheck) {
        return res.status(200).json({
          ...healthResponse,
          uptime: Math.floor((Date.now() - startTime) / 1000)
        });
      }
      
      // Serve built frontend
      const indexPath = path.join(__dirname, '../dist/index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).json({
          error: 'Frontend not built',
          message: 'Run npm run build first'
        });
      }
    });
    
    // Catch-all for SPA routing
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      const indexPath = path.join(__dirname, '../dist/index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).json({
          error: 'Frontend not built',
          message: 'Run npm run build first'
        });
      }
    });
    
  } else {
    // Development mode: use Vite dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
    
    // Root endpoint for development
    app.get('/', (req: Request, res: Response) => {
      const acceptHeader = req.headers.accept || '';
      const userAgent = req.headers['user-agent'] || '';
      
      // Return JSON for health checks
      if (acceptHeader.includes('application/json') || 
          (userAgent.includes('curl') && !acceptHeader.includes('text/html')) ||
          req.query.healthcheck) {
        return res.status(200).json({
          ...healthResponse,
          uptime: Math.floor((Date.now() - startTime) / 1000)
        });
      }
      
      // Let Vite handle the frontend
      res.redirect('/client/');
    });
  }
  
  return app;
}

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

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

createServer().then(() => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 ParkSys servidor ejecutándose en ${HOST}:${PORT}`);
    console.log(`✅ Modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    console.log(`📡 Health endpoints: /, /health, /healthz, /readiness, /liveness, /api/status, /api/health`);
  });
  
  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };
  
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}).catch(console.error);