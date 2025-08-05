import { Request, Response, Router } from "express";
import { db } from "./db";
import { 
  trees, 
  treeSpecies, 
  parks, 
  treeRiskAssessments,
  treeInterventions,
  treeEnvironmentalServices
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Router para las rutas de detalles técnicos y ambientales de árboles
export const treeDetailsRouter = Router();

// GET - Obtener evaluaciones de riesgo para un árbol específico
treeDetailsRouter.get("/trees/:id/risk-assessments", async (req: Request, res: Response) => {
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
    res.status(500).json({ error: "Error al obtener evaluaciones de riesgo del árbol" });
  }
});

// POST - Registrar una nueva evaluación de riesgo
treeDetailsRouter.post("/trees/:id/risk-assessments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessmentData = req.body;
    
    // Validar que el árbol existe
    const [tree] = await db
      .select()
      .from(trees)
      .where(eq(trees.id, Number(id)));
    
    if (!tree) {
      return res.status(404).json({ error: "Árbol no encontrado" });
    }
    
    // Insertar nueva evaluación de riesgo
    const [newAssessment] = await db
      .insert(treeRiskAssessments)
      .values({
        treeId: Number(id),
        assessmentDate: new Date(assessmentData.assessmentDate),
        methodology: assessmentData.methodology,
        assessedBy: assessmentData.assessedBy,
        riskLevel: assessmentData.riskLevel,
        likelihoodOfFailure: assessmentData.likelihoodOfFailure,
        consequenceOfFailure: assessmentData.consequenceOfFailure,
        targetRating: assessmentData.targetRating,
        recommendedActions: assessmentData.recommendedActions,
        timeframe: assessmentData.timeframe,
        notes: assessmentData.notes
      })
      .returning();
    
    res.status(201).json({ data: newAssessment });
  } catch (error) {
    console.error("Error creating tree risk assessment:", error);
    res.status(500).json({ error: "Error al registrar evaluación de riesgo" });
  }
});

// GET - Obtener intervenciones para un árbol específico
treeDetailsRouter.get("/trees/:id/interventions", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const interventions = await db
      .select()
      .from(treeInterventions)
      .where(eq(treeInterventions.treeId, Number(id)))
      .orderBy(desc(treeInterventions.plannedDate));
    
    res.json({ data: interventions });
  } catch (error) {
    console.error("Error fetching tree interventions:", error);
    res.status(500).json({ error: "Error al obtener intervenciones del árbol" });
  }
});

// POST - Registrar una nueva intervención
treeDetailsRouter.post("/trees/:id/interventions", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interventionData = req.body;
    
    // Validar que el árbol existe
    const [tree] = await db
      .select()
      .from(trees)
      .where(eq(trees.id, Number(id)));
    
    if (!tree) {
      return res.status(404).json({ error: "Árbol no encontrado" });
    }
    
    // Insertar nueva intervención
    const [newIntervention] = await db
      .insert(treeInterventions)
      .values({
        treeId: Number(id),
        interventionType: interventionData.interventionType,
        subType: interventionData.subType,
        priority: interventionData.priority,
        status: interventionData.status,
        justification: interventionData.justification,
        plannedDate: interventionData.plannedDate ? new Date(interventionData.plannedDate) : null,
        completedDate: interventionData.completedDate ? new Date(interventionData.completedDate) : null,
        performedBy: interventionData.performedBy,
        notes: interventionData.notes
      })
      .returning();
    
    res.status(201).json({ data: newIntervention });
  } catch (error) {
    console.error("Error creating tree intervention:", error);
    res.status(500).json({ error: "Error al registrar intervención" });
  }
});

// PUT - Actualizar el estado de una intervención
treeDetailsRouter.put("/trees/interventions/:interventionId", async (req: Request, res: Response) => {
  try {
    const { interventionId } = req.params;
    const { status, completedDate, performedBy, notes } = req.body;
    
    // Validar que la intervención existe
    const [intervention] = await db
      .select()
      .from(treeInterventions)
      .where(eq(treeInterventions.id, Number(interventionId)));
    
    if (!intervention) {
      return res.status(404).json({ error: "Intervención no encontrada" });
    }
    
    // Actualizar intervención
    const [updatedIntervention] = await db
      .update(treeInterventions)
      .set({
        status,
        completedDate: completedDate ? new Date(completedDate) : intervention.completedDate,
        performedBy: performedBy || intervention.performedBy,
        notes: notes || intervention.notes
      })
      .where(eq(treeInterventions.id, Number(interventionId)))
      .returning();
    
    res.json({ data: updatedIntervention });
  } catch (error) {
    console.error("Error updating tree intervention:", error);
    res.status(500).json({ error: "Error al actualizar intervención" });
  }
});

// GET - Obtener servicios ambientales para un árbol específico
treeDetailsRouter.get("/trees/:id/environmental-services", async (req: Request, res: Response) => {
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
    res.status(500).json({ error: "Error al obtener servicios ambientales del árbol" });
  }
});

// POST - Registrar un nuevo cálculo de servicios ambientales
treeDetailsRouter.post("/trees/:id/environmental-services", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    
    // Validar que el árbol existe
    const [tree] = await db
      .select()
      .from(trees)
      .where(eq(trees.id, Number(id)));
    
    if (!tree) {
      return res.status(404).json({ error: "Árbol no encontrado" });
    }
    
    // Insertar nuevo cálculo de servicios ambientales
    const [newService] = await db
      .insert(treeEnvironmentalServices)
      .values({
        treeId: Number(id),
        calculationDate: new Date(serviceData.calculationDate),
        calculationMethod: serviceData.calculationMethod,
        co2SequestrationAnnual: serviceData.co2SequestrationAnnual,
        co2SequestrationLifetime: serviceData.co2SequestrationLifetime,
        pollutantRemovalNO2: serviceData.pollutantRemovalNO2,
        pollutantRemovalSO2: serviceData.pollutantRemovalSO2,
        pollutantRemovalPM25: serviceData.pollutantRemovalPM25,
        stormwaterInterception: serviceData.stormwaterInterception,
        shadeAreaSummer: serviceData.shadeAreaSummer,
        temperatureReduction: serviceData.temperatureReduction,
        energySavingsValue: serviceData.energySavingsValue,
        totalEconomicBenefitAnnual: serviceData.totalEconomicBenefitAnnual,
        totalEconomicBenefitLifetime: serviceData.totalEconomicBenefitLifetime,
        notes: serviceData.notes
      })
      .returning();
    
    res.status(201).json({ data: newService });
  } catch (error) {
    console.error("Error creating tree environmental service:", error);
    res.status(500).json({ error: "Error al registrar servicios ambientales" });
  }
});

// Función para registrar las rutas en el router principal
export function registerTreeDetailsRoutes(app: any, apiRouter: Router) {
  // Registrar las rutas de detalles técnicos y ambientales
  apiRouter.use(treeDetailsRouter);
}