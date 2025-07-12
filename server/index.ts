import express from "express";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

const app = express();

// Essential middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CRITICAL: Instant health check endpoints for deployment
const startTime = Date.now();
const healthResponse = {
  status: 'ok',
  message: 'ParkSys - Bosques Urbanos de Guadalajara',
  deployment: process.env.REPLIT_DEPLOYMENT_ID || 'development',
  timestamp: new Date().toISOString()
};

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    ...healthResponse,
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/readiness', (req: Request, res: Response) => {
  res.status(200).json({ ready: true });
});

app.get('/liveness', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
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
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 ParkSys servidor ejecutándose en ${HOST}:${PORT}`);
  console.log(`✅ Servidor iniciado exitosamente - Health checks disponibles`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});