// Archivo temporal para actualizar las rutas de amenidades
import { Request, Response } from 'express';
import { storage } from './storage';

export function registerAmenityRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  // Ruta para crear una nueva amenidad
  apiRouter.post("/amenities", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Verificar que el usuario sea administrador
      if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Solo administradores pueden gestionar amenidades" });
      }
      
      const data = {
        name: req.body.name,
        icon: req.body.icon,
        category: req.body.category,
        iconType: req.body.iconType || 'system',
        customIconUrl: req.body.customIconUrl || null
      };
      
      const newAmenity = await storage.createAmenity(data);
      res.status(201).json(newAmenity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating amenity" });
    }
  });

  // Ruta para actualizar una amenidad existente
  apiRouter.put("/amenities/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Verificar que el usuario sea administrador
      if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Solo administradores pueden gestionar amenidades" });
      }
      
      const id = Number(req.params.id);
      const data = {
        name: req.body.name,
        icon: req.body.icon,
        category: req.body.category,
        iconType: req.body.iconType || 'system',
        customIconUrl: req.body.customIconUrl || null
      };
      
      const updatedAmenity = await storage.updateAmenity(id, data);
      
      if (!updatedAmenity) {
        return res.status(404).json({ message: "Amenidad no encontrada" });
      }
      
      res.json(updatedAmenity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating amenity" });
    }
  });
}