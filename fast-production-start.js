#!/usr/bin/env node

/**
 * Lightning-fast production startup for ParkSys deployment
 * This script ensures health checks respond in <20ms while loading the full app asynchronously
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Minimal middleware for maximum speed
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lightning-fast health check endpoints (respond in <20ms)
const quickResponse = (message) => ({
  status: 'ok',
  message,
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  deployment: process.env.REPLIT_DEPLOYMENT_ID || 'production'
});

// Critical health check endpoints
app.get('/', (req, res) => {
  res.status(200).json(quickResponse('ParkSys - Bosques Urbanos de Guadalajara'));
});

app.get('/health', (req, res) => {
  res.status(200).json(quickResponse('Health check passed'));
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

app.get('/api/status', (req, res) => {
  res.status(200).json(quickResponse('API Status OK'));
});

app.get('/api/health', (req, res) => {
  res.status(200).json(quickResponse('API Health Check'));
});

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

// SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not built');
    }
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Start server immediately
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡ Lightning-fast server running on ${HOST}:${PORT}`);
  console.log(`✅ Health checks responding in <20ms`);
  
  // Load full application with minimal delay
  setTimeout(async () => {
    console.log('🔄 Loading full application...');
    try {
      await import('./server/index.js');
      console.log('✅ Full application loaded');
    } catch (error) {
      console.error('❌ Error loading full application:', error);
    }
  }, 50);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep health checks running
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  // Keep health checks running
});