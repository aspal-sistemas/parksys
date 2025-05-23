// Archivo dedicado para manejar la integración entre usuarios y voluntarios
import { Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Función que obtiene los datos completos de un voluntario con su información de usuario
 * @returns Los datos combinados del voluntario y usuario
 */
export async function getVolunteerData(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no proporcionado' });
    }
    
    // Obtener los datos del voluntario usando la tabla volunteers
    const volunteerResult = await db.execute(
      sql`SELECT * FROM volunteers WHERE user_id = ${userId}`
    );
    
    if (!volunteerResult.rows || volunteerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Datos de voluntario no encontrados' });
    }
    
    const volunteerData = volunteerResult.rows[0];
    
    // Obtener los datos del usuario
    const userResult = await db.execute(
      sql`SELECT id, username, email, role, full_name as fullName, 
      municipality_id as municipalityId, phone, gender, birth_date as birthDate, 
      bio, profile_image_url as profileImageUrl, created_at as createdAt, 
      updated_at as updatedAt FROM users WHERE id = ${userId}`
    );
    
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const userData = userResult.rows[0];
    
    // Combinar datos
    const combinedData = {
      ...userData,
      preferredParkId: volunteerData.preferred_park_id,
      legalConsent: volunteerData.legal_consent === true,
      volunteerExperience: volunteerData.previous_experience,
      availability: volunteerData.available_hours,
      address: volunteerData.address || '',
      emergencyContactName: volunteerData.emergency_contact || '',
      emergencyContactPhone: volunteerData.emergency_phone || ''
    };
    
    return res.json(combinedData);
  } catch (error) {
    console.error('Error obteniendo datos de voluntario:', error);
    return res.status(500).json({ message: 'Error del servidor al obtener datos de voluntario' });
  }
}