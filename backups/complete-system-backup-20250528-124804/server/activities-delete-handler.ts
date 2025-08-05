import { Request, Response } from 'express';
import { storage } from './storage';

// Función para manejar la eliminación de actividades
export async function handleDeleteActivity(req: Request, res: Response) {
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
}