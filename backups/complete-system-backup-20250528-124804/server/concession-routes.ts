import { Request, Response, Router } from "express";
import { db } from "./db";
import { concessionTypes, concessions } from "@shared/schema";
import { eq, asc, desc, and, isNull } from "drizzle-orm";

/**
 * Registra las rutas para el módulo de concesiones
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerConcessionRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Rutas para tipos de concesiones (catálogo)
  apiRouter.get("/concession-types", async (_req: Request, res: Response) => {
    try {
      const types = await db.query.concessionTypes.findMany({
        where: eq(concessionTypes.isActive, true),
        orderBy: [asc(concessionTypes.name)]
      });
      
      res.json(types);
    } catch (error) {
      console.error("Error al obtener tipos de concesiones:", error);
      res.status(500).json({ message: "Error al obtener tipos de concesiones" });
    }
  });

  apiRouter.get("/concession-types/all", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const types = await db.query.concessionTypes.findMany({
        orderBy: [asc(concessionTypes.name)]
      });
      
      res.json(types);
    } catch (error) {
      console.error("Error al obtener tipos de concesiones:", error);
      res.status(500).json({ message: "Error al obtener tipos de concesiones" });
    }
  });

  apiRouter.get("/concession-types/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const type = await db.query.concessionTypes.findFirst({
        where: eq(concessionTypes.id, id)
      });
      
      if (!type) {
        return res.status(404).json({ message: "Tipo de concesión no encontrado" });
      }
      
      res.json(type);
    } catch (error) {
      console.error("Error al obtener tipo de concesión:", error);
      res.status(500).json({ message: "Error al obtener tipo de concesión" });
    }
  });

  apiRouter.post("/concession-types", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        technicalRequirements,
        legalRequirements,
        operatingRules,
        impactLevel
      } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: "Nombre y descripción son obligatorios" });
      }
      
      // Obtener ID del usuario autenticado
      const userId = req.headers["x-user-id"];
      
      const [newType] = await db.insert(concessionTypes).values({
        name,
        description,
        technicalRequirements: technicalRequirements || null,
        legalRequirements: legalRequirements || null,
        operatingRules: operatingRules || null,
        impactLevel: impactLevel || 'bajo',
        createdById: userId ? parseInt(userId.toString()) : null
      }).returning();
      
      res.status(201).json(newType);
    } catch (error) {
      console.error("Error al crear tipo de concesión:", error);
      res.status(500).json({ message: "Error al crear tipo de concesión" });
    }
  });

  apiRouter.put("/concession-types/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const {
        name,
        description,
        technicalRequirements,
        legalRequirements,
        operatingRules,
        impactLevel,
        isActive
      } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: "Nombre y descripción son obligatorios" });
      }
      
      // Verificar que existe el tipo de concesión
      const existingType = await db.query.concessionTypes.findFirst({
        where: eq(concessionTypes.id, id)
      });
      
      if (!existingType) {
        return res.status(404).json({ message: "Tipo de concesión no encontrado" });
      }
      
      // Actualizar tipo de concesión
      const [updatedType] = await db.update(concessionTypes)
        .set({
          name,
          description,
          technicalRequirements: technicalRequirements || null,
          legalRequirements: legalRequirements || null,
          operatingRules: operatingRules || null,
          impactLevel: impactLevel || existingType.impactLevel,
          isActive: isActive !== undefined ? isActive : existingType.isActive,
          updatedAt: new Date()
        })
        .where(eq(concessionTypes.id, id))
        .returning();
      
      res.json(updatedType);
    } catch (error) {
      console.error("Error al actualizar tipo de concesión:", error);
      res.status(500).json({ message: "Error al actualizar tipo de concesión" });
    }
  });

  // No implementamos DELETE para tipos de concesión, usamos soft delete mediante el campo isActive
  apiRouter.post("/concession-types/:id/toggle-status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Verificar que existe el tipo de concesión
      const existingType = await db.query.concessionTypes.findFirst({
        where: eq(concessionTypes.id, id)
      });
      
      if (!existingType) {
        return res.status(404).json({ message: "Tipo de concesión no encontrado" });
      }
      
      // Verificar si está en uso
      const isInUse = await db.query.concessions.findFirst({
        where: eq(concessions.concessionTypeId, id)
      });
      
      if (isInUse && existingType.isActive) {
        return res.status(400).json({ 
          message: "No se puede desactivar un tipo de concesión que está en uso" 
        });
      }
      
      // Actualizar el estado
      const [updatedType] = await db.update(concessionTypes)
        .set({
          isActive: !existingType.isActive,
          updatedAt: new Date()
        })
        .where(eq(concessionTypes.id, id))
        .returning();
      
      res.json(updatedType);
    } catch (error) {
      console.error("Error al cambiar estado del tipo de concesión:", error);
      res.status(500).json({ message: "Error al cambiar estado del tipo de concesión" });
    }
  });

  // Rutas para las concesiones específicas asignadas a parques
  // Estas rutas se implementarán en el futuro
}