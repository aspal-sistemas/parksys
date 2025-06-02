import express, { Request, Response } from "express";
import { db } from "./db";
import { assets } from "../shared/asset-schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Obtener todos los activos
router.get("/assets", async (req: Request, res: Response) => {
  try {
    const allAssets = await db.select().from(assets);
    res.json(allAssets);
  } catch (error) {
    console.error("Error al obtener activos:", error);
    res.status(500).json({ message: "Error al obtener activos" });
  }
});

// Obtener un activo por ID
router.get("/assets/:id", async (req: Request, res: Response) => {
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

// Actualizar un activo
router.put("/assets/:id", async (req: Request, res: Response) => {
  try {
    console.log("=== ACTUALIZANDO ACTIVO ===");
    console.log("ID:", req.params.id);
    console.log("Body recibido:", req.body);
    
    const id = parseInt(req.params.id);
    
    // Verificar que el activo existe
    const [existingAsset] = await db.select().from(assets).where(eq(assets.id, id));
    if (!existingAsset) {
      return res.status(404).json({ message: "Activo no encontrado" });
    }
    
    // Preparar datos de actualización solo con campos definidos
    const updateData: any = {};
    
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.parkId !== undefined) updateData.parkId = parseInt(req.body.parkId);
    if (req.body.categoryId !== undefined) updateData.categoryId = parseInt(req.body.categoryId);
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.condition !== undefined) updateData.condition = req.body.condition;
    if (req.body.acquisitionCost !== undefined) updateData.acquisitionCost = parseFloat(req.body.acquisitionCost);
    if (req.body.latitude !== undefined) updateData.latitude = String(req.body.latitude);
    if (req.body.longitude !== undefined) updateData.longitude = String(req.body.longitude);
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.serialNumber !== undefined) updateData.serialNumber = req.body.serialNumber;
    if (req.body.amenityId !== undefined) {
      updateData.amenityId = req.body.amenityId === "none" ? null : parseInt(req.body.amenityId);
    }
    
    updateData.updatedAt = new Date();
    
    console.log("Datos preparados para actualización:", updateData);
    
    const [updatedAsset] = await db
      .update(assets)
      .set(updateData)
      .where(eq(assets.id, id))
      .returning();
    
    console.log("Activo actualizado exitosamente:", updatedAsset);
    
    res.json(updatedAsset);
  } catch (error) {
    console.error("Error al actualizar activo:", error);
    res.status(500).json({ 
      message: "Error al actualizar activo", 
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

export { router as simpleAssetRouter };