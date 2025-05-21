import { Request, Response, Router } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { insertActivitySchema } from '@shared/schema';
import { storage } from './storage';
import { isAuthenticated } from './middleware/auth';

// Crear un router para las actividades
const activityRouter = Router();

// Obtener todas las actividades
activityRouter.get("/activities", async (_req: Request, res: Response) => {
  try {
    const activities = await storage.getAllActivities();
    
    // Enriquecer con información del parque
    const activitiesWithParkInfo = await Promise.all(
      activities.map(async (activity) => {
        const park = await storage.getPark(activity.parkId);
        return {
          ...activity,
          parkName: park ? park.name : 'Parque no disponible'
        };
      })
    );
    
    res.json(activitiesWithParkInfo);
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    res.status(500).json({ message: "Error al obtener actividades" });
  }
});

// Obtener actividades para un parque específico
activityRouter.get("/parks/:id/activities", async (req: Request, res: Response) => {
  try {
    const parkId = Number(req.params.id);
    const activities = await storage.getParkActivities(parkId);
    res.json(activities);
  } catch (error) {
    console.error("Error al obtener actividades del parque:", error);
    res.status(500).json({ message: "Error al obtener actividades del parque" });
  }
});

// Añadir una actividad a un parque
activityRouter.post("/activities", async (req: Request, res: Response) => {
  try {
    console.log("Datos recibidos para crear actividad:", req.body);
    
    // Extraer los datos
    const { startDate, endDate, parkId, ...otherData } = req.body;
    
    // Convertir las fechas explícitamente a objetos Date
    let parsedStartDate: Date;
    let parsedEndDate: Date | undefined;
    
    try {
      parsedStartDate = new Date(startDate);
      if (endDate) {
        parsedEndDate = new Date(endDate);
      }
    } catch (e) {
      console.error("Error al convertir fechas:", e);
      return res.status(400).json({ message: "Formato de fecha inválido" });
    }
    
    // Verificar que la fecha de inicio es válida
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ message: "La fecha de inicio no es válida" });
    }
    
    // Verificar que la fecha de fin es válida (si existe)
    if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: "La fecha de fin no es válida" });
    }
    
    // Crear el objeto con los datos procesados (solo con campos que existen en la DB)
    const activityData = { 
      ...otherData, 
      parkId: Number(parkId),
      startDate: parsedStartDate,
      endDate: parsedEndDate || null,
      category: otherData.category || null,
      location: otherData.location || null
    };
    
    console.log("Datos procesados para crear actividad:", activityData);
    
    // Crear la actividad directamente sin validar con Zod
    const result = await storage.createActivity(activityData);
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Error al crear actividad:", error);
    res.status(500).json({ message: "Error al crear actividad" });
  }
});

// Actualizar una actividad existente
activityRouter.put("/activities/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const activityId = Number(req.params.id);
    
    console.log("Headers recibidos en actualizar actividad:", req.headers);
    console.log("Datos recibidos para actualizar actividad:", req.body);
    
    // Verificar si la actividad existe
    const existingActivity = await storage.getActivity(activityId);
    if (!existingActivity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    
    // Extraer los datos
    const { startDate, endDate, ...otherData } = req.body;
    
    // Convertir las fechas explícitamente a objetos Date
    let parsedStartDate: Date;
    let parsedEndDate: Date | undefined;
    
    try {
      parsedStartDate = new Date(startDate);
      if (endDate) {
        parsedEndDate = new Date(endDate);
      }
    } catch (e) {
      console.error("Error al convertir fechas:", e);
      return res.status(400).json({ message: "Formato de fecha inválido" });
    }
    
    // Verificar que la fecha de inicio es válida
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ message: "La fecha de inicio no es válida" });
    }
    
    // Verificar que la fecha de fin es válida (si existe)
    if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: "La fecha de fin no es válida" });
    }
    
    // Crear el objeto con los datos procesados
    const activityData = { 
      ...otherData,
      startDate: parsedStartDate,
      ...(parsedEndDate && { endDate: parsedEndDate })
    };
    
    console.log("Datos procesados para actualización:", activityData);
    
    const result = await storage.updateActivity(activityId, activityData);
    
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      console.error("Error de validación Zod:", validationError);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error al actualizar actividad:", error);
    res.status(500).json({ message: "Error al actualizar actividad" });
  }
});

// Eliminar una actividad
activityRouter.delete("/activities/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const activityId = Number(req.params.id);
    console.log("Eliminando actividad con ID:", activityId);
    console.log("Headers recibidos:", req.headers);
    
    // Verificar si la actividad existe
    const existingActivity = await storage.getActivity(activityId);
    if (!existingActivity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    
    // Eliminar la actividad
    const result = await storage.deleteActivity(activityId);
    
    if (result) {
      res.status(200).json({ success: true, message: "Actividad eliminada correctamente" });
    } else {
      res.status(500).json({ success: false, message: "Error al eliminar la actividad" });
    }
  } catch (error) {
    console.error("Error al eliminar actividad:", error);
    res.status(500).json({ message: "Error al eliminar actividad" });
  }
});

export { activityRouter };