import { db } from "./db";
import { 
  payrollConcepts, 
  expenseCategories,
  actualExpenses
} from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Script para inicializar conceptos de nómina y categorías necesarias
 */
export async function initializePayroll() {
  try {
    console.log("Inicializando sistema de nómina...");

    // 1. Crear categoría de gastos para Personal si no existe
    const [personalCategory] = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.code, "PERSONAL"));

    let categoryId = 7; // ID por defecto
    if (!personalCategory) {
      const [newCategory] = await db
        .insert(expenseCategories)
        .values({
          code: "PERSONAL",
          name: "Personal",
          description: "Gastos de nómina y personal",
          level: 1,
          isActive: true,
          sortOrder: 7
        })
        .returning();
      categoryId = newCategory.id;
      console.log(`Categoría Personal creada con ID: ${categoryId}`);
    } else {
      categoryId = personalCategory.id;
      console.log(`Categoría Personal encontrada con ID: ${categoryId}`);
    }

    // 2. Crear conceptos de nómina básicos
    const conceptsData = [
      {
        code: "SALARY",
        name: "Salario Base",
        type: "income" as const,
        category: "salary" as const,
        isFixed: true,
        formula: null,
        isActive: true,
        expenseCategoryId: categoryId,
        sortOrder: 1
      },
      {
        code: "BONUS",
        name: "Bonificaciones",
        type: "income" as const,
        category: "bonus" as const,
        isFixed: false,
        formula: null,
        isActive: true,
        expenseCategoryId: categoryId,
        sortOrder: 2
      },
      {
        code: "OVERTIME",
        name: "Horas Extra",
        type: "income" as const,
        category: "overtime" as const,
        isFixed: false,
        formula: "salary * 1.5 * hours",
        isActive: true,
        expenseCategoryId: categoryId,
        sortOrder: 3
      },
      {
        code: "IMSS",
        name: "IMSS (Empleado)",
        type: "deduction" as const,
        category: "insurance" as const,
        isFixed: false,
        formula: "salary * 0.02375",
        isActive: true,
        expenseCategoryId: categoryId,
        sortOrder: 4
      },
      {
        code: "ISR",
        name: "Impuesto Sobre la Renta",
        type: "deduction" as const,
        category: "tax" as const,
        isFixed: false,
        formula: "calculateISR(salary)",
        isActive: true,
        expenseCategoryId: categoryId,
        sortOrder: 5
      },
      {
        code: "INFONAVIT",
        name: "INFONAVIT",
        type: "deduction" as const,
        category: "insurance" as const,
        isFixed: false,
        formula: "salary * 0.05",
        isActive: true,
        expenseCategoryId: categoryId,
        sortOrder: 6
      }
    ];

    const createdConcepts = [];
    for (const concept of conceptsData) {
      try {
        const [existingConcept] = await db
          .select()
          .from(payrollConcepts)
          .where(eq(payrollConcepts.code, concept.code));
        
        if (!existingConcept) {
          const [newConcept] = await db
            .insert(payrollConcepts)
            .values(concept)
            .returning();
          createdConcepts.push(newConcept);
          console.log(`Concepto creado: ${newConcept.name} (${newConcept.code})`);
        } else {
          createdConcepts.push(existingConcept);
          console.log(`Concepto existe: ${existingConcept.name} (${existingConcept.code})`);
        }
      } catch (error) {
        console.error(`Error creando concepto ${concept.code}:`, error);
      }
    }

    console.log(`✅ Sistema de nómina inicializado correctamente`);
    console.log(`📊 Conceptos configurados: ${createdConcepts.length}`);
    console.log(`💼 Categoría de gastos: ${categoryId}`);

    return {
      success: true,
      categoryId,
      conceptsCreated: createdConcepts.length,
      concepts: createdConcepts
    };

  } catch (error) {
    console.error("❌ Error inicializando sistema de nómina:", error);
    return {
      success: false,
      error: error
    };
  }
}

// Auto-ejecutar la inicialización
initializePayroll()
  .then(() => console.log("Inicialización completada"))
  .catch((error) => console.error("Error en inicialización:", error));