import type { Express, Request, Response } from "express";
import { Router } from "express";
import { db } from "./db";
import { 
  employees,
  payrollConcepts,
  payrollPeriods,
  payrollDetails,
  payrollProjections
} from "../shared/hr-finance-integration";
import { expenseCategories, budgets, actualExpenses } from "../shared/schema";
import { eq, and, gte, lte, sum, desc, asc, sql } from "drizzle-orm";

/**
 * Registra las rutas para la integración HR-Finanzas
 */
export function registerHRFinanceRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  
  // ========== EMPLEADOS ==========
  
  // Obtener todos los empleados
  apiRouter.get('/employees', async (req: Request, res: Response) => {
    try {
      const allEmployees = await db
        .select()
        .from(employees)
        .orderBy(asc(employees.fullName));
      
      res.json(allEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Error al obtener empleados' });
    }
  });

  // Crear nuevo empleado
  apiRouter.post('/employees', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const [newEmployee] = await db
        .insert(employees)
        .values(req.body)
        .returning();
      
      res.status(201).json(newEmployee);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Error al crear empleado' });
    }
  });

  // Actualizar empleado
  apiRouter.put('/employees/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.id);
      const [updatedEmployee] = await db
        .update(employees)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(employees.id, employeeId))
        .returning();
      
      res.json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Error al actualizar empleado' });
    }
  });

  // ========== CONCEPTOS DE NÓMINA ==========
  
  // Obtener conceptos de nómina
  apiRouter.get('/payroll-concepts', async (req: Request, res: Response) => {
    try {
      const concepts = await db
        .select()
        .from(payrollConcepts)
        .where(eq(payrollConcepts.isActive, true))
        .orderBy(asc(payrollConcepts.sortOrder));
      
      res.json(concepts);
    } catch (error) {
      console.error('Error fetching payroll concepts:', error);
      res.status(500).json({ error: 'Error al obtener conceptos de nómina' });
    }
  });

  // Crear concepto de nómina
  apiRouter.post('/payroll-concepts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const [newConcept] = await db
        .insert(payrollConcepts)
        .values(req.body)
        .returning();
      
      res.status(201).json(newConcept);
    } catch (error) {
      console.error('Error creating payroll concept:', error);
      res.status(500).json({ error: 'Error al crear concepto de nómina' });
    }
  });

  // ========== PERÍODOS DE NÓMINA ==========
  
  // Obtener períodos de nómina
  apiRouter.get('/payroll-periods', async (req: Request, res: Response) => {
    try {
      const { year } = req.query;
      let query = db.select().from(payrollPeriods);
      
      if (year) {
        query = query.where(
          sql`EXTRACT(YEAR FROM ${payrollPeriods.startDate}) = ${parseInt(year as string)}`
        );
      }
      
      const periods = await query.orderBy(desc(payrollPeriods.startDate));
      res.json(periods);
    } catch (error) {
      console.error('Error fetching payroll periods:', error);
      res.status(500).json({ error: 'Error al obtener períodos de nómina' });
    }
  });

  // Crear período de nómina
  apiRouter.post('/payroll-periods', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const [newPeriod] = await db
        .insert(payrollPeriods)
        .values(req.body)
        .returning();
      
      res.status(201).json(newPeriod);
    } catch (error) {
      console.error('Error creating payroll period:', error);
      res.status(500).json({ error: 'Error al crear período de nómina' });
    }
  });

  // ========== CÁLCULO DE NÓMINA ==========
  
  // Calcular nómina para un período
  apiRouter.post('/payroll-periods/:id/calculate', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const periodId = parseInt(req.params.id);
      
      // Obtener período
      const [period] = await db
        .select()
        .from(payrollPeriods)
        .where(eq(payrollPeriods.id, periodId));
      
      if (!period) {
        return res.status(404).json({ error: 'Período no encontrado' });
      }

      // Obtener empleados activos
      const activeEmployees = await db
        .select()
        .from(employees)
        .where(eq(employees.status, 'active'));

      // Obtener conceptos de nómina
      const concepts = await db
        .select()
        .from(payrollConcepts)
        .where(eq(payrollConcepts.isActive, true));

      // Limpiar cálculos anteriores
      await db
        .delete(payrollDetails)
        .where(eq(payrollDetails.payrollPeriodId, periodId));

      let totalGross = 0;
      let totalDeductions = 0;

      // Calcular para cada empleado
      for (const employee of activeEmployees) {
        for (const concept of concepts) {
          let amount = 0;

          // Cálculo básico según tipo de concepto
          if (concept.type === 'income') {
            if (concept.category === 'salary') {
              amount = parseFloat(employee.baseSalary);
            } else if (concept.category === 'overtime') {
              // Lógica para horas extra (se puede expandir)
              amount = 0;
            }
            totalGross += amount;
          } else if (concept.type === 'deduction') {
            // Cálculo de deducciones (impuestos, seguros, etc.)
            if (concept.category === 'tax') {
              amount = parseFloat(employee.baseSalary) * 0.16; // Ejemplo: 16% ISR
            } else if (concept.category === 'insurance') {
              amount = parseFloat(employee.baseSalary) * 0.04; // Ejemplo: 4% seguro social
            }
            totalDeductions += amount;
          }

          // Insertar detalle si hay monto
          if (amount > 0) {
            await db.insert(payrollDetails).values({
              payrollPeriodId: periodId,
              employeeId: employee.id,
              conceptId: concept.id,
              amount: amount.toString(),
              hours: concept.category === 'overtime' ? '0' : null,
              rate: concept.category === 'overtime' ? '0' : null,
            });
          }
        }
      }

      // Actualizar totales del período
      const totalNet = totalGross - totalDeductions;
      await db
        .update(payrollPeriods)
        .set({
          totalGross: totalGross.toString(),
          totalDeductions: totalDeductions.toString(),
          totalNet: totalNet.toString(),
          status: 'calculated',
          updatedAt: new Date()
        })
        .where(eq(payrollPeriods.id, periodId));

      res.json({ 
        message: 'Nómina calculada exitosamente',
        totalGross,
        totalDeductions,
        totalNet 
      });
    } catch (error) {
      console.error('Error calculating payroll:', error);
      res.status(500).json({ error: 'Error al calcular nómina' });
    }
  });

  // ========== INTEGRACIÓN CON FINANZAS ==========
  
  // Transferir nómina a gastos reales
  apiRouter.post('/payroll-periods/:id/transfer-to-finance', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const periodId = parseInt(req.params.id);
      
      // Obtener período con detalles
      const [period] = await db
        .select()
        .from(payrollPeriods)
        .where(eq(payrollPeriods.id, periodId));
      
      if (!period || period.status !== 'calculated') {
        return res.status(400).json({ error: 'El período debe estar calculado' });
      }

      // Obtener detalles agrupados por concepto
      const conceptTotals = await db
        .select({
          conceptId: payrollDetails.conceptId,
          total: sum(payrollDetails.amount),
        })
        .from(payrollDetails)
        .where(eq(payrollDetails.payrollPeriodId, periodId))
        .groupBy(payrollDetails.conceptId);

      // Transferir cada concepto como gasto real
      for (const conceptTotal of conceptTotals) {
        // Obtener el concepto para obtener la categoría de gasto
        const [concept] = await db
          .select()
          .from(payrollConcepts)
          .where(eq(payrollConcepts.id, conceptTotal.conceptId));

        if (concept && concept.expenseCategoryId) {
          // Crear gasto real
          await db.insert(actualExpenses).values({
            parkId: null, // Gasto general (se puede específicar por parque)
            categoryId: concept.expenseCategoryId,
            concept: `Nómina - ${concept.name} (${period.name})`,
            amount: conceptTotal.total || '0',
            date: period.payDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            description: `Transferencia automática de nómina del período ${period.name}`,
            referenceNumber: `NOM-${period.id}-${concept.id}`,
            paymentMethod: 'transfer',
            supplier: 'Nómina',
          });
        }
      }

      // Marcar período como transferido
      await db
        .update(payrollPeriods)
        .set({ 
          status: 'paid',
          updatedAt: new Date() 
        })
        .where(eq(payrollPeriods.id, periodId));

      res.json({ message: 'Nómina transferida a finanzas exitosamente' });
    } catch (error) {
      console.error('Error transferring payroll to finance:', error);
      res.status(500).json({ error: 'Error al transferir nómina a finanzas' });
    }
  });

  // ========== PROYECCIONES AUTOMÁTICAS ==========
  
  // Generar proyecciones de nómina para presupuesto
  apiRouter.post('/payroll-projections/generate/:budgetId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const budgetId = parseInt(req.params.budgetId);
      const { year } = req.body;

      // Obtener empleados activos
      const activeEmployees = await db
        .select()
        .from(employees)
        .where(eq(employees.status, 'active'));

      // Obtener conceptos de nómina
      const concepts = await db
        .select()
        .from(payrollConcepts)
        .where(eq(payrollConcepts.isActive, true));

      // Limpiar proyecciones existentes para ese presupuesto
      await db
        .delete(payrollProjections)
        .where(eq(payrollProjections.budgetId, budgetId));

      // Generar proyecciones mensuales
      for (let month = 1; month <= 12; month++) {
        for (const concept of concepts) {
          let monthlyTotal = 0;

          // Calcular total mensual por concepto
          for (const employee of activeEmployees) {
            if (concept.type === 'income' && concept.category === 'salary') {
              monthlyTotal += parseFloat(employee.baseSalary);
            } else if (concept.type === 'deduction') {
              if (concept.category === 'tax') {
                monthlyTotal += parseFloat(employee.baseSalary) * 0.16;
              } else if (concept.category === 'insurance') {
                monthlyTotal += parseFloat(employee.baseSalary) * 0.04;
              }
            }
          }

          // Ajustes estacionales
          if (month === 12 && concept.category === 'salary') {
            // Aguinaldo en diciembre
            monthlyTotal += monthlyTotal * 0.5; // 50% adicional
          }

          // Insertar proyección
          if (monthlyTotal > 0) {
            await db.insert(payrollProjections).values({
              budgetId,
              year,
              month,
              conceptId: concept.id,
              projectedAmount: monthlyTotal.toString(),
            });
          }
        }
      }

      res.json({ message: 'Proyecciones de nómina generadas exitosamente' });
    } catch (error) {
      console.error('Error generating payroll projections:', error);
      res.status(500).json({ error: 'Error al generar proyecciones de nómina' });
    }
  });

  // Obtener proyecciones de nómina
  apiRouter.get('/payroll-projections/:budgetId', async (req: Request, res: Response) => {
    try {
      const budgetId = parseInt(req.params.budgetId);
      
      const projections = await db
        .select({
          month: payrollProjections.month,
          conceptName: payrollConcepts.name,
          conceptType: payrollConcepts.type,
          conceptCategory: payrollConcepts.category,
          projectedAmount: payrollProjections.projectedAmount,
          actualAmount: payrollProjections.actualAmount,
          variance: payrollProjections.variance,
        })
        .from(payrollProjections)
        .innerJoin(payrollConcepts, eq(payrollProjections.conceptId, payrollConcepts.id))
        .where(eq(payrollProjections.budgetId, budgetId))
        .orderBy(asc(payrollProjections.month), asc(payrollConcepts.sortOrder));

      res.json(projections);
    } catch (error) {
      console.error('Error fetching payroll projections:', error);
      res.status(500).json({ error: 'Error al obtener proyecciones de nómina' });
    }
  });

  // ========== DASHBOARD INTEGRADO ==========
  
  // KPIs integrados HR-Finanzas
  apiRouter.get('/hr-finance-kpis', async (req: Request, res: Response) => {
    try {
      const { year = new Date().getFullYear(), budgetId } = req.query;

      // Total empleados activos
      const [totalEmployees] = await db
        .select({ count: sql<number>`count(*)` })
        .from(employees)
        .where(eq(employees.status, 'active'));

      // Costo promedio por empleado
      const [avgSalary] = await db
        .select({ avg: sql<number>`avg(${employees.baseSalary})` })
        .from(employees)
        .where(eq(employees.status, 'active'));

      // Proyección anual de nómina
      let annualPayrollProjection = 0;
      if (budgetId) {
        const [totalProjection] = await db
          .select({ total: sum(payrollProjections.projectedAmount) })
          .from(payrollProjections)
          .where(eq(payrollProjections.budgetId, parseInt(budgetId as string)));
        
        annualPayrollProjection = parseFloat(totalProjection.total || '0');
      }

      // Gastos reales de nómina del año actual
      const currentYear = parseInt(year as string);
      const [actualPayrollExpenses] = await db
        .select({ total: sum(actualExpenses.amount) })
        .from(actualExpenses)
        .where(
          and(
            sql`${actualExpenses.concept} LIKE 'Nómina%'`,
            sql`EXTRACT(YEAR FROM ${actualExpenses.date}) = ${currentYear}`
          )
        );

      const actualPayrollTotal = parseFloat(actualPayrollExpenses.total || '0');
      const variance = annualPayrollProjection - actualPayrollTotal;
      const variancePercentage = annualPayrollProjection > 0 
        ? (variance / annualPayrollProjection) * 100 
        : 0;

      res.json({
        totalEmployees: totalEmployees.count || 0,
        averageSalary: parseFloat(avgSalary.avg || '0'),
        annualPayrollProjection,
        actualPayrollExpenses: actualPayrollTotal,
        variance,
        variancePercentage,
        payrollBudgetUtilization: annualPayrollProjection > 0 
          ? (actualPayrollTotal / annualPayrollProjection) * 100 
          : 0,
      });
    } catch (error) {
      console.error('Error fetching HR-Finance KPIs:', error);
      res.status(500).json({ error: 'Error al obtener KPIs integrados' });
    }
  });

  console.log('Rutas de integración HR-Finanzas registradas correctamente');
}