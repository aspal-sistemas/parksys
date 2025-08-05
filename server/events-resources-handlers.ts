import { Request, Response } from "express";
import { db } from "./db";
import { eventResources, events } from "@shared/events-schema";
import { eq, and } from "drizzle-orm";

/**
 * Obtiene todos los recursos asignados a un evento
 */
export async function getEventResources(req: Request, res: Response) {
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
    
    // Obtener los recursos
    const resources = await db.select()
      .from(eventResources)
      .where(eq(eventResources.eventId, eventId))
      .orderBy(eventResources.resourceType, eventResources.resourceName);
    
    return res.status(200).json(resources);
  } catch (error) {
    console.error("Error al obtener recursos:", error);
    return res.status(500).json({ 
      message: "Error al obtener los recursos del evento", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Obtiene un recurso específico
 */
export async function getEventResource(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const resourceId = parseInt(req.params.resourceId);
    
    // Obtener el recurso
    const [resource] = await db.select()
      .from(eventResources)
      .where(
        and(
          eq(eventResources.id, resourceId),
          eq(eventResources.eventId, eventId)
        )
      );
    
    if (!resource) {
      return res.status(404).json({ message: "El recurso no existe en este evento" });
    }
    
    return res.status(200).json(resource);
  } catch (error) {
    console.error("Error al obtener recurso:", error);
    return res.status(500).json({ 
      message: "Error al obtener el recurso del evento", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Asigna un recurso a un evento
 */
export async function assignResourceToEvent(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const { 
      resourceType, 
      resourceId,
      resourceName, 
      quantity = 1,
      notes,
      status = "pending" 
    } = req.body;
    
    if (!resourceType || !resourceName) {
      return res.status(400).json({ 
        message: "El tipo y nombre del recurso son obligatorios" 
      });
    }
    
    // Verificar que el evento existe
    const eventExists = await db.select().from(events).where(eq(events.id, eventId));
    if (!eventExists.length) {
      return res.status(404).json({ message: "El evento no existe" });
    }
    
    // Verificar si ya existe un recurso con el mismo tipo y nombre
    if (resourceId) {
      const existingResources = await db.select()
        .from(eventResources)
        .where(
          and(
            eq(eventResources.eventId, eventId),
            eq(eventResources.resourceType, resourceType),
            eq(eventResources.resourceId, resourceId)
          )
        );
      
      if (existingResources.length > 0) {
        return res.status(400).json({ 
          message: "Este recurso ya está asignado al evento" 
        });
      }
    }
    
    // Asignar el recurso
    const [resource] = await db.insert(eventResources)
      .values({
        eventId,
        resourceType,
        resourceId: resourceId || null,
        resourceName,
        quantity,
        notes,
        status
      })
      .returning();
    
    return res.status(201).json(resource);
  } catch (error) {
    console.error("Error al asignar recurso:", error);
    return res.status(500).json({ 
      message: "Error al asignar el recurso al evento", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Actualiza un recurso asignado a un evento
 */
export async function updateEventResource(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const resourceId = parseInt(req.params.resourceId);
    const { 
      resourceName, 
      quantity,
      notes,
      status 
    } = req.body;
    
    // Verificar que el recurso existe
    const [existingResource] = await db.select()
      .from(eventResources)
      .where(
        and(
          eq(eventResources.id, resourceId),
          eq(eventResources.eventId, eventId)
        )
      );
    
    if (!existingResource) {
      return res.status(404).json({ message: "El recurso no existe en este evento" });
    }
    
    // Actualizar el recurso
    const [updatedResource] = await db.update(eventResources)
      .set({
        resourceName: resourceName !== undefined ? resourceName : existingResource.resourceName,
        quantity: quantity !== undefined ? quantity : existingResource.quantity,
        notes: notes !== undefined ? notes : existingResource.notes,
        status: status !== undefined ? status : existingResource.status,
        updatedAt: new Date()
      })
      .where(eq(eventResources.id, resourceId))
      .returning();
    
    return res.status(200).json(updatedResource);
  } catch (error) {
    console.error("Error al actualizar recurso:", error);
    return res.status(500).json({ 
      message: "Error al actualizar el recurso del evento", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Elimina un recurso asignado a un evento
 */
export async function removeEventResource(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const resourceId = parseInt(req.params.resourceId);
    
    // Verificar que el recurso existe
    const [existingResource] = await db.select()
      .from(eventResources)
      .where(
        and(
          eq(eventResources.id, resourceId),
          eq(eventResources.eventId, eventId)
        )
      );
    
    if (!existingResource) {
      return res.status(404).json({ message: "El recurso no existe en este evento" });
    }
    
    // Eliminar el recurso
    await db.delete(eventResources)
      .where(eq(eventResources.id, resourceId));
    
    return res.status(200).json({ message: "Recurso eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar recurso:", error);
    return res.status(500).json({ 
      message: "Error al eliminar el recurso del evento", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Actualiza el estado de un recurso
 */
export async function updateResourceStatus(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    const resourceId = parseInt(req.params.resourceId);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "El estado es obligatorio" });
    }
    
    // Verificar que el recurso existe
    const [existingResource] = await db.select()
      .from(eventResources)
      .where(
        and(
          eq(eventResources.id, resourceId),
          eq(eventResources.eventId, eventId)
        )
      );
    
    if (!existingResource) {
      return res.status(404).json({ message: "El recurso no existe en este evento" });
    }
    
    // Actualizar el estado
    const [updatedResource] = await db.update(eventResources)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(eventResources.id, resourceId))
      .returning();
    
    return res.status(200).json(updatedResource);
  } catch (error) {
    console.error("Error al actualizar estado del recurso:", error);
    return res.status(500).json({ 
      message: "Error al actualizar el estado del recurso", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Obtiene un resumen de recursos para un evento
 */
export async function getEventResourcesSummary(req: Request, res: Response) {
  try {
    const eventId = parseInt(req.params.id);
    
    // Verificar que el evento existe
    const eventExists = await db.select().from(events).where(eq(events.id, eventId));
    if (!eventExists.length) {
      return res.status(404).json({ message: "El evento no existe" });
    }
    
    // Obtener los recursos
    const resources = await db.select()
      .from(eventResources)
      .where(eq(eventResources.eventId, eventId));
    
    // Calcular estadísticas
    const summary = {
      total: resources.length,
      byType: {} as Record<string, number>,
      byStatus: {
        pending: resources.filter(r => r.status === "pending").length,
        confirmed: resources.filter(r => r.status === "confirmed").length,
        rejected: resources.filter(r => r.status === "rejected").length,
      }
    };
    
    // Agrupar por tipo de recurso
    resources.forEach(resource => {
      const type = resource.resourceType;
      if (!summary.byType[type]) {
        summary.byType[type] = 0;
      }
      summary.byType[type]++;
    });
    
    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error al obtener resumen de recursos:", error);
    return res.status(500).json({ 
      message: "Error al obtener el resumen de recursos", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}