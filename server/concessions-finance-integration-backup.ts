/**
 * INTEGRACIÓN FINANCIERA: CONCESIONES → FINANZAS
 * ===============================================
 * 
 * Sistema de integración automática que sincroniza los contratos de concesiones
 * con el módulo de finanzas, creando ingresos con prorrateo mensual.
 * 
 * Flujo:
 * 1. Contrato de concesión creado → se registra en concession_contracts
 * 2. Sistema automáticamente crea ingresos mensuales en actual_incomes
 * 3. Categorización automática con categoría "Concesiones" (ING001)
 * 4. Prorrateo mensual para contratos anuales
 * 5. Aparece en matriz de flujo de efectivo mensual
 */

import { Request, Response, Router } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Integración automática: Crear ingresos mensuales en Finanzas cuando se crea un contrato de concesión
 */
export async function createFinanceIncomeFromConcessionContract(contractId: number) {
  try {
    console.log("🏪 Iniciando integración Contrato → Finanzas:", contractId);
    
    // Obtener información completa del contrato
    const contractDetails = await db.execute(sql`
      SELECT 
        cc.*,
        p.name as park_name,
        u.full_name as concessionaire_name,
        ct.name as concession_type_name
      FROM concession_contracts cc
      LEFT JOIN parks p ON cc.park_id = p.id
      LEFT JOIN users u ON cc.concessionaire_id = u.id
      LEFT JOIN concession_types ct ON cc.concession_type_id = ct.id
      WHERE cc.id = ${contractId}
    `);

    if (contractDetails.rows.length === 0) {
      throw new Error("Contrato de concesión no encontrado");
    }

    const contract = contractDetails.rows[0];
    
    // Calcular duración del contrato en meses
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);
    const monthsDifference = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                            (endDate.getMonth() - startDate.getMonth()) + 1;
    
    // Calcular monto mensual prorrateado
    const totalAmount = parseFloat(contract.fee);
    const monthlyAmount = totalAmount / monthsDifference;
    
    console.log(`📊 Contrato: ${contract.concessionaire_name} - ${contract.concession_type_name}`);
    console.log(`💰 Monto total: $${totalAmount}, Duración: ${monthsDifference} meses, Mensual: $${monthlyAmount.toFixed(2)}`);
    
    // Crear ingresos mensuales
    const createdIncomes = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < monthsDifference; i++) {
      const incomeDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const formattedDate = incomeDate.toISOString().split('T')[0];
      
      // Crear ingreso mensual en actual_incomes
      const incomeResult = await db.execute(sql`
        INSERT INTO actual_incomes (
          park_id, 
          category_id, 
          concept, 
          amount, 
          date, 
          month, 
          year, 
          description,
          source,
          is_concessions_generated
        ) VALUES (
          ${contract.park_id},
          1, -- ID de categoría "Concesiones" (ING001)
          ${`Concesión ${contract.concession_type_name} - ${contract.concessionaire_name}`},
          ${monthlyAmount.toFixed(2)},
          ${formattedDate},
          ${incomeDate.getMonth() + 1},
          ${incomeDate.getFullYear()},
          ${`Ingreso mensual por concesión. Contrato ID: ${contractId}`},
          'concesiones',
          true
        )
        RETURNING id, amount, date
      `);
      
      if (incomeResult.rows.length > 0) {
        createdIncomes.push(incomeResult.rows[0]);
        console.log(`✅ Ingreso mensual creado: ${formattedDate} - $${monthlyAmount.toFixed(2)}`);
      }
    }
    
    console.log(`🎉 Integración completada: ${createdIncomes.length} ingresos mensuales creados`);
    return { success: true, createdIncomes };
    
  } catch (error) {
    console.error("❌ Error en integración Contrato → Finanzas:", error);
    // No fallar la creación del contrato si falla la integración
    return { success: false, error: error.message };
  }
}

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
    if (contract.status !== 'active' && contract.status !== 'pending') {
      console.log("⏳ Contrato no activo, no se creará ingreso financiero");
      return;
    }

    // Determinar categoría de ingreso según tipo de concesión
    let categoryCode = 'ING-CONC-001'; // Código por defecto
    let categoryName = 'Ingresos por Concesiones';
    
    if (contract.concession_type_name) {
      switch (contract.concession_type_name.toLowerCase()) {
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
    const contractDate = new Date(contract.start_date as string);
    const concept = `Concesión - ${contract.concessionaire_name || 'Concesionario'}`;
    const description = `Ingreso por contrato de concesión - ${contract.concessionaire_name || 'Concesionario'} (${contract.concession_type_name || 'General'})`;
    
    const incomeResult = await db.execute(sql`
      INSERT INTO actual_incomes (
        category_id,
        amount,
        date,
        concept,
        description,
        park_id,
        month,
        year
      )
      VALUES (
        ${categoryId},
        ${contract.fee},
        ${contract.start_date},
        ${concept},
        ${description},
        ${contract.park_id},
        ${contractDate.getMonth() + 1},
        ${contractDate.getFullYear()}
      )
      RETURNING *
    `);

    const createdIncome = incomeResult.rows[0];
    
    console.log("💰 Ingreso financiero creado automáticamente:", {
      financeId: createdIncome.id,
      amount: contract.fee,
      category: categoryName,
      park: contract.park_name,
      concessionaire: contract.concessionaire_name
    });

    return {
      success: true,
      financeIncomeId: createdIncome.id,
      amount: contract.fee,
      category: categoryName
    };

  } catch (error) {
    console.error("❌ Error en integración Contrato → Finanzas:", error);
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

  // Sincronización manual de contratos existentes
  apiRouter.post("/concessions-finance/sync", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("🔄 Iniciando sincronización de contratos de concesión...");

      // Obtener todos los contratos activos/pendientes sin ingreso financiero asociado
      const contractsResult = await db.execute(sql`
        SELECT cc.* FROM concession_contracts cc
        LEFT JOIN actual_incomes ai ON ai.source_module = 'concessions' 
          AND ai.source_id = cc.id 
          AND ai.source_table = 'concession_contracts'
        WHERE cc.status IN ('active', 'pending')
        AND ai.id IS NULL
      `);

      let synchronized = 0;
      let errors = 0;

      for (const contract of contractsResult.rows) {
        try {
          await createFinanceIncomeFromConcessionContract(contract);
          synchronized++;
        } catch (error) {
          console.error(`Error sincronizando contrato ${contract.id}:`, error);
          errors++;
        }
      }

      res.json({
        message: "Sincronización de contratos completada",
        synchronized,
        errors,
        total: contractsResult.rows.length
      });

    } catch (error) {
      console.error("Error en sincronización de contratos:", error);
      res.status(500).json({ message: "Error en sincronización de contratos" });
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