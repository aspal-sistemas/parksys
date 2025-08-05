import type { Express, Request, Response } from "express";
import { Router } from "express";
import { db, pool } from "./db";
import { 
  incomeCategories,
  incomeSubcategories,
  expenseCategories,
  budgets,
  budgetIncomeLines,
  budgetExpenseLines,
  actualIncomes,
  actualExpenses,
  cashFlowProjections
} from "../shared/finance-schema";
import { eq, and, gte, lte, sum, desc, asc, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { generateAccountingEntry } from "./finance-accounting-integration";

// Configuración de multer para carga de archivos CSV
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

/**
 * Función para convertir fecha de diferentes formatos a ISO (YYYY-MM-DD)
 */
function parseDate(dateString: string): string {
  if (!dateString) return '';
  
  // Eliminar espacios y comillas
  const cleanDate = dateString.trim().replace(/['"]/g, '');
  
  // Formato DD/MM/YY o DD/MM/YYYY
  if (cleanDate.includes('/')) {
    const parts = cleanDate.split('/');
    if (parts.length === 3) {
      let [day, month, year] = parts;
      
      // Convertir año de 2 dígitos a 4 dígitos
      if (year.length === 2) {
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        year = (parseInt(year) + century).toString();
      }
      
      // Asegurar formato con ceros a la izquierda
      day = day.padStart(2, '0');
      month = month.padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
  }
  
  // Formato DD-MM-YY o DD-MM-YYYY
  if (cleanDate.includes('-') && !cleanDate.startsWith('20')) {
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      let [day, month, year] = parts;
      
      if (year.length === 2) {
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        year = (parseInt(year) + century).toString();
      }
      
      day = day.padStart(2, '0');
      month = month.padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
  }
  
  // Si ya está en formato ISO (YYYY-MM-DD), devolverlo tal como está
  if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return cleanDate;
  }
  
  // Si no coincide con ningún formato, intentar parsear con Date
  try {
    const parsedDate = new Date(cleanDate);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn('No se pudo parsear la fecha:', cleanDate);
  }
  
  return '';
}

/**
 * Función para procesar datos CSV de ingresos/egresos históricos
 */
async function processCsvData(csvContent: string, type: 'income' | 'expense', parkId?: number) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;
    
    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });
    
    // Validar campos requeridos
    if (!record.fecha || !record.monto || !record.categoria) {
      continue;
    }
    
    const parsedDate = parseDate(record.fecha);
    if (!parsedDate) {
      console.warn('Fecha inválida encontrada:', record.fecha);
      continue;
    }

    records.push({
      date: parsedDate,
      amount: parseFloat(record.monto.replace(/[^0-9.-]/g, '')),
      categoryName: record.categoria,
      description: record.descripcion || '',
      parkId: parkId || parseInt(record.parque_id) || 1
    });
  }
  
  return records;
}

/**
 * Registra las rutas para el módulo financiero
 */
