import { Request, Response, Router } from 'express';
import { db } from './db';
import { eq, and, lte, gte } from 'drizzle-orm';
import { assets, assetMaintenances } from '../shared/asset-schema';

export function registerMaintenanceRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  
  // Obtener todos los mantenimientos programados
  apiRouter.get("/maintenance/scheduled", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const scheduledMaintenances = await db.query.assetMaintenances.findMany({
        with: {
          asset: true,
          assignedTo: true
        },
        orderBy: (maintenances, { asc }) => [asc(maintenances.date)]
      });
      
      return res.json(scheduledMaintenances);
    } catch (error) {
      console.error('Error al obtener mantenimientos programados:', error);
      return res.status(500).json({ message: "Error al obtener los mantenimientos programados" });
    }
  });
  
  // Obtener mantenimientos próximos
  apiRouter.get("/assets/maintenance/upcoming", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      // Obtener fecha actual
      const now = new Date();
      
      // Consultar mantenimientos programados para los próximos 30 días
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      
      const upcomingMaintenances = await db.query.assetMaintenances.findMany({
        where: and(
          gte(assetMaintenances.date, now),
          lte(assetMaintenances.date, thirtyDaysFromNow)
        ),
        with: {
          asset: true,
          assignedTo: true
        },
        orderBy: (maintenances, { asc }) => [asc(maintenances.date)]
      });
      
      // Transformar los datos para incluir la información del activo
      const formattedMaintenances = upcomingMaintenances.map(maintenance => ({
        id: maintenance.id,
        assetId: maintenance.assetId,
        name: maintenance.asset.name,
        date: maintenance.date,
        maintenanceType: maintenance.maintenanceType,
        description: maintenance.description,
        estimatedCost: maintenance.estimatedCost,
        priority: maintenance.priority,
        assignedTo: maintenance.assignedTo,
        notes: maintenance.notes,
        nextMaintenanceDate: maintenance.date
      }));
      
      return res.json(formattedMaintenances);
    } catch (error) {
      console.error('Error al obtener próximos mantenimientos:', error);
      return res.status(500).json({ message: "Error al obtener los próximos mantenimientos" });
    }
  });
  
  // Programar un nuevo mantenimiento
  apiRouter.post("/maintenance/schedule", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        assetId, 
        date, 
        maintenanceType, 
        description, 
        estimatedCost, 
        priority, 
        assignedToId, 
        notes 
      } = req.body;
      
      // Validaciones básicas
      if (!assetId || !date || !maintenanceType || !description) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }
      
      // Verificar que el activo existe
      const assetExists = await db.query.assets.findFirst({
        where: eq(assets.id, assetId)
      });
      
      if (!assetExists) {
        return res.status(404).json({ message: "El activo especificado no existe" });
      }
      
      // Crear el nuevo registro de mantenimiento
      const [newMaintenance] = await db.insert(assetMaintenances).values({
        assetId,
        date: new Date(date),
        maintenanceType,
        description,
        estimatedCost: estimatedCost || null,
        priority: priority || 'medium',
        assignedToId: assignedToId || null,
        notes: notes || null,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return res.status(201).json(newMaintenance);
    } catch (error) {
      console.error('Error al programar mantenimiento:', error);
      return res.status(500).json({ message: "Error al programar el mantenimiento" });
    }
  });
  
  // Obtener mantenimientos de un activo específico
  apiRouter.get("/assets/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      
      if (isNaN(assetId)) {
        return res.status(400).json({ message: "ID de activo no válido" });
      }
      
      const maintenances = await db.query.assetMaintenances.findMany({
        where: eq(assetMaintenances.assetId, assetId),
        with: {
          assignedTo: true
        },
        orderBy: (maintenances, { desc }) => [desc(maintenances.date)]
      });
      
      return res.json(maintenances);
    } catch (error) {
      console.error(`Error al obtener mantenimientos del activo ${req.params.id}:`, error);
      return res.status(500).json({ message: "Error al obtener los mantenimientos" });
    }
  });
  
  // Actualizar un mantenimiento programado
  apiRouter.put("/maintenance/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de mantenimiento no válido" });
      }
      
      const { 
        date, 
        maintenanceType, 
        description, 
        estimatedCost, 
        priority, 
        assignedToId, 
        notes,
        status
      } = req.body;
      
      // Verificar que el mantenimiento existe
      const maintenanceExists = await db.query.assetMaintenances.findFirst({
        where: eq(assetMaintenances.id, maintenanceId)
      });
      
      if (!maintenanceExists) {
        return res.status(404).json({ message: "El mantenimiento especificado no existe" });
      }
      
      // Actualizar el registro
      const [updatedMaintenance] = await db
        .update(assetMaintenances)
        .set({
          date: date ? new Date(date) : maintenanceExists.date,
          maintenanceType: maintenanceType || maintenanceExists.maintenanceType,
          description: description || maintenanceExists.description,
          estimatedCost: estimatedCost !== undefined ? estimatedCost : maintenanceExists.estimatedCost,
          priority: priority || maintenanceExists.priority,
          assignedToId: assignedToId !== undefined ? assignedToId : maintenanceExists.assignedToId,
          notes: notes !== undefined ? notes : maintenanceExists.notes,
          status: status || maintenanceExists.status,
          updatedAt: new Date()
        })
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();
      
      return res.json(updatedMaintenance);
    } catch (error) {
      console.error(`Error al actualizar mantenimiento ${req.params.id}:`, error);
      return res.status(500).json({ message: "Error al actualizar el mantenimiento" });
    }
  });
  
  // Eliminar un mantenimiento programado
  apiRouter.delete("/maintenance/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de mantenimiento no válido" });
      }
      
      // Verificar que el mantenimiento existe
      const maintenanceExists = await db.query.assetMaintenances.findFirst({
        where: eq(assetMaintenances.id, maintenanceId)
      });
      
      if (!maintenanceExists) {
        return res.status(404).json({ message: "El mantenimiento especificado no existe" });
      }
      
      // Eliminar el registro
      await db
        .delete(assetMaintenances)
        .where(eq(assetMaintenances.id, maintenanceId));
      
      return res.json({ message: "Mantenimiento eliminado correctamente" });
    } catch (error) {
      console.error(`Error al eliminar mantenimiento ${req.params.id}:`, error);
      return res.status(500).json({ message: "Error al eliminar el mantenimiento" });
    }
  });
  
  // Completar un mantenimiento programado
  apiRouter.post("/maintenance/:id/complete", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de mantenimiento no válido" });
      }
      
      const { actualCost, completionNotes } = req.body;
      
      // Verificar que el mantenimiento existe
      const maintenanceExists = await db.query.assetMaintenances.findFirst({
        where: eq(assetMaintenances.id, maintenanceId)
      });
      
      if (!maintenanceExists) {
        return res.status(404).json({ message: "El mantenimiento especificado no existe" });
      }
      
      // Actualizar el registro como completado
      const [completedMaintenance] = await db
        .update(assetMaintenances)
        .set({
          status: 'completed',
          actualCost: actualCost || null,
          completionNotes: completionNotes || null,
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();
      
      // También actualizamos la fecha del último mantenimiento en el activo
      await db
        .update(assets)
        .set({
          lastMaintenanceDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(assets.id, maintenanceExists.assetId));
      
      return res.json(completedMaintenance);
    } catch (error) {
      console.error(`Error al completar mantenimiento ${req.params.id}:`, error);
      return res.status(500).json({ message: "Error al completar el mantenimiento" });
    }
  });
}