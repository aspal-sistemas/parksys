import { Request, Response, Router } from "express";
import { db, pool } from "./db";
import { assets, assetCategories, assetMaintenances, parks, parkAmenities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export function registerAssetRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Get all asset categories
  apiRouter.get("/asset-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(assetCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de activos:", error);
      res.status(500).json({ message: "Error al obtener categorías de activos" });
    }
  });

  // Get asset category by ID
  apiRouter.get("/asset-categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const [category] = await db.select().from(assetCategories).where(eq(assetCategories.id, id));
      
      if (!category) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error al obtener categoría:", error);
      res.status(500).json({ message: "Error al obtener categoría de activo" });
    }
  });

  // Get all assets
  apiRouter.get("/assets", async (req: Request, res: Response) => {
    try {
      const allAssets = await db
        .select({
          id: assets.id,
          name: assets.name,
          description: assets.description,
          serialNumber: assets.serialNumber,
          acquisitionDate: assets.acquisitionDate,
          acquisitionCost: assets.acquisitionCost,
          parkId: assets.parkId,
          categoryId: assets.categoryId,
          status: assets.status,
          condition: assets.condition,
          locationDescription: assets.locationDescription,
          latitude: assets.latitude,
          longitude: assets.longitude,
          lastMaintenanceDate: assets.lastMaintenanceDate,
          nextMaintenanceDate: assets.nextMaintenanceDate,
          createdAt: assets.createdAt,
          updatedAt: assets.updatedAt,
          categoryName: assetCategories.name,
          parkName: parks.name
        })
        .from(assets)
        .leftJoin(assetCategories, eq(assets.categoryId, assetCategories.id))
        .leftJoin(parks, eq(assets.parkId, parks.id));
      
      res.json(allAssets);
    } catch (error) {
      console.error("Error al obtener activos:", error);
      res.status(500).json({ message: "Error al obtener activos" });
    }
  });



  // Get asset by ID
  apiRouter.get("/assets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de activo inválido" });
      }
      
      console.log(`Intentando obtener activo con ID: ${id}`);
      
      const [asset] = await db.select().from(assets).where(eq(assets.id, id));
      
      if (!asset) {
        console.log(`No se encontró ningún activo con ID: ${id}`);
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      
      console.log(`Activo encontrado: ${asset.name}`);
      res.json(asset);
    } catch (error) {
      console.error("Error al obtener activo:", error);
      res.status(500).json({ message: "Error al obtener activo" });
    }
  });

  // Create new asset
  apiRouter.post("/assets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assetData = {
        name: req.body.name,
        description: req.body.description || null,
        serialNumber: req.body.serialNumber || null,
        categoryId: parseInt(req.body.categoryId),
        parkId: parseInt(req.body.parkId),
        status: req.body.status || 'active',
        condition: req.body.condition || 'good',
        locationDescription: req.body.location || null,
        acquisitionDate: req.body.acquisitionDate || null,
        acquisitionCost: req.body.acquisitionCost ? req.body.acquisitionCost.toString() : null,
        notes: req.body.notes || null,
        amenityId: req.body.amenityId || null,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        manufacturer: req.body.manufacturer || null,
        model: req.body.model || null,
        currentValue: req.body.currentValue || null,
        maintenanceFrequency: req.body.maintenanceFrequency || null,
        lastMaintenanceDate: req.body.lastMaintenanceDate || null,
        nextMaintenanceDate: req.body.nextMaintenanceDate || null,
        expectedLifespan: req.body.expectedLifespan ? parseInt(req.body.expectedLifespan) : null,
        qrCode: req.body.qrCode || null,
        responsiblePersonId: req.body.responsiblePersonId ? parseInt(req.body.responsiblePersonId) : null
      };

      const [newAsset] = await db.insert(assets).values([assetData]).returning();
      res.status(201).json(newAsset);
    } catch (error) {
      console.error("Error al crear activo:", error);
      res.status(500).json({ message: "Error al crear activo" });
    }
  });

  // Update asset
  apiRouter.put("/assets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      console.log(`Actualizando activo ID: ${id}`);
      console.log("Datos recibidos:", JSON.stringify(req.body, null, 2));
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      // Check if asset exists
      const [existingAsset] = await db.select().from(assets).where(eq(assets.id, id));
      if (!existingAsset) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }

      // Prepare update data with proper handling of fields
      const updateData: any = {
        name: req.body.name,
        description: req.body.description || null,
        serialNumber: req.body.serialNumber || null,
        categoryId: req.body.categoryId,
        parkId: req.body.parkId,
        status: req.body.status,
        condition: req.body.condition,
        locationDescription: req.body.location || null, // Map location to locationDescription
        acquisitionDate: req.body.acquisitionDate || null,
        acquisitionCost: req.body.acquisitionCost ? req.body.acquisitionCost.toString() : null,
        updatedAt: new Date()
      };

      // Handle amenityId - convert from park_amenities.id to amenities.id
      if (req.body.amenityId !== undefined && req.body.amenityId !== null) {
        // Get the actual amenity_id from park_amenities table
        const [parkAmenity] = await db
          .select({ amenityId: parkAmenities.amenityId })
          .from(parkAmenities)
          .where(eq(parkAmenities.id, req.body.amenityId));
          
        if (parkAmenity) {
          updateData.amenityId = parkAmenity.amenityId;
          console.log(`Convertido park_amenities.id ${req.body.amenityId} a amenities.id ${parkAmenity.amenityId}`);
        } else {
          updateData.amenityId = null;
          console.log(`No se encontró park_amenity con id ${req.body.amenityId}`);
        }
      } else {
        updateData.amenityId = null;
      }

      if (req.body.latitude) {
        updateData.latitude = req.body.latitude;
      }

      if (req.body.longitude) {
        updateData.longitude = req.body.longitude;
      }

      console.log("Datos de actualización preparados:", JSON.stringify(updateData, null, 2));

      const [updatedAsset] = await db
        .update(assets)
        .set(updateData)
        .where(eq(assets.id, id))
        .returning();

      console.log("Activo actualizado exitosamente:", updatedAsset.id);
      res.json(updatedAsset);
    } catch (error) {
      console.error("Error detallado al actualizar activo:", error);
      res.status(500).json({ message: "Error al actualizar activo", details: error.message });
    }
  });

  // Delete asset with cascading delete
  apiRouter.delete("/assets/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      console.log(`Intentando eliminar activo con ID: ${id}`);

      // Check if asset exists
      const [existingAsset] = await db.select().from(assets).where(eq(assets.id, id));
      if (!existingAsset) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }

      console.log(`Activo encontrado, procediendo con eliminación: ${existingAsset.name}`);

      // Use transaction for cascading delete
      await db.transaction(async (tx) => {
        // Delete related maintenance records first
        const deletedMaintenances = await tx.delete(assetMaintenances).where(eq(assetMaintenances.assetId, id));
        console.log(`Registros de mantenimiento eliminados: ${deletedMaintenances.rowCount || 0}`);
        
        // Delete from asset_history table if it exists
        try {
          await pool.query("DELETE FROM asset_history WHERE asset_id = $1", [id]);
          console.log("Registros de historial eliminados");
        } catch (historyError) {
          console.log("Tabla asset_history no existe o no hay registros");
        }

        // Delete from asset_assignments table if it exists
        try {
          await pool.query("DELETE FROM asset_assignments WHERE asset_id = $1", [id]);
          console.log("Asignaciones de activos eliminadas");
        } catch (assignmentsError) {
          console.log("Tabla asset_assignments no existe o no hay registros");
        }
        
        // Delete the asset itself
        const deletedAsset = await tx.delete(assets).where(eq(assets.id, id));
        console.log(`Activo eliminado: ${deletedAsset.rowCount || 0} registros`);
      });

      console.log("Eliminación completada exitosamente");
      res.json({ message: "Activo eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar activo:", error);
      res.status(500).json({ message: "Error al eliminar activo" });
    }
  });

  // Get asset maintenances
  apiRouter.get("/assets/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      
      if (isNaN(assetId)) {
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      // Use direct SQL query to avoid schema mismatches
      const result = await pool.query(`
        SELECT id, asset_id, maintenance_type, performed_by, performer_id, 
               date, cost, description, findings, actions, next_maintenance_date, 
               photos, status, created_at, updated_at
        FROM asset_maintenances 
        WHERE asset_id = $1 
        ORDER BY date DESC
      `, [assetId]);

      res.json(result.rows || []);
    } catch (error) {
      console.error("Error al obtener mantenimientos:", error);
      res.status(500).json({ message: "Error al obtener mantenimientos del activo" });
    }
  });

  // Create new maintenance record
  apiRouter.post("/assets/:id/maintenances", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      
      if (isNaN(assetId)) {
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      const maintenanceData = {
        assetId,
        maintenanceType: req.body.maintenanceType,
        description: req.body.description,
        date: req.body.date,
        cost: req.body.cost || null,
        performedBy: req.body.performedBy || null,
        nextMaintenanceDate: req.body.nextMaintenanceDate || null,
        status: req.body.status || 'scheduled'
      };

      const [newMaintenance] = await db
        .insert(assetMaintenances)
        .values(maintenanceData)
        .returning();

      res.status(201).json(newMaintenance);
    } catch (error) {
      console.error("Error al registrar mantenimiento:", error);
      res.status(500).json({ message: "Error al registrar mantenimiento" });
    }
  });

  // Update maintenance record
  apiRouter.put("/asset-maintenances/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de mantenimiento inválido" });
      }

      const updateData = {
        maintenanceType: req.body.maintenanceType,
        description: req.body.description,
        date: req.body.date,
        status: req.body.status || 'scheduled',
        cost: req.body.cost || null,
        performedBy: req.body.performedBy || null,
        notes: req.body.notes || null,
      };

      const [updatedMaintenance] = await db
        .update(assetMaintenances)
        .set(updateData)
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();

      if (!updatedMaintenance) {
        return res.status(404).json({ message: "Mantenimiento no encontrado" });
      }

      res.json(updatedMaintenance);
    } catch (error) {
      console.error("Error al actualizar mantenimiento:", error);
      res.status(500).json({ message: "Error al actualizar mantenimiento" });
    }
  });

  // Delete maintenance record
  apiRouter.delete("/asset-maintenances/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de mantenimiento inválido" });
      }

      const [deletedMaintenance] = await db
        .delete(assetMaintenances)
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();

      if (!deletedMaintenance) {
        return res.status(404).json({ message: "Mantenimiento no encontrado" });
      }

      res.json({ message: "Mantenimiento eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar mantenimiento:", error);
      res.status(500).json({ message: "Error al eliminar mantenimiento" });
    }
  });

  // Get asset history (simplified version)
  apiRouter.get("/assets/:id/history", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      
      if (isNaN(assetId)) {
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      // Return empty array if history table doesn't exist
      try {
        const historyResult = await pool.query("SELECT * FROM asset_history WHERE asset_id = $1 ORDER BY created_at DESC", [assetId]);
        res.json(historyResult.rows || []);
      } catch (error) {
        console.log("Tabla asset_history no existe, devolviendo array vacío");
        res.json([]);
      }
    } catch (error) {
      console.error("Error al obtener historial:", error);
      res.status(500).json({ message: "Error al obtener historial del activo" });
    }
  });

  // Get assets by park
  apiRouter.get("/parks/:id/assets", async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.id);
      
      if (isNaN(parkId)) {
        return res.status(400).json({ message: "ID de parque inválido" });
      }

      const parkAssets = await db
        .select()
        .from(assets)
        .where(eq(assets.parkId, parkId));

      res.json(parkAssets);
    } catch (error) {
      console.error("Error al obtener activos del parque:", error);
      res.status(500).json({ message: "Error al obtener activos del parque" });
    }
  });

  // Get asset statistics
  apiRouter.get("/assets-stats", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(assets);
      
      const total = totalResult[0]?.count || 0;

      // Get count by status
      const statusResult = await db
        .select({
          status: assets.status,
          count: sql<number>`COUNT(*)`
        })
        .from(assets)
        .groupBy(assets.status);

      // Get count by condition
      const conditionResult = await db
        .select({
          condition: assets.condition,
          count: sql<number>`COUNT(*)`
        })
        .from(assets)
        .groupBy(assets.condition);

      // Get total value and value by category
      const totalValueResult = await db
        .select({
          totalValue: sql<number>`COALESCE(SUM(CAST(acquisition_cost AS DECIMAL)), 0)`
        })
        .from(assets);

      const categoryValueResult = await db
        .select({
          categoryName: assetCategories.name,
          totalValue: sql<number>`COALESCE(SUM(CAST(${assets.acquisitionCost} AS DECIMAL)), 0)`
        })
        .from(assets)
        .leftJoin(assetCategories, eq(assets.categoryId, assetCategories.id))
        .groupBy(assetCategories.name);

      const stats = {
        total,
        totalValue: Number(totalValueResult[0]?.totalValue || 0),
        byStatus: statusResult.reduce((acc, item) => {
          acc[item.status] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        byCondition: conditionResult.reduce((acc, item) => {
          acc[item.condition] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        categoryValues: categoryValueResult.map(item => ({
          category: item.categoryName || 'Sin categoría',
          totalValue: Number(item.totalValue || 0)
        }))
      };

      res.json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de activos" });
    }
  });
}