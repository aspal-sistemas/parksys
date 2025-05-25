import { Request, Response } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';

// Definición de la estructura de las tablas
const incidentCategories = {
  id: 'id',
  name: 'name',
  description: 'description',
  color: 'color',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const incidentSubcategories = {
  id: 'id',
  name: 'name',
  description: 'description',
  categoryId: 'category_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

// Registro de las rutas relacionadas con categorías de incidentes
export function registerIncidentCategoriesRoutes(app: any, apiRouter: any) {
  // Endpoint para obtener todas las categorías
  apiRouter.get('/incident-categories', async (_req: Request, res: Response) => {
    try {
      const categories = await db.execute(
        `SELECT id, name, description, color, created_at as "createdAt", updated_at as "updatedAt" 
         FROM incident_categories 
         ORDER BY name ASC`
      );
      
      // Si no hay datos, devolvemos un array vacío o datos de ejemplo
      if (!categories.rows || categories.rows.length === 0) {
        // Datos de muestra para desarrollo
        return res.json([
          { 
            id: 1, 
            name: 'Daños', 
            description: 'Problemas físicos en instalaciones o equipamiento',
            color: '#ef4444', 
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: 2, 
            name: 'Seguridad', 
            description: 'Problemas relacionados con la seguridad del parque',
            color: '#f97316', 
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: 3, 
            name: 'Mantenimiento', 
            description: 'Necesidades de mantenimiento general',
            color: '#3b82f6', 
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: 4, 
            name: 'Limpieza', 
            description: 'Problemas de limpieza y residuos',
            color: '#10b981', 
            createdAt: new Date(), 
            updatedAt: new Date() 
          }
        ]);
      }
      
      return res.json(categories.rows);
    } catch (error) {
      console.error('Error al obtener categorías de incidentes:', error);
      return res.status(500).json({ message: 'Error al obtener categorías de incidentes' });
    }
  });

  // Endpoint para crear una nueva categoría
  apiRouter.post('/incident-categories', async (req: Request, res: Response) => {
    try {
      const { name, description, color } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
      }
      
      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategory = await db.execute(
        `SELECT id FROM incident_categories WHERE name = $1`,
        [name]
      );
      
      if (existingCategory.rows && existingCategory.rows.length > 0) {
        return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
      }
      
      // Insertar la nueva categoría
      const result = await db.execute(
        `INSERT INTO incident_categories (name, description, color, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING id, name, description, color, created_at as "createdAt", updated_at as "updatedAt"`,
        [name, description || null, color || '#3b82f6']
      );
      
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear categoría de incidente:', error);
      return res.status(500).json({ message: 'Error al crear categoría de incidente' });
    }
  });

  // Endpoint para actualizar una categoría
  apiRouter.put('/incident-categories/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, color } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
      }
      
      // Verificar si la categoría existe
      const existingCategory = await db.execute(
        `SELECT id FROM incident_categories WHERE id = $1`,
        [id]
      );
      
      if (!existingCategory.rows || existingCategory.rows.length === 0) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Verificar si ya existe otra categoría con el mismo nombre
      const duplicateCategory = await db.execute(
        `SELECT id FROM incident_categories WHERE name = $1 AND id != $2`,
        [name, id]
      );
      
      if (duplicateCategory.rows && duplicateCategory.rows.length > 0) {
        return res.status(400).json({ message: 'Ya existe otra categoría con ese nombre' });
      }
      
      // Actualizar la categoría
      const result = await db.execute(
        `UPDATE incident_categories 
         SET name = $1, description = $2, color = $3, updated_at = NOW() 
         WHERE id = $4 
         RETURNING id, name, description, color, created_at as "createdAt", updated_at as "updatedAt"`,
        [name, description || null, color || '#3b82f6', id]
      );
      
      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al actualizar categoría de incidente:', error);
      return res.status(500).json({ message: 'Error al actualizar categoría de incidente' });
    }
  });

  // Endpoint para eliminar una categoría
  apiRouter.delete('/incident-categories/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar si la categoría existe
      const existingCategory = await db.execute(
        `SELECT id FROM incident_categories WHERE id = $1`,
        [id]
      );
      
      if (!existingCategory.rows || existingCategory.rows.length === 0) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Eliminar primero las subcategorías relacionadas
      await db.execute(
        `DELETE FROM incident_subcategories WHERE category_id = $1`,
        [id]
      );
      
      // Eliminar la categoría
      await db.execute(
        `DELETE FROM incident_categories WHERE id = $1`,
        [id]
      );
      
      return res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría de incidente:', error);
      return res.status(500).json({ message: 'Error al eliminar categoría de incidente' });
    }
  });

  // Endpoint para obtener todas las subcategorías
  apiRouter.get('/incident-subcategories', async (_req: Request, res: Response) => {
    try {
      const subcategories = await db.execute(
        `SELECT s.id, s.name, s.description, s.category_id as "categoryId", 
                s.created_at as "createdAt", s.updated_at as "updatedAt",
                c.name as "categoryName"
         FROM incident_subcategories s
         LEFT JOIN incident_categories c ON s.category_id = c.id
         ORDER BY s.name ASC`
      );
      
      // Si no hay datos, devolvemos un array vacío o datos de ejemplo
      if (!subcategories.rows || subcategories.rows.length === 0) {
        // Datos de muestra para desarrollo
        return res.json([
          { 
            id: 1, 
            name: 'Juegos infantiles', 
            description: 'Problemas con juegos del área infantil',
            categoryId: 1, 
            categoryName: 'Daños',
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: 2, 
            name: 'Senderos', 
            description: 'Problemas en caminos y senderos',
            categoryId: 1, 
            categoryName: 'Daños',
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: 3, 
            name: 'Iluminación', 
            description: 'Problemas con el alumbrado',
            categoryId: 3, 
            categoryName: 'Mantenimiento',
            createdAt: new Date(), 
            updatedAt: new Date() 
          }
        ]);
      }
      
      return res.json(subcategories.rows);
    } catch (error) {
      console.error('Error al obtener subcategorías de incidentes:', error);
      return res.status(500).json({ message: 'Error al obtener subcategorías de incidentes' });
    }
  });

  // Endpoint para crear una nueva subcategoría
  apiRouter.post('/incident-subcategories', async (req: Request, res: Response) => {
    try {
      const { name, description, categoryId } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre de la subcategoría es obligatorio' });
      }
      
      if (!categoryId) {
        return res.status(400).json({ message: 'La categoría padre es obligatoria' });
      }
      
      // Verificar si la categoría padre existe
      const existingCategory = await db.execute(
        `SELECT id FROM incident_categories WHERE id = $1`,
        [categoryId]
      );
      
      if (!existingCategory.rows || existingCategory.rows.length === 0) {
        return res.status(400).json({ message: 'La categoría padre no existe' });
      }
      
      // Verificar si ya existe una subcategoría con el mismo nombre en la misma categoría
      const existingSubcategory = await db.execute(
        `SELECT id FROM incident_subcategories WHERE name = $1 AND category_id = $2`,
        [name, categoryId]
      );
      
      if (existingSubcategory.rows && existingSubcategory.rows.length > 0) {
        return res.status(400).json({ message: 'Ya existe una subcategoría con ese nombre en la categoría seleccionada' });
      }
      
      // Insertar la nueva subcategoría
      const result = await db.execute(
        `INSERT INTO incident_subcategories (name, description, category_id, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING id, name, description, category_id as "categoryId", created_at as "createdAt", updated_at as "updatedAt"`,
        [name, description || null, categoryId]
      );
      
      // Obtener el nombre de la categoría
      const category = await db.execute(
        `SELECT name FROM incident_categories WHERE id = $1`,
        [categoryId]
      );
      
      const subcategory = result.rows[0];
      subcategory.categoryName = category.rows[0]?.name || '';
      
      return res.status(201).json(subcategory);
    } catch (error) {
      console.error('Error al crear subcategoría de incidente:', error);
      return res.status(500).json({ message: 'Error al crear subcategoría de incidente' });
    }
  });

  // Endpoint para actualizar una subcategoría
  apiRouter.put('/incident-subcategories/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, categoryId } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre de la subcategoría es obligatorio' });
      }
      
      if (!categoryId) {
        return res.status(400).json({ message: 'La categoría padre es obligatoria' });
      }
      
      // Verificar si la subcategoría existe
      const existingSubcategory = await db.execute(
        `SELECT id FROM incident_subcategories WHERE id = $1`,
        [id]
      );
      
      if (!existingSubcategory.rows || existingSubcategory.rows.length === 0) {
        return res.status(404).json({ message: 'Subcategoría no encontrada' });
      }
      
      // Verificar si la categoría padre existe
      const existingCategory = await db.execute(
        `SELECT id FROM incident_categories WHERE id = $1`,
        [categoryId]
      );
      
      if (!existingCategory.rows || existingCategory.rows.length === 0) {
        return res.status(400).json({ message: 'La categoría padre no existe' });
      }
      
      // Verificar si ya existe otra subcategoría con el mismo nombre en la misma categoría
      const duplicateSubcategory = await db.execute(
        `SELECT id FROM incident_subcategories WHERE name = $1 AND category_id = $2 AND id != $3`,
        [name, categoryId, id]
      );
      
      if (duplicateSubcategory.rows && duplicateSubcategory.rows.length > 0) {
        return res.status(400).json({ message: 'Ya existe otra subcategoría con ese nombre en la categoría seleccionada' });
      }
      
      // Actualizar la subcategoría
      const result = await db.execute(
        `UPDATE incident_subcategories 
         SET name = $1, description = $2, category_id = $3, updated_at = NOW() 
         WHERE id = $4 
         RETURNING id, name, description, category_id as "categoryId", created_at as "createdAt", updated_at as "updatedAt"`,
        [name, description || null, categoryId, id]
      );
      
      // Obtener el nombre de la categoría
      const category = await db.execute(
        `SELECT name FROM incident_categories WHERE id = $1`,
        [categoryId]
      );
      
      const subcategory = result.rows[0];
      subcategory.categoryName = category.rows[0]?.name || '';
      
      return res.json(subcategory);
    } catch (error) {
      console.error('Error al actualizar subcategoría de incidente:', error);
      return res.status(500).json({ message: 'Error al actualizar subcategoría de incidente' });
    }
  });

  // Endpoint para eliminar una subcategoría
  apiRouter.delete('/incident-subcategories/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar si la subcategoría existe
      const existingSubcategory = await db.execute(
        `SELECT id FROM incident_subcategories WHERE id = $1`,
        [id]
      );
      
      if (!existingSubcategory.rows || existingSubcategory.rows.length === 0) {
        return res.status(404).json({ message: 'Subcategoría no encontrada' });
      }
      
      // Eliminar la subcategoría
      await db.execute(
        `DELETE FROM incident_subcategories WHERE id = $1`,
        [id]
      );
      
      return res.json({ message: 'Subcategoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar subcategoría de incidente:', error);
      return res.status(500).json({ message: 'Error al eliminar subcategoría de incidente' });
    }
  });
}