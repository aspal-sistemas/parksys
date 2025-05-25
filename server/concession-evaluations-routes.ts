import { Request, Response } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { concessionEvaluations } from "@shared/schema";
import { eq } from "drizzle-orm";

// Obtener todas las evaluaciones de concesiones
export async function getConcessionEvaluations(req: Request, res: Response) {
  try {
    const evaluations = await db.select().from(concessionEvaluations);
    
    // Enriquecer con nombres de contratos para la UI
    const enrichedEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        try {
          // Buscar contrato para obtener nombres
          const [contract] = await db.query.concessionContracts.findMany({
            where: eq(concessionEvaluations.contractId, evaluation.contractId),
            with: {
              concession: true,
              park: true,
            }
          });

          return {
            ...evaluation,
            contractName: contract ? `${contract.park?.name} - ${contract.concession?.name}` : 'Desconocido',
            parkName: contract?.park?.name || 'Desconocido',
            concessionaireName: contract?.concession?.name || 'Desconocido',
            concessionTypeName: contract?.concessionTypeName || 'Desconocido'
          };
        } catch (error) {
          console.error("Error enriqueciendo evaluación:", error);
          return evaluation;
        }
      })
    );

    res.json(enrichedEvaluations);
  } catch (error) {
    console.error("Error al obtener evaluaciones de concesiones:", error);
    res.status(500).json({ message: "Error al obtener evaluaciones de concesiones" });
  }
}

// Obtener una evaluación de concesión por ID
export async function getConcessionEvaluationById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const [evaluation] = await db.select().from(concessionEvaluations).where(eq(concessionEvaluations.id, id));
    
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error("Error al obtener evaluación de concesión:", error);
    res.status(500).json({ message: "Error al obtener evaluación de concesión" });
  }
}

// Crear una nueva evaluación de concesión
export async function createConcessionEvaluation(req: Request, res: Response) {
  try {
    const { 
      contractId, 
      evaluationDate, 
      sanitaryRating, 
      operationalRating, 
      technicalRating, 
      complianceRating, 
      customerSatisfactionRating, 
      findings, 
      recommendations, 
      followUpRequired, 
      followUpDate, 
      status, 
      attachments 
    } = req.body;

    // Validar campos obligatorios
    if (!contractId || !evaluationDate || 
        !sanitaryRating || !operationalRating || 
        !technicalRating || !complianceRating || 
        !customerSatisfactionRating || !status) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Procesar attachments (convertir de string separado por comas a array)
    let attachmentsArray = null;
    if (attachments) {
      attachmentsArray = attachments.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '');
    }

    // Crear la evaluación
    const [newEvaluation] = await db.insert(concessionEvaluations).values({
      contractId: parseInt(contractId),
      evaluationDate: new Date(evaluationDate),
      sanitaryRating: parseInt(sanitaryRating),
      operationalRating: parseInt(operationalRating),
      technicalRating: parseInt(technicalRating),
      complianceRating: parseInt(complianceRating),
      customerSatisfactionRating: parseInt(customerSatisfactionRating),
      findings: findings || null,
      recommendations: recommendations || null,
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      status,
      attachments: attachmentsArray,
      createdAt: new Date(),
      updatedAt: new Date(),
      evaluatorId: req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"] as string) : null
    }).returning();

    res.status(201).json(newEvaluation);
  } catch (error) {
    console.error("Error al crear evaluación de concesión:", error);
    res.status(500).json({ message: "Error al crear evaluación de concesión" });
  }
}

// Actualizar una evaluación de concesión existente
export async function updateConcessionEvaluation(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { 
      contractId, 
      evaluationDate, 
      sanitaryRating, 
      operationalRating, 
      technicalRating, 
      complianceRating, 
      customerSatisfactionRating, 
      findings, 
      recommendations, 
      followUpRequired, 
      followUpDate, 
      status, 
      attachments 
    } = req.body;

    // Validar campos obligatorios
    if (!contractId || !evaluationDate || 
        !sanitaryRating || !operationalRating || 
        !technicalRating || !complianceRating || 
        !customerSatisfactionRating || !status) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Verificar si la evaluación existe
    const [existingEvaluation] = await db.select().from(concessionEvaluations).where(eq(concessionEvaluations.id, id));
    
    if (!existingEvaluation) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }

    // Procesar attachments (convertir de string separado por comas a array)
    let attachmentsArray = null;
    if (attachments) {
      attachmentsArray = attachments.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '');
    }

    // Actualizar la evaluación
    const [updatedEvaluation] = await db.update(concessionEvaluations)
      .set({
        contractId: parseInt(contractId),
        evaluationDate: new Date(evaluationDate),
        sanitaryRating: parseInt(sanitaryRating),
        operationalRating: parseInt(operationalRating),
        technicalRating: parseInt(technicalRating),
        complianceRating: parseInt(complianceRating),
        customerSatisfactionRating: parseInt(customerSatisfactionRating),
        findings: findings || null,
        recommendations: recommendations || null,
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        status,
        attachments: attachmentsArray,
        updatedAt: new Date()
      })
      .where(eq(concessionEvaluations.id, id))
      .returning();

    res.json(updatedEvaluation);
  } catch (error) {
    console.error("Error al actualizar evaluación de concesión:", error);
    res.status(500).json({ message: "Error al actualizar evaluación de concesión" });
  }
}

// Eliminar una evaluación de concesión
export async function deleteConcessionEvaluation(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar si la evaluación existe
    const [existingEvaluation] = await db.select().from(concessionEvaluations).where(eq(concessionEvaluations.id, id));
    
    if (!existingEvaluation) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }

    // Eliminar la evaluación
    await db.delete(concessionEvaluations).where(eq(concessionEvaluations.id, id));

    res.json({ message: "Evaluación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar evaluación de concesión:", error);
    res.status(500).json({ message: "Error al eliminar evaluación de concesión" });
  }
}

// Registrar las rutas de evaluaciones de concesiones
export function registerConcessionEvaluationRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  // Rutas para gestionar evaluaciones de concesiones
  apiRouter.get("/concession-evaluations", isAuthenticated, getConcessionEvaluations);
  apiRouter.get("/concession-evaluations/:id", isAuthenticated, getConcessionEvaluationById);
  apiRouter.post("/concession-evaluations", isAuthenticated, createConcessionEvaluation);
  apiRouter.put("/concession-evaluations/:id", isAuthenticated, updateConcessionEvaluation);
  apiRouter.delete("/concession-evaluations/:id", isAuthenticated, deleteConcessionEvaluation);
}