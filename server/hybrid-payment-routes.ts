/**
 * Rutas para el sistema de cobro híbrido de concesiones
 */

import { Router, Request, Response } from 'express';
import { db } from './db';
import { 
  contractPaymentConfigs,
  contractCharges,
  contractInvestments,
  contractBonuses,
  contractAuthorizedServices,
  contractIncomeReports,
  contractMonthlyPayments,
  concessionContracts,
  users
} from '../shared/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export function registerHybridPaymentRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  
  // ========== CONFIGURACIÓN DE PAGO ==========
  
  // Obtener configuración de pago de un contrato
  apiRouter.get('/contracts/:contractId/payment-config', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      const config = await db
        .select()
        .from(contractPaymentConfigs)
        .where(eq(contractPaymentConfigs.contractId, contractId))
        .limit(1);
        
      if (config.length === 0) {
        return res.status(404).json({ error: 'Configuración de pago no encontrada' });
      }
      
      // Obtener cargos asociados
      const charges = await db
        .select()
        .from(contractCharges)
        .where(eq(contractCharges.paymentConfigId, config[0].id))
        .orderBy(asc(contractCharges.createdAt));
      
      res.json({
        config: config[0],
        charges
      });
    } catch (error) {
      console.error('Error al obtener configuración de pago:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear o actualizar configuración de pago
  apiRouter.post('/contracts/:contractId/payment-config', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const {
        hasFixedPayment,
        hasPercentagePayment,
        hasPerUnitPayment,
        hasSpacePayment,
        hasMinimumGuarantee,
        minimumGuaranteeAmount,
        notes,
        charges = []
      } = req.body;

      // Verificar si ya existe configuración
      const existingConfig = await db
        .select()
        .from(contractPaymentConfigs)
        .where(eq(contractPaymentConfigs.contractId, contractId))
        .limit(1);

      let config;
      if (existingConfig.length > 0) {
        // Actualizar configuración existente
        const [updatedConfig] = await db
          .update(contractPaymentConfigs)
          .set({
            hasFixedPayment,
            hasPercentagePayment,
            hasPerUnitPayment,
            hasSpacePayment,
            hasMinimumGuarantee,
            minimumGuaranteeAmount,
            notes,
            updatedAt: new Date()
          })
          .where(eq(contractPaymentConfigs.id, existingConfig[0].id))
          .returning();
        config = updatedConfig;
      } else {
        // Crear nueva configuración
        const [newConfig] = await db
          .insert(contractPaymentConfigs)
          .values({
            contractId,
            hasFixedPayment,
            hasPercentagePayment,
            hasPerUnitPayment,
            hasSpacePayment,
            hasMinimumGuarantee,
            minimumGuaranteeAmount,
            notes
          })
          .returning();
        config = newConfig;
      }

      // Eliminar cargos existentes y crear nuevos
      await db
        .delete(contractCharges)
        .where(eq(contractCharges.paymentConfigId, config.id));

      const newCharges = [];
      for (const charge of charges) {
        const [newCharge] = await db
          .insert(contractCharges)
          .values({
            paymentConfigId: config.id,
            chargeType: charge.chargeType,
            name: charge.name,
            description: charge.description,
            fixedAmount: charge.fixedAmount,
            percentage: charge.percentage,
            perUnitAmount: charge.perUnitAmount,
            perM2Amount: charge.perM2Amount,
            frequency: charge.frequency,
            unitType: charge.unitType,
            spaceM2: charge.spaceM2,
            startDate: charge.startDate,
            endDate: charge.endDate
          })
          .returning();
        newCharges.push(newCharge);
      }

      res.json({
        config,
        charges: newCharges
      });
    } catch (error) {
      console.error('Error al guardar configuración de pago:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // ========== INVERSIONES ==========
  
  // Obtener inversiones de un contrato
  apiRouter.get('/contracts/:contractId/investments', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      const investments = await db
        .select()
        .from(contractInvestments)
        .where(eq(contractInvestments.contractId, contractId))
        .orderBy(desc(contractInvestments.createdAt));
      
      res.json(investments);
    } catch (error) {
      console.error('Error al obtener inversiones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nueva inversión
  apiRouter.post('/contracts/:contractId/investments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const {
        description,
        estimatedValue,
        actualValue,
        deadlineDate,
        completedDate,
        isAmortizable,
        amortizationMonths,
        monthlyAmortization,
        status,
        documentation,
        attachments
      } = req.body;

      const [investment] = await db
        .insert(contractInvestments)
        .values({
          contractId,
          description,
          estimatedValue,
          actualValue,
          deadlineDate,
          completedDate,
          isAmortizable,
          amortizationMonths,
          monthlyAmortization,
          status,
          documentation,
          attachments
        })
        .returning();

      res.json(investment);
    } catch (error) {
      console.error('Error al crear inversión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Actualizar inversión
  apiRouter.put('/investments/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;

      const [investment] = await db
        .update(contractInvestments)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(contractInvestments.id, id))
        .returning();

      if (!investment) {
        return res.status(404).json({ error: 'Inversión no encontrada' });
      }

      res.json(investment);
    } catch (error) {
      console.error('Error al actualizar inversión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // ========== BONIFICACIONES Y PENALIZACIONES ==========
  
  // Obtener bonificaciones de un contrato
  apiRouter.get('/contracts/:contractId/bonuses', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      const bonuses = await db
        .select()
        .from(contractBonuses)
        .where(eq(contractBonuses.contractId, contractId))
        .orderBy(desc(contractBonuses.createdAt));
      
      res.json(bonuses);
    } catch (error) {
      console.error('Error al obtener bonificaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nueva bonificación/penalización
  apiRouter.post('/contracts/:contractId/bonuses', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const {
        bonusType,
        name,
        description,
        amount,
        frequency,
        conditions,
        evaluationCriteria
      } = req.body;

      const [bonus] = await db
        .insert(contractBonuses)
        .values({
          contractId,
          bonusType,
          name,
          description,
          amount,
          frequency,
          conditions,
          evaluationCriteria
        })
        .returning();

      res.json(bonus);
    } catch (error) {
      console.error('Error al crear bonificación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // ========== SERVICIOS AUTORIZADOS ==========
  
  // Obtener servicios autorizados de un contrato
  apiRouter.get('/contracts/:contractId/authorized-services', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      const services = await db
        .select()
        .from(contractAuthorizedServices)
        .where(eq(contractAuthorizedServices.contractId, contractId))
        .orderBy(asc(contractAuthorizedServices.serviceName));
      
      res.json(services);
    } catch (error) {
      console.error('Error al obtener servicios autorizados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nuevo servicio autorizado
  apiRouter.post('/contracts/:contractId/authorized-services', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const {
        serviceName,
        serviceDescription,
        serviceCategory,
        canChargePublic,
        maxPublicRate,
        rateDescription,
        restrictions,
        requiredPermits
      } = req.body;

      const [service] = await db
        .insert(contractAuthorizedServices)
        .values({
          contractId,
          serviceName,
          serviceDescription,
          serviceCategory,
          canChargePublic,
          maxPublicRate,
          rateDescription,
          restrictions,
          requiredPermits
        })
        .returning();

      res.json(service);
    } catch (error) {
      console.error('Error al crear servicio autorizado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // ========== REPORTES DE INGRESOS ==========
  
  // Obtener reportes de ingresos de un contrato
  apiRouter.get('/contracts/:contractId/income-reports', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const { year, month } = req.query;
      
      let whereConditions = [eq(contractIncomeReports.contractId, contractId)];
      
      if (year) {
        whereConditions.push(eq(contractIncomeReports.reportYear, parseInt(year as string)));
      }
      
      if (month) {
        whereConditions.push(eq(contractIncomeReports.reportMonth, parseInt(month as string)));
      }

      const query = db
        .select({
          report: contractIncomeReports,
          verifiedByUser: {
            id: users.id,
            username: users.username,
            fullName: users.fullName
          }
        })
        .from(contractIncomeReports)
        .leftJoin(users, eq(contractIncomeReports.verifiedBy, users.id))
        .where(and(...whereConditions))
      
      const reports = await query.orderBy(
        desc(contractIncomeReports.reportYear),
        desc(contractIncomeReports.reportMonth)
      );
      
      res.json(reports);
    } catch (error) {
      console.error('Error al obtener reportes de ingresos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Crear nuevo reporte de ingresos
  apiRouter.post('/contracts/:contractId/income-reports', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const {
        reportMonth,
        reportYear,
        grossIncome,
        netIncome,
        serviceBreakdown,
        unitsSold,
        supportingDocuments,
        notes
      } = req.body;

      const [report] = await db
        .insert(contractIncomeReports)
        .values({
          contractId,
          reportMonth,
          reportYear,
          grossIncome,
          netIncome,
          serviceBreakdown,
          unitsSold,
          supportingDocuments,
          notes
        })
        .returning();

      res.json(report);
    } catch (error) {
      console.error('Error al crear reporte de ingresos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // ========== CÁLCULO DE PAGOS MENSUALES ==========
  
  // Calcular pago mensual para un contrato
  apiRouter.post('/contracts/:contractId/calculate-payment', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const { month, year, incomeReportId } = req.body;
      const calculatedBy = (req as any).user?.id;

      // Obtener configuración de pago
      const [config] = await db
        .select()
        .from(contractPaymentConfigs)
        .where(eq(contractPaymentConfigs.contractId, contractId))
        .limit(1);

      if (!config) {
        return res.status(404).json({ error: 'Configuración de pago no encontrada' });
      }

      // Obtener cargos
      const charges = await db
        .select()
        .from(contractCharges)
        .where(eq(contractCharges.paymentConfigId, config.id));

      // Obtener reporte de ingresos si se especifica
      let incomeReport = null;
      if (incomeReportId) {
        [incomeReport] = await db
          .select()
          .from(contractIncomeReports)
          .where(eq(contractIncomeReports.id, incomeReportId))
          .limit(1);
      }

      // Calcular montos
      let fixedAmount = 0;
      let percentageAmount = 0;
      let perUnitAmount = 0;
      let spaceAmount = 0;

      for (const charge of charges) {
        if (!charge.isActive) continue;

        switch (charge.chargeType) {
          case 'fixed':
            if (charge.fixedAmount) {
              fixedAmount += parseFloat(charge.fixedAmount.toString());
            }
            break;
          case 'percentage':
            if (charge.percentage && incomeReport) {
              percentageAmount += (parseFloat(incomeReport.grossIncome.toString()) * parseFloat(charge.percentage.toString())) / 100;
            }
            break;
          case 'per_unit':
            if (charge.perUnitAmount && incomeReport?.unitsSold && charge.unitType) {
              const units = (incomeReport.unitsSold as any)[charge.unitType] || 0;
              perUnitAmount += units * parseFloat(charge.perUnitAmount.toString());
            }
            break;
          case 'per_m2':
            if (charge.perM2Amount && charge.spaceM2) {
              spaceAmount += parseFloat(charge.spaceM2.toString()) * parseFloat(charge.perM2Amount.toString());
            }
            break;
        }
      }

      const subtotal = fixedAmount + percentageAmount + perUnitAmount + spaceAmount;

      // Aplicar garantía mínima
      let minimumGuaranteeApplied = false;
      let minimumGuaranteeAdjustment = 0;
      let finalAmount = subtotal;

      if (config.hasMinimumGuarantee && config.minimumGuaranteeAmount) {
        const minimumAmount = parseFloat(config.minimumGuaranteeAmount.toString());
        if (subtotal < minimumAmount) {
          minimumGuaranteeApplied = true;
          minimumGuaranteeAdjustment = minimumAmount - subtotal;
          finalAmount = minimumAmount;
        }
      }

      const calculationDetails = {
        charges: charges.map(c => ({
          name: c.name,
          type: c.chargeType,
          amount: c.chargeType === 'fixed' ? c.fixedAmount :
                  c.chargeType === 'percentage' ? percentageAmount :
                  c.chargeType === 'per_unit' ? perUnitAmount :
                  c.chargeType === 'per_m2' ? spaceAmount : 0
        })),
        subtotal,
        minimumGuarantee: {
          applied: minimumGuaranteeApplied,
          amount: config.minimumGuaranteeAmount,
          adjustment: minimumGuaranteeAdjustment
        }
      };

      // Guardar cálculo
      const [payment] = await db
        .insert(contractMonthlyPayments)
        .values({
          contractId,
          incomeReportId,
          paymentMonth: month,
          paymentYear: year,
          fixedAmount: fixedAmount.toString(),
          percentageAmount: percentageAmount.toString(),
          perUnitAmount: perUnitAmount.toString(),
          spaceAmount: spaceAmount.toString(),
          subtotal: subtotal.toString(),
          minimumGuaranteeApplied,
          minimumGuaranteeAdjustment: minimumGuaranteeAdjustment.toString(),
          totalAmount: finalAmount.toString(),
          calculationDetails,
          calculatedBy
        })
        .returning();

      res.json(payment);
    } catch (error) {
      console.error('Error al calcular pago:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Obtener pagos mensuales de un contrato
  apiRouter.get('/contracts/:contractId/monthly-payments', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const { year } = req.query;
      
      let whereConditions = [eq(contractMonthlyPayments.contractId, contractId)];
      
      if (year) {
        whereConditions.push(eq(contractMonthlyPayments.paymentYear, parseInt(year as string)));
      }

      const query = db
        .select({
          payment: contractMonthlyPayments,
          incomeReport: contractIncomeReports,
          calculatedByUser: {
            id: users.id,
            username: users.username,
            fullName: users.fullName
          }
        })
        .from(contractMonthlyPayments)
        .leftJoin(contractIncomeReports, eq(contractMonthlyPayments.incomeReportId, contractIncomeReports.id))
        .leftJoin(users, eq(contractMonthlyPayments.calculatedBy, users.id))
        .where(and(...whereConditions))
      
      const payments = await query.orderBy(
        desc(contractMonthlyPayments.paymentYear),
        desc(contractMonthlyPayments.paymentMonth)
      );
      
      res.json(payments);
    } catch (error) {
      console.error('Error al obtener pagos mensuales:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  console.log("Rutas del sistema de cobro híbrido registradas correctamente");
}