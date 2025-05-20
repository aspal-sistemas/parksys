import { Request, Response } from "express";
import { db } from "./db";
import { 
  insertVolunteerSchema,
  insertVolunteerParticipationSchema,
  insertVolunteerEvaluationSchema,
  insertVolunteerRecognitionSchema
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { volunteers, volunteerParticipations, volunteerEvaluations, volunteerRecognitions, users, parks } from "@shared/schema";

/**
 * Función que registra las rutas relacionadas con el módulo de voluntariado
 */
export function registerVolunteerRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  
  // === RUTAS PARA VOLUNTARIOS ===
  
  // Obtener todos los voluntarios
  apiRouter.get("/volunteers", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const allVolunteers = await db.select().from(volunteers);
      res.json(allVolunteers);
    } catch (error) {
      console.error("Error al obtener voluntarios:", error);
      res.status(500).json({ message: "Error al obtener voluntarios" });
    }
  });

  // Obtener un voluntario específico
  apiRouter.get("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const [volunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));
      
      if (!volunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      res.json(volunteer);
    } catch (error) {
      console.error(`Error al obtener voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener datos del voluntario" });
    }
  });

  // Crear nuevo voluntario
  apiRouter.post("/volunteers", async (req: Request, res: Response) => {
    try {
      const validationResult = insertVolunteerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de voluntario no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Aseguramos los valores predeterminados
      const volunteerData = {
        ...validationResult.data,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [newVolunteer] = await db
        .insert(volunteers)
        .values(volunteerData)
        .returning();
        
      res.status(201).json(newVolunteer);
    } catch (error) {
      console.error("Error al crear voluntario:", error);
      res.status(500).json({ message: "Error al crear voluntario" });
    }
  });

  // Actualizar voluntario
  apiRouter.put("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Verificar si el voluntario existe
      const [existingVolunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Combinamos los datos existentes con los nuevos
      const updatedData = {
        ...existingVolunteer,
        ...req.body,
        id: volunteerId,
        updatedAt: new Date()
      };
      
      // Validamos los datos actualizados (omitimos algunos campos que no son necesarios validar)
      const { id, createdAt, updatedAt, ...dataToValidate } = updatedData;
      const validationResult = insertVolunteerSchema.safeParse(dataToValidate);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de voluntario no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Actualizamos el voluntario
      const [updatedVolunteer] = await db
        .update(volunteers)
        .set(updatedData)
        .where(eq(volunteers.id, volunteerId))
        .returning();
        
      res.json(updatedVolunteer);
    } catch (error) {
      console.error(`Error al actualizar voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar voluntario" });
    }
  });

  // Cambiar estado de voluntario (activar/desactivar)
  apiRouter.patch("/volunteers/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const { status } = req.body;
      
      if (!status || !["active", "inactive", "suspended", "pending"].includes(status)) {
        return res.status(400).json({ message: "Estado no válido. Debe ser 'active', 'inactive', 'pending' o 'suspended'" });
      }
      
      // Verificar si el voluntario existe
      const [existingVolunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Actualizar el estado del voluntario
      const [updatedVolunteer] = await db
        .update(volunteers)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(volunteers.id, volunteerId))
        .returning();
        
      res.json(updatedVolunteer);
    } catch (error) {
      console.error(`Error al actualizar estado del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar estado del voluntario" });
    }
  });

  // Eliminar voluntario (soft delete cambiando estado a "inactive")
  apiRouter.delete("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Verificar si el voluntario existe
      const [existingVolunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Realizamos un soft delete cambiando el estado a "inactive"
      await db
        .update(volunteers)
        .set({ 
          status: "inactive",
          updatedAt: new Date()
        })
        .where(eq(volunteers.id, volunteerId));
        
      res.json({ message: "Voluntario inactivado correctamente" });
    } catch (error) {
      console.error(`Error al eliminar voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al eliminar voluntario" });
    }
  });

  // === RUTAS PARA PARTICIPACIONES ===

  // Obtener todas las participaciones (¡IMPORTANTE: Este endpoint debe ir ANTES que el endpoint con parámetro!)
  apiRouter.get("/volunteers/participations", async (_req: Request, res: Response) => {
    try {
      console.log("Obteniendo todas las participaciones");
      const participations = await db
        .select()
        .from(volunteerParticipations)
        .orderBy(desc(volunteerParticipations.activityDate));
        
      console.log(`Se encontraron ${participations.length} participaciones`);
      res.json(participations);
    } catch (error) {
      console.error(`Error al obtener todas las participaciones:`, error);
      res.status(500).json({ message: "Error al obtener participaciones" });
    }
  });

  // Obtener participaciones de un voluntario
  apiRouter.get("/volunteers/:id/participations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const participations = await db
        .select()
        .from(volunteerParticipations)
        .where(eq(volunteerParticipations.volunteerId, volunteerId))
        .orderBy(desc(volunteerParticipations.activityDate));
        
      res.json(participations);
    } catch (error) {
      console.error(`Error al obtener participaciones del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener participaciones" });
    }
  });

  // Registrar nueva participación
  apiRouter.post("/volunteers/:id/participations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Aseguramos que el volunteerId en el cuerpo coincida con el de la URL
      const participationData = {
        ...req.body,
        volunteerId,
        createdAt: new Date()
      };
      
      const validationResult = insertVolunteerParticipationSchema.safeParse(participationData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de participación no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Insertamos la nueva participación en la base de datos
      const [newParticipation] = await db
        .insert(volunteerParticipations)
        .values(validationResult.data)
        .returning();
        
      res.status(201).json(newParticipation);
    } catch (error) {
      console.error(`Error al crear participación para voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al registrar participación" });
    }
  });

  // === RUTAS PARA EVALUACIONES ===

  // Obtener evaluaciones de un voluntario
  apiRouter.get("/volunteers/:id/evaluations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const evaluations = await db
        .select()
        .from(volunteerEvaluations)
        .where(eq(volunteerEvaluations.volunteerId, volunteerId))
        .orderBy(desc(volunteerEvaluations.createdAt));
        
      res.json(evaluations);
    } catch (error) {
      console.error(`Error al obtener evaluaciones del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener evaluaciones" });
    }
  });

  // Crear evaluación para una participación
  apiRouter.post("/participations/:id/evaluations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const participationId = parseInt(req.params.id);
      
      if (isNaN(participationId)) {
        return res.status(400).json({ message: "ID de participación no válido" });
      }
      
      // Verificar que existe la participación
      const [participation] = await db
        .select()
        .from(volunteerParticipations)
        .where(eq(volunteerParticipations.id, participationId));
      
      if (!participation) {
        return res.status(404).json({ message: "Participación no encontrada" });
      }
      
      // Aseguramos que el participationId coincida con el de la URL
      const evaluationData = {
        ...req.body,
        participationId,
        // Tomamos el ID del voluntario de la participación
        volunteerId: participation.volunteerId,
        // El evaluador es el usuario autenticado o el proporcionado en el cuerpo
        evaluatorId: req.user?.id || req.body.evaluatorId,
        // Agregamos la fecha de creación
        createdAt: new Date()
      };
      
      const validationResult = insertVolunteerEvaluationSchema.safeParse(evaluationData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de evaluación no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Insertamos la nueva evaluación en la base de datos
      const [newEvaluation] = await db
        .insert(volunteerEvaluations)
        .values(validationResult.data)
        .returning();
        
      res.status(201).json(newEvaluation);
    } catch (error) {
      console.error(`Error al crear evaluación para participación ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al registrar evaluación" });
    }
  });

  // === RUTAS PARA RECONOCIMIENTOS ===

  // Obtener reconocimientos de un voluntario
  apiRouter.get("/volunteers/:id/recognitions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const recognitions = await db
        .select()
        .from(volunteerRecognitions)
        .where(eq(volunteerRecognitions.volunteerId, volunteerId))
        .orderBy(desc(volunteerRecognitions.createdAt));
        
      res.json(recognitions);
    } catch (error) {
      console.error(`Error al obtener reconocimientos del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener reconocimientos" });
    }
  });

  // Crear reconocimiento para un voluntario
  apiRouter.post("/volunteers/:id/recognitions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Verificar que existe el voluntario
      const [volunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));
      
      if (!volunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Aseguramos que el volunteerId coincida con el de la URL
      const recognitionData = {
        ...req.body,
        volunteerId,
        // El emisor es el usuario autenticado o el proporcionado en el cuerpo
        issuedById: req.user?.id || req.body.issuedById,
        // Agregamos la fecha de creación
        createdAt: new Date()
      };
      
      const validationResult = insertVolunteerRecognitionSchema.safeParse(recognitionData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de reconocimiento no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Insertamos el nuevo reconocimiento en la base de datos
      const [newRecognition] = await db
        .insert(volunteerRecognitions)
        .values(validationResult.data)
        .returning();
        
      res.status(201).json(newRecognition);
    } catch (error) {
      console.error(`Error al crear reconocimiento para voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al crear reconocimiento" });
    }
  });
  
  // === RUTAS PARA ESTADÍSTICAS ===
  
  // Obtener estadísticas del dashboard de voluntarios
  apiRouter.get("/volunteers/stats/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Conteo total de voluntarios por estado
      const volunteersByStatus = await db
        .select({
          status: volunteers.status,
          count: sql<number>`count(*)::int`
        })
        .from(volunteers)
        .groupBy(volunteers.status);
        
      // Total de horas de voluntariado
      const [totalHours] = await db
        .select({
          total: sql<number>`sum(${volunteerParticipations.hoursContributed})::int`
        })
        .from(volunteerParticipations);
        
      // Actividades más populares
      const popularActivities = await db
        .select({
          activityName: volunteerParticipations.activityName,
          count: sql<number>`count(*)::int`
        })
        .from(volunteerParticipations)
        .groupBy(volunteerParticipations.activityName)
        .orderBy(sql`count(*) desc`)
        .limit(5);
        
      // Parques con más participación
      const popularParks = await db
        .select({
          parkId: volunteerParticipations.parkId,
          count: sql<number>`count(*)::int`
        })
        .from(volunteerParticipations)
        .groupBy(volunteerParticipations.parkId)
        .orderBy(sql`count(*) desc`)
        .limit(5);
        
      // Obtener nombres de parques populares
      const parkIds = popularParks.map(p => p.parkId);
      let parkNames = [];
      
      if (parkIds.length > 0) {
        parkNames = await db
          .select({
            id: parks.id,
            name: parks.name
          })
          .from(parks)
          .where(sql`${parks.id} = ANY(${parkIds})`);
      }
      
      // Combinar datos de parques populares con sus nombres
      const parksWithNames = popularParks.map(park => {
        const parkInfo = parkNames.find(p => p.id === park.parkId);
        return {
          ...park,
          parkName: parkInfo ? parkInfo.name : 'Parque desconocido'
        };
      });
      
      // Rendimiento promedio de los voluntarios
      const [avgPerformance] = await db
        .select({
          punctuality: sql<number>`avg(${volunteerEvaluations.punctuality})::float`,
          attitude: sql<number>`avg(${volunteerEvaluations.attitude})::float`,
          responsibility: sql<number>`avg(${volunteerEvaluations.responsibility})::float`,
          overall: sql<number>`avg(${volunteerEvaluations.overallPerformance})::float`
        })
        .from(volunteerEvaluations);
      
      res.json({
        volunteerCounts: {
          total: volunteersByStatus.reduce((sum, group) => sum + group.count, 0),
          byStatus: volunteersByStatus.reduce((obj, item) => {
            obj[item.status] = item.count;
            return obj;
          }, {} as Record<string, number>)
        },
        activities: {
          totalHours: totalHours?.total || 0,
          popularActivities
        },
        locations: {
          popularParks: parksWithNames
        },
        performance: avgPerformance || {
          punctuality: 0,
          attitude: 0,
          responsibility: 0,
          overall: 0
        }
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de voluntarios:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de voluntarios" });
    }
  });
}