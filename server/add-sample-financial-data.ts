import { db } from "./db";
import { actualIncomes, actualExpenses } from "../shared/finance-schema";

/**
 * Script para agregar datos financieros de muestra para la matriz de flujo de efectivo
 */
export async function addSampleFinancialData() {
  try {
    console.log("Agregando datos financieros de muestra...");

    // Datos de ingresos de muestra para el año 2025
    const sampleIncomes = [
      // Enero
      { categoryId: 1, amount: "150000", incomeDate: new Date("2025-01-15"), description: "Concesiones restaurante", source: "Concesión A" },
      { categoryId: 2, amount: "80000", incomeDate: new Date("2025-01-20"), description: "Evento cultural", source: "Evento privado" },
      { categoryId: 4, amount: "45000", incomeDate: new Date("2025-01-25"), description: "Alquiler cancha deportiva", source: "Club deportivo" },
      
      // Febrero
      { categoryId: 1, amount: "165000", incomeDate: new Date("2025-02-10"), description: "Concesiones cafetería", source: "Concesión B" },
      { categoryId: 3, amount: "90000", incomeDate: new Date("2025-02-15"), description: "Servicios de jardinería", source: "Empresa externa" },
      { categoryId: 5, amount: "25000", incomeDate: new Date("2025-02-20"), description: "Multas por daños", source: "Sanciones" },

      // Marzo
      { categoryId: 2, amount: "120000", incomeDate: new Date("2025-03-05"), description: "Festival de primavera", source: "Evento masivo" },
      { categoryId: 4, amount: "60000", incomeDate: new Date("2025-03-12"), description: "Alquiler salón eventos", source: "Eventos privados" },
      { categoryId: 6, amount: "75000", incomeDate: new Date("2025-03-18"), description: "Donación empresarial", source: "Empresa local" },

      // Abril
      { categoryId: 1, amount: "140000", incomeDate: new Date("2025-04-08"), description: "Concesiones kioscos", source: "Múltiples concesiones" },
      { categoryId: 8, amount: "55000", incomeDate: new Date("2025-04-15"), description: "Talleres educativos", source: "Programas comunitarios" },
      { categoryId: 9, amount: "35000", incomeDate: new Date("2025-04-22"), description: "Estacionamiento eventos", source: "Cobro por eventos" },

      // Mayo
      { categoryId: 2, amount: "95000", incomeDate: new Date("2025-05-10"), description: "Día de las madres", source: "Evento especial" },
      { categoryId: 7, amount: "200000", incomeDate: new Date("2025-05-15"), description: "Subsidio municipal", source: "Gobierno municipal" },
      { categoryId: 3, amount: "85000", incomeDate: new Date("2025-05-20"), description: "Mantenimiento áreas verdes", source: "Contrato anual" },
    ];

    // Datos de egresos de muestra para el año 2025
    const sampleExpenses = [
      // Enero
      { categoryId: 1, amount: "80000", expenseDate: new Date("2025-01-05"), description: "Nómina empleados", supplier: "Recursos Humanos" },
      { categoryId: 2, amount: "45000", expenseDate: new Date("2025-01-10"), description: "Mantenimiento equipos", supplier: "Empresa mantenimiento" },
      { categoryId: 3, amount: "25000", expenseDate: new Date("2025-01-15"), description: "Servicios públicos", supplier: "CFE y Agua" },

      // Febrero
      { categoryId: 1, amount: "85000", expenseDate: new Date("2025-02-05"), description: "Nómina febrero", supplier: "Recursos Humanos" },
      { categoryId: 4, amount: "30000", expenseDate: new Date("2025-02-12"), description: "Materiales jardinería", supplier: "Vivero local" },
      { categoryId: 5, amount: "20000", expenseDate: new Date("2025-02-18"), description: "Material de limpieza", supplier: "Proveedor A" },

      // Marzo
      { categoryId: 1, amount: "90000", expenseDate: new Date("2025-03-05"), description: "Nómina marzo", supplier: "Recursos Humanos" },
      { categoryId: 2, amount: "55000", expenseDate: new Date("2025-03-10"), description: "Reparación juegos infantiles", supplier: "Empresa especializada" },
      { categoryId: 6, amount: "40000", expenseDate: new Date("2025-03-15"), description: "Capacitación personal", supplier: "Instituto capacitación" },

      // Abril
      { categoryId: 1, amount: "88000", expenseDate: new Date("2025-04-05"), description: "Nómina abril", supplier: "Recursos Humanos" },
      { categoryId: 3, amount: "35000", expenseDate: new Date("2025-04-12"), description: "Electricidad y agua", supplier: "Servicios públicos" },
      { categoryId: 7, amount: "50000", expenseDate: new Date("2025-04-20"), description: "Mejoras infraestructura", supplier: "Constructora" },

      // Mayo
      { categoryId: 1, amount: "92000", expenseDate: new Date("2025-05-05"), description: "Nómina mayo", supplier: "Recursos Humanos" },
      { categoryId: 4, amount: "65000", expenseDate: new Date("2025-05-12"), description: "Plantas y fertilizantes", supplier: "Vivero especializado" },
      { categoryId: 8, amount: "28000", expenseDate: new Date("2025-05-18"), description: "Seguros y pólizas", supplier: "Aseguradora" },
    ];

    // Insertar ingresos
    for (const income of sampleIncomes) {
      await db.insert(actualIncomes).values({
        code: `ING${Date.now()}${Math.floor(Math.random() * 1000)}`,
        categoryId: income.categoryId,
        description: income.description,
        source: income.source,
        amount: income.amount,
        currency: "MXN",
        incomeDate: income.incomeDate,
        paymentMethod: "transferencia",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insertar egresos
    for (const expense of sampleExpenses) {
      await db.insert(actualExpenses).values({
        code: `EGR${Date.now()}${Math.floor(Math.random() * 1000)}`,
        categoryId: expense.categoryId,
        description: expense.description,
        supplier: expense.supplier,
        amount: expense.amount,
        currency: "MXN",
        expenseDate: expense.expenseDate,
        paymentMethod: "transferencia",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log("Datos financieros de muestra agregados exitosamente");
    console.log(`- ${sampleIncomes.length} registros de ingresos`);
    console.log(`- ${sampleExpenses.length} registros de egresos`);

  } catch (error) {
    console.error("Error al agregar datos financieros de muestra:", error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addSampleFinancialData().then(() => {
    console.log("Script completado");
    process.exit(0);
  }).catch((error) => {
    console.error("Error en el script:", error);
    process.exit(1);
  });
}