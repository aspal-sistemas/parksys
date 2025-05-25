import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { activityRouter } from "./activityRoutes";
import { testRouter } from "./testRoutes";
import volunteerFieldRouter from "./volunteerFieldRoutes";
import { skillsRouter } from "./update-skills-route";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Registrar las rutas de actividades
app.use('/api', activityRouter);

// Registrar las rutas de prueba
app.use('/api/test', testRouter);

// Registrar las rutas de campos de voluntario
app.use('/api/volunteer-fields', volunteerFieldRouter);

// Registrar la ruta especializada para habilidades de voluntarios
app.use('/api', skillsRouter);

// Servir archivos estáticos de la carpeta de uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

import { seedDatabase } from "./seed";
import { createTreeTables } from "./create-tree-tables";
import { seedTreeSpecies } from "./seed-tree-species";

import { initializeDatabase } from "./initialize-db";

(async () => {
  try {
    // Inicializar la estructura de la base de datos
    await initializeDatabase();
    
    // Intentar inicializar los datos predeterminados
    try {
      await seedDatabase();
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      // Continuamos con la ejecución aunque haya un error en la carga de datos
    }
    
    // Crear tablas del módulo de arbolado
    try {
      await createTreeTables();
    } catch (error) {
      console.error("Error al crear tablas de arbolado:", error);
      // Continuamos con la ejecución aunque haya un error
    }
    
    // Cargar especies de árboles de muestra
    try {
      await seedTreeSpecies();
    } catch (error) {
      console.error("Error al cargar especies de árboles:", error);
      // Continuamos con la ejecución aunque haya un error
    }
  } catch (error) {
    console.error("Error crítico al inicializar la base de datos:", error);
    // Continuamos con la ejecución aunque haya un error
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
