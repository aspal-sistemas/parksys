import { Request, Response } from "express";
import { storage } from "./storage";
import { 
  insertVolunteerSchema,
  insertVolunteerParticipationSchema,
  insertVolunteerEvaluationSchema,
  insertVolunteerRecognitionSchema
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { volunteers, volunteerParticipations, volunteerEvaluations, volunteerRecognitions } from "@shared/schema";

/**
 * Función que registra las rutas relacionadas con el módulo de voluntariado
 */
export function registerVolunteerRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  
  // === RUTAS PARA VOLUNTARIOS ===
  
  // Obtener todos los voluntarios
  apiRouter.get("/volunteers", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const allVolunteers = await storage.getAllVolunteers();
      res.json(allVolunteers);
    } catch (error) {
      console.error("Error al obtener voluntarios:", error);
      res.status(500).json({ message: "Error al obtener voluntarios" });
    }
  });

  // Obtener un voluntario específico
  apiRouter.get("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const volunteer = await storage.getVolunteerById(volunteerId);
      
      if (!volunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      res.json(volunteer);
    } catch (error) {
      console.error(`Error al obtener voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener datos del voluntario" });
    }
  });

  // Crear nuevo voluntario
  apiRouter.post("/volunteers", async (req: Request, res: Response) => {
    try {
      const validationResult = insertVolunteerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de voluntario no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const newVolunteer = await storage.createVolunteer(validationResult.data);
      res.status(201).json(newVolunteer);
    } catch (error) {
      console.error("Error al crear voluntario:", error);
      res.status(500).json({ message: "Error al crear voluntario" });
    }
  });

  // Actualizar voluntario
  apiRouter.put("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const existingVolunteer = await storage.getVolunteerById(volunteerId);
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Combinamos los datos existentes con los nuevos
      const updatedData = {
        ...existingVolunteer,
        ...req.body,
        id: volunteerId,
      };
      
      // Validamos los datos actualizados
      const validationResult = insertVolunteerSchema.safeParse(updatedData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de voluntario no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const updatedVolunteer = await storage.updateVolunteer(volunteerId, validationResult.data);
      res.json(updatedVolunteer);
    } catch (error) {
      console.error(`Error al actualizar voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar voluntario" });
    }
  });

  // Cambiar estado de voluntario (activar/desactivar)
  apiRouter.patch("/volunteers/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const { status } = req.body;
      
      if (!status || !["active", "inactive", "suspended"].includes(status)) {
        return res.status(400).json({ message: "Estado no válido. Debe ser 'active', 'inactive' o 'suspended'" });
      }
      
      const existingVolunteer = await storage.getVolunteerById(volunteerId);
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      const updatedVolunteer = await storage.updateVolunteerStatus(volunteerId, status);
      res.json(updatedVolunteer);
    } catch (error) {
      console.error(`Error al actualizar estado del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al actualizar estado del voluntario" });
    }
  });

  // Eliminar voluntario (soft delete cambiando estado a "inactive")
  apiRouter.delete("/volunteers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const existingVolunteer = await storage.getVolunteerById(volunteerId);
      
      if (!existingVolunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      await storage.updateVolunteerStatus(volunteerId, "inactive");
      res.json({ message: "Voluntario inactivado correctamente" });
    } catch (error) {
      console.error(`Error al eliminar voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al eliminar voluntario" });
    }
  });

  // === RUTAS PARA PARTICIPACIONES ===

  // Obtener participaciones de un voluntario
  apiRouter.get("/volunteers/:id/participations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const participations = await storage.getVolunteerParticipations(volunteerId);
      res.json(participations);
    } catch (error) {
      console.error(`Error al obtener participaciones del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener participaciones" });
    }
  });

  // Registrar nueva participación
  apiRouter.post("/volunteers/:id/participations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Aseguramos que el volunteerId en el cuerpo coincida con el de la URL
      const participationData = {
        ...req.body,
        volunteerId
      };
      
      const validationResult = insertVolunteerParticipationSchema.safeParse(participationData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de participación no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const newParticipation = await storage.createVolunteerParticipation(validationResult.data);
      res.status(201).json(newParticipation);
    } catch (error) {
      console.error(`Error al crear participación para voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al registrar participación" });
    }
  });

  // === RUTAS PARA EVALUACIONES ===

  // Obtener evaluaciones de un voluntario
  apiRouter.get("/volunteers/:id/evaluations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const evaluations = await storage.getVolunteerEvaluations(volunteerId);
      res.json(evaluations);
    } catch (error) {
      console.error(`Error al obtener evaluaciones del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener evaluaciones" });
    }
  });

  // Crear evaluación para una participación
  apiRouter.post("/participations/:id/evaluations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const participationId = parseInt(req.params.id);
      
      if (isNaN(participationId)) {
        return res.status(400).json({ message: "ID de participación no válido" });
      }
      
      // Verificar que existe la participación
      const participation = await storage.getParticipationById(participationId);
      
      if (!participation) {
        return res.status(404).json({ message: "Participación no encontrada" });
      }
      
      // Aseguramos que el participationId coincida con el de la URL
      const evaluationData = {
        ...req.body,
        participationId,
        // Tomamos el ID del voluntario de la participación
        volunteerId: participation.volunteerId,
        // El evaluador es el usuario autenticado
        evaluatorId: req.user.id || req.body.evaluatorId,
      };
      
      const validationResult = insertVolunteerEvaluationSchema.safeParse(evaluationData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de evaluación no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const newEvaluation = await storage.createVolunteerEvaluation(validationResult.data);
      res.status(201).json(newEvaluation);
    } catch (error) {
      console.error(`Error al crear evaluación para participación ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al registrar evaluación" });
    }
  });

  // === RUTAS PARA RECONOCIMIENTOS ===

  // Obtener reconocimientos de un voluntario
  apiRouter.get("/volunteers/:id/recognitions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      const recognitions = await storage.getVolunteerRecognitions(volunteerId);
      res.json(recognitions);
    } catch (error) {
      console.error(`Error al obtener reconocimientos del voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al obtener reconocimientos" });
    }
  });

  // Crear reconocimiento para un voluntario
  apiRouter.post("/volunteers/:id/recognitions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      if (isNaN(volunteerId)) {
        return res.status(400).json({ message: "ID de voluntario no válido" });
      }
      
      // Verificar que existe el voluntario
      const volunteer = await storage.getVolunteerById(volunteerId);
      
      if (!volunteer) {
        return res.status(404).json({ message: "Voluntario no encontrado" });
      }
      
      // Aseguramos que el volunteerId coincida con el de la URL
      const recognitionData = {
        ...req.body,
        volunteerId,
        // El emisor es el usuario autenticado
        issuedById: req.user.id || req.body.issuedById,
      };
      
      const validationResult = insertVolunteerRecognitionSchema.safeParse(recognitionData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Datos de reconocimiento no válidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const newRecognition = await storage.createVolunteerRecognition(validationResult.data);
      res.status(201).json(newRecognition);
    } catch (error) {
      console.error(`Error al crear reconocimiento para voluntario ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al registrar reconocimiento" });
    }
  });

  // Ruta para dashboard/estadísticas de voluntariado
  apiRouter.get("/volunteers/stats/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Obtener estadísticas de voluntariado
      const totalActiveVolunteers = await storage.countVolunteersByStatus("active");
      const totalHours = await storage.getTotalVolunteerHours();
      const topVolunteers = await storage.getTopVolunteers(5); // Top 5 voluntarios por horas
      const recentActivities = await storage.getRecentVolunteerActivities(5); // 5 actividades recientes

      res.json({
        totalActiveVolunteers,
        totalHours,
        topVolunteers,
        recentActivities
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de voluntariado:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de voluntariado" });
    }
  });
}