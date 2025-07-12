import express from "express";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

const app = express();

// CRITICAL: Configure Express for deployment
app.set('trust proxy', 1);

// Essential middleware with timeout protection
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files serving
app.use('/uploads', express.static('uploads'));
app.use(express.static('dist'));

// CRITICAL: Instant health check endpoints for deployment - NO DATABASE DEPENDENCIES
const startTime = Date.now();
const healthResponse = {
  status: 'ok',
  message: 'ParkSys - Bosques Urbanos de Guadalajara',
  deployment: process.env.REPLIT_DEPLOYMENT_ID || 'development',
  timestamp: new Date().toISOString()
};

// Root endpoint - responds instantly for health checks
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    ...healthResponse,
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

// Health check endpoints
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

// Catch-all for SPA routing
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({
      ...healthResponse,
      message: 'ParkSys - Frontend not built yet'
    });
  }
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

// Start server immediately - NO DATABASE INITIALIZATION
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 ParkSys servidor ejecutándose en ${HOST}:${PORT}`);
  console.log(`✅ Servidor iniciado exitosamente - Health checks disponibles`);
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

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});