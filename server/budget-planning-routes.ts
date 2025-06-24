import { Router, Request, Response } from "express";
import { db } from "./db";
import { budgetProjections, budgetTemplates } from "../shared/budget-planning-schema";
import { incomeCategories, expenseCategories } from "../shared/finance-schema";
import { eq, and } from "drizzle-orm";
import { BudgetMatrix, BudgetEntry, BudgetCSVRow } from "../shared/budget-planning-schema";

/**
 * Registra las rutas para el módulo de planificación presupuestaria
 */
export function registerBudgetPlanningRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  
  // Obtener proyecciones presupuestarias por año
  apiRouter.get('/budget-projections', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      console.log(`=== OBTENIENDO PROYECCIONES PRESUPUESTARIAS PARA ${year} ===`);
      
      // Obtener todas las categorías activas
      const [incomeCategs, expenseCategs] = await Promise.all([
        db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true)),
        db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true))
      ]);
      
      // Obtener proyecciones existentes para el año
      const projections = await db.select()
        .from(budgetProjections)
        .where(eq(budgetProjections.year, year));
      
      console.log(`Proyecciones encontradas: ${projections.length}`);
      console.log(`Categorías ingresos: ${incomeCategs.length}, gastos: ${expenseCategs.length}`);
      
      // Construir matriz presupuestaria
      const budgetMatrix: BudgetMatrix = {
        year,
        incomeCategories: buildCategoryEntries(incomeCategs, projections, 'income'),
        expenseCategories: buildCategoryEntries(expenseCategs, projections, 'expense'),
        monthlyTotals: {
          income: {},
          expense: {},
          net: {}
        },
        yearlyTotals: {
          income: 0,
          expense: 0,
          net: 0
        }
      };
      
      // Calcular totales mensuales y anuales
      calculateTotals(budgetMatrix);
      
      res.json(budgetMatrix);
    } catch (error) {
      console.error('Error al obtener proyecciones presupuestarias:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las proyecciones presupuestarias'
      });
    }
  });
  
  // Guardar proyecciones presupuestarias (operación masiva)
  apiRouter.post('/budget-projections/bulk', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { year, projections } = req.body;
      const userId = parseInt(req.headers['x-user-id'] as string) || 1;
      
      console.log(`=== GUARDANDO PROYECCIONES PRESUPUESTARIAS PARA ${year} ===`);
      console.log(`Proyecciones recibidas: ${projections.length}`);
      
      // Eliminar proyecciones existentes del año
      await db.delete(budgetProjections)
        .where(eq(budgetProjections.year, year));
      
      // Insertar nuevas proyecciones
      if (projections.length > 0) {
        const formattedProjections = projections.map((proj: any) => ({
          categoryId: proj.categoryId,
          year: year,
          month: proj.month,
          projectedAmount: proj.projectedAmount.toString(),
          createdBy: userId,
          isApproved: false
        }));
        
        await db.insert(budgetProjections).values(formattedProjections);
      }
      
      console.log(`✓ Proyecciones guardadas exitosamente`);
      res.json({ 
        success: true, 
        message: `Proyecciones del ${year} guardadas correctamente`,
        count: projections.length
      });
    } catch (error) {
      console.error('Error al guardar proyecciones:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudieron guardar las proyecciones'
      });
    }
  });
  
  // Importar proyecciones desde CSV
  apiRouter.post('/budget-projections/import-csv', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { year, csvData } = req.body;
      const userId = parseInt(req.headers['x-user-id'] as string) || 1;
      
      console.log(`=== IMPORTANDO CSV PARA ${year} ===`);
      console.log(`Filas CSV: ${csvData.length}`);
      
      // Obtener mapeo de categorías
      const [incomeCategs, expenseCategs] = await Promise.all([
        db.select().from(incomeCategories),
        db.select().from(expenseCategories)
      ]);
      
      const categoryMap = new Map<string, { id: number; type: 'income' | 'expense' }>();
      incomeCategs.forEach(cat => categoryMap.set(cat.name.toLowerCase(), { id: cat.id, type: 'income' }));
      expenseCategs.forEach(cat => categoryMap.set(cat.name.toLowerCase(), { id: cat.id, type: 'expense' }));
      
      // Procesar filas CSV
      const projections: any[] = [];
      const errors: string[] = [];
      
      csvData.forEach((row: BudgetCSVRow, index: number) => {
        const categoryInfo = categoryMap.get(row.categoria.toLowerCase());
        
        if (!categoryInfo) {
          errors.push(`Fila ${index + 1}: Categoría "${row.categoria}" no encontrada`);
          return;
        }
        
        // Validar tipo de categoría
        if (row.tipo !== 'ingreso' && row.tipo !== 'gasto') {
          errors.push(`Fila ${index + 1}: Tipo "${row.tipo}" inválido (debe ser "ingreso" o "gasto")`);
          return;
        }
        
        const expectedType = row.tipo === 'ingreso' ? 'income' : 'expense';
        if (categoryInfo.type !== expectedType) {
          errors.push(`Fila ${index + 1}: Categoría "${row.categoria}" no corresponde al tipo "${row.tipo}"`);
          return;
        }
        
        // Crear proyecciones para cada mes
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        months.forEach((monthName, monthIndex) => {
          const amount = row[monthName as keyof BudgetCSVRow] as number;
          if (amount && amount > 0) {
            projections.push({
              categoryId: categoryInfo.id,
              year: year,
              month: monthIndex + 1,
              projectedAmount: amount.toString(),
              createdBy: userId,
              isApproved: false
            });
          }
        });
      });
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors: errors,
          message: `Se encontraron ${errors.length} errores en el archivo CSV`
        });
      }
      
      // Eliminar proyecciones existentes e insertar nuevas
      await db.delete(budgetProjections).where(eq(budgetProjections.year, year));
      
      if (projections.length > 0) {
        await db.insert(budgetProjections).values(projections);
      }
      
      console.log(`✓ CSV importado: ${projections.length} proyecciones`);
      res.json({
        success: true,
        message: `CSV importado correctamente`,
        projectionsCount: projections.length
      });
    } catch (error) {
      console.error('Error al importar CSV:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudo importar el archivo CSV'
      });
    }
  });
  
  // Exportar proyecciones a CSV
  apiRouter.get('/budget-projections/export-csv', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      console.log(`=== EXPORTANDO CSV PARA ${year} ===`);
      
      // Obtener datos para exportación
      const budgetData = await getBudgetMatrixForYear(year);
      
      // Convertir a formato CSV
      const csvRows: any[] = [];
      
      // Agregar categorías de ingresos
      budgetData.incomeCategories.forEach(category => {
        csvRows.push({
          categoria: category.categoryName,
          tipo: 'ingreso',
          enero: category.months[1] || 0,
          febrero: category.months[2] || 0,
          marzo: category.months[3] || 0,
          abril: category.months[4] || 0,
          mayo: category.months[5] || 0,
          junio: category.months[6] || 0,
          julio: category.months[7] || 0,
          agosto: category.months[8] || 0,
          septiembre: category.months[9] || 0,
          octubre: category.months[10] || 0,
          noviembre: category.months[11] || 0,
          diciembre: category.months[12] || 0,
          total: category.totalYear
        });
      });
      
      // Agregar categorías de gastos
      budgetData.expenseCategories.forEach(category => {
        csvRows.push({
          categoria: category.categoryName,
          tipo: 'gasto',
          enero: category.months[1] || 0,
          febrero: category.months[2] || 0,
          marzo: category.months[3] || 0,
          abril: category.months[4] || 0,
          mayo: category.months[5] || 0,
          junio: category.months[6] || 0,
          julio: category.months[7] || 0,
          agosto: category.months[8] || 0,
          septiembre: category.months[9] || 0,
          octubre: category.months[10] || 0,
          noviembre: category.months[11] || 0,
          diciembre: category.months[12] || 0,
          total: category.totalYear
        });
      });
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="presupuesto_${year}.json"`);
      res.json({
        year: year,
        exportDate: new Date().toISOString(),
        data: csvRows,
        totals: budgetData.yearlyTotals
      });
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudo exportar el archivo CSV'
      });
    }
  });
  
  // Obtener plantillas de presupuesto
  apiRouter.get('/budget-templates', async (req: Request, res: Response) => {
    try {
      const templates = await db.select().from(budgetTemplates);
      res.json(templates);
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las plantillas'
      });
    }
  });
  
  // Crear plantilla de presupuesto
  apiRouter.post('/budget-templates', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.headers['x-user-id'] as string) || 1;
      const templateData = { ...req.body, createdBy: userId };
      
      const [newTemplate] = await db.insert(budgetTemplates)
        .values(templateData)
        .returning();
      
      res.json(newTemplate);
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudo crear la plantilla'
      });
    }
  });
}

// Función auxiliar para construir entradas de categorías
function buildCategoryEntries(categories: any[], projections: any[], type: 'income' | 'expense'): BudgetEntry[] {
  return categories.map(category => {
    const categoryProjections = projections.filter(p => p.categoryId === category.id);
    const months: { [month: number]: number } = {};
    let totalYear = 0;
    
    // Inicializar meses con 0
    for (let i = 1; i <= 12; i++) {
      months[i] = 0;
    }
    
    // Llenar con proyecciones existentes
    categoryProjections.forEach(proj => {
      const amount = parseFloat(proj.projectedAmount) || 0;
      months[proj.month] = amount;
      totalYear += amount;
    });
    
    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryType: type,
      categoryColor: category.color || (type === 'income' ? '#10b981' : '#ef4444'),
      months,
      totalYear
    };
  });
}

// Función auxiliar para calcular totales
function calculateTotals(budgetMatrix: BudgetMatrix) {
  // Inicializar totales mensuales
  for (let month = 1; month <= 12; month++) {
    budgetMatrix.monthlyTotals.income[month] = 0;
    budgetMatrix.monthlyTotals.expense[month] = 0;
    budgetMatrix.monthlyTotals.net[month] = 0;
  }
  
  // Calcular totales de ingresos
  budgetMatrix.incomeCategories.forEach(category => {
    budgetMatrix.yearlyTotals.income += category.totalYear;
    for (let month = 1; month <= 12; month++) {
      budgetMatrix.monthlyTotals.income[month] += category.months[month] || 0;
    }
  });
  
  // Calcular totales de gastos
  budgetMatrix.expenseCategories.forEach(category => {
    budgetMatrix.yearlyTotals.expense += category.totalYear;
    for (let month = 1; month <= 12; month++) {
      budgetMatrix.monthlyTotals.expense[month] += category.months[month] || 0;
    }
  });
  
  // Calcular flujo neto
  budgetMatrix.yearlyTotals.net = budgetMatrix.yearlyTotals.income - budgetMatrix.yearlyTotals.expense;
  for (let month = 1; month <= 12; month++) {
    budgetMatrix.monthlyTotals.net[month] = 
      budgetMatrix.monthlyTotals.income[month] - budgetMatrix.monthlyTotals.expense[month];
  }
}

// Función auxiliar para obtener matriz presupuestaria
async function getBudgetMatrixForYear(year: number): Promise<BudgetMatrix> {
  const [incomeCategs, expenseCategs] = await Promise.all([
    db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true)),
    db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true))
  ]);
  
  const projections = await db.select()
    .from(budgetProjections)
    .where(eq(budgetProjections.year, year));
  
  const budgetMatrix: BudgetMatrix = {
    year,
    incomeCategories: buildCategoryEntries(incomeCategs, projections, 'income'),
    expenseCategories: buildCategoryEntries(expenseCategs, projections, 'expense'),
    monthlyTotals: { income: {}, expense: {}, net: {} },
    yearlyTotals: { income: 0, expense: 0, net: 0 }
  };
  
  calculateTotals(budgetMatrix);
  return budgetMatrix;
}