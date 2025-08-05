import { Request, Response, Router } from 'express';
import { db } from './db';
import { eventCategories } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Registra las rutas para gestión de categorías de eventos
 */
export function registerEventCategoriesRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todas las categorías de eventos
  apiRouter.get('/event-categories', async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(eventCategories).orderBy(eventCategories.name);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching event categories:', error);
      res.status(500).json({ error: 'Error al obtener categorías de eventos' });
    }
  });

  // Crear nueva categoría de evento
  apiRouter.post('/event-categories', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { name, description, color } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      }

      const [newCategory] = await db.insert(eventCategories).values({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6'
      }).returning();

      res.status(201).json(newCategory);
    } catch (error: any) {
      console.error('Error creating event category:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      }
      
      res.status(500).json({ error: 'Error al crear categoría de evento' });
    }
  });

  // Actualizar categoría de evento
  apiRouter.put('/event-categories/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description, color } = req.body;

      if (isNaN(categoryId)) {
        return res.status(400).json({ error: 'ID de categoría inválido' });
      }

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      }

      const [updatedCategory] = await db.update(eventCategories)
        .set({
          name: name.trim(),
          description: description?.trim() || null,
          color: color || '#3B82F6',
          updated_at: new Date()
        })
        .where(eq(eventCategories.id, categoryId))
        .returning();

      if (!updatedCategory) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.json(updatedCategory);
    } catch (error: any) {
      console.error('Error updating event category:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      }
      
      res.status(500).json({ error: 'Error al actualizar categoría de evento' });
    }
  });

  // Eliminar categoría de evento
  apiRouter.delete('/event-categories/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);

      if (isNaN(categoryId)) {
        return res.status(400).json({ error: 'ID de categoría inválido' });
      }

      // Verificar si la categoría está siendo usada por algún evento
      const eventsUsingCategory = await db.select().from(eventCategories)
        .where(eq(eventCategories.id, categoryId));

      if (eventsUsingCategory.length === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      // TODO: Verificar si hay eventos usando esta categoría cuando implementemos la tabla events
      // Por ahora solo eliminamos la categoría
      
      const [deletedCategory] = await db.delete(eventCategories)
        .where(eq(eventCategories.id, categoryId))
        .returning();

      if (!deletedCategory) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.json({ message: 'Categoría eliminada exitosamente', category: deletedCategory });
    } catch (error) {
      console.error('Error deleting event category:', error);
      res.status(500).json({ error: 'Error al eliminar categoría de evento' });
    }
  });
}