import { Router, Request, Response } from 'express';
import { db } from './db';
import { assetAssignments, assets, instructors, activities, parkAmenities } from '../shared/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';

/**
 * Registra las rutas para el módulo de asignaciones de activos
 */
export function registerAssetAssignmentRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todas las asignaciones con información completa
  apiRouter.get('/asset-assignments', async (req: Request, res: Response) => {
    try {
      const { search, status } = req.query;

      const assignments = await db
        .select({
          id: assetAssignments.id,
          assetId: assetAssignments.assetId,
          assetName: assets.name,
          instructorId: assetAssignments.instructorId,
          instructorName: instructors.firstName,
          instructorLastName: instructors.lastName,
          activityId: assetAssignments.activityId,
          activityName: activities.name,
          assignmentDate: assetAssignments.assignmentDate,
          returnDate: assetAssignments.returnDate,
          purpose: assetAssignments.purpose,
          condition: assetAssignments.condition,
          status: assetAssignments.status,
          notes: assetAssignments.notes,
          createdAt: assetAssignments.createdAt,
        })
        .from(assetAssignments)
        .leftJoin(assets, eq(assetAssignments.assetId, assets.id))
        .leftJoin(instructors, eq(assetAssignments.instructorId, instructors.id))
        .leftJoin(activities, eq(assetAssignments.activityId, activities.id))
        .orderBy(desc(assetAssignments.createdAt));

      // Formatear los datos para incluir nombres completos
      const formattedAssignments = assignments.map(assignment => ({
        ...assignment,
        instructorName: assignment.instructorName && assignment.instructorLastName 
          ? `${assignment.instructorName} ${assignment.instructorLastName}`
          : null,
      }));

      res.json(formattedAssignments);
    } catch (error) {
      console.error('Error fetching asset assignments:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Crear nueva asignación
  apiRouter.post('/asset-assignments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const {
        assetId,
        instructorId,
        activityId,
        assignmentDate,
        purpose,
        condition,
        notes
      } = req.body;

      const newAssignment = await db
        .insert(assetAssignments)
        .values({
          assetId: parseInt(assetId),
          instructorId: instructorId ? parseInt(instructorId) : null,
          activityId: activityId ? parseInt(activityId) : null,
          assignmentDate: new Date(assignmentDate),
          purpose,
          condition,
          status: 'active',
          notes,
        })
        .returning();

      res.status(201).json(newAssignment[0]);
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Error al crear la asignación' });
    }
  });

  // Obtener asignaciones de un instructor específico
  apiRouter.get('/instructors/:id/asset-assignments', async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);

      const assignments = await db
        .select({
          id: assetAssignments.id,
          assetId: assetAssignments.assetId,
          assetName: assets.name,
          assignmentDate: assetAssignments.assignmentDate,
          returnDate: assetAssignments.returnDate,
          purpose: assetAssignments.purpose,
          condition: assetAssignments.condition,
          status: assetAssignments.status,
          notes: assetAssignments.notes,
        })
        .from(assetAssignments)
        .leftJoin(assets, eq(assetAssignments.assetId, assets.id))
        .where(eq(assetAssignments.instructorId, instructorId))
        .orderBy(desc(assetAssignments.createdAt));

      res.json(assignments);
    } catch (error) {
      console.error('Error fetching instructor assignments:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Obtener asignaciones de un activo específico
  apiRouter.get('/assets/:id/assignments', async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);

      const assignments = await db
        .select({
          id: assetAssignments.id,
          instructorId: assetAssignments.instructorId,
          instructorName: instructors.firstName,
          instructorLastName: instructors.lastName,
          activityId: assetAssignments.activityId,
          activityName: activities.name,
          assignmentDate: assetAssignments.assignmentDate,
          returnDate: assetAssignments.returnDate,
          purpose: assetAssignments.purpose,
          condition: assetAssignments.condition,
          status: assetAssignments.status,
          notes: assetAssignments.notes,
        })
        .from(assetAssignments)
        .leftJoin(instructors, eq(assetAssignments.instructorId, instructors.id))
        .leftJoin(activities, eq(assetAssignments.activityId, activities.id))
        .where(eq(assetAssignments.assetId, assetId))
        .orderBy(desc(assetAssignments.createdAt));

      // Formatear los datos
      const formattedAssignments = assignments.map(assignment => ({
        ...assignment,
        instructorName: assignment.instructorName && assignment.instructorLastName 
          ? `${assignment.instructorName} ${assignment.instructorLastName}`
          : null,
      }));

      res.json(formattedAssignments);
    } catch (error) {
      console.error('Error fetching asset assignments:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Actualizar asignación
  apiRouter.put('/asset-assignments/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const {
        instructorId,
        activityId,
        assignmentDate,
        returnDate,
        purpose,
        condition,
        status,
        notes
      } = req.body;

      const updatedAssignment = await db
        .update(assetAssignments)
        .set({
          instructorId: instructorId ? parseInt(instructorId) : null,
          activityId: activityId ? parseInt(activityId) : null,
          assignmentDate: assignmentDate ? new Date(assignmentDate) : undefined,
          returnDate: returnDate ? new Date(returnDate) : null,
          purpose,
          condition,
          status,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(assetAssignments.id, assignmentId))
        .returning();

      if (updatedAssignment.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      res.json(updatedAssignment[0]);
    } catch (error) {
      console.error('Error updating assignment:', error);
      res.status(500).json({ error: 'Error al actualizar la asignación' });
    }
  });

  // Marcar activo como devuelto
  apiRouter.post('/asset-assignments/:id/return', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const { condition, notes } = req.body;

      const updatedAssignment = await db
        .update(assetAssignments)
        .set({
          status: 'returned',
          returnDate: new Date(),
          condition,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(assetAssignments.id, assignmentId))
        .returning();

      if (updatedAssignment.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      res.json(updatedAssignment[0]);
    } catch (error) {
      console.error('Error returning asset:', error);
      res.status(500).json({ error: 'Error al procesar la devolución' });
    }
  });

  // Reportar problema con activo asignado
  apiRouter.post('/asset-assignments/:id/report-issue', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const { condition, notes } = req.body;

      const updatedAssignment = await db
        .update(assetAssignments)
        .set({
          condition,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(assetAssignments.id, assignmentId))
        .returning();

      if (updatedAssignment.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      res.json(updatedAssignment[0]);
    } catch (error) {
      console.error('Error reporting issue:', error);
      res.status(500).json({ error: 'Error al reportar el problema' });
    }
  });

  // Eliminar asignación
  apiRouter.delete('/asset-assignments/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.id);

      const deletedAssignment = await db
        .delete(assetAssignments)
        .where(eq(assetAssignments.id, assignmentId))
        .returning();

      if (deletedAssignment.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      res.json({ message: 'Asignación eliminada correctamente' });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({ error: 'Error al eliminar la asignación' });
    }
  });

  // Obtener estadísticas de asignaciones
  apiRouter.get('/assignment-stats', async (req: Request, res: Response) => {
    try {
      const stats = await db
        .select({
          total: assetAssignments.id,
          status: assetAssignments.status,
          condition: assetAssignments.condition,
        })
        .from(assetAssignments);

      // Procesar estadísticas
      const statusCounts = stats.reduce((acc: any, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      const conditionCounts = stats.reduce((acc: any, item) => {
        acc[item.condition] = (acc[item.condition] || 0) + 1;
        return acc;
      }, {});

      res.json({
        total: stats.length,
        byStatus: statusCounts,
        byCondition: conditionCounts,
      });
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });
}