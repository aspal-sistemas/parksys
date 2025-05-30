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
      // Mejorar la validación del ID
      const assetId = parseInt(req.params.id);
      if (isNaN(assetId)) {
        console.error(`ID de activo inválido: ${req.params.id}`);
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      console.log(`Intentando obtener activo con ID: ${assetId}`);
      
      // Importar la conexión a la BD desde el módulo db.ts
      const { pool } = await import('./db');
      
      // Usar una consulta SQL directa para evitar problemas
      const result = await pool.query("SELECT * FROM assets WHERE id = $1", [assetId]);
      
      if (result.rows && result.rows.length > 0) {
        const asset = result.rows[0];
        console.log(`Activo encontrado: ${asset.name}`);
        
        // Consultar información adicional (categoría y parque)
        let categoryData = { name: 'Sin categoría', icon: 'box', color: '#666666' };
        if (asset.category_id) {
          const categoryResult = await pool.query(
            "SELECT name, icon, color FROM asset_categories WHERE id = $1", 
            [asset.category_id]
          );
          if (categoryResult.rows && categoryResult.rows.length > 0) {
            categoryData = categoryResult.rows[0];
          }
        }
        
        let parkName = 'Sin asignar';
        if (asset.park_id) {
          const parkResult = await pool.query(
            "SELECT name FROM parks WHERE id = $1", 
            [asset.park_id]
          );
          if (parkResult.rows && parkResult.rows.length > 0) {
            parkName = parkResult.rows[0].name;
          }
        }
        
        // Transformar a formato para el frontend
        const transformedAsset = {
          id: asset.id,
          name: asset.name,
          description: asset.description,
          serialNumber: asset.serial_number,
          categoryId: asset.category_id,
          parkId: asset.park_id,
          locationDescription: asset.location_description,
          latitude: asset.latitude,
          longitude: asset.longitude,
          acquisitionDate: asset.acquisition_date,
          acquisitionCost: asset.acquisition_cost,
          currentValue: asset.current_value,
          manufacturer: asset.manufacturer,
          model: asset.model,
          status: asset.status,
          condition: asset.condition,
          maintenanceFrequency: asset.maintenance_frequency,
          lastMaintenanceDate: asset.last_maintenance_date,
          nextMaintenanceDate: asset.next_maintenance_date,
          expectedLifespan: asset.expected_lifespan,
          notes: asset.notes,
          qrCode: asset.qr_code,
          responsiblePersonId: asset.responsible_person_id,
          createdAt: asset.created_at,
          updatedAt: asset.updated_at,
          photos: asset.photos || [],
          documents: asset.documents || [],
          
          // Datos de categoría
          categoryName: categoryData.name,
          categoryIcon: categoryData.icon,
          categoryColor: categoryData.color,
          categoryIconType: "system",
          categoryCustomIconUrl: null,
          
          // Datos de parque
          parkName: parkName
        };
        
        return res.json(transformedAsset);
      } else {
        console.log(`No se encontró ningún activo con ID: ${assetId}`);
        return res.status(404).json({ message: "Activo no encontrado" });
      }
    } catch (error) {
      console.error(`Error al obtener activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener activo" });
    }
  });

  apiRouter.post("/assets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("Datos recibidos para crear activo:", req.body);
      
      // Validación básica sin usar el schema de Drizzle
      const requiredFields = ['name', 'categoryId', 'parkId', 'status', 'condition'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ message: `El campo ${field} es requerido` });
        }
      }
      
      // Verificar que exista el parque
      const park = await storage.getPark(req.body.parkId);
      if (!park) {
        return res.status(400).json({ message: "El parque especificado no existe" });
      }
      
      // Verificar que exista la categoría
      const category = await storage.getAssetCategory(req.body.categoryId);
      if (!category) {
        return res.status(400).json({ message: "La categoría especificada no existe" });
      }
      
      const asset = await storage.createAsset(req.body);
      console.log("Activo creado exitosamente:", asset);
      
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
      if (isNaN(assetId)) {
        console.error(`ID de activo inválido: ${req.params.id}`);
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      // Importar la conexión a la BD desde el módulo db.ts
      const { pool } = await import('./db');
      
      // Verificar que el activo existe
      const assetResult = await pool.query("SELECT * FROM assets WHERE id = $1", [assetId]);
      if (assetResult.rows.length === 0) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      
      // Consultar los mantenimientos del activo
      const maintenanceResult = await pool.query(
        `SELECT am.*, u.username as performed_by_name 
         FROM asset_maintenances am
         LEFT JOIN users u ON am.performed_by::integer = u.id
         WHERE am.asset_id = $1::integer
         ORDER BY am.date DESC`,
        [assetId]
      );
      
      // Transformar a formato para el frontend
      const maintenances = maintenanceResult.rows.map(m => ({
        id: m.id,
        assetId: m.asset_id,
        date: m.date,
        maintenanceType: m.maintenance_type,
        description: m.description,
        status: m.status || 'completed',
        performedBy: m.performed_by,
        performedByName: m.performed_by_name,
        notes: m.notes,
        estimatedCost: m.estimated_cost,
        actualCost: m.actual_cost,
        nextMaintenanceDate: m.next_maintenance_date,
        photos: m.photos || [],
        documents: m.documents || [],
        createdAt: m.created_at
      }));
      
      res.json(maintenances);
    } catch (error) {
      console.error(`Error al obtener mantenimientos del activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener mantenimientos del activo" });
    }
  });

  apiRouter.post("/assets/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      if (isNaN(assetId)) {
        console.error(`ID de activo inválido: ${req.params.id}`);
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      // Importar la conexión a la BD desde el módulo db.ts
      const { pool } = await import('./db');
      
      // Verificar que el activo existe
      const assetResult = await pool.query("SELECT * FROM assets WHERE id = $1", [assetId]);
      if (assetResult.rows.length === 0) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }

      // Validar los datos de entrada (se podría usar Zod aquí, pero para simplificar usamos validación manual)
      const { 
        date, 
        maintenanceType, 
        description, 
        performedBy,
        notes, 
        nextMaintenanceDate,
        estimatedCost,
        actualCost,
        status,
        photos,
        documents
      } = req.body;

      if (!date || !maintenanceType || !description) {
        return res.status(400).json({ 
          message: "Datos de mantenimiento inválidos", 
          errors: {
            date: !date ? "La fecha es requerida" : null,
            maintenanceType: !maintenanceType ? "El tipo de mantenimiento es requerido" : null,
            description: !description ? "La descripción es requerida" : null
          }
        });
      }

      // Formatear la fecha correctamente para PostgreSQL
      const formattedDate = new Date(date).toISOString();
      const formattedNextDate = nextMaintenanceDate ? new Date(nextMaintenanceDate).toISOString() : null;
      
      // Insertar el nuevo mantenimiento
      const maintenanceResult = await pool.query(
        `INSERT INTO asset_maintenances 
          (asset_id, date, maintenance_type, description, performed_by, 
           next_maintenance_date, cost, status, photos, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *`,
        [
          assetId, 
          formattedDate, 
          maintenanceType, 
          description, 
          performedBy || (req.user as any)?.id || 1,
          formattedNextDate,
          estimatedCost || null,
          status || 'active',
          photos || null
        ]
      );
      
      const maintenance = maintenanceResult.rows[0];
      
      // Actualizar fecha del último mantenimiento y próximo mantenimiento en el activo
      await pool.query(
        `UPDATE assets 
         SET last_maintenance_date = $1, 
             next_maintenance_date = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [formattedDate, formattedNextDate, assetId]
      );
      
      // Crear entrada en el historial
      await pool.query(
        `INSERT INTO asset_history 
          (asset_id, change_type, date, description, changed_by, previous_value, new_value, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          assetId,
          'maintenance',
          new Date().toISOString(),
          `Mantenimiento ${maintenanceType}`,
          (req.user as any)?.id || 1,
          null,
          JSON.stringify(maintenance),
          description
        ]
      );
      
      // Transformar a formato para el frontend
      const transformedMaintenance = {
        id: maintenance.id,
        assetId: maintenance.asset_id,
        date: maintenance.date,
        maintenanceType: maintenance.maintenance_type,
        description: maintenance.description,
        status: maintenance.status || 'completed',
        performedBy: maintenance.performed_by,
        notes: maintenance.notes,
        estimatedCost: maintenance.estimated_cost,
        actualCost: maintenance.actual_cost,
        nextMaintenanceDate: maintenance.next_maintenance_date,
        photos: maintenance.photos || [],
        documents: maintenance.documents || [],
        createdAt: maintenance.created_at
      };
      
      res.status(201).json(transformedMaintenance);
    } catch (error) {
      console.error(`Error al crear mantenimiento para el activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al crear mantenimiento" });
    }
  });

  // Eliminar mantenimiento de activo
  apiRouter.delete("/assets/:assetId/maintenances/:id", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.assetId);
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(assetId) || isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de activo o mantenimiento inválido" });
      }

      // Importar la conexión a la BD desde el módulo db.ts
      const { pool } = await import('./db');
      
      // Verificar que el mantenimiento existe y pertenece al activo
      const maintenanceResult = await pool.query(
        "SELECT * FROM asset_maintenances WHERE id = $1 AND asset_id = $2", 
        [maintenanceId, assetId]
      );
      
      if (maintenanceResult.rows.length === 0) {
        return res.status(404).json({ message: "Mantenimiento no encontrado o no pertenece al activo indicado" });
      }

      // En lugar de eliminar el registro, lo marcamos como inactivo
      await pool.query(
        `UPDATE asset_maintenances 
         SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1 AND asset_id = $2`,
        [maintenanceId, assetId]
      );
      
      // También agregamos una entrada en el historial del activo
      await pool.query(
        `INSERT INTO asset_history 
          (asset_id, date, change_type, description, changed_by)
         VALUES ($1, NOW(), 'maintenance_cancelled', $2, $3)`,
        [
          assetId,
          `Se canceló el mantenimiento #${maintenanceId}`,
          req.body.userId || 1
        ]
      );
      
      res.json({ message: "Mantenimiento cancelado correctamente" });
    } catch (error) {
      console.error(`Error al eliminar mantenimiento:`, error);
      res.status(500).json({ message: "Error al eliminar mantenimiento" });
    }
  });
  
  // Actualizar mantenimiento de activo
  apiRouter.put("/assets/:assetId/maintenances/:id", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.assetId);
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(assetId) || isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de activo o mantenimiento inválido" });
      }

      // Importar la conexión a la BD desde el módulo db.ts
      const { pool } = await import('./db');
      
      // Verificar que el mantenimiento existe y pertenece al activo
      const maintenanceResult = await pool.query(
        "SELECT * FROM asset_maintenances WHERE id = $1 AND asset_id = $2", 
        [maintenanceId, assetId]
      );
      
      if (maintenanceResult.rows.length === 0) {
        return res.status(404).json({ message: "Mantenimiento no encontrado o no pertenece al activo indicado" });
      }

      const { 
        date, 
        maintenanceType, 
        description, 
        performedBy, 
        status,
        nextMaintenanceDate,
        cost,
        photos 
      } = req.body;

      // Formatear las fechas correctamente para PostgreSQL
      const formattedDate = date ? new Date(date).toISOString() : null;
      const formattedNextDate = nextMaintenanceDate ? new Date(nextMaintenanceDate).toISOString() : null;
      
      // Actualizar el mantenimiento
      const updateResult = await pool.query(
        `UPDATE asset_maintenances 
         SET date = COALESCE($1, date),
             maintenance_type = COALESCE($2, maintenance_type),
             description = COALESCE($3, description),
             performed_by = COALESCE($4, performed_by),
             status = COALESCE($5, status),
             next_maintenance_date = COALESCE($6, next_maintenance_date),
             cost = COALESCE($7, cost),
             photos = COALESCE($8, photos),
             updated_at = NOW()
         WHERE id = $9 AND asset_id = $10
         RETURNING *`,
        [
          formattedDate, 
          maintenanceType, 
          description, 
          performedBy,
          status,
          formattedNextDate,
          cost,
          photos ? JSON.stringify(photos) : null,
          maintenanceId,
          assetId
        ]
      );
      
      if (updateResult.rows.length === 0) {
        return res.status(500).json({ message: "Error al actualizar el mantenimiento" });
      }
      
      // Obtener información del usuario que realizó el mantenimiento
      const userResult = await pool.query(
        "SELECT username FROM users WHERE id = $1",
        [updateResult.rows[0].performed_by]
      );
      
      const maintenance = updateResult.rows[0];
      const performedByName = userResult.rows.length > 0 ? userResult.rows[0].username : null;
      
      // Transformar los datos para la respuesta
      const transformedMaintenance = {
        id: maintenance.id,
        assetId: maintenance.asset_id,
        date: maintenance.date,
        maintenanceType: maintenance.maintenance_type,
        description: maintenance.description,
        status: maintenance.status,
        performedBy: maintenance.performed_by,
        performedByName,
        nextMaintenanceDate: maintenance.next_maintenance_date,
        cost: maintenance.cost,
        photos: maintenance.photos || [],
        createdAt: maintenance.created_at,
        updatedAt: maintenance.updated_at
      };
      
      res.json(transformedMaintenance);
    } catch (error) {
      console.error(`Error al actualizar mantenimiento:`, error);
      res.status(500).json({ message: "Error al actualizar mantenimiento" });
    }
  });

  // Rutas para historial de activos
  apiRouter.get("/assets/:id/history", async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.id);
      if (isNaN(assetId)) {
        console.error(`ID de activo inválido: ${req.params.id}`);
        return res.status(400).json({ message: "ID de activo inválido" });
      }

      // Importar la conexión a la BD desde el módulo db.ts
      const { pool } = await import('./db');
      
      // Verificar que el activo existe
      const assetResult = await pool.query("SELECT * FROM assets WHERE id = $1", [assetId]);
      if (assetResult.rows.length === 0) {
        return res.status(404).json({ message: "Activo no encontrado" });
      }
      
      // Consultar el historial del activo
      const historyResult = await pool.query(
        `SELECT ah.*, u.username as changed_by_name 
         FROM asset_history ah
         LEFT JOIN users u ON ah.changed_by::integer = u.id
         WHERE ah.asset_id = $1::integer
         ORDER BY ah.date DESC`,
        [assetId]
      );
      
      // Transformar a formato para el frontend
      const history = historyResult.rows.map(h => ({
        id: h.id,
        assetId: h.asset_id,
        date: h.date,
        changeType: h.change_type,
        description: h.description,
        changedBy: h.changed_by,
        changedByName: h.changed_by_name,
        previousValue: h.previous_value,
        newValue: h.new_value,
        notes: h.notes,
        createdAt: h.created_at
      }));
      
      res.json(history);
    } catch (error) {
      console.error(`Error al obtener historial del activo ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener historial del activo" });
    }
  });

  // Rutas para estadísticas de activos
  apiRouter.get("/assets-stats", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const [
        byStatus, 
        byCondition, 
        totalValue, 
        byCategory, 
        needMaintenance, 
        totalCount,
        activeCount,
        maintenanceCount,
        categoryValues
      ] = await Promise.all([
        storage.getAssetsByStatus(),
        storage.getAssetsByCondition(),
        storage.getTotalAssetsValue(),
        storage.getAssetsByCategory(),
        storage.getAssetsRequiringMaintenance(),
        storage.getAssetTotalCount(),
        storage.getAssetCountByStatus('active'),
        storage.getAssetCountByStatus('maintenance'),
        storage.getCategoryValues()
      ]);
      
      // Convertir el resultado de byStatus a objeto para el dashboard
      const statusDistribution = byStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {} as Record<string, number>);
      
      // Convertir el resultado de byCondition a objeto para el dashboard
      const conditionDistribution = byCondition.reduce((acc, item) => {
        acc[item.condition] = item.count;
        return acc;
      }, {} as Record<string, number>);
      
      // Calcular porcentajes
      const totalAssets = totalCount || 0;
      const activeAssets = activeCount || 0;
      const maintenanceAssets = maintenanceCount || 0;
      
      const activeAssetsPercentage = totalAssets > 0 ? Math.round((activeAssets / totalAssets) * 100) : 0;
      const maintenanceAssetsPercentage = totalAssets > 0 ? Math.round((maintenanceAssets / totalAssets) * 100) : 0;
      
      res.json({
        // Formato antiguo para compatibilidad
        byStatus,
        byCondition,
        totalValue,
        byCategory,
        needMaintenance: needMaintenance.length,
        needMaintenanceList: needMaintenance,
        
        // Nuevo formato para el dashboard
        totalAssets,
        activeAssets,
        activeAssetsPercentage,
        maintenanceAssets,
        maintenanceAssetsPercentage,
        statusDistribution,
        conditionDistribution,
        categoryCounts: byCategory,
        categoryValues
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de activos:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de activos" });
    }
  });
  
  // Ruta para obtener mantenimientos próximos
  apiRouter.get("/assets/maintenance/upcoming", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const upcomingMaintenances = await storage.getUpcomingMaintenances();
      res.json(upcomingMaintenances);
    } catch (error) {
      console.error("Error al obtener mantenimientos próximos:", error);
      res.status(500).json({ message: "Error al obtener mantenimientos próximos" });
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