/**
 * Rutas directas para operaciones específicas con voluntarios
 * Se usa código SQL plano para evitar problemas de tipado y formato
 */

const { Router } = require('express');
const { pool } = require('./db');
const directRouter = Router();

// Ruta para actualizar habilidades de voluntario
directRouter.post('/volunteers/skills/:id', async (req, res) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const { skills } = req.body;

    console.log('Actualizando habilidades para voluntario ID:', volunteerId);
    console.log('Habilidades:', skills);

    // Query simple para actualizar solo las habilidades
    const query = `
      UPDATE volunteers 
      SET skills = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;

    const result = await pool.query(query, [skills || "", volunteerId]);

    if (result.rowCount > 0) {
      console.log('✅ Habilidades actualizadas correctamente');
      res.json({ success: true, data: result.rows[0] });
    } else {
      console.log('❌ No se encontró el voluntario');
      res.status(404).json({ success: false, message: 'Voluntario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar habilidades:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar habilidades' });
  }
});

module.exports = directRouter;