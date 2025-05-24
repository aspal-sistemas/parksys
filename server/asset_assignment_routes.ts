import { Request, Response, Router } from 'express';
import { db } from './db';
import { format } from 'date-fns';
import { sql } from 'drizzle-orm';

/**
 * Registra las rutas relacionadas con asignaciones de activos
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerAssetAssignmentRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Endpoint para crear una nueva asignación de activo a instructor
  apiRouter.post('/asset-assignments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const {
        assetId,
        instructorId,
        startDate,
        endDate,
        purpose,
        activityId,
        notes,
        requiresTraining,
        status
      } = req.body;

      // Validación básica
      if (!assetId || !instructorId || !startDate || !purpose) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: assetId, instructorId, startDate, purpose'
        });
      }

      // Verificar que el activo existe
      const [asset] = await db.execute(
        sql`SELECT * FROM assets WHERE id = ${assetId}`
      );

      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'El activo no existe'
        });
      }

      // Verificar que el instructor existe
      const [instructor] = await db.execute(
        sql`SELECT * FROM instructors WHERE id = ${instructorId}`
      );

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'El instructor no existe'
        });
      }

      // Verificar si hay conflictos en las fechas
      if (startDate && endDate) {
        const conflicts = await db.execute(
          sql`SELECT * FROM asset_assignments 
              WHERE asset_id = ${assetId} 
              AND status = 'active'
              AND (
                (start_date <= ${startDate} AND (end_date >= ${startDate} OR end_date IS NULL))
                OR 
                (start_date <= ${endDate} AND (end_date >= ${endDate} OR end_date IS NULL))
                OR
                (start_date >= ${startDate} AND (end_date <= ${endDate} OR end_date IS NULL))
              )`
        );

        if (conflicts && conflicts.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Existe un conflicto con otra asignación en el mismo período'
          });
        }
      }

      // Crear la asignación
      const [assignment] = await db.execute(
        sql`INSERT INTO asset_assignments (
          asset_id, 
          instructor_id, 
          start_date, 
          end_date, 
          purpose, 
          activity_id, 
          notes, 
          requires_training, 
          status,
          created_at,
          updated_at
        ) VALUES (
          ${assetId},
          ${instructorId},
          ${startDate},
          ${endDate || null},
          ${purpose},
          ${activityId || null},
          ${notes || null},
          ${requiresTraining || false},
          ${status || 'active'},
          NOW(),
          NOW()
        ) RETURNING *`
      );

      // Actualizar el estado del activo si es necesario
      await db.execute(
        sql`UPDATE assets SET status = 'assigned', updated_at = NOW() WHERE id = ${assetId}`
      );

      return res.status(201).json({
        success: true,
        data: assignment,
        message: 'Asignación creada correctamente'
      });
    } catch (error) {
      console.error('Error al crear asignación de activo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear la asignación de activo',
        error: error.message
      });
    }
  });

  // Endpoint para obtener todas las asignaciones de activos
  apiRouter.get('/asset-assignments', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const assignments = await db.execute(
        sql`SELECT aa.*, 
          a.name as asset_name, a.category_id, a.park_id,
          i.full_name as instructor_name, i.specialties,
          ac.title as activity_title,
          p.name as park_name
          FROM asset_assignments aa
          LEFT JOIN assets a ON aa.asset_id = a.id
          LEFT JOIN instructors i ON aa.instructor_id = i.id
          LEFT JOIN activities ac ON aa.activity_id = ac.id
          LEFT JOIN parks p ON a.park_id = p.id
          ORDER BY aa.created_at DESC`
      );

      return res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error al obtener asignaciones de activos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las asignaciones de activos',
        error: error.message
      });
    }
  });

  // Endpoint para obtener asignaciones de activos por instructor
  apiRouter.get('/instructors/:id/asset-assignments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const instructorId = req.params.id;
      
      const assignments = await db.execute(
        sql`SELECT aa.*, 
          a.name as asset_name, a.category_id, a.park_id,
          ac.title as activity_title,
          p.name as park_name
          FROM asset_assignments aa
          LEFT JOIN assets a ON aa.asset_id = a.id
          LEFT JOIN activities ac ON aa.activity_id = ac.id
          LEFT JOIN parks p ON a.park_id = p.id
          WHERE aa.instructor_id = ${instructorId}
          ORDER BY aa.start_date DESC`
      );

      return res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error(`Error al obtener asignaciones para el instructor ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las asignaciones del instructor',
        error: error.message
      });
    }
  });

  // Endpoint para obtener asignaciones de un activo específico
  apiRouter.get('/assets/:id/assignments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assetId = req.params.id;
      
      const assignments = await db.execute(
        sql`SELECT aa.*, 
          i.full_name as instructor_name, i.specialties,
          ac.title as activity_title
          FROM asset_assignments aa
          LEFT JOIN instructors i ON aa.instructor_id = i.id
          LEFT JOIN activities ac ON aa.activity_id = ac.id
          WHERE aa.asset_id = ${assetId}
          ORDER BY aa.start_date DESC`
      );

      return res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error(`Error al obtener asignaciones para el activo ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las asignaciones del activo',
        error: error.message
      });
    }
  });

  // Endpoint para actualizar una asignación
  apiRouter.put('/asset-assignments/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assignmentId = req.params.id;
      const {
        startDate,
        endDate,
        purpose,
        activityId,
        notes,
        requiresTraining,
        status
      } = req.body;

      // Verificar que la asignación existe
      const [existingAssignment] = await db.execute(
        sql`SELECT * FROM asset_assignments WHERE id = ${assignmentId}`
      );

      if (!existingAssignment) {
        return res.status(404).json({
          success: false,
          message: 'La asignación no existe'
        });
      }

      // Actualizar la asignación
      const [updatedAssignment] = await db.execute(
        sql`UPDATE asset_assignments SET
          start_date = COALESCE(${startDate}, start_date),
          end_date = COALESCE(${endDate}, end_date),
          purpose = COALESCE(${purpose}, purpose),
          activity_id = COALESCE(${activityId}, activity_id),
          notes = COALESCE(${notes}, notes),
          requires_training = COALESCE(${requiresTraining}, requires_training),
          status = COALESCE(${status}, status),
          updated_at = NOW()
          WHERE id = ${assignmentId}
          RETURNING *`
      );

      // Si la asignación se marca como finalizada, actualizar el estado del activo
      if (status === 'completed' || status === 'cancelled') {
        await db.execute(
          sql`UPDATE assets SET status = 'available', updated_at = NOW() WHERE id = ${existingAssignment.asset_id}`
        );
      }

      return res.json({
        success: true,
        data: updatedAssignment,
        message: 'Asignación actualizada correctamente'
      });
    } catch (error) {
      console.error(`Error al actualizar la asignación ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la asignación',
        error: error.message
      });
    }
  });

  // Endpoint para finalizar una asignación
  apiRouter.post('/asset-assignments/:id/complete', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assignmentId = req.params.id;
      const { notes, condition } = req.body;

      // Verificar que la asignación existe
      const [existingAssignment] = await db.execute(
        sql`SELECT * FROM asset_assignments WHERE id = ${assignmentId}`
      );

      if (!existingAssignment) {
        return res.status(404).json({
          success: false,
          message: 'La asignación no existe'
        });
      }

      // Actualizar la asignación como completada
      const [updatedAssignment] = await db.execute(
        sql`UPDATE asset_assignments SET
          status = 'completed',
          end_date = COALESCE(${format(new Date(), 'yyyy-MM-dd')}, end_date),
          notes = CASE WHEN ${notes} IS NOT NULL THEN CONCAT(notes, '\n\nDevolución: ', ${notes}) ELSE notes END,
          updated_at = NOW()
          WHERE id = ${assignmentId}
          RETURNING *`
      );

      // Actualizar el estado y condición del activo
      await db.execute(
        sql`UPDATE assets SET 
          status = 'available', 
          condition = COALESCE(${condition}, condition),
          updated_at = NOW() 
          WHERE id = ${existingAssignment.asset_id}`
      );

      return res.json({
        success: true,
        data: updatedAssignment,
        message: 'Asignación finalizada correctamente'
      });
    } catch (error) {
      console.error(`Error al finalizar la asignación ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error al finalizar la asignación',
        error: error.message
      });
    }
  });

  // Endpoint para reportar problemas con equipamiento asignado
  apiRouter.post('/asset-assignments/:id/report-issue', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assignmentId = req.params.id;
      const { description, priority, issueType } = req.body;

      // Validación básica
      if (!description || !priority || !issueType) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: description, priority, issueType'
        });
      }

      // Verificar que la asignación existe
      const [existingAssignment] = await db.execute(
        sql`SELECT aa.*, a.id as asset_id, a.name as asset_name 
            FROM asset_assignments aa
            JOIN assets a ON aa.asset_id = a.id
            WHERE aa.id = ${assignmentId}`
      );

      if (!existingAssignment) {
        return res.status(404).json({
          success: false,
          message: 'La asignación no existe'
        });
      }

      // Crear el reporte de problema
      const [issue] = await db.execute(
        sql`INSERT INTO asset_issues (
          asset_id,
          assignment_id,
          description,
          issue_type,
          priority,
          status,
          reported_at,
          reported_by,
          created_at,
          updated_at
        ) VALUES (
          ${existingAssignment.asset_id},
          ${assignmentId},
          ${description},
          ${issueType},
          ${priority},
          'pending',
          NOW(),
          ${req.user?.id || null},
          NOW(),
          NOW()
        ) RETURNING *`
      );

      // Actualizar las notas de la asignación
      await db.execute(
        sql`UPDATE asset_assignments SET
          notes = CASE WHEN notes IS NULL THEN ${'Problema reportado: ' + description}
                      ELSE CONCAT(notes, '\n\nProblema reportado: ', ${description})
                  END,
          updated_at = NOW()
          WHERE id = ${assignmentId}`
      );

      return res.status(201).json({
        success: true,
        data: issue,
        message: 'Problema reportado correctamente'
      });
    } catch (error) {
      console.error(`Error al reportar problema para la asignación ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error al reportar el problema',
        error: error.message
      });
    }
  });
}