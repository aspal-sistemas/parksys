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
      const allInstructors = await db
        .select()
        .from(instructors)
        .where(eq(instructors.status, 'active'));
      
      return res.json(allInstructors);
    } catch (error) {
      console.error('Error al obtener instructores públicos:', error);
      return res.status(500).json({ message: 'Error al obtener instructores' });
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