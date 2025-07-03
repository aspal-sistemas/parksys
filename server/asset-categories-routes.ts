import { Request, Response, Router } from "express";
import { pool } from "./db";

export function registerAssetCategoriesRoutes(app: any, apiRouter: Router) {
  
  // ===== ENDPOINTS PARA CATEGORÍAS DE ACTIVOS CON JERARQUÍA =====

  // GET: Obtener todas las categorías con estructura jerárquica
  apiRouter.get("/asset-categories", async (_req: Request, res: Response) => {
    try {
      console.log("🏷️ Obteniendo categorías de activos con estructura jerárquica");
      
      // Consulta SQL directa usando pool para evitar problemas de Drizzle ORM
      const result = await pool.query(`
        SELECT 
          c.id,
          c.name,
          c.description,
          c.icon,
          c.color,
          c.parent_id as "parentId",
          c.created_at as "createdAt",
          c.updated_at as "updatedAt",
          COUNT(children.id) as "childrenCount",
          CASE WHEN COUNT(children.id) > 0 THEN true ELSE false END as "hasChildren"
        FROM asset_categories c
        LEFT JOIN asset_categories children ON children.parent_id = c.id
        GROUP BY c.id, c.name, c.description, c.icon, c.color, c.parent_id, c.created_at, c.updated_at
        ORDER BY 
          CASE WHEN c.parent_id IS NULL THEN c.name END,
          CASE WHEN c.parent_id IS NOT NULL THEN c.name END
      `);

      const categories = result.rows.map(cat => ({
        ...cat,
        childrenCount: parseInt(cat.childrenCount),
        hasChildren: cat.hasChildren
      }));

      console.log(`📊 Encontradas ${categories.length} categorías (${categories.filter(c => !c.parentId).length} principales, ${categories.filter(c => c.parentId).length} subcategorías)`);
      res.json(categories);
    } catch (error) {
      console.error("❌ Error al obtener categorías de activos:", error);
      res.status(500).json({ message: "Error al obtener categorías de activos" });
    }
  });

  // POST: Crear nueva categoría de activo
  apiRouter.post("/asset-categories", async (req: Request, res: Response) => {
    try {
      const { name, description, icon, color, parentId } = req.body;
      
      console.log("🆕 Creando nueva categoría de activo:", { name, parentId });
      
      // Validaciones básicas
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      // Verificar que no existe una categoría con el mismo nombre y padre
      const existingCheck = await pool.query(`
        SELECT id FROM asset_categories 
        WHERE name = $1 AND COALESCE(parent_id, 0) = COALESCE($2, 0)
      `, [name.trim(), parentId || null]);

      if (existingCheck.rows.length > 0) {
        return res.status(400).json({ 
          message: "Ya existe una categoría con ese nombre en el mismo nivel" 
        });
      }

      // Insertar nueva categoría
      const result = await pool.query(`
        INSERT INTO asset_categories (name, description, icon, color, parent_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, name, description, icon, color, parent_id as "parentId", created_at as "createdAt", updated_at as "updatedAt"
      `, [
        name.trim(),
        description?.trim() || null,
        icon || null,
        color || '#6b7280',
        parentId || null
      ]);

      const newCategory = result.rows[0];
      console.log("✅ Categoría creada exitosamente:", newCategory.id);
      
      res.status(201).json({
        success: true,
        category: newCategory,
        message: "Categoría creada correctamente"
      });
    } catch (error: any) {
      console.error("❌ Error al crear categoría:", error);
      res.status(500).json({ 
        message: "Error al crear categoría", 
        details: error.message 
      });
    }
  });

  // PUT: Actualizar categoría existente
  apiRouter.put("/asset-categories/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description, icon, color, parentId } = req.body;
      
      console.log("📝 Actualizando categoría:", categoryId);
      
      // Validaciones
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      // Verificar que la categoría existe
      const existingCategory = await pool.query(`
        SELECT id FROM asset_categories WHERE id = $1
      `, [categoryId]);

      if (existingCategory.rows.length === 0) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }

      // Verificar que no se está creando un ciclo (una categoría no puede ser padre de sí misma)
      if (parentId === categoryId) {
        return res.status(400).json({ message: "Una categoría no puede ser subcategoría de sí misma" });
      }

      // Verificar duplicados (excluyendo la categoría actual)
      const duplicateCheck = await pool.query(`
        SELECT id FROM asset_categories 
        WHERE name = $1 AND COALESCE(parent_id, 0) = COALESCE($2, 0) AND id != $3
      `, [name.trim(), parentId || null, categoryId]);

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({ 
          message: "Ya existe otra categoría con ese nombre en el mismo nivel" 
        });
      }

      // Actualizar categoría
      const result = await pool.query(`
        UPDATE asset_categories 
        SET name = $1, description = $2, icon = $3, color = $4, parent_id = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING id, name, description, icon, color, parent_id as "parentId", created_at as "createdAt", updated_at as "updatedAt"
      `, [
        name.trim(),
        description?.trim() || null,
        icon || null,
        color || '#6b7280',
        parentId || null,
        categoryId
      ]);

      const updatedCategory = result.rows[0];
      console.log("✅ Categoría actualizada exitosamente:", categoryId);
      
      res.json({
        success: true,
        category: updatedCategory,
        message: "Categoría actualizada correctamente"
      });
    } catch (error: any) {
      console.error("❌ Error al actualizar categoría:", error);
      res.status(500).json({ 
        message: "Error al actualizar categoría", 
        details: error.message 
      });
    }
  });

  // DELETE: Eliminar categoría
  apiRouter.delete("/asset-categories/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      console.log("🗑️ Eliminando categoría:", categoryId);
      
      // Verificar que la categoría existe
      const existingCategory = await pool.query(`
        SELECT id, name FROM asset_categories WHERE id = $1
      `, [categoryId]);

      if (existingCategory.rows.length === 0) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }

      // Verificar que no tiene subcategorías
      const childrenCheck = await pool.query(`
        SELECT COUNT(*) as count FROM asset_categories WHERE parent_id = $1
      `, [categoryId]);

      if (parseInt(childrenCheck.rows[0].count) > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar una categoría que tiene subcategorías. Elimine primero las subcategorías." 
        });
      }

      // Verificar que no tiene activos asociados
      const assetsCheck = await pool.query(`
        SELECT COUNT(*) as count FROM assets WHERE category_id = $1
      `, [categoryId]);

      if (parseInt(assetsCheck.rows[0].count) > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar una categoría que tiene activos asociados. Reasigne los activos a otra categoría primero." 
        });
      }

      // Eliminar categoría
      await pool.query(`DELETE FROM asset_categories WHERE id = $1`, [categoryId]);
      
      console.log("✅ Categoría eliminada exitosamente:", categoryId);
      
      res.json({
        success: true,
        message: "Categoría eliminada correctamente"
      });
    } catch (error: any) {
      console.error("❌ Error al eliminar categoría:", error);
      res.status(500).json({ 
        message: "Error al eliminar categoría", 
        details: error.message 
      });
    }
  });

  // GET: Obtener solo categorías principales (sin padre)
  apiRouter.get("/asset-categories/parents", async (_req: Request, res: Response) => {
    try {
      console.log("🏷️ Obteniendo categorías principales (sin padre)");
      
      const result = await pool.query(`
        SELECT 
          c.id,
          c.name,
          c.description,
          c.icon,
          c.color,
          c.created_at as "createdAt",
          c.updated_at as "updatedAt",
          COUNT(children.id) as "childrenCount"
        FROM asset_categories c
        LEFT JOIN asset_categories children ON children.parent_id = c.id
        WHERE c.parent_id IS NULL
        GROUP BY c.id, c.name, c.description, c.icon, c.color, c.created_at, c.updated_at
        ORDER BY c.name
      `);

      const categories = result.rows.map(cat => ({
        ...cat,
        childrenCount: parseInt(cat.childrenCount),
        hasChildren: parseInt(cat.childrenCount) > 0
      }));

      console.log(`📊 Encontradas ${categories.length} categorías principales`);
      res.json(categories);
    } catch (error) {
      console.error("❌ Error al obtener categorías principales:", error);
      res.status(500).json({ message: "Error al obtener categorías principales" });
    }
  });

  // GET: Obtener subcategorías de una categoría específica
  apiRouter.get("/asset-categories/:parentId/children", async (req: Request, res: Response) => {
    try {
      const parentId = parseInt(req.params.parentId);
      console.log("🏷️ Obteniendo subcategorías para categoría:", parentId);
      
      const result = await pool.query(`
        SELECT 
          id,
          name,
          description,
          icon,
          color,
          parent_id as "parentId",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM asset_categories 
        WHERE parent_id = $1
        ORDER BY name
      `, [parentId]);

      console.log(`📊 Encontradas ${result.rows.length} subcategorías para categoría ${parentId}`);
      res.json(result.rows);
    } catch (error) {
      console.error("❌ Error al obtener subcategorías:", error);
      res.status(500).json({ message: "Error al obtener subcategorías" });
    }
  });

  // GET: Obtener estructura de árbol completa
  apiRouter.get("/asset-categories/tree/structure", async (_req: Request, res: Response) => {
    try {
      console.log("🏷️ Generando estructura de árbol de categorías");
      
      // Obtener todas las categorías
      const result = await pool.query(`
        SELECT 
          id,
          name,
          description,
          icon,
          color,
          parent_id as "parentId",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM asset_categories 
        ORDER BY 
          CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
          name
      `);

      // Organizar en estructura de árbol
      const categories = result.rows;
      const parents = categories.filter(cat => !cat.parentId);
      
      const treeStructure = parents.map(parent => ({
        ...parent,
        children: categories.filter(cat => cat.parentId === parent.id)
      }));

      console.log(`🌳 Estructura generada: ${parents.length} categorías principales con ${categories.filter(c => c.parentId).length} subcategorías`);
      res.json(treeStructure);
    } catch (error) {
      console.error("❌ Error al generar estructura de árbol:", error);
      res.status(500).json({ message: "Error al generar estructura de categorías" });
    }
  });

  console.log("🏷️ Rutas de categorías de activos registradas exitosamente");
}