import express from "express";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();

// Middleware básico
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(process.cwd(), 'public')));

// Configurar Vite y rutas
setupVite(app);

// Servir archivos estáticos de producción si existe
const distPath = path.resolve("dist");
if (process.env.NODE_ENV === "production") {
  serveStatic(app, distPath);
}

// Iniciar servidor
const port = 5000;
app.listen(port, "0.0.0.0", () => {
  log(`Server running on port ${port}`);
});