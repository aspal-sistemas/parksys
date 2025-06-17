import { Router, Request, Response } from "express";
import { db } from "./db";
import { assets, assetMaintenances } from "@shared/schema";
import { actualExpenses, expenseCategories } from "@shared/finance-schema";
import { AssetsFinanceIntegration } from "./assets-finance-integration";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Rutas API para gestión de activos con integración financiera automática
 */
export function registerAssetsRoutes(app: any, apiRouter: Router, isAuthenticated: any) {

  // ============ GESTIÓN DE ACTIVOS ============

  /**
   * Crear nuevo activo con integración financiera automática
   */
  apiRouter.post("/assets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("=== CREANDO ACTIVO CON INTEGRACIÓN FINANCIERA ===");
      const assetData = req.body;
      
      // Crear el activo
      const [newAsset] = await db
        .insert(assets)
        .values({
          ...assetData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      console.log("Activo creado:", newAsset);

      // Si tiene precio de compra, crear gasto automático
      if (assetData.purchasePrice && parseFloat(assetData.purchasePrice) > 0) {
        try {
          const expenseRecord = await AssetsFinanceIntegration.createAssetPurchaseExpense({
            ...newAsset,
            purchasePrice: assetData.purchasePrice,
            purchaseDate: assetData.purchaseDate,
            invoiceNumber: assetData.invoiceNumber,
            isPaid: assetData.isPaid || false,
            paymentDate: assetData.paymentDate
          });
          
          console.log("Gasto financiero creado automáticamente:", expenseRecord.id);
        } catch (financeError) {
          console.error("Error creando gasto automático:", financeError);
          // No fallar la creación del activo por error financiero
        }
      }

      res.status(201).json({
        ...newAsset,
        financialIntegration: !!assetData.purchasePrice
      });

    } catch (error) {
      console.error("Error creando activo:", error);
      res.status(500).json({ message: "Error creando activo" });
    }
  });

  /**
   * Obtener activos con información financiera
   */
  apiRouter.get("/assets", async (req: Request, res: Response) => {
    try {
      const { parkId, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = db
        .select({
          id: assets.id,
          name: assets.name,
          description: assets.description,
          category: assets.category,
          status: assets.status,
          condition: assets.condition,
          purchasePrice: assets.purchasePrice,
          currentValue: assets.currentValue,
          purchaseDate: assets.purchaseDate,
          warrantyExpiration: assets.warrantyExpiration,
          location: assets.location,
          parkId: assets.parkId,
          createdAt: assets.createdAt
        })
        .from(assets);

      if (parkId) {
        query = query.where(eq(assets.parkId, Number(parkId)));
      }

      const assetsList = await query
        .orderBy(desc(assets.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // Obtener información financiera para cada activo
      const assetsWithFinance = await Promise.all(
        assetsList.map(async (asset) => {
          // Buscar gastos relacionados
          const relatedExpenses = await db
            .select({
              id: actualExpenses.id,
              amount: actualExpenses.amount,
              concept: actualExpenses.concept,
              date: actualExpenses.date
            })
            .from(actualExpenses)
            .where(
              and(
                eq(actualExpenses.isAssetsGenerated, true),
                sql`${actualExpenses.assetId} = ${asset.id}`
              )
            )
            .limit(5);

          return {
            ...asset,
            relatedExpenses,
            hasFinancialIntegration: relatedExpenses.length > 0
          };
        })
      );

      res.json(assetsWithFinance);

    } catch (error) {
      console.error("Error obteniendo activos:", error);
      res.status(500).json({ message: "Error obteniendo activos" });
    }
  });

  // ============ GESTIÓN DE MANTENIMIENTOS ============

  /**
   * Crear mantenimiento con integración financiera automática
   */
  apiRouter.post("/assets/:assetId/maintenances", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("=== CREANDO MANTENIMIENTO CON INTEGRACIÓN FINANCIERA ===");
      const { assetId } = req.params;
      const maintenanceData = req.body;

      // Crear el mantenimiento
      const [newMaintenance] = await db
        .insert(assetMaintenances)
        .values({
          ...maintenanceData,
          assetId: Number(assetId),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      console.log("Mantenimiento creado:", newMaintenance);

      // Si tiene costo y está completado, crear gasto automático
      if (maintenanceData.cost && 
          parseFloat(maintenanceData.cost) > 0 && 
          maintenanceData.status === 'completed') {
        
        try {
          const expenseRecord = await AssetsFinanceIntegration.createMaintenanceExpense({
            ...newMaintenance,
            cost: maintenanceData.cost,
            completedDate: maintenanceData.completedDate,
            invoiceNumber: maintenanceData.invoiceNumber,
            isPaid: maintenanceData.isPaid || false,
            paymentDate: maintenanceData.paymentDate
          });
          
          console.log("Gasto de mantenimiento creado automáticamente:", expenseRecord.id);
        } catch (financeError) {
          console.error("Error creando gasto de mantenimiento:", financeError);
          // No fallar la creación del mantenimiento por error financiero
        }
      }

      res.status(201).json({
        ...newMaintenance,
        financialIntegration: !!(maintenanceData.cost && maintenanceData.status === 'completed')
      });

    } catch (error) {
      console.error("Error creando mantenimiento:", error);
      res.status(500).json({ message: "Error creando mantenimiento" });
    }
  });

  /**
   * Actualizar estado de mantenimiento (puede activar integración financiera)
   */
  apiRouter.put("/maintenances/:id/complete", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { cost, completedDate, notes, invoiceNumber, isPaid, paymentDate } = req.body;

      // Actualizar mantenimiento como completado
      const [updatedMaintenance] = await db
        .update(assetMaintenances)
        .set({
          status: 'completed',
          cost: cost,
          completedDate: completedDate || new Date(),
          notes: notes,
          updatedAt: new Date()
        })
        .where(eq(assetMaintenances.id, Number(id)))
        .returning();

      // Si tiene costo, crear gasto automático
      if (cost && parseFloat(cost) > 0) {
        try {
          const expenseRecord = await AssetsFinanceIntegration.createMaintenanceExpense({
            ...updatedMaintenance,
            cost,
            completedDate: completedDate || new Date(),
            invoiceNumber,
            isPaid: isPaid || false,
            paymentDate
          });
          
          console.log("Gasto de mantenimiento creado al completar:", expenseRecord.id);
        } catch (financeError) {
          console.error("Error creando gasto al completar mantenimiento:", financeError);
        }
      }

      res.json({
        ...updatedMaintenance,
        financialIntegration: !!(cost && parseFloat(cost) > 0)
      });

    } catch (error) {
      console.error("Error completando mantenimiento:", error);
      res.status(500).json({ message: "Error completando mantenimiento" });
    }
  });

  /**
   * Obtener mantenimientos de un activo
   */
  apiRouter.get("/assets/:assetId/maintenances", async (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;

      const maintenancesList = await db
        .select()
        .from(assetMaintenances)
        .where(eq(assetMaintenances.assetId, Number(assetId)))
        .orderBy(desc(assetMaintenances.createdAt));

      // Agregar información financiera a cada mantenimiento
      const maintenancesWithFinance = await Promise.all(
        maintenancesList.map(async (maintenance) => {
          // Buscar gasto relacionado
          const [relatedExpense] = await db
            .select({
              id: actualExpenses.id,
              amount: actualExpenses.amount,
              concept: actualExpenses.concept,
              date: actualExpenses.date,
              isPaid: actualExpenses.isPaid
            })
            .from(actualExpenses)
            .where(
              and(
                eq(actualExpenses.isAssetsGenerated, true),
                sql`${actualExpenses.assetMaintenanceId} = ${maintenance.id}`
              )
            )
            .limit(1);

          return {
            ...maintenance,
            relatedExpense,
            hasFinancialIntegration: !!relatedExpense
          };
        })
      );

      res.json(maintenancesWithFinance);

    } catch (error) {
      console.error("Error obteniendo mantenimientos:", error);
      res.status(500).json({ message: "Error obteniendo mantenimientos" });
    }
  });

  // ============ ENDPOINTS DE INTEGRACIÓN FINANCIERA ============

  /**
   * Sincronizar activos existentes con finanzas
   */
  apiRouter.post("/assets/sync-finances", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const assetsResult = await AssetsFinanceIntegration.syncExistingAssets();
      const maintenancesResult = await AssetsFinanceIntegration.syncExistingMaintenances();

      res.json({
        success: true,
        message: "Sincronización de activos completada",
        results: {
          assets: assetsResult,
          maintenances: maintenancesResult
        }
      });

    } catch (error) {
      console.error("Error en sincronización de activos:", error);
      res.status(500).json({ 
        success: false,
        message: "Error durante la sincronización",
        error: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  /**
   * Obtener estadísticas financieras de activos
   */
  apiRouter.get("/assets/finance-stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { year = new Date().getFullYear() } = req.query;
      const stats = await AssetsFinanceIntegration.getAssetsExpenseStats(Number(year));

      res.json(stats);

    } catch (error) {
      console.error("Error obteniendo estadísticas financieras de activos:", error);
      res.status(500).json({ message: "Error obteniendo estadísticas" });
    }
  });

  /**
   * Obtener gastos detallados de activos
   */
  apiRouter.get("/assets/expenses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { limit = 50, page = 1 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const expenses = await AssetsFinanceIntegration.getAssetsExpensesDetailed(Number(limit), offset);

      res.json(expenses);

    } catch (error) {
      console.error("Error obteniendo gastos de activos:", error);
      res.status(500).json({ message: "Error obteniendo gastos" });
    }
  });

  /**
   * Dashboard de activos con información financiera
   */
  apiRouter.get("/assets/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentYear = new Date().getFullYear();

      // Estadísticas generales de activos
      const [assetStats] = await db
        .select({
          totalAssets: sql<number>`COUNT(*)`,
          activeAssets: sql<number>`COUNT(CASE WHEN ${assets.status} = 'active' THEN 1 END)`,
          maintenanceNeeded: sql<number>`COUNT(CASE WHEN ${assets.condition} = 'needs_maintenance' THEN 1 END)`,
          totalValue: sql<number>`CAST(SUM(CASE WHEN ${assets.currentValue} IS NOT NULL THEN CAST(${assets.currentValue} AS DECIMAL) ELSE 0 END) AS FLOAT)`
        })
        .from(assets);

      // Estadísticas financieras
      const financeStats = await AssetsFinanceIntegration.getAssetsExpenseStats(currentYear);

      // Mantenimientos por mes
      const [maintenanceStats] = await db
        .select({
          totalMaintenances: sql<number>`COUNT(*)`,
          completedMaintenances: sql<number>`COUNT(CASE WHEN ${assetMaintenances.status} = 'completed' THEN 1 END)`,
          pendingMaintenances: sql<number>`COUNT(CASE WHEN ${assetMaintenances.status} = 'pending' THEN 1 END)`
        })
        .from(assetMaintenances)
        .where(sql`EXTRACT(YEAR FROM ${assetMaintenances.createdAt}) = ${currentYear}`);

      res.json({
        year: currentYear,
        assetStats,
        financeStats,
        maintenanceStats,
        integrationStatus: {
          active: true,
          automated: true,
          lastSync: new Date()
        }
      });

    } catch (error) {
      console.error("Error generando dashboard de activos:", error);
      res.status(500).json({ message: "Error generando dashboard" });
    }
  });
}