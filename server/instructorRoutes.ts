import { Request, Response } from "express";
import { db } from "./db";
import { 
  insertInstructorSchema,
  insertInstructorAssignmentSchema,
  insertInstructorEvaluationSchema,
  insertInstructorRecognitionSchema
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { instructors, instructorAssignments, instructorEvaluations, instructorRecognitions, users, parks, activities } from "@shared/schema";
import { forceSyncInstructor } from "./force-instructor-sync";

/**
 * Función que registra las rutas relacionadas con el módulo de instructores
 */
export function registerInstructorRoutes(app: any, apiRouter: any, publicApiRouter: any, isAuthenticated: any) {
  
  // === RUTAS PÚBLICAS PARA INSTRUCTORES ===
  if (publicApiRouter) {
    // Ruta pública para obtener todos los instructores activos
    publicApiRouter.get("/instructors", async (_req: Request, res: Response) => {
      try {
        // Usamos DISTINCT ON para eliminar duplicados basados en nombre y correo
        const result = await db.execute(
          sql`WITH unique_instructors AS (
                SELECT DISTINCT ON (LOWER(full_name), LOWER(email)) 
                  id, 
                  full_name, 
                  email, 
                  phone, 
                  specialties, 
                  experience_years, 
                  status, 
                  profile_image_url, 
                  created_at
                FROM instructors 
                WHERE status = 'active'
                ORDER BY LOWER(full_name), LOWER(email), created_at DESC
              )
              SELECT * FROM unique_instructors
              ORDER BY id DESC`
        );
        
        // Esta consulta ya entrega instructores únicos, pero mantenemos el filtro en memoria como seguridad adicional
        const uniqueInstructors = new Map();
        
        if (result.rows && result.rows.length > 0) {
          result.rows.forEach((instructor: any) => {
            const key = `${instructor.full_name.toLowerCase()}|${instructor.email.toLowerCase()}`;
            if (!uniqueInstructors.has(key)) {
              uniqueInstructors.set(key, instructor);
            }
          });
        }
        
        // Convertimos el Map a un array
        const instructorsArray = Array.from(uniqueInstructors.values());
        
        // Respondemos con el array directamente para mantener compatibilidad con el cliente existente
        res.json(instructorsArray);
      } catch (error) {
        console.error("Error al obtener instructores públicos:", error);
        res.status(500).json({ message: "Error al obtener instructores" });
      }
    });
  }
  
  // === RUTAS PARA INSTRUCTORES ===
  
  // Ruta para eliminar (inactivar) todos los instructores (solo administradores)
  apiRouter.delete("/instructors/batch/all", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Verificar que el usuario sea administrador
      if (req.headers['x-user-role'] !== 'admin') {
        return res.status(403).json({ message: "No autorizado. Solo administradores pueden realizar esta acción" });
      }
      
      // Obtenemos una lista de IDs de instructores activos para mostrar el conteo
      const activeInstructors = await db.execute(
        sql`SELECT id FROM instructors WHERE status = 'active'`
      );
      
      const activeCount = activeInstructors.rows?.length || 0;
      
      if (activeCount === 0) {
        return res.json({ 
          message: "No hay instructores activos para eliminar",
          count: 0
        });
      }
      
      // Realizamos un soft delete cambiando el estado a "inactive" para todos los instructores activos
      await db.execute(
        sql`UPDATE instructors SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE status = 'active'`
      );
      
      res.json({ 
        message: `${activeCount} instructores han sido inactivados correctamente`,
        count: activeCount
      });
    } catch (error) {
      console.error("Error al eliminar todos los instructores:", error);
      res.status(500).json({ message: "Error al eliminar los instructores" });
    }
  });

  // Obtener todos los instructores
  apiRouter.get("/instructors", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      // Usamos una consulta mejorada para incluir instructores vinculados a usuarios del sistema
      // y que esos instructores aparezcan primero en la lista para dar prioridad a los usuarios registrados
      const allInstructors = await db.execute(
        sql`
          WITH instructor_data AS (
            -- Primero seleccionamos instructores vinculados a usuarios del sistema (prioridad)
            SELECT i.*, 
                  u.username, 
                  u.email as user_email,
                  u.profile_image_url as user_profile_image,
                  1 as priority
            FROM instructors i
            JOIN users u ON i.user_id = u.id
            WHERE i.status = 'active' AND u.role = 'instructor'
            
            UNION ALL
            
            -- Luego seleccionamos instructores que no están vinculados a usuarios
            SELECT i.*, 
                  NULL as username, 
                  NULL as user_email,
                  NULL as user_profile_image,
                  2 as priority
            FROM instructors i
            WHERE i.status = 'active' AND i.user_id IS NULL
          )
          SELECT * FROM instructor_data
          ORDER BY priority, id DESC
        `
      );
      
      // Procesar los resultados para usar la información del usuario cuando esté disponible
      const processedInstructors = (allInstructors.rows || []).map(instructor => {
        // Si el instructor tiene un usuario vinculado, usar esos datos cuando no existan en el perfil
        if (instructor.user_id) {
          return {
            ...instructor,
            email: instructor.email || instructor.user_email,
            profile_image_url: instructor.profile_image_url || instructor.user_profile_image
          };
        }
        return instructor;
      });
      
      res.json(processedInstructors);
    } catch (error) {
      console.error("Error al obtener instructores:", error);
      res.status(500).json({ message: "Error al obtener instructores" });
    }
  });
  
  // Obtener un instructor específico por ID
  apiRouter.get("/instructors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "ID de instructor no válido" });
      }
      
      const [instructor] = await db
        .select()
        .from(instructors)
        .where(eq(instructors.id, instructorId));
      
      if (!instructor) {
        return res.status(404).json({ message: "Instructor no encontrado" });
      }
      
      res.json(instructor);
    } catch (error) {
      console.error(`Error al obtener instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener instructor" });
    }
  });
  
  // Forzar sincronización de instructor con usuario
  apiRouter.post("/instructors/:id/sync", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "ID de instructor no válido" });
      }
      
      // Forzar la sincronización
      const result = await forceSyncInstructor(instructorId);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: result.message,
          details: result.error
        });
      }
      
      res.json({ 
        message: "Instructor sincronizado correctamente", 
        data: result.data 
      });
    } catch (error) {
      console.error(`Error al sincronizar instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al sincronizar instructor" });
    }
  });
  
  // Crear un nuevo instructor
  apiRouter.post("/instructors", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validationResult = insertInstructorSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de instructor no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const [newInstructor] = await db
        .insert(instructors)
        .values({
          ...validationResult.data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.status(201).json(newInstructor);
    } catch (error) {
      console.error("Error al crear instructor:", error);
      res.status(500).json({ message: "Error al crear instructor" });
    }
  });
  
  // Actualizar un instructor existente
  apiRouter.put("/instructors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "ID de instructor no válido" });
      }
      
      const validationResult = insertInstructorSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de instructor no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const [updatedInstructor] = await db
        .update(instructors)
        .set({
          ...validationResult.data,
          updatedAt: new Date()
        })
        .where(eq(instructors.id, instructorId))
        .returning();
      
      if (!updatedInstructor) {
        return res.status(404).json({ message: "Instructor no encontrado" });
      }
      
      res.json(updatedInstructor);
    } catch (error) {
      console.error(`Error al actualizar instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar instructor" });
    }
  });
  
  // Eliminar un instructor
  apiRouter.delete("/instructors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "ID de instructor no válido" });
      }
      
      await db
        .delete(instructors)
        .where(eq(instructors.id, instructorId));
      
      res.json({ message: "Instructor eliminado correctamente" });
    } catch (error) {
      console.error(`Error al eliminar instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al eliminar instructor" });
    }
  });
  
  // === RUTAS PARA ASIGNACIONES DE INSTRUCTORES ===
  
  // Obtener todas las asignaciones de un instructor
  apiRouter.get("/instructors/:id/assignments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "ID de instructor no válido" });
      }
      
      const assignments = await db
        .select()
        .from(instructorAssignments)
        .where(eq(instructorAssignments.instructorId, instructorId))
        .orderBy(desc(instructorAssignments.startDate));
      
      // Obtener nombres de los parques donde están asignados
      const parkIds = [...new Set(assignments.map(a => a.parkId))];
      let parkNames: { id: number, name: string }[] = [];
      
      if (parkIds.length > 0) {
        // Usamos consultas separadas para evitar problemas con arrays en PostgreSQL
        for (const parkId of parkIds) {
          const [park] = await db
            .select({
              id: parks.id,
              name: parks.name
            })
            .from(parks)
            .where(eq(parks.id, parkId));
          
          if (park) {
            parkNames.push(park);
          }
        }
      }
      
      // Obtener información de las actividades asignadas
      const activityIds = assignments.map(a => a.activityId).filter(Boolean) as number[];
      let activityDetails: { id: number, title: string, category: string | null }[] = [];
      
      if (activityIds.length > 0) {
        // Usamos consultas separadas para evitar problemas con arrays en PostgreSQL
        for (const activityId of activityIds) {
          const [activity] = await db
            .select({
              id: activities.id,
              title: activities.title,
              category: activities.category
            })
            .from(activities)
            .where(eq(activities.id, activityId));
          
          if (activity) {
            activityDetails.push(activity);
          }
        }
      }
      
      // En este caso específico, vemos que las actividades son realmente duplicados técnicos
      // en la base de datos, ya que son exactamente la misma actividad, mismo parque, misma fecha,
      // pero con diferentes ID y horas asignadas. Vamos a unificar estas entradas.
      
      // Agrupar por actividad+parque+fecha
      const assignmentGroups = new Map();
      
      assignments.forEach(assignment => {
        const park = parkNames.find(p => p.id === assignment.parkId);
        const activity = activityDetails.find(a => a.id === assignment.activityId);
        
        // Creamos un objeto base con los datos comunes
        const baseAssignment = {
          activityName: activity ? activity.title : assignment.activityName,
          activityCategory: activity ? activity.category : null,
          parkName: park ? park.name : 'Parque desconocido',
          parkId: assignment.parkId,
          activityId: assignment.activityId,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          instructorId: assignment.instructorId,
        };
        
        // Clave para agrupar actividades que son "la misma" conceptualmente
        const groupKey = `${assignment.activityId || 0}|${assignment.parkId || 0}|${assignment.startDate || ''}`;
        
        if (!assignmentGroups.has(groupKey)) {
          // Inicializar un nuevo grupo
          assignmentGroups.set(groupKey, {
            ...baseAssignment,
            // En el ID usamos el mayor (presumiblemente el más reciente)
            id: assignment.id,
            // Sumamos las horas de todas las asignaciones relacionadas
            hoursAssigned: assignment.hoursAssigned || 0,
            // Mantenemos datos administrativos del registro más reciente
            createdAt: assignment.createdAt,
            assignedById: assignment.assignedById,
            notes: assignment.notes,
            // Lista de IDs originales para referencia
            originalIds: [assignment.id],
          });
        } else {
          // Actualizar el grupo existente
          const existingGroup = assignmentGroups.get(groupKey);
          
          // Sumar horas
          existingGroup.hoursAssigned += (assignment.hoursAssigned || 0);
          
          // Mantener el ID más alto
          if (assignment.id > existingGroup.id) {
            existingGroup.id = assignment.id;
            existingGroup.createdAt = assignment.createdAt;
            existingGroup.assignedById = assignment.assignedById;
            existingGroup.notes = assignment.notes;
          }
          
          // Agregar este ID a la lista de originales
          existingGroup.originalIds.push(assignment.id);
        }
      });
      
      // Convertir grupos a un array de asignaciones únicas
      const uniqueAssignments = Array.from(assignmentGroups.values())
        .sort((a, b) => {
          // Ordenar por fecha de inicio más reciente
          const dateA = new Date(a.startDate).getTime();
          const dateB = new Date(b.startDate).getTime();
          return dateB - dateA;
        });
      
      res.json(uniqueAssignments);
    } catch (error) {
      console.error(`Error al obtener asignaciones del instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener asignaciones" });
    }
  });
  
  // Crear una nueva asignación para un instructor
  apiRouter.post("/instructors/:id/assignments", isAuthenticated, async (req: Request, res: Response) => {
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
      
      const validationResult = insertInstructorAssignmentSchema.safeParse({
        ...req.body,
        instructorId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de asignación no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const [newAssignment] = await db
        .insert(instructorAssignments)
        .values(validationResult.data)
        .returning();
      
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error(`Error al crear asignación para instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al crear asignación" });
    }
  });
  
  // === RUTAS PARA EVALUACIONES DE INSTRUCTORES ===
  
  // Obtener todas las evaluaciones de un instructor
  apiRouter.get("/instructors/:id/evaluations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "ID de instructor no válido" });
      }
      
      // Usamos una consulta SQL específica para obtener solo los campos que existen en la tabla
      // Corregimos la unión con instructor_assignments para usar el nombre correcto de la columna
      const result = await db.execute(sql`
        SELECT 
          e.id,
          e.instructor_id,
          e.assignment_id,
          e.evaluator_id,
          e.created_at,
          e.comments,
          e.communication,
          e.knowledge,
          e.methodology,
          e.overall_performance,
          'supervisor' as evaluator_type,
          i.full_name as instructor_name,
          a.activity_name as activity_title
        FROM 
          instructor_evaluations e
        LEFT JOIN 
          instructors i ON e.instructor_id = i.id
        LEFT JOIN 
          instructor_assignments a ON e.assignment_id = a.id
        WHERE 
          e.instructor_id = ${instructorId}
        ORDER BY 
          e.created_at DESC
      `);
      
      res.json(result.rows || []);
    } catch (error) {
      console.error(`Error al obtener evaluaciones del instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener evaluaciones" });
    }
  });
  
  // Crear una nueva evaluación para un instructor
  apiRouter.post("/instructors/:id/evaluations", isAuthenticated, async (req: Request, res: Response) => {
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
      
      console.log("Recibiendo evaluación:", req.body);
      
      // Mapeamos los datos de entrada a los campos que realmente existen en la tabla
      // Si el evaluatorType es 'supervisor', usamos el ID del supervisor fijo (28)
      const evaluatorId = req.body.evaluationType === 'supervisor' 
        ? 28  // ID del supervisor que acabamos de crear
        : req.user?.id || null;
        
      const evaluationData = {
        instructorId,
        assignmentId: req.body.assignmentId,
        evaluatorId,
        knowledge: req.body.knowledge || 3,
        communication: req.body.communication || 3,
        methodology: req.body.methodology || 3,
        overallPerformance: req.body.overallPerformance || 3,
        comments: req.body.comments || ""
      };
      
      console.log("Datos de evaluación procesados:", evaluationData);
      
      // Usamos SQL directo para evitar problemas con campos que no existen
      const result = await db.execute(sql`
        INSERT INTO instructor_evaluations (
          instructor_id,
          assignment_id,
          evaluator_id,
          knowledge,
          communication,
          methodology,
          overall_performance,
          comments
        ) VALUES (
          ${evaluationData.instructorId},
          ${evaluationData.assignmentId},
          ${evaluationData.evaluatorId},
          ${evaluationData.knowledge},
          ${evaluationData.communication},
          ${evaluationData.methodology},
          ${evaluationData.overallPerformance},
          ${evaluationData.comments}
        )
        RETURNING *
      `);
      
      const newEvaluation = result.rows[0];
      
      res.status(201).json(newEvaluation);
    } catch (error) {
      console.error(`Error al crear evaluación para instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al crear evaluación" });
    }
  });
  
  // Obtener todas las evaluaciones (para la página de administración)
  apiRouter.get("/instructors-evaluations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Verificamos si se solicitan evaluaciones de un supervisor específico
      const evaluatorId = req.query.evaluatorId ? parseInt(req.query.evaluatorId as string) : null;
      
      // Si el usuario tiene rol 'supervisor', solo mostrar sus propias evaluaciones
      const userId = req.user?.id as number;
      const userRole = req.user?.role as string;
      
      // Si es el supervisor específico o un admin, continuar con la consulta
      if (userRole === 'supervisor' || userRole === 'admin') {
        try {
          // Construimos la consulta base
          let query = sql`
            SELECT 
              e.id,
              e.instructor_id,
              e.evaluator_id,
              e.assignment_id,
              e.knowledge,
              e.communication,
              e.methodology,
              e.overall_performance,
              e.comments,
              e.created_at,
              i.full_name as instructor_name,
              u.full_name as evaluator_name,
              u.role as evaluator_role,
              a.activity_name as activity_title
            FROM 
              instructor_evaluations e
            LEFT JOIN 
              instructors i ON e.instructor_id = i.id
            LEFT JOIN 
              users u ON e.evaluator_id = u.id
            LEFT JOIN 
              instructor_assignments a ON e.assignment_id = a.id
          `;
          
          // Si se filtra por evaluador específico o es un supervisor viendo sus propias evaluaciones
          if (evaluatorId || (userRole === 'supervisor' && !evaluatorId)) {
            const filterId = evaluatorId || userId;
            query = sql`${query} WHERE e.evaluator_id = ${filterId}`;
          }
          
          // Ordenamos por fecha de creación (más reciente primero)
          query = sql`${query} ORDER BY e.created_at DESC`;
          
          const result = await db.execute(query);
          return res.json(result.rows || []);
        } catch (error) {
          console.error("Error al obtener evaluaciones filtradas:", error);
          // Si hay error en la consulta personalizada, intentamos el endpoint simplificado
          const { getSimpleInstructorEvaluations } = await import('./simple-evaluations-endpoint');
          return getSimpleInstructorEvaluations(req, res);
        }
      } else {
        // Para otros usuarios, usar el endpoint simplificado
        const { getSimpleInstructorEvaluations } = await import('./simple-evaluations-endpoint');
        return getSimpleInstructorEvaluations(req, res);
      }
    } catch (error) {
      console.error("Error al obtener todas las evaluaciones:", error);
      res.status(500).json({ message: "Error al obtener evaluaciones" });
    }
  });

  // === RUTAS PARA RECONOCIMIENTOS DE INSTRUCTORES ===
  
  // Obtener todos los reconocimientos de un instructor
  apiRouter.get("/instructors/:id/recognitions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "ID de instructor no válido" });
      }
      
      const recognitions = await db
        .select()
        .from(instructorRecognitions)
        .where(eq(instructorRecognitions.instructorId, instructorId))
        .orderBy(desc(instructorRecognitions.issuedAt));
      
      res.json(recognitions);
    } catch (error) {
      console.error(`Error al obtener reconocimientos del instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener reconocimientos" });
    }
  });
  
  // Crear un nuevo reconocimiento para un instructor
  apiRouter.post("/instructors/:id/recognitions", isAuthenticated, async (req: Request, res: Response) => {
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
      
      const validationResult = insertInstructorRecognitionSchema.safeParse({
        ...req.body,
        instructorId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de reconocimiento no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const [newRecognition] = await db
        .insert(instructorRecognitions)
        .values(validationResult.data)
        .returning();
      
      res.status(201).json(newRecognition);
    } catch (error) {
      console.error(`Error al crear reconocimiento para instructor ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al crear reconocimiento" });
    }
  });
  
  // === RUTAS PARA ESTADÍSTICAS ===
  
  // Obtener estadísticas del dashboard de instructores
  apiRouter.get("/instructors/stats/dashboard", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      // Conteo total de instructores por estado
      const instructorsByStatus = await db
        .select({
          status: instructors.status,
          count: sql<number>`count(*)::int`
        })
        .from(instructors)
        .groupBy(instructors.status);
        
      // Total de horas asignadas
      const [totalHours] = await db
        .select({
          total: sql<number>`sum(${instructorAssignments.hoursAssigned})::int`
        })
        .from(instructorAssignments);
        
      // Actividades más populares
      const popularActivities = await db
        .select({
          activityName: instructorAssignments.activityName,
          count: sql<number>`count(*)::int`
        })
        .from(instructorAssignments)
        .groupBy(instructorAssignments.activityName)
        .orderBy(sql`count(*) desc`)
        .limit(5);
        
      // Parques con más asignaciones
      const popularParks = await db
        .select({
          parkId: instructorAssignments.parkId,
          count: sql<number>`count(*)::int`
        })
        .from(instructorAssignments)
        .groupBy(instructorAssignments.parkId)
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
      
      // Rendimiento promedio de los instructores
      const [avgPerformance] = await db
        .select({
          knowledge: sql<number>`avg(${instructorEvaluations.knowledge})::float`,
          communication: sql<number>`avg(${instructorEvaluations.communication})::float`,
          methodology: sql<number>`avg(${instructorEvaluations.methodology})::float`,
          overall: sql<number>`avg(${instructorEvaluations.overallPerformance})::float`
        })
        .from(instructorEvaluations);
      
      res.json({
        counts: {
          byStatus: instructorsByStatus,
          totalHours: totalHours?.total || 0
        },
        topActivities: popularActivities,
        topParks: parksWithNames,
        performance: {
          avgKnowledge: avgPerformance?.knowledge || 0,
          avgCommunication: avgPerformance?.communication || 0,
          avgMethodology: avgPerformance?.methodology || 0,
          avgOverall: avgPerformance?.overall || 0
        }
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de instructores:", error);
      res.status(500).json({ message: "Error al obtener estadísticas" });
    }
  });
}