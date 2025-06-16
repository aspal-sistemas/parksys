import { db } from "./db";
import { 
  actualIncome,
  incomeCategories,
  concessionPayments,
  concessionContracts 
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { FinancialIntegrationUtils } from "@shared/financial-integration-types";

/**
 * Integración Concesiones → Finanzas
 * Genera automáticamente ingresos cuando se registran pagos de concesionarios
 */

export class ConcessionsFinanceIntegration {
  
  /**
   * Procesa un pago de concesión y genera el ingreso correspondiente
   */
  static async processPayment(paymentId: number) {
    try {
      // Obtener datos del pago y contrato
      const [payment] = await db
        .select({
          paymentId: concessionPayments.id,
          amount: concessionPayments.amount,
          paymentDate: concessionPayments.paymentDate,
          concept: concessionPayments.concept,
          contractId: concessionPayments.contractId,
          contractTitle: concessionContracts.title,
          contractType: concessionContracts.type,
          parkId: concessionContracts.parkId
        })
        .from(concessionPayments)
        .innerJoin(concessionContracts, eq(concessionPayments.contractId, concessionContracts.id))
        .where(eq(concessionPayments.id, paymentId));

      if (!payment) {
        throw new Error(`Pago de concesión ${paymentId} no encontrado`);
      }

      // Determinar categoría de ingreso según el tipo de pago
      const categoryCode = this.getCategoryCodeByPaymentType(payment.concept, payment.contractType);
      
      // Buscar categoría de ingreso
      const [category] = await db
        .select()
        .from(incomeCategories)
        .where(eq(incomeCategories.code, categoryCode));

      if (!category) {
        // Crear categoría automáticamente si no existe
        await this.createIncomeCategory(categoryCode);
        const [newCategory] = await db
          .select()
          .from(incomeCategories)
          .where(eq(incomeCategories.code, categoryCode));
        
        if (!newCategory) {
          throw new Error(`No se pudo crear la categoría ${categoryCode}`);
        }
      }

      // Generar referencia única
      const reference = FinancialIntegrationUtils.generateReference(
        'concessions', 
        payment.paymentId, 
        new Date(payment.paymentDate)
      );

      // Verificar si ya existe un ingreso para este pago
      const [existingIncome] = await db
        .select()
        .from(actualIncome)
        .where(eq(actualIncome.referenceNumber, reference));

      if (existingIncome) {
        console.log(`Ingreso ya existe para pago ${paymentId}: ${reference}`);
        return existingIncome;
      }

      // Crear registro de ingreso automático
      const incomeData = {
        parkId: payment.parkId,
        categoryId: category?.id || 1,
        concept: `Concesión - ${payment.concept}`,
        amount: payment.amount,
        date: payment.paymentDate,
        month: new Date(payment.paymentDate).getMonth() + 1,
        year: new Date(payment.paymentDate).getFullYear(),
        source: `Contrato: ${payment.contractTitle}`,
        description: `Ingreso generado automáticamente desde pago de concesión. Contrato: ${payment.contractTitle}`,
        referenceNumber: reference,
        isReceived: true,
        isConcessionsGenerated: true
      };

      const [newIncome] = await db
        .insert(actualIncome)
        .values(incomeData)
        .returning();

      console.log(`✅ Ingreso automático creado: ${newIncome.concept} - ${newIncome.amount}`);
      return newIncome;

    } catch (error) {
      console.error(`❌ Error procesando pago de concesión ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Determina la categoría de ingreso según el tipo de pago
   */
  private static getCategoryCodeByPaymentType(concept: string, contractType: string): string {
    const conceptLower = concept.toLowerCase();
    
    if (conceptLower.includes('renta') || conceptLower.includes('alquiler')) {
      return 'CONC-REN';
    }
    
    if (conceptLower.includes('porcentaje') || conceptLower.includes('venta')) {
      return 'CONC-POR';
    }
    
    if (conceptLower.includes('multa') || conceptLower.includes('penalización')) {
      return 'CONC-MUL';
    }
    
    if (conceptLower.includes('renovación') || conceptLower.includes('renovacion')) {
      return 'CONC-REV';
    }
    
    // Categoría por defecto
    return 'CONC-REN';
  }

  /**
   * Crea una categoría de ingreso automáticamente
   */
  private static async createIncomeCategory(code: string) {
    const categoryMappings = {
      'CONC-REN': {
        name: 'Rentas de Concesiones',
        description: 'Ingresos por rentas mensuales de concesionarios'
      },
      'CONC-POR': {
        name: 'Porcentajes de Ventas',
        description: 'Ingresos por porcentajes de ventas de concesionarios'
      },
      'CONC-MUL': {
        name: 'Multas por Incumplimiento',
        description: 'Ingresos por multas a concesionarios'
      },
      'CONC-REV': {
        name: 'Renovaciones de Contratos',
        description: 'Ingresos por renovaciones de contratos de concesión'
      }
    };

    const categoryData = categoryMappings[code as keyof typeof categoryMappings] || {
      name: 'Ingresos de Concesiones',
      description: 'Ingresos generales de concesiones'
    };

    await db.insert(incomeCategories).values({
      code,
      name: categoryData.name,
      description: categoryData.description,
      level: 1,
      isActive: true,
      sortOrder: 1
    });

    console.log(`📁 Categoría de ingreso creada: ${code} - ${categoryData.name}`);
  }

  /**
   * Sincroniza todos los pagos existentes que no tienen ingresos asociados
   */
  static async syncExistingPayments() {
    try {
      console.log("🔄 Sincronizando pagos de concesiones existentes...");

      // Obtener pagos que no tienen ingresos asociados
      const paymentsWithoutIncome = await db
        .select({
          paymentId: concessionPayments.id,
          amount: concessionPayments.amount,
          concept: concessionPayments.concept,
          paymentDate: concessionPayments.paymentDate
        })
        .from(concessionPayments)
        .leftJoin(
          actualIncome, 
          sql`${actualIncome.referenceNumber} LIKE ${'CONC-%'} || ${concessionPayments.id} || '%'`
        )
        .where(sql`${actualIncome.id} IS NULL`);

      console.log(`📊 Encontrados ${paymentsWithoutIncome.length} pagos sin ingresos asociados`);

      // Procesar cada pago
      for (const payment of paymentsWithoutIncome) {
        try {
          await this.processPayment(payment.paymentId);
        } catch (error) {
          console.error(`Error procesando pago ${payment.paymentId}:`, error);
        }
      }

      console.log("✅ Sincronización de concesiones completada");

    } catch (error) {
      console.error("❌ Error en sincronización de concesiones:", error);
      throw error;
    }
  }

  /**
   * Elimina un ingreso cuando se elimina un pago de concesión
   */
  static async removeIncomeForPayment(paymentId: number) {
    try {
      const reference = `CONC-%${paymentId}%`;
      
      const deletedIncome = await db
        .delete(actualIncome)
        .where(sql`${actualIncome.referenceNumber} LIKE ${reference}`)
        .returning();

      if (deletedIncome.length > 0) {
        console.log(`🗑️ Ingreso eliminado para pago ${paymentId}`);
      }

      return deletedIncome;

    } catch (error) {
      console.error(`Error eliminando ingreso para pago ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un ingreso cuando se modifica un pago de concesión
   */
  static async updateIncomeForPayment(paymentId: number) {
    try {
      // Eliminar ingreso existente
      await this.removeIncomeForPayment(paymentId);
      
      // Crear nuevo ingreso con datos actualizados
      const newIncome = await this.processPayment(paymentId);
      
      console.log(`🔄 Ingreso actualizado para pago ${paymentId}`);
      return newIncome;

    } catch (error) {
      console.error(`Error actualizando ingreso para pago ${paymentId}:`, error);
      throw error;
    }
  }
}