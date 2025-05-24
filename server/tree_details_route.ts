import { Request, Response } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  trees,
  treeRiskAssessments,
  treeInterventions,
  treeEnvironmentalServices,
  insertTreeRiskAssessmentSchema,
  insertTreeInterventionSchema,
  insertTreeEnvironmentalServiceSchema,
  type TreeRiskAssessment,
  type TreeIntervention,
  type TreeEnvironmentalService,
} from "@shared/schema";

/**
 * Registra las rutas para la gestión técnica y ambiental de árboles
 */
export function registerTreeDetailsRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  // ===== RUTAS PARA EVALUACIONES DE RIESGO =====
  
  // Obtener todas las evaluaciones de riesgo de un árbol
  apiRouter.get("/trees/:id/risk-assessments", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const assessments = await db
        .select()
        .from(treeRiskAssessments)
        .where(eq(treeRiskAssessments.treeId, Number(id)))
        .orderBy(desc(treeRiskAssessments.assessmentDate));
      
      res.json({ data: assessments });
    } catch (error) {
      console.error("Error fetching tree risk assessments:", error);
      res.status(500).json({ error: "Error al obtener evaluaciones de riesgo" });
    }
  });

  // Obtener una evaluación de riesgo específica
  apiRouter.get("/tree-risk-assessments/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [assessment] = await db
        .select()
        .from(treeRiskAssessments)
        .where(eq(treeRiskAssessments.id, Number(id)));
      
      if (!assessment) {
        return res.status(404).json({ error: "Evaluación de riesgo no encontrada" });
      }
      
      res.json({ data: assessment });
    } catch (error) {
      console.error("Error fetching tree risk assessment:", error);
      res.status(500).json({ error: "Error al obtener la evaluación de riesgo" });
    }
  });

  // Crear una nueva evaluación de riesgo
  apiRouter.post("/trees/:id/risk-assessments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const treeId = Number(id);
      
      // Verificar que el árbol exista
      const [treeExists] = await db
        .select({ id: trees.id })
        .from(trees)
        .where(eq(trees.id, treeId));
      
      if (!treeExists) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }
      
      // Validar datos de entrada
      const validatedData = insertTreeRiskAssessmentSchema.parse({
        ...req.body,
        treeId
      });
      
      // Crear la evaluación de riesgo
      const [assessment] = await db
        .insert(treeRiskAssessments)
        .values(validatedData)
        .returning();
      
      res.status(201).json({ data: assessment });
    } catch (error) {
      console.error("Error creating tree risk assessment:", error);
      res.status(500).json({ error: "Error al crear la evaluación de riesgo" });
    }
  });

  // Actualizar una evaluación de riesgo
  apiRouter.put("/tree-risk-assessments/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar que la evaluación exista
      const [assessmentExists] = await db
        .select({ id: treeRiskAssessments.id })
        .from(treeRiskAssessments)
        .where(eq(treeRiskAssessments.id, Number(id)));
      
      if (!assessmentExists) {
        return res.status(404).json({ error: "Evaluación de riesgo no encontrada" });
      }
      
      // Validar datos de entrada (excluyendo treeId que no debe cambiar)
      const { treeId, ...updateData } = req.body;
      
      // Actualizar la evaluación
      const [updated] = await db
        .update(treeRiskAssessments)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(treeRiskAssessments.id, Number(id)))
        .returning();
      
      res.json({ data: updated });
    } catch (error) {
      console.error("Error updating tree risk assessment:", error);
      res.status(500).json({ error: "Error al actualizar la evaluación de riesgo" });
    }
  });

  // Eliminar una evaluación de riesgo
  apiRouter.delete("/tree-risk-assessments/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await db
        .delete(treeRiskAssessments)
        .where(eq(treeRiskAssessments.id, Number(id)));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tree risk assessment:", error);
      res.status(500).json({ error: "Error al eliminar la evaluación de riesgo" });
    }
  });

  // ===== RUTAS PARA INTERVENCIONES =====
  
  // Obtener todas las intervenciones de un árbol
  apiRouter.get("/trees/:id/interventions", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.query;
      
      let query = db
        .select()
        .from(treeInterventions)
        .where(eq(treeInterventions.treeId, Number(id)));
      
      // Filtrar por estado si se proporciona
      if (status) {
        query = query.where(eq(treeInterventions.status, String(status)));
      }
      
      const interventions = await query.orderBy(desc(treeInterventions.createdAt));
      
      res.json({ data: interventions });
    } catch (error) {
      console.error("Error fetching tree interventions:", error);
      res.status(500).json({ error: "Error al obtener intervenciones" });
    }
  });

  // Obtener una intervención específica
  apiRouter.get("/tree-interventions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [intervention] = await db
        .select()
        .from(treeInterventions)
        .where(eq(treeInterventions.id, Number(id)));
      
      if (!intervention) {
        return res.status(404).json({ error: "Intervención no encontrada" });
      }
      
      res.json({ data: intervention });
    } catch (error) {
      console.error("Error fetching tree intervention:", error);
      res.status(500).json({ error: "Error al obtener la intervención" });
    }
  });

  // Crear una nueva intervención
  apiRouter.post("/trees/:id/interventions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const treeId = Number(id);
      
      // Verificar que el árbol exista
      const [treeExists] = await db
        .select({ id: trees.id })
        .from(trees)
        .where(eq(trees.id, treeId));
      
      if (!treeExists) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }
      
      // Validar datos de entrada
      const validatedData = insertTreeInterventionSchema.parse({
        ...req.body,
        treeId
      });
      
      // Crear la intervención
      const [intervention] = await db
        .insert(treeInterventions)
        .values(validatedData)
        .returning();
      
      res.status(201).json({ data: intervention });
    } catch (error) {
      console.error("Error creating tree intervention:", error);
      res.status(500).json({ error: "Error al crear la intervención" });
    }
  });

  // Actualizar una intervención
  apiRouter.put("/tree-interventions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar que la intervención exista
      const [interventionExists] = await db
        .select({ id: treeInterventions.id })
        .from(treeInterventions)
        .where(eq(treeInterventions.id, Number(id)));
      
      if (!interventionExists) {
        return res.status(404).json({ error: "Intervención no encontrada" });
      }
      
      // Validar datos de entrada (excluyendo treeId que no debe cambiar)
      const { treeId, ...updateData } = req.body;
      
      // Actualizar la intervención
      const [updated] = await db
        .update(treeInterventions)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(treeInterventions.id, Number(id)))
        .returning();
      
      res.json({ data: updated });
    } catch (error) {
      console.error("Error updating tree intervention:", error);
      res.status(500).json({ error: "Error al actualizar la intervención" });
    }
  });

  // Eliminar una intervención
  apiRouter.delete("/tree-interventions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await db
        .delete(treeInterventions)
        .where(eq(treeInterventions.id, Number(id)));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tree intervention:", error);
      res.status(500).json({ error: "Error al eliminar la intervención" });
    }
  });

  // ===== RUTAS PARA SERVICIOS AMBIENTALES =====
  
  // Obtener todos los servicios ambientales de un árbol
  apiRouter.get("/trees/:id/environmental-services", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const services = await db
        .select()
        .from(treeEnvironmentalServices)
        .where(eq(treeEnvironmentalServices.treeId, Number(id)))
        .orderBy(desc(treeEnvironmentalServices.calculationDate));
      
      res.json({ data: services });
    } catch (error) {
      console.error("Error fetching tree environmental services:", error);
      res.status(500).json({ error: "Error al obtener servicios ambientales" });
    }
  });

  // Obtener un servicio ambiental específico
  apiRouter.get("/tree-environmental-services/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [service] = await db
        .select()
        .from(treeEnvironmentalServices)
        .where(eq(treeEnvironmentalServices.id, Number(id)));
      
      if (!service) {
        return res.status(404).json({ error: "Servicio ambiental no encontrado" });
      }
      
      res.json({ data: service });
    } catch (error) {
      console.error("Error fetching tree environmental service:", error);
      res.status(500).json({ error: "Error al obtener el servicio ambiental" });
    }
  });

  // Crear un nuevo servicio ambiental
  apiRouter.post("/trees/:id/environmental-services", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const treeId = Number(id);
      
      // Verificar que el árbol exista
      const [treeExists] = await db
        .select({ id: trees.id })
        .from(trees)
        .where(eq(trees.id, treeId));
      
      if (!treeExists) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }
      
      // Validar datos de entrada
      const validatedData = insertTreeEnvironmentalServiceSchema.parse({
        ...req.body,
        treeId
      });
      
      // Crear el servicio ambiental
      const [service] = await db
        .insert(treeEnvironmentalServices)
        .values(validatedData)
        .returning();
      
      res.status(201).json({ data: service });
    } catch (error) {
      console.error("Error creating tree environmental service:", error);
      res.status(500).json({ error: "Error al crear el servicio ambiental" });
    }
  });

  // Actualizar un servicio ambiental
  apiRouter.put("/tree-environmental-services/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar que el servicio exista
      const [serviceExists] = await db
        .select({ id: treeEnvironmentalServices.id })
        .from(treeEnvironmentalServices)
        .where(eq(treeEnvironmentalServices.id, Number(id)));
      
      if (!serviceExists) {
        return res.status(404).json({ error: "Servicio ambiental no encontrado" });
      }
      
      // Validar datos de entrada (excluyendo treeId que no debe cambiar)
      const { treeId, ...updateData } = req.body;
      
      // Actualizar el servicio
      const [updated] = await db
        .update(treeEnvironmentalServices)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(treeEnvironmentalServices.id, Number(id)))
        .returning();
      
      res.json({ data: updated });
    } catch (error) {
      console.error("Error updating tree environmental service:", error);
      res.status(500).json({ error: "Error al actualizar el servicio ambiental" });
    }
  });

  // Eliminar un servicio ambiental
  apiRouter.delete("/tree-environmental-services/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await db
        .delete(treeEnvironmentalServices)
        .where(eq(treeEnvironmentalServices.id, Number(id)));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tree environmental service:", error);
      res.status(500).json({ error: "Error al eliminar el servicio ambiental" });
    }
  });

  // ===== RUTAS PARA OBTENER DETALLES COMBINADOS DE UN ÁRBOL =====
  
  // Obtener ficha técnica completa de un árbol con todos sus detalles
  apiRouter.get("/trees/:id/technical-sheet", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const treeId = Number(id);
      
      // Obtener el árbol con su especie y parque
      const [tree] = await db
        .select()
        .from(trees)
        .where(eq(trees.id, treeId));
      
      if (!tree) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }
      
      // Obtener la última evaluación de riesgo
      const [lastRiskAssessment] = await db
        .select()
        .from(treeRiskAssessments)
        .where(eq(treeRiskAssessments.treeId, treeId))
        .orderBy(desc(treeRiskAssessments.assessmentDate))
        .limit(1);
      
      // Obtener la última intervención
      const [lastIntervention] = await db
        .select()
        .from(treeInterventions)
        .where(eq(treeInterventions.treeId, treeId))
        .orderBy(desc(treeInterventions.createdAt))
        .limit(1);
      
      // Obtener el último cálculo de servicios ambientales
      const [lastEnvironmentalService] = await db
        .select()
        .from(treeEnvironmentalServices)
        .where(eq(treeEnvironmentalServices.treeId, treeId))
        .orderBy(desc(treeEnvironmentalServices.calculationDate))
        .limit(1);
      
      // Contar intervenciones pendientes
      const [pendingInterventionsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(treeInterventions)
        .where(
          and(
            eq(treeInterventions.treeId, treeId),
            eq(treeInterventions.status, "pendiente")
          )
        );
      
      // Contar evaluaciones de alto riesgo
      const [highRiskCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(treeRiskAssessments)
        .where(
          and(
            eq(treeRiskAssessments.treeId, treeId),
            eq(treeRiskAssessments.riskLevel, "alto")
          )
        );
      
      // Construir y retornar la ficha técnica completa
      const technicalSheet = {
        ...tree,
        lastRiskAssessment,
        lastIntervention,
        lastEnvironmentalService,
        pendingInterventionsCount: pendingInterventionsCount?.count || 0,
        highRiskCount: highRiskCount?.count || 0,
      };
      
      res.json({ data: technicalSheet });
    } catch (error) {
      console.error("Error fetching tree technical sheet:", error);
      res.status(500).json({ error: "Error al obtener la ficha técnica del árbol" });
    }
  });
}