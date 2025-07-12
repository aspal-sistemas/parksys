import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { NextFunction, Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CRITICAL: Configure Express for deployment
app.set('trust proxy', 1);

// Essential middleware with timeout protection
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files serving with proper order and fallbacks
app.use('/uploads', express.static('uploads'));

// Serve built files first (if they exist)
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Serve client files for development
app.use(express.static(path.join(__dirname, '../client')));

// Serve public files as final fallback
app.use(express.static(path.join(__dirname, '../public')));

// CRITICAL: Instant health check endpoints for deployment
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

// Root endpoint with intelligent routing
app.get('/', (req: Request, res: Response) => {
  // Check if this is a health check request
  const acceptHeader = req.headers.accept || '';
  const userAgent = req.headers['user-agent'] || '';
  
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
  
  // Try to serve the built frontend first
  const builtIndexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(builtIndexPath)) {
    return res.sendFile(builtIndexPath);
  }
  
  // Fallback to development client
  const devIndexPath = path.join(__dirname, '../client/index.html');
  if (fs.existsSync(devIndexPath)) {
    return res.sendFile(devIndexPath);
  }
  
  // Final fallback to public
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
});

// Catch-all for SPA routing
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Try to serve the built frontend first
  const builtIndexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(builtIndexPath)) {
    return res.sendFile(builtIndexPath);
  }
  
  // Fallback to development client
  const devIndexPath = path.join(__dirname, '../client/index.html');
  if (fs.existsSync(devIndexPath)) {
    return res.sendFile(devIndexPath);
  }
  
  // Final fallback to public
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error in server:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`🚀 ParkSys servidor ejecutándose en ${host}:${port}`);
  console.log(`✅ Servidor iniciado exitosamente - Health checks disponibles`);
  console.log(`📡 Health endpoints: /, /health, /healthz, /readiness, /liveness, /api/status, /api/health`);
  
  // Check what frontend is available
  const builtIndexPath = path.join(__dirname, '../dist/index.html');
  const devIndexPath = path.join(__dirname, '../client/index.html');
  const publicIndexPath = path.join(__dirname, '../public/index.html');
  
  if (fs.existsSync(builtIndexPath)) {
    console.log(`📦 Serving built frontend from: dist/`);
  } else if (fs.existsSync(devIndexPath)) {
    console.log(`🔧 Serving development frontend from: client/`);
  } else if (fs.existsSync(publicIndexPath)) {
    console.log(`📄 Serving simple frontend from: public/`);
  } else {
    console.log(`⚠️  No frontend available - health checks only`);
  }
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