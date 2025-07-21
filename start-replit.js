// Simple startup script for Replit environment
console.log('🔄 Starting ParkSys for Replit...');

// Force production environment
process.env.NODE_ENV = 'production';

// Start the simple server first
const { spawn } = require('child_process');

const simpleServer = spawn('node', ['server/replit-server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 3000 }
});

simpleServer.on('error', (err) => {
  console.error('Simple server error:', err);
});

// After 3 seconds, start the main server on port 5000
setTimeout(() => {
  console.log('🚀 Starting main ParkSys server...');
  const mainServer = spawn('node', ['server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: 5000 }
  });
  
  mainServer.on('error', (err) => {
    console.error('Main server error:', err);
  });
}, 3000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down servers...');
  simpleServer.kill();
  process.exit(0);
});