import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { insertAssetCategorySchema, insertAssetSchema, insertAssetMaintenanceSchema } from "@shared/asset-schema";
import { isAuthenticated } from "./replitAuth";

export function registerAssetRoutes(app: any, apiRouter: Router) {
  // Rutas para categorías de activos
  apiRouter.get("/asset-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAssetCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de activos:", error);
      res.status(500).json({ message: "Error al obtener categorías de activos" });
    }
  });

  apiRouter.get("/asset-categories/:id", async (req: Request, res: Response) => {
    try {
      const category = await storage.getAssetCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      res.json(category);
    } catch (error) {
      console.error(`Error al obtener categoría de activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener categoría de activo" });
    }
  });

  apiRouter.post("/asset-categories", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parsedCategory = insertAssetCategorySchema.safeParse(req.body);
      if (!parsedCategory.success) {
        return res.status(400).json({ message: "Datos de categoría inválidos", errors: parsedCategory.error.format() });
      }
      
      const category = await storage.createAssetCategory(parsedCategory.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error al crear categoría de activo:", error);
      res.status(500).json({ message: "Error al crear categoría de activo" });
    }
  });

  apiRouter.put("/asset-categories/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const existingCategory = await storage.getAssetCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      const parsedCategory = insertAssetCategorySchema.partial().safeParse(req.body);
      if (!parsedCategory.success) {
        return res.status(400).json({ message: "Datos de categoría inválidos", errors: parsedCategory.error.format() });
      }
      
      const updatedCategory = await storage.updateAssetCategory(id, parsedCategory.data);
      res.json(updatedCategory);
    } catch (error) {
      console.error(`Error al actualizar categoría de activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar categoría de activo" });
    }
  });

  apiRouter.delete("/asset-categories/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const existingCategory = await storage.getAssetCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      // Verificar si hay activos que usan esta categoría
      const categoryAssets = await storage.getCategoryAssets(id);
      if (categoryAssets.length > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar la categoría porque hay activos asociados a ella",
          assetCount: categoryAssets.length 
        });
      }
      
      const deleted = await storage.deleteAssetCategory(id);
      if (deleted) {
        res.json({ message: "Categoría eliminada correctamente" });
      } else {
        res.status(500).json({ message: "Error al eliminar la categoría" });
      }
    } catch (error) {
      console.error(`Error al eliminar categoría de activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al eliminar categoría de activo" });
    }
  });

  // Rutas para activos
  apiRouter.get("/assets", async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      
      if (req.query.parkId) {
        filters.parkId = parseInt(req.query.parkId as string);
      }
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      if (req.query.condition) {
        filters.condition = req.query.condition as string;
      }
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      if (req.query.maintenanceDue === 'true') {
        filters.maintenanceDue = true;
      }
      
      const assets = await storage.getAssets(filters);
      res.json(assets);
    } catch (error) {
      console.error("Error al obtener activos:", error);
      res.status(500).json({ message: "Error al obtener activos" });
    }
  });

  apiRouter.get("/assets/:id", async (req: Request, res: Response) => {
    try {
      const asset = await storage.getAsset(parseInt(req.params.id));
      if (!asset) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      res.json(asset);
    } catch (error) {
      console.error(`Error al obtener activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener activo" });
    }
  });

  apiRouter.post("/assets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parsedAsset = insertAssetSchema.safeParse(req.body);
      if (!parsedAsset.success) {
        return res.status(400).json({ message: "Datos de activo inválidos", errors: parsedAsset.error.format() });
      }
      
      // Verificar que exista el parque
      const park = await storage.getPark(parsedAsset.data.parkId);
      if (!park) {
        return res.status(400).json({ message: "El parque especificado no existe" });
      }
      
      // Verificar que exista la categoría
      const category = await storage.getAssetCategory(parsedAsset.data.categoryId);
      if (!category) {
        return res.status(400).json({ message: "La categoría especificada no existe" });
      }
      
      const asset = await storage.createAsset(parsedAsset.data);
      
      // Crear entrada en el historial
      await storage.createAssetHistoryEntry({
        assetId: asset.id,
        changeType: "acquisition",
        date: new Date(),
        description: "Activo registrado en el sistema",
        changedBy: (req.user as any)?.id || 1, // ID del usuario o admin por defecto
        previousValue: null,
        newValue: null,
        notes: "Registro inicial del activo"
      });
      
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error al crear activo:", error);
      res.status(500).json({ message: "Error al crear activo" });
    }
  });

  apiRouter.put("/assets/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const existingAsset = await storage.getAsset(id);
      if (!existingAsset) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      
      const parsedAsset = insertAssetSchema.partial().safeParse(req.body);
      if (!parsedAsset.success) {
        return res.status(400).json({ message: "Datos de activo inválidos", errors: parsedAsset.error.format() });
      }
      
      // Si cambia la categoría, verificar que exista
      if (parsedAsset.data.categoryId && parsedAsset.data.categoryId !== existingAsset.categoryId) {
        const category = await storage.getAssetCategory(parsedAsset.data.categoryId);
        if (!category) {
          return res.status(400).json({ message: "La categoría especificada no existe" });
        }
      }
      
      // Si cambia el parque, verificar que exista
      if (parsedAsset.data.parkId && parsedAsset.data.parkId !== existingAsset.parkId) {
        const park = await storage.getPark(parsedAsset.data.parkId);
        if (!park) {
          return res.status(400).json({ message: "El parque especificado no existe" });
        }
      }
      
      // Crear una copia del activo actual para el historial
      const previousAsset = { ...existingAsset };
      
      const updatedAsset = await storage.updateAsset(id, parsedAsset.data);
      
      // Crear entrada en el historial
      await storage.createAssetHistoryEntry({
        assetId: id,
        changeType: "update",
        date: new Date(),
        description: "Actualización de información del activo",
        changedBy: (req.user as any)?.id || 1, // ID del usuario o admin por defecto
        previousValue: previousAsset,
        newValue: updatedAsset || null,
        notes: req.body.historyNotes || "Actualización de datos"
      });
      
      res.json(updatedAsset);
    } catch (error) {
      console.error(`Error al actualizar activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar activo" });
    }
  });

  apiRouter.delete("/assets/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const existingAsset = await storage.getAsset(id);
      if (!existingAsset) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      
      const deleted = await storage.deleteAsset(id);
      if (deleted) {
        // Crear entrada en el historial
        await storage.createAssetHistoryEntry({
          assetId: id,
          changeType: "retirement",
          date: new Date(),
          description: "Baja del activo en el sistema",
          changedBy: (req.user as any)?.id || 1, // ID del usuario o admin por defecto
          previousValue: existingAsset,
          newValue: null,
          notes: req.body.historyNotes || "Eliminación del activo"
        });
        
        res.json({ message: "Activo eliminado correctamente" });
      } else {
        res.status(500).json({ message: "Error al eliminar el activo" });
      }
    } catch (error) {
      console.error(`Error al eliminar activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al eliminar activo" });
    }
  });

  // Rutas para mantenimientos de activos
  apiRouter.get("/assets/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      const asset = await storage.getAsset(assetId);
      if (!asset) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      
      const maintenances = await storage.getAssetMaintenances(assetId);
      res.json(maintenances);
    } catch (error) {
      console.error(`Error al obtener mantenimientos del activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener mantenimientos del activo" });
    }
  });

  apiRouter.post("/assets/:id/maintenances", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      const asset = await storage.getAsset(assetId);
      if (!asset) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      
      const parsedMaintenance = insertAssetMaintenanceSchema.safeParse({
        ...req.body,
        assetId
      });
      
      if (!parsedMaintenance.success) {
        return res.status(400).json({ message: "Datos de mantenimiento inválidos", errors: parsedMaintenance.error.format() });
      }
      
      const maintenance = await storage.createAssetMaintenance(parsedMaintenance.data);
      
      // Actualizar fecha del último mantenimiento y próximo mantenimiento en el activo
      await storage.updateAsset(assetId, {
        lastMaintenanceDate: new Date(parsedMaintenance.data.date),
        nextMaintenanceDate: parsedMaintenance.data.nextMaintenanceDate || null
      });
      
      // Crear entrada en el historial
      await storage.createAssetHistoryEntry({
        assetId,
        changeType: "maintenance",
        date: new Date(),
        description: `Mantenimiento ${parsedMaintenance.data.maintenanceType}`,
        changedBy: (req.user as any)?.id || 1, // ID del usuario o admin por defecto
        previousValue: null,
        newValue: maintenance,
        notes: parsedMaintenance.data.description
      });
      
      res.status(201).json(maintenance);
    } catch (error) {
      console.error(`Error al crear mantenimiento para el activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al crear mantenimiento" });
    }
  });

  // Rutas para historial de activos
  apiRouter.get("/assets/:id/history", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      const asset = await storage.getAsset(assetId);
      if (!asset) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      
      const history = await storage.getAssetHistory(assetId);
      res.json(history);
    } catch (error) {
      console.error(`Error al obtener historial del activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener historial del activo" });
    }
  });

  // Rutas para estadísticas de activos
  apiRouter.get("/assets-stats", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const [byStatus, byCondition, totalValue, byCategory, needMaintenance] = await Promise.all([
        storage.getAssetsByStatus(),
        storage.getAssetsByCondition(),
        storage.getTotalAssetsValue(),
        storage.getAssetsByCategory(),
        storage.getAssetsRequiringMaintenance()
      ]);
      
      res.json({
        byStatus,
        byCondition,
        totalValue,
        byCategory,
        needMaintenance: needMaintenance.length,
        needMaintenanceList: needMaintenance
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de activos:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de activos" });
    }
  });

  // Rutas para obtener activos de un parque específico
  apiRouter.get("/parks/:id/assets", async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.id);
      const park = await storage.getPark(parkId);
      if (!park) {
        return res.status(404).json({ message: "Parque no encontrado" });
      }
      
      const assets = await storage.getParkAssets(parkId);
      res.json(assets);
    } catch (error) {
      console.error(`Error al obtener activos del parque ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener activos del parque" });
    }
  });
}