import { Request, Response } from "express";
import { db } from "./db";
import { 
  events, 
  eventParks, 
  eventResources, 
  eventRegistrations,
  eventStaff,
  eventEvaluations,
  insertEventSchema 
} from "../shared/events-schema";
import { parks } from "../shared/schema";
import { eq, and, desc, gte, sql, inArray } from "drizzle-orm";
import { z } from "zod";

// Esquema de validación para registro de participantes
const registerParticipantSchema = z.object({
  name: z.string().min(3, "El nombre es requerido y debe tener al menos 3 caracteres"),
  email: z.string().email("Debe proporcionar un email válido"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

// Obtener todos los eventos con filtros opcionales
export async function getAllEvents(req: Request, res: Response) {
  try {
    const { status, type, park, search, upcoming } = req.query;
    
    let query = db.select().from(events);
    
    // Aplicar filtros si están presentes
    if (status) {
      query = query.where(eq(events.status, status as string));
    }
    
    if (type) {
      query = query.where(eq(events.eventType, type as string));
    }
    
    // Para filtrar por parque, necesitamos un join con la tabla de relación
    if (park) {
      const parkId = parseInt(park as string);
      
      // Primero obtenemos los IDs de los eventos relacionados con este parque
      const eventIds = await db
        .select({ eventId: eventParks.eventId })
        .from(eventParks)
        .where(eq(eventParks.parkId, parkId));
      
      if (eventIds.length > 0) {
        const ids = eventIds.map(item => item.eventId);
        query = query.where(inArray(events.id, ids));
      } else {
        // Si no hay eventos en este parque, devolvemos array vacío
        return res.json([]);
      }
    }
    
    // Filtrar por búsqueda en título o descripción
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        sql`(${events.title} ILIKE ${searchTerm} OR ${events.description} ILIKE ${searchTerm})`
      );
    }
    
    // Filtrar solo eventos futuros
    if (upcoming === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.where(gte(events.startDate, today));
    }
    
    // Ordenar por fecha de inicio descendente
    query = query.orderBy(desc(events.startDate));
    
    const allEvents = await query;
    
    // Si la consulta incluye eventos con parques, obtenemos la información de parques
    if (allEvents.length > 0) {
      const eventsWithParks = await Promise.all(
        allEvents.map(async (event) => {
          // Obtener los parques relacionados con este evento
          const eventParkRelations = await db
            .select({
              parkId: eventParks.parkId
            })
            .from(eventParks)
            .where(eq(eventParks.eventId, event.id));
          
          // Obtener los detalles de los parques
          const parkIds = eventParkRelations.map(rel => rel.parkId);
          
          const parkDetails = parkIds.length > 0 
            ? await db
                .select({
                  id: parks.id,
                  name: parks.name,
                  address: parks.address
                })
                .from(parks)
                .where(inArray(parks.id, parkIds))
            : [];
          
          return {
            ...event,
            parks: parkDetails
          };
        })
      );
      
      return res.json(eventsWithParks);
    }
    
    return res.json(allEvents);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return res.status(500).json({ message: "Error al obtener eventos", error });
  }
}

// Obtener un evento por ID
export async function getEventById(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }
    
    // Obtener el evento
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    
    // Obtener los parques relacionados
    const eventParkRelations = await db
      .select({
        parkId: eventParks.parkId
      })
      .from(eventParks)
      .where(eq(eventParks.eventId, eventId));
    
    // Obtener los detalles de los parques
    const parkIds = eventParkRelations.map(rel => rel.parkId);
    
    const parkDetails = parkIds.length > 0 
      ? await db
          .select({
            id: parks.id,
            name: parks.name,
            address: parks.address
          })
          .from(parks)
          .where(inArray(parks.id, parkIds))
      : [];
    
    // Obtener recursos asignados al evento
    const resources = await db
      .select()
      .from(eventResources)
      .where(eq(eventResources.eventId, eventId));
    
    // Obtener registros de participantes
    const registrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
    
    // Obtener personal y voluntarios asignados
    const staff = await db
      .select()
      .from(eventStaff)
      .where(eq(eventStaff.eventId, eventId));
    
    // Obtener evaluaciones del evento
    const evaluations = await db
      .select()
      .from(eventEvaluations)
      .where(eq(eventEvaluations.eventId, eventId));
    
    // Devolver el evento con toda su información relacionada
    return res.json({
      ...event,
      parks: parkDetails,
      resources,
      registrations,
      staff,
      evaluations
    });
  } catch (error) {
    console.error("Error al obtener evento:", error);
    return res.status(500).json({ message: "Error al obtener evento", error });
  }
}

