import { Request, Response } from 'express';
import { db } from './db';
import { activities, instructors } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Registro de rutas públicas para instructores y actividades
 * @param app Express app
 * @param publicRouter Express router para rutas públicas
 */
export function registerPublicRoutes(publicRouter: any) {
  // Obtener todos los instructores públicos (solo los activos)
  publicRouter.get('/instructors/public', async (_req: Request, res: Response) => {
    try {
      // Obtener instructores activos
      const allInstructors = await db
        .select()
        .from(instructors)
        .where(eq(instructors.status, 'active'));
      
      // Eliminar duplicados usando un Map con el ID como clave
      const instructorsMap = new Map();
      
      for (const instructor of allInstructors) {
        if (!instructorsMap.has(instructor.id)) {
          instructorsMap.set(instructor.id, instructor);
        }
      }
      
      // Convertir el Map a array
      const uniqueInstructors = Array.from(instructorsMap.values());
      
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