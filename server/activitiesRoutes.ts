import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { sql, eq } from 'drizzle-orm';
import { insertActivitySchema, activityCategories, insertActivityCategorySchema, activities } from '@shared/schema';
import { storage } from './storage';
import { db } from './db';

// Controladores para gestión de actividades
export function registerActivityRoutes(app: any, apiRouter: any, isAuthenticated: any, hasParkAccess: any) {
  // Obtener todas las categorías de actividades
  apiRouter.get("/activity-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(activityCategories).orderBy(activityCategories.sortOrder);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de actividades:", error);
      res.status(500).json({ message: "Error al obtener categorías de actividades" });
    }
  });

  // Crear nueva categoría de actividad
  apiRouter.post("/activity-categories", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const categoryData = insertActivityCategorySchema.parse(req.body);
      const [newCategory] = await db.insert(activityCategories).values(categoryData).returning();
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al crear categoría:", error);
      res.status(500).json({ message: "Error al crear categoría de actividad" });
    }
  });

  // Actualizar categoría de actividad
  apiRouter.put("/activity-categories/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const categoryId = Number(req.params.id);
      const categoryData = insertActivityCategorySchema.parse(req.body);
      
      const [updatedCategory] = await db
        .update(activityCategories)
        .set({ ...categoryData, updatedAt: new Date() })
        .where(sql`${activityCategories.id} = ${categoryId}`)
        .returning();

      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }

      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al actualizar categoría:", error);
      res.status(500).json({ message: "Error al actualizar categoría de actividad" });
    }
  });

  // Eliminar categoría de actividad
  apiRouter.delete("/activity-categories/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const categoryId = Number(req.params.id);

      // Verificar si hay actividades usando esta categoría
      const activitiesUsingCategory = await db
        .select()
        .from(activities)
        .where(eq(activities.categoryId, categoryId))
        .limit(1);

      if (activitiesUsingCategory.length > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar la categoría porque tiene actividades asociadas" 
        });
      }

      const [deletedCategory] = await db
        .delete(activityCategories)
        .where(eq(activityCategories.id, categoryId))
        .returning();

      if (!deletedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }

      res.json({ message: "Categoría eliminada exitosamente" });
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      res.status(500).json({ message: "Error al eliminar categoría de actividad" });
    }
  });

  // Obtener todas las actividades
  apiRouter.get("/activities", async (_req: Request, res: Response) => {
    try {
      // Usar consulta SQL directa para incluir categorías y parques
      const result = await db.execute(
        sql`SELECT a.id, a.park_id as "parkId", a.title, a.description, 
                 a.start_date as "startDate", a.end_date as "endDate", 
                 a.category, a.location, a.capacity, a.category_id as "categoryId",
                 a.created_at as "createdAt",
                 p.name as "parkName",
                 ac.name as "categoryName"
             FROM activities a
             LEFT JOIN parks p ON a.park_id = p.id
             LEFT JOIN activity_categories ac ON a.category_id = ac.id
             ORDER BY a.start_date DESC`
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener actividades:", error);
      res.status(500).json({ message: "Error al obtener actividades" });
    }
  });

  // Obtener actividades para un parque específico
  apiRouter.get("/parks/:id/activities", async (req: Request, res: Response) => {
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
  apiRouter.post("/parks/:id/activities", isAuthenticated, hasParkAccess, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      console.log("Headers recibidos:", req.headers);
      console.log("Datos recibidos para crear actividad:", req.body);
      
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
        parkId,
        startDate: parsedStartDate,
        ...(parsedEndDate && { endDate: parsedEndDate })
      };
      
      console.log("Datos procesados para crear actividad:", activityData);
      
      const data = insertActivitySchema.parse(activityData);
      const result = await storage.createActivity(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Error de validación Zod:", error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al crear actividad:", error);
      res.status(500).json({ message: "Error al crear actividad" });
    }
  });

  // Actualizar una actividad existente
  apiRouter.put("/activities/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const activityId = Number(req.params.id);
      
      console.log("Headers recibidos:", req.headers);
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
      
      console.log("Datos procesados para actualizar actividad:", activityData);
      
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
  apiRouter.delete("/activities/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const activityId = Number(req.params.id);
      
      console.log("Headers recibidos:", req.headers);
      console.log("Eliminando actividad con ID:", activityId);
      
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
}