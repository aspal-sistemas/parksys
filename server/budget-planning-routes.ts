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
      
      // Calcular totales mensuales
      for (let month = 1; month <= 12; month++) {
        const monthlyIncome = budgetMatrix.incomeCategories.reduce((sum, cat) => sum + (cat.months[month] || 0), 0);
        const monthlyExpense = budgetMatrix.expenseCategories.reduce((sum, cat) => sum + (cat.months[month] || 0), 0);
        
        budgetMatrix.monthlyTotals.income[month] = monthlyIncome;
        budgetMatrix.monthlyTotals.expense[month] = monthlyExpense;
        budgetMatrix.monthlyTotals.net[month] = monthlyIncome - monthlyExpense;
      }
      
      // Calcular totales anuales
      budgetMatrix.yearlyTotals.income = budgetMatrix.incomeCategories.reduce((sum, cat) => sum + (cat.total || 0), 0);
      budgetMatrix.yearlyTotals.expense = budgetMatrix.expenseCategories.reduce((sum, cat) => sum + (cat.total || 0), 0);
      budgetMatrix.yearlyTotals.net = budgetMatrix.yearlyTotals.income - budgetMatrix.yearlyTotals.expense;
      
      res.json(budgetMatrix);
    } catch (error) {
      console.error('Error al obtener proyecciones presupuestarias:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las proyecciones presupuestarias'
      });
    }
  });
  
  // Guardar matriz presupuestaria
  apiRouter.post('/budget-projections/:year', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const { matrix } = req.body;
      
      console.log(`=== GUARDANDO MATRIZ PRESUPUESTARIA PARA ${year} ===`);
      
      // Eliminar proyecciones existentes del año
      await db.delete(budgetProjections)
        .where(eq(budgetProjections.year, year));
      
      const projectionInserts = [];
      
      // Procesar categorías de ingresos
      for (const category of matrix.incomeCategories) {
        const totalAmount = Object.values(category.months).reduce((sum: number, val: any) => sum + parseFloat(val || '0'), 0);
        
        projectionInserts.push({
          year,
          categoryId: category.categoryId,
          categoryType: 'income',
          month1: category.months[1]?.toString() || '0',
          month2: category.months[2]?.toString() || '0',
          month3: category.months[3]?.toString() || '0',
          month4: category.months[4]?.toString() || '0',
          month5: category.months[5]?.toString() || '0',
          month6: category.months[6]?.toString() || '0',
          month7: category.months[7]?.toString() || '0',
          month8: category.months[8]?.toString() || '0',
          month9: category.months[9]?.toString() || '0',
          month10: category.months[10]?.toString() || '0',
          month11: category.months[11]?.toString() || '0',
          month12: category.months[12]?.toString() || '0',
          totalAmount: totalAmount.toString()
        });
      }
      
      // Procesar categorías de gastos
      for (const category of matrix.expenseCategories) {
        const totalAmount = Object.values(category.months).reduce((sum: number, val: any) => sum + parseFloat(val || '0'), 0);
        
        projectionInserts.push({
          year,
          categoryId: category.categoryId,
          categoryType: 'expense',
          month1: category.months[1]?.toString() || '0',
          month2: category.months[2]?.toString() || '0',
          month3: category.months[3]?.toString() || '0',
          month4: category.months[4]?.toString() || '0',
          month5: category.months[5]?.toString() || '0',
          month6: category.months[6]?.toString() || '0',
          month7: category.months[7]?.toString() || '0',
          month8: category.months[8]?.toString() || '0',
          month9: category.months[9]?.toString() || '0',
          month10: category.months[10]?.toString() || '0',
          month11: category.months[11]?.toString() || '0',
          month12: category.months[12]?.toString() || '0',
          totalAmount: totalAmount.toString()
        });
      }
      
      // Insertar nuevas proyecciones
      if (projectionInserts.length > 0) {
        await db.insert(budgetProjections).values(projectionInserts);
      }
      
      console.log(`✓ Matriz presupuestaria guardada exitosamente`);
      res.json({ 
        success: true, 
        message: `Matriz presupuestaria del ${year} guardada correctamente`,
        count: projectionInserts.length
      });
    } catch (error) {
      console.error('Error al guardar matriz:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudo guardar la matriz presupuestaria'
      });
    }
  });
  
  // Importar proyecciones desde CSV (simplificado)
  apiRouter.post('/budget-projections/import-csv', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { year, csvData } = req.body;
      
      console.log(`=== IMPORTANDO CSV PARA ${year} ===`);
      console.log(`Filas CSV: ${csvData.length}`);
      
      // Obtener mapeo de categorías
      const [incomeCategs, expenseCategs] = await Promise.all([
        db.select().from(incomeCategories),
        db.select().from(expenseCategories)
      ]);
      
      const categoryMap = new Map();
      incomeCategs.forEach(cat => categoryMap.set(cat.name.toLowerCase(), { id: cat.id, type: 'income' }));
      expenseCategs.forEach(cat => categoryMap.set(cat.name.toLowerCase(), { id: cat.id, type: 'expense' }));
      
      const projectionInserts = [];
      let processedRows = 0;
      let skippedRows = 0;
      
      for (const row of csvData) {
        const categoryName = row['Categoría']?.toLowerCase().trim();
        if (!categoryName) {
          skippedRows++;
          continue;
        }
        
        const categoryInfo = categoryMap.get(categoryName);
        if (!categoryInfo) {
          console.log(`Categoría no encontrada: ${categoryName}`);
          skippedRows++;
          continue;
        }
        
        const monthlyAmounts: { [key: string]: string } = {};
        let totalAmount = 0;
        
        for (let month = 1; month <= 12; month++) {
          const monthKey = `Mes ${month}`;
          const amount = parseFloat(row[monthKey] || '0');
          monthlyAmounts[`month${month}`] = amount.toString();
          totalAmount += amount;
        }
        
        projectionInserts.push({
          year: parseInt(year),
          categoryId: categoryInfo.id,
          categoryType: categoryInfo.type,
          ...monthlyAmounts,
          totalAmount: totalAmount.toString()
        });
        
        processedRows++;
      }
      
      // Eliminar proyecciones existentes del año
      await db.delete(budgetProjections)
        .where(eq(budgetProjections.year, parseInt(year)));
      
      // Insertar nuevas proyecciones
      if (projectionInserts.length > 0) {
        await db.insert(budgetProjections).values(projectionInserts);
      }
      
      console.log(`✓ CSV importado: ${processedRows} filas procesadas, ${skippedRows} omitidas`);
      res.json({ 
        success: true,
        message: `CSV importado correctamente`,
        processed: processedRows,
        skipped: skippedRows
      });
    } catch (error) {
      console.error('Error al importar CSV:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudo importar el archivo CSV'
      });
    }
  });
  
  // Exportar matriz a CSV
  apiRouter.get('/budget-projections/:year/export-csv', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      
      // Obtener matriz presupuestaria
      const matrixResponse = await fetch(`${req.protocol}://${req.get('host')}/api/budget-projections/${year}`);
      const matrix = await matrixResponse.json();
      
      // Crear estructura CSV
      const csvData = [];
      
      // Agregar categorías de ingresos
      matrix.incomeCategories.forEach((category: BudgetEntry) => {
        const row: any = {
          'Tipo': 'Ingreso',
          'Categoría': category.categoryName
        };
        
        for (let month = 1; month <= 12; month++) {
          row[`Mes ${month}`] = category.months[month] || 0;
        }
        
        row['Total'] = category.total;
        csvData.push(row);
      });
      
      // Agregar categorías de gastos
      matrix.expenseCategories.forEach((category: BudgetEntry) => {
        const row: any = {
          'Tipo': 'Gasto',
          'Categoría': category.categoryName
        };
        
        for (let month = 1; month <= 12; month++) {
          row[`Mes ${month}`] = category.months[month] || 0;
        }
        
        row['Total'] = category.total;
        csvData.push(row);
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="presupuesto_${year}.csv"`);
      
      // Crear CSV string
      const headers = ['Tipo', 'Categoría', ...Array.from({length: 12}, (_, i) => `Mes ${i + 1}`), 'Total'];
      let csvString = headers.join(',') + '\n';
      
      csvData.forEach(row => {
        const values = headers.map(header => row[header] || 0);
        csvString += values.join(',') + '\n';
      });
      
      res.send(csvString);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'No se pudo exportar el archivo CSV'
      });
    }
  });
}

// Función auxiliar para construir entradas de categorías
function buildCategoryEntries(categories: any[], projections: any[], type: 'income' | 'expense'): BudgetEntry[] {
  return categories.map(category => {
    const categoryProjection = projections.find(p => 
      p.categoryId === category.id && p.categoryType === type
    );

    const months: { [month: number]: number } = {};
    let total = 0;

    if (categoryProjection) {
      // Extraer valores mensuales desde month1 hasta month12
      for (let month = 1; month <= 12; month++) {
        const monthKey = `month${month}` as keyof typeof categoryProjection;
        const amount = parseFloat(categoryProjection[monthKey] as string || '0');
        months[month] = amount;
        total += amount;
      }
    } else {
      // Inicializar con ceros si no hay proyección
      for (let month = 1; month <= 12; month++) {
        months[month] = 0;
      }
    }

    return {
      categoryId: category.id,
      categoryName: category.name,
      months,
      total
    };
  });
}

