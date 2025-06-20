import express, { type Request, Response } from "express";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();

// Middleware básico
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(process.cwd(), 'public')));

// Importar y registrar rutas principales
async function startServer() {
  try {
    // Registrar rutas principales
    const { registerRoutes } = await import("./routes");
    const server = await registerRoutes(app);

    // Iniciar servidor en puerto 5000
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();