/**
 * Rutas específicas para actualizar campos individuales del perfil de voluntario
 */
import { Router, Request, Response } from 'express';
import { 
  updateVolunteerExperience, 
  updateVolunteerAvailability,
  updateVolunteerDays,
  updateVolunteerInterests
} from './update-volunteer-fields';

const volunteerFieldRouter = Router();

// Ruta para actualizar experiencia previa
volunteerFieldRouter.post("/experience/:id", async (req: Request, res: Response) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const { experience } = req.body;
    
    if (!experience) {
      return res.status(400).json({ 
        success: false, 
        message: "Experiencia es requerida" 
      });
    }
    
    const success = await updateVolunteerExperience(volunteerId, experience);
    
    if (success) {
      return res.json({ 
        success: true, 
        message: "Experiencia actualizada correctamente" 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: "No se pudo actualizar la experiencia. Voluntario no encontrado." 
      });
    }
  } catch (error) {
    console.error("Error en ruta de actualización de experiencia:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error al actualizar la experiencia" 
    });
  }
});

// Ruta para actualizar disponibilidad
volunteerFieldRouter.post("/availability/:id", async (req: Request, res: Response) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const { availability } = req.body;
    
    if (!availability) {
      return res.status(400).json({ 
        success: false, 
        message: "Disponibilidad es requerida" 
      });
    }
    
    const success = await updateVolunteerAvailability(volunteerId, availability);
    
    if (success) {
      return res.json({ 
        success: true, 
        message: "Disponibilidad actualizada correctamente" 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: "No se pudo actualizar la disponibilidad. Voluntario no encontrado." 
      });
    }
  } catch (error) {
    console.error("Error en ruta de actualización de disponibilidad:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error al actualizar la disponibilidad" 
    });
  }
});

// Ruta para actualizar días disponibles
volunteerFieldRouter.post("/days/:id", async (req: Request, res: Response) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const { days } = req.body;
    
    const success = await updateVolunteerDays(volunteerId, days || []);
    
    if (success) {
      return res.json({ 
        success: true, 
        message: "Días disponibles actualizados correctamente" 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: "No se pudieron actualizar los días disponibles. Voluntario no encontrado." 
      });
    }
  } catch (error) {
    console.error("Error en ruta de actualización de días disponibles:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error al actualizar los días disponibles" 
    });
  }
});

// Ruta para actualizar áreas de interés
volunteerFieldRouter.post("/interests/:id", async (req: Request, res: Response) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const { interests } = req.body;
    
    const success = await updateVolunteerInterests(volunteerId, interests || []);
    
    if (success) {
      return res.json({ 
        success: true, 
        message: "Áreas de interés actualizadas correctamente" 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: "No se pudieron actualizar las áreas de interés. Voluntario no encontrado." 
      });
    }
  } catch (error) {
    console.error("Error en ruta de actualización de áreas de interés:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error al actualizar las áreas de interés" 
    });
  }
});

export { volunteerFieldRouter };