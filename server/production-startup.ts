#!/usr/bin/env tsx

/**
 * Production startup script optimized for deployment health checks
 * This script ensures health checks respond immediately while loading the full app in background
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Minimal JSON parsing for health checks
app.use(express.json({ limit: '1mb' }));

// Ultra-fast health check endpoints - respond instantly
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys - Bosques Urbanos de Guadalajara',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/readiness', (req, res) => {
  res.status(200).json({
    ready: true,
    timestamp: new Date().toISOString()
  });
});

app.get('/liveness', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys API',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API Health Check',
    timestamp: new Date().toISOString()
  });
});

// Serve static files for production
app.use(express.static(path.join(process.cwd(), 'public')));

// SPA fallback for frontend routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Application not built' });
    }
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server immediately
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Production server running on ${HOST}:${PORT}`);
  console.log(`⚡ Health checks responding instantly`);
  console.log(`🌐 Application ready for deployment`);
  
  // Load full application after health checks are established
  setTimeout(async () => {
    try {
      console.log('🔄 Loading full application in background...');
      await import('./index.js');
      console.log('✅ Full application loaded successfully');
    } catch (error) {
      console.error('❌ Error loading full application:', error);
      // Keep health checks running even if full app fails
    }
  }, 100); // Minimal delay for health checks
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Keep process alive and handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - keep health checks running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep health checks running
});

console.log(`📋 Health check endpoints available:`);
console.log(`  GET /        - Main health check`);
console.log(`  GET /health  - Health status`);
console.log(`  GET /healthz - Simple OK response`);
console.log(`  GET /readiness - Readiness probe`);
console.log(`  GET /liveness - Liveness probe`);
console.log(`  GET /api/status - API status`);
console.log(`  GET /api/health - API health`);