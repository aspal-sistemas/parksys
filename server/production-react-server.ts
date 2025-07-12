import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  
  // Configure Express
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Static files
  app.use('/uploads', express.static('uploads'));
  
  // Health check endpoints (critical for deployment)
  const startTime = Date.now();
  
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/healthz', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/api/status', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'ParkSys - Bosques Urbanos de Guadalajara - Production Ready',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'API Health Check OK',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  });

  // Create Vite server for React app
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.resolve(__dirname, '..'),
    build: {
      outDir: 'dist'
    }
  });

  // Use Vite's connect instance as middleware
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', async (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    
    try {
      const indexPath = path.resolve(__dirname, '..', 'client', 'index.html');
      let template = await vite.transformIndexHtml(req.url, 
        `<!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>ParkSys - Bosques Urbanos de Guadalajara</title>
          <meta name="description" content="Sistema integral de gestión de parques urbanos para la ciudad de Guadalajara" />
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/client/src/main.tsx"></script>
        </body>
        </html>`
      );
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (error) {
      vite.ssrFixStacktrace(error);
      res.status(500).end(error.message);
    }
  });

  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`🚀 ParkSys servidor React ejecutándose en ${HOST}:${PORT}`);
    console.log(`✅ Sistema React completo disponible`);
    console.log(`📡 Health endpoints: /health, /healthz, /api/status, /api/health`);
  });
}

createServer().catch(console.error);