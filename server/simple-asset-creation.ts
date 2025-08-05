import { Request, Response, Router } from "express";
import { pool } from "./db";

export const simpleAssetRouter = Router();

simpleAssetRouter.post("/create-asset", async (req: Request, res: Response) => {
  try {
    console.log("Datos recibidos:", req.body);
    
    // Validación básica
    if (!req.body.name || !req.body.categoryId || !req.body.parkId) {
      return res.status(400).json({ 
        message: "Los campos name, categoryId y parkId son requeridos" 
      });
    }
    
    // Inserción directa
    const result = await pool.query(`
      INSERT INTO assets (
        name, serial_number, category_id, park_id, amenity_id,
        location_description, latitude, longitude, 
        status, condition, notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      ) RETURNING *
    `, [
      req.body.name,
      req.body.serialNumber || null,
      req.body.categoryId,
      req.body.parkId,
      req.body.amenityId || null,
      req.body.locationDescription || null,
      req.body.latitude || null,
      req.body.longitude || null,
      req.body.status || 'Activo',
      req.body.condition || 'Bueno',
      req.body.notes || null
    ]);
    
    console.log("Activo creado:", result.rows[0]);
    res.status(201).json({
      success: true,
      asset: result.rows[0]
    });
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear activo",
      error: error.message 
    });
  }
});