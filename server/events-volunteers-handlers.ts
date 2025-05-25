import { Request, Response } from "express";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";
import { eventStaff } from "@shared/events-schema";
import { volunteers } from "@shared/schema";

/**
 * Obtiene todos los voluntarios asignados a un evento
 */
export async function getEventVolunteers(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento no válido" });
    }

    // Obtener asignaciones de voluntarios (staff) para este evento
    const volunteers = await db.query.eventStaff.findMany({
      where: and(
        eq(eventStaff.eventId, eventId),
        isNull(eventStaff.userId) // Solo incluir voluntarios (staff sin userId es voluntario)
      ),
      orderBy: (staff) => [staff.createdAt.desc()]
    });

    // Formatear respuesta para mantener compatibilidad con el frontend
    const formattedVolunteers = volunteers.map(vol => ({
      id: vol.id,
      eventId: vol.eventId,
      volunteerId: vol.volunteerId,
      name: vol.fullName,
      role: vol.role,
      status: vol.status,
      contactInfo: vol.email,
      notes: vol.notes,
      assignedAt: vol.createdAt
    }));

    res.json(formattedVolunteers);
  } catch (error) {
    console.error("Error al obtener voluntarios del evento:", error);
    res.status(500).json({ message: "Error al obtener voluntarios del evento" });
  }
}

/**
 * Asigna un voluntario a un evento
 */
export async function assignVolunteerToEvent(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const { volunteerId, role, notes } = req.body;
    
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento no válido" });
    }

    if (isNaN(parseInt(volunteerId))) {
      return res.status(400).json({ message: "ID de voluntario no válido" });
    }

    // Validar que el voluntario existe
    const volunteer = await db.query.volunteers.findFirst({
      where: eq(volunteers.id, parseInt(volunteerId))
    });

    if (!volunteer) {
      return res.status(404).json({ message: "Voluntario no encontrado" });
    }

    // Verificar si el voluntario ya está asignado a este evento
    const existingAssignment = await db.query.eventStaff.findFirst({
      where: and(
        eq(eventStaff.eventId, eventId),
        eq(eventStaff.volunteerId, parseInt(volunteerId))
      )
    });

    if (existingAssignment) {
      return res.status(400).json({ message: "El voluntario ya está asignado a este evento" });
    }

    // Crear asignación como staff de evento
    const [assignment] = await db
      .insert(eventStaff)
      .values({
        eventId,
        volunteerId: parseInt(volunteerId),
        fullName: volunteer.fullName || "Voluntario",
        email: volunteer.email,
        phone: volunteer.phone,
        role: role || "voluntario",
        status: "assigned", // Valores: assigned, confirmed, cancelled
        notes: notes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Formato de respuesta para mantener compatibilidad con el frontend
    const response = {
      id: assignment.id,
      eventId: assignment.eventId,
      volunteerId: assignment.volunteerId,
      name: assignment.fullName,
      role: assignment.role,
      status: assignment.status,
      contactInfo: assignment.email,
      notes: assignment.notes,
      assignedAt: assignment.createdAt
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error al asignar voluntario al evento:", error);
    res.status(500).json({ message: "Error al asignar voluntario al evento" });
  }
}

/**
 * Actualiza la asignación de un voluntario a un evento
 */
export async function updateVolunteerAssignment(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const assignmentId = parseInt(req.params.assignmentId);
    const { role, status, notes } = req.body;
    
    if (isNaN(eventId) || isNaN(assignmentId)) {
      return res.status(400).json({ message: "ID no válido" });
    }

    // Verificar que la asignación existe
    const existingAssignment = await db.query.eventStaff.findFirst({
      where: and(
        eq(eventStaff.id, assignmentId),
        eq(eventStaff.eventId, eventId)
      )
    });

    if (!existingAssignment) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }

    const [updatedAssignment] = await db
      .update(eventStaff)
      .set({
        role: role || existingAssignment.role,
        status: status || existingAssignment.status,
        notes: notes !== undefined ? notes : existingAssignment.notes,
        updatedAt: new Date()
      })
      .where(eq(eventStaff.id, assignmentId))
      .returning();

    // Formato de respuesta para mantener compatibilidad con el frontend
    const response = {
      id: updatedAssignment.id,
      eventId: updatedAssignment.eventId,
      volunteerId: updatedAssignment.volunteerId,
      name: updatedAssignment.fullName,
      role: updatedAssignment.role,
      status: updatedAssignment.status,
      contactInfo: updatedAssignment.email,
      notes: updatedAssignment.notes,
      assignedAt: updatedAssignment.createdAt
    };

    res.json(response);
  } catch (error) {
    console.error("Error al actualizar asignación del voluntario:", error);
    res.status(500).json({ message: "Error al actualizar asignación del voluntario" });
  }
}

/**
 * Elimina la asignación de un voluntario a un evento
 */
export async function removeVolunteerFromEvent(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const assignmentId = parseInt(req.params.assignmentId);
    
    if (isNaN(eventId) || isNaN(assignmentId)) {
      return res.status(400).json({ message: "ID no válido" });
    }

    // Verificar que la asignación existe
    const existingAssignment = await db.query.eventStaff.findFirst({
      where: and(
        eq(eventStaff.id, assignmentId),
        eq(eventStaff.eventId, eventId)
      )
    });

    if (!existingAssignment) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }

    await db
      .delete(eventStaff)
      .where(eq(eventStaff.id, assignmentId));

    res.json({ message: "Voluntario eliminado del evento correctamente" });
  } catch (error) {
    console.error("Error al eliminar voluntario del evento:", error);
    res.status(500).json({ message: "Error al eliminar voluntario del evento" });
  }
}

/**
 * Obtiene los voluntarios disponibles para asignar a eventos
 */
export async function getAvailableVolunteers(req: Request, res: Response) {
  try {
    const volunteerList = await db.query.volunteers.findMany({
      where: eq(volunteers.status, "active"),
      orderBy: (volunteers) => [volunteers.fullName]
    });

    // Simplificar la respuesta para el frontend
    const simplifiedList = volunteerList.map(volunteer => ({
      id: volunteer.id,
      name: volunteer.fullName
    }));

    res.json(simplifiedList);
  } catch (error) {
    console.error("Error al obtener voluntarios disponibles:", error);
    res.status(500).json({ message: "Error al obtener voluntarios disponibles" });
  }
}