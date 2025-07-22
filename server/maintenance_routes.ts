import { Router, Request, Response } from 'express';
import { db } from './db';
import { assetMaintenances, assets, parkAmenities } from '../shared/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';

/**
 * Registra las rutas para el módulo de mantenimientos de activos
 */
export function registerMaintenanceRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Endpoint esperado por el frontend - /assets/maintenances
  apiRouter.get('/assets/maintenances', async (req: Request, res: Response) => {
    try {
      const { search, status } = req.query;

      let query = db
        .select({
          id: assetMaintenances.id,
          assetId: assetMaintenances.assetId,
          assetName: assets.name,
          maintenanceType: assetMaintenances.maintenanceType,
          description: assetMaintenances.description,
          date: assetMaintenances.date,
          status: assetMaintenances.status,
          cost: assetMaintenances.cost,
          performedBy: assetMaintenances.performedBy,
          createdAt: assetMaintenances.createdAt,
        })
        .from(assetMaintenances)
        .leftJoin(assets, eq(assetMaintenances.assetId, assets.id))
        .orderBy(desc(assetMaintenances.createdAt));

      const maintenances = await query;

      res.json(maintenances);
    } catch (error) {
      console.error('Error fetching assets maintenances:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Obtener todos los mantenimientos con información del activo (endpoint alternativo)
  apiRouter.get('/asset-maintenances', async (req: Request, res: Response) => {
    try {
      const { search, status } = req.query;

      let query = db
        .select({
          id: assetMaintenances.id,
          assetId: assetMaintenances.assetId,
          assetName: assets.name,
          maintenanceType: assetMaintenances.maintenanceType,
          description: assetMaintenances.description,
          date: assetMaintenances.date,
          status: assetMaintenances.status,
          cost: assetMaintenances.cost,
          performedBy: assetMaintenances.performedBy,
          createdAt: assetMaintenances.createdAt,
        })
        .from(assetMaintenances)
        .leftJoin(assets, eq(assetMaintenances.assetId, assets.id))
        .orderBy(desc(assetMaintenances.createdAt));

      const maintenances = await query;

      res.json(maintenances);
    } catch (error) {
      console.error('Error fetching asset maintenances:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Obtener mantenimientos de un activo específico
  apiRouter.get('/assets/:id/maintenances', async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);

      const maintenances = await db
        .select()
        .from(assetMaintenances)
        .where(eq(assetMaintenances.assetId, assetId))
        .orderBy(desc(assetMaintenances.createdAt));

      res.json(maintenances);
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
        cost,
        performedBy,
        notes
      } = req.body;

      const newMaintenance = await db
        .insert(assetMaintenances)
        .values({
          assetId,
          maintenanceType,
          description,
          date,
          status: 'completed',
          cost: cost ? cost.toString() : null,
          performedBy: performedBy || 'Personal de mantenimiento',
        })
        .returning();

      res.status(201).json(newMaintenance[0]);
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
        performedBy,
        notes
      } = req.body;

      const updatedMaintenance = await db
        .update(assetMaintenances)
        .set({
          maintenanceType,
          description,
          date: date ? new Date(date) : undefined,
          status,
          cost: cost ? parseFloat(cost) : null,
          performedBy,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();

      if (updatedMaintenance.length === 0) {
        return res.status(404).json({ error: 'Mantenimiento no encontrado' });
      }

      res.json(updatedMaintenance[0]);
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

      const updatedMaintenance = await db
        .update(assetMaintenances)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();

      if (updatedMaintenance.length === 0) {
        return res.status(404).json({ error: 'Mantenimiento no encontrado' });
      }

      res.json(updatedMaintenance[0]);
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      res.status(500).json({ error: 'Error al actualizar el estado del mantenimiento' });
    }
  });

  // Eliminar mantenimiento
  apiRouter.delete('/asset-maintenances/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);

      const deletedMaintenance = await db
        .delete(assetMaintenances)
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();

      if (deletedMaintenance.length === 0) {
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
      const stats = await db
        .select({
          total: assetMaintenances.id,
          status: assetMaintenances.status,
          maintenanceType: assetMaintenances.maintenanceType,
        })
        .from(assetMaintenances);

      // Procesar estadísticas
      const statusCounts = stats.reduce((acc: any, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      const typeCounts = stats.reduce((acc: any, item) => {
        acc[item.maintenanceType] = (acc[item.maintenanceType] || 0) + 1;
        return acc;
      }, {});

      res.json({
        total: stats.length,
        byStatus: statusCounts,
        byType: typeCounts,
      });
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });
}