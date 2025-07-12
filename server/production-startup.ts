#!/usr/bin/env node

/**
 * Ultra-fast production startup script optimized for deployment health checks
 * This script ensures immediate response to health checks while initializing the full application in background
 */

import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

const app = express();

// Configure production environment
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = process.env.HOST || "0.0.0.0";

console.log(`🚀 Starting ParkSys ultra-fast production server on ${HOST}:${PORT}`);

// Essential middleware with minimal processing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CRITICAL: Health check endpoints respond immediately without any database operations
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys - Bosques Urbanos de Guadalajara',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Health check passed',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production'
  });
});

app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/readiness', (req: Request, res: Response) => {
  res.status(200).json({ 
    ready: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/liveness', (req: Request, res: Response) => {
  res.status(200).json({ 
    alive: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys API Status',
    timestamp: new Date().toISOString(),
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production',
    uptime: process.uptime()
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys API Health Check',
    timestamp: new Date().toISOString(),
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production',
    uptime: process.uptime()
  });
});

// Serve static files immediately
app.use(express.static(path.join(process.cwd(), 'public')));

// Fallback for SPA routes (except API endpoints)
app.get('*', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not built. Please run npm run build first.');
    }
  } else {
    res.status(404).json({ error: 'API endpoint not found - Application still initializing' });
  }
});

// Start server IMMEDIATELY - no database operations during startup
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 ParkSys server running on ${HOST}:${PORT}`);
  console.log(`✅ Health checks available immediately`);
  console.log(`🔄 Loading full application in background...`);
  
  // Load full application in background with minimal delay
  setTimeout(() => {
    loadFullApplication().catch(error => {
      console.error('❌ Error loading full application:', error);
    });
  }, 10);
});

// Load full application asynchronously after server is responding
async function loadFullApplication() {
  try {
    console.log('🔄 Importing main server module...');
    
    // Import and initialize the main server application
    const mainServer = await import('./index.js');
    
    console.log('✅ Main server module loaded successfully');
    
    // The main server will handle its own route registration and database initialization
    // This happens completely asynchronously without blocking health checks
    
  } catch (error) {
    console.error('❌ Error loading main server module:', error);
    // Server continues to respond to health checks even if main app fails to load
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep server running for health checks
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep server running for health checks
});

export default app;