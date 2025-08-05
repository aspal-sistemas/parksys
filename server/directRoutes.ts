/**
 * Rutas directas para operaciones específicas con voluntarios
 * Se usa código SQL plano para evitar problemas de tipado y formato
 */
import { Router, Request, Response } from 'express';
import { pool } from './db';

// Crear router para rutas directas
const directRouter = Router();

// Ruta para actualizar experiencia de voluntario
directRouter.post('/volunteers/experience/:id', async (req: Request, res: Response) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const { experience } = req.body;

    console.log('Actualizando experiencia para voluntario ID:', volunteerId);
    console.log('Experiencia:', experience);

    // Query simple para actualizar solo la experiencia
    const query = `
      UPDATE volunteers 
      SET previous_experience = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;

    const result = await pool.query(query, [experience || "", volunteerId]);

    if (result.rowCount > 0) {
      console.log('✅ Experiencia actualizada correctamente');
      res.json({ success: true, data: result.rows[0] });
    } else {
      console.log('❌ No se encontró el voluntario');
      res.status(404).json({ success: false, message: 'Voluntario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar experiencia:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar experiencia' });
  }
});

// Ruta para actualizar disponibilidad
directRouter.post('/volunteers/availability/:id', async (req: Request, res: Response) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const { availability } = req.body;

    console.log('Actualizando disponibilidad para voluntario ID:', volunteerId);
    console.log('Disponibilidad:', availability);

    // Query simple para actualizar solo la disponibilidad
    const query = `
      UPDATE volunteers 
      SET available_hours = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;

    const result = await pool.query(query, [availability || "flexible", volunteerId]);

    if (result.rowCount > 0) {
      console.log('✅ Disponibilidad actualizada correctamente');
      res.json({ success: true, data: result.rows[0] });
    } else {
      console.log('❌ No se encontró el voluntario');
      res.status(404).json({ success: false, message: 'Voluntario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar disponibilidad' });
  }
});

export default directRouter;