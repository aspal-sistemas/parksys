import type { Express, Request, Response } from "express";
import { Router } from "express";
import { db } from "./db";
import { 
  incomeCategories,
  incomeSubcategories,
  expenseCategories,
  expenseSubcategories,
  budgets,
  budgetIncomeLines,
  budgetExpenseLines,
  actualIncomes,
  actualExpenses,
  cashFlowProjections
} from "../shared/finance-schema";
import { eq, and, gte, lte, sum, desc, asc } from "drizzle-orm";

/**
 * Registra las rutas para el módulo financiero
 */
export function registerFinanceRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  console.log("Registrando rutas del módulo financiero...");

  // ============ CATEGORÍAS DE INGRESOS ============
  
  // Obtener todas las categorías de ingresos
  apiRouter.get("/income-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de ingresos:", error);
      res.status(500).json({ message: "Error al obtener categorías de ingresos" });
    }
  });

  // Obtener subcategorías por categoría de ingresos
  apiRouter.get("/income-categories/:categoryId/subcategories", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const subcategories = await db.select()
        .from(incomeSubcategories)
        .where(and(
          eq(incomeSubcategories.categoryId, categoryId),
          eq(incomeSubcategories.isActive, true)
        ));
      res.json(subcategories);
    } catch (error) {
      console.error("Error al obtener subcategorías de ingresos:", error);
      res.status(500).json({ message: "Error al obtener subcategorías" });
    }
  });

  // ============ CATEGORÍAS DE EGRESOS ============
  
  // Obtener todas las categorías de egresos
  apiRouter.get("/expense-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de egresos:", error);
      res.status(500).json({ message: "Error al obtener categorías de egresos" });
    }
  });

  // Obtener subcategorías por categoría de egresos
  apiRouter.get("/expense-categories/:categoryId/subcategories", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const subcategories = await db.select()
        .from(expenseSubcategories)
        .where(and(
          eq(expenseSubcategories.categoryId, categoryId),
          eq(expenseSubcategories.isActive, true)
        ));
      res.json(subcategories);
    } catch (error) {
      console.error("Error al obtener subcategorías de egresos:", error);
      res.status(500).json({ message: "Error al obtener subcategorías" });
    }
  });

  // ============ PRESUPUESTOS ============
  
  // Obtener todos los presupuestos
  apiRouter.get("/budgets", async (req: Request, res: Response) => {
    try {
      const { parkId, year } = req.query;
      let query = db.select().from(budgets);
      
      if (parkId) {
        query = query.where(eq(budgets.parkId, parseInt(parkId as string)));
      }
      if (year) {
        query = query.where(eq(budgets.year, parseInt(year as string)));
      }
      
      const budgetList = await query.orderBy(desc(budgets.year));
      res.json(budgetList);
    } catch (error) {
      console.error("Error al obtener presupuestos:", error);
      res.status(500).json({ message: "Error al obtener presupuestos" });
    }
  });

  // Crear nuevo presupuesto
  apiRouter.post("/budgets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const budgetData = req.body;
      const [newBudget] = await db.insert(budgets).values(budgetData).returning();
      res.status(201).json(newBudget);
    } catch (error) {
      console.error("Error al crear presupuesto:", error);
      res.status(500).json({ message: "Error al crear presupuesto" });
    }
  });

  // Obtener detalles de un presupuesto
  apiRouter.get("/budgets/:id", async (req: Request, res: Response) => {
    try {
      const budgetId = parseInt(req.params.id);
      
      const [budget] = await db.select().from(budgets).where(eq(budgets.id, budgetId));
      
      if (!budget) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }

      // Obtener líneas de ingresos
      const incomeLines = await db.select({
        id: budgetIncomeLines.id,
        categoryId: budgetIncomeLines.categoryId,
        subcategoryId: budgetIncomeLines.subcategoryId,
        concept: budgetIncomeLines.concept,
        projectedAmount: budgetIncomeLines.projectedAmount,
        january: budgetIncomeLines.january,
        february: budgetIncomeLines.february,
        march: budgetIncomeLines.march,
        april: budgetIncomeLines.april,
        may: budgetIncomeLines.may,
        june: budgetIncomeLines.june,
        july: budgetIncomeLines.july,
        august: budgetIncomeLines.august,
        september: budgetIncomeLines.september,
        october: budgetIncomeLines.october,
        november: budgetIncomeLines.november,
        december: budgetIncomeLines.december,
        categoryName: incomeCategories.name,
        subcategoryName: incomeSubcategories.name,
      })
      .from(budgetIncomeLines)
      .leftJoin(incomeCategories, eq(budgetIncomeLines.categoryId, incomeCategories.id))
      .leftJoin(incomeSubcategories, eq(budgetIncomeLines.subcategoryId, incomeSubcategories.id))
      .where(eq(budgetIncomeLines.budgetId, budgetId));

      // Obtener líneas de egresos
      const expenseLines = await db.select({
        id: budgetExpenseLines.id,
        categoryId: budgetExpenseLines.categoryId,
        subcategoryId: budgetExpenseLines.subcategoryId,
        concept: budgetExpenseLines.concept,
        projectedAmount: budgetExpenseLines.projectedAmount,
        january: budgetExpenseLines.january,
        february: budgetExpenseLines.february,
        march: budgetExpenseLines.march,
        april: budgetExpenseLines.april,
        may: budgetExpenseLines.may,
        june: budgetExpenseLines.june,
        july: budgetExpenseLines.july,
        august: budgetExpenseLines.august,
        september: budgetExpenseLines.september,
        october: budgetExpenseLines.october,
        november: budgetExpenseLines.november,
        december: budgetExpenseLines.december,
        categoryName: expenseCategories.name,
        subcategoryName: expenseSubcategories.name,
      })
      .from(budgetExpenseLines)
      .leftJoin(expenseCategories, eq(budgetExpenseLines.categoryId, expenseCategories.id))
      .leftJoin(expenseSubcategories, eq(budgetExpenseLines.subcategoryId, expenseSubcategories.id))
      .where(eq(budgetExpenseLines.budgetId, budgetId));

      res.json({
        budget,
        incomeLines,
        expenseLines,
      });
    } catch (error) {
      console.error("Error al obtener detalles del presupuesto:", error);
      res.status(500).json({ message: "Error al obtener detalles del presupuesto" });
    }
  });

  // ============ LÍNEAS DE PRESUPUESTO ============
  
  // Agregar línea de ingreso al presupuesto
  apiRouter.post("/budgets/:id/income-lines", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const budgetId = parseInt(req.params.id);
      const lineData = { ...req.body, budgetId };
      
      const [newLine] = await db.insert(budgetIncomeLines).values(lineData).returning();
      res.status(201).json(newLine);
    } catch (error) {
      console.error("Error al agregar línea de ingreso:", error);
      res.status(500).json({ message: "Error al agregar línea de ingreso" });
    }
  });

  // Agregar línea de egreso al presupuesto
  apiRouter.post("/budgets/:id/expense-lines", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const budgetId = parseInt(req.params.id);
      const lineData = { ...req.body, budgetId };
      
      const [newLine] = await db.insert(budgetExpenseLines).values(lineData).returning();
      res.status(201).json(newLine);
    } catch (error) {
      console.error("Error al agregar línea de egreso:", error);
      res.status(500).json({ message: "Error al agregar línea de egreso" });
    }
  });

  // ============ INGRESOS REALES ============
  
  // Obtener ingresos reales
  apiRouter.get("/actual-incomes", async (req: Request, res: Response) => {
    try {
      const { parkId, year, month } = req.query;
      let query = db.select({
        id: actualIncomes.id,
        parkId: actualIncomes.parkId,
        concept: actualIncomes.concept,
        amount: actualIncomes.amount,
        date: actualIncomes.date,
        month: actualIncomes.month,
        year: actualIncomes.year,
        description: actualIncomes.description,
        referenceNumber: actualIncomes.referenceNumber,
        categoryName: incomeCategories.name,
        subcategoryName: incomeSubcategories.name,
      })
      .from(actualIncomes)
      .leftJoin(incomeCategories, eq(actualIncomes.categoryId, incomeCategories.id))
      .leftJoin(incomeSubcategories, eq(actualIncomes.subcategoryId, incomeSubcategories.id));
      
      const conditions = [];
      if (parkId) conditions.push(eq(actualIncomes.parkId, parseInt(parkId as string)));
      if (year) conditions.push(eq(actualIncomes.year, parseInt(year as string)));
      if (month) conditions.push(eq(actualIncomes.month, parseInt(month as string)));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const incomes = await query.orderBy(desc(actualIncomes.date));
      res.json(incomes);
    } catch (error) {
      console.error("Error al obtener ingresos reales:", error);
      res.status(500).json({ message: "Error al obtener ingresos reales" });
    }
  });

  // Registrar ingreso real
  apiRouter.post("/actual-incomes", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const incomeData = req.body;
      // Extraer mes y año de la fecha
      const date = new Date(incomeData.date);
      incomeData.month = date.getMonth() + 1;
      incomeData.year = date.getFullYear();
      
      const [newIncome] = await db.insert(actualIncomes).values(incomeData).returning();
      res.status(201).json(newIncome);
    } catch (error) {
      console.error("Error al registrar ingreso:", error);
      res.status(500).json({ message: "Error al registrar ingreso" });
    }
  });

  // ============ EGRESOS REALES ============
  
  // Obtener egresos reales
  apiRouter.get("/actual-expenses", async (req: Request, res: Response) => {
    try {
      const { parkId, year, month } = req.query;
      let query = db.select({
        id: actualExpenses.id,
        parkId: actualExpenses.parkId,
        concept: actualExpenses.concept,
        amount: actualExpenses.amount,
        date: actualExpenses.date,
        month: actualExpenses.month,
        year: actualExpenses.year,
        supplier: actualExpenses.supplier,
        description: actualExpenses.description,
        referenceNumber: actualExpenses.referenceNumber,
        invoiceNumber: actualExpenses.invoiceNumber,
        isPaid: actualExpenses.isPaid,
        paymentDate: actualExpenses.paymentDate,
        categoryName: expenseCategories.name,
        subcategoryName: expenseSubcategories.name,
      })
      .from(actualExpenses)
      .leftJoin(expenseCategories, eq(actualExpenses.categoryId, expenseCategories.id))
      .leftJoin(expenseSubcategories, eq(actualExpenses.subcategoryId, expenseSubcategories.id));
      
      const conditions = [];
      if (parkId) conditions.push(eq(actualExpenses.parkId, parseInt(parkId as string)));
      if (year) conditions.push(eq(actualExpenses.year, parseInt(year as string)));
      if (month) conditions.push(eq(actualExpenses.month, parseInt(month as string)));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const expenses = await query.orderBy(desc(actualExpenses.date));
      res.json(expenses);
    } catch (error) {
      console.error("Error al obtener egresos reales:", error);
      res.status(500).json({ message: "Error al obtener egresos reales" });
    }
  });

  // Registrar egreso real
  apiRouter.post("/actual-expenses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const expenseData = req.body;
      // Extraer mes y año de la fecha
      const date = new Date(expenseData.date);
      expenseData.month = date.getMonth() + 1;
      expenseData.year = date.getFullYear();
      
      const [newExpense] = await db.insert(actualExpenses).values(expenseData).returning();
      res.status(201).json(newExpense);
    } catch (error) {
      console.error("Error al registrar egreso:", error);
      res.status(500).json({ message: "Error al registrar egreso" });
    }
  });

  // ============ FLUJO DE EFECTIVO ============
  
  // Obtener proyección de flujo de efectivo
  apiRouter.get("/cash-flow/:parkId/:year", async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.parkId);
      const year = parseInt(req.params.year);
      
      const projections = await db.select()
        .from(cashFlowProjections)
        .where(and(
          eq(cashFlowProjections.parkId, parkId),
          eq(cashFlowProjections.year, year)
        ))
        .orderBy(asc(cashFlowProjections.month));
      
      res.json(projections);
    } catch (error) {
      console.error("Error al obtener flujo de efectivo:", error);
      res.status(500).json({ message: "Error al obtener flujo de efectivo" });
    }
  });

  // ============ DASHBOARD FINANCIERO ============
  
  // Obtener métricas del dashboard
  apiRouter.get("/financial-dashboard/:parkId", async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.parkId);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // Ingresos del mes actual
      const currentMonthIncomes = await db.select({
        total: sum(actualIncomes.amount)
      })
      .from(actualIncomes)
      .where(and(
        eq(actualIncomes.parkId, parkId),
        eq(actualIncomes.year, currentYear),
        eq(actualIncomes.month, currentMonth)
      ));

      // Egresos del mes actual
      const currentMonthExpenses = await db.select({
        total: sum(actualExpenses.amount)
      })
      .from(actualExpenses)
      .where(and(
        eq(actualExpenses.parkId, parkId),
        eq(actualExpenses.year, currentYear),
        eq(actualExpenses.month, currentMonth)
      ));

      // Ingresos del año
      const yearIncomes = await db.select({
        total: sum(actualIncomes.amount)
      })
      .from(actualIncomes)
      .where(and(
        eq(actualIncomes.parkId, parkId),
        eq(actualIncomes.year, currentYear)
      ));

      // Egresos del año
      const yearExpenses = await db.select({
        total: sum(actualExpenses.amount)
      })
      .from(actualExpenses)
      .where(and(
        eq(actualExpenses.parkId, parkId),
        eq(actualExpenses.year, currentYear)
      ));

      // Gastos pendientes de pago
      const pendingExpenses = await db.select({
        total: sum(actualExpenses.amount)
      })
      .from(actualExpenses)
      .where(and(
        eq(actualExpenses.parkId, parkId),
        eq(actualExpenses.isPaid, false)
      ));

      res.json({
        currentMonthIncome: currentMonthIncomes[0]?.total || "0",
        currentMonthExpenses: currentMonthExpenses[0]?.total || "0",
        yearIncome: yearIncomes[0]?.total || "0",
        yearExpenses: yearExpenses[0]?.total || "0",
        pendingPayments: pendingExpenses[0]?.total || "0",
        netResult: parseFloat(yearIncomes[0]?.total || "0") - parseFloat(yearExpenses[0]?.total || "0"),
      });
    } catch (error) {
      console.error("Error al obtener dashboard financiero:", error);
      res.status(500).json({ message: "Error al obtener dashboard financiero" });
    }
  });

  console.log("Rutas del módulo financiero registradas correctamente");
}