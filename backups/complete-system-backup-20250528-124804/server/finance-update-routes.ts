import type { Express, Request, Response } from "express";
import { Router } from "express";
import { db } from "./db";
import { incomeCategories, expenseCategories } from "../shared/finance-schema";
import { eq } from "drizzle-orm";

/**
 * Rutas específicas para actualización de categorías financieras
 */
export function registerFinanceUpdateRoutes(app: any, apiRouter: any) {
  
  // Ruta para actualizar categorías de ingresos
  apiRouter.post("/income-categories/:id/update", async (req: Request, res: Response) => {
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

  // Ruta para actualizar categorías de egresos
  apiRouter.post("/expense-categories/:id/update", async (req: Request, res: Response) => {
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
}