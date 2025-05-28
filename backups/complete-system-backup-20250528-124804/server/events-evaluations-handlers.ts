import { Request, Response } from "express";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { eventEvaluations } from "@shared/events-schema";

/**
 * Obtiene todas las evaluaciones de un evento
 */
export async function getEventEvaluations(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento no válido" });
    }

    const evaluations = await db.query.eventEvaluations.findMany({
      where: eq(eventEvaluations.eventId, eventId),
      orderBy: [eventEvaluations.submissionDate.desc()]
    });

    // Formatear la respuesta para el frontend
    const formattedEvaluations = evaluations.map(item => ({
      id: item.id,
      eventId: item.eventId,
      evaluationType: item.respondentType,
      score: item.rating,
      comments: item.feedback,
      createdAt: item.submissionDate || item.createdAt
    }));

    res.json(formattedEvaluations);
  } catch (error) {
    console.error("Error al obtener evaluaciones del evento:", error);
    res.status(500).json({ message: "Error al obtener evaluaciones del evento" });
  }
}

/**
 * Crea una nueva evaluación para un evento
 */
export async function createEventEvaluation(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento no válido" });
    }

    const { evaluationType, score, comments } = req.body;
    
    // Validación básica
    if (!evaluationType || !score) {
      return res.status(400).json({ message: "Tipo de evaluación y puntuación son requeridos" });
    }
    
    // Validar puntuación entre 1 y 5
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 5) {
      return res.status(400).json({ message: "La puntuación debe ser un número entre 1 y 5" });
    }

    // Obtener información del usuario actual desde la sesión
    const userId = req.headers["x-user-id"] || null;
    const now = new Date();
    
    const [result] = await db
      .insert(eventEvaluations)
      .values({
        eventId,
        respondentType: evaluationType,
        respondentId: userId ? parseInt(userId.toString()) : null,
        rating: scoreNum,
        feedback: comments || null,
        submissionDate: now,
        createdAt: now
      })
      .returning();

    // Formatear la respuesta para el frontend
    const formattedEvaluation = {
      id: result.id,
      eventId: result.eventId,
      evaluationType: result.respondentType,
      score: result.rating,
      comments: result.feedback,
      createdAt: result.submissionDate || result.createdAt
    };

    res.status(201).json(formattedEvaluation);
  } catch (error) {
    console.error("Error al crear evaluación para el evento:", error);
    res.status(500).json({ message: "Error al crear evaluación para el evento" });
  }
}

/**
 * Actualiza una evaluación existente
 */
export async function updateEventEvaluation(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const evaluationId = parseInt(req.params.evaluationId);
    
    if (isNaN(eventId) || isNaN(evaluationId)) {
      return res.status(400).json({ message: "ID no válido" });
    }

    const { evaluationType, score, comments } = req.body;
    
    // Validación básica
    if (!evaluationType || !score) {
      return res.status(400).json({ message: "Tipo de evaluación y puntuación son requeridos" });
    }
    
    // Validar puntuación entre 1 y 5
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 5) {
      return res.status(400).json({ message: "La puntuación debe ser un número entre 1 y 5" });
    }

    // Verificar que la evaluación existe y pertenece al evento
    const existingEvaluation = await db.query.eventEvaluations.findFirst({
      where: and(
        eq(eventEvaluations.id, evaluationId),
        eq(eventEvaluations.eventId, eventId)
      )
    });

    if (!existingEvaluation) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }

    const [updatedRecord] = await db
      .update(eventEvaluations)
      .set({
        respondentType: evaluationType,
        rating: scoreNum,
        feedback: comments || null,
        submissionDate: new Date() // Actualizamos la fecha de envío
      })
      .where(eq(eventEvaluations.id, evaluationId))
      .returning();

    // Formatear la respuesta para el frontend
    const formattedEvaluation = {
      id: updatedRecord.id,
      eventId: updatedRecord.eventId,
      evaluationType: updatedRecord.respondentType,
      score: updatedRecord.rating,
      comments: updatedRecord.feedback,
      createdAt: updatedRecord.submissionDate || updatedRecord.createdAt
    };

    res.json(formattedEvaluation);
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    res.status(500).json({ message: "Error al actualizar evaluación" });
  }
}

/**
 * Elimina una evaluación de un evento
 */
export async function deleteEventEvaluation(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const evaluationId = parseInt(req.params.evaluationId);
    
    if (isNaN(eventId) || isNaN(evaluationId)) {
      return res.status(400).json({ message: "ID no válido" });
    }

    // Verificar que la evaluación existe y pertenece al evento
    const existingEvaluation = await db.query.eventEvaluations.findFirst({
      where: and(
        eq(eventEvaluations.id, evaluationId),
        eq(eventEvaluations.eventId, eventId)
      )
    });

    if (!existingEvaluation) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }

    await db
      .delete(eventEvaluations)
      .where(eq(eventEvaluations.id, evaluationId));

    res.json({ message: "Evaluación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar evaluación:", error);
    res.status(500).json({ message: "Error al eliminar evaluación" });
  }
}