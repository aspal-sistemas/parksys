import { Request, Response, Router, NextFunction } from 'express';
import { db, pool } from './db';
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
  console.log('🌳 Registrando rutas de inventario de árboles - RUTAS ESPECÍFICAS PRIMERO');
  
  // RUTAS ESPECÍFICAS PRIMERO - antes que rutas con parámetros
  // GET: Listar árboles con paginación y filtros (ruta principal para inventario)
  apiRouter.get('/trees', async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Función para corregir encoding UTF-8 
      const fixEncoding = (text: string): string => {
        // Corregir problemas comunes de encoding UTF-8
        return text
          .replace(/Ã¡/g, 'á')
          .replace(/Ã©/g, 'é')
          .replace(/Ã­/g, 'í')
          .replace(/Ã³/g, 'ó')
          .replace(/Ãº/g, 'ú')
          .replace(/Ã±/g, 'ñ')
          .replace(/Ã /g, 'à')
          .replace(/Ã¨/g, 'è')
          .replace(/Ã¬/g, 'ì')
          .replace(/Ã²/g, 'ò')
          .replace(/Ã¹/g, 'ù');
      };

      // Filtros
      const parkId = req.query.parkId && req.query.parkId !== 'all' ? Number(req.query.parkId) : undefined;
      const speciesId = req.query.speciesId && req.query.speciesId !== 'all' ? Number(req.query.speciesId) : undefined;
      const healthStatus = req.query.healthStatus && req.query.healthStatus !== 'all' ? String(req.query.healthStatus) : undefined;
      const searchTerm = req.query.search ? fixEncoding(String(req.query.search)) : undefined;
      
      // Usar SQL directo para evitar problemas de esquema inconsistente
      
      // Contar el total de registros para la paginación (incluyendo búsqueda en especies)
      const countQuery = `
        SELECT COUNT(*) as count
        FROM trees t
        LEFT JOIN tree_species ts ON t.species_id = ts.id
        WHERE 1=1
        ${parkId ? `AND t.park_id = ${parkId}` : ''}
        ${speciesId ? `AND t.species_id = ${speciesId}` : ''}
        ${healthStatus ? `AND t.health_status = '${healthStatus}'` : ''}
        ${searchTerm ? `AND (t.location_description ILIKE '%${searchTerm}%' OR t.notes ILIKE '%${searchTerm}%' OR ts.common_name ILIKE '%${searchTerm}%' OR ts.scientific_name ILIKE '%${searchTerm}%' OR t.code ILIKE '%${searchTerm}%')` : ''}
      `;
      
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Usar SQL directo para evitar problemas de esquema
      const query = `
        SELECT 
          t.id,
          t.code,
          t.species_id as "speciesId",
          ts.common_name as "speciesName",
          ts.scientific_name as "scientificName",
          t.park_id as "parkId",
          p.name as "parkName",
          t.latitude,
          t.longitude,
          t.planting_date as "plantingDate",
          t.development_stage as "developmentStage",
          t.age_estimate as "ageEstimate",
          t.height,
          t.trunk_diameter as "diameter",
          t.canopy_coverage as "canopyCoverage",
          t.health_status as "healthStatus",
          t.last_maintenance_date as "lastInspectionDate",
          t.image_url as "imageUrl"
        FROM trees t
        LEFT JOIN tree_species ts ON t.species_id = ts.id
        LEFT JOIN parks p ON t.park_id = p.id
        WHERE 1=1
        ${parkId ? `AND t.park_id = ${parkId}` : ''}
        ${speciesId ? `AND t.species_id = ${speciesId}` : ''}
        ${healthStatus ? `AND t.health_status = '${healthStatus}'` : ''}
        ${searchTerm ? `AND (t.location_description ILIKE '%${searchTerm}%' OR t.notes ILIKE '%${searchTerm}%' OR ts.common_name ILIKE '%${searchTerm}%' OR ts.scientific_name ILIKE '%${searchTerm}%' OR t.code ILIKE '%${searchTerm}%')` : ''}
        ORDER BY t.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const treesResult = await pool.query(query);
      const treesList = treesResult.rows;
      
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

  // GET: Listar árboles con paginación y filtros (ruta alternativa para compatibilidad)
  apiRouter.get('/trees/inventory', async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Función para corregir encoding UTF-8 
      const fixEncoding = (text: string): string => {
        // Corregir problemas comunes de encoding UTF-8
        return text
          .replace(/Ã¡/g, 'á')
          .replace(/Ã©/g, 'é')
          .replace(/Ã­/g, 'í')
          .replace(/Ã³/g, 'ó')
          .replace(/Ãº/g, 'ú')
          .replace(/Ã±/g, 'ñ')
          .replace(/Ã /g, 'à')
          .replace(/Ã¨/g, 'è')
          .replace(/Ã¬/g, 'ì')
          .replace(/Ã²/g, 'ò')
          .replace(/Ã¹/g, 'ù');
      };

      // Filtros
      const parkId = req.query.parkId && req.query.parkId !== 'all' ? Number(req.query.parkId) : undefined;
      const speciesId = req.query.speciesId && req.query.speciesId !== 'all' ? Number(req.query.speciesId) : undefined;
      const healthStatus = req.query.healthStatus && req.query.healthStatus !== 'all' ? String(req.query.healthStatus) : undefined;
      const searchTerm = req.query.search ? fixEncoding(String(req.query.search)) : undefined;
      
      // Usar SQL directo para evitar problemas de esquema inconsistente
      
      // Contar el total de registros para la paginación (incluyendo búsqueda en especies)
      const countQuery = `
        SELECT COUNT(*) as count
        FROM trees t
        LEFT JOIN tree_species ts ON t.species_id = ts.id
        WHERE 1=1
        ${parkId ? `AND t.park_id = ${parkId}` : ''}
        ${speciesId ? `AND t.species_id = ${speciesId}` : ''}
        ${healthStatus ? `AND t.health_status = '${healthStatus}'` : ''}
        ${searchTerm ? `AND (t.location_description ILIKE '%${searchTerm}%' OR t.notes ILIKE '%${searchTerm}%' OR ts.common_name ILIKE '%${searchTerm}%' OR ts.scientific_name ILIKE '%${searchTerm}%' OR t.code ILIKE '%${searchTerm}%')` : ''}
      `;
      
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Usar SQL directo para evitar problemas de esquema
      const query = `
        SELECT 
          t.id,
          t.code,
          t.species_id as "speciesId",
          ts.common_name as "speciesName",
          ts.scientific_name as "scientificName",
          t.park_id as "parkId",
          p.name as "parkName",
          t.latitude,
          t.longitude,
          t.planting_date as "plantingDate",
          t.development_stage as "developmentStage",
          t.age_estimate as "ageEstimate",
          t.height,
          t.trunk_diameter as "diameter",
          t.canopy_coverage as "canopyCoverage",
          t.health_status as "healthStatus",
          t.last_maintenance_date as "lastInspectionDate",
          t.image_url as "imageUrl"
        FROM trees t
        LEFT JOIN tree_species ts ON t.species_id = ts.id
        LEFT JOIN parks p ON t.park_id = p.id
        WHERE 1=1
        ${parkId ? `AND t.park_id = ${parkId}` : ''}
        ${speciesId ? `AND t.species_id = ${speciesId}` : ''}
        ${healthStatus ? `AND t.health_status = '${healthStatus}'` : ''}
        ${searchTerm ? `AND (t.location_description ILIKE '%${searchTerm}%' OR t.notes ILIKE '%${searchTerm}%' OR ts.common_name ILIKE '%${searchTerm}%' OR ts.scientific_name ILIKE '%${searchTerm}%' OR t.code ILIKE '%${searchTerm}%')` : ''}
        ORDER BY t.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const treesResult = await pool.query(query);
      const treesList = treesResult.rows;
      
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
      
      // Consulta directa con pool para evitar problemas de Drizzle
      const result = await pool.query('SELECT * FROM trees WHERE id = $1 LIMIT 1', [treeId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Árbol no encontrado' });
      }
      
      const tree = result.rows[0];
      
      // Usar el código real almacenado en la base de datos
      const code = tree.code;
      
      // Obtener información de la especie
      let speciesInfo = null;
      try {
        const speciesResult = await pool.query('SELECT * FROM tree_species WHERE id = $1', [tree.species_id]);
        speciesInfo = speciesResult.rows[0] || null;
      } catch (error) {
        console.log('Error al obtener especie:', error);
      }
      
      // Obtener información del parque
      let parkInfo = null;
      try {
        const parkResult = await pool.query('SELECT * FROM parks WHERE id = $1', [tree.park_id]);
        parkInfo = parkResult.rows[0] || null;
      } catch (error) {
        console.log('Error al obtener parque:', error);
      }
      
      res.json({ 
        data: {
          id: tree.id,
          code: code,
          speciesId: tree.species_id,
          speciesName: speciesInfo?.common_name || 'Especie no encontrada',
          scientificName: speciesInfo?.scientific_name || '',
          parkId: tree.park_id,
          parkName: parkInfo?.name || 'Parque no encontrado',
          latitude: tree.latitude,
          longitude: tree.longitude,
          plantingDate: tree.planting_date,
          developmentStage: tree.development_stage,
          ageEstimate: tree.age_estimate,
          height: tree.height,
          diameter: tree.trunk_diameter,
          canopyCoverage: tree.canopy_coverage,
          healthStatus: tree.health_status,
          condition: tree.condition,
          hasHollows: tree.has_hollows,
          hasExposedRoots: tree.has_exposed_roots,
          hasPests: tree.has_pests,
          isProtected: tree.is_protected,
          imageUrl: tree.image_url,
          locationDescription: tree.location_description,
          notes: tree.notes,
          createdAt: tree.created_at,
          updatedAt: tree.updated_at,
          lastMaintenanceDate: tree.last_maintenance_date,
          // Agregar campos de foto de la especie
          speciesPhotoUrl: speciesInfo?.photo_url,
          speciesImageUrl: speciesInfo?.image_url,
          speciesCustomIconUrl: speciesInfo?.custom_icon_url,
          speciesDescription: speciesInfo?.description,
          speciesEcologicalBenefits: speciesInfo?.ecological_benefits,
          maintenances: [] // Temporalmente vacío
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
  apiRouter.put('/trees/:id', (req: Request, res: Response, next: NextFunction) => {
    console.log('🌳 PUT /trees/:id - ANTES DE AUTENTICACIÓN');
    console.log('🌳 URL:', req.url);
    console.log('🌳 Method:', req.method);
    next();
  }, isAuthenticated, async (req: Request, res: Response) => {
    console.log('🌳 PUT /trees/:id - DESPUÉS DE AUTENTICACIÓN');
    console.log('🌳 Tree ID:', req.params.id);
    console.log('🌳 Request body:', req.body);
    
    try {
      const treeId = Number(req.params.id);
      
      console.log('Datos recibidos en el backend:', req.body);
      
      // Verificar que el árbol exista
      const [treeExists] = await db
        .select({ id: trees.id })
        .from(trees)
        .where(eq(trees.id, treeId));
      
      if (!treeExists) {
        return res.status(404).json({ message: 'Árbol no encontrado' });
      }
      
      const {
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
      
      console.log('🌳 Campos extraídos:');
      console.log('🌳 speciesId:', speciesId, typeof speciesId);
      console.log('🌳 parkId:', parkId, typeof parkId);
      console.log('🌳 latitude:', latitude, typeof latitude);
      console.log('🌳 longitude:', longitude, typeof longitude);
      
      // Verificar campos requeridos (convertir a string para verificar)
      const speciesIdValid = speciesId !== null && speciesId !== undefined && speciesId !== '';
      const parkIdValid = parkId !== null && parkId !== undefined && parkId !== '';
      const latitudeValid = latitude !== null && latitude !== undefined && latitude !== '';
      const longitudeValid = longitude !== null && longitude !== undefined && longitude !== '';
      
      console.log('🌳 Validación de campos:');
      console.log('🌳 speciesId válido:', speciesIdValid, '| valor:', speciesId);
      console.log('🌳 parkId válido:', parkIdValid, '| valor:', parkId);
      console.log('🌳 latitude válido:', latitudeValid, '| valor:', latitude);
      console.log('🌳 longitude válido:', longitudeValid, '| valor:', longitude);
      
      if (!speciesIdValid || !parkIdValid || !latitudeValid || !longitudeValid) {
        console.log('🌳 ERROR - Campos faltantes detectados');
        return res.status(400).json({ 
          message: 'Los campos especie, parque, latitud y longitud son obligatorios' 
        });
      }
      
      // console.log('🌳 Validación exitosa, procediendo con la actualización...');
      
      // Preparar datos para la actualización
      const updateData = {
        species_id: speciesId,
        park_id: parkId,
        latitude,
        longitude,
        planting_date: plantingDate || null,
        condition: physicalCondition || null,
        development_stage: developmentStage || null,
        age_estimate: ageEstimate || null,
        height: height || null,
        trunk_diameter: diameter || null,
        canopy_coverage: canopyCoverage || null,
        health_status: healthStatus || 'Bueno',
        has_hollows: hasHollows || false,
        has_exposed_roots: hasExposedRoots || false,
        has_pests: hasPests || false,
        is_protected: isProtected || false,
        image_url: imageUrl || null,
        notes: observations || null,
        location_description: locationDescription || null,
        updated_at: new Date(),
      };
      
      // console.log('🌳 Datos preparados para actualización:', updateData);
      
      // Actualizar el árbol - mapear camelCase a snake_case para la base de datos
      console.log('🌳 Ejecutando query de actualización...');
      const [updatedTree] = await db.update(trees)
        .set(updateData)
        .where(eq(trees.id, treeId))
        .returning();
      
      console.log('🌳 Árbol actualizado exitosamente:', updatedTree);
      
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