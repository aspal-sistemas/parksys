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
      const { pool } = await import("./db");

      let query = `
        SELECT 
          aa.id,
          aa.asset_id as "assetId",
          aa.instructor_id as "instructorId", 
          aa.activity_id as "activityId",
          aa.assignment_date as "assignmentDate",
          aa.return_date as "returnDate",
          aa.purpose,
          aa.condition,
          aa.status,
          aa.notes,
          aa.created_at as "createdAt",
          a.name as "assetName",
          i.first_name as "instructorFirstName",
          i.last_name as "instructorLastName",
          act.title as "activityName"
        FROM asset_assignments aa
        LEFT JOIN assets a ON aa.asset_id = a.id
        LEFT JOIN instructors i ON aa.instructor_id = i.id
        LEFT JOIN activities act ON aa.activity_id = act.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        query += ` AND (a.name ILIKE $${paramCount} OR i.first_name ILIKE $${paramCount} OR i.last_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      if (status && status !== 'all') {
        paramCount++;
        query += ` AND aa.status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY aa.created_at DESC`;

      const result = await pool.query(query, params);

      // Formatear los datos para incluir nombres completos
      const formattedAssignments = result.rows.map(assignment => ({
        ...assignment,
        instructorName: assignment.instructorFirstName && assignment.instructorLastName 
          ? `${assignment.instructorFirstName} ${assignment.instructorLastName}`
          : null,
      }));

      console.log(`📋 Encontradas ${formattedAssignments.length} asignaciones de activos`);
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

      const { pool } = await import("./db");

      const query = `
        INSERT INTO asset_assignments (
          asset_id, instructor_id, activity_id, assignment_date, 
          purpose, condition, status, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, NOW(), NOW())
        RETURNING 
          id,
          asset_id as "assetId",
          instructor_id as "instructorId",
          activity_id as "activityId", 
          assignment_date as "assignmentDate",
          purpose,
          condition,
          status,
          notes,
          created_at as "createdAt"
      `;

      const result = await pool.query(query, [
        parseInt(assetId),
        instructorId ? parseInt(instructorId) : null,
        activityId ? parseInt(activityId) : null,
        assignmentDate,
        purpose,
        condition,
        notes
      ]);

      console.log(`✅ Nueva asignación creada con ID: ${result.rows[0].id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Error al crear la asignación' });
    }
  });

  // Obtener asignaciones de un instructor específico
  apiRouter.get('/instructors/:id/asset-assignments', async (req: Request, res: Response) => {
    try {
      const instructorId = parseInt(req.params.id);
      const { pool } = await import("./db");

      const query = `
        SELECT 
          aa.id,
          aa.asset_id as "assetId",
          aa.assignment_date as "assignmentDate",
          aa.return_date as "returnDate",
          aa.purpose,
          aa.condition,
          aa.status,
          aa.notes,
          aa.created_at as "createdAt",
          a.name as "assetName"
        FROM asset_assignments aa
        LEFT JOIN assets a ON aa.asset_id = a.id
        WHERE aa.instructor_id = $1
        ORDER BY aa.created_at DESC
      `;

      const result = await pool.query(query, [instructorId]);
      console.log(`📋 Encontradas ${result.rows.length} asignaciones para instructor ${instructorId}`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching instructor assignments:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Obtener asignaciones de un activo específico
  apiRouter.get('/assets/:id/assignments', async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      const { pool } = await import("./db");

      const query = `
        SELECT 
          aa.id,
          aa.instructor_id as "instructorId",
          aa.activity_id as "activityId",
          aa.assignment_date as "assignmentDate",
          aa.return_date as "returnDate",
          aa.purpose,
          aa.condition,
          aa.status,
          aa.notes,
          aa.created_at as "createdAt",
          i.first_name as "instructorFirstName",
          i.last_name as "instructorLastName",
          act.title as "activityName"
        FROM asset_assignments aa
        LEFT JOIN instructors i ON aa.instructor_id = i.id
        LEFT JOIN activities act ON aa.activity_id = act.id
        WHERE aa.asset_id = $1
        ORDER BY aa.created_at DESC
      `;

      const result = await pool.query(query, [assetId]);

      // Formatear los datos
      const formattedAssignments = result.rows.map(assignment => ({
        ...assignment,
        instructorName: assignment.instructorFirstName && assignment.instructorLastName 
          ? `${assignment.instructorFirstName} ${assignment.instructorLastName}`
          : null,
      }));

      console.log(`📋 Encontradas ${formattedAssignments.length} asignaciones para activo ${assetId}`);
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

      const { pool } = await import("./db");

      const query = `
        UPDATE asset_assignments SET
          instructor_id = $2,
          activity_id = $3,
          assignment_date = $4,
          return_date = $5,
          purpose = $6,
          condition = $7,
          status = $8,
          notes = $9,
          updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id,
          asset_id as "assetId",
          instructor_id as "instructorId",
          activity_id as "activityId",
          assignment_date as "assignmentDate",
          return_date as "returnDate",
          purpose,
          condition,
          status,
          notes,
          updated_at as "updatedAt"
      `;

      const result = await pool.query(query, [
        assignmentId,
        instructorId ? parseInt(instructorId) : null,
        activityId ? parseInt(activityId) : null,
        assignmentDate,
        returnDate,
        purpose,
        condition,
        status,
        notes
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      console.log(`✅ Asignación ${assignmentId} actualizada`);
      res.json(result.rows[0]);
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

      const { pool } = await import("./db");

      const query = `
        UPDATE asset_assignments SET
          status = 'returned',
          return_date = NOW(),
          condition = $2,
          notes = $3,
          updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id,
          asset_id as "assetId",
          instructor_id as "instructorId",
          activity_id as "activityId",
          assignment_date as "assignmentDate",
          return_date as "returnDate",
          purpose,
          condition,
          status,
          notes,
          updated_at as "updatedAt"
      `;

      const result = await pool.query(query, [assignmentId, condition, notes]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      console.log(`✅ Activo devuelto - Asignación ${assignmentId}`);
      res.json(result.rows[0]);
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

      const { pool } = await import("./db");

      const query = `
        UPDATE asset_assignments SET
          condition = $2,
          notes = $3,
          updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id,
          asset_id as "assetId",
          instructor_id as "instructorId",
          activity_id as "activityId",
          assignment_date as "assignmentDate",
          return_date as "returnDate",
          purpose,
          condition,
          status,
          notes,
          updated_at as "updatedAt"
      `;

      const result = await pool.query(query, [assignmentId, condition, notes]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      console.log(`⚠️ Problema reportado - Asignación ${assignmentId}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error reporting issue:', error);
      res.status(500).json({ error: 'Error al reportar el problema' });
    }
  });

  // Eliminar asignación
  apiRouter.delete('/asset-assignments/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const { pool } = await import("./db");

      const query = `
        DELETE FROM asset_assignments 
        WHERE id = $1 
        RETURNING id
      `;

      const result = await pool.query(query, [assignmentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      console.log(`🗑️ Asignación ${assignmentId} eliminada`);
      res.json({ message: 'Asignación eliminada correctamente' });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({ error: 'Error al eliminar la asignación' });
    }
  });

  // Obtener estadísticas de asignaciones
  apiRouter.get('/assignment-stats', async (req: Request, res: Response) => {
    try {
      const { pool } = await import("./db");

      const query = `
        SELECT 
          COUNT(*) as total,
          status,
          condition
        FROM asset_assignments
        GROUP BY status, condition
        ORDER BY status, condition
      `;

      const result = await pool.query(query);

      // Procesar estadísticas
      const statusCounts: Record<string, number> = {};
      const conditionCounts: Record<string, number> = {};
      let total = 0;

      result.rows.forEach((row: any) => {
        const count = parseInt(row.total);
        total += count;
        
        if (row.status) {
          statusCounts[row.status] = (statusCounts[row.status] || 0) + count;
        }
        
        if (row.condition) {
          conditionCounts[row.condition] = (conditionCounts[row.condition] || 0) + count;
        }
      });

      console.log(`📊 Estadísticas de asignaciones: ${total} total`);
      res.json({
        total,
        byStatus: statusCounts,
        byCondition: conditionCounts,
      });
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });
}