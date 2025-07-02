import { Request, Response, Router } from 'express';
import { db } from './db';
import { trees, treeSpecies, parks, treeMaintenances } from '../shared/schema';
import { eq, like, desc, and, or } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

/**
 * Rutas para el módulo de inventario de árboles
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerTreeInventoryRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // GET: Listar árboles con paginación y filtros
  apiRouter.get('/trees', async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Filtros
      const parkId = req.query.parkId && req.query.parkId !== 'all' ? Number(req.query.parkId) : undefined;
      const speciesId = req.query.speciesId && req.query.speciesId !== 'all' ? Number(req.query.speciesId) : undefined;
      const healthStatus = req.query.healthStatus && req.query.healthStatus !== 'all' ? String(req.query.healthStatus) : undefined;
      const searchTerm = req.query.search ? String(req.query.search) : undefined;
      
      // Construir las condiciones de filtrado
      let conditions = [];
      
      if (parkId) {
        conditions.push(eq(trees.parkId, parkId));
      }
      
      if (speciesId) {
        conditions.push(eq(trees.speciesId, speciesId));
      }
      
      if (healthStatus) {
        conditions.push(eq(trees.healthStatus, healthStatus));
      }
      
      if (searchTerm) {
        conditions.push(
          or(
            like(trees.code, `%${searchTerm}%`),
            like(trees.locationDescription, `%${searchTerm}%`),
            like(trees.observations, `%${searchTerm}%`)
          )
        );
      }
      
      // Solo incluir árboles activos (no removidos)
      conditions.push(eq(trees.isRemoved, false));
      
      // Consulta final
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Contar el total de registros para la paginación
      const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(trees)
        .where(whereClause);
      
      const totalCount = totalCountResult[0].count;
      
      // Obtener los árboles con datos de especie y parque
      const treesList = await db
        .select({
          id: trees.id,
          code: trees.code,
          speciesId: trees.speciesId,
          speciesName: treeSpecies.commonName,
          scientificName: treeSpecies.scientificName,
          parkId: trees.parkId,
          parkName: parks.name,
          latitude: trees.latitude,
          longitude: trees.longitude,
          plantingDate: trees.plantingDate,
          developmentStage: trees.developmentStage,
          ageEstimate: trees.ageEstimate,
          height: trees.height,
          diameter: trees.diameter,
          canopyCoverage: trees.canopyCoverage,
          healthStatus: trees.healthStatus,
          lastInspectionDate: trees.lastInspectionDate,
          imageUrl: trees.imageUrl,
        })
        .from(trees)
        .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
        .leftJoin(parks, eq(trees.parkId, parks.id))
        .where(whereClause)
        .orderBy(desc(trees.updatedAt))
        .limit(limit)
        .offset(offset);
      
      res.json({
        data: treesList,
        page,
        perPage: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      console.error('Error al obtener árboles:', error);
      res.status(500).json({ message: 'Error al obtener el inventario de árboles' });
    }
  });

  // GET: Obtener un árbol específico por ID
  apiRouter.get('/trees/:id', async (req: Request, res: Response) => {
    try {
      const treeId = Number(req.params.id);
      
      const [tree] = await db
        .select({
          id: trees.id,
          code: trees.code,
          speciesId: trees.speciesId,
          speciesName: treeSpecies.commonName,
          scientificName: treeSpecies.scientificName,
          parkId: trees.parkId,
          parkName: parks.name,
          latitude: trees.latitude,
          longitude: trees.longitude,
          plantingDate: trees.plantingDate,
          developmentStage: trees.developmentStage,
          ageEstimate: trees.ageEstimate,
          height: trees.height,
          diameter: trees.diameter,
          canopyCoverage: trees.canopyCoverage,
          healthStatus: trees.healthStatus,
          physicalCondition: trees.physicalCondition,
          hasHollows: trees.hasHollows,
          hasExposedRoots: trees.hasExposedRoots,
          hasPests: trees.hasPests,
          observations: trees.observations,
          lastInspectionDate: trees.lastInspectionDate,
          isProtected: trees.isProtected,
          locationDescription: trees.locationDescription,
          imageUrl: trees.imageUrl,
          createdAt: trees.createdAt,
          updatedAt: trees.updatedAt,
        })
        .from(trees)
        .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
        .leftJoin(parks, eq(trees.parkId, parks.id))
        .where(eq(trees.id, treeId));
      
      if (!tree) {
        return res.status(404).json({ message: 'Árbol no encontrado' });
      }
      
      // Obtener mantenimientos del árbol
      const maintenances = await db
        .select()
        .from(treeMaintenances)
        .where(eq(treeMaintenances.treeId, treeId))
        .orderBy(desc(treeMaintenances.maintenanceDate));
      
      res.json({ 
        data: {
          ...tree,
          maintenances
        }
      });
    } catch (error) {
      console.error('Error al obtener árbol:', error);
      res.status(500).json({ message: 'Error al obtener los detalles del árbol' });
    }
  });

  // POST: Crear un nuevo árbol
  apiRouter.post('/trees', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const {
        code,
        speciesId,
        parkId,
        latitude,
        longitude,
        plantingDate,
        developmentStage,
        ageEstimate,
        height,
        diameter,
        canopyCoverage,
        healthStatus,
        physicalCondition,
        hasHollows,
        hasExposedRoots,
        hasPests,
        observations,
        lastInspectionDate,
        isProtected,
        locationDescription,
        imageUrl,
      } = req.body;
      
      // Verificar campos requeridos
      if (!code || !speciesId || !parkId || !latitude || !longitude) {
        return res.status(400).json({ 
          message: 'Los campos código, especie, parque, latitud y longitud son obligatorios' 
        });
      }
      
      // Verificar que la especie exista
      const [speciesExists] = await db
        .select({ id: treeSpecies.id })
        .from(treeSpecies)
        .where(eq(treeSpecies.id, speciesId));
      
      if (!speciesExists) {
        return res.status(400).json({ message: 'La especie seleccionada no existe' });
      }
      
      // Verificar que el parque exista
      const [parkExists] = await db
        .select({ id: parks.id })
        .from(parks)
        .where(eq(parks.id, parkId));
      
      if (!parkExists) {
        return res.status(400).json({ message: 'El parque seleccionado no existe' });
      }
      
      // Verificar que el código no esté duplicado
      const [codeExists] = await db
        .select({ id: trees.id })
        .from(trees)
        .where(eq(trees.code, code));
      
      if (codeExists) {
        return res.status(400).json({ message: 'Ya existe un árbol con ese código identificador' });
      }
      
      // Crear el nuevo árbol
      const [newTree] = await db.insert(trees).values({
        code,
        speciesId,
        parkId,
        latitude,
        longitude,
        plantingDate: plantingDate || null,
        developmentStage: developmentStage || null,
        ageEstimate: ageEstimate || null,
        height: height || null,
        diameter: diameter || null,
        canopyCoverage: canopyCoverage || null,
        healthStatus: healthStatus || 'Bueno',
        physicalCondition: physicalCondition || null,
        hasHollows: hasHollows || false,
        hasExposedRoots: hasExposedRoots || false,
        hasPests: hasPests || false,
        observations: observations || null,
        lastInspectionDate: lastInspectionDate || null,
        isProtected: isProtected || false,
        locationDescription: locationDescription || null,
        imageUrl: imageUrl || null,
      }).returning();
      
      res.status(201).json(newTree);
    } catch (error) {
      console.error('Error al crear árbol:', error);
      res.status(500).json({ message: 'Error al crear el árbol en el inventario' });
    }
  });

  // PUT: Actualizar un árbol existente
  apiRouter.put('/trees/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const treeId = Number(req.params.id);
      
      // Verificar que el árbol exista
      const [treeExists] = await db
        .select({ id: trees.id })
        .from(trees)
        .where(eq(trees.id, treeId));
      
      if (!treeExists) {
        return res.status(404).json({ message: 'Árbol no encontrado' });
      }
      
      const {
        code,
        speciesId,
        parkId,
        latitude,
        longitude,
        plantingDate,
        developmentStage,
        ageEstimate,
        height,
        diameter,
        canopyCoverage,
        healthStatus,
        physicalCondition,
        hasHollows,
        hasExposedRoots,
        hasPests,
        observations,
        lastInspectionDate,
        isProtected,
        locationDescription,
        imageUrl,
      } = req.body;
      
      // Verificar campos requeridos
      if (!code || !speciesId || !parkId || !latitude || !longitude) {
        return res.status(400).json({ 
          message: 'Los campos código, especie, parque, latitud y longitud son obligatorios' 
        });
      }
      
      // Verificar que el código no esté duplicado (excepto para el mismo árbol)
      const [codeExists] = await db
        .select({ id: trees.id })
        .from(trees)
        .where(and(eq(trees.code, code), sql`${trees.id} != ${treeId}`));
      
      if (codeExists) {
        return res.status(400).json({ message: 'Ya existe otro árbol con ese código identificador' });
      }
      
      // Actualizar el árbol
      const [updatedTree] = await db.update(trees)
        .set({
          code,
          speciesId,
          parkId,
          latitude,
          longitude,
          plantingDate: plantingDate || null,
          developmentStage: developmentStage || null,
          ageEstimate: ageEstimate || null,
          height: height || null,
          diameter: diameter || null,
          canopyCoverage: canopyCoverage || null,
          healthStatus: healthStatus || 'Bueno',
          physicalCondition: physicalCondition || null,
          hasHollows: hasHollows || false,
          hasExposedRoots: hasExposedRoots || false,
          hasPests: hasPests || false,
          observations: observations || null,
          lastInspectionDate: lastInspectionDate || null,
          isProtected: isProtected || false,
          locationDescription: locationDescription || null,
          imageUrl: imageUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(trees.id, treeId))
        .returning();
      
      res.json(updatedTree);
    } catch (error) {
      console.error('Error al actualizar árbol:', error);
      res.status(500).json({ message: 'Error al actualizar el árbol en el inventario' });
    }
  });

  // DELETE (soft): Marcar un árbol como removido
  apiRouter.delete('/trees/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const treeId = Number(req.params.id);
      const { removalReason } = req.body;
      
      // Verificar que el árbol exista
      const [treeExists] = await db
        .select({ id: trees.id })
        .from(trees)
        .where(eq(trees.id, treeId));
      
      if (!treeExists) {
        return res.status(404).json({ message: 'Árbol no encontrado' });
      }
      
      // Marcar como removido (soft delete)
      const [removedTree] = await db.update(trees)
        .set({
          isRemoved: true,
          removalDate: new Date(),
          removalReason: removalReason || 'No especificado',
          updatedAt: new Date(),
        })
        .where(eq(trees.id, treeId))
        .returning();
      
      res.json({ 
        message: 'Árbol marcado como removido correctamente', 
        tree: removedTree 
      });
    } catch (error) {
      console.error('Error al remover árbol:', error);
      res.status(500).json({ message: 'Error al marcar el árbol como removido' });
    }
  });

  // GET: Obtener estadísticas de árboles por parque
  apiRouter.get('/trees/stats/by-park', async (req: Request, res: Response) => {
    try {
      const stats = await db
        .select({
          parkId: parks.id,
          parkName: parks.name,
          count: sql<number>`count(${trees.id})`,
        })
        .from(trees)
        .leftJoin(parks, eq(trees.parkId, parks.id))
        .where(eq(trees.isRemoved, false))
        .groupBy(parks.id, parks.name)
        .orderBy(desc(sql`count(${trees.id})`));
      
      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas de árboles por parque' });
    }
  });

  // GET: Obtener estadísticas de árboles por especie
  apiRouter.get('/trees/stats/by-species', async (req: Request, res: Response) => {
    try {
      const stats = await db
        .select({
          speciesId: treeSpecies.id,
          commonName: treeSpecies.commonName,
          scientificName: treeSpecies.scientificName,
          count: sql<number>`count(${trees.id})`,
        })
        .from(trees)
        .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
        .where(eq(trees.isRemoved, false))
        .groupBy(treeSpecies.id, treeSpecies.commonName, treeSpecies.scientificName)
        .orderBy(desc(sql`count(${trees.id})`));
      
      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas de árboles por especie' });
    }
  });

  // GET: Obtener estadísticas de árboles por estado de salud
  apiRouter.get('/trees/stats/by-health', async (req: Request, res: Response) => {
    try {
      const stats = await db
        .select({
          healthStatus: trees.healthStatus,
          count: sql<number>`count(${trees.id})`,
        })
        .from(trees)
        .where(eq(trees.isRemoved, false))
        .groupBy(trees.healthStatus)
        .orderBy(trees.healthStatus);
      
      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas de árboles por estado de salud' });
    }
  });
}