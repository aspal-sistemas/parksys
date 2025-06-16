import { Router, Request, Response } from "express";
import { db } from "./db";
import { employees, payrollConcepts, payrollPeriods, payrollDetails, actualExpenses } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Registra las rutas del módulo de Recursos Humanos integrado con Finanzas
 */
export function registerHRRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  
  // ========== EMPLEADOS ==========
  
  // Obtener todos los empleados
  apiRouter.get("/employees", async (req: Request, res: Response) => {
    try {
      const allEmployees = await db.select().from(employees);
      res.json(allEmployees);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Crear empleado
  apiRouter.post("/employees", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const [newEmployee] = await db
        .insert(employees)
        .values(req.body)
        .returning();
      res.status(201).json(newEmployee);
    } catch (error) {
      console.error("Error al crear empleado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Actualizar empleado
  apiRouter.put("/employees/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const [updatedEmployee] = await db
        .update(employees)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(employees.id, id))
        .returning();
      
      if (!updatedEmployee) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      
      res.json(updatedEmployee);
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // ========== CONCEPTOS DE NÓMINA ==========
  
  // Obtener conceptos de nómina
  apiRouter.get("/payroll-concepts", async (req: Request, res: Response) => {
    try {
      const concepts = await db.select().from(payrollConcepts);
      res.json(concepts);
    } catch (error) {
      console.error("Error al obtener conceptos de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Crear concepto de nómina
  apiRouter.post("/payroll-concepts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const [newConcept] = await db
        .insert(payrollConcepts)
        .values(req.body)
        .returning();
      res.status(201).json(newConcept);
    } catch (error) {
      console.error("Error al crear concepto de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // ========== PERÍODOS DE NÓMINA ==========
  
  // Obtener períodos de nómina
  apiRouter.get("/payroll-periods", async (req: Request, res: Response) => {
    try {
      const periods = await db.select().from(payrollPeriods);
      res.json(periods);
    } catch (error) {
      console.error("Error al obtener períodos de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Crear período de nómina
  apiRouter.post("/payroll-periods", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const [newPeriod] = await db
        .insert(payrollPeriods)
        .values(req.body)
        .returning();
      res.status(201).json(newPeriod);
    } catch (error) {
      console.error("Error al crear período de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // ========== DETALLES DE NÓMINA ==========
  
  // Obtener detalles de nómina por período
  apiRouter.get("/payroll-periods/:id/details", async (req: Request, res: Response) => {
    try {
      const periodId = parseInt(req.params.id);
      const details = await db
        .select({
          id: payrollDetails.id,
          employeeId: payrollDetails.employeeId,
          conceptId: payrollDetails.conceptId,
          amount: payrollDetails.amount,
          hours: payrollDetails.hours,
          rate: payrollDetails.rate,
          notes: payrollDetails.notes,
          employeeName: employees.fullName,
          conceptName: payrollConcepts.name,
          conceptType: payrollConcepts.type,
          conceptCategory: payrollConcepts.category,
        })
        .from(payrollDetails)
        .innerJoin(employees, eq(payrollDetails.employeeId, employees.id))
        .innerJoin(payrollConcepts, eq(payrollDetails.conceptId, payrollConcepts.id))
        .where(eq(payrollDetails.payrollPeriodId, periodId));
      
      res.json(details);
    } catch (error) {
      console.error("Error al obtener detalles de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Crear detalle de nómina
  apiRouter.post("/payroll-details", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const [newDetail] = await db
        .insert(payrollDetails)
        .values(req.body)
        .returning();
      res.status(201).json(newDetail);
    } catch (error) {
      console.error("Error al crear detalle de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // ========== INTEGRACIÓN CON FINANZAS ==========
  
  // Generar gastos de nómina automáticamente
  apiRouter.post("/payroll-periods/:id/generate-expenses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const periodId = parseInt(req.params.id);
      
      // Obtener el período de nómina
      const [period] = await db
        .select()
        .from(payrollPeriods)
        .where(eq(payrollPeriods.id, periodId));
      
      if (!period) {
        return res.status(404).json({ error: "Período de nómina no encontrado" });
      }

      // Obtener detalles de nómina agrupados por concepto
      const payrollSummary = await db
        .select({
          conceptId: payrollDetails.conceptId,
          conceptName: payrollConcepts.name,
          conceptType: payrollConcepts.type,
          conceptCategory: payrollConcepts.category,
          expenseCategoryId: payrollConcepts.expenseCategoryId,
          totalAmount: sql<number>`sum(${payrollDetails.amount})`,
        })
        .from(payrollDetails)
        .innerJoin(payrollConcepts, eq(payrollDetails.conceptId, payrollConcepts.id))
        .where(eq(payrollDetails.payrollPeriodId, periodId))
        .groupBy(
          payrollDetails.conceptId,
          payrollConcepts.name,
          payrollConcepts.type,
          payrollConcepts.category,
          payrollConcepts.expenseCategoryId
        );

      // Generar gastos por cada concepto de nómina
      const expensesToCreate = payrollSummary
        .filter(item => item.conceptType === 'income' && item.expenseCategoryId) // Solo conceptos de ingresos que tienen categoría de gasto
        .map(item => ({
          parkId: 1, // Parque por defecto, se puede parametrizar
          categoryId: item.expenseCategoryId!,
          concept: `Nómina - ${item.conceptName}`,
          amount: item.totalAmount.toString(),
          date: period.payDate,
          month: new Date(period.payDate).getMonth() + 1,
          year: new Date(period.payDate).getFullYear(),
          supplier: "Nómina Interna",
          description: `Gastos de nómina generados automáticamente del período ${period.name}`,
          referenceNumber: `NOM-${period.id}-${item.conceptId}`,
          isPaid: true,
          payrollPeriodId: periodId,
          isPayrollGenerated: true,
        }));

      if (expensesToCreate.length === 0) {
        return res.status(400).json({ error: "No hay conceptos de nómina configurados para generar gastos" });
      }

      // Insertar los gastos
      const createdExpenses = await db
        .insert(actualExpenses)
        .values(expensesToCreate)
        .returning();

      res.status(201).json({
        message: `Se generaron ${createdExpenses.length} gastos de nómina`,
        expenses: createdExpenses,
      });
    } catch (error) {
      console.error("Error al generar gastos de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Obtener gastos relacionados con nómina (datos de muestra por ahora)
  apiRouter.get("/payroll-expenses", async (req: Request, res: Response) => {
    try {
      // Datos de muestra para demostrar la integración
      const payrollExpenses = [
        {
          id: 9001,
          concept: "Nómina - Salarios Base",
          amount: "88000.00",
          date: "2025-01-05",
          supplier: "Departamento de Recursos Humanos",
          description: "Gasto generado automáticamente desde nómina del período Enero 2025",
          referenceNumber: "NOM-2025-01-SAL",
          isPaid: true,
          isPayrollGenerated: true,
          parkId: 1,
          periodName: "Nómina Enero 2025"
        },
        {
          id: 9002,
          concept: "Nómina - Bonificaciones",
          amount: "8800.00",
          date: "2025-01-05",
          supplier: "Departamento de Recursos Humanos",
          description: "Bonos de productividad generados automáticamente",
          referenceNumber: "NOM-2025-01-BON",
          isPaid: true,
          isPayrollGenerated: true,
          parkId: 1,
          periodName: "Nómina Enero 2025"
        },
        {
          id: 9003,
          concept: "Nómina - Tiempo Extra",
          amount: "4200.00",
          date: "2025-01-05",
          supplier: "Departamento de Recursos Humanos",
          description: "Horas extra trabajadas en eventos especiales",
          referenceNumber: "NOM-2025-01-OVT",
          isPaid: true,
          isPayrollGenerated: true,
          parkId: 1,
          periodName: "Nómina Enero 2025"
        }
      ];
      
      res.json(payrollExpenses);
    } catch (error) {
      console.error("Error al obtener gastos de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Resumen de nómina para dashboard
  apiRouter.get("/payroll-summary", async (req: Request, res: Response) => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // Total de nómina del mes actual
      const monthlyTotal = await db
        .select({
          totalGross: sql<number>`sum(${payrollPeriods.totalGross})`,
          totalNet: sql<number>`sum(${payrollPeriods.totalNet})`,
          totalDeductions: sql<number>`sum(${payrollPeriods.totalDeductions})`,
        })
        .from(payrollPeriods)
        .where(
          and(
            sql`extract(year from ${payrollPeriods.payDate}) = ${currentYear}`,
            sql`extract(month from ${payrollPeriods.payDate}) = ${currentMonth}`
          )
        );

      // Total de empleados activos
      const activeEmployees = await db
        .select({ count: sql<number>`count(*)` })
        .from(employees)
        .where(eq(employees.status, 'active'));

      // Gastos de nómina del mes
      const monthlyExpenses = await db
        .select({
          totalExpenses: sql<number>`sum(${actualExpenses.amount})`,
        })
        .from(actualExpenses)
        .where(
          and(
            eq(actualExpenses.isPayrollGenerated, true),
            eq(actualExpenses.year, currentYear),
            eq(actualExpenses.month, currentMonth)
          )
        );

      res.json({
        monthlyPayroll: monthlyTotal[0] || { totalGross: 0, totalNet: 0, totalDeductions: 0 },
        activeEmployees: activeEmployees[0]?.count || 0,
        monthlyExpenses: monthlyExpenses[0]?.totalExpenses || 0,
        currentMonth,
        currentYear,
      });
    } catch (error) {
      console.error("Error al obtener resumen de nómina:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  console.log("Rutas del módulo de Recursos Humanos registradas correctamente");
}