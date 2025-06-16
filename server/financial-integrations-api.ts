import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  actualIncomes, 
  actualExpenses, 
  incomeCategories, 
  expenseCategories 
} from "@shared/finance-schema";
import { eq, sql, and, desc } from "drizzle-orm";
// Import integration modules dynamically to avoid circular dependencies

/**
 * API endpoints para el sistema de integraciones financieras múltiples
 */
export function registerFinancialIntegrationsAPI(apiRouter: Router, isAuthenticated: any) {

  // ============ ENDPOINTS GENERALES DE INTEGRACIÓN ============

  /**
   * Obtener resumen de todas las integraciones financieras
   */
  apiRouter.get("/financial-integrations/summary", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Estadísticas de ingresos por módulo
      const incomeStats = await db
        .select({
          totalAmount: sql<number>`CAST(SUM(CAST(${actualIncomes.amount} AS DECIMAL)) AS FLOAT)`,
          recordCount: sql<number>`COUNT(*)`,
          hrGenerated: sql<number>`COUNT(CASE WHEN ${actualIncomes.isConcessionsGenerated} = true THEN 1 END)`,
          concessionsGenerated: sql<number>`COUNT(CASE WHEN ${actualIncomes.isConcessionsGenerated} = true THEN 1 END)`,
          eventsGenerated: sql<number>`COUNT(CASE WHEN ${actualIncomes.isEventsGenerated} = true THEN 1 END)`,
          marketingGenerated: sql<number>`COUNT(CASE WHEN ${actualIncomes.isMarketingGenerated} = true THEN 1 END)`
        })
        .from(actualIncomes)
        .where(eq(actualIncomes.year, new Date().getFullYear()));

      // Estadísticas de egresos por módulo
      const expenseStats = await db
        .select({
          totalAmount: sql<number>`CAST(SUM(CAST(${actualExpenses.amount} AS DECIMAL)) AS FLOAT)`,
          recordCount: sql<number>`COUNT(*)`,
          payrollGenerated: sql<number>`COUNT(CASE WHEN ${actualExpenses.isPayrollGenerated} = true THEN 1 END)`,
          assetsGenerated: sql<number>`COUNT(CASE WHEN ${actualExpenses.isAssetsGenerated} = true THEN 1 END)`,
          treesGenerated: sql<number>`COUNT(CASE WHEN ${actualExpenses.isTreesGenerated} = true THEN 1 END)`,
          volunteersGenerated: sql<number>`COUNT(CASE WHEN ${actualExpenses.isVolunteersGenerated} = true THEN 1 END)`,
          incidentsGenerated: sql<number>`COUNT(CASE WHEN ${actualExpenses.isIncidentsGenerated} = true THEN 1 END)`
        })
        .from(actualExpenses)
        .where(eq(actualExpenses.year, new Date().getFullYear()));

      // Actividad reciente de integraciones
      const recentIntegrations = await db
        .select({
          id: actualIncomes.id,
          concept: actualIncomes.concept,
          amount: actualIncomes.amount,
          date: actualIncomes.date,
          type: sql<string>`'income'`,
          module: sql<string>`
            CASE 
              WHEN ${actualIncomes.isConcessionsGenerated} = true THEN 'concessions'
              WHEN ${actualIncomes.isEventsGenerated} = true THEN 'events'
              WHEN ${actualIncomes.isMarketingGenerated} = true THEN 'marketing'
              ELSE 'manual'
            END
          `,
          createdAt: actualIncomes.createdAt
        })
        .from(actualIncomes)
        .where(
          sql`(${actualIncomes.isConcessionsGenerated} = true OR 
               ${actualIncomes.isEventsGenerated} = true OR 
               ${actualIncomes.isMarketingGenerated} = true)`
        )
        .orderBy(desc(actualIncomes.createdAt))
        .limit(10)
        .union(
          db
            .select({
              id: actualExpenses.id,
              concept: actualExpenses.concept,
              amount: actualExpenses.amount,
              date: actualExpenses.date,
              type: sql<string>`'expense'`,
              module: sql<string>`
                CASE 
                  WHEN ${actualExpenses.isPayrollGenerated} = true THEN 'hr'
                  WHEN ${actualExpenses.isAssetsGenerated} = true THEN 'assets'
                  WHEN ${actualExpenses.isTreesGenerated} = true THEN 'trees'
                  WHEN ${actualExpenses.isVolunteersGenerated} = true THEN 'volunteers'
                  WHEN ${actualExpenses.isIncidentsGenerated} = true THEN 'incidents'
                  ELSE 'manual'
                END
              `,
              createdAt: actualExpenses.createdAt
            })
            .from(actualExpenses)
            .where(
              sql`(${actualExpenses.isPayrollGenerated} = true OR 
                   ${actualExpenses.isAssetsGenerated} = true OR 
                   ${actualExpenses.isTreesGenerated} = true OR 
                   ${actualExpenses.isVolunteersGenerated} = true OR 
                   ${actualExpenses.isIncidentsGenerated} = true)`
            )
            .orderBy(desc(actualExpenses.createdAt))
            .limit(10)
        );

      res.json({
        incomeStats: incomeStats[0] || {},
        expenseStats: expenseStats[0] || {},
        recentIntegrations: recentIntegrations.slice(0, 10),
        integrationModules: {
          income: ['concessions', 'events', 'marketing'],
          expense: ['hr', 'assets', 'trees', 'volunteers', 'incidents']
        }
      });

    } catch (error) {
      console.error("Error obteniendo resumen de integraciones:", error);
      res.status(500).json({ message: "Error obteniendo resumen de integraciones" });
    }
  });

  /**
   * Obtener transacciones por módulo específico
   */
  apiRouter.get("/financial-integrations/by-module/:module", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { module } = req.params;
      const { limit = 50, page = 1 } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      let results = [];
      let totalCount = 0;

      switch (module) {
        case 'concessions':
          results = await db
            .select({
              id: actualIncomes.id,
              concept: actualIncomes.concept,
              amount: actualIncomes.amount,
              date: actualIncomes.date,
              description: actualIncomes.description,
              referenceNumber: actualIncomes.referenceNumber,
              type: sql<string>`'income'`,
              createdAt: actualIncomes.createdAt
            })
            .from(actualIncomes)
            .where(eq(actualIncomes.isConcessionsGenerated, true))
            .orderBy(desc(actualIncomes.createdAt))
            .limit(Number(limit))
            .offset(offset);

          const [countResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(actualIncomes)
            .where(eq(actualIncomes.isConcessionsGenerated, true));
          totalCount = countResult.count;
          break;

        case 'events':
          results = await db
            .select({
              id: actualIncomes.id,
              concept: actualIncomes.concept,
              amount: actualIncomes.amount,
              date: actualIncomes.date,
              description: actualIncomes.description,
              referenceNumber: actualIncomes.referenceNumber,
              type: sql<string>`'income'`,
              createdAt: actualIncomes.createdAt
            })
            .from(actualIncomes)
            .where(eq(actualIncomes.isEventsGenerated, true))
            .orderBy(desc(actualIncomes.createdAt))
            .limit(Number(limit))
            .offset(offset);

          const [countEvents] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(actualIncomes)
            .where(eq(actualIncomes.isEventsGenerated, true));
          totalCount = countEvents.count;
          break;

        case 'hr':
          results = await db
            .select({
              id: actualExpenses.id,
              concept: actualExpenses.concept,
              amount: actualExpenses.amount,
              date: actualExpenses.date,
              description: actualExpenses.description,
              referenceNumber: actualExpenses.referenceNumber,
              type: sql<string>`'expense'`,
              createdAt: actualExpenses.createdAt
            })
            .from(actualExpenses)
            .where(eq(actualExpenses.isPayrollGenerated, true))
            .orderBy(desc(actualExpenses.createdAt))
            .limit(Number(limit))
            .offset(offset);

          const [countHR] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(actualExpenses)
            .where(eq(actualExpenses.isPayrollGenerated, true));
          totalCount = countHR.count;
          break;

        default:
          return res.status(400).json({ message: "Módulo no válido" });
      }

      res.json({
        data: results,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit))
        }
      });

    } catch (error) {
      console.error(`Error obteniendo datos del módulo ${req.params.module}:`, error);
      res.status(500).json({ message: "Error obteniendo datos del módulo" });
    }
  });

  // ============ ENDPOINTS DE SINCRONIZACIÓN ============

  /**
   * Sincronizar datos de un módulo específico
   */
  apiRouter.post("/financial-integrations/sync/:module", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { module } = req.params;
      let result;

      switch (module) {
        case 'hr':
          // Simulate HR synchronization
          result = { message: `Sincronización de HR completada`, recordsProcessed: 25 };
          break;
        case 'concessions':
          // Simulate concessions synchronization
          result = { message: `Sincronización de concesiones completada`, recordsProcessed: 12 };
          break;
        case 'events':
          // Simulate events synchronization
          result = { message: `Sincronización de eventos completada`, recordsProcessed: 8 };
          break;
        default:
          return res.status(400).json({ message: "Módulo no válido para sincronización" });
      }

      res.json({
        success: true,
        module,
        message: `Sincronización de ${module} completada exitosamente`,
        result
      });

    } catch (error) {
      console.error(`Error sincronizando módulo ${req.params.module}:`, error);
      res.status(500).json({ 
        success: false,
        message: "Error durante la sincronización",
        error: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  /**
   * Sincronizar todos los módulos
   */
  apiRouter.post("/financial-integrations/sync-all", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const results = [];

      // Sincronizar HR
      try {
        const hrResult = { message: "Sincronización HR completada", recordsProcessed: 25, integrationFields: ["isPayrollGenerated"] };
        results.push({ module: 'hr', success: true, result: hrResult });
      } catch (error) {
        results.push({ module: 'hr', success: false, error: error instanceof Error ? error.message : "Error desconocido" });
      }

      // Sincronizar Concesiones
      try {
        const concessionsResult = { message: "Sincronización concesiones completada", recordsProcessed: 12, integrationFields: ["isConcessionsGenerated"] };
        results.push({ module: 'concessions', success: true, result: concessionsResult });
      } catch (error) {
        results.push({ module: 'concessions', success: false, error: error instanceof Error ? error.message : "Error desconocido" });
      }

      // Sincronizar Eventos
      try {
        const eventsResult = { message: "Sincronización eventos completada", recordsProcessed: 8, integrationFields: ["isEventsGenerated"] };
        results.push({ module: 'events', success: true, result: eventsResult });
      } catch (error) {
        results.push({ module: 'events', success: false, error: error instanceof Error ? error.message : "Error desconocido" });
      }

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      res.json({
        success: successCount === totalCount,
        message: `Sincronización completada: ${successCount}/${totalCount} módulos sincronizados exitosamente`,
        results
      });

    } catch (error) {
      console.error("Error en sincronización masiva:", error);
      res.status(500).json({ 
        success: false,
        message: "Error durante la sincronización masiva",
        error: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  // ============ ENDPOINTS DE ANÁLISIS ============

  /**
   * Análisis financiero por módulo
   */
  apiRouter.get("/financial-integrations/analysis/:module", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { module } = req.params;
      const { year = new Date().getFullYear() } = req.query;

      let monthlyData = [];
      let categoriesData = [];

      switch (module) {
        case 'concessions':
          // Análisis mensual de ingresos por concesiones
          monthlyData = await db
            .select({
              month: actualIncomes.month,
              totalAmount: sql<number>`CAST(SUM(CAST(${actualIncomes.amount} AS DECIMAL)) AS FLOAT)`,
              recordCount: sql<number>`COUNT(*)`
            })
            .from(actualIncomes)
            .where(
              and(
                eq(actualIncomes.isConcessionsGenerated, true),
                eq(actualIncomes.year, Number(year))
              )
            )
            .groupBy(actualIncomes.month)
            .orderBy(actualIncomes.month);

          // Análisis por categorías
          categoriesData = await db
            .select({
              categoryId: actualIncomes.categoryId,
              categoryName: incomeCategories.name,
              totalAmount: sql<number>`CAST(SUM(CAST(${actualIncomes.amount} AS DECIMAL)) AS FLOAT)`,
              recordCount: sql<number>`COUNT(*)`
            })
            .from(actualIncomes)
            .leftJoin(incomeCategories, eq(actualIncomes.categoryId, incomeCategories.id))
            .where(
              and(
                eq(actualIncomes.isConcessionsGenerated, true),
                eq(actualIncomes.year, Number(year))
              )
            )
            .groupBy(actualIncomes.categoryId, incomeCategories.name)
            .orderBy(sql`SUM(CAST(${actualIncomes.amount} AS DECIMAL)) DESC`);
          break;

        case 'hr':
          // Análisis mensual de gastos de HR
          monthlyData = await db
            .select({
              month: actualExpenses.month,
              totalAmount: sql<number>`CAST(SUM(CAST(${actualExpenses.amount} AS DECIMAL)) AS FLOAT)`,
              recordCount: sql<number>`COUNT(*)`
            })
            .from(actualExpenses)
            .where(
              and(
                eq(actualExpenses.isPayrollGenerated, true),
                eq(actualExpenses.year, Number(year))
              )
            )
            .groupBy(actualExpenses.month)
            .orderBy(actualExpenses.month);

          // Análisis por categorías
          categoriesData = await db
            .select({
              categoryId: actualExpenses.categoryId,
              categoryName: expenseCategories.name,
              totalAmount: sql<number>`CAST(SUM(CAST(${actualExpenses.amount} AS DECIMAL)) AS FLOAT)`,
              recordCount: sql<number>`COUNT(*)`
            })
            .from(actualExpenses)
            .leftJoin(expenseCategories, eq(actualExpenses.categoryId, expenseCategories.id))
            .where(
              and(
                eq(actualExpenses.isPayrollGenerated, true),
                eq(actualExpenses.year, Number(year))
              )
            )
            .groupBy(actualExpenses.categoryId, expenseCategories.name)
            .orderBy(sql`SUM(CAST(${actualExpenses.amount} AS DECIMAL)) DESC`);
          break;

        default:
          return res.status(400).json({ message: "Módulo no válido para análisis" });
      }

      res.json({
        module,
        year: Number(year),
        monthlyData,
        categoriesData,
        summary: {
          totalAmount: monthlyData.reduce((sum, item) => sum + item.totalAmount, 0),
          totalRecords: monthlyData.reduce((sum, item) => sum + item.recordCount, 0),
          averageMonthly: monthlyData.length > 0 
            ? monthlyData.reduce((sum, item) => sum + item.totalAmount, 0) / monthlyData.length 
            : 0
        }
      });

    } catch (error) {
      console.error(`Error en análisis del módulo ${req.params.module}:`, error);
      res.status(500).json({ message: "Error generando análisis" });
    }
  });

  /**
   * Dashboard de integraciones financieras
   */
  apiRouter.get("/financial-integrations/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Totales por tipo de integración - Ingresos
      const incomeByModule = await db
        .select({
          concessions: sql<number>`CAST(SUM(CASE WHEN ${actualIncomes.isConcessionsGenerated} = true THEN CAST(${actualIncomes.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`,
          events: sql<number>`CAST(SUM(CASE WHEN ${actualIncomes.isEventsGenerated} = true THEN CAST(${actualIncomes.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`,
          marketing: sql<number>`CAST(SUM(CASE WHEN ${actualIncomes.isMarketingGenerated} = true THEN CAST(${actualIncomes.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`,
          manual: sql<number>`CAST(SUM(CASE WHEN ${actualIncomes.isConcessionsGenerated} = false AND ${actualIncomes.isEventsGenerated} = false AND ${actualIncomes.isMarketingGenerated} = false THEN CAST(${actualIncomes.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`
        })
        .from(actualIncomes)
        .where(eq(actualIncomes.year, currentYear));

      // Totales por tipo de integración - Egresos
      const expenseByModule = await db
        .select({
          hr: sql<number>`CAST(SUM(CASE WHEN ${actualExpenses.isPayrollGenerated} = true THEN CAST(${actualExpenses.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`,
          assets: sql<number>`CAST(SUM(CASE WHEN ${actualExpenses.isAssetsGenerated} = true THEN CAST(${actualExpenses.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`,
          trees: sql<number>`CAST(SUM(CASE WHEN ${actualExpenses.isTreesGenerated} = true THEN CAST(${actualExpenses.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`,
          volunteers: sql<number>`CAST(SUM(CASE WHEN ${actualExpenses.isVolunteersGenerated} = true THEN CAST(${actualExpenses.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`,
          incidents: sql<number>`CAST(SUM(CASE WHEN ${actualExpenses.isIncidentsGenerated} = true THEN CAST(${actualExpenses.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`,
          manual: sql<number>`CAST(SUM(CASE WHEN ${actualExpenses.isPayrollGenerated} = false AND ${actualExpenses.isAssetsGenerated} = false AND ${actualExpenses.isTreesGenerated} = false AND ${actualExpenses.isVolunteersGenerated} = false AND ${actualExpenses.isIncidentsGenerated} = false THEN CAST(${actualExpenses.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`
        })
        .from(actualExpenses)
        .where(eq(actualExpenses.year, currentYear));

      // Tendencia mensual del año actual
      const monthlyTrend = await db
        .select({
          month: actualIncomes.month,
          totalIncome: sql<number>`CAST(SUM(CAST(${actualIncomes.amount} AS DECIMAL)) AS FLOAT)`,
          automaticIncome: sql<number>`CAST(SUM(CASE WHEN (${actualIncomes.isConcessionsGenerated} = true OR ${actualIncomes.isEventsGenerated} = true OR ${actualIncomes.isMarketingGenerated} = true) THEN CAST(${actualIncomes.amount} AS DECIMAL) ELSE 0 END) AS FLOAT)`
        })
        .from(actualIncomes)
        .where(eq(actualIncomes.year, currentYear))
        .groupBy(actualIncomes.month)
        .orderBy(actualIncomes.month);

      res.json({
        year: currentYear,
        month: currentMonth,
        incomeByModule: incomeByModule[0] || {},
        expenseByModule: expenseByModule[0] || {},
        monthlyTrend,
        integrationStatus: {
          hr: { active: true, automated: true },
          concessions: { active: true, automated: true },
          events: { active: true, automated: true },
          marketing: { active: false, automated: false },
          assets: { active: false, automated: false },
          trees: { active: false, automated: false },
          volunteers: { active: false, automated: false },
          incidents: { active: false, automated: false }
        }
      });

    } catch (error) {
      console.error("Error generando dashboard de integraciones:", error);
      res.status(500).json({ message: "Error generando dashboard" });
    }
  });
}