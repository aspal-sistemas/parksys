import { Request, Response, Router } from "express";
import { db, pool } from "./db";
import { assets, assetCategories, assetMaintenances, parks, parkAmenities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export function registerAssetRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Configurar multer para subida de fotos de mantenimiento
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'maintenance-photos');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `maintenance-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB límite
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif)'));
      }
    }
  });
  // Get all asset categories - COMENTADO PARA EVITAR CONFLICTO CON asset-categories-routes.ts
  // apiRouter.get("/asset-categories", async (_req: Request, res: Response) => {
  //   try {
  //     const categories = await db.select().from(assetCategories);
  //     res.json(categories);
  //   } catch (error) {
  //     console.error("Error al obtener categorías de activos:", error);
  //     res.status(500).json({ message: "Error al obtener categorías de activos" });
  //   }
  // });

  // NOTA: Ruta de categorías por ID movida a asset-categories-routes.ts
  // para evitar conflictos con rutas específicas como /parents

  // Get all assets for inventory with filtering and pagination
  apiRouter.get("/assets/inventory", async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = 'all',
        condition = 'all',
        park = 'all',
        category = 'all'
      } = req.query;

      // Build WHERE conditions
      const conditions = [];
      const queryParams = [];
      let paramIndex = 1;

      if (search && search !== '') {
        conditions.push(`(LOWER(a.name) LIKE LOWER($${paramIndex}) OR LOWER(COALESCE(a.description, '')) LIKE LOWER($${paramIndex + 1}))`);
        queryParams.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
      }

      if (status !== 'all') {
        conditions.push(`a.status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (condition !== 'all') {
        conditions.push(`a.condition = $${paramIndex}`);
        queryParams.push(condition);
        paramIndex++;
      }

      if (park !== 'all') {
        conditions.push(`a.park_id = $${paramIndex}`);
        queryParams.push(parseInt(park as string));
        paramIndex++;
      }

      if (category !== 'all') {
        conditions.push(`a.category_id = $${paramIndex}`);
        queryParams.push(parseInt(category as string));
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count and total value
      const countQuery = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(CAST(a.acquisition_cost AS DECIMAL(10,2))), 0) as total_value
        FROM assets a
        LEFT JOIN asset_categories ac ON a.category_id = ac.id
        LEFT JOIN parks p ON a.park_id = p.id
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, queryParams);
      const totalAssets = parseInt(countResult.rows[0]?.count || '0');
      const totalValue = parseFloat(countResult.rows[0]?.total_value || '0');

      // Get paginated results
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const assetsQuery = `
        SELECT 
          a.id,
          a.name,
          a.description,
          a.serial_number as "serialNumber",
          a.acquisition_date as "acquisitionDate",
          a.acquisition_cost as "acquisitionCost",
          a.park_id as "parkId",
          a.category_id as "categoryId",
          a.status,
          a.condition,
          a.location_description as "locationDescription",
          a.latitude,
          a.longitude,
          a.last_maintenance_date as "lastMaintenanceDate",
          a.next_maintenance_date as "nextMaintenanceDate",
          a.created_at as "createdAt",
          a.updated_at as "updatedAt",
          ac.name as "categoryName",
          p.name as "parkName"
        FROM assets a
        LEFT JOIN asset_categories ac ON a.category_id = ac.id
        LEFT JOIN parks p ON a.park_id = p.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(parseInt(limit as string), offset);
      const assetsResult = await pool.query(assetsQuery, queryParams);

      res.json({
        assets: assetsResult.rows,
        totalAssets,
        totalValue,
        totalPages: Math.ceil(totalAssets / parseInt(limit as string)),
        currentPage: parseInt(page as string),
        itemsPerPage: parseInt(limit as string)
      });
    } catch (error) {
      console.error("Error al obtener inventario de activos:", error);
      res.status(500).json({ message: "Error al obtener inventario de activos" });
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

  // Get asset by ID - DEBE IR DESPUÉS DE RUTAS ESPECÍFICAS
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

      // Prepare update data - only include fields that are actually being sent
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Only update fields that are explicitly provided
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description || null;
      if (req.body.serialNumber !== undefined) updateData.serialNumber = req.body.serialNumber || null;
      if (req.body.categoryId !== undefined) updateData.categoryId = req.body.categoryId;
      if (req.body.parkId !== undefined) updateData.parkId = req.body.parkId;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.condition !== undefined) updateData.condition = req.body.condition;
      if (req.body.location !== undefined) updateData.locationDescription = req.body.location || null;
      if (req.body.acquisitionDate !== undefined) updateData.acquisitionDate = req.body.acquisitionDate || null;
      if (req.body.acquisitionCost !== undefined) updateData.acquisitionCost = req.body.acquisitionCost ? req.body.acquisitionCost.toString() : null;
      if (req.body.currentValue !== undefined) updateData.currentValue = req.body.currentValue ? req.body.currentValue.toString() : null;
      if (req.body.notes !== undefined) updateData.notes = req.body.notes || null;

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

      // Handle latitude and longitude with proper cleanup
      if (req.body.latitude !== undefined) {
        let cleanLat = req.body.latitude.toString().trim().replace(/,+$/, ''); // Remove trailing commas
        updateData.latitude = cleanLat;
        console.log(`Latitud limpiada: "${req.body.latitude}" -> "${cleanLat}"`);
      }

      if (req.body.longitude !== undefined) {
        let cleanLng = req.body.longitude.toString().trim().replace(/^[\s,]+/, ''); // Remove leading spaces and commas
        updateData.longitude = cleanLng;
        console.log(`Longitud limpiada: "${req.body.longitude}" -> "${cleanLng}"`);
      }

      console.log("Datos de actualización preparados:", JSON.stringify(updateData, null, 2));

      console.log("=== INICIANDO ACTUALIZACIÓN EN BASE DE DATOS ===");
      console.log(`Actualizando activo ID: ${id} con:`, updateData);
      
      const [updatedAsset] = await db
        .update(assets)
        .set(updateData)
        .where(eq(assets.id, id))
        .returning();

      console.log("=== ACTUALIZACIÓN COMPLETADA ===");
      console.log("Activo actualizado exitosamente:", updatedAsset.id);
      console.log("Coordenadas actualizadas:", {
        latitude: updatedAsset.latitude,
        longitude: updatedAsset.longitude
      });
      
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

  // COMENTADO - usar maintenance_routes_fixed.ts en su lugar
  // Get asset maintenances
  /*
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
  */

  // COMENTADO - usar maintenance_routes_fixed.ts en su lugar
  // Create new maintenance record
  /*
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
  */

  // Update maintenance record
  apiRouter.put("/asset-maintenances/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log('🔄 Actualizando mantenimiento:', req.params.id);
      console.log('Datos recibidos:', req.body);
      
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de mantenimiento inválido" });
      }

      // Obtener el mantenimiento actual para preservar las fotos
      const [currentMaintenance] = await db
        .select()
        .from(assetMaintenances)
        .where(eq(assetMaintenances.id, maintenanceId));

      if (!currentMaintenance) {
        return res.status(404).json({ message: "Mantenimiento no encontrado" });
      }

      console.log('📋 Mantenimiento actual encontrado, fotos existentes:', currentMaintenance.photos);

      const updateData = {
        maintenanceType: req.body.maintenanceType,
        description: req.body.description,
        date: req.body.date,
        status: req.body.status || 'scheduled',
        cost: req.body.cost || null,
        performedBy: req.body.performedBy || null,
        notes: req.body.notes || null,
        // Preservar las fotos existentes
        photos: currentMaintenance.photos || [],
      };

      console.log('💾 Datos de actualización (preservando fotos):', updateData);

      const [updatedMaintenance] = await db
        .update(assetMaintenances)
        .set(updateData)
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();

      console.log('✅ Mantenimiento actualizado con fotos preservadas:', updatedMaintenance);
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

  // Upload photos for maintenance
  apiRouter.post("/maintenance-photos/:id", isAuthenticated, upload.array('photos', 5), async (req: Request, res: Response) => {
    try {
      console.log('📸 Iniciando subida de fotos para mantenimiento');
      console.log('Request params:', req.params);
      console.log('Files received:', req.files);
      
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(maintenanceId)) {
        console.error('❌ ID de mantenimiento inválido:', req.params.id);
        return res.status(400).json({ message: "ID de mantenimiento inválido" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        console.error('❌ No se recibieron archivos');
        return res.status(400).json({ message: "No se subieron archivos" });
      }

      console.log('✅ Archivos recibidos:', files.length);
      files.forEach((file, index) => {
        console.log(`  Archivo ${index + 1}:`, {
          originalname: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype
        });
      });

      // Generar URLs de las fotos subidas
      const photoUrls = files.map(file => `/uploads/maintenance-photos/${file.filename}`);
      console.log('📂 URLs generadas:', photoUrls);

      // Obtener fotos existentes del mantenimiento
      const [existingMaintenance] = await db
        .select({ photos: assetMaintenances.photos })
        .from(assetMaintenances)
        .where(eq(assetMaintenances.id, maintenanceId));

      if (!existingMaintenance) {
        console.error('❌ Mantenimiento no encontrado:', maintenanceId);
        return res.status(404).json({ message: "Mantenimiento no encontrado" });
      }

      console.log('📋 Mantenimiento encontrado, fotos existentes:', existingMaintenance.photos);

      // Combinar fotos existentes con las nuevas
      const existingPhotos = existingMaintenance.photos || [];
      const allPhotos = [...existingPhotos, ...photoUrls];
      console.log('🔄 Fotos combinadas:', allPhotos);

      // Actualizar el mantenimiento con las nuevas fotos
      const [updatedMaintenance] = await db
        .update(assetMaintenances)
        .set({ photos: allPhotos })
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();

      console.log('✅ Mantenimiento actualizado exitosamente');
      res.json({
        message: 'Fotos subidas exitosamente',
        photos: photoUrls,
        maintenance: updatedMaintenance
      });
    } catch (error) {
      console.error("❌ Error detallado al subir fotos:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
      res.status(500).json({ message: "Error al subir fotos", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get photos for maintenance
  apiRouter.get("/maintenance-photos/:id", async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      
      if (isNaN(maintenanceId)) {
        return res.status(400).json({ message: "ID de mantenimiento inválido" });
      }

      const [maintenance] = await db
        .select({ photos: assetMaintenances.photos })
        .from(assetMaintenances)
        .where(eq(assetMaintenances.id, maintenanceId));

      if (!maintenance) {
        return res.status(404).json({ message: "Mantenimiento no encontrado" });
      }

      res.json({ photos: maintenance.photos || [] });
    } catch (error) {
      console.error("Error al obtener fotos:", error);
      res.status(500).json({ message: "Error al obtener fotos" });
    }
  });

  // Delete photo from maintenance
  apiRouter.delete("/maintenance-photos/:id/:photoIndex", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const maintenanceId = parseInt(req.params.id);
      const photoIndex = parseInt(req.params.photoIndex);
      
      if (isNaN(maintenanceId) || isNaN(photoIndex)) {
        return res.status(400).json({ message: "Parámetros inválidos" });
      }

      // Obtener el mantenimiento actual
      const [maintenance] = await db
        .select({ photos: assetMaintenances.photos })
        .from(assetMaintenances)
        .where(eq(assetMaintenances.id, maintenanceId));

      if (!maintenance) {
        return res.status(404).json({ message: "Mantenimiento no encontrado" });
      }

      const photos = maintenance.photos || [];
      if (photoIndex < 0 || photoIndex >= photos.length) {
        return res.status(400).json({ message: "Índice de foto inválido" });
      }

      // Eliminar archivo físico
      const photoUrl = photos[photoIndex];
      const filePath = path.join(process.cwd(), 'public', photoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Eliminar la foto del array
      const updatedPhotos = photos.filter((_, index) => index !== photoIndex);

      // Actualizar el mantenimiento
      const [updatedMaintenance] = await db
        .update(assetMaintenances)
        .set({ photos: updatedPhotos })
        .where(eq(assetMaintenances.id, maintenanceId))
        .returning();

      res.json({
        message: 'Foto eliminada exitosamente',
        maintenance: updatedMaintenance
      });
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      res.status(500).json({ message: "Error al eliminar foto" });
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

  // Generate sample assets
  apiRouter.post("/assets/generate-sample", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log('🏗️ Iniciando generación de activos de muestra...');
      
      // Import the sample data generator
      const { addSampleAssets } = await import('./add-sample-assets');
      const result = await addSampleAssets();
      
      console.log('✅ Activos de muestra generados exitosamente');
      res.json({ 
        message: "100 activos ficticios creados exitosamente",
        success: true,
        created: result.created
      });
    } catch (error) {
      console.error("❌ Error al generar activos de muestra:", error);
      res.status(500).json({ 
        message: "Error al generar activos de muestra",
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
}