// Crear un nuevo evento
export async function createEvent(req: Request, res: Response) {
  try {
    // Validar los datos de entrada
    const validationResult = insertEventSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Datos inválidos", 
        errors: validationResult.error.errors 
      });
    }
    
    const { parkIds, ...eventData } = req.body;
    
    // Asegurarse de que hay al menos un parque seleccionado
    if (!parkIds || !Array.isArray(parkIds) || parkIds.length === 0) {
      return res.status(400).json({ 
        message: "Debes seleccionar al menos un parque" 
      });
    }
    
    // Añadir createdById si está disponible
    let createdById = null;
    if (req.headers["x-user-id"]) {
      createdById = parseInt(req.headers["x-user-id"] as string);
    }
    
    // Insertar el evento
    const [createdEvent] = await db
      .insert(events)
      .values({
        ...eventData,
        createdById,
        // Convertir fechas de string a Date si vienen como string
        startDate: eventData.startDate instanceof Date 
          ? eventData.startDate 
          : new Date(eventData.startDate),
        endDate: eventData.endDate instanceof Date 
          ? eventData.endDate 
          : eventData.endDate ? new Date(eventData.endDate) : null,
      })
      .returning();
    
    // Relacionar el evento con los parques seleccionados
    const eventParkValues = parkIds.map((parkId: string) => ({
      eventId: createdEvent.id,
      parkId: parseInt(parkId),
    }));
    
    if (eventParkValues.length > 0) {
      await db
        .insert(eventParks)
        .values(eventParkValues);
    }
    
    return res.status(201).json(createdEvent);
  } catch (error) {
    console.error("Error al crear evento:", error);
    return res.status(500).json({ message: "Error al crear evento", error });
  }
}

// Actualizar un evento existente
export async function updateEvent(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }
    
    // Verificar que el evento existe
    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    
    if (!existingEvent) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    
    // Validar los datos de entrada
    const validationResult = insertEventSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Datos inválidos", 
        errors: validationResult.error.errors 
      });
    }
    
    const { parkIds, ...eventData } = req.body;
    
    // Asegurarse de que hay al menos un parque seleccionado
    if (!parkIds || !Array.isArray(parkIds) || parkIds.length === 0) {
      return res.status(400).json({ 
        message: "Debes seleccionar al menos un parque" 
      });
    }
    
    // Actualizar el evento
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...eventData,
        // Convertir fechas de string a Date si vienen como string
        startDate: eventData.startDate instanceof Date 
          ? eventData.startDate 
          : new Date(eventData.startDate),
        endDate: eventData.endDate instanceof Date 
          ? eventData.endDate 
          : eventData.endDate ? new Date(eventData.endDate) : null,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId))
      .returning();
    
    // Actualizar las relaciones con parques (eliminar las existentes y crear nuevas)
    await db
      .delete(eventParks)
      .where(eq(eventParks.eventId, eventId));
    
    const eventParkValues = parkIds.map((parkId: string) => ({
      eventId: eventId,
      parkId: parseInt(parkId),
    }));
    
    if (eventParkValues.length > 0) {
      await db
        .insert(eventParks)
        .values(eventParkValues);
    }
    
    return res.json(updatedEvent);
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return res.status(500).json({ message: "Error al actualizar evento", error });
  }
}

// Eliminar un evento
export async function deleteEvent(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }
    
    // Verificar que el evento existe
    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    
    if (!existingEvent) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    
    // Eliminar el evento (las relaciones se eliminarán en cascada gracias a las referencias)
    await db
      .delete(events)
      .where(eq(events.id, eventId));
    
    return res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    return res.status(500).json({ message: "Error al eliminar evento", error });
  }
}

// Obtener eventos de un parque específico
export async function getParkEvents(req: Request, res: Response) {
  try {
    const parkId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(parkId)) {
      return res.status(400).json({ message: "ID de parque inválido" });
    }
    
    // Primero obtenemos los IDs de los eventos relacionados con este parque
    const eventIds = await db
      .select({ eventId: eventParks.eventId })
      .from(eventParks)
      .where(eq(eventParks.parkId, parkId));
    
    if (eventIds.length === 0) {
      return res.json([]);
    }
    
    const ids = eventIds.map(item => item.eventId);
    
    // Obtenemos los eventos
    const parkEvents = await db
      .select()
      .from(events)
      .where(inArray(events.id, ids))
      .orderBy(desc(events.startDate));
    
    return res.json(parkEvents);
  } catch (error) {
    console.error("Error al obtener eventos del parque:", error);
    return res.status(500).json({ message: "Error al obtener eventos del parque", error });
  }
}

