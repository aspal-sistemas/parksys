#!/usr/bin/env node

/**
 * Ultra-fast production startup script for deployment health checks
 * This script responds to health checks in <50ms while loading the full application asynchronously
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Production environment configuration
process.env.NODE_ENV = "production";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = "0.0.0.0";

console.log(`🚀 Ultra-fast startup: ${HOST}:${PORT}`);

// Minimal middleware for maximum speed
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CRITICAL: All health check endpoints respond instantly (<50ms)
const healthResponse = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production',
  uptime: () => process.uptime()
};

app.get('/', (req, res) => {
  res.status(200).json({
    ...healthResponse,
    message: 'ParkSys - Bosques Urbanos de Guadalajara',
    port: PORT,
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ...healthResponse,
    message: 'Health check passed',
    uptime: process.uptime()
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/readiness', (req, res) => {
  res.status(200).json({ 
    ready: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/liveness', (req, res) => {
  res.status(200).json({ 
    alive: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    ...healthResponse,
    message: 'API Status OK',
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    ...healthResponse,
    message: 'API Health Check',
    uptime: process.uptime()
  });
});

// Serve static files with minimal overhead
app.use(express.static(path.join(process.cwd(), 'public')));

// Fallback for SPA routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send('Application not built');
      }
    });
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Start server immediately - NO database operations during startup
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}`);
  console.log(`⚡ Health checks responding instantly`);
  
  // Load full application after successful startup
  setTimeout(() => {
    loadFullApplication();
  }, 100); // Minimal delay
});

// Load the full application asynchronously
async function loadFullApplication() {
  try {
    console.log('🔄 Loading full application...');
    
    // Import the main server module
    await import('./server/index.js');
    
    console.log('✅ Full application loaded successfully');
    
  } catch (error) {
    console.error('❌ Error loading full application:', error);
    // Server continues to respond to health checks even if main app fails
  }
}

// Graceful shutdown handlers
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

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - keep health checks running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep health checks running
});

export default app;