import { db } from "./db";
import { 
  budgets, 
  budgetIncomeLines, 
  budgetExpenseLines,
  incomeCategories,
  expenseCategories 
} from "@shared/finance-schema";

/**
 * Script para crear presupuestos ficticios para 2025 y 2026
 */
export async function createSampleBudgets() {
  try {
    console.log("Creando presupuestos ficticios para 2025 y 2026...");

    // Crear presupuesto municipal 2025
    const budget2025 = await db.insert(budgets).values({
      name: "Presupuesto Municipal de Parques 2025",
      year: 2025,
      municipalityId: 1,
      parkId: null, // Nivel municipal
      status: "active",
      totalIncome: "5500000.00",
      totalExpenses: "4200000.00",
      notes: "Presupuesto anual para la gestión integral de parques municipales 2025"
    }).returning();

    // Crear presupuesto municipal 2026
    const budget2026 = await db.insert(budgets).values({
      name: "Presupuesto Municipal de Parques 2026",
      year: 2026,
      municipalityId: 1,
      parkId: null, // Nivel municipal
      status: "approved",
      totalIncome: "6200000.00",
      totalExpenses: "4800000.00",
      notes: "Presupuesto anual para la gestión integral de parques municipales 2026"
    }).returning();

    console.log("Presupuestos creados:", budget2025[0]?.id, budget2026[0]?.id);

    // Obtener categorías existentes
    const incomeCats = await db.select().from(incomeCategories);
    const expenseCats = await db.select().from(expenseCategories);

    console.log(`Encontradas ${incomeCats.length} categorías de ingresos y ${expenseCats.length} categorías de gastos`);

    if (budget2025[0] && incomeCats.length > 0) {
      // Crear líneas de ingresos para 2025
      await db.insert(budgetIncomeLines).values([
        {
          budgetId: budget2025[0].id,
          categoryId: incomeCats[0]?.id,
          concept: "Concesiones de cafeterías y restaurantes",
          projectedAmount: "800000.00"
        },
        {
          budgetId: budget2025[0].id,
          categoryId: incomeCats[0]?.id,
          concept: "Permisos para eventos especiales",
          projectedAmount: "300000.00"
        },
        {
          budgetId: budget2025[0].id,
          categoryId: incomeCats[1]?.id || incomeCats[0]?.id,
          concept: "Participación en actividades recreativas",
          projectedAmount: "450000.00"
        },
        {
          budgetId: budget2025[0].id,
          categoryId: incomeCats[1]?.id || incomeCats[0]?.id,
          concept: "Talleres y cursos educativos",
          projectedAmount: "200000.00"
        }
      ]);
    }

    if (budget2025[0] && expenseCats.length > 0) {
      // Crear líneas de gastos para 2025
      await db.insert(budgetExpenseLines).values([
        {
          budgetId: budget2025[0].id,
          categoryId: expenseCats[0]?.id,
          concept: "Mantenimiento de áreas verdes",
          projectedAmount: "1200000.00"
        },
        {
          budgetId: budget2025[0].id,
          categoryId: expenseCats[1]?.id || expenseCats[0]?.id,
          concept: "Salarios del personal de parques",
          projectedAmount: "1800000.00"
        },
        {
          budgetId: budget2025[0].id,
          categoryId: expenseCats[2]?.id || expenseCats[0]?.id,
          concept: "Equipamiento y mobiliario urbano",
          projectedAmount: "600000.00"
        },
        {
          budgetId: budget2025[0].id,
          categoryId: expenseCats[3]?.id || expenseCats[0]?.id,
          concept: "Servicios públicos (agua, electricidad)",
          projectedAmount: "400000.00"
        }
      ]);
    }

    if (budget2026[0] && incomeCats.length > 0) {
      // Crear líneas de ingresos para 2026
      await db.insert(budgetIncomeLines).values([
        {
          budgetId: budget2026[0].id,
          categoryId: incomeCats[0]?.id,
          concept: "Concesiones de cafeterías y restaurantes",
          projectedAmount: "950000.00"
        },
        {
          budgetId: budget2026[0].id,
          categoryId: incomeCats[0]?.id,
          concept: "Permisos para eventos especiales",
          projectedAmount: "380000.00"
        },
        {
          budgetId: budget2026[0].id,
          categoryId: incomeCats[1]?.id || incomeCats[0]?.id,
          concept: "Participación en actividades recreativas",
          projectedAmount: "520000.00"
        },
        {
          budgetId: budget2026[0].id,
          categoryId: incomeCats[1]?.id || incomeCats[0]?.id,
          concept: "Talleres y cursos educativos",
          projectedAmount: "250000.00"
        }
      ]);
    }

    if (budget2026[0] && expenseCats.length > 0) {
      // Crear líneas de gastos para 2026
      await db.insert(budgetExpenseLines).values([
        {
          budgetId: budget2026[0].id,
          categoryId: expenseCats[0]?.id,
          concept: "Mantenimiento de áreas verdes",
          projectedAmount: "1400000.00"
        },
        {
          budgetId: budget2026[0].id,
          categoryId: expenseCats[1]?.id || expenseCats[0]?.id,
          concept: "Salarios del personal de parques",
          projectedAmount: "2100000.00"
        },
        {
          budgetId: budget2026[0].id,
          categoryId: expenseCats[2]?.id || expenseCats[0]?.id,
          concept: "Equipamiento y mobiliario urbano",
          projectedAmount: "750000.00"
        },
        {
          budgetId: budget2026[0].id,
          categoryId: expenseCats[3]?.id || expenseCats[0]?.id,
          concept: "Servicios públicos (agua, electricidad)",
          projectedAmount: "450000.00"
        }
      ]);
    }

    console.log("Presupuestos ficticios creados exitosamente para 2025 y 2026");
    return { success: true, budget2025: budget2025[0], budget2026: budget2026[0] };

  } catch (error) {
    console.error("Error al crear presupuestos ficticios:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSampleBudgets()
    .then(() => {
      console.log("Script completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}