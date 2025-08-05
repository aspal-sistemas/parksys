#!/usr/bin/env node

// Simple production server startup script
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Configure production environment
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

console.log(`🚀 Starting ParkSys in production mode on ${HOST}:${PORT}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'production-simple'
  });
});

// Start the main server
import('./server/index.ts')
  .then(() => {
    console.log('✅ Main server module loaded successfully');
  })
  .catch(error => {
    console.error('❌ Error loading main server:', error);
    
    // Fallback simple server
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    app.listen(PORT, HOST, () => {
      console.log(`🔧 Fallback server running on ${HOST}:${PORT}`);
    });
  });