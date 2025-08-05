import { Request, Response } from "express";
import { db } from "./db";
import { eventRegistrations, events } from "@shared/events-schema";
import { eq, and } from "drizzle-orm";

/**
 * Obtiene todos los participantes de un evento
 */
export async function getEventParticipants(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    
    // Validar que el ID es un número válido
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }
    
    // Verificar que el evento existe
    const eventExists = await db.select().from(events).where(eq(events.id, eventId));
    if (!eventExists.length) {
      return res.status(404).json({ message: "El evento no existe" });
    }
    
    // Obtener los participantes
    const participants = await db.select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(eventRegistrations.registrationDate);
    
    return res.status(200).json(participants);
  } catch (error) {
    console.error("Error al obtener participantes:", error);
    return res.status(500).json({ 
      message: "Error al obtener los participantes del evento", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Registra un nuevo participante en un evento
 */
export async function registerParticipant(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const { 
      fullName, 
      email, 
      phone, 
      attendeeCount,
      notes,
      status = "registered" 
    } = req.body;
    
    if (!fullName) {
      return res.status(400).json({ message: "El nombre completo es obligatorio" });
    }
    
    // Verificar que el evento existe
    const eventExists = await db.select().from(events).where(eq(events.id, eventId));
    if (!eventExists.length) {
      return res.status(404).json({ message: "El evento no existe" });
    }
    
    // Verificar si hay capacidad disponible
    const event = eventExists[0];
    if (event.capacity) {
      const currentParticipants = await db.select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));
      
      // Calcular total de asistentes actuales
      const currentAttendeeCount = currentParticipants.reduce(
        (sum, p) => sum + (p.attendeeCount || 1), 
        0
      );
      
      const newAttendeeCount = attendeeCount || 1;
      
      if (currentAttendeeCount + newAttendeeCount > event.capacity) {
        return res.status(400).json({ 
          message: "No hay suficiente capacidad disponible para este registro",
          available: event.capacity - currentAttendeeCount,
          requested: newAttendeeCount
        });
      }
    }
    
    // Registrar al participante
    const registration = await db.insert(eventRegistrations)
      .values({
        eventId,
        fullName,
        email,
        phone,
        attendeeCount: attendeeCount || 1,
        notes,
        status,
        registrationDate: new Date()
      })
      .returning();
    
    return res.status(201).json(registration[0]);
  } catch (error) {
    console.error("Error al registrar participante:", error);
    return res.status(500).json({ 
      message: "Error al registrar al participante", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Actualiza el estado de un participante
 */
export async function updateParticipantStatus(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const participantId = parseInt(req.params.participantId);
    const { status, notes } = req.body;
    
    // Validar que los IDs son números válidos
    if (isNaN(eventId) || isNaN(participantId)) {
      return res.status(400).json({ message: "IDs inválidos" });
    }
    
    if (!status) {
      return res.status(400).json({ message: "El estado es obligatorio" });
    }
    
    // Verificar que el participante existe
    const participantExists = await db.select()
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.id, participantId),
        eq(eventRegistrations.eventId, eventId)
      ));
    
    if (!participantExists.length) {
      return res.status(404).json({ message: "El participante no existe en este evento" });
    }
    
    // Actualizar el estado
    const updatedParticipant = await db.update(eventRegistrations)
      .set({ 
        status,
        notes: notes !== undefined ? notes : participantExists[0].notes,
        updatedAt: new Date()
      })
      .where(eq(eventRegistrations.id, participantId))
      .returning();
    
    return res.status(200).json(updatedParticipant[0]);
  } catch (error) {
    console.error("Error al actualizar estado del participante:", error);
    return res.status(500).json({ 
      message: "Error al actualizar el estado del participante", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Elimina un participante de un evento
 */
export async function removeParticipant(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const participantId = parseInt(req.params.participantId);
    
    // Validar que los IDs son números válidos
    if (isNaN(eventId) || isNaN(participantId)) {
      return res.status(400).json({ message: "IDs inválidos" });
    }
    
    // Verificar que el participante existe
    const participantExists = await db.select()
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.id, participantId),
        eq(eventRegistrations.eventId, eventId)
      ));
    
    if (!participantExists.length) {
      return res.status(404).json({ message: "El participante no existe en este evento" });
    }
    
    // Eliminar al participante
    await db.delete(eventRegistrations)
      .where(eq(eventRegistrations.id, participantId));
    
    return res.status(200).json({ message: "Participante eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar participante:", error);
    return res.status(500).json({ 
      message: "Error al eliminar al participante", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Obtiene un resumen de participantes para un evento
 */
export async function getEventParticipantsSummary(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    
    // Verificar que el evento existe
    const eventExists = await db.select().from(events).where(eq(events.id, eventId));
    if (!eventExists.length) {
      return res.status(404).json({ message: "El evento no existe" });
    }
    
    // Obtener los participantes
    const participants = await db.select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
    
    // Calcular estadísticas
    const stats = {
      total: participants.length,
      totalAttendees: participants.reduce((sum, p) => sum + (p.attendeeCount || 1), 0),
      byStatus: {
        registered: participants.filter(p => p.status === "registered").length,
        confirmed: participants.filter(p => p.status === "confirmed").length,
        canceled: participants.filter(p => p.status === "canceled").length,
        attended: participants.filter(p => p.status === "attended").length,
        noShow: participants.filter(p => p.status === "no-show").length,
      },
      capacity: eventExists[0].capacity,
      available: eventExists[0].capacity 
        ? eventExists[0].capacity - participants.reduce((sum, p) => sum + (p.attendeeCount || 1), 0)
        : null
    };
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error al obtener resumen de participantes:", error);
    return res.status(500).json({ 
      message: "Error al obtener el resumen de participantes", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}