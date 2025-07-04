import express, { type Request, Response } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { assets } from "../shared/schema";
import { eq } from "drizzle-orm";

const app = express();

// Middleware básico
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ruta básica de prueba
app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Servidor funcionando" });
});

// Ruta específica para obtener activos
app.get("/api/assets", async (req: Request, res: Response) => {
  try {
    const allAssets = await db.select().from(assets);
    res.json(allAssets);
  } catch (error) {
    console.error("Error al obtener activos:", error);
    res.status(500).json({ message: "Error al obtener activos" });
  }
});

// Ruta específica para obtener un activo por ID
app.get("/api/assets/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    
    if (!asset) {
      return res.status(404).json({ message: "Activo no encontrado" });
    }
    
    res.json(asset);
  } catch (error) {
    console.error("Error al obtener activo:", error);
    res.status(500).json({ message: "Error al obtener activo" });
  }
});

// Ruta específica para actualizar un activo
app.put("/api/assets/:id", async (req: Request, res: Response) => {
  try {
    console.log("=== ACTUALIZANDO ACTIVO ===");
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);
    
    const id = parseInt(req.params.id);
    
    // Preparar datos de actualización
    const updateData: any = {};
    
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.serialNumber !== undefined) updateData.serialNumber = req.body.serialNumber;
    if (req.body.parkId !== undefined) updateData.parkId = req.body.parkId;
    if (req.body.categoryId !== undefined) updateData.categoryId = req.body.categoryId;
    if (req.body.amenityId !== undefined) updateData.amenityId = req.body.amenityId;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.condition !== undefined) updateData.condition = req.body.condition;
    if (req.body.acquisitionDate !== undefined) updateData.acquisitionDate = req.body.acquisitionDate;
    if (req.body.acquisitionCost !== undefined) updateData.acquisitionCost = req.body.acquisitionCost;
    if (req.body.currentValue !== undefined) updateData.currentValue = req.body.currentValue;
    if (req.body.latitude !== undefined) updateData.latitude = req.body.latitude;
    if (req.body.longitude !== undefined) updateData.longitude = req.body.longitude;
    if (req.body.location !== undefined) updateData.locationDescription = req.body.location;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    
    updateData.updatedAt = new Date();
    
    console.log("Datos a actualizar:", updateData);
    
    const [updatedAsset] = await db
      .update(assets)
      .set(updateData)
      .where(eq(assets.id, id))
      .returning();
    
    console.log("Activo actualizado:", updatedAsset);
    
    res.json(updatedAsset);
  } catch (error) {
    console.error("Error al actualizar activo:", error);
    res.status(500).json({ message: "Error al actualizar activo", error: error.message });
  }
});

// Manejo de errores global
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error("Error global:", error);
  res.status(500).json({ message: "Error interno del servidor" });
});

(async () => {
  const server = setupVite(app, serveStatic);
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`Servidor mínimo funcionando en puerto ${port}`);
  });
})();