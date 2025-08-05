import { db } from "./db";
import {
  incomeCategories,
  incomeSubcategories,
  expenseCategories,
  expenseSubcategories,
  budgets,
  budgetIncomeLines,
  budgetExpenseLines,
  actualIncomes,
  actualExpenses,
  cashFlowProjections,
} from "../shared/finance-schema";

/**
 * Script para crear las tablas del módulo financiero y poblarlas con las categorías iniciales
 */
export async function createFinanceTables() {
  try {
    console.log("Creando tablas del módulo financiero...");

    // Las tablas se crean automáticamente con Drizzle
    console.log("Verificando estructura de tablas...");

    // Verificar si ya existen categorías de ingresos
    const existingIncomeCategories = await db.select().from(incomeCategories);
    
    if (existingIncomeCategories.length === 0) {
      console.log("Creando categorías de ingresos iniciales...");
      
      // Crear categorías principales de ingresos
      const [activitiesCategory] = await db.insert(incomeCategories).values({
        name: "Actividades",
        description: "Ingresos por actividades recreativas, deportivas y culturales",
      }).returning();

      const [concessionsCategory] = await db.insert(incomeCategories).values({
        name: "Concesiones",
        description: "Ingresos por concesiones otorgadas en el parque",
      }).returning();

      const [sponsorshipsCategory] = await db.insert(incomeCategories).values({
        name: "Patrocinios",
        description: "Ingresos por patrocinios y colaboraciones empresariales",
      }).returning();

      const [donationsCategory] = await db.insert(incomeCategories).values({
        name: "Donativos",
        description: "Donaciones y contribuciones voluntarias",
      }).returning();

      const [parkingCategory] = await db.insert(incomeCategories).values({
        name: "Estacionamientos",
        description: "Ingresos por servicios de estacionamiento",
      }).returning();

      // Crear subcategorías de concesiones
      await db.insert(incomeSubcategories).values([
        {
          categoryId: concessionsCategory.id,
          name: "Alimentos",
          description: "Concesiones de alimentos y bebidas",
        },
        {
          categoryId: concessionsCategory.id,
          name: "Recreativas",
          description: "Concesiones de actividades recreativas",
        },
        {
          categoryId: concessionsCategory.id,
          name: "Rentas",
          description: "Rentas de espacios y equipamiento",
        },
      ]);

      console.log("Categorías de ingresos creadas exitosamente.");
    } else {
      console.log("Las categorías de ingresos ya existen.");
    }

    // Verificar si ya existen categorías de egresos
    const existingExpenseCategories = await db.select().from(expenseCategories);
    
    if (existingExpenseCategories.length === 0) {
      console.log("Creando categorías de egresos iniciales...");
      
      // Crear categorías principales de egresos
      const [personnelCategory] = await db.insert(expenseCategories).values({
        name: "Personal y Nómina",
        description: "Gastos de personal, sueldos, prestaciones y nómina",
      }).returning();

      const [maintenanceCategory] = await db.insert(expenseCategories).values({
        name: "Mantenimiento y Servicios",
        description: "Gastos de mantenimiento, limpieza y servicios generales",
      }).returning();

      const [securityCategory] = await db.insert(expenseCategories).values({
        name: "Seguridad",
        description: "Gastos de seguridad y vigilancia del parque",
      }).returning();

      const [operationalCategory] = await db.insert(expenseCategories).values({
        name: "Gastos Operativos",
        description: "Gastos operativos generales y administrativos",
      }).returning();

      // Crear subcategorías de personal y nómina
      await db.insert(expenseSubcategories).values([
        {
          categoryId: personnelCategory.id,
          name: "Sueldos Base",
          description: "Sueldos base del personal",
        },
        {
          categoryId: personnelCategory.id,
          name: "Prestaciones",
          description: "Prestaciones y beneficios laborales",
        },
        {
          categoryId: personnelCategory.id,
          name: "Horas Extra",
          description: "Pagos por tiempo extra",
        },
        {
          categoryId: personnelCategory.id,
          name: "Capacitación",
          description: "Gastos de capacitación y desarrollo",
        },
      ]);

      // Crear subcategorías de mantenimiento
      await db.insert(expenseSubcategories).values([
        {
          categoryId: maintenanceCategory.id,
          name: "Jardinería",
          description: "Mantenimiento de áreas verdes y jardinería",
        },
        {
          categoryId: maintenanceCategory.id,
          name: "Instalaciones",
          description: "Mantenimiento de instalaciones y edificios",
        },
        {
          categoryId: maintenanceCategory.id,
          name: "Equipamiento",
          description: "Mantenimiento de equipos y mobiliario",
        },
        {
          categoryId: maintenanceCategory.id,
          name: "Limpieza",
          description: "Servicios de limpieza y sanitización",
        },
      ]);

      // Crear subcategorías de seguridad
      await db.insert(expenseSubcategories).values([
        {
          categoryId: securityCategory.id,
          name: "Personal de Seguridad",
          description: "Personal y servicios de seguridad",
        },
        {
          categoryId: securityCategory.id,
          name: "Sistemas de Seguridad",
          description: "Sistemas de videovigilancia y alarmas",
        },
        {
          categoryId: securityCategory.id,
          name: "Iluminación",
          description: "Iluminación de seguridad y áreas comunes",
        },
      ]);

      // Crear subcategorías de gastos operativos
      await db.insert(expenseSubcategories).values([
        {
          categoryId: operationalCategory.id,
          name: "Servicios Públicos",
          description: "Agua, luz, gas y telecomunicaciones",
        },
        {
          categoryId: operationalCategory.id,
          name: "Materiales y Suministros",
          description: "Materiales de oficina y operación",
        },
        {
          categoryId: operationalCategory.id,
          name: "Seguros",
          description: "Pólizas de seguro y cobertura",
        },
        {
          categoryId: operationalCategory.id,
          name: "Gastos Administrativos",
          description: "Gastos administrativos y de gestión",
        },
      ]);

      console.log("Categorías de egresos creadas exitosamente.");
    } else {
      console.log("Las categorías de egresos ya existen.");
    }

    console.log("Módulo financiero configurado correctamente.");
    return {
      success: true,
      message: "Tablas del módulo financiero creadas y configuradas exitosamente.",
    };

  } catch (error) {
    console.error("Error al crear las tablas del módulo financiero:", error);
    return {
      success: false,
      message: "Error al configurar el módulo financiero.",
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  createFinanceTables()
    .then((result) => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Error fatal:", error);
      process.exit(1);
    });
}