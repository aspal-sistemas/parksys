#!/usr/bin/env node

/**
 * Ultra-fast health check server for deployment verification
 * Responds to all health check endpoints in <50ms
 */

import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

// Minimal middleware for maximum speed
app.use(express.json({ limit: '1mb' }));

// Pre-computed health check response
const startTime = Date.now();
const healthResponse = {
  status: 'ok',
  message: 'ParkSys - Health Check Server',
  deployment: 'ready',
  port: PORT
};

console.log(`🚀 Health Check Server starting on ${HOST}:${PORT}`);

// CRITICAL: Ultra-fast health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    ...healthResponse,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString()
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/readiness', (req, res) => {
  res.status(200).json({ 
    ready: true, 
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

app.get('/liveness', (req, res) => {
  res.status(200).json({ 
    alive: true, 
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API Status OK',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API Health Check',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Health Check Server running on ${HOST}:${PORT}`);
  console.log(`⚡ All health check endpoints responding instantly`);
  console.log(`🎯 Ready for deployment verification`);
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

export default app;