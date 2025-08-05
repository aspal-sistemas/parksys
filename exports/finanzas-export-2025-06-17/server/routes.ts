import { Router, Request, Response } from "express";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import * as schema from "../shared/schema";

export function registerRoutes(router: Router) {
  console.log("Registrando rutas del módulo Sistema de Finanzas...");

  // Health check
  router.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", module: "Sistema de Finanzas" });
  });

  // Dashboard endpoint
  router.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      // Implementar lógica específica del módulo
      res.json({ message: "Dashboard data" });
    } catch (error) {
      console.error("Error en dashboard:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // CRUD genérico para las entidades principales
  
  // Rutas para income_categories
  router.get("/api/income-categories", async (req: Request, res: Response) => {
    try {
      const results = await db.select().from(schema.incomeCategories);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener income_categories" });
    }
  });

  router.post("/api/income-categories", async (req: Request, res: Response) => {
    try {
      const [result] = await db.insert(schema.incomeCategories).values(req.body).returning();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al crear income_categories" });
    }
  });
  // Rutas para expense_categories
  router.get("/api/expense-categories", async (req: Request, res: Response) => {
    try {
      const results = await db.select().from(schema.expenseCategories);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener expense_categories" });
    }
  });

  router.post("/api/expense-categories", async (req: Request, res: Response) => {
    try {
      const [result] = await db.insert(schema.expenseCategories).values(req.body).returning();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al crear expense_categories" });
    }
  });
  // Rutas para actual_incomes
  router.get("/api/actual-incomes", async (req: Request, res: Response) => {
    try {
      const results = await db.select().from(schema.actualIncomes);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener actual_incomes" });
    }
  });

  router.post("/api/actual-incomes", async (req: Request, res: Response) => {
    try {
      const [result] = await db.insert(schema.actualIncomes).values(req.body).returning();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al crear actual_incomes" });
    }
  });
  // Rutas para actual_expenses
  router.get("/api/actual-expenses", async (req: Request, res: Response) => {
    try {
      const results = await db.select().from(schema.actualExpenses);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener actual_expenses" });
    }
  });

  router.post("/api/actual-expenses", async (req: Request, res: Response) => {
    try {
      const [result] = await db.insert(schema.actualExpenses).values(req.body).returning();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al crear actual_expenses" });
    }
  });
  // Rutas para budgets
  router.get("/api/budgets", async (req: Request, res: Response) => {
    try {
      const results = await db.select().from(schema.budgets);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener budgets" });
    }
  });

  router.post("/api/budgets", async (req: Request, res: Response) => {
    try {
      const [result] = await db.insert(schema.budgets).values(req.body).returning();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al crear budgets" });
    }
  });
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}
