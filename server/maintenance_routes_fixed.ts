import { Router, Request, Response } from 'express';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';

/**
 * Registra las rutas para el módulo de mantenimientos de activos
 */
export function registerMaintenanceRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todos los mantenimientos con información del activo
  apiRouter.get('/asset-maintenances', async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT 
          am.id,
          am.asset_id as "assetId",
          a.name as "assetName",
          am.maintenance_type as "maintenanceType",
          am.description,
          am.date,
          am.status,
          am.cost,
          am.performed_by as "performedBy",
          am.created_at as "createdAt"
        FROM asset_maintenances am
        LEFT JOIN assets a ON am.asset_id = a.id
        ORDER BY am.created_at DESC
      `;

      const result = await db.execute(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching asset maintenances:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Obtener mantenimientos de un activo específico
  apiRouter.get('/assets/:id/maintenances', async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);

      const query = `
        SELECT *
        FROM asset_maintenances
        WHERE asset_id = $1
        ORDER BY created_at DESC
      `;

      const result = await db.execute(query, [assetId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching asset maintenances:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Crear nuevo mantenimiento
  apiRouter.post('/assets/:id/maintenances', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      const {
        maintenanceType,
        description,
        date,
        status,
        cost,
        performedBy
      } = req.body;

      console.log('🔧 Datos de mantenimiento recibidos en backend:', {
        maintenanceType,
        description,
        date,
        status,
        cost,
        performedBy
      });

      const query = `
        INSERT INTO asset_maintenances (
          asset_id, 
          maintenance_type, 
          description, 
          date, 
          status, 
          cost, 
          performed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await db.execute(query, [
        assetId,
        maintenanceType,
        description,
        date,
        status || 'scheduled',
        cost || null,
        performedBy || null
      ]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating maintenance:', error);
      res.status(500).json({ error: 'Error al crear el mantenimiento' });
    }
  });

  // Actualizar mantenimiento
  apiRouter.put('/asset-maintenances/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      const {
        maintenanceType,
        description,
        date,
        status,
        cost,
        performedBy
      } = req.body;

      const query = `
        UPDATE asset_maintenances 
        SET 
          maintenance_type = $1,
          description = $2,
          date = $3,
          status = $4,
          cost = $5,
          performed_by = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `;

      const result = await db.execute(query, [
        maintenanceType,
        description,
        date,
        status,
        cost,
        performedBy,
        maintenanceId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Mantenimiento no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating maintenance:', error);
      res.status(500).json({ error: 'Error al actualizar el mantenimiento' });
    }
  });

  // Actualizar solo el estado del mantenimiento
  apiRouter.patch('/asset-maintenances/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      const { status } = req.body;

      const query = `
        UPDATE asset_maintenances 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const result = await db.execute(query, [status, maintenanceId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Mantenimiento no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      res.status(500).json({ error: 'Error al actualizar el estado del mantenimiento' });
    }
  });

  // Eliminar mantenimiento
  apiRouter.delete('/asset-maintenances/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);

      const query = `
        DELETE FROM asset_maintenances 
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.execute(query, [maintenanceId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Mantenimiento no encontrado' });
      }

      res.json({ message: 'Mantenimiento eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      res.status(500).json({ error: 'Error al eliminar el mantenimiento' });
    }
  });

  // Obtener estadísticas de mantenimientos
  apiRouter.get('/maintenance-stats', async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          status,
          maintenance_type
        FROM asset_maintenances
        GROUP BY status, maintenance_type
      `;

      const result = await db.execute(query);
      
      const stats = result.rows.reduce((acc: any, row: any) => {
        acc.total = (acc.total || 0) + parseInt(row.total);
        acc.byStatus = acc.byStatus || {};
        acc.byType = acc.byType || {};
        acc.byStatus[row.status] = (acc.byStatus[row.status] || 0) + parseInt(row.total);
        acc.byType[row.maintenance_type] = (acc.byType[row.maintenance_type] || 0) + parseInt(row.total);
        return acc;
      }, {});

      res.json(stats);
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });
}