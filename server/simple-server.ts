import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import path from "path";

const app = express();

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'ParkSys API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple root health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Register main routes
registerRoutes(app);

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Use environment port for deployment compatibility
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

// Setup Vite in development mode
if (app.get("env") === "development") {
  const appServer = app.listen(PORT, HOST, async () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    
    try {
      await setupVite(app, appServer);
      console.log("✅ Servidor de desarrollo Vite listo - Aplicación web accesible");
    } catch (error) {
      console.error("Error configurando Vite:", error);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    appServer.close(() => {
      console.log('HTTP server closed');
    });
  });

} else {
  // Production mode
  app.listen(PORT, HOST, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
  });
}