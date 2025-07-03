import { Request, Response, Router } from "express";
import { db, pool } from "./db";
import { assetCategories } from "@shared/schema";
import { eq, sql, isNull } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";

export function registerAssetCategoriesRoutes(app: any, apiRouter: Router) {
  
  // ===== ENDPOINTS PARA CATEGORÍAS DE ACTIVOS CON JERARQUÍA =====

  // GET: Obtener todas las categorías con estructura jerárquica
  apiRouter.get("/asset-categories", async (_req: Request, res: Response) => {
    try {
      console.log("🏷️ Obteniendo categorías de activos con estructura jerárquica");
      
      // Consulta que obtiene todas las categorías y calcula si tienen hijos
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

  // GET: Obtener solo categorías principales (sin padre) con conteo de hijos
  apiRouter.get("/asset-categories/parents", async (_req: Request, res: Response) => {
    try {
      // Usar Drizzle ORM en lugar de SQL directo para evitar conflictos
      const parentCategories = await db
        .select()
        .from(assetCategories)
        .where(isNull(assetCategories.parentId))
        .orderBy(assetCategories.name);

      // Obtener conteo de subcategorías para cada categoría principal
      const categoriesWithChildren = await Promise.all(
        parentCategories.map(async (category) => {
          const childrenCount = await db
            .select({ count: sql`count(*)` })
            .from(assetCategories)
            .where(eq(assetCategories.parentId, category.id));

          return {
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            parentId: category.parentId,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            childrenCount: Number(childrenCount[0]?.count || 0)
          };
        })
      );

      res.json(categoriesWithChildren);
    } catch (error) {
      console.error("❌ Error al obtener categorías principales:", error);
      res.status(500).json({ message: "Error al obtener categorías principales" });
    }
  });

  // GET: Obtener subcategorías de una categoría específica
  apiRouter.get("/asset-categories/:parentId/children", async (req: Request, res: Response) => {
    try {
      const parentId = parseInt(req.params.parentId);
      
      const result = await pool.query(`
        SELECT 
          id, name, description, icon, color, parent_id as "parentId",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM asset_categories
        WHERE parent_id = $1
        ORDER BY name
      `, [parentId]);

      res.json(result.rows);
    } catch (error) {
      console.error(`❌ Error al obtener subcategorías de ${req.params.parentId}:`, error);
      res.status(500).json({ message: "Error al obtener subcategorías" });
    }
  });

  // GET: Obtener categoría por ID
  apiRouter.get("/asset-categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
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
          parent.name as "parentName",
          COUNT(children.id) as "childrenCount"
        FROM asset_categories c
        LEFT JOIN asset_categories parent ON parent.id = c.parent_id
        LEFT JOIN asset_categories children ON children.parent_id = c.id
        WHERE c.id = $1
        GROUP BY c.id, c.name, c.description, c.icon, c.color, c.parent_id, c.created_at, c.updated_at, parent.name
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      const category = {
        ...result.rows[0],
        childrenCount: parseInt(result.rows[0].childrenCount)
      };
      
      res.json(category);
    } catch (error) {
      console.error("❌ Error al obtener categoría:", error);
      res.status(500).json({ message: "Error al obtener categoría de activo" });
    }
  });

  // POST: Crear nueva categoría
  apiRouter.post("/asset-categories", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("➕ Creando nueva categoría de activo:", req.body);
      
      const { name, description, icon, color, parentId } = req.body;
      
      // Validaciones básicas
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre es requerido" });
      }

      // Si es subcategoría, validar que el padre existe
      if (parentId) {
        const parentCheck = await pool.query(`
          SELECT id FROM asset_categories WHERE id = $1
        `, [parentId]);
        
        if (parentCheck.rows.length === 0) {
          return res.status(400).json({ message: "La categoría padre no existe" });
        }
      }
      
      const result = await pool.query(`
        INSERT INTO asset_categories (
          name, description, icon, color, parent_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, NOW(), NOW()
        ) RETURNING 
          id, name, description, icon, color, parent_id as "parentId",
          created_at as "createdAt", updated_at as "updatedAt"
      `, [name.trim(), description?.trim() || null, icon || 'tag', color || '#3B82F6', parentId || null]);
      
      const newCategory = result.rows[0];
      console.log("✅ Categoría creada exitosamente:", newCategory.id);
      
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("❌ Error al crear categoría de activo:", error);
      
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ message: "Ya existe una categoría con ese nombre" });
      } else {
        res.status(500).json({ message: "Error al crear categoría de activo" });
      }
    }
  });

  // PUT: Actualizar categoría
  apiRouter.put("/asset-categories/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, icon, color, parentId } = req.body;
      
      console.log(`📝 Actualizando categoría ${id}:`, req.body);
      
      // Verificar que la categoría existe
      const existingCheck = await pool.query(`
        SELECT id FROM asset_categories WHERE id = $1
      `, [id]);
      
      if (existingCheck.rows.length === 0) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      // Validar que no se está convirtiendo en su propia subcategoría
      if (parentId === id) {
        return res.status(400).json({ message: "Una categoría no puede ser subcategoría de sí misma" });
      }
      
      // Si se está asignando un padre, verificar que no cree un ciclo
      if (parentId) {
        const cycleCheck = await pool.query(`
          WITH RECURSIVE category_tree AS (
            SELECT id, parent_id, 0 as level
            FROM asset_categories
            WHERE id = $1
            
            UNION ALL
            
            SELECT c.id, c.parent_id, ct.level + 1
            FROM asset_categories c
            INNER JOIN category_tree ct ON c.parent_id = ct.id
            WHERE ct.level < 10
          )
          SELECT COUNT(*) as cycle_count
          FROM category_tree
          WHERE id = $2
        `, [parentId, id]);
        
        if (parseInt(cycleCheck.rows[0].cycle_count) > 0) {
          return res.status(400).json({ message: "No se puede crear una referencia circular en las categorías" });
        }
      }
      
      const result = await pool.query(`
        UPDATE asset_categories
        SET 
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          icon = COALESCE($4, icon),
          color = COALESCE($5, color),
          parent_id = $6,
          updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id, name, description, icon, color, parent_id as "parentId",
          created_at as "createdAt", updated_at as "updatedAt"
      `, [id, name?.trim(), description?.trim(), icon, color, parentId || null]);
      
      const updatedCategory = result.rows[0];
      console.log("✅ Categoría actualizada exitosamente:", id);
      
      res.json(updatedCategory);
    } catch (error) {
      console.error(`❌ Error al actualizar categoría ${req.params.id}:`, error);
      
      if (error.code === '23505') {
        res.status(400).json({ message: "Ya existe una categoría con ese nombre" });
      } else {
        res.status(500).json({ message: "Error al actualizar categoría de activo" });
      }
    }
  });

  // DELETE: Eliminar categoría
  apiRouter.delete("/asset-categories/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      console.log(`🗑️ Intentando eliminar categoría ${id}`);
      
      // Verificar si tiene activos asociados
      const assetsCheck = await pool.query(`
        SELECT COUNT(*) as asset_count
        FROM assets
        WHERE category_id = $1
      `, [id]);
      
      const assetCount = parseInt(assetsCheck.rows[0].asset_count);
      if (assetCount > 0) {
        return res.status(400).json({ 
          message: `No se puede eliminar la categoría porque tiene ${assetCount} activo(s) asociado(s)` 
        });
      }
      
      // Verificar si tiene subcategorías
      const childrenCheck = await pool.query(`
        SELECT COUNT(*) as children_count
        FROM asset_categories
        WHERE parent_id = $1
      `, [id]);
      
      const childrenCount = parseInt(childrenCheck.rows[0].children_count);
      if (childrenCount > 0) {
        return res.status(400).json({ 
          message: `No se puede eliminar la categoría porque tiene ${childrenCount} subcategoría(s)` 
        });
      }
      
      const result = await pool.query(`
        DELETE FROM asset_categories
        WHERE id = $1
        RETURNING id, name
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      console.log(`✅ Categoría eliminada exitosamente: ${result.rows[0].name}`);
      res.json({ message: "Categoría eliminada correctamente", category: result.rows[0] });
    } catch (error) {
      console.error(`❌ Error al eliminar categoría ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al eliminar categoría de activo" });
    }
  });

  // GET: Obtener estructura de árbol completa
  apiRouter.get("/asset-categories/tree/structure", async (_req: Request, res: Response) => {
    try {
      console.log("🌳 Generando estructura de árbol de categorías");
      
      const result = await pool.query(`
        WITH RECURSIVE category_tree AS (
          -- Categorías principales (nivel 0)
          SELECT 
            id, name, description, icon, color, parent_id,
            created_at, updated_at, 0 as level,
            ARRAY[id] as path,
            name as path_names
          FROM asset_categories
          WHERE parent_id IS NULL
          
          UNION ALL
          
          -- Subcategorías (niveles siguientes)
          SELECT 
            c.id, c.name, c.description, c.icon, c.color, c.parent_id,
            c.created_at, c.updated_at, ct.level + 1,
            ct.path || c.id,
            ct.path_names || ' > ' || c.name
          FROM asset_categories c
          INNER JOIN category_tree ct ON c.parent_id = ct.id
          WHERE ct.level < 5 -- Máximo 5 niveles de profundidad
        )
        SELECT 
          id, name, description, icon, color, parent_id as "parentId",
          created_at as "createdAt", updated_at as "updatedAt",
          level, path, path_names as "pathNames"
        FROM category_tree
        ORDER BY level, name
      `);
      
      const treeStructure = result.rows;
      console.log(`📊 Estructura generada: ${treeStructure.length} nodos, ${Math.max(...treeStructure.map(n => n.level)) + 1} niveles`);
      
      res.json(treeStructure);
    } catch (error) {
      console.error("❌ Error al generar estructura de árbol:", error);
      res.status(500).json({ message: "Error al generar estructura de categorías" });
    }
  });

  console.log("🏷️ Rutas de categorías de activos registradas exitosamente");
}