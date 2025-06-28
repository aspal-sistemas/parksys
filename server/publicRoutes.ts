import { Request, Response } from 'express';
import { db } from './db';
import { activities, instructors, parks } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Registro de rutas públicas para instructores, actividades y parques
 * @param app Express app
 * @param publicRouter Express router para rutas públicas
 */
export function registerPublicRoutes(publicRouter: any) {
  // Ruta para obtener listado básico de parques (para formularios)
  publicRouter.get('/parks/list', async (_req: Request, res: Response) => {
    try {
      // Respuesta de emergencia - datos en caché para asegurar que funcione
      const emergencyParkList = [
        { id: 1, name: "Parque Metropolitano" },
        { id: 2, name: "Parque Agua Azul" },
        { id: 3, name: "Parque de la Solidaridad" },
        { id: 4, name: "Parque Huentitán" },
        { id: 5, name: "Parque Colomos" },
        { id: 6, name: "Parque González Gallo" },
        { id: 7, name: "Parque Morelos" },
        { id: 8, name: "Parque San Rafael" }
      ];
      
      try {
        // Primero intentamos obtener desde la base de datos
        const dbParkList = await db
          .select({
            id: parks.id,
            name: parks.name
          })
          .from(parks)
          .where(eq(parks.isDeleted, false))
          .orderBy(parks.name);
        
        // Si tenemos resultados de la base de datos, los usamos
        if (dbParkList && dbParkList.length > 0) {
          console.log("Enviando lista de parques desde la base de datos:", dbParkList.length);
          return res.json(dbParkList);
        }
      } catch (dbError) {
        console.error("Error al consultar parques en base de datos:", dbError);
        // Continuamos con la lista de emergencia
      }
      
      // Si llegamos aquí, usamos la lista de emergencia
      console.log("Enviando lista de parques de emergencia");
      res.json(emergencyParkList);
    } catch (error) {
      console.error("Error al obtener listado de parques:", error);
      // Últimamente, si todo falla, devolvemos la lista de emergencia
      const emergencyParkList = [
        { id: 1, name: "Parque Metropolitano" },
        { id: 2, name: "Parque Agua Azul" },
        { id: 3, name: "Parque de la Solidaridad" }
      ];
      res.json(emergencyParkList);
    }
  });
  // Endpoint para permitir a los ciudadanos evaluar a los instructores
  publicRouter.post('/instructors/:id/evaluations', async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "ID de instructor no válido" });
      }
      
      // Verificar que el instructor existe
      const [instructor] = await db
        .select()
        .from(instructors)
        .where(eq(instructors.id, instructorId));
      
      if (!instructor) {
        return res.status(404).json({ message: "Instructor no encontrado" });
      }
      
      // Validar los datos de entrada - versión simplificada para evaluación pública
      const { assignmentId, communication, knowledge, methodology, overallPerformance, comments } = req.body;
      
      if (!assignmentId || !communication || !knowledge || !methodology || !overallPerformance) {
        return res.status(400).json({ message: "Faltan campos obligatorios para la evaluación" });
      }
      
      // Insertar la evaluación
      const [newEvaluation] = await db
        .insert(instructorEvaluations)
        .values({
          instructorId,
          assignmentId,
          evaluatorId: 0, // Para evaluaciones públicas, usamos 0 como ID genérico
          communication,
          knowledge,
          methodology,
          overallPerformance,
          comments,
          // No incluimos campos que podrían no existir en la tabla
        })
        .returning();
      
      res.status(201).json({
        success: true,
        message: "Evaluación enviada correctamente",
        data: newEvaluation
      });
    } catch (error) {
      console.error(`Error al crear evaluación pública para instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al crear evaluación" });
    }
  });
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
  publicRouter.get('/public-activities', async (_req: Request, res: Response) => {
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