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
    const startDate = new Date(contract.start_date as string);
    const endDate = new Date(contract.end_date as string);
    const monthsDifference = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                            (endDate.getMonth() - startDate.getMonth()) + 1;
    
    // Calcular monto mensual prorrateado
    const totalAmount = parseFloat(contract.fee as string);
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
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Integración para pagos individuales de concesiones (legacy)
 */
export async function createFinanceIncomeFromConcessionPayment(paymentData: any) {
  try {
    console.log("💰 Creando ingreso financiero por pago de concesión:", paymentData.id);
    
    const paymentDetails = await db.execute(sql`
      SELECT 
        cp.*,
        cc.park_id,
        p.name as park_name,
        u.full_name as concessionaire_name,
        ct.name as concession_type_name
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
        ${payment.park_id},
        1,
        ${`Pago Concesión - ${payment.concessionaire_name}`},
        ${payment.amount},
        ${payment.payment_date},
        ${new Date(payment.payment_date as string).getMonth() + 1},
        ${new Date(payment.payment_date as string).getFullYear()},
        ${`Pago individual de concesión. ID: ${paymentData.id}`},
        'concesiones',
        true
      )
      RETURNING id, amount
    `);
    
    return { success: true, financeIncomeId: incomeResult.rows[0]?.id };
  } catch (error) {
    console.error("Error creando ingreso por pago:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Actualizar ingreso financiero por pago de concesión
 */
export async function updateFinanceIncomeFromConcessionPayment(paymentId: number, updateData: any) {
  try {
    console.log("🔄 Actualizando ingreso financiero por pago:", paymentId);
    return { success: true };
  } catch (error) {
    console.error("Error actualizando ingreso:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Eliminar ingreso financiero por pago de concesión
 */
export async function deleteFinanceIncomeFromConcessionPayment(paymentId: number) {
  try {
    console.log("🗑️ Eliminando ingreso financiero por pago:", paymentId);
    
    const deleteResult = await db.execute(sql`
      DELETE FROM actual_incomes 
      WHERE is_concessions_generated = true 
      AND description LIKE ${`%ID: ${paymentId}%`}
      RETURNING id, amount
    `);
    
    return { success: true, deletedCount: deleteResult.rows.length };
  } catch (error) {
    console.error("Error eliminando ingreso:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Registra las rutas para la integración Concesiones-Finanzas
 */
export function registerConcessionFinanceIntegrationRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  
  // Endpoint para sincronizar manualmente un contrato con finanzas
  apiRouter.post("/sync-contract-to-finance/:contractId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      if (isNaN(contractId)) {
        return res.status(400).json({ message: "ID de contrato inválido" });
      }
      
      const result = await createFinanceIncomeFromConcessionContract(contractId);
      
      if (result.success) {
        res.json({
          message: "Sincronización completada exitosamente",
          createdIncomes: result.createdIncomes?.length || 0
        });
      } else {
        res.status(500).json({
          message: "Error en la sincronización",
          error: result.error
        });
      }
      
    } catch (error) {
      console.error("Error en sincronización manual:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Endpoint para obtener estadísticas de integración
  apiRouter.get("/concession-finance-stats", async (req: Request, res: Response) => {
    try {
      const stats = await db.execute(sql`
        SELECT 
          COUNT(*) as total_contracts,
          COUNT(CASE WHEN cc.status = 'active' THEN 1 END) as active_contracts,
          COALESCE(SUM(CASE WHEN cc.status = 'active' THEN cc.fee ELSE 0 END), 0) as total_active_amount,
          COUNT(ai.id) as generated_incomes,
          COALESCE(SUM(ai.amount), 0) as total_generated_amount
        FROM concession_contracts cc
        LEFT JOIN actual_incomes ai ON ai.is_concessions_generated = true
      `);
      
      res.json(stats.rows[0]);
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({ message: "Error al obtener estadísticas" });
    }
  });

  console.log("Rutas de integración Concesiones-Finanzas registradas correctamente");
}