/**
 * Rutas para la gestión de mantenimiento de árboles
 */
import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  treeMaintenances, 
  trees, 
  treeSpecies,
  parks,
  insertTreeMaintenanceSchema
} from "@shared/schema";
import { eq, desc, and, like, or, gte, lte, isNull } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { sql } from 'drizzle-orm';

/**
 * Registra las rutas relacionadas con la gestión de mantenimiento de árboles
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerTreeMaintenanceRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener todos los mantenimientos de árboles (con información detallada de cada árbol)
  apiRouter.get("/trees/maintenances", async (_req: Request, res: Response) => {
    try {
      // Ejecutar la consulta SQL para obtener todos los mantenimientos con joins a tablas relacionadas
      const query = sql`
        SELECT 
          tm.id,
          tm.tree_id,
          tm.maintenance_type,
          tm.maintenance_date,
          tm.performed_by,
          tm.notes,
          tm.created_at,
          t.species_id,
          p.id AS park_id,
          p.name AS park_name,
          ts.common_name AS species_name,
          ts.scientific_name,
          u.username AS performed_by_username,
          u.full_name AS performed_by_name
        FROM 
          tree_maintenances tm
        LEFT JOIN 
          trees t ON tm.tree_id = t.id
        LEFT JOIN 
          parks p ON t.park_id = p.id
        LEFT JOIN 
          tree_species ts ON t.species_id = ts.id
        LEFT JOIN
          users u ON tm.performed_by = u.id
        ORDER BY 
          tm.maintenance_date DESC
      `;
      
      const result = await db.execute(query);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(200).json({ data: [] });
      }

      // Procesar los resultados
      const formattedMaintenances = [];
      
      for (const m of result.rows) {
        // Asegurar que tree_id sea tratado como número o usar 0 si es nulo
        const treeIdNum = m.tree_id ? parseInt(String(m.tree_id)) : 0;
        
        formattedMaintenances.push({
          id: m.id,
          treeId: treeIdNum,
          treeCode: `ARB-${treeIdNum.toString().padStart(5, '0')}`,
          maintenanceType: m.maintenance_type || 'Desconocido',
          maintenanceDate: m.maintenance_date,
          performedBy: m.performed_by,
          performedByName: m.performed_by_name || m.performed_by_username || `Usuario ${m.performed_by || ''}`,
          notes: m.notes || '',
          createdAt: m.created_at,
          parkId: m.park_id,
          parkName: m.park_name || 'Desconocido',
          speciesId: m.species_id,
          speciesName: m.species_name || 'Desconocida',
          scientificName: m.scientific_name || ''
        });
      }
      
      // Devolver los resultados formateados
      return res.status(200).json({ data: formattedMaintenances });
    } catch (error) {
      console.error("Error al obtener mantenimientos de árboles:", error);
      return res.status(500).json({ error: "Error al obtener mantenimientos de árboles" });
    }
  });

  // Obtener resumen estadístico de mantenimientos
  apiRouter.get("/trees/maintenances/stats", async (_req: Request, res: Response) => {
    try {
      // Obtener conteo total de mantenimientos
      const totalResult = await db.execute(sql`
        SELECT COUNT(*) as total FROM tree_maintenances
      `);
      const total = totalResult.rows?.[0]?.total || 0;
      
      // Obtener mantenimientos recientes (últimos 30 días)
      const recentResult = await db.execute(sql`
        SELECT COUNT(*) as recent 
        FROM tree_maintenances 
        WHERE maintenance_date >= CURRENT_DATE - INTERVAL '30 days'
      `);
      const recent = recentResult.rows?.[0]?.recent || 0;
      
      // Obtener conteo por tipo de mantenimiento
      const typeResult = await db.execute(sql`
        SELECT 
          maintenance_type, 
          COUNT(*) as count 
        FROM 
          tree_maintenances 
        GROUP BY 
          maintenance_type 
        ORDER BY 
          count DESC
      `);
      
      // Obtener conteo por mes (últimos 12 meses)
      const monthlyResult = await db.execute(sql`
        SELECT 
          DATE_TRUNC('month', maintenance_date) as month,
          COUNT(*) as count
        FROM 
          tree_maintenances
        WHERE 
          maintenance_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY 
          month
        ORDER BY 
          month ASC
      `);
      
      // Formatear los resultados por tipo
      const byType = typeResult.rows?.map(r => ({
        type: r.maintenance_type,
        count: r.count
      })) || [];
      
      // Formatear los resultados por mes
      const byMonth = monthlyResult.rows?.map(r => ({
        month: r.month,
        count: r.count
      })) || [];
      
      res.json({
        total,
        recent,
        byType,
        byMonth
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de mantenimientos:", error);
      res.status(500).json({ error: "Error al obtener estadísticas de mantenimientos" });
    }
  });
}