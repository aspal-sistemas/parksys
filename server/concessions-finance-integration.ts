/**
 * INTEGRACIÓN FINANCIERA: CONCESIONES → FINANZAS
 * ===============================================
 * 
 * Sistema de integración automática que sincroniza los pagos de concesiones
 * con el módulo de finanzas, siguiendo el mismo patrón que HR/Nómina.
 * 
 * Flujo:
 * 1. Concesionario realiza pago → se registra en concession_payments
 * 2. Sistema automáticamente crea ingreso en actual_incomes
 * 3. Categorización automática según tipo de concesión
 * 4. Trazabilidad completa y badges visuales
 */

import { Request, Response, Router } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Integración automática: Crear ingreso en Finanzas cuando se registra un pago de concesión
 */
export async function createFinanceIncomeFromConcessionPayment(paymentData: any) {
  try {
    console.log("🏪 Iniciando integración Concesiones → Finanzas:", paymentData.id);
    
    // Obtener información completa del pago y contrato
    const paymentDetails = await db.execute(sql`
      SELECT 
        cp.*,
        cc.park_id,
        cc.monthly_amount,
        p.name as park_name,
        u.full_name as concessionaire_name,
        ct.name as concession_type_name,
        ct.id as concession_type_id
      FROM concession_payments cp
      LEFT JOIN concession_contracts cc ON cp.contract_id = cc.id
      LEFT JOIN parks p ON cc.park_id = p.id
      LEFT JOIN users u ON cc.concessionaire_id = u.id
      LEFT JOIN concession_types ct ON cc.concession_type_id = ct.id
      WHERE cp.id = ${paymentData.id}
    `);

    if (paymentDetails.rows.length === 0) {
      throw new Error("Pago de concesión no encontrado");
    }

    const payment = paymentDetails.rows[0];

    // Solo crear ingreso si el pago está confirmado/pagado
    if (payment.status !== 'paid') {
      console.log("⏳ Pago no confirmado, no se creará ingreso financiero");
      return;
    }

    // Determinar categoría de ingreso según tipo de concesión
    let categoryCode = 'ING-CONC-001'; // Código por defecto
    let categoryName = 'Ingresos por Concesiones';
    
    if (payment.concession_type_name && typeof payment.concession_type_name === 'string') {
      switch (payment.concession_type_name.toLowerCase()) {
        case 'restaurante':
        case 'cafetería':
          categoryCode = 'ING-CONC-REST';
          categoryName = 'Ingresos por Concesiones - Restaurantes';
          break;
        case 'tienda':
        case 'comercio':
          categoryCode = 'ING-CONC-COM';
          categoryName = 'Ingresos por Concesiones - Comercio';
          break;
        case 'deportivo':
        case 'recreativo':
          categoryCode = 'ING-CONC-DEP';
          categoryName = 'Ingresos por Concesiones - Deportivas';
          break;
        default:
          categoryCode = 'ING-CONC-001';
          categoryName = 'Ingresos por Concesiones - General';
      }
    }

    // Verificar/crear categoría de ingreso
    const categoryResult = await db.execute(sql`
      SELECT id FROM income_categories 
      WHERE code = ${categoryCode}
    `);

    let categoryId;
    if (categoryResult.rows.length === 0) {
      // Crear nueva categoría
      const newCategory = await db.execute(sql`
        INSERT INTO income_categories (code, name, description, is_active, level)
        VALUES (${categoryCode}, ${categoryName}, 'Ingresos generados por concesiones en parques', true, 2)
        RETURNING id
      `);
      categoryId = newCategory.rows[0].id;
      console.log("📊 Nueva categoría de ingreso creada:", categoryName);
    } else {
      categoryId = categoryResult.rows[0].id;
    }

    // Crear el ingreso en actual_incomes
    const incomeResult = await db.execute(sql`
      INSERT INTO actual_incomes (
        category_id,
        amount,
        date,
        description,
        park_id,
        municipality_id,
        invoice_number,
        payment_method,
        notes,
        
        -- Campos de integración
        source_module,
        source_id,
        source_table,
        integration_status,
        
        created_at,
        updated_at
      )
      VALUES (
        ${categoryId},
        ${payment.amount},
        ${payment.payment_date},
        ${`Pago de concesión - ${payment.concessionaire_name} (${payment.concession_type_name})`},
        ${payment.park_id},
        1, -- Municipality ID por defecto
        ${payment.invoice_number || null},
        ${payment.payment_type || 'transferencia'},
        ${`Integración automática desde concesiones. Contrato ID: ${payment.contract_id}`},
        
        -- Integración
        'concessions',
        ${payment.id},
        'concession_payments',
        'synchronized',
        
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    const createdIncome = incomeResult.rows[0];
    
    console.log("💰 Ingreso financiero creado automáticamente:", {
      financeId: createdIncome.id,
      amount: payment.amount,
      category: categoryName,
      park: payment.park_name,
      concessionaire: payment.concessionaire_name
    });

    // Actualizar el pago de concesión con referencia al ingreso financiero
    await db.execute(sql`
      UPDATE concession_payments 
      SET 
        finance_income_id = ${createdIncome.id},
        updated_at = NOW()
      WHERE id = ${payment.id}
    `);

    return {
      success: true,
      financeIncomeId: createdIncome.id,
      amount: payment.amount,
      category: categoryName
    };

  } catch (error) {
    console.error("❌ Error en integración Concesiones → Finanzas:", error);
    throw error;
  }
}

/**
 * Actualizar ingreso financiero cuando se modifica un pago de concesión
 */
export async function updateFinanceIncomeFromConcessionPayment(paymentId: number, updateData: any) {
  try {
    console.log("🔄 Actualizando integración Concesiones → Finanzas:", paymentId);

    // Buscar el ingreso financiero asociado
    const financeIncomeResult = await db.execute(sql`
      SELECT ai.* FROM actual_incomes ai
      WHERE ai.source_module = 'concessions' 
      AND ai.source_id = ${paymentId}
      AND ai.source_table = 'concession_payments'
    `);

    if (financeIncomeResult.rows.length === 0) {
      console.log("⚠️ No se encontró ingreso financiero asociado");
      return;
    }

    const financeIncome = financeIncomeResult.rows[0];

    // Actualizar el ingreso financiero
    await db.execute(sql`
      UPDATE actual_incomes
      SET
        amount = ${updateData.amount || financeIncome.amount},
        date = ${updateData.payment_date || financeIncome.date},
        payment_method = ${updateData.payment_type || financeIncome.payment_method},
        invoice_number = ${updateData.invoice_number || financeIncome.invoice_number},
        updated_at = NOW()
      WHERE id = ${financeIncome.id}
    `);

    console.log("✅ Ingreso financiero actualizado correctamente");

  } catch (error) {
    console.error("❌ Error actualizando integración Concesiones → Finanzas:", error);
    throw error;
  }
}

/**
 * Eliminar ingreso financiero cuando se elimina un pago de concesión
 */
export async function deleteFinanceIncomeFromConcessionPayment(paymentId: number) {
  try {
    console.log("🗑️ Eliminando integración Concesiones → Finanzas:", paymentId);

    // Eliminar el ingreso financiero asociado
    const deleteResult = await db.execute(sql`
      DELETE FROM actual_incomes
      WHERE source_module = 'concessions' 
      AND source_id = ${paymentId}
      AND source_table = 'concession_payments'
      RETURNING id, amount
    `);

    if (deleteResult.rows.length > 0) {
      console.log("✅ Ingreso financiero eliminado:", deleteResult.rows[0]);
    }

  } catch (error) {
    console.error("❌ Error eliminando integración Concesiones → Finanzas:", error);
    throw error;
  }
}

/**
 * Registrar rutas para gestión de integraciones financieras de concesiones
 */
export function registerConcessionFinanceIntegrationRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  console.log("Registrando rutas de integración Concesiones-Finanzas...");

  // Dashboard de integración concesiones-finanzas
  apiRouter.get("/concessions-finance-integration/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Estadísticas generales
      const statsResult = await db.execute(sql`
        SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_payments,
          SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
          SUM(CASE WHEN payment_status = 'late' THEN 1 ELSE 0 END) as late_payments
        FROM concession_payments
        WHERE payment_date >= DATE_TRUNC('year', CURRENT_DATE)
      `);

      // Ingresos por parque
      const parkIncomeResult = await db.execute(sql`
        SELECT 
          p.name as park_name,
          SUM(cp.amount) as total_income,
          COUNT(cp.id) as payment_count
        FROM concession_payments cp
        JOIN concession_contracts cc ON cp.contract_id = cc.id
        JOIN parks p ON cc.park_id = p.id
        WHERE cp.payment_status = 'paid'
        AND cp.payment_date >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY p.id, p.name
        ORDER BY total_income DESC
      `);

      // Ingresos por tipo de concesión
      const typeIncomeResult = await db.execute(sql`
        SELECT 
          ct.name as concession_type,
          SUM(cp.amount) as total_income,
          COUNT(cp.id) as payment_count
        FROM concession_payments cp
        JOIN concession_contracts cc ON cp.contract_id = cc.id
        JOIN concession_types ct ON cc.concession_type_id = ct.id
        WHERE cp.payment_status = 'paid'
        AND cp.payment_date >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY ct.id, ct.name
        ORDER BY total_income DESC
      `);

      // Estado de sincronización
      const syncStatusResult = await db.execute(sql`
        SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN finance_income_id IS NOT NULL THEN 1 ELSE 0 END) as synchronized_payments
        FROM concession_payments
        WHERE payment_status = 'paid'
      `);

      res.json({
        stats: statsResult.rows[0],
        parkIncome: parkIncomeResult.rows,
        typeIncome: typeIncomeResult.rows,
        syncStatus: syncStatusResult.rows[0]
      });

    } catch (error) {
      console.error("Error obteniendo dashboard de integración:", error);
      res.status(500).json({ message: "Error obteniendo dashboard de integración" });
    }
  });

  // Sincronización manual de pagos existentes
  apiRouter.post("/concessions-finance-integration/sync-all", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("🔄 Iniciando sincronización masiva de concesiones...");

      // Obtener todos los pagos confirmados sin sincronizar
      const paymentsResult = await db.execute(sql`
        SELECT * FROM concession_payments
        WHERE payment_status = 'paid'
        AND finance_income_id IS NULL
      `);

      let synchronized = 0;
      let errors = 0;

      for (const payment of paymentsResult.rows) {
        try {
          await createFinanceIncomeFromConcessionPayment(payment);
          synchronized++;
        } catch (error) {
          console.error(`Error sincronizando pago ${payment.id}:`, error);
          errors++;
        }
      }

      res.json({
        message: "Sincronización completada",
        synchronized,
        errors,
        total: paymentsResult.rows.length
      });

    } catch (error) {
      console.error("Error en sincronización masiva:", error);
      res.status(500).json({ message: "Error en sincronización masiva" });
    }
  });

  // Verificar estado de sincronización de un pago específico
  apiRouter.get("/concessions-finance-integration/payment/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const paymentResult = await db.execute(sql`
        SELECT 
          cp.*,
          ai.id as finance_income_id,
          ai.amount as finance_amount,
          ai.date as finance_date
        FROM concession_payments cp
        LEFT JOIN actual_incomes ai ON ai.source_module = 'concessions' 
          AND ai.source_id = cp.id 
          AND ai.source_table = 'concession_payments'
        WHERE cp.id = ${id}
      `);

      if (paymentResult.rows.length === 0) {
        return res.status(404).json({ message: "Pago no encontrado" });
      }

      const payment = paymentResult.rows[0];
      const isSynchronized = payment.finance_income_id !== null;

      res.json({
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
        isSynchronized,
        financeIncomeId: payment.finance_income_id,
        financeAmount: payment.finance_amount,
        syncDate: payment.finance_date
      });

    } catch (error) {
      console.error("Error verificando estado de sincronización:", error);
      res.status(500).json({ message: "Error verificando estado de sincronización" });
    }
  });
}