// Obtener datos de referencia para eventos (tipos, audiencias, estados)
export async function getEventReferenceData(req: Request, res: Response) {
  try {
    // Estos datos podrían venir de la base de datos en un entorno de producción
    const referenceData = {
      eventTypes: ["sports", "cultural", "environmental", "social", "educational", "recreational", "health", "other"],
      targetAudiences: ["children", "youth", "adults", "seniors", "families", "all"],
      eventStatuses: ["draft", "published", "canceled", "postponed", "completed"],
      registrationTypes: ["free", "registration", "paid"]
    };
    
    return res.json(referenceData);
  } catch (error) {
    console.error("Error al obtener datos de referencia:", error);
    return res.status(500).json({ message: "Error al obtener datos de referencia", error });
  }
}

// Obtener participantes de un evento
export async function getEventParticipants(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }
    
    // Verificar que el evento existe
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    
    // Obtener los participantes
    const participants = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.registrationDate));
    
    // Mapear los datos para ajustarlos al formato esperado por el frontend
    const formattedParticipants = participants.map(p => ({
      id: p.id,
      eventId: p.eventId,
      name: p.fullName,
      email: p.email,
      phone: p.phone,
      status: p.status,
      notes: p.notes,
      registrationDate: p.registrationDate,
    }));
    
    return res.json(formattedParticipants);
  } catch (error) {
    console.error("Error al obtener participantes:", error);
    return res.status(500).json({ message: "Error al obtener participantes", error });
  }
}

// Registrar un nuevo participante en un evento
export async function registerParticipant(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }
    
    // Verificar que el evento existe
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    
    // Validar datos del formulario
    const validationResult = registerParticipantSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Datos inválidos", 
        errors: validationResult.error.errors 
      });
    }
    
    const { name, email, phone, notes } = req.body;
    
    // Verificar si ya existe un registro con el mismo email para este evento
    if (email) {
      const existingRegistration = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.email, email)
          )
        );
      
      if (existingRegistration.length > 0) {
        return res.status(409).json({ 
          message: "Este email ya está registrado para este evento" 
        });
      }
    }
    
    // Verificar capacidad del evento
    if (event.capacity) {
      const currentParticipants = await db
        .select({ count: sql<number>`count(*)` })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));
      
      const count = Number(currentParticipants[0].count);
      
      if (count >= event.capacity) {
        return res.status(409).json({ 
          message: "El evento ha alcanzado su capacidad máxima" 
        });
      }
    }
    
    // Registrar al participante
    const [registration] = await db
      .insert(eventRegistrations)
      .values({
        eventId,
        fullName: name,
        email,
        phone: phone || null,
        notes: notes || null,
        status: "registered",
        registrationDate: new Date(),
      })
      .returning();
    
    // Mapear los datos para ajustarlos al formato esperado por el frontend
    const formattedRegistration = {
      id: registration.id,
      eventId: registration.eventId,
      name: registration.fullName,
      email: registration.email,
      phone: registration.phone,
      status: registration.status,
      notes: registration.notes,
      registrationDate: registration.registrationDate,
    };
    
    return res.status(201).json(formattedRegistration);
  } catch (error) {
    console.error("Error al registrar participante:", error);
    return res.status(500).json({ message: "Error al registrar participante", error });
  }
}

// Actualizar estado de un participante
export async function updateParticipantStatus(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.eventId);
    const participantId = parseInt(req.params.id);
    const { status } = req.body;
    
    // Validar que los IDs sean números válidos
    if (isNaN(eventId) || isNaN(participantId)) {
      return res.status(400).json({ message: "IDs inválidos" });
    }
    
    // Validar el estado
    if (!["registered", "confirmed", "attended", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }
    
    // Verificar que el registro existe
    const [existingRegistration] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.id, participantId),
          eq(eventRegistrations.eventId, eventId)
        )
      );
    
    if (!existingRegistration) {
      return res.status(404).json({ message: "Registro de participante no encontrado" });
    }
    
    // Actualizar el estado
    const [updatedRegistration] = await db
      .update(eventRegistrations)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(eventRegistrations.id, participantId))
      .returning();
    
    // Mapear los datos para ajustarlos al formato esperado por el frontend
    const formattedRegistration = {
      id: updatedRegistration.id,
      eventId: updatedRegistration.eventId,
      name: updatedRegistration.fullName,
      email: updatedRegistration.email,
      phone: updatedRegistration.phone,
      status: updatedRegistration.status,
      notes: updatedRegistration.notes,
      registrationDate: updatedRegistration.registrationDate,
    };
    
    return res.json(formattedRegistration);
  } catch (error) {
    console.error("Error al actualizar estado del participante:", error);
    return res.status(500).json({ message: "Error al actualizar estado del participante", error });
  }
}