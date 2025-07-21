const express = require('express');
const path = require('path');

// Simple Express server optimized for Replit
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware for Replit compatibility
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// CORS headers for all requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Powered-By', 'ParkSys-Replit');
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ParkSys', timestamp: Date.now() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ParkSys', timestamp: Date.now() });
});

app.get('/replit-ready', (req, res) => {
  res.status(200).send('ParkSys Ready');
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(__dirname, '../public/index.html');
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple ParkSys server running on port ${PORT}`);
  console.log(`🌐 Ready for Replit proxy`);
});