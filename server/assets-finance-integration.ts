import { db } from "./db";
import { 
  actualExpenses, 
  expenseCategories,
  budgets 
} from "@shared/finance-schema";
import { 
  assets, 
  assetMaintenances,
  users,
  parks 
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Sistema de integración automática Activos → Finanzas
 * Maneja el flujo automático de gastos relacionados con activos y sus mantenimientos
 */
export class AssetsFinanceIntegration {

  /**
   * Categorías de gastos para activos
   */
  private static readonly ASSET_EXPENSE_CATEGORIES = {
    PURCHASE: "Compra de Activos",
    MAINTENANCE: "Mantenimiento de Activos", 
    REPAIR: "Reparación de Activos",
    DEPRECIATION: "Depreciación de Activos",
    INSURANCE: "Seguros de Activos",
    REPLACEMENT: "Reemplazo de Activos"
  };

  /**
   * Crear gasto automático cuando se registra una compra de activo
   */
  static async createAssetPurchaseExpense(assetData: any) {
    try {
      console.log("=== CREANDO GASTO AUTOMÁTICO POR COMPRA DE ACTIVO ===");
      console.log("Datos del activo:", assetData);

      // Obtener categoría de gastos para compra de activos
      const [expenseCategory] = await db
        .select()
        .from(expenseCategories)
        .where(eq(expenseCategories.name, this.ASSET_EXPENSE_CATEGORIES.PURCHASE))
        .limit(1);

      if (!expenseCategory) {
        console.log("Categoría de gastos no encontrada, creándola...");
        const [newCategory] = await db
          .insert(expenseCategories)
          .values({
            name: this.ASSET_EXPENSE_CATEGORIES.PURCHASE,
            description: "Gastos por compra de nuevos activos para el parque",
            isActive: true
          })
          .returning();
        
        console.log("Categoría creada:", newCategory);
      }

      // Obtener información del parque
      const [park] = await db
        .select({ name: parks.name })
        .from(parks)
        .where(eq(parks.id, assetData.parkId))
        .limit(1);

      // Crear registro de gasto automático
      const expenseData = {
        amount: assetData.purchasePrice || assetData.currentValue || "0",
        concept: `Compra de activo: ${assetData.name}`,
        description: `Adquisición de ${assetData.name} - ${assetData.description || 'Sin descripción'} para ${park?.name || 'Parque'}`,
        categoryId: expenseCategory?.id || 1,
        subcategoryId: null,
        date: assetData.purchaseDate || new Date(),
        month: new Date(assetData.purchaseDate || new Date()).getMonth() + 1,
        year: new Date(assetData.purchaseDate || new Date()).getFullYear(),
        budgetId: null,
        referenceNumber: `ASSET-${assetData.id || Date.now()}`,
        invoiceNumber: assetData.invoiceNumber || null,
        documentUrl: null,
        isPaid: assetData.isPaid || false,
        paymentDate: assetData.paymentDate || null,
        // Campos de integración automática
        isAssetsGenerated: true,
        assetId: assetData.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [newExpense] = await db
        .insert(actualExpenses)
        .values(expenseData)
        .returning();

      console.log("Gasto por compra de activo creado exitosamente:", newExpense);
      return newExpense;

    } catch (error) {
      console.error("Error creando gasto por compra de activo:", error);
      throw error;
    }
  }

  /**
   * Crear gasto automático cuando se registra un mantenimiento
   */
  static async createMaintenanceExpense(maintenanceData: any) {
    try {
      console.log("=== CREANDO GASTO AUTOMÁTICO POR MANTENIMIENTO ===");
      console.log("Datos del mantenimiento:", maintenanceData);

      // Obtener categoría de gastos para mantenimiento
      const [expenseCategory] = await db
        .select()
        .from(expenseCategories)
        .where(eq(expenseCategories.name, this.ASSET_EXPENSE_CATEGORIES.MAINTENANCE))
        .limit(1);

      if (!expenseCategory) {
        console.log("Categoría de mantenimiento no encontrada, creándola...");
        const [newCategory] = await db
          .insert(expenseCategories)
          .values({
            name: this.ASSET_EXPENSE_CATEGORIES.MAINTENANCE,
            description: "Gastos por mantenimiento preventivo y correctivo de activos",
            isActive: true
          })
          .returning();
        
        console.log("Categoría de mantenimiento creada:", newCategory);
      }

      // Obtener información del activo
      const [asset] = await db
        .select({ 
          name: assets.name, 
          description: assets.description,
          parkId: assets.parkId 
        })
        .from(assets)
        .where(eq(assets.id, maintenanceData.assetId))
        .limit(1);

      // Obtener información del parque
      const [park] = await db
        .select({ name: parks.name })
        .from(parks)
        .where(eq(parks.id, asset?.parkId || 1))
        .limit(1);

      // Determinar el tipo de mantenimiento para el concepto
      const maintenanceType = maintenanceData.type === 'preventive' ? 'Preventivo' : 
                             maintenanceData.type === 'corrective' ? 'Correctivo' : 
                             'General';

      // Crear registro de gasto automático
      const expenseData = {
        amount: maintenanceData.cost || "0",
        concept: `Mantenimiento ${maintenanceType}: ${asset?.name || 'Activo'}`,
        description: `${maintenanceData.description || 'Mantenimiento'} - ${asset?.name || 'Activo'} en ${park?.name || 'Parque'}`,
        categoryId: expenseCategory?.id || 1,
        subcategoryId: null,
        date: maintenanceData.completedDate || maintenanceData.scheduledDate || new Date(),
        month: new Date(maintenanceData.completedDate || maintenanceData.scheduledDate || new Date()).getMonth() + 1,
        year: new Date(maintenanceData.completedDate || maintenanceData.scheduledDate || new Date()).getFullYear(),
        budgetId: null,
        referenceNumber: `MAINT-${maintenanceData.id || Date.now()}`,
        invoiceNumber: maintenanceData.invoiceNumber || null,
        documentUrl: null,
        isPaid: maintenanceData.isPaid || false,
        paymentDate: maintenanceData.paymentDate || null,
        // Campos de integración automática
        isAssetsGenerated: true,
        assetMaintenanceId: maintenanceData.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [newExpense] = await db
        .insert(actualExpenses)
        .values(expenseData)
        .returning();

      console.log("Gasto por mantenimiento creado exitosamente:", newExpense);
      return newExpense;

    } catch (error) {
      console.error("Error creando gasto por mantenimiento:", error);
      throw error;
    }
  }

  /**
   * Sincronizar activos existentes con el sistema financiero
   */
  static async syncExistingAssets() {
    try {
      console.log("=== SINCRONIZANDO ACTIVOS EXISTENTES ===");

      // Obtener activos que tengan precio de compra pero no estén sincronizados
      const assetsToSync = await db
        .select()
        .from(assets)
        .where(
          and(
            sql`${assets.purchasePrice} IS NOT NULL`,
            sql`${assets.purchasePrice} > 0`
          )
        );

      console.log(`Encontrados ${assetsToSync.length} activos para sincronizar`);

      let syncCount = 0;
      const errors = [];

      for (const asset of assetsToSync) {
        try {
          // Verificar si ya existe un gasto para este activo
          const existingExpense = await db
            .select()
            .from(actualExpenses)
            .where(
              and(
                eq(actualExpenses.isAssetsGenerated, true),
                sql`${actualExpenses.assetId} = ${asset.id}`
              )
            )
            .limit(1);

          if (existingExpense.length === 0) {
            await this.createAssetPurchaseExpense(asset);
            syncCount++;
          }
        } catch (error) {
          console.error(`Error sincronizando activo ${asset.id}:`, error);
          errors.push({ assetId: asset.id, error: error.message });
        }
      }

      console.log(`Sincronización completada: ${syncCount} activos sincronizados`);
      return {
        message: `Sincronización de activos completada`,
        assetsProcessed: assetsToSync.length,
        assetsSynced: syncCount,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error("Error en sincronización de activos:", error);
      throw error;
    }
  }

  /**
   * Sincronizar mantenimientos existentes con el sistema financiero
   */
  static async syncExistingMaintenances() {
    try {
      console.log("=== SINCRONIZANDO MANTENIMIENTOS EXISTENTES ===");

      // Obtener mantenimientos que tengan costo pero no estén sincronizados
      const maintenancesToSync = await db
        .select()
        .from(assetMaintenances)
        .where(
          and(
            sql`${assetMaintenances.cost} IS NOT NULL`,
            sql`${assetMaintenances.cost} > 0`,
            eq(assetMaintenances.status, 'completed')
          )
        );

      console.log(`Encontrados ${maintenancesToSync.length} mantenimientos para sincronizar`);

      let syncCount = 0;
      const errors = [];

      for (const maintenance of maintenancesToSync) {
        try {
          // Verificar si ya existe un gasto para este mantenimiento
          const existingExpense = await db
            .select()
            .from(actualExpenses)
            .where(
              and(
                eq(actualExpenses.isAssetsGenerated, true),
                sql`${actualExpenses.assetMaintenanceId} = ${maintenance.id}`
              )
            )
            .limit(1);

          if (existingExpense.length === 0) {
            await this.createMaintenanceExpense(maintenance);
            syncCount++;
          }
        } catch (error) {
          console.error(`Error sincronizando mantenimiento ${maintenance.id}:`, error);
          errors.push({ maintenanceId: maintenance.id, error: error.message });
        }
      }

      console.log(`Sincronización completada: ${syncCount} mantenimientos sincronizados`);
      return {
        message: `Sincronización de mantenimientos completada`,
        maintenancesProcessed: maintenancesToSync.length,
        maintenancesSynced: syncCount,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error("Error en sincronización de mantenimientos:", error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de gastos por activos
   */
  static async getAssetsExpenseStats(year: number = new Date().getFullYear()) {
    try {
      // Gastos totales por activos
      const [totalStats] = await db
        .select({
          totalAmount: sql<number>`CAST(SUM(CAST(${actualExpenses.amount} AS DECIMAL)) AS FLOAT)`,
          recordCount: sql<number>`COUNT(*)`,
          purchaseExpenses: sql<number>`COUNT(CASE WHEN ${actualExpenses.assetId} IS NOT NULL THEN 1 END)`,
          maintenanceExpenses: sql<number>`COUNT(CASE WHEN ${actualExpenses.assetMaintenanceId} IS NOT NULL THEN 1 END)`
        })
        .from(actualExpenses)
        .where(
          and(
            eq(actualExpenses.isAssetsGenerated, true),
            eq(actualExpenses.year, year)
          )
        );

      // Gastos mensuales
      const monthlyStats = await db
        .select({
          month: actualExpenses.month,
          totalAmount: sql<number>`CAST(SUM(CAST(${actualExpenses.amount} AS DECIMAL)) AS FLOAT)`,
          recordCount: sql<number>`COUNT(*)`
        })
        .from(actualExpenses)
        .where(
          and(
            eq(actualExpenses.isAssetsGenerated, true),
            eq(actualExpenses.year, year)
          )
        )
        .groupBy(actualExpenses.month)
        .orderBy(actualExpenses.month);

      return {
        year,
        totalStats,
        monthlyStats,
        integrationActive: true
      };

    } catch (error) {
      console.error("Error obteniendo estadísticas de activos:", error);
      throw error;
    }
  }

  /**
   * Obtener gastos de activos con información detallada
   */
  static async getAssetsExpensesDetailed(limit: number = 50, offset: number = 0) {
    try {
      const expenses = await db
        .select({
          id: actualExpenses.id,
          amount: actualExpenses.amount,
          concept: actualExpenses.concept,
          description: actualExpenses.description,
          date: actualExpenses.date,
          referenceNumber: actualExpenses.referenceNumber,
          assetId: actualExpenses.assetId,
          assetMaintenanceId: actualExpenses.assetMaintenanceId,
          categoryName: expenseCategories.name,
          createdAt: actualExpenses.createdAt
        })
        .from(actualExpenses)
        .leftJoin(expenseCategories, eq(actualExpenses.categoryId, expenseCategories.id))
        .where(eq(actualExpenses.isAssetsGenerated, true))
        .orderBy(desc(actualExpenses.createdAt))
        .limit(limit)
        .offset(offset);

      return expenses;

    } catch (error) {
      console.error("Error obteniendo gastos detallados de activos:", error);
      throw error;
    }
  }
}