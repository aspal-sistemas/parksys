import express from 'express';
import { db, pool } from './db';
import { storage } from './storage';

// Crear y configurar el router para videos
const videoRouter = express.Router();

// Endpoint para actualizar video de un parque
videoRouter.post('/update/:id', async (req, res) => {
  try {
    const parkId = Number(req.params.id);
    const { videoUrl } = req.body;
    
    if (videoUrl === undefined) {
      return res.status(400).json({ message: "videoUrl is required" });
    }
    
    // Verificamos que existe el parque
    const existingPark = await storage.getPark(parkId);
    if (!existingPark) {
      return res.status(404).json({ message: "Parque no encontrado" });
    }
    
    // Actualizamos directamente usando SQL parametrizado
    await pool.query(`UPDATE parks SET video_url = $1 WHERE id = $2`, [videoUrl, parkId]);
    
    res.json({ 
      success: true, 
      message: "Video URL updated successfully",
      videoUrl: videoUrl
    });
  } catch (error) {
    console.error("Error al actualizar video:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating video URL",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export { videoRouter };