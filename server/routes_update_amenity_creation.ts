// Actualización para la ruta de creación de amenidades
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
