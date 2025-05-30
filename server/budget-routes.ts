import { Request, Response, Router } from "express";
import { db } from "./db";
import { 
  budgets, 
  budgetIncomeLines, 
  budgetExpenseLines,
  incomeCategories,
  expenseCategories,
  incomeSubcategories,
  expenseSubcategories,
  actualIncomes,
  actualExpenses
} from "@shared/finance-schema";
import { eq, and, desc, asc, isNull } from "drizzle-orm";

/**
 * Registra las rutas para el módulo de presupuesto anual
 */
export function registerBudgetRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Obtener presupuestos
  apiRouter.get("/budgets", async (req: Request, res: Response) => {
    try {
      console.log("=== OBTENIENDO PRESUPUESTOS ===");
      console.log("Query params:", req.query);
      
      const { year, municipalityId, parkId, status } = req.query;
      
      let query = db.select().from(budgets);
      const conditions = [];
      
      if (year) {
        conditions.push(eq(budgets.year, parseInt(year as string)));
        console.log("Filtro año:", year);
      }
      
      if (municipalityId && municipalityId !== "" && municipalityId !== "all") {
        conditions.push(eq(budgets.municipalityId, parseInt(municipalityId as string)));
        console.log("Filtro municipio:", municipalityId);
      }
      
      if (parkId && parkId !== "" && parkId !== "all") {
        conditions.push(eq(budgets.parkId, parseInt(parkId as string)));
        console.log("Filtro parque:", parkId);
      }
      
      if (status && status !== "" && status !== "all") {
        conditions.push(eq(budgets.status, status as string));
        console.log("Filtro estado:", status);
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(budgets.createdAt));
      
      console.log(`Presupuestos encontrados: ${result.length}`);
      if (result.length > 0) {
        console.log("IDs:", result.map(b => b.id));
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error al obtener presupuestos:", error);
      res.status(500).json({ message: "Error al obtener presupuestos" });
    }
  });

  // Obtener un presupuesto específico
  apiRouter.get("/budgets/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const budget = await db.select()
        .from(budgets)
        .where(eq(budgets.id, parseInt(id)))
        .limit(1);
      
      if (budget.length === 0) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }
      
      res.json(budget[0]);
    } catch (error) {
      console.error("Error al obtener presupuesto:", error);
      res.status(500).json({ message: "Error al obtener presupuesto" });
    }
  });

  // Crear nuevo presupuesto
  apiRouter.post("/budgets", async (req: Request, res: Response) => {
    try {
      const { name, municipalityId, year, status, notes } = req.body;
      
      const newBudget = await db.insert(budgets).values({
        name,
        municipalityId: municipalityId ? parseInt(municipalityId) : null,
        year: parseInt(year),
        status: status || 'draft',
        notes,
        totalIncome: "0",
        totalExpenses: "0"
      }).returning();
      
      res.status(201).json(newBudget[0]);
    } catch (error) {
      console.error("Error al crear presupuesto:", error);
      res.status(500).json({ message: "Error al crear presupuesto" });
    }
  });

  // Actualizar presupuesto
  apiRouter.put("/budgets/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, status, notes } = req.body;
      
      const updatedBudget = await db.update(budgets)
        .set({ 
          name, 
          status, 
          notes,
          updatedAt: new Date()
        })
        .where(eq(budgets.id, parseInt(id)))
        .returning();
      
      if (updatedBudget.length === 0) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }
      
      res.json(updatedBudget[0]);
    } catch (error) {
      console.error("Error al actualizar presupuesto:", error);
      res.status(500).json({ message: "Error al actualizar presupuesto" });
    }
  });

  // Eliminar presupuesto
  apiRouter.delete("/budgets/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Primero eliminar las líneas presupuestarias
      await db.delete(budgetIncomeLines).where(eq(budgetIncomeLines.budgetId, parseInt(id)));
      await db.delete(budgetExpenseLines).where(eq(budgetExpenseLines.budgetId, parseInt(id)));
      
      // Luego eliminar el presupuesto
      const deletedBudget = await db.delete(budgets)
        .where(eq(budgets.id, parseInt(id)))
        .returning();
      
      if (deletedBudget.length === 0) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }
      
      res.json({ message: "Presupuesto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar presupuesto:", error);
      res.status(500).json({ message: "Error al eliminar presupuesto" });
    }
  });

  // Obtener líneas presupuestarias de un presupuesto
  apiRouter.get("/budgets/:id/lines", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Obtener líneas de ingresos
      const incomeLines = await db.select({
        id: budgetIncomeLines.id,
        budgetId: budgetIncomeLines.budgetId,
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
        notes: budgetIncomeLines.notes,
        category: {
          id: incomeCategories.id,
          name: incomeCategories.name,
          code: incomeCategories.code
        },
        subcategory: {
          id: incomeSubcategories.id,
          name: incomeSubcategories.name
        }
      })
      .from(budgetIncomeLines)
      .leftJoin(incomeCategories, eq(budgetIncomeLines.categoryId, incomeCategories.id))
      .leftJoin(incomeSubcategories, eq(budgetIncomeLines.subcategoryId, incomeSubcategories.id))
      .where(eq(budgetIncomeLines.budgetId, parseInt(id)));

      // Obtener líneas de egresos
      const expenseLines = await db.select({
        id: budgetExpenseLines.id,
        budgetId: budgetExpenseLines.budgetId,
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
        notes: budgetExpenseLines.notes,
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          code: expenseCategories.code
        },
        subcategory: {
          id: expenseSubcategories.id,
          name: expenseSubcategories.name
        }
      })
      .from(budgetExpenseLines)
      .leftJoin(expenseCategories, eq(budgetExpenseLines.categoryId, expenseCategories.id))
      .leftJoin(expenseSubcategories, eq(budgetExpenseLines.subcategoryId, expenseSubcategories.id))
      .where(eq(budgetExpenseLines.budgetId, parseInt(id)));

      res.json({
        incomeLines,
        expenseLines
      });
    } catch (error) {
      console.error("Error al obtener líneas presupuestarias:", error);
      res.status(500).json({ message: "Error al obtener líneas presupuestarias" });
    }
  });

  // Crear línea de ingresos
  apiRouter.post("/budgets/:id/income-lines", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { categoryId, subcategoryId, concept, projectedAmount, description } = req.body;

      const lineData = {
        budgetId: parseInt(id),
        categoryId: parseInt(categoryId),
        subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
        concept,
        projectedAmount: projectedAmount.toString(),
        january: "0",
        february: "0",
        march: "0",
        april: "0",
        may: "0",
        june: "0",
        july: "0",
        august: "0",
        september: "0",
        october: "0",
        november: "0",
        december: "0",
        notes: description || null
      };

      const newLine = await db.insert(budgetIncomeLines).values(lineData).returning();
      await recalculateBudgetTotals(parseInt(id));

      res.status(201).json(newLine[0]);
    } catch (error) {
      console.error("Error al crear línea de ingresos:", error);
      res.status(500).json({ message: "Error al crear línea de ingresos" });
    }
  });

  // Crear línea de gastos
  apiRouter.post("/budgets/:id/expenses-lines", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { categoryId, subcategoryId, concept, projectedAmount, description } = req.body;

      const lineData = {
        budgetId: parseInt(id),
        categoryId: parseInt(categoryId),
        subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
        concept,
        projectedAmount: projectedAmount.toString(),
        january: "0",
        february: "0",
        march: "0",
        april: "0",
        may: "0",
        june: "0",
        july: "0",
        august: "0",
        september: "0",
        october: "0",
        november: "0",
        december: "0",
        notes: description || null
      };

      const newLine = await db.insert(budgetExpenseLines).values(lineData).returning();
      await recalculateBudgetTotals(parseInt(id));

      res.status(201).json(newLine[0]);
    } catch (error) {
      console.error("Error al crear línea de gastos:", error);
      res.status(500).json({ message: "Error al crear línea de gastos" });
    }
  });

  // Crear línea presupuestaria (endpoint genérico original)
  apiRouter.post("/budgets/:id/lines", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        type, 
        categoryId, 
        subcategoryId, 
        concept, 
        projectedAmount,
        january, february, march, april, may, june,
        july, august, september, october, november, december,
        notes 
      } = req.body;

      const lineData = {
        budgetId: parseInt(id),
        categoryId: parseInt(categoryId),
        subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
        concept,
        projectedAmount: projectedAmount.toString(),
        january: (january || 0).toString(),
        february: (february || 0).toString(),
        march: (march || 0).toString(),
        april: (april || 0).toString(),
        may: (may || 0).toString(),
        june: (june || 0).toString(),
        july: (july || 0).toString(),
        august: (august || 0).toString(),
        september: (september || 0).toString(),
        october: (october || 0).toString(),
        november: (november || 0).toString(),
        december: (december || 0).toString(),
        notes
      };

      let newLine;
      if (type === "income") {
        newLine = await db.insert(budgetIncomeLines).values(lineData).returning();
      } else {
        newLine = await db.insert(budgetExpenseLines).values(lineData).returning();
      }

      // Recalcular totales del presupuesto
      await recalculateBudgetTotals(parseInt(id));

      res.status(201).json(newLine[0]);
    } catch (error) {
      console.error("Error al crear línea presupuestaria:", error);
      res.status(500).json({ message: "Error al crear línea presupuestaria" });
    }
  });

  // Actualizar línea presupuestaria
  apiRouter.put("/budget-lines/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        type,
        categoryId, 
        subcategoryId, 
        concept, 
        projectedAmount,
        january, february, march, april, may, june,
        july, august, september, october, november, december,
        notes 
      } = req.body;

      const lineData = {
        categoryId: parseInt(categoryId),
        subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
        concept,
        projectedAmount: projectedAmount.toString(),
        january: (january || 0).toString(),
        february: (february || 0).toString(),
        march: (march || 0).toString(),
        april: (april || 0).toString(),
        may: (may || 0).toString(),
        june: (june || 0).toString(),
        july: (july || 0).toString(),
        august: (august || 0).toString(),
        september: (september || 0).toString(),
        october: (october || 0).toString(),
        november: (november || 0).toString(),
        december: (december || 0).toString(),
        notes
      };

      let updatedLine;
      let budgetId;

      if (type === "income") {
        updatedLine = await db.update(budgetIncomeLines)
          .set(lineData)
          .where(eq(budgetIncomeLines.id, parseInt(id)))
          .returning();
        
        if (updatedLine.length > 0) {
          budgetId = updatedLine[0].budgetId;
        }
      } else {
        updatedLine = await db.update(budgetExpenseLines)
          .set(lineData)
          .where(eq(budgetExpenseLines.id, parseInt(id)))
          .returning();
        
        if (updatedLine.length > 0) {
          budgetId = updatedLine[0].budgetId;
        }
      }

      if (updatedLine.length === 0) {
        return res.status(404).json({ message: "Línea presupuestaria no encontrada" });
      }

      // Recalcular totales del presupuesto
      if (budgetId) {
        await recalculateBudgetTotals(budgetId);
      }

      res.json(updatedLine[0]);
    } catch (error) {
      console.error("Error al actualizar línea presupuestaria:", error);
      res.status(500).json({ message: "Error al actualizar línea presupuestaria" });
    }
  });

  // Eliminar línea presupuestaria
  apiRouter.delete("/budget-lines/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Intentar eliminar de líneas de ingresos
      let deletedLine = await db.delete(budgetIncomeLines)
        .where(eq(budgetIncomeLines.id, parseInt(id)))
        .returning();
      
      let budgetId = null;
      if (deletedLine.length > 0) {
        budgetId = deletedLine[0].budgetId;
      } else {
        // Si no se encontró en ingresos, intentar en egresos
        deletedLine = await db.delete(budgetExpenseLines)
          .where(eq(budgetExpenseLines.id, parseInt(id)))
          .returning();
        
        if (deletedLine.length > 0) {
          budgetId = deletedLine[0].budgetId;
        }
      }
      
      if (deletedLine.length === 0) {
        return res.status(404).json({ message: "Línea presupuestaria no encontrada" });
      }

      // Recalcular totales del presupuesto
      if (budgetId) {
        await recalculateBudgetTotals(budgetId);
      }
      
      res.json({ message: "Línea presupuestaria eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar línea presupuestaria:", error);
      res.status(500).json({ message: "Error al eliminar línea presupuestaria" });
    }
  });
}

/**
 * Recalcula los totales de un presupuesto basado en sus líneas
 */
async function recalculateBudgetTotals(budgetId: number) {
  try {
    // Calcular total de ingresos
    const incomeLines = await db.select().from(budgetIncomeLines)
      .where(eq(budgetIncomeLines.budgetId, budgetId));
    
    const totalIncome = incomeLines.reduce((total, line) => {
      return total + parseFloat(line.projectedAmount || "0");
    }, 0);

    // Calcular total de egresos
    const expenseLines = await db.select().from(budgetExpenseLines)
      .where(eq(budgetExpenseLines.budgetId, budgetId));
    
    const totalExpense = expenseLines.reduce((total, line) => {
      return total + parseFloat(line.projectedAmount || "0");
    }, 0);

    // Actualizar el presupuesto
    await db.update(budgets)
      .set({
        totalIncome: totalIncome.toString(),
        totalExpenses: totalExpense.toString(),
        updatedAt: new Date()
      })
      .where(eq(budgets.id, budgetId));

  } catch (error) {
    console.error("Error al recalcular totales del presupuesto:", error);
  }
}