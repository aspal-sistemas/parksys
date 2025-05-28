import { Request, Response, Router } from "express";
import { db } from "./db";
import { events, eventParks, EventTypes, TargetAudiences, EventStatuses } from "@shared/events-schema";
import { eq, and, gte, lte, like, desc, asc } from "drizzle-orm";

/**
 * Registra las rutas relacionadas con el módulo de eventos
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerEventRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todos los eventos con filtros opcionales
  apiRouter.get("/events", async (req: Request, res: Response) => {
    try {
      const { 
        eventType, 
        status, 
        targetAudience, 
        parkId, 
        startDateFrom, 
        startDateTo, 
        search 
      } = req.query;
      
      // Construir consulta con filtros
      let query = db.select().from(events);
      
      if (eventType) {
        query = query.where(eq(events.eventType, eventType as string));
      }
      
      if (status) {
        query = query.where(eq(events.status, status as string));
      }
      
      if (targetAudience) {
        query = query.where(eq(events.targetAudience, targetAudience as string));
      }
      
      if (startDateFrom) {
        query = query.where(gte(events.startDate, new Date(startDateFrom as string)));
      }
      
      if (startDateTo) {
        query = query.where(lte(events.startDate, new Date(startDateTo as string)));
      }
      
      if (search) {
        const searchTerm = `%${search}%`;
        query = query.where(
          like(events.title, searchTerm)
        );
      }
      
      // Ordenar por fecha de inicio descendente
      query = query.orderBy(desc(events.startDate), asc(events.title));
      
      const eventsList = await query;
      
      // Si se solicitó filtrar por parque, hacemos un filtrado adicional
      if (parkId) {
        // Obtener relaciones evento-parque para el parque especificado
        const eventParkRelations = await db
          .select()
          .from(eventParks)
          .where(eq(eventParks.parkId, parseInt(parkId as string)));
        
        // Extraer los IDs de eventos asociados a este parque
        const eventIds = eventParkRelations.map(rel => rel.eventId);
        
        // Filtrar eventos que pertenecen a este parque
        const filteredEvents = eventsList.filter(event => 
          eventIds.includes(event.id)
        );
        
        return res.json(filteredEvents);
      }
      
      return res.json(eventsList);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      return res.status(500).json({ 
        message: "Error al obtener eventos", 
        error: error.message 
      });
    }
  });

  // Obtener un evento por ID
  apiRouter.get("/events/:id", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Obtener evento
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));
      
      if (!event) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
      
      // Obtener parques asociados al evento
      const parkRelations = await db
        .select()
        .from(eventParks)
        .where(eq(eventParks.eventId, eventId));
      
      // Obtener información detallada de los parques
      const parksInfo = [];
      for (const relation of parkRelations) {
        const [parkInfo] = await db.execute(
          `SELECT id, name, municipality_id as "municipalityId", park_type as "parkType" 
           FROM parks WHERE id = $1`, 
          [relation.parkId]
        );
        if (parkInfo.rows && parkInfo.rows.length > 0) {
          parksInfo.push(parkInfo.rows[0]);
        }
      }
      
      // Devolver evento con parques asociados
      return res.json({
        ...event,
        parks: parksInfo
      });
    } catch (error) {
      console.error(`Error al obtener evento ${req.params.id}:`, error);
      return res.status(500).json({ 
        message: "Error al obtener evento", 
        error: error.message 
      });
    }
  });

  // Crear un nuevo evento
  apiRouter.post("/events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventData = req.body;
      
      // Validación básica
      if (!eventData.title || !eventData.startDate) {
        return res.status(400).json({
          message: "Datos incompletos. El título y la fecha de inicio son obligatorios."
        });
      }
      
      // Preparar datos para inserción
      const insertData = {
        title: eventData.title,
        description: eventData.description || null,
        eventType: eventData.eventType || "other",
        targetAudience: eventData.targetAudience || "all",
        status: eventData.status || "draft",
        featuredImageUrl: eventData.featuredImageUrl || null,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        startTime: eventData.startTime || null,
        endTime: eventData.endTime || null,
        isRecurring: eventData.isRecurring || false,
        recurrencePattern: eventData.recurrencePattern || null,
        location: eventData.location || null,
        capacity: eventData.capacity || null,
        registrationType: eventData.registrationType || "free",
        organizerName: eventData.organizerName || null,
        organizerEmail: eventData.organizerEmail || null,
        organizerPhone: eventData.organizerPhone || null,
        geolocation: eventData.geolocation || null,
        createdById: (req as any).user?.id || null
      };
      
      // Insertar evento en la base de datos
      const [createdEvent] = await db.insert(events).values(insertData).returning();
      
      // Si se proporcionaron parques, crear relaciones
      if (eventData.parkIds && Array.isArray(eventData.parkIds) && eventData.parkIds.length > 0) {
        for (const parkId of eventData.parkIds) {
          await db.insert(eventParks).values({
            eventId: createdEvent.id,
            parkId: parseInt(parkId)
          });
        }
        
        // Obtener información de los parques para la respuesta
        const parksInfo = [];
        for (const parkId of eventData.parkIds) {
          const [parkInfo] = await db.execute(
            `SELECT id, name FROM parks WHERE id = $1`, 
            [parkId]
          );
          if (parkInfo.rows && parkInfo.rows.length > 0) {
            parksInfo.push(parkInfo.rows[0]);
          }
        }
        
        createdEvent.parks = parksInfo;
      } else {
        createdEvent.parks = [];
      }
      
      return res.status(201).json(createdEvent);
    } catch (error) {
      console.error("Error al crear evento:", error);
      return res.status(500).json({ 
        message: "Error al crear evento", 
        error: error.message 
      });
    }
  });

  // Actualizar un evento existente
  apiRouter.put("/events/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = req.body;
      
      // Verificar que el evento existe
      const [existingEvent] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));
      
      if (!existingEvent) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
      
      // Preparar datos para actualización
      const updateData: any = {};
      
      // Solo incluir campos proporcionados en la solicitud
      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.eventType !== undefined) updateData.eventType = eventData.eventType;
      if (eventData.targetAudience !== undefined) updateData.targetAudience = eventData.targetAudience;
      if (eventData.status !== undefined) updateData.status = eventData.status;
      if (eventData.featuredImageUrl !== undefined) updateData.featuredImageUrl = eventData.featuredImageUrl;
      if (eventData.startDate !== undefined) updateData.startDate = new Date(eventData.startDate);
      if (eventData.endDate !== undefined) updateData.endDate = eventData.endDate ? new Date(eventData.endDate) : null;
      if (eventData.startTime !== undefined) updateData.startTime = eventData.startTime;
      if (eventData.endTime !== undefined) updateData.endTime = eventData.endTime;
      if (eventData.isRecurring !== undefined) updateData.isRecurring = eventData.isRecurring;
      if (eventData.recurrencePattern !== undefined) updateData.recurrencePattern = eventData.recurrencePattern;
      if (eventData.location !== undefined) updateData.location = eventData.location;
      if (eventData.capacity !== undefined) updateData.capacity = eventData.capacity;
      if (eventData.registrationType !== undefined) updateData.registrationType = eventData.registrationType;
      if (eventData.organizerName !== undefined) updateData.organizerName = eventData.organizerName;
      if (eventData.organizerEmail !== undefined) updateData.organizerEmail = eventData.organizerEmail;
      if (eventData.organizerPhone !== undefined) updateData.organizerPhone = eventData.organizerPhone;
      if (eventData.geolocation !== undefined) updateData.geolocation = eventData.geolocation;
      
      // Actualizar fecha de modificación
      updateData.updatedAt = new Date();
      
      // Actualizar evento en la base de datos
      const [updatedEvent] = await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, eventId))
        .returning();
      
      // Actualizar relaciones con parques si se proporcionaron
      if (eventData.parkIds && Array.isArray(eventData.parkIds)) {
        // Eliminar relaciones existentes
        await db
          .delete(eventParks)
          .where(eq(eventParks.eventId, eventId));
        
        // Crear nuevas relaciones
        for (const parkId of eventData.parkIds) {
          await db.insert(eventParks).values({
            eventId,
            parkId: parseInt(parkId)
          });
        }
        
        // Obtener información de los parques para la respuesta
        const parksInfo = [];
        for (const parkId of eventData.parkIds) {
          const [parkInfo] = await db.execute(
            `SELECT id, name FROM parks WHERE id = $1`, 
            [parkId]
          );
          if (parkInfo.rows && parkInfo.rows.length > 0) {
            parksInfo.push(parkInfo.rows[0]);
          }
        }
        
        updatedEvent.parks = parksInfo;
      }
      
      return res.json(updatedEvent);
    } catch (error) {
      console.error(`Error al actualizar evento ${req.params.id}:`, error);
      return res.status(500).json({ 
        message: "Error al actualizar evento", 
        error: error.message 
      });
    }
  });

  // Eliminar un evento
  apiRouter.delete("/events/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Verificar que el evento existe
      const [existingEvent] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));
      
      if (!existingEvent) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
      
      // Eliminar relaciones de parques primero
      await db
        .delete(eventParks)
        .where(eq(eventParks.eventId, eventId));
      
      // Eliminar el evento
      const [deletedEvent] = await db
        .delete(events)
        .where(eq(events.id, eventId))
        .returning();
      
      return res.json({ 
        message: "Evento eliminado correctamente", 
        event: deletedEvent 
      });
    } catch (error) {
      console.error(`Error al eliminar evento ${req.params.id}:`, error);
      return res.status(500).json({ 
        message: "Error al eliminar evento", 
        error: error.message 
      });
    }
  });

  // Obtener eventos por parque
  apiRouter.get("/parks/:id/events", async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.id);
      
      // Obtener relaciones evento-parque para el parque especificado
      const eventParkRelations = await db
        .select()
        .from(eventParks)
        .where(eq(eventParks.parkId, parkId));
      
      // Extraer los IDs de eventos asociados a este parque
      const eventIds = eventParkRelations.map(rel => rel.eventId);
      
      if (eventIds.length === 0) {
        return res.json([]);
      }
      
      // Obtener todos los eventos asociados a este parque
      const eventsList = [];
      for (const eventId of eventIds) {
        const [event] = await db
          .select()
          .from(events)
          .where(eq(events.id, eventId));
          
        if (event) {
          eventsList.push(event);
        }
      }
      
      return res.json(eventsList);
    } catch (error) {
      console.error(`Error al obtener eventos del parque ${req.params.id}:`, error);
      return res.status(500).json({ 
        message: "Error al obtener eventos del parque", 
        error: error.message 
      });
    }
  });
  
  // Obtener datos de referencia para eventos
  apiRouter.get("/events-reference-data", async (_req: Request, res: Response) => {
    try {
      return res.json({
        eventTypes: EventTypes,
        targetAudiences: TargetAudiences,
        eventStatuses: EventStatuses
      });
    } catch (error) {
      console.error("Error al obtener datos de referencia:", error);
      return res.status(500).json({ 
        message: "Error al obtener datos de referencia", 
        error: error.message 
      });
    }
  });
}