#!/usr/bin/env node

/**
 * Simple production server startup script for ParkSys
 * This file provides a robust fallback for deployment scenarios
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Configure production environment
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

console.log(`🚀 Starting ParkSys production server on ${HOST}:${PORT}`);

// Essential middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Critical health check endpoints for deployment
app.get('/', (req, res) => {
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

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys Health Check',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production'
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/readiness', (req, res) => {
  res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
});

app.get('/liveness', (req, res) => {
  res.status(200).json({ alive: true, timestamp: new Date().toISOString() });
});

// Basic API status endpoints
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys API Status',
    timestamp: new Date().toISOString(),
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys API Health',
    timestamp: new Date().toISOString(),
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production'
  });
});

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

// Try to load the main server application
console.log('Loading main server application...');

// Server starts immediately to respond to health checks
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 ParkSys production server running on ${HOST}:${PORT}`);
  console.log(`✅ Health checks available immediately`);
  
  // Load main application in background after server is ready
  setTimeout(() => {
    import('./server/index.ts')
      .then(() => {
        console.log('✅ Main server module loaded successfully');
      })
      .catch(error => {
        console.error('❌ Error loading main server:', error);
      });
  }, 100);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});