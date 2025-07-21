import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

// GET /api/users - Obtener todos los usuarios
router.get('/users', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        username, 
        email, 
        role, 
        full_name as "fullName", 
        municipality_id as "municipalityId", 
        phone, 
        gender, 
        birth_date as "birthDate", 
        bio, 
        profile_image_url as "profileImageUrl", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// PUT /api/users/:id - Actualizar usuario (versión simplificada)
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const updateData = req.body;
    
    console.log(`🔄 Actualizando usuario ${userId} con datos:`, updateData);
    
    // Construir query dinámicamente
    const fieldsToUpdate = [];
    const values = [];
    let paramCounter = 1;

    if (updateData.role) {
      fieldsToUpdate.push(`role = $${paramCounter++}`);
      values.push(updateData.role);
    }
    if (updateData.username) {
      fieldsToUpdate.push(`username = $${paramCounter++}`);
      values.push(updateData.username);
    }
    if (updateData.email) {
      fieldsToUpdate.push(`email = $${paramCounter++}`);
      values.push(updateData.email);
    }
    if (updateData.fullName) {
      fieldsToUpdate.push(`full_name = $${paramCounter++}`);
      values.push(updateData.fullName);
    }
    if (updateData.phone !== undefined) {
      fieldsToUpdate.push(`phone = $${paramCounter++}`);
      values.push(updateData.phone);
    }
    if (updateData.gender) {
      fieldsToUpdate.push(`gender = $${paramCounter++}`);
      values.push(updateData.gender);
    }
    if (updateData.birthDate) {
      fieldsToUpdate.push(`birth_date = $${paramCounter++}`);
      values.push(updateData.birthDate);
    }
    if (updateData.bio !== undefined) {
      fieldsToUpdate.push(`bio = $${paramCounter++}`);
      values.push(updateData.bio);
    }
    if (updateData.municipalityId !== undefined) {
      fieldsToUpdate.push(`municipality_id = $${paramCounter++}`);
      values.push(updateData.municipalityId);
    }
    if (updateData.profileImageUrl) {
      fieldsToUpdate.push(`profile_image_url = $${paramCounter++}`);
      values.push(updateData.profileImageUrl);
    }

    // Siempre actualizar updated_at
    fieldsToUpdate.push(`updated_at = $${paramCounter++}`);
    values.push(new Date());
    
    // Agregar el ID al final
    values.push(userId);

    if (fieldsToUpdate.length === 1) { // Solo updated_at
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    const query = `
      UPDATE users 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = $${paramCounter}
      RETURNING 
        id, 
        username, 
        email, 
        role, 
        full_name as "fullName", 
        municipality_id as "municipalityId", 
        phone, 
        gender, 
        birth_date as "birthDate", 
        bio, 
        profile_image_url as "profileImageUrl", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `;

    console.log(`📝 Query SQL simplificado:`, query);
    console.log(`📝 Valores:`, values);

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log(`✅ Usuario ${userId} actualizado exitosamente`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Error al actualizar usuario:`, error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

export default router;