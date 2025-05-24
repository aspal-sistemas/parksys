/**
 * Rutas para el módulo de Arbolado
 */
import { Router, Request, Response } from "express";
import { db } from "./db";
import { treeSpecies, trees, treeMaintenances } from "@shared/schema";
import { eq, desc, and, like, ilike, or } from "drizzle-orm";

/**
 * Registra las rutas relacionadas con el módulo de arbolado
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerTreeRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Rutas para especies de árboles (catálogo)
  apiRouter.get("/tree-species", async (req: Request, res: Response) => {
    try {
      const species = await db.select().from(treeSpecies).orderBy(treeSpecies.commonName);
      res.json(species);
    } catch (error) {
      console.error("Error al obtener especies de árboles:", error);
      res.status(500).json({ message: "Error al obtener especies de árboles" });
    }
  });

  apiRouter.get("/tree-species/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [species] = await db.select().from(treeSpecies).where(eq(treeSpecies.id, parseInt(id)));
      
      if (!species) {
        return res.status(404).json({ message: "Especie no encontrada" });
      }
      
      res.json(species);
    } catch (error) {
      console.error("Error al obtener detalle de especie:", error);
      res.status(500).json({ message: "Error al obtener detalle de especie" });
    }
  });

  apiRouter.post("/tree-species", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const speciesData = req.body;
      const [newSpecies] = await db.insert(treeSpecies).values(speciesData).returning();
      res.status(201).json(newSpecies);
    } catch (error) {
      console.error("Error al crear especie de árbol:", error);
      res.status(500).json({ message: "Error al crear especie de árbol" });
    }
  });

  apiRouter.put("/tree-species/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const speciesData = req.body;
      const [updatedSpecies] = await db
        .update(treeSpecies)
        .set({ ...speciesData, updatedAt: new Date() })
        .where(eq(treeSpecies.id, parseInt(id)))
        .returning();
      
      if (!updatedSpecies) {
        return res.status(404).json({ message: "Especie no encontrada" });
      }
      
      res.json(updatedSpecies);
    } catch (error) {
      console.error("Error al actualizar especie de árbol:", error);
      res.status(500).json({ message: "Error al actualizar especie de árbol" });
    }
  });

  apiRouter.delete("/tree-species/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar si hay árboles asociados a esta especie
      const treesWithSpecies = await db
        .select({ count: trees.id })
        .from(trees)
        .where(eq(trees.speciesId, parseInt(id)));
      
      if (treesWithSpecies.length > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar esta especie porque hay árboles asociados a ella" 
        });
      }
      
      const [deletedSpecies] = await db
        .delete(treeSpecies)
        .where(eq(treeSpecies.id, parseInt(id)))
        .returning();
      
      if (!deletedSpecies) {
        return res.status(404).json({ message: "Especie no encontrada" });
      }
      
      res.json({ message: "Especie eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar especie de árbol:", error);
      res.status(500).json({ message: "Error al eliminar especie de árbol" });
    }
  });

  // Rutas para árboles individuales
  apiRouter.get("/trees", async (req: Request, res: Response) => {
    try {
      const result = await db.select().from(trees)
        .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
        .orderBy(desc(trees.id));
      
      const treesList = result.map(item => ({
        ...item.trees,
        species: item.tree_species
      }));
      
      res.json(treesList);
    } catch (error) {
      console.error("Error al obtener árboles:", error);
      res.status(500).json({ message: "Error al obtener árboles" });
    }
  });

  apiRouter.get("/parks/:id/trees", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await db.select().from(trees)
        .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
        .where(eq(trees.parkId, parseInt(id)))
        .orderBy(trees.identifier);
      
      const treesList = result.map(item => ({
        ...item.trees,
        species: item.tree_species
      }));
      
      res.json(treesList);
    } catch (error) {
      console.error("Error al obtener árboles del parque:", error);
      res.status(500).json({ message: "Error al obtener árboles del parque" });
    }
  });

  apiRouter.get("/trees/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await db.select().from(trees)
        .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
        .where(eq(trees.id, parseInt(id)));
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Árbol no encontrado" });
      }
      
      const tree = {
        ...result[0].trees,
        species: result[0].tree_species
      };
      
      // Obtener el historial de mantenimiento
      const maintenanceHistory = await db.select().from(treeMaintenances)
        .where(eq(treeMaintenances.treeId, parseInt(id)))
        .orderBy(desc(treeMaintenances.maintenanceDate));
      
      res.json({
        ...tree,
        maintenances: maintenanceHistory
      });
    } catch (error) {
      console.error("Error al obtener detalle del árbol:", error);
      res.status(500).json({ message: "Error al obtener detalle del árbol" });
    }
  });

  apiRouter.post("/trees", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const treeData = req.body;
      const [newTree] = await db.insert(trees).values(treeData).returning();
      
      res.status(201).json(newTree);
    } catch (error) {
      console.error("Error al crear árbol:", error);
      res.status(500).json({ message: "Error al crear árbol" });
    }
  });

  apiRouter.put("/trees/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const treeData = req.body;
      
      const [updatedTree] = await db
        .update(trees)
        .set({ ...treeData, updatedAt: new Date() })
        .where(eq(trees.id, parseInt(id)))
        .returning();
      
      if (!updatedTree) {
        return res.status(404).json({ message: "Árbol no encontrado" });
      }
      
      res.json(updatedTree);
    } catch (error) {
      console.error("Error al actualizar árbol:", error);
      res.status(500).json({ message: "Error al actualizar árbol" });
    }
  });

  // Rutas para mantenimiento de árboles
  apiRouter.get("/trees/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const maintenances = await db.select().from(treeMaintenances)
        .where(eq(treeMaintenances.treeId, parseInt(id)))
        .orderBy(desc(treeMaintenances.maintenanceDate));
      
      res.json(maintenances);
    } catch (error) {
      console.error("Error al obtener mantenimientos del árbol:", error);
      res.status(500).json({ message: "Error al obtener mantenimientos del árbol" });
    }
  });

  apiRouter.post("/trees/:id/maintenances", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const maintenanceData = {
        ...req.body,
        treeId: parseInt(id)
      };
      
      const [newMaintenance] = await db.insert(treeMaintenances).values(maintenanceData).returning();
      
      // Actualizar la fecha de última inspección y posiblemente el estado de salud
      if (maintenanceData.healthAfterService) {
        await db
          .update(trees)
          .set({
            lastInspectionDate: maintenanceData.maintenanceDate,
            healthStatus: maintenanceData.healthAfterService,
            updatedAt: new Date()
          })
          .where(eq(trees.id, parseInt(id)));
      } else {
        await db
          .update(trees)
          .set({
            lastInspectionDate: maintenanceData.maintenanceDate,
            updatedAt: new Date()
          })
          .where(eq(trees.id, parseInt(id)));
      }
      
      res.status(201).json(newMaintenance);
    } catch (error) {
      console.error("Error al registrar mantenimiento:", error);
      res.status(500).json({ message: "Error al registrar mantenimiento" });
    }
  });

  // Estadísticas para el dashboard
  apiRouter.get("/trees-stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Total de árboles
      const totalTrees = await db.select({ count: trees.id }).from(trees);
      
      // Árboles por estado de salud
      const treesByHealth = await db
        .select({ status: trees.healthStatus, count: trees.id })
        .from(trees)
        .groupBy(trees.healthStatus);
      
      // Árboles por especie (top 5)
      const treesBySpecies = await db
        .select({
          speciesId: treeSpecies.id,
          speciesName: treeSpecies.commonName,
          count: trees.id
        })
        .from(trees)
        .leftJoin(treeSpecies, eq(trees.speciesId, treeSpecies.id))
        .groupBy(treeSpecies.id, treeSpecies.commonName)
        .orderBy(desc(trees.id))
        .limit(5);
      
      // Mantenimientos recientes (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentMaintenances = await db
        .select({ count: treeMaintenances.id, type: treeMaintenances.maintenanceType })
        .from(treeMaintenances)
        .where(treeMaintenances.maintenanceDate >= thirtyDaysAgo.toISOString())
        .groupBy(treeMaintenances.maintenanceType);
      
      res.json({
        totalTrees: totalTrees[0]?.count || 0,
        treesByHealth,
        treesBySpecies,
        recentMaintenances
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de árboles:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de árboles" });
    }
  });
}