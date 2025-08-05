import { Request, Response } from 'express';
import { pool } from './db';

/**
 * Obtiene estadísticas de mantenimiento para los árboles
 * 
 * Este endpoint proporciona estadísticas para el módulo de reportes, incluyendo:
 * - Total de mantenimientos
 * - Mantenimientos recientes (últimos 30 días)
 * - Desglose por tipo de mantenimiento
 * - Desglose por estado de salud del árbol
 */
export async function getTreeMaintenanceStats(req: Request, res: Response) {
  try {
    // Fecha de hace 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Obtener conteos generales
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM tree_maintenances
    `);

    const recentResult = await pool.query(`
      SELECT COUNT(*) as recent
      FROM tree_maintenances
      WHERE maintenance_date >= $1
    `, [formattedDate]);

    // Obtener conteo por tipo de mantenimiento
    const byTypeResult = await pool.query(`
      SELECT maintenance_type as type, COUNT(*) as count
      FROM tree_maintenances
      GROUP BY maintenance_type
      ORDER BY count DESC
    `);

    // Obtener conteo por estado de salud del árbol
    const byHealthResult = await pool.query(`
      SELECT 
        COALESCE(t.health_status, 'No evaluado') as health_status,
        COUNT(*) as count
      FROM tree_maintenances tm
      JOIN trees t ON tm.tree_id = t.id
      GROUP BY t.health_status
    `);

    // Procesar datos por estado de salud
    const byHealthData = byHealthResult.rows;
    const byHealth = {
      good: 0,
      fair: 0,
      poor: 0,
      critical: 0,
      notAssessed: 0
    };

    byHealthData.forEach((item: any) => {
      const status = item.health_status?.toLowerCase();
      if (status === 'bueno') byHealth.good = parseInt(item.count);
      else if (status === 'regular') byHealth.fair = parseInt(item.count);
      else if (status === 'malo') byHealth.poor = parseInt(item.count);
      else if (status === 'crítico' || status === 'critico') byHealth.critical = parseInt(item.count);
      else byHealth.notAssessed = parseInt(item.count);
    });

    // Enviar respuesta
    res.json({
      total: totalResult.rows[0].total,
      recent: recentResult.rows[0].recent,
      byType: byTypeResult.rows,
      byHealth
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de mantenimiento:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de mantenimiento' });
  }
}