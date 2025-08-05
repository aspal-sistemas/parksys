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
import { eq, and, desc, asc, isNull, sql } from "drizzle-orm";

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
      
      query = query.orderBy(desc(budgets.year), asc(budgets.name));
      
      const result = await query;
      console.log(`Encontrados ${result.length} presupuestos`);
      
      // Convertir valores string a number para el frontend
      const processedResult = result.map(budget => ({
        ...budget,
        totalIncome: parseFloat(budget.totalIncome || "0"),
        totalExpenses: parseFloat(budget.totalExpenses || "0")
      }));
      
      console.log("Primer presupuesto procesado:", processedResult[0]);
      res.json(processedResult);
    } catch (error) {
      console.error("Error al obtener presupuestos:", error);
      res.status(500).json({ message: "Error al obtener presupuestos" });
    }
  });

  // Obtener presupuesto por ID
  apiRouter.get("/budgets/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const budget = await db.select().from(budgets)
        .where(eq(budgets.id, parseInt(id)));
      
      if (budget.length === 0) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }
      
      const processedBudget = {
        ...budget[0],
        totalIncome: parseFloat(budget[0].totalIncome || "0"),
        totalExpenses: parseFloat(budget[0].totalExpenses || "0")
      };
      
      res.json(processedBudget);
    } catch (error) {
      console.error("Error al obtener presupuesto:", error);
      res.status(500).json({ message: "Error al obtener presupuesto" });
    }
  });

  // Crear presupuesto
  apiRouter.post("/budgets", async (req: Request, res: Response) => {
    try {
      const budgetData = req.body;
      const newBudget = await db.insert(budgets).values(budgetData).returning();
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
      const budgetData = req.body;
      
      const updatedBudget = await db.update(budgets)
        .set({ ...budgetData, updatedAt: new Date() })
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
      
      const incomeLines = await db.select().from(budgetIncomeLines)
        .where(eq(budgetIncomeLines.budgetId, parseInt(id)))
        .orderBy(asc(budgetIncomeLines.concept));
      
      const expenseLines = await db.select().from(budgetExpenseLines)
        .where(eq(budgetExpenseLines.budgetId, parseInt(id)))
        .orderBy(asc(budgetExpenseLines.concept));
      
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
      const { concept, description, projectedAmount } = req.body;
      
      const lineData = {
        budgetId: parseInt(id),
        concept,
        projectedAmount: projectedAmount?.toString() || "0",
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
      
      // Recalcular totales usando consulta SQL directa
      console.log(`=== RECALCULANDO TOTALES PARA PRESUPUESTO ${id} ===`);
      await db.execute(sql`
        UPDATE budgets 
        SET total_income = (
          SELECT COALESCE(SUM(projected_amount), 0) 
          FROM budget_income_lines 
          WHERE budget_id = ${parseInt(id)}
        ),
        total_expenses = (
          SELECT COALESCE(SUM(projected_amount), 0) 
          FROM budget_expense_lines 
          WHERE budget_id = ${parseInt(id)}
        ),
        updated_at = NOW()
        WHERE id = ${parseInt(id)}
      `);
      console.log(`Totales del presupuesto ${id} recalculados automáticamente`);

      res.status(201).json(newLine[0]);
    } catch (error) {
      console.error("Error al crear línea de ingresos:", error);
      res.status(500).json({ message: "Error al crear línea de ingresos" });
    }
  });

  // Crear línea de egresos
  apiRouter.post("/budgets/:id/expenses-lines", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { concept, description, projectedAmount } = req.body;
      
      const lineData = {
        budgetId: parseInt(id),
        concept,
        projectedAmount: projectedAmount?.toString() || "0",
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
      
      // Recalcular totales usando consulta SQL directa
      console.log(`=== RECALCULANDO TOTALES PARA PRESUPUESTO ${id} ===`);
      await db.execute(sql`
        UPDATE budgets 
        SET total_income = (
          SELECT COALESCE(SUM(projected_amount), 0) 
          FROM budget_income_lines 
          WHERE budget_id = ${parseInt(id)}
        ),
        total_expenses = (
          SELECT COALESCE(SUM(projected_amount), 0) 
          FROM budget_expense_lines 
          WHERE budget_id = ${parseInt(id)}
        ),
        updated_at = NOW()
        WHERE id = ${parseInt(id)}
      `);
      console.log(`Totales del presupuesto ${id} recalculados automáticamente`);

      res.status(201).json(newLine[0]);
    } catch (error) {
      console.error("Error al crear línea de egresos:", error);
      res.status(500).json({ message: "Error al crear línea de egresos" });
    }
  });

  // Actualizar línea presupuestaria
  apiRouter.put("/budget-lines/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const lineData = req.body;
      
      // Intentar actualizar en líneas de ingresos
      let updatedLine = await db.update(budgetIncomeLines)
        .set({ ...lineData, updatedAt: new Date() })
        .where(eq(budgetIncomeLines.id, parseInt(id)))
        .returning();
      
      let budgetId = null;
      if (updatedLine.length > 0) {
        budgetId = updatedLine[0].budgetId;
      } else {
        // Si no está en ingresos, intentar en egresos
        updatedLine = await db.update(budgetExpenseLines)
          .set({ ...lineData, updatedAt: new Date() })
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
        console.log(`=== RECALCULANDO TOTALES PARA PRESUPUESTO ${budgetId} ===`);
        await db.execute(sql`
          UPDATE budgets 
          SET total_income = (
            SELECT COALESCE(SUM(projected_amount), 0) 
            FROM budget_income_lines 
            WHERE budget_id = ${budgetId}
          ),
          total_expenses = (
            SELECT COALESCE(SUM(projected_amount), 0) 
            FROM budget_expense_lines 
            WHERE budget_id = ${budgetId}
          ),
          updated_at = NOW()
          WHERE id = ${budgetId}
        `);
        console.log(`Totales del presupuesto ${budgetId} recalculados automáticamente`);
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
        // Si no está en ingresos, intentar en egresos
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
        console.log(`=== RECALCULANDO TOTALES PARA PRESUPUESTO ${budgetId} ===`);
        await db.execute(sql`
          UPDATE budgets 
          SET total_income = (
            SELECT COALESCE(SUM(projected_amount), 0) 
            FROM budget_income_lines 
            WHERE budget_id = ${budgetId}
          ),
          total_expenses = (
            SELECT COALESCE(SUM(projected_amount), 0) 
            FROM budget_expense_lines 
            WHERE budget_id = ${budgetId}
          ),
          updated_at = NOW()
          WHERE id = ${budgetId}
        `);
        console.log(`Totales del presupuesto ${budgetId} recalculados automáticamente`);
      }
      
      res.json({ message: "Línea presupuestaria eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar línea presupuestaria:", error);
      res.status(500).json({ message: "Error al eliminar línea presupuestaria" });
    }
  });
}