import express, { Request, Response } from "express";
import { db } from "./db";
import { assets } from "../shared/asset-schema";
import { eq, sql } from "drizzle-orm";

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
    if (req.body.location !== undefined) updateData.locationDescription = req.body.location;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.serialNumber !== undefined) updateData.serialNumber = req.body.serialNumber;
    if (req.body.acquisitionDate !== undefined) updateData.acquisitionDate = req.body.acquisitionDate;
    if (req.body.amenityId !== undefined) {
      console.log("=== PROCESANDO AMENITY ID ===");
      console.log("Valor recibido:", req.body.amenityId);
      console.log("Tipo:", typeof req.body.amenityId);
      
      if (req.body.amenityId === null || req.body.amenityId === "none" || req.body.amenityId === "" || req.body.amenityId === undefined) {
        updateData.amenityId = null;
        console.log("Asignando null a amenityId");
      } else {
        updateData.amenityId = parseInt(req.body.amenityId);
        console.log("Asignando parseInt result:", updateData.amenityId);
      }
    } else {
      console.log("amenityId no está definido en el body");
    }
    
    // Verificar si hay algún campo que se esté procesando incorrectamente
    console.log("=== VERIFICACIÓN FINAL DE DATOS ===");
    Object.keys(updateData).forEach(key => {
      if (typeof updateData[key] === 'number' && isNaN(updateData[key])) {
        console.log(`CAMPO CON NaN DETECTADO: ${key} = ${updateData[key]}`);
        updateData[key] = null; // Corregir NaN a null
      }
    });
    
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

// Endpoint para obtener amenidades instaladas en un parque específico
router.get("/parks/:parkId/amenities", async (req: Request, res: Response) => {
  try {
    const parkId = parseInt(req.params.parkId);
    
    const result = await db.execute(sql`
      SELECT 
        pa.id,
        pa.park_id as "parkId",
        pa.amenity_id as "amenityId",
        pa.module_name as "moduleName",
        pa.location_latitude as "locationLatitude",
        pa.location_longitude as "locationLongitude",
        pa.surface_area as "surfaceArea",
        pa.status,
        pa.description,
        a.name as "amenityName",
        a.icon as "amenityIcon"
      FROM park_amenities pa
      INNER JOIN amenities a ON pa.amenity_id = a.id
      WHERE pa.park_id = ${parkId}
      ORDER BY a.name
    `);
    
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error al obtener amenidades del parque:', error);
    res.status(500).json({ message: 'Error al obtener amenidades del parque' });
  }
});

// Endpoint para eliminar una amenidad instalada en un parque
router.delete("/park-amenities/:id", async (req: Request, res: Response) => {
  try {
    const amenityId = parseInt(req.params.id);
    
    if (isNaN(amenityId)) {
      return res.status(400).json({ message: 'ID de amenidad inválido' });
    }
    
    const result = await db.execute(sql`
      DELETE FROM park_amenities 
      WHERE id = ${amenityId}
    `);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Amenidad no encontrada' });
    }
    
    res.json({ message: 'Amenidad eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar amenidad:', error);
    res.status(500).json({ message: 'Error al eliminar amenidad' });
  }
});

export { router as simpleAssetRouter };