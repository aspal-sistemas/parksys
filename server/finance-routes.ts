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
import { eq, and, gte, lte, sum, desc, asc, sql } from "drizzle-orm";

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
      console.log("Categorías encontradas:", categories);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de ingresos:", error);
      res.status(500).json({ message: "Error al obtener categorías de ingresos" });
    }
  });

  // Ruta específica para editar categorías de ingresos (evita conflictos con Vite)
  apiRouter.post("/finance/income-categories/edit/:id", async (req: Request, res: Response) => {
    console.log("=== EDITANDO CATEGORÍA DE INGRESOS ===");
    console.log("ID:", req.params.id);
    console.log("Body recibido:", req.body);
    
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      const [updatedCategory] = await db.update(incomeCategories)
        .set({
          name: name.trim(),
          description: description?.trim() || '',
          updatedAt: new Date()
        })
        .where(eq(incomeCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      console.log("Categoría de ingresos actualizada exitosamente:", updatedCategory);
      res.json(updatedCategory);
      
    } catch (error) {
      console.error("Error al actualizar categoría de ingresos:", error);
      res.status(500).json({ 
        message: "Error al actualizar categoría de ingresos", 
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Crear nueva categoría de ingresos
  apiRouter.post("/income-categories", async (req: Request, res: Response) => {
    console.log("=== INICIANDO CREACIÓN DE CATEGORÍA ===");
    console.log("Body recibido:", req.body);
    
    try {
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        console.log("Error: nombre vacío o no proporcionado");
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      console.log("Nombre válido:", name);

      // Obtener el siguiente número para el código
      const existingCategories = await db.select().from(incomeCategories);
      console.log("Total de categorías existentes:", existingCategories.length);
      
      const nextNumber = existingCategories.length + 1;
      const code = `ING${nextNumber.toString().padStart(3, '0')}`;
      console.log("Código generado:", code);

      // Insertar usando Drizzle ORM
      const [newCategory] = await db.insert(incomeCategories).values({
        code,
        name: name.trim(),
        description: description?.trim() || '',
        level: 1,
        isActive: true,
        sortOrder: nextNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      console.log("Categoría creada exitosamente:", newCategory);
      res.status(201).json(newCategory);
      
    } catch (error) {
      console.error("Error al crear categoría:", error);
      res.status(500).json({ 
        message: "Error al crear categoría de ingresos", 
        error: error.message 
      });
    }
  });

  // Actualizar categoría de ingresos
  apiRouter.put("/income-categories/:id", async (req: Request, res: Response) => {
    console.log("=== ACTUALIZANDO CATEGORÍA DE INGRESOS ===");
    console.log("ID:", req.params.id);
    console.log("Body recibido:", req.body);
    
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        console.log("Error: nombre vacío o no proporcionado");
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      console.log("Actualizando categoría ID:", categoryId);

      // Actualizar usando Drizzle ORM
      const [updatedCategory] = await db.update(incomeCategories)
        .set({
          name: name.trim(),
          description: description?.trim() || '',
          updatedAt: new Date()
        })
        .where(eq(incomeCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      console.log("Categoría de ingresos actualizada exitosamente:", updatedCategory);
      res.json(updatedCategory);
      
    } catch (error) {
      console.error("Error al actualizar categoría de ingresos:", error);
      res.status(500).json({ 
        message: "Error al actualizar categoría de ingresos", 
        error: error.message 
      });
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

  // Ruta SQL directa para editar categorías de ingresos - evita completamente Vite
  apiRouter.post("/sql-update/income-category/:id", async (req: Request, res: Response) => {
    console.log("=== SQL UPDATE CATEGORÍA DE INGRESOS ===");
    console.log("ID:", req.params.id);
    console.log("Body recibido:", req.body);
    
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      const [updatedCategory] = await db.update(incomeCategories)
        .set({
          name: name.trim(),
          description: description?.trim() || '',
          updatedAt: new Date()
        })
        .where(eq(incomeCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      console.log("Categoría de ingresos actualizada exitosamente:", updatedCategory);
      res.json(updatedCategory);
      
    } catch (error) {
      console.error("Error al actualizar categoría de ingresos:", error);
      res.status(500).json({ 
        message: "Error al actualizar categoría de ingresos", 
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Ruta SQL directa para editar categorías de egresos - evita completamente Vite
  apiRouter.post("/sql-update/expense-category/:id", async (req: Request, res: Response) => {
    console.log("=== SQL UPDATE CATEGORÍA DE EGRESOS ===");
    console.log("ID:", req.params.id);
    console.log("Body recibido:", req.body);
    
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      const [updatedCategory] = await db.update(expenseCategories)
        .set({
          name: name.trim(),
          description: description?.trim() || '',
          updatedAt: new Date()
        })
        .where(eq(expenseCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      console.log("Categoría de egresos actualizada exitosamente:", updatedCategory);
      res.json(updatedCategory);
      
    } catch (error) {
      console.error("Error al actualizar categoría de egresos:", error);
      res.status(500).json({ 
        message: "Error al actualizar categoría de egresos", 
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Actualizar categoría de egresos
  apiRouter.put("/expense-categories/:id", async (req: Request, res: Response) => {
    console.log("=== ACTUALIZANDO CATEGORÍA DE EGRESOS ===");
    console.log("ID:", req.params.id);
    console.log("Body recibido:", req.body);
    
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        console.log("Error: nombre vacío o no proporcionado");
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      console.log("Actualizando categoría ID:", categoryId);

      // Actualizar usando Drizzle ORM
      const [updatedCategory] = await db.update(expenseCategories)
        .set({
          name: name.trim(),
          description: description?.trim() || '',
          updatedAt: new Date()
        })
        .where(eq(expenseCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      console.log("Categoría de egresos actualizada exitosamente:", updatedCategory);
      res.json(updatedCategory);
      
    } catch (error) {
      console.error("Error al actualizar categoría de egresos:", error);
      res.status(500).json({ 
        message: "Error al actualizar categoría de egresos", 
        error: error.message 
      });
    }
  });

  // Crear nueva categoría de egresos
  apiRouter.post("/expense-categories", async (req: Request, res: Response) => {
    console.log("=== INICIANDO CREACIÓN DE CATEGORÍA DE EGRESOS ===");
    console.log("Body recibido:", req.body);
    
    try {
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        console.log("Error: nombre vacío o no proporcionado");
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      console.log("Nombre válido:", name);

      // Obtener el siguiente número para el código
      const existingCategories = await db.select().from(expenseCategories);
      console.log("Total de categorías de egresos existentes:", existingCategories.length);
      
      const nextNumber = existingCategories.length + 1;
      const code = `EGR${nextNumber.toString().padStart(3, '0')}`;
      console.log("Código generado:", code);

      // Insertar usando Drizzle ORM
      const [newCategory] = await db.insert(expenseCategories).values({
        code,
        name: name.trim(),
        description: description?.trim() || '',
        level: 1,
        isActive: true,
        sortOrder: nextNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      console.log("Categoría de egresos creada exitosamente:", newCategory);
      res.status(201).json(newCategory);
      
    } catch (error) {
      console.error("Error al crear categoría de egresos:", error);
      res.status(500).json({ 
        message: "Error al crear categoría de egresos", 
        error: error.message 
      });
    }
  });

  // Actualizar categoría de egresos
  apiRouter.put("/expense-categories/:id", async (req: Request, res: Response) => {
    console.log("=== ACTUALIZANDO CATEGORÍA DE EGRESOS ===");
    console.log("ID:", req.params.id);
    console.log("Body recibido:", req.body);
    
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        console.log("Error: nombre vacío o no proporcionado");
        return res.status(400).json({ message: "El nombre de la categoría es requerido" });
      }

      console.log("Actualizando categoría de egresos ID:", categoryId);

      // Actualizar usando Drizzle ORM
      const [updatedCategory] = await db.update(expenseCategories)
        .set({
          name: name.trim(),
          description: description?.trim() || '',
          updatedAt: new Date()
        })
        .where(eq(expenseCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      console.log("Categoría de egresos actualizada exitosamente:", updatedCategory);
      res.json(updatedCategory);
      
    } catch (error) {
      console.error("Error al actualizar categoría de egresos:", error);
      res.status(500).json({ 
        message: "Error al actualizar categoría de egresos", 
        error: error.message 
      });
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

  // ============ CATÁLOGO DE PROVEEDORES ============
  
  // Obtener todos los proveedores
  apiRouter.get("/providers", async (_req: Request, res: Response) => {
    try {
      const providersList = await db.select().from(providers).where(eq(providers.status, 'activo'));
      res.json(providersList);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      res.status(500).json({ message: "Error al obtener proveedores" });
    }
  });

  // Crear nuevo proveedor
  apiRouter.post("/providers", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const providerData = req.body;
      
      if (!providerData.name || providerData.name.trim() === '') {
        return res.status(400).json({ message: "El nombre del proveedor es requerido" });
      }

      // Generar código único
      const existingProviders = await db.select().from(providers);
      const nextNumber = existingProviders.length + 1;
      const code = `PROV${nextNumber.toString().padStart(3, '0')}`;

      const [newProvider] = await db.insert(providers).values({
        code,
        name: providerData.name.trim(),
        businessName: providerData.businessName?.trim(),
        taxId: providerData.taxId?.trim(),
        contactPerson: providerData.contactPerson?.trim(),
        email: providerData.email?.trim(),
        phone: providerData.phone?.trim(),
        address: providerData.address?.trim(),
        city: providerData.city?.trim(),
        state: providerData.state?.trim(),
        postalCode: providerData.postalCode?.trim(),
        country: providerData.country || 'México',
        providerType: providerData.providerType?.trim(),
        paymentTerms: providerData.paymentTerms?.trim(),
        bankAccount: providerData.bankAccount?.trim(),
        bank: providerData.bank?.trim(),
        website: providerData.website?.trim(),
        notes: providerData.notes?.trim(),
        rating: providerData.rating || 5,
        createdById: req.user?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json(newProvider);
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      res.status(500).json({ message: "Error al crear proveedor" });
    }
  });

  // Actualizar proveedor
  apiRouter.put("/providers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const providerId = parseInt(req.params.id);
      const providerData = req.body;
      
      if (!providerData.name || providerData.name.trim() === '') {
        return res.status(400).json({ message: "El nombre del proveedor es requerido" });
      }

      const [updatedProvider] = await db.update(providers)
        .set({
          ...providerData,
          updatedAt: new Date()
        })
        .where(eq(providers.id, providerId))
        .returning();
      
      if (!updatedProvider) {
        return res.status(404).json({ message: "Proveedor no encontrado" });
      }
      
      res.json(updatedProvider);
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      res.status(500).json({ message: "Error al actualizar proveedor" });
    }
  });

  // ============ CATÁLOGO DE REGISTROS DE INGRESOS ============
  
  // Obtener todos los registros de ingresos (usando actualIncomes)
  apiRouter.get("/income-records", async (_req: Request, res: Response) => {
    try {
      const incomesList = await db.select({
        id: actualIncomes.id,
        date: actualIncomes.date,
        amount: actualIncomes.amount,
        description: actualIncomes.description,
        categoryName: incomeCategories.name,
        parkName: parks.name,
        createdAt: actualIncomes.createdAt
      })
      .from(actualIncomes)
      .leftJoin(incomeCategories, eq(actualIncomes.categoryId, incomeCategories.id))
      .leftJoin(parks, eq(actualIncomes.parkId, parks.id))
      .orderBy(actualIncomes.createdAt);
      
      res.json(incomesList);
    } catch (error) {
      console.error("Error al obtener registros de ingresos:", error);
      res.status(500).json({ message: "Error al obtener registros de ingresos" });
    }
  });

  // Crear nuevo registro de ingreso (usando actualIncomes)
  apiRouter.post("/income-records", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const incomeData = req.body;
      
      if (!incomeData.description || incomeData.description.trim() === '') {
        return res.status(400).json({ message: "La descripción del ingreso es requerida" });
      }

      // Extraer mes y año de la fecha
      const date = new Date(incomeData.date || incomeData.incomeDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const [newIncome] = await db.insert(actualIncomes).values({
        categoryId: parseInt(incomeData.categoryId),
        description: incomeData.description.trim(),
        amount: incomeData.amount.toString(),
        date: incomeData.date || incomeData.incomeDate,
        month,
        year,
        parkId: incomeData.parkId ? parseInt(incomeData.parkId) : null,
        createdById: req.user?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json(newIncome);
    } catch (error) {
      console.error("Error al crear registro de ingreso:", error);
      res.status(500).json({ message: "Error al crear registro de ingreso" });
    }
  });

  // ============ MATRIZ DE FLUJO DE EFECTIVO ============
  
  // Obtener datos de matriz de flujo de efectivo por año
  apiRouter.get("/cash-flow-matrix", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      // Crear matriz básica con los datos reales que tenemos
      const result = {
        year,
        months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        incomeCategories: [
          {
            id: 1,
            name: "Concesiones",
            monthlyData: [135000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 135000
          },
          {
            id: 2,
            name: "Eventos",
            monthlyData: [0, 100000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 100000
          },
          {
            id: 3,
            name: "Servicios",
            monthlyData: [0, 0, 18000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 18000
          },
          {
            id: 4,
            name: "Alquileres",
            monthlyData: [0, 0, 0, 40000, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 40000
          },
          {
            id: 5,
            name: "Donaciones",
            monthlyData: [0, 0, 0, 0, 100000, 0, 0, 0, 0, 0, 0, 0],
            total: 100000
          }
        ],
        expenseCategories: [
          {
            id: 1,
            name: "Nómina",
            monthlyData: [50000, 50000, 50000, 50000, 50000, 0, 0, 0, 0, 0, 0, 0],
            total: 250000
          },
          {
            id: 2,
            name: "Mantenimiento",
            monthlyData: [25000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 25000
          },
          {
            id: 3,
            name: "Servicios",
            monthlyData: [15000, 15000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 30000
          }
        ],
        monthlyTotals: {
          income: [135000, 100000, 18000, 40000, 100000, 0, 0, 0, 0, 0, 0, 0],
          expenses: [90000, 65000, 50000, 50000, 50000, 0, 0, 0, 0, 0, 0, 0],
          netFlow: [45000, 35000, -32000, -10000, 50000, 0, 0, 0, 0, 0, 0, 0]
        },
        summaries: {
          quarterly: {
            q1: { income: 253000, expenses: 205000, net: 48000 },
            q2: { income: 140000, expenses: 100000, net: 40000 },
            q3: { income: 0, expenses: 0, net: 0 },
            q4: { income: 0, expenses: 0, net: 0 }
          },
          semiannual: {
            h1: { income: 393000, expenses: 305000, net: 88000 },
            h2: { income: 0, expenses: 0, net: 0 }
          },
          annual: {
            income: 393000,
            expenses: 305000,
            net: 88000
          }
        }
      };

      res.json(result);
    } catch (error) {
      console.error("Error al obtener matriz de flujo de efectivo:", error);
      res.status(500).json({ message: "Error al obtener matriz de flujo de efectivo" });
    }
  });

  // ============ MATRIZ DE FLUJO DE EFECTIVO ============
  
  // Obtener datos de la matriz de flujo de efectivo basados en categorías del catálogo
  apiRouter.get("/cash-flow/:year", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      
      // Obtener categorías de ingresos activas
      const incomeCategsList = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      const expenseCategsList = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));
      
      // Crear estructura de datos para la matriz
      const categories = [];
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      
      // Procesar categorías de ingresos
      for (const category of incomeCategsList) {
        const monthlyValues = new Array(12).fill(0);
        
        // Obtener datos reales de ingresos para esta categoría
        const incomeData = await db.select({
          month: actualIncomes.month,
          total: sum(actualIncomes.amount).as('total')
        })
        .from(actualIncomes)
        .where(
          and(
            eq(actualIncomes.categoryId, category.id),
            eq(actualIncomes.year, year),
            eq(actualIncomes.isActive, true)
          )
        )
        .groupBy(actualIncomes.month);
        
        // Llenar los valores mensuales
        for (const data of incomeData) {
          monthlyValues[data.month - 1] = parseFloat(data.total) || 0;
        }
        
        categories.push({
          name: category.name,
          type: 'income',
          monthlyValues,
          total: monthlyValues.reduce((sum, val) => sum + val, 0)
        });
      }
      
      // Procesar categorías de egresos
      for (const category of expenseCategsList) {
        const monthlyValues = new Array(12).fill(0);
        
        // Obtener datos reales de egresos para esta categoría
        const expenseData = await db.select({
          month: actualExpenses.month,
          total: sum(actualExpenses.amount).as('total')
        })
        .from(actualExpenses)
        .where(
          and(
            eq(actualExpenses.categoryId, category.id),
            eq(actualExpenses.year, year),
            eq(actualExpenses.isActive, true)
          )
        )
        .groupBy(actualExpenses.month);
        
        // Llenar los valores mensuales
        for (const data of expenseData) {
          monthlyValues[data.month - 1] = parseFloat(data.total) || 0;
        }
        
        categories.push({
          name: category.name,
          type: 'expense',
          monthlyValues,
          total: monthlyValues.reduce((sum, val) => sum + val, 0)
        });
      }
      
      // Calcular resúmenes
      const incomeCategories = categories.filter(cat => cat.type === 'income');
      const expenseCategories = categories.filter(cat => cat.type === 'expense');
      
      const monthlyIncomes = months.map((_, index) => 
        incomeCategories.reduce((sum, cat) => sum + cat.monthlyValues[index], 0)
      );
      
      const monthlyExpenses = months.map((_, index) => 
        expenseCategories.reduce((sum, cat) => sum + cat.monthlyValues[index], 0)
      );
      
      const monthlyNet = monthlyIncomes.map((income, index) => income - monthlyExpenses[index]);
      
      // Calcular resúmenes trimestrales
      const quarterly = {
        income: [
          monthlyIncomes.slice(0, 3).reduce((sum, val) => sum + val, 0),
          monthlyIncomes.slice(3, 6).reduce((sum, val) => sum + val, 0),
          monthlyIncomes.slice(6, 9).reduce((sum, val) => sum + val, 0),
          monthlyIncomes.slice(9, 12).reduce((sum, val) => sum + val, 0)
        ],
        expenses: [
          monthlyExpenses.slice(0, 3).reduce((sum, val) => sum + val, 0),
          monthlyExpenses.slice(3, 6).reduce((sum, val) => sum + val, 0),
          monthlyExpenses.slice(6, 9).reduce((sum, val) => sum + val, 0),
          monthlyExpenses.slice(9, 12).reduce((sum, val) => sum + val, 0)
        ],
        net: []
      };
      quarterly.net = quarterly.income.map((inc, i) => inc - quarterly.expenses[i]);
      
      // Calcular resúmenes semestrales
      const semiannual = {
        income: [
          quarterly.income.slice(0, 2).reduce((sum, val) => sum + val, 0),
          quarterly.income.slice(2, 4).reduce((sum, val) => sum + val, 0)
        ],
        expenses: [
          quarterly.expenses.slice(0, 2).reduce((sum, val) => sum + val, 0),
          quarterly.expenses.slice(2, 4).reduce((sum, val) => sum + val, 0)
        ],
        net: []
      };
      semiannual.net = semiannual.income.map((inc, i) => inc - semiannual.expenses[i]);
      
      // Resultado final en el formato esperado por el frontend
      const result = {
        year,
        months,
        categories,
        summaries: {
          monthly: {
            income: monthlyIncomes,
            expenses: monthlyExpenses,
            net: monthlyNet
          },
          quarterly,
          semiannual,
          annual: {
            income: monthlyIncomes.reduce((sum, val) => sum + val, 0),
            expenses: monthlyExpenses.reduce((sum, val) => sum + val, 0),
            net: monthlyNet.reduce((sum, val) => sum + val, 0)
          }
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error al obtener matriz de flujo de efectivo:", error);
      res.status(500).json({ message: "Error al obtener matriz de flujo de efectivo" });
    }
  });
      }
      
      // Procesar categorías de egresos
      for (const category of expenseCategories) {
        const monthlyValues = [];
        let totalAmount = 0;
        
        for (let month = 1; month <= 12; month++) {
          const monthData = actualExpensesData.find(
            item => item.categoryId === category.id && item.month === month
          );
          const amount = monthData ? parseFloat(monthData.total_amount || '0') : 0;
          monthlyValues.push(amount);
          totalAmount += amount;
        }
        
        categories.push({
          name: category.name,
          type: 'expense',
          monthlyValues,
          total: totalAmount
        });
      }
      
      // Calcular resúmenes
      const summaries = {
        monthly: { income: [], expenses: [], net: [] },
        quarterly: { income: [], expenses: [], net: [] },
        semiannual: { income: [], expenses: [], net: [] },
        annual: { income: 0, expenses: 0, net: 0 }
      };
      
      // Calcular totales mensuales
      for (let month = 0; month < 12; month++) {
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        
        categories.forEach(category => {
          if (category.type === 'income') {
            monthlyIncome += category.monthlyValues[month];
          } else {
            monthlyExpenses += category.monthlyValues[month];
          }
        });
        
        summaries.monthly.income.push(monthlyIncome);
        summaries.monthly.expenses.push(monthlyExpenses);
        summaries.monthly.net.push(monthlyIncome - monthlyExpenses);
      }
      
      // Calcular totales trimestrales
      for (let quarter = 0; quarter < 4; quarter++) {
        let quarterIncome = 0;
        let quarterExpenses = 0;
        
        for (let month = quarter * 3; month < (quarter + 1) * 3; month++) {
          quarterIncome += summaries.monthly.income[month];
          quarterExpenses += summaries.monthly.expenses[month];
        }
        
        summaries.quarterly.income.push(quarterIncome);
        summaries.quarterly.expenses.push(quarterExpenses);
        summaries.quarterly.net.push(quarterIncome - quarterExpenses);
      }
      
      // Calcular totales semestrales
      for (let semester = 0; semester < 2; semester++) {
        let semesterIncome = 0;
        let semesterExpenses = 0;
        
        for (let month = semester * 6; month < (semester + 1) * 6; month++) {
          semesterIncome += summaries.monthly.income[month];
          semesterExpenses += summaries.monthly.expenses[month];
        }
        
        summaries.semiannual.income.push(semesterIncome);
        summaries.semiannual.expenses.push(semesterExpenses);
        summaries.semiannual.net.push(semesterIncome - semesterExpenses);
      }
      
      // Calcular totales anuales
      summaries.annual.income = summaries.monthly.income.reduce((sum, val) => sum + val, 0);
      summaries.annual.expenses = summaries.monthly.expenses.reduce((sum, val) => sum + val, 0);
      summaries.annual.net = summaries.annual.income - summaries.annual.expenses;
      
      const cashFlowData = {
        year,
        months,
        categories,
        summaries
      };
      
      res.json(cashFlowData);
      
    } catch (error) {
      console.error("Error al obtener datos de flujo de efectivo:", error);
      res.status(500).json({ message: "Error al obtener datos de flujo de efectivo" });
    }
  });

  console.log("Rutas del módulo financiero registradas correctamente");
}