import { Request, Response } from 'express';
import { db } from './db';
import { activities, instructors } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Registro de rutas públicas para instructores y actividades
 * @param app Express app
 * @param publicRouter Express router para rutas públicas
 */
export function registerPublicRoutes(publicRouter: any) {
  // Obtener todos los instructores públicos (solo los activos)
  publicRouter.get('/instructors/public', async (_req: Request, res: Response) => {
    try {
      // Usamos SQL directo con DISTINCT ON para eliminar duplicados por nombre/email
      const result = await db.execute(
        sql`WITH unique_instructors AS (
              SELECT DISTINCT ON (LOWER(full_name), LOWER(email)) 
                id, 
                full_name, 
                email, 
                phone,
                specialties, 
                experience_years, 
                profile_image_url,
                created_at,
                bio,
                status,
                gender,
                available_hours,
                cv_url,
                education,
                certifications
              FROM instructors 
              WHERE status = 'active'
              ORDER BY LOWER(full_name), LOWER(email), created_at DESC
            )
            SELECT * FROM unique_instructors
            ORDER BY id DESC`
      );
      
      // Filtrar duplicados adicionales por nombre+email (doble verificación)
      const uniqueMap = new Map();
      
      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((instructor) => {
          if (instructor.full_name && instructor.email) {
            const key = `${instructor.full_name.toLowerCase()}|${instructor.email.toLowerCase()}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, instructor);
            }
          } else {
            uniqueMap.set(instructor.id, instructor);
          }
        });
      }
      
      // Convertir el Map a array
      const uniqueInstructors = Array.from(uniqueMap.values());
      
      // Estructurar la respuesta
      return res.json({
        status: "success",
        data: uniqueInstructors,
        count: uniqueInstructors.length
      });
    } catch (error) {
      console.error('Error al obtener instructores públicos:', error);
      return res.status(500).json({ 
        status: "error", 
        message: 'Error al obtener instructores' 
      });
    }
  });

  // Obtener todas las actividades públicas
  publicRouter.get('/activities/public', async (_req: Request, res: Response) => {
    try {
      const allActivities = await db.select({
        id: activities.id,
        title: activities.title,
        description: activities.description,
        category: activities.category,
        parkId: activities.parkId,
        parkName: activities.parkName,
        location: activities.location,
        startDate: activities.startDate,
        endDate: activities.endDate,
        capacity: activities.capacity,
        price: activities.price,
        instructorId: activities.instructorId,
        instructorName: activities.instructorName
      }).from(activities);
      
      return res.json(allActivities);
    } catch (error) {
      console.error('Error al obtener actividades públicas:', error);
      return res.status(500).json({ message: 'Error al obtener actividades' });
    }
  });
}