export function registerFinanceRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  console.log("Registrando rutas del módulo financiero...");

  // ============ CATEGORÍAS DE INGRESOS ============
  
  // Obtener todas las categorías de ingresos (incluye activas e inactivas para el catálogo)
  apiRouter.get("/finance/income-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(incomeCategories);
      console.log("Categorías encontradas:", categories);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de ingresos:", error);
      res.status(500).json({ message: "Error al obtener categorías de ingresos" });
    }
  });

  // Obtener solo las categorías de ingresos activas (para matriz de flujo)
  apiRouter.get("/finance/income-categories/active", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de ingresos activas:", error);
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

  // Cambiar estado activo/inactivo de categoría de ingresos
  apiRouter.put("/income-categories/:id/status", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const [updatedCategory] = await db.update(incomeCategories)
        .set({ 
          isActive: isActive,
          updatedAt: new Date()
        })
        .where(eq(incomeCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error al actualizar estado de categoría de ingresos:", error);
      res.status(500).json({ message: "Error al actualizar estado de categoría" });
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

  // Eliminar categoría de ingresos
  apiRouter.delete("/income-categories/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Verificar si la categoría está siendo usada
      const usageCheck = await db.select().from(actualIncomes).where(eq(actualIncomes.categoryId, categoryId)).limit(1);
      
      if (usageCheck.length > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar la categoría porque está siendo usada en registros de ingresos" 
        });
      }
      
      const [deletedCategory] = await db.delete(incomeCategories)
        .where(eq(incomeCategories.id, categoryId))
        .returning();
      
      if (!deletedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      res.json({ message: "Categoría eliminada exitosamente", category: deletedCategory });
      
    } catch (error) {
      console.error("Error al eliminar categoría de ingresos:", error);
      res.status(500).json({ 
        message: "Error al eliminar categoría de ingresos", 
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // ============ CATEGORÍAS DE EGRESOS ============
  
  // Obtener todas las categorías de egresos (incluye activas e inactivas para el catálogo)
  apiRouter.get("/finance/expense-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(expenseCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de egresos:", error);
      res.status(500).json({ message: "Error al obtener categorías de egresos" });
    }
  });

  // Obtener solo las categorías de egresos activas (para matriz de flujo)
  apiRouter.get("/finance/expense-categories/active", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías de egresos activas:", error);
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

  // Cambiar estado activo/inactivo de categoría de egresos
  apiRouter.put("/expense-categories/:id/status", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const [updatedCategory] = await db.update(expenseCategories)
        .set({ 
          isActive: isActive,
          updatedAt: new Date()
        })
        .where(eq(expenseCategories.id, categoryId))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error al actualizar estado de categoría de egresos:", error);
      res.status(500).json({ message: "Error al actualizar estado de categoría" });
    }
  });

  // Eliminar categoría de egresos
  apiRouter.delete("/expense-categories/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Verificar si la categoría está siendo usada
      const usageCheck = await db.select().from(actualExpenses).where(eq(actualExpenses.categoryId, categoryId)).limit(1);
      
      if (usageCheck.length > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar la categoría porque está siendo usada en registros de egresos" 
        });
      }
      
      const [deletedCategory] = await db.delete(expenseCategories)
        .where(eq(expenseCategories.id, categoryId))
        .returning();
      
      if (!deletedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      
      res.json({ message: "Categoría eliminada exitosamente", category: deletedCategory });
      
    } catch (error) {
      console.error("Error al eliminar categoría de egresos:", error);
      res.status(500).json({ 
        message: "Error al eliminar categoría de egresos", 
        error: error instanceof Error ? error.message : 'Error desconocido'
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
      // Por ahora devolvemos un array vacío ya que no tenemos subcategorías
      res.json([]);
    } catch (error) {
      console.error("Error al obtener subcategorías de egresos:", error);
      res.status(500).json({ message: "Error al obtener subcategorías" });
    }
  });

  // ============ PRESUPUESTOS ============
  
  // Obtener todos los presupuestos
  apiRouter.get("/budgets", async (req: Request, res: Response) => {
    try {
      const { municipalityId, year } = req.query;
      let query = db.select().from(budgets);
      
      if (municipalityId) {
        query = query.where(eq(budgets.municipalityId, parseInt(municipalityId as string)));
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

      })
      .from(budgetExpenseLines)
      .leftJoin(expenseCategories, eq(budgetExpenseLines.categoryId, expenseCategories.id))
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

        categoryId: actualIncomes.categoryId,
        categoryName: incomeCategories.name,
        categoryCode: incomeCategories.code,
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
  apiRouter.post("/actual-incomes", async (req: Request, res: Response) => {
    try {
      const incomeData = req.body;
      // Extraer mes y año de la fecha
      const date = new Date(incomeData.date);
      incomeData.month = date.getMonth() + 1;
      incomeData.year = date.getFullYear();
      
      const [newIncome] = await db.insert(actualIncomes).values(incomeData).returning();
      
      // Generar asiento contable automáticamente
      try {
        await generateAccountingEntry({
          id: newIncome.id,
          type: 'income',
          amount: parseFloat(newIncome.amount),
          category_id: newIncome.categoryId,
          description: newIncome.description,
          date: newIncome.date,
          reference: newIncome.reference
        }, 1);
        console.log('📊 Asiento contable generado automáticamente para ingreso:', newIncome.id);
      } catch (error) {
        console.warn('⚠️ Error generando asiento contable automático:', error);
      }
      
      res.status(201).json(newIncome);
    } catch (error) {
      console.error("Error al registrar ingreso:", error);
      res.status(500).json({ message: "Error al registrar ingreso" });
    }
  });

  // Actualizar ingreso real
  apiRouter.put("/actual-incomes/:id", async (req: Request, res: Response) => {
    try {
      const incomeId = parseInt(req.params.id);
      const incomeData = req.body;
      
      // Extraer mes y año de la fecha
      const date = new Date(incomeData.date);
      incomeData.month = date.getMonth() + 1;
      incomeData.year = date.getFullYear();
      
      const [updatedIncome] = await db
        .update(actualIncomes)
        .set(incomeData)
        .where(eq(actualIncomes.id, incomeId))
        .returning();
      
      res.json(updatedIncome);
    } catch (error) {
      console.error("Error al actualizar ingreso:", error);
      res.status(500).json({ message: "Error al actualizar ingreso" });
    }
  });

  // Eliminar ingreso real
  apiRouter.delete("/actual-incomes/:id", async (req: Request, res: Response) => {
    try {
      const incomeId = parseInt(req.params.id);
      
      // Usar SQL directo para evitar problemas con el esquema
      const result = await db.execute(sql`
        DELETE FROM actual_incomes 
        WHERE id = ${incomeId}
        RETURNING id, concept, amount
      `);
        
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Ingreso no encontrado" });
      }
      
      const deletedIncome = result.rows[0];
      res.json({ message: "Ingreso eliminado correctamente", income: deletedIncome });
    } catch (error) {
      console.error("Error al eliminar ingreso:", error);
      res.status(500).json({ message: "Error al eliminar ingreso" });
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
      })
      .from(actualExpenses)
      .leftJoin(expenseCategories, eq(actualExpenses.categoryId, expenseCategories.id));
      
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
  apiRouter.post("/actual-expenses", async (req: Request, res: Response) => {
    try {
      const expenseData = req.body;
      // Extraer mes y año de la fecha
      const date = new Date(expenseData.date);
      expenseData.month = date.getMonth() + 1;
      expenseData.year = date.getFullYear();
      
      const [newExpense] = await db.insert(actualExpenses).values(expenseData).returning();
      
      // Generar asiento contable automáticamente
      try {
        await generateAccountingEntry({
          id: newExpense.id,
          type: 'expense',
          amount: parseFloat(newExpense.amount),
          category_id: newExpense.categoryId,
          description: newExpense.description,
          date: newExpense.date,
          reference: newExpense.referenceNumber
        }, 1);
        console.log('📊 Asiento contable generado automáticamente para gasto:', newExpense.id);
      } catch (error) {
        console.warn('⚠️ Error generando asiento contable automático:', error);
      }
      
      res.status(201).json(newExpense);
    } catch (error) {
      console.error("Error al registrar egreso:", error);
      res.status(500).json({ message: "Error al registrar egreso" });
    }
  });

  // Actualizar egreso real
  apiRouter.put("/actual-expenses/:id", async (req: Request, res: Response) => {
    try {
      const expenseId = parseInt(req.params.id);
      const expenseData = req.body;
      
      // Extraer mes y año de la fecha
      const date = new Date(expenseData.date);
      expenseData.month = date.getMonth() + 1;
      expenseData.year = date.getFullYear();
      
      const [updatedExpense] = await db
        .update(actualExpenses)
        .set(expenseData)
        .where(eq(actualExpenses.id, expenseId))
        .returning();
        
      if (!updatedExpense) {
        return res.status(404).json({ message: "Egreso no encontrado" });
      }
      
      res.json(updatedExpense);
    } catch (error) {
      console.error("Error al actualizar egreso:", error);
      res.status(500).json({ message: "Error al actualizar egreso" });
    }
  });

  // Eliminar egreso real
  apiRouter.delete("/actual-expenses/:id", async (req: Request, res: Response) => {
    try {
      const expenseId = parseInt(req.params.id);
      
      const [deletedExpense] = await db
        .delete(actualExpenses)
        .where(eq(actualExpenses.id, expenseId))
        .returning();
        
      if (!deletedExpense) {
        return res.status(404).json({ message: "Egreso no encontrado" });
      }
      
      res.json({ message: "Egreso eliminado correctamente", expense: deletedExpense });
    } catch (error) {
      console.error("Error al eliminar egreso:", error);
      res.status(500).json({ message: "Error al eliminar egreso" });
    }
  });

  // ============ FLUJO DE EFECTIVO ============
  
  // Obtener matriz de flujo de efectivo desde cash_flow_matrix
  apiRouter.get("/cash-flow-matrix", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const parkId = req.query.parkId ? parseInt(req.query.parkId as string) : null;
      
      console.log(`=== MATRIZ DE FLUJO DE EFECTIVO PARA AÑO: ${year}, PARQUE: ${parkId || 'TODOS'} ===`);
      
      // Obtener datos de la tabla cash_flow_matrix usando pool.query
      const cashFlowQuery = `
        SELECT 
          cfm.category_id,
          cfm.category_name,
          cfm.transaction_type,
          cfm.month,
          SUM(cfm.amount) as total_amount
        FROM cash_flow_matrix cfm
        WHERE cfm.year = $1
        GROUP BY cfm.category_id, cfm.category_name, cfm.transaction_type, cfm.month
        ORDER BY cfm.category_id, cfm.month
      `;
      
      const cashFlowResult = await pool.query(cashFlowQuery, [year]);
      console.log(`💰 Encontrados ${cashFlowResult.rows.length} registros en matriz de flujo`);
      console.log(`🔍 Datos raw de cash_flow_matrix:`, cashFlowResult.rows);
      
      // Verificar que tenemos datos para procesar
      if (cashFlowResult.rows.length === 0) {
        console.log(`⚠️ No hay datos para procesar para el año ${year}`);
        return res.json({
          year,
          months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
          categories: [],
          summaries: {
            monthly: {
              income: new Array(12).fill(0),
              expenses: new Array(12).fill(0),
              net: new Array(12).fill(0)
            },
            annual: {
              income: 0,
              expenses: 0,
              net: 0
            }
          }
        });
      }
      
      // Procesar datos para crear estructura de matriz
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const categories = [];
      
      // Procesar datos de cash_flow_matrix directamente
      const categoryMap = new Map();
      
      // Procesar datos reales de cash_flow_matrix
      cashFlowResult.rows.forEach(row => {
        const categoryId = row.category_id;
        const categoryName = row.category_name;
        const transactionType = row.transaction_type;
        const month = row.month;
        const amount = parseFloat(row.total_amount);
        
        console.log(`🔍 Procesando: ${categoryName} (${categoryId}), ${transactionType}, mes ${month}, monto: ${amount}`);
        
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: categoryName,
            incomeMonthlyValues: new Array(12).fill(0),
            expenseMonthlyValues: new Array(12).fill(0),
            totalIncome: 0,
            totalExpense: 0
          });
        }
        
        const category = categoryMap.get(categoryId);
        
        if (transactionType === 'income') {
          category.incomeMonthlyValues[month - 1] = Math.abs(amount);
          category.totalIncome += Math.abs(amount);
        } else if (transactionType === 'expense') {
          category.expenseMonthlyValues[month - 1] = Math.abs(amount);
          category.totalExpense += Math.abs(amount);
        }
      });
      
      console.log(`📊 Procesamiento completado. Categorías encontradas: ${categoryMap.size}`);
      
      // Crear categorías separadas para ingresos y gastos
      categoryMap.forEach(category => {
        console.log(`📊 Revisando categoría: ${category.name}, ingresos: ${category.totalIncome}, gastos: ${category.totalExpense}`);
        
        if (category.totalIncome > 0) {
          const incomeCategory = {
            name: category.name,
            type: 'income',
            monthlyValues: category.incomeMonthlyValues,
            total: category.totalIncome
          };
          console.log(`✅ Agregando categoría de ingresos: ${incomeCategory.name}, total: ${incomeCategory.total}`);
          categories.push(incomeCategory);
        }
        if (category.totalExpense > 0) {
          const expenseCategory = {
            name: category.name,
            type: 'expense',
            monthlyValues: category.expenseMonthlyValues,
            total: category.totalExpense
          };
          console.log(`✅ Agregando categoría de gastos: ${expenseCategory.name}, total: ${expenseCategory.total}`);
          categories.push(expenseCategory);
        }
      });
      
      // Calcular totales mensuales
      const monthlyIncome = new Array(12).fill(0);
      const monthlyExpenses = new Array(12).fill(0);
      const monthlyNet = new Array(12).fill(0);
      
      categories.forEach(category => {
        category.monthlyValues.forEach((amount, index) => {
          if (category.type === 'income') {
            monthlyIncome[index] += amount;
          } else {
            monthlyExpenses[index] += amount;
          }
        });
      });
      
      // Calcular flujo neto
      for (let i = 0; i < 12; i++) {
        monthlyNet[i] = monthlyIncome[i] - monthlyExpenses[i];
      }
      
      // Calcular totales anuales
      const annualIncome = monthlyIncome.reduce((sum, val) => sum + val, 0);
      const annualExpenses = monthlyExpenses.reduce((sum, val) => sum + val, 0);
      const annualNet = annualIncome - annualExpenses;
      
      const result = {
        year,
        months,
        categories,
        summaries: {
          monthly: {
            income: monthlyIncome,
            expenses: monthlyExpenses,
            net: monthlyNet
          },
          annual: {
            income: annualIncome,
            expenses: annualExpenses,
            net: annualNet
          }
        }
      };

      console.log(`📊 Matriz de flujo generada: ${categories.length} categorías totales`);
      console.log(`💰 Totales anuales: Ingresos: $${annualIncome}, Gastos: $${annualExpenses}, Neto: $${annualNet}`);
      res.json(result);
      
    } catch (error) {
      console.error("Error al obtener matriz de flujo de efectivo:", error);
      res.status(500).json({ message: "Error al obtener matriz de flujo de efectivo" });
    }
  });
  
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
  
  // Obtener datos de la matriz de flujo de efectivo basados solo en categorías del catálogo
  apiRouter.get("/cash-flow/:year", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      console.log(`=== OBTENIENDO CASH FLOW MATRIX PARA YEAR: ${year} ===`);
      
      // Obtener solo las categorías de ingresos y egresos del catálogo
      const incomeCategsList = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      const expenseCategsList = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));
      
      console.log(`Categorías de ingreso encontradas: ${incomeCategsList.length}`);
      console.log(`Categorías de egreso encontradas: ${expenseCategsList.length}`);
      
      // Crear estructura de datos para la matriz usando solo las categorías del catálogo
      const categories = [];
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      
      // Procesar categorías de ingresos del catálogo
      for (const category of incomeCategsList) {
        categories.push({
          name: category.name,
          type: 'income',
          monthlyValues: new Array(12).fill(0),
          total: 0
        });
      }
      
      // Procesar categorías de egresos del catálogo
      for (const category of expenseCategsList) {
        categories.push({
          name: category.name,
          type: 'expense',
          monthlyValues: new Array(12).fill(0),
          total: 0
        });
      }
      
      // Resultado final usando solo la estructura del catálogo
      const result = {
        year,
        months,
        categories,
        summaries: {
          monthly: {
            income: new Array(12).fill(0),
            expenses: new Array(12).fill(0),
            net: new Array(12).fill(0)
          },
          quarterly: {
            income: [0, 0, 0, 0],
            expenses: [0, 0, 0, 0],
            net: [0, 0, 0, 0]
          },
          semiannual: {
            income: [0, 0],
            expenses: [0, 0],
            net: [0, 0]
          },
          annual: {
            income: 0,
            expenses: 0,
            net: 0
          }
        }
      };
      
      console.log("=== CASH FLOW MATRIX EXITOSO ===");
      console.log(`Total categorías retornadas: ${result.categories.length}`);
      res.setHeader('Content-Type', 'application/json');
      res.json(result);
    } catch (error) {
      console.error("Error al obtener matriz de flujo de efectivo:", error);
      res.status(500).json({ message: "Error al obtener matriz de flujo de efectivo" });
    }
  });

  // ============ IMPORTACIÓN CSV ============
  
  // Importar datos históricos desde CSV
  apiRouter.post("/import/historical-data", upload.single('csvFile'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se ha enviado ningún archivo CSV" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const { type, parkId } = req.body;
      
      if (!type || !['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "Tipo de datos inválido. Debe ser 'income' o 'expense'" });
      }

      const records = await processCsvData(csvContent, type, parkId ? parseInt(parkId) : undefined);
      
      if (records.length === 0) {
        return res.status(400).json({ message: "No se encontraron registros válidos en el archivo CSV" });
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const record of records) {
        try {
          // Buscar la categoría por nombre
          const categoryTable = type === 'income' ? incomeCategories : expenseCategories;
          const [category] = await db.select()
            .from(categoryTable)
            .where(eq(categoryTable.name, record.categoryName))
            .limit(1);

          if (!category) {
            errors.push(`Categoría no encontrada: ${record.categoryName}`);
            errorCount++;
            continue;
          }

          // Extraer mes y año de la fecha
          const date = new Date(record.date);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          // Insertar el registro
          const targetTable = type === 'income' ? actualIncomes : actualExpenses;
          await db.insert(targetTable).values({
            categoryId: category.id,
            concept: record.description || `Importación CSV - ${record.categoryName}`,
            description: record.description,
            amount: record.amount.toString(),
            date: record.date,
            month,
            year,
            parkId: record.parkId,
            updatedAt: new Date()
          });

          successCount++;
        } catch (error) {
          console.error("Error al insertar registro:", error);
          errors.push(`Error en registro: ${record.description}`);
          errorCount++;
        }
      }

      res.json({
        message: `Importación completada. ${successCount} registros insertados, ${errorCount} errores.`,
        successCount,
        errorCount,
        errors: errors.slice(0, 10) // Limitar a 10 errores para no sobrecargar la respuesta
      });

    } catch (error) {
      console.error("Error al procesar archivo CSV:", error);
      res.status(500).json({ message: "Error al procesar el archivo CSV" });
    }
  });

  // Importar proyecciones desde CSV
  apiRouter.post("/import/projections", upload.single('csvFile'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se ha enviado ningún archivo CSV" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const { type, parkId, scenario = 'realistic' } = req.body;
      
      if (!type || !['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "Tipo de datos inválido. Debe ser 'income' o 'expense'" });
      }

      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const projections = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;
        
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index];
        });
        
        // Validar campos requeridos para proyecciones
        if (!record.categoria || !record.año || !record.mes || !record.monto) {
          continue;
        }
        
        projections.push({
          categoryName: record.categoria,
          year: parseInt(record.año),
          month: parseInt(record.mes),
          amount: parseFloat(record.monto.replace(/[^0-9.-]/g, '')),
          scenario: record.escenario || scenario,
          parkId: parkId ? parseInt(parkId) : parseInt(record.parque_id) || 1
        });
      }

      if (projections.length === 0) {
        return res.status(400).json({ message: "No se encontraron proyecciones válidas en el archivo CSV" });
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const projection of projections) {
        try {
          // Buscar la categoría por nombre
          const categoryTable = type === 'income' ? incomeCategories : expenseCategories;
          const [category] = await db.select()
            .from(categoryTable)
            .where(eq(categoryTable.name, projection.categoryName))
            .limit(1);

          if (!category) {
            errors.push(`Categoría no encontrada: ${projection.categoryName}`);
            errorCount++;
            continue;
          }

          // Insertar o actualizar la proyección
          await db.insert(cashFlowProjections).values({
            categoryId: category.id,
            categoryType: type,
            year: projection.year,
            month: projection.month,
            projectedAmount: projection.amount.toString(),
            scenario: projection.scenario,
            parkId: projection.parkId,
            createdById: req.user?.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }).onConflictDoUpdate({
            target: [cashFlowProjections.categoryId, cashFlowProjections.year, cashFlowProjections.month, cashFlowProjections.scenario, cashFlowProjections.parkId],
            set: {
              projectedAmount: projection.amount.toString(),
              updatedAt: new Date()
            }
          });

          successCount++;
        } catch (error) {
          console.error("Error al insertar proyección:", error);
          errors.push(`Error en proyección: ${projection.categoryName} - ${projection.year}/${projection.month}`);
          errorCount++;
        }
      }

      res.json({
        message: `Importación de proyecciones completada. ${successCount} registros insertados/actualizados, ${errorCount} errores.`,
        successCount,
        errorCount,
        errors: errors.slice(0, 10)
      });

    } catch (error) {
      console.error("Error al procesar archivo CSV de proyecciones:", error);
      res.status(500).json({ message: "Error al procesar el archivo CSV de proyecciones" });
    }
  });

  // Obtener plantilla CSV para datos históricos
  apiRouter.get("/import/template/historical", async (req: Request, res: Response) => {
    const { type } = req.query;
    
    const csvHeader = 'fecha,categoria,monto,descripcion,parque_id\n';
    const csvExample = type === 'income' 
      ? '2024-01-15,Concesiones,25000.00,Pago mensual concesión cafetería,1\n2024-01-20,Eventos,15000.00,Renta de espacio para evento corporativo,1'
      : '2024-01-15,Mantenimiento,18000.00,Compra de herramientas de jardinería,1\n2024-01-20,Servicios,8500.00,Factura de electricidad mensual,1';
    
    const csvContent = csvHeader + csvExample;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="plantilla_${type === 'income' ? 'ingresos' : 'egresos'}_historicos.csv"`);
    res.send(csvContent);
  });

  // Obtener plantilla CSV para proyecciones
  apiRouter.get("/import/template/projections", async (req: Request, res: Response) => {
    const { type } = req.query;
    
    const csvHeader = 'categoria,año,mes,monto,escenario,parque_id\n';
    const csvExample = type === 'income'
      ? 'Concesiones,2025,1,27000.00,realistic,1\nEventos,2025,1,16000.00,realistic,1\nConcesiones,2025,2,28000.00,optimistic,1'
      : 'Mantenimiento,2025,1,19000.00,realistic,1\nServicios,2025,1,9000.00,realistic,1\nMantenimiento,2025,2,20000.00,pessimistic,1';
    
    const csvContent = csvHeader + csvExample;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="plantilla_${type === 'income' ? 'ingresos' : 'egresos'}_proyecciones.csv"`);
    res.send(csvContent);
  });

  // ============ MÓDULO DE SEGUIMIENTO PRESUPUESTARIO ============

  // Dashboard comparativo presupuesto vs real
  apiRouter.get("/budget-tracking/dashboard/:parkId/:year", async (req: Request, res: Response) => {
    try {
      const { parkId, year } = req.params;
      const yearInt = parseInt(year);
      const parkIdInt = parkId === 'all' ? null : parseInt(parkId);

      // Obtener ingresos reales
      let incomeQuery = db.select().from(actualIncomes).where(eq(actualIncomes.year, yearInt));
      if (parkIdInt) {
        incomeQuery = incomeQuery.where(eq(actualIncomes.parkId, parkIdInt));
      }
      const realIncomes = await incomeQuery;

      // Obtener egresos reales
      let expenseQuery = db.select().from(actualExpenses).where(eq(actualExpenses.year, yearInt));
      if (parkIdInt) {
        expenseQuery = expenseQuery.where(eq(actualExpenses.parkId, parkIdInt));
      }
      const realExpenses = await expenseQuery;

      // Obtener categorías activas
      const activeIncomeCategories = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      const activeExpenseCategories = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));

      // Procesar datos por mes
      const monthlyComparison = [];
      for (let month = 1; month <= 12; month++) {
        const monthData = {
          month,
          monthName: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][month - 1],
          realIncome: 0,
          realExpense: 0,
          incomeCategories: [],
          expenseCategories: []
        };

        // Calcular ingresos reales por categoría
        for (const category of activeIncomeCategories) {
          const categoryRealIncomes = realIncomes.filter(income => 
            income.categoryId === category.id && income.month === month
          );
          const realAmount = categoryRealIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);

          monthData.incomeCategories.push({
            categoryId: category.id,
            categoryName: category.name,
            real: realAmount
          });
          monthData.realIncome += realAmount;
        }

        // Calcular egresos reales por categoría
        for (const category of activeExpenseCategories) {
          const categoryRealExpenses = realExpenses.filter(expense => 
            expense.categoryId === category.id && expense.month === month
          );
          const realAmount = categoryRealExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

          monthData.expenseCategories.push({
            categoryId: category.id,
            categoryName: category.name,
            real: realAmount
          });
          monthData.realExpense += realAmount;
        }

        monthlyComparison.push(monthData);
      }

      // Calcular métricas totales
      const totalRealIncome = monthlyComparison.reduce((sum, month) => sum + month.realIncome, 0);
      const totalRealExpense = monthlyComparison.reduce((sum, month) => sum + month.realExpense, 0);

      const dashboard = {
        year: yearInt,
        parkId: parkIdInt,
        summary: {
          totalRealIncome,
          totalRealExpense,
          netReal: totalRealIncome - totalRealExpense,
          avgMonthlyIncome: totalRealIncome / 12,
          avgMonthlyExpense: totalRealExpense / 12
        },
        monthlyComparison,
        alerts: []
      };

      // Generar alertas básicas
      const currentMonth = new Date().getMonth() + 1;
      if (currentMonth <= 12) {
        const currentMonthData = monthlyComparison[currentMonth - 1];
        const avgIncome = totalRealIncome / Math.max(currentMonth - 1, 1);
        const avgExpense = totalRealExpense / Math.max(currentMonth - 1, 1);

        if (currentMonthData.realExpense > avgExpense * 1.5) {
          dashboard.alerts.push({
            type: 'warning',
            message: `Gastos en ${currentMonthData.monthName} exceden significativamente el promedio mensual`,
            month: currentMonth
          });
        }
        if (currentMonthData.realIncome < avgIncome * 0.7) {
          dashboard.alerts.push({
            type: 'danger',
            message: `Ingresos en ${currentMonthData.monthName} están por debajo del promedio mensual`,
            month: currentMonth
          });
        }
      }

      res.json(dashboard);
    } catch (error) {
      console.error("Error al obtener dashboard de seguimiento presupuestario:", error);
      res.status(500).json({ message: "Error al obtener dashboard de seguimiento presupuestario" });
    }
  });

  // Análisis de variaciones por categoría
  apiRouter.get("/budget-tracking/variance-analysis/:parkId/:year", async (req: Request, res: Response) => {
    try {
      const { parkId, year } = req.params;
      const yearInt = parseInt(year);
      const parkIdInt = parkId === 'all' ? null : parseInt(parkId);

      // Obtener categorías activas
      const incomeCategories = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      const expenseCategories = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));

      // Obtener datos reales
      let incomeQuery = db.select().from(actualIncomes).where(eq(actualIncomes.year, yearInt));
      let expenseQuery = db.select().from(actualExpenses).where(eq(actualExpenses.year, yearInt));
      
      if (parkIdInt) {
        incomeQuery = incomeQuery.where(eq(actualIncomes.parkId, parkIdInt));
        expenseQuery = expenseQuery.where(eq(actualExpenses.parkId, parkIdInt));
      }

      const realIncomes = await incomeQuery;
      const realExpenses = await expenseQuery;

      const varianceAnalysis = {
        incomeVariances: [],
        expenseVariances: [],
        trends: []
      };

      // Analizar ingresos por categoría
      for (const category of incomeCategories) {
        const categoryIncomes = realIncomes.filter(income => income.categoryId === category.id);
        const totalReal = categoryIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
        
        const monthlyData = [];
        for (let month = 1; month <= 12; month++) {
          const monthIncomes = categoryIncomes.filter(income => income.month === month);
          const monthReal = monthIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
          monthlyData.push({
            month,
            real: monthReal
          });
        }

        varianceAnalysis.incomeVariances.push({
          categoryId: category.id,
          categoryName: category.name,
          totalReal,
          monthlyData,
          avgMonthly: totalReal / 12,
          trend: 'stable' // Se calcularía con una función de análisis de tendencias
        });
      }

      // Analizar egresos por categoría
      for (const category of expenseCategories) {
        const categoryExpenses = realExpenses.filter(expense => expense.categoryId === category.id);
        const totalReal = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        
        const monthlyData = [];
        for (let month = 1; month <= 12; month++) {
          const monthExpenses = categoryExpenses.filter(expense => expense.month === month);
          const monthReal = monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
          monthlyData.push({
            month,
            real: monthReal
          });
        }

        varianceAnalysis.expenseVariances.push({
          categoryId: category.id,
          categoryName: category.name,
          totalReal,
          monthlyData,
          avgMonthly: totalReal / 12,
          trend: 'stable' // Se calcularía con una función de análisis de tendencias
        });
      }

      res.json(varianceAnalysis);
    } catch (error) {
      console.error("Error al obtener análisis de variaciones:", error);
      res.status(500).json({ message: "Error al obtener análisis de variaciones" });
    }
  });

  // Proyecciones ajustadas basadas en datos reales
  apiRouter.get("/budget-tracking/adjusted-projections/:parkId/:year", async (req: Request, res: Response) => {
    try {
      const { parkId, year } = req.params;
      const yearInt = parseInt(year);
      const parkIdInt = parkId === 'all' ? null : parseInt(parkId);
      const currentMonth = new Date().getMonth() + 1;

      // Obtener datos reales hasta el mes actual
      let incomeQuery = db.select().from(actualIncomes)
        .where(and(
          eq(actualIncomes.year, yearInt),
          lte(actualIncomes.month, currentMonth)
        ));
      
      let expenseQuery = db.select().from(actualExpenses)
        .where(and(
          eq(actualExpenses.year, yearInt),
          lte(actualExpenses.month, currentMonth)
        ));

      if (parkIdInt) {
        incomeQuery = incomeQuery.where(eq(actualIncomes.parkId, parkIdInt));
        expenseQuery = expenseQuery.where(eq(actualExpenses.parkId, parkIdInt));
      }

      const realIncomes = await incomeQuery;
      const realExpenses = await expenseQuery;

      // Obtener categorías activas
      const incomeCategories = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      const expenseCategories = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));

      const adjustedProjections = {
        year: yearInt,
        currentMonth,
        incomeProjections: [],
        expenseProjections: [],
        yearEndProjection: {
          totalIncome: 0,
          totalExpense: 0,
          netProjection: 0
        }
      };

      // Proyecciones de ingresos
      for (const category of incomeCategories) {
        const categoryIncomes = realIncomes.filter(income => income.categoryId === category.id);
        const realToDate = categoryIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
        
        const monthsWithData = Math.max(currentMonth, 1);
        const monthlyAverage = realToDate / monthsWithData;
        
        const remainingMonths = 12 - currentMonth;
        const projectedRemaining = monthlyAverage * remainingMonths;
        const yearEndProjection = realToDate + projectedRemaining;

        const projection = {
          categoryId: category.id,
          categoryName: category.name,
          realToDate,
          monthlyAverage,
          projectedRemaining,
          yearEndProjection,
          confidenceLevel: monthsWithData >= 3 ? 'high' : monthsWithData >= 2 ? 'medium' : 'low'
        };

        adjustedProjections.incomeProjections.push(projection);
        adjustedProjections.yearEndProjection.totalIncome += yearEndProjection;
      }

      // Proyecciones de egresos
      for (const category of expenseCategories) {
        const categoryExpenses = realExpenses.filter(expense => expense.categoryId === category.id);
        const realToDate = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        
        const monthsWithData = Math.max(currentMonth, 1);
        const monthlyAverage = realToDate / monthsWithData;
        
        const remainingMonths = 12 - currentMonth;
        const projectedRemaining = monthlyAverage * remainingMonths;
        const yearEndProjection = realToDate + projectedRemaining;

        const projection = {
          categoryId: category.id,
          categoryName: category.name,
          realToDate,
          monthlyAverage,
          projectedRemaining,
          yearEndProjection,
          confidenceLevel: monthsWithData >= 3 ? 'high' : monthsWithData >= 2 ? 'medium' : 'low'
        };

        adjustedProjections.expenseProjections.push(projection);
        adjustedProjections.yearEndProjection.totalExpense += yearEndProjection;
      }

      adjustedProjections.yearEndProjection.netProjection = 
        adjustedProjections.yearEndProjection.totalIncome - 
        adjustedProjections.yearEndProjection.totalExpense;

      res.json(adjustedProjections);
    } catch (error) {
      console.error("Error al obtener proyecciones ajustadas:", error);
      res.status(500).json({ message: "Error al obtener proyecciones ajustadas" });
    }
  });

  // Alertas presupuestarias
  apiRouter.get("/budget-tracking/alerts/:parkId", async (req: Request, res: Response) => {
    try {
      const { parkId } = req.params;
      const parkIdInt = parkId === 'all' ? null : parseInt(parkId);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      let incomeQuery = db.select().from(actualIncomes).where(eq(actualIncomes.year, currentYear));
      let expenseQuery = db.select().from(actualExpenses).where(eq(actualExpenses.year, currentYear));

      if (parkIdInt) {
        incomeQuery = incomeQuery.where(eq(actualIncomes.parkId, parkIdInt));
        expenseQuery = expenseQuery.where(eq(actualExpenses.parkId, parkIdInt));
      }

      const realIncomes = await incomeQuery;
      const realExpenses = await expenseQuery;
      const alerts = [];

      // Verificar egresos excesivos por categoría
      const expenseCategories = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));
      
      for (const category of expenseCategories) {
        const monthExpenses = realExpenses.filter(expense => 
          expense.categoryId === category.id && expense.month === currentMonth
        );
        const monthTotal = monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        
        const previousMonthsExpenses = realExpenses.filter(expense => 
          expense.categoryId === category.id && expense.month < currentMonth
        );
        const avgPreviousMonths = previousMonthsExpenses.length > 0 
          ? previousMonthsExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) / (currentMonth - 1)
          : 0;

        if (monthTotal > avgPreviousMonths * 1.5 && avgPreviousMonths > 0) {
          alerts.push({
            type: 'expense_spike',
            severity: 'warning',
            category: category.name,
            message: `Gastos en ${category.name} este mes (${monthTotal.toLocaleString()}) exceden 150% del promedio mensual`,
            amount: monthTotal,
            threshold: avgPreviousMonths * 1.5
          });
        }
      }

      // Verificar ingresos por debajo del promedio
      const incomeCategories = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
      
      for (const category of incomeCategories) {
        const monthIncomes = realIncomes.filter(income => 
          income.categoryId === category.id && income.month === currentMonth
        );
        const monthTotal = monthIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
        
        const previousMonthsIncomes = realIncomes.filter(income => 
          income.categoryId === category.id && income.month < currentMonth
        );
        const avgPreviousMonths = previousMonthsIncomes.length > 0 
          ? previousMonthsIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0) / (currentMonth - 1)
          : 0;

        if (monthTotal < avgPreviousMonths * 0.7 && avgPreviousMonths > 0) {
          alerts.push({
            type: 'income_drop',
            severity: 'danger',
            category: category.name,
            message: `Ingresos en ${category.name} este mes (${monthTotal.toLocaleString()}) están 30% por debajo del promedio mensual`,
            amount: monthTotal,
            threshold: avgPreviousMonths * 0.7
          });
        }
      }

      res.json({ alerts, generatedAt: new Date() });
    } catch (error) {
      console.error("Error al obtener alertas presupuestarias:", error);
      res.status(500).json({ message: "Error al obtener alertas presupuestarias" });
    }
  });

  console.log("Rutas del módulo financiero registradas correctamente");
}