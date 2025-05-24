/**
 * Rutas para el módulo de Arbolado
 */
import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  treeSpecies, 
  trees, 
  treeMaintenances, 
  parks,
  insertTreeSpeciesSchema,
  insertTreeSchema,
  insertTreeMaintenanceSchema
} from "@shared/schema";
import { eq, desc, and, like, or, gte, lte, isNull } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Registra las rutas relacionadas con el módulo de arbolado
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerTreeRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todas las especies de árboles
  apiRouter.get("/tree-species", async (req: Request, res: Response) => {
    try {
      // Parámetros de paginación y filtrado
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string || "common_name";
      const sortOrder = req.query.sortOrder as string || "asc";
      
      // Construir la consulta base
      let query = db.select().from(treeSpecies);
      
      // Aplicar filtrado por búsqueda si existe
      if (search) {
        query = query.where(
          or(
            like(treeSpecies.commonName, `%${search}%`),
            like(treeSpecies.scientificName, `%${search}%`),
            like(treeSpecies.family, `%${search}%`),
            like(treeSpecies.origin, `%${search}%`)
          )
        );
      }
      
      // Aplicar ordenamiento
      if (sortBy === "common_name") {
        query = sortOrder === "desc" 
          ? query.orderBy(desc(treeSpecies.commonName)) 
          : query.orderBy(treeSpecies.commonName);
      } else if (sortBy === "scientific_name") {
        query = sortOrder === "desc" 
          ? query.orderBy(desc(treeSpecies.scientificName)) 
          : query.orderBy(treeSpecies.scientificName);
      } else if (sortBy === "origin") {
        query = sortOrder === "desc" 
          ? query.orderBy(desc(treeSpecies.origin)) 
          : query.orderBy(treeSpecies.origin);
      }
      
      // Aplicar paginación
      query = query.limit(limit).offset(offset);
      
      // Ejecutar la consulta
      const species = await query;
      
      // Contar el número total de especies (para paginación)
      const countQuery = db.select({ count: treeSpecies.id }).from(treeSpecies);
      if (search) {
        countQuery.where(
          or(
            like(treeSpecies.commonName, `%${search}%`),
            like(treeSpecies.scientificName, `%${search}%`),
            like(treeSpecies.family, `%${search}%`),
            like(treeSpecies.origin, `%${search}%`)
          )
        );
      }
      const totalCount = await countQuery;
      
      res.json({
        data: species,
        pagination: {
          total: totalCount[0]?.count || 0,
          page,
          limit,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
        }
      });
    } catch (error) {
      console.error("Error al obtener especies de árboles:", error);
      res.status(500).json({ message: "Error al obtener especies de árboles" });
    }
  });

  // Obtener una especie de árbol por ID
  apiRouter.get("/tree-species/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const [species] = await db
        .select()
        .from(treeSpecies)
        .where(eq(treeSpecies.id, id));
      
      if (!species) {
        return res.status(404).json({ message: "Especie de árbol no encontrada" });
      }
      
      res.json(species);
    } catch (error) {
      console.error("Error al obtener especie de árbol:", error);
      res.status(500).json({ message: "Error al obtener especie de árbol" });
    }
  });

  // Crear nueva especie de árbol (requiere autenticación)
  apiRouter.post("/tree-species", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const speciesData = insertTreeSpeciesSchema.parse(req.body);
      
      const [newSpecies] = await db
        .insert(treeSpecies)
        .values(speciesData)
        .returning();
      
      res.status(201).json(newSpecies);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al crear especie de árbol:", error);
      res.status(500).json({ message: "Error al crear especie de árbol" });
    }
  });

  // Actualizar especie de árbol (requiere autenticación)
  apiRouter.put("/tree-species/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const speciesData = insertTreeSpeciesSchema.parse(req.body);
      
      const [updatedSpecies] = await db
        .update(treeSpecies)
        .set({ ...speciesData, updatedAt: new Date() })
        .where(eq(treeSpecies.id, id))
        .returning();
      
      if (!updatedSpecies) {
        return res.status(404).json({ message: "Especie de árbol no encontrada" });
      }
      
      res.json(updatedSpecies);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al actualizar especie de árbol:", error);
      res.status(500).json({ message: "Error al actualizar especie de árbol" });
    }
  });

  // Eliminar especie de árbol (requiere autenticación)
  apiRouter.delete("/tree-species/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Verificar si la especie tiene árboles asociados
      const [treeCount] = await db
        .select({ count: trees.id })
        .from(trees)
        .where(eq(trees.speciesId, id));
      
      if (treeCount && treeCount.count > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar la especie porque tiene árboles asociados" 
        });
      }
      
      const [deletedSpecies] = await db
        .delete(treeSpecies)
        .where(eq(treeSpecies.id, id))
        .returning();
      
      if (!deletedSpecies) {
        return res.status(404).json({ message: "Especie de árbol no encontrada" });
      }
      
      res.json({ message: "Especie de árbol eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar especie de árbol:", error);
      res.status(500).json({ message: "Error al eliminar especie de árbol" });
    }
  });

  // Obtener todos los árboles con paginación y filtros
  apiRouter.get("/trees", async (req: Request, res: Response) => {
    try {
      // Parámetros de paginación y filtrado
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const search = req.query.search as string;
      const parkId = req.query.parkId ? Number(req.query.parkId) : undefined;
      const speciesId = req.query.speciesId ? Number(req.query.speciesId) : undefined;
      const healthStatus = req.query.healthStatus as string;
      
      // Construir la consulta base con relaciones
      let query = db.select({
        tree: trees,
        species: treeSpecies,
        park: parks,
      })
      .from(trees)
      .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
      .leftJoin(parks, eq(trees.parkId, parks.id));
      
      // Aplicar filtros
      const filters = [];
      if (search) {
        filters.push(
          or(
            like(parks.name, `%${search}%`),
            like(treeSpecies.commonName, `%${search}%`),
            like(treeSpecies.scientificName, `%${search}%`),
            like(trees.locationDescription, `%${search}%`)
          )
        );
      }
      
      if (parkId) {
        filters.push(eq(trees.parkId, parkId));
      }
      
      if (speciesId) {
        filters.push(eq(trees.speciesId, speciesId));
      }
      
      if (healthStatus) {
        filters.push(eq(trees.healthStatus, healthStatus));
      }
      
      if (filters.length > 0) {
        query = query.where(and(...filters));
      }
      
      // Aplicar paginación
      query = query.limit(limit).offset(offset);
      
      // Ejecutar la consulta
      const result = await query;
      
      // Formatear los resultados
      const formattedTrees = result.map(({ tree, species, park }) => ({
        ...tree,
        species,
        park
      }));
      
      // Contar el número total de árboles (para paginación)
      let countQuery = db.select({ count: trees.id }).from(trees);
      if (filters.length > 0) {
        countQuery = countQuery.where(and(...filters));
      }
      const totalCount = await countQuery;
      
      res.json({
        data: formattedTrees,
        pagination: {
          total: totalCount[0]?.count || 0,
          page,
          limit,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
        }
      });
    } catch (error) {
      console.error("Error al obtener árboles:", error);
      res.status(500).json({ message: "Error al obtener árboles" });
    }
  });

  // Obtener árboles por parque
  apiRouter.get("/parks/:id/trees", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      
      // Verificar que el parque existe
      const [park] = await db.select().from(parks).where(eq(parks.id, parkId));
      if (!park) {
        return res.status(404).json({ message: "Parque no encontrado" });
      }
      
      // Obtener árboles del parque con información de especies
      const result = await db.select({
        tree: trees,
        species: treeSpecies
      })
      .from(trees)
      .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
      .where(eq(trees.parkId, parkId));
      
      // Formatear los resultados
      const formattedTrees = result.map(({ tree, species }) => ({
        ...tree,
        species
      }));
      
      res.json(formattedTrees);
    } catch (error) {
      console.error("Error al obtener árboles del parque:", error);
      res.status(500).json({ message: "Error al obtener árboles del parque" });
    }
  });

  // Obtener un árbol por ID
  apiRouter.get("/trees/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Obtener árbol con información de especie y parque
      const [result] = await db.select({
        tree: trees,
        species: treeSpecies,
        park: parks
      })
      .from(trees)
      .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
      .leftJoin(parks, eq(trees.parkId, parks.id))
      .where(eq(trees.id, id));
      
      if (!result) {
        return res.status(404).json({ message: "Árbol no encontrado" });
      }
      
      // Formatear el resultado
      const tree = {
        ...result.tree,
        species: result.species,
        park: result.park
      };
      
      res.json(tree);
    } catch (error) {
      console.error("Error al obtener árbol:", error);
      res.status(500).json({ message: "Error al obtener árbol" });
    }
  });

  // Crear nuevo árbol (requiere autenticación)
  apiRouter.post("/trees", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const treeData = insertTreeSchema.parse(req.body);
      
      // Asignar el usuario que crea el árbol
      const data = {
        ...treeData,
        createdBy: req.user.id
      };
      
      const [newTree] = await db
        .insert(trees)
        .values(data)
        .returning();
      
      res.status(201).json(newTree);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al crear árbol:", error);
      res.status(500).json({ message: "Error al crear árbol" });
    }
  });

  // Actualizar árbol (requiere autenticación)
  apiRouter.put("/trees/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const treeData = insertTreeSchema.parse(req.body);
      
      const [updatedTree] = await db
        .update(trees)
        .set({ ...treeData, updatedAt: new Date() })
        .where(eq(trees.id, id))
        .returning();
      
      if (!updatedTree) {
        return res.status(404).json({ message: "Árbol no encontrado" });
      }
      
      res.json(updatedTree);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al actualizar árbol:", error);
      res.status(500).json({ message: "Error al actualizar árbol" });
    }
  });

  // Obtener mantenimientos de un árbol
  apiRouter.get("/trees/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const treeId = Number(req.params.id);
      
      // Verificar que el árbol existe
      const [tree] = await db.select().from(trees).where(eq(trees.id, treeId));
      if (!tree) {
        return res.status(404).json({ message: "Árbol no encontrado" });
      }
      
      // Obtener mantenimientos del árbol
      const maintenances = await db
        .select()
        .from(treeMaintenances)
        .where(eq(treeMaintenances.treeId, treeId))
        .orderBy(desc(treeMaintenances.maintenanceDate));
      
      res.json(maintenances);
    } catch (error) {
      console.error("Error al obtener mantenimientos del árbol:", error);
      res.status(500).json({ message: "Error al obtener mantenimientos del árbol" });
    }
  });

  // Crear mantenimiento para un árbol (requiere autenticación)
  apiRouter.post("/trees/:id/maintenances", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const treeId = Number(req.params.id);
      
      // Verificar que el árbol existe
      const [tree] = await db.select().from(trees).where(eq(trees.id, treeId));
      if (!tree) {
        return res.status(404).json({ message: "Árbol no encontrado" });
      }
      
      const maintenanceData = insertTreeMaintenanceSchema.parse(req.body);
      
      // Asignar el árbol y el usuario que realiza el mantenimiento
      const data = {
        ...maintenanceData,
        treeId,
        performedBy: req.user.id
      };
      
      const [newMaintenance] = await db
        .insert(treeMaintenances)
        .values(data)
        .returning();
      
      // Actualizar la fecha del último mantenimiento en el árbol
      await db
        .update(trees)
        .set({ 
          lastMaintenanceDate: newMaintenance.maintenanceDate,
          updatedAt: new Date()
        })
        .where(eq(trees.id, treeId));
      
      res.status(201).json(newMaintenance);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al crear mantenimiento:", error);
      res.status(500).json({ message: "Error al crear mantenimiento" });
    }
  });

  // Estadísticas de árboles (requiere autenticación)
  apiRouter.get("/trees-stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Filtrar por municipio si el usuario no es super_admin
      const municipalityFilter = req.user.role !== 'super_admin' && req.user.municipalityId
        ? eq(parks.municipalityId, req.user.municipalityId)
        : undefined;
      
      // Estadísticas generales
      const totalQuery = db.select({ count: trees.id }).from(trees);
      if (municipalityFilter) {
        totalQuery.leftJoin(parks, eq(trees.parkId, parks.id)).where(municipalityFilter);
      }
      const [totalTrees] = await totalQuery;
      
      // Árboles por estado de salud
      const healthQuery = db
        .select({
          healthStatus: trees.healthStatus,
          count: trees.id,
        })
        .from(trees)
        .groupBy(trees.healthStatus);
      
      if (municipalityFilter) {
        healthQuery.leftJoin(parks, eq(trees.parkId, parks.id)).where(municipalityFilter);
      }
      
      const healthStats = await healthQuery;
      
      // Árboles por especie (top 10)
      const speciesQuery = db
        .select({
          speciesId: trees.speciesId,
          speciesName: treeSpecies.commonName,
          scientificName: treeSpecies.scientificName,
          count: trees.id,
        })
        .from(trees)
        .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
        .groupBy(trees.speciesId, treeSpecies.commonName, treeSpecies.scientificName)
        .orderBy(desc(trees.id))
        .limit(10);
      
      if (municipalityFilter) {
        speciesQuery.leftJoin(parks, eq(trees.parkId, parks.id)).where(municipalityFilter);
      }
      
      const speciesStats = await speciesQuery;
      
      // Árboles por parque (top 10)
      const parkQuery = db
        .select({
          parkId: trees.parkId,
          parkName: parks.name,
          count: trees.id,
        })
        .from(trees)
        .leftJoin(parks, eq(trees.parkId, parks.id))
        .groupBy(trees.parkId, parks.name)
        .orderBy(desc(trees.id))
        .limit(10);
      
      if (municipalityFilter) {
        parkQuery.where(municipalityFilter);
      }
      
      const parkStats = await parkQuery;
      
      // Mantenimientos recientes (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const maintenanceQuery = db
        .select({
          count: treeMaintenances.id,
        })
        .from(treeMaintenances)
        .where(gte(treeMaintenances.maintenanceDate, thirtyDaysAgo.toISOString()));
      
      if (municipalityFilter) {
        maintenanceQuery
          .leftJoin(trees, eq(treeMaintenances.treeId, trees.id))
          .leftJoin(parks, eq(trees.parkId, parks.id))
          .where(municipalityFilter);
      }
      
      const [recentMaintenances] = await maintenanceQuery;
      
      // Árboles que necesitan mantenimiento (sin mantenimiento en los últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const needMaintenanceQuery = db
        .select({ count: trees.id })
        .from(trees)
        .where(
          or(
            isNull(trees.lastMaintenanceDate),
            lte(trees.lastMaintenanceDate, sixMonthsAgo.toISOString())
          )
        );
      
      if (municipalityFilter) {
        needMaintenanceQuery
          .leftJoin(parks, eq(trees.parkId, parks.id))
          .where(municipalityFilter);
      }
      
      const [needMaintenance] = await needMaintenanceQuery;
      
      res.json({
        totalTrees: totalTrees?.count || 0,
        healthStatus: healthStats,
        bySpecies: speciesStats,
        byPark: parkStats,
        recentMaintenances: recentMaintenances?.count || 0,
        needMaintenance: needMaintenance?.count || 0
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de árboles:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de árboles" });
    }
  });
}