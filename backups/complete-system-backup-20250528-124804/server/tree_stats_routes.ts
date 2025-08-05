import { Request, Response, Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from './db';

/**
 * Registra las rutas para obtener estadísticas del módulo de arbolado
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 */
export function registerTreeStatsRoutes(app: any, apiRouter: Router) {
  
  // Obtener estadísticas generales de árboles
  apiRouter.get('/trees/stats', async (_req: Request, res: Response) => {
    try {
      // Obtener total de árboles
      const totalTreesResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM arboles WHERE deleted = false`
      );
      const totalTrees = parseInt(totalTreesResult.rows[0]?.count || '0');

      // Obtener árboles plantados en los últimos 30 días
      const recentlyPlantedResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM arboles 
            WHERE deleted = false 
            AND planting_date >= NOW() - INTERVAL '30 days'`
      );
      const recentlyPlanted = parseInt(recentlyPlantedResult.rows[0]?.count || '0');

      // Obtener árboles en estado crítico
      const criticalConditionResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM arboles 
            WHERE deleted = false 
            AND physical_condition = 'Crítico'`
      );
      const criticalCondition = parseInt(criticalConditionResult.rows[0]?.count || '0');

      // Obtener árboles con mantenimiento pendiente
      const maintenancePendingResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM arboles a
            WHERE a.deleted = false 
            AND EXISTS (
              SELECT 1 FROM mantenimiento_arboles m 
              WHERE m.tree_id = a.id 
              AND m.completed = false
            )`
      );
      const maintenancePending = parseInt(maintenancePendingResult.rows[0]?.count || '0');

      // Obtener altura promedio
      const averageHeightResult = await db.execute(
        sql`SELECT AVG(height) as avg_height FROM arboles WHERE deleted = false AND height IS NOT NULL`
      );
      const averageHeight = parseFloat(averageHeightResult.rows[0]?.avg_height || '0').toFixed(1);

      // Obtener total de especies
      const totalSpeciesResult = await db.execute(
        sql`SELECT COUNT(DISTINCT species_id) as count FROM arboles WHERE deleted = false`
      );
      const totalSpecies = parseInt(totalSpeciesResult.rows[0]?.count || '0');

      res.json({
        totalTrees,
        recentlyPlanted,
        criticalCondition,
        maintenancePending,
        averageHeight,
        totalSpecies
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de árboles:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas de árboles', error });
    }
  });

  // Obtener distribuciones de árboles
  apiRouter.get('/trees/distributions', async (_req: Request, res: Response) => {
    try {
      // Distribución por especie
      const bySpeciesResult = await db.execute(
        sql`SELECT s.common_name as name, COUNT(*) as count 
            FROM arboles a
            JOIN especies_arboles s ON a.species_id = s.id
            WHERE a.deleted = false
            GROUP BY s.common_name
            ORDER BY count DESC
            LIMIT 10`
      );
      
      const bySpecies = bySpeciesResult.rows.map(row => ({
        name: row.name,
        count: parseInt(row.count)
      }));

      // Distribución por condición física
      const byConditionResult = await db.execute(
        sql`SELECT 
              CASE 
                WHEN physical_condition IS NULL THEN 'Desconocido'
                ELSE physical_condition 
              END as name, 
              COUNT(*) as count 
            FROM arboles
            WHERE deleted = false
            GROUP BY name
            ORDER BY count DESC`
      );
      
      const byCondition = byConditionResult.rows.map(row => ({
        name: row.name,
        count: parseInt(row.count)
      }));

      // Distribución por parque
      const byParkResult = await db.execute(
        sql`SELECT p.name, COUNT(*) as count 
            FROM arboles a
            JOIN parks p ON a.park_id = p.id
            WHERE a.deleted = false
            GROUP BY p.name
            ORDER BY count DESC
            LIMIT 10`
      );
      
      const byPark = byParkResult.rows.map(row => ({
        name: row.name,
        count: parseInt(row.count)
      }));

      res.json({
        bySpecies,
        byCondition,
        byPark
      });
    } catch (error) {
      console.error('Error al obtener distribuciones de árboles:', error);
      res.status(500).json({ message: 'Error al obtener distribuciones de árboles', error });
    }
  });
}