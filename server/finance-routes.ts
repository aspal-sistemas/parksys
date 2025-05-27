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
  
  // Obtener todos los registros de ingresos
  apiRouter.get("/income-records", async (_req: Request, res: Response) => {
    try {
      const incomesList = await db.select({
        id: incomeRecords.id,
        code: incomeRecords.code,
        description: incomeRecords.description,
        source: incomeRecords.source,
        amount: incomeRecords.amount,
        currency: incomeRecords.currency,
        incomeDate: incomeRecords.incomeDate,
        status: incomeRecords.status,
        categoryName: incomeCategories.name,
        parkName: parks.name,
        createdAt: incomeRecords.createdAt
      })
      .from(incomeRecords)
      .leftJoin(incomeCategories, eq(incomeRecords.categoryId, incomeCategories.id))
      .leftJoin(parks, eq(incomeRecords.parkId, parks.id))
      .orderBy(incomeRecords.createdAt);
      
      res.json(incomesList);
    } catch (error) {
      console.error("Error al obtener registros de ingresos:", error);
      res.status(500).json({ message: "Error al obtener registros de ingresos" });
    }
  });

  // Crear nuevo registro de ingreso
  apiRouter.post("/income-records", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const incomeData = req.body;
      
      if (!incomeData.description || incomeData.description.trim() === '') {
        return res.status(400).json({ message: "La descripción del ingreso es requerida" });
      }

      // Generar código único
      const existingIncomes = await db.select().from(incomeRecords);
      const nextNumber = existingIncomes.length + 1;
      const code = `ING${nextNumber.toString().padStart(4, '0')}`;

      const [newIncome] = await db.insert(incomeRecords).values({
        code,
        categoryId: parseInt(incomeData.categoryId),
        description: incomeData.description.trim(),
        source: incomeData.source?.trim(),
        amount: incomeData.amount.toString(),
        currency: incomeData.currency || 'MXN',
        incomeDate: incomeData.incomeDate,
        paymentMethod: incomeData.paymentMethod?.trim(),
        notes: incomeData.notes?.trim(),
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
      
      // Obtener ingresos por categoría y mes
      const incomes = await db.select({
        categoryId: incomeRecords.categoryId,
        categoryName: incomeCategories.name,
        amount: incomeRecords.amount,
        month: sql<number>`EXTRACT(MONTH FROM ${incomeRecords.incomeDate})`,
        incomeDate: incomeRecords.incomeDate
      })
      .from(incomeRecords)
      .leftJoin(incomeCategories, eq(incomeRecords.categoryId, incomeCategories.id))
      .where(sql`EXTRACT(YEAR FROM ${incomeRecords.incomeDate}) = ${year}`);

      // Obtener categorías de ingresos activas
      const incomeCategs = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      
      // Obtener categorías de egresos activas 
      const expenseCategs = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));

      // Inicializar estructura de datos
      const monthlyTotals = {
        income: Array(12).fill(0),
        expenses: Array(12).fill(0),
        netFlow: Array(12).fill(0)
      };

      // Procesar categorías de ingresos con datos reales
      const incomeCategoriesData = await Promise.all(incomeCategs.map(async (category) => {
        const monthlyData = Array(12).fill(0);
        
        // Obtener ingresos reales para esta categoría
        const categoryIncomes = incomes.filter(income => income.categoryId === category.id);
        
        // Agrupar por mes
        categoryIncomes.forEach(income => {
          const month = (income.month as number) - 1; // Convertir a índice 0-11
          const amount = parseFloat(income.amount.toString());
          monthlyData[month] += amount;
          monthlyTotals.income[month] += amount;
        });

        const total = monthlyData.reduce((sum, amount) => sum + amount, 0);

        return {
          id: category.id,
          name: category.name,
          monthlyData,
          total
        };
      }));

      // Procesar categorías de egresos (por ahora vacías)
      const expenseCategoriesData = expenseCategs.map(category => ({
        id: category.id,
        name: category.name,
        monthlyData: Array(12).fill(0),
        total: 0
      }));

      // Calcular flujo neto
      for (let i = 0; i < 12; i++) {
        monthlyTotals.netFlow[i] = monthlyTotals.income[i] - monthlyTotals.expenses[i];
      }

      // Calcular resúmenes
      const summaries = {
        quarterly: {
          q1: {
            income: monthlyTotals.income.slice(0, 3).reduce((sum, val) => sum + val, 0),
            expenses: monthlyTotals.expenses.slice(0, 3).reduce((sum, val) => sum + val, 0),
            net: monthlyTotals.netFlow.slice(0, 3).reduce((sum, val) => sum + val, 0)
          },
          q2: {
            income: monthlyTotals.income.slice(3, 6).reduce((sum, val) => sum + val, 0),
            expenses: monthlyTotals.expenses.slice(3, 6).reduce((sum, val) => sum + val, 0),
            net: monthlyTotals.netFlow.slice(3, 6).reduce((sum, val) => sum + val, 0)
          },
          q3: {
            income: monthlyTotals.income.slice(6, 9).reduce((sum, val) => sum + val, 0),
            expenses: monthlyTotals.expenses.slice(6, 9).reduce((sum, val) => sum + val, 0),
            net: monthlyTotals.netFlow.slice(6, 9).reduce((sum, val) => sum + val, 0)
          },
          q4: {
            income: monthlyTotals.income.slice(9, 12).reduce((sum, val) => sum + val, 0),
            expenses: monthlyTotals.expenses.slice(9, 12).reduce((sum, val) => sum + val, 0),
            net: monthlyTotals.netFlow.slice(9, 12).reduce((sum, val) => sum + val, 0)
          }
        },
        semiannual: {
          h1: {
            income: monthlyTotals.income.slice(0, 6).reduce((sum, val) => sum + val, 0),
            expenses: monthlyTotals.expenses.slice(0, 6).reduce((sum, val) => sum + val, 0),
            net: monthlyTotals.netFlow.slice(0, 6).reduce((sum, val) => sum + val, 0)
          },
          h2: {
            income: monthlyTotals.income.slice(6, 12).reduce((sum, val) => sum + val, 0),
            expenses: monthlyTotals.expenses.slice(6, 12).reduce((sum, val) => sum + val, 0),
            net: monthlyTotals.netFlow.slice(6, 12).reduce((sum, val) => sum + val, 0)
          }
        },
        annual: {
          income: monthlyTotals.income.reduce((sum, val) => sum + val, 0),
          expenses: monthlyTotals.expenses.reduce((sum, val) => sum + val, 0),
          net: monthlyTotals.netFlow.reduce((sum, val) => sum + val, 0)
        }
      };

      const result = {
        year,
        months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        incomeCategories: incomeCategoriesData,
        expenseCategories: expenseCategoriesData,
        monthlyTotals,
        summaries
      };

      res.json(result);
    } catch (error) {
      console.error("Error al obtener matriz de flujo de efectivo:", error);
      res.status(500).json({ message: "Error al obtener matriz de flujo de efectivo" });
    }
  });

      // Calcular resúmenes
      const quarterly = {
        q1: {
          income: monthlyTotals.income.slice(0, 3).reduce((sum, val) => sum + val, 0),
          expenses: monthlyTotals.expenses.slice(0, 3).reduce((sum, val) => sum + val, 0),
          net: monthlyTotals.netFlow.slice(0, 3).reduce((sum, val) => sum + val, 0)
        },
        q2: {
          income: monthlyTotals.income.slice(3, 6).reduce((sum, val) => sum + val, 0),
          expenses: monthlyTotals.expenses.slice(3, 6).reduce((sum, val) => sum + val, 0),
          net: monthlyTotals.netFlow.slice(3, 6).reduce((sum, val) => sum + val, 0)
        },
        q3: {
          income: monthlyTotals.income.slice(6, 9).reduce((sum, val) => sum + val, 0),
          expenses: monthlyTotals.expenses.slice(6, 9).reduce((sum, val) => sum + val, 0),
          net: monthlyTotals.netFlow.slice(6, 9).reduce((sum, val) => sum + val, 0)
        },
        q4: {
          income: monthlyTotals.income.slice(9, 12).reduce((sum, val) => sum + val, 0),
          expenses: monthlyTotals.expenses.slice(9, 12).reduce((sum, val) => sum + val, 0),
          net: monthlyTotals.netFlow.slice(9, 12).reduce((sum, val) => sum + val, 0)
        }
      };

      const semiannual = {
        h1: {
          income: monthlyTotals.income.slice(0, 6).reduce((sum, val) => sum + val, 0),
          expenses: monthlyTotals.expenses.slice(0, 6).reduce((sum, val) => sum + val, 0),
          net: monthlyTotals.netFlow.slice(0, 6).reduce((sum, val) => sum + val, 0)
        },
        h2: {
          income: monthlyTotals.income.slice(6, 12).reduce((sum, val) => sum + val, 0),
          expenses: monthlyTotals.expenses.slice(6, 12).reduce((sum, val) => sum + val, 0),
          net: monthlyTotals.netFlow.slice(6, 12).reduce((sum, val) => sum + val, 0)
        }
      };

      const annual = {
        income: monthlyTotals.income.reduce((sum, val) => sum + val, 0),
        expenses: monthlyTotals.expenses.reduce((sum, val) => sum + val, 0),
        net: monthlyTotals.netFlow.reduce((sum, val) => sum + val, 0)
      };

      const response = {
        year,
        months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        incomeCategories: incomeCategoriesData,
        expenseCategories: expenseCategoriesData,
        monthlyTotals,
        summaries: {
          quarterly,
          semiannual,
          annual
        }
      };

      res.json(response);
    } catch (error) {
      console.error("Error al obtener matriz de flujo de efectivo:", error);
      res.status(500).json({ message: "Error al obtener matriz de flujo de efectivo" });
    }
  });

  console.log("Rutas del módulo financiero registradas correctamente");
}