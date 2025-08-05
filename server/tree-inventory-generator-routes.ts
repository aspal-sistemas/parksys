/**
 * Rutas API para generar y gestionar el inventario de árboles
 */
import type { Express, Request, Response } from "express";
import { generateTreeInventory, updateInventoryStats } from "./generate-tree-inventory";
import { db } from "./db";
import { trees, parks, treeSpecies } from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

export function registerTreeInventoryGeneratorRoutes(app: Express, apiRouter: any, isAuthenticated: any) {
  
  // Endpoint para generar inventario completo
  apiRouter.post('/tree-inventory/generate', isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log('🌳 Iniciando generación de inventario de árboles desde API...');
      
      await generateTreeInventory();
      const stats = await updateInventoryStats();
      
      res.json({
        success: true,
        message: 'Inventario de árboles generado exitosamente',
        stats: stats
      });
    } catch (error) {
      console.error('Error generando inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar el inventario de árboles',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Endpoint para obtener estadísticas del inventario
  apiRouter.get('/tree-inventory/stats', async (req: Request, res: Response) => {
    try {
      const stats = await updateInventoryStats();
      
      // Estadísticas adicionales por parque
      const statsByPark = await db.select({
        parkId: trees.park_id,
        parkName: parks.name,
        treeCount: sql`count(*)`,
        avgHeight: sql`avg(${trees.height})`,
        healthyCount: sql`count(case when ${trees.health_status} in ('excelente', 'bueno') then 1 end)`,
        needAttentionCount: sql`count(case when ${trees.health_status} in ('regular', 'malo') then 1 end)`
      })
      .from(trees)
      .leftJoin(parks, eq(trees.park_id, parks.id))
      .groupBy(trees.park_id, parks.name);

      // Estadísticas por especies
      const statsBySpecies = await db.select({
        speciesId: trees.species_id,
        speciesName: treeSpecies.commonName,
        scientificName: treeSpecies.scientificName,
        treeCount: sql`count(*)`,
        avgHeight: sql`avg(${trees.height})`
      })
      .from(trees)
      .leftJoin(treeSpecies, eq(trees.species_id, treeSpecies.id))
      .groupBy(trees.species_id, treeSpecies.commonName, treeSpecies.scientificName)
      .orderBy(sql`count(*) desc`);

      res.json({
        generalStats: stats,
        statsByPark,
        statsBySpecies
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas del inventario'
      });
    }
  });

  // Endpoint para verificar si existe inventario
  apiRouter.get('/tree-inventory/exists', async (req: Request, res: Response) => {
    try {
      const count = await db.select({ count: sql`count(*)` }).from(trees);
      const exists = count[0]?.count > 0;
      
      res.json({
        exists,
        count: count[0]?.count || 0
      });
    } catch (error) {
      console.error('Error verificando inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar inventario'
      });
    }
  });

  // Endpoint para limpiar inventario (solo administradores)
  apiRouter.delete('/tree-inventory/clear', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = await db.delete(trees);
      
      res.json({
        success: true,
        message: 'Inventario de árboles limpiado exitosamente',
        deletedCount: result.count || 0
      });
    } catch (error) {
      console.error('Error limpiando inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar el inventario'
      });
    }
  });

  console.log('✅ Rutas del generador de inventario de árboles registradas correctamente');
}