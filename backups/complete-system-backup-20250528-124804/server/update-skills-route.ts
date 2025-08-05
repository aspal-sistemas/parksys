/**
 * Ruta especializada para actualización de habilidades
 * 
 * Este archivo define una ruta especial para actualizar el campo 'skills'
 * de un voluntario, aislando esta funcionalidad del resto del sistema
 * para resolver el problema específico.
 */

import express, { Request, Response } from 'express';
import { pool } from './db';

export const skillsRouter = express.Router();

// Endpoint para actualizar directamente las habilidades
skillsRouter.post('/volunteers/:id/skills', async (req: Request, res: Response) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const { skills } = req.body;

    console.log(`🚀 Actualizando habilidades para voluntario ID: ${volunteerId}`);
    console.log(`📝 Habilidades recibidas: "${skills}"`);

    if (isNaN(volunteerId)) {
      return res.status(400).json({
        success: false, 
        message: "ID de voluntario no válido"
      });
    }

    // Consulta SQL directa para actualizar solo las habilidades
    const query = `
      UPDATE volunteers 
      SET skills = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;

    const result = await pool.query(query, [skills, volunteerId]);
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Habilidades actualizadas correctamente");
      console.log("Resultado:", result.rows[0]);
      
      return res.json({
        success: true,
        message: "Habilidades actualizadas correctamente",
        data: result.rows[0]
      });
    } else {
      console.log("❌ Voluntario no encontrado");
      return res.status(404).json({
        success: false,
        message: "Voluntario no encontrado"
      });
    }
  } catch (error) {
    console.error("Error al actualizar habilidades:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar las habilidades del voluntario"
    });
  }
});