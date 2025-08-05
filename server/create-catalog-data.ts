import { db } from "./db";
import { 
  incomeCategories, 
  incomeSubcategories, 
  expenseCategories, 
  expenseSubcategories 
} from "../shared/finance-schema";

/**
 * Script para crear el catálogo completo de ingresos y egresos
 * con estructura jerárquica y códigos contables
 */
export async function createCompleteCatalog() {
  try {
    console.log("Iniciando creación del catálogo de ingresos y egresos...");

    // Crear categorías principales de INGRESOS
    const incomeData = [
      // NIVEL 1 - Categorías principales
      {
        code: "4000",
        name: "INGRESOS OPERATIVOS",
        description: "Ingresos generados por las operaciones principales del parque",
        level: 1,
        parentId: null,
        accountingCode: "4000",
        sortOrder: 1
      },
      {
        code: "4100",
        name: "INGRESOS NO OPERATIVOS",
        description: "Ingresos extraordinarios y financieros",
        level: 1,
        parentId: null,
        accountingCode: "4100",
        sortOrder: 2
      },
      
      // NIVEL 2 - Subcategorías de Ingresos Operativos
      {
        code: "4010",
        name: "Actividades y Eventos",
        description: "Ingresos por actividades deportivas, culturales y eventos especiales",
        level: 2,
        parentId: 1, // Se actualizará con el ID real
        accountingCode: "4010",
        sortOrder: 11
      },
      {
        code: "4020",
        name: "Concesiones",
        description: "Ingresos por concesiones de alimentos, recreación y servicios",
        level: 2,
        parentId: 1,
        accountingCode: "4020",
        sortOrder: 12
      },
      {
        code: "4030",
        name: "Servicios Municipales",
        description: "Servicios prestados por el municipio en el parque",
        level: 2,
        parentId: 1,
        accountingCode: "4030",
        sortOrder: 13
      },
      {
        code: "4040",
        name: "Patrocinios y Alianzas",
        description: "Ingresos por patrocinios corporativos y alianzas estratégicas",
        level: 2,
        parentId: 1,
        accountingCode: "4040",
        sortOrder: 14
      },
      
      // NIVEL 2 - Subcategorías de Ingresos No Operativos
      {
        code: "4110",
        name: "Donativos",
        description: "Donaciones de empresas, fundaciones y particulares",
        level: 2,
        parentId: 2,
        accountingCode: "4110",
        sortOrder: 21
      },
      {
        code: "4120",
        name: "Subsidios Gubernamentales",
        description: "Transferencias y subsidios del gobierno",
        level: 2,
        parentId: 2,
        accountingCode: "4120",
        sortOrder: 22
      }
    ];

    // Insertar categorías de ingresos
    const insertedIncomeCategories = await db.insert(incomeCategories)
      .values(incomeData)
      .returning()
      .onConflictDoNothing();

    console.log(`Insertadas ${insertedIncomeCategories.length} categorías de ingresos`);

    // Crear subcategorías específicas de ingresos
    const incomeSubcatData = [
      // Actividades y Eventos (4010)
      { categoryId: 3, name: "Clases Deportivas", description: "Yoga, aeróbicos, futbol, etc." },
      { categoryId: 3, name: "Eventos Culturales", description: "Conciertos, obras de teatro, festivales" },
      { categoryId: 3, name: "Actividades Educativas", description: "Talleres ambientales, cursos de jardinería" },
      { categoryId: 3, name: "Eventos Privados", description: "Bodas, quinceañeras, eventos corporativos" },
      
      // Concesiones (4020)
      { categoryId: 4, name: "Alimentos y Bebidas", description: "Restaurantes, cafeterías, puestos de comida" },
      { categoryId: 4, name: "Recreación", description: "Juegos mecánicos, deportes extremos, renta de bicicletas" },
      { categoryId: 4, name: "Estacionamiento", description: "Tarifas de estacionamiento por hora/día" },
      { categoryId: 4, name: "Comercio", description: "Tiendas de souvenirs, artesanías" },
      
      // Servicios Municipales (4030)
      { categoryId: 5, name: "Permisos y Licencias", description: "Permisos para eventos, fotografía comercial" },
      { categoryId: 5, name: "Servicios Especiales", description: "Limpieza, seguridad adicional, mantenimiento" },
      { categoryId: 5, name: "Multas", description: "Multas por infracciones en el parque" },
      
      // Patrocinios (4040)
      { categoryId: 6, name: "Patrocinio Corporativo", description: "Patrocinios de empresas locales y nacionales" },
      { categoryId: 6, name: "Naming Rights", description: "Derechos de nombre de espacios del parque" },
      { categoryId: 6, name: "Publicidad", description: "Espacios publicitarios y promocionales" },
      
      // Donativos (4110)
      { categoryId: 7, name: "Donaciones en Efectivo", description: "Donaciones monetarias de particulares" },
      { categoryId: 7, name: "Donaciones en Especie", description: "Equipos, plantas, materiales donados" },
      
      // Subsidios (4120)
      { categoryId: 8, name: "Subsidio Federal", description: "Transferencias del gobierno federal" },
      { categoryId: 8, name: "Subsidio Estatal", description: "Transferencias del gobierno estatal" },
      { categoryId: 8, name: "Subsidio Municipal", description: "Transferencias del gobierno municipal" }
    ];

    const insertedIncomeSubcategories = await db.insert(incomeSubcategories)
      .values(incomeSubcatData)
      .returning()
      .onConflictDoNothing();

    console.log(`Insertadas ${insertedIncomeSubcategories.length} subcategorías de ingresos`);

    // Crear categorías principales de EGRESOS
    const expenseData = [
      // NIVEL 1 - Categorías principales
      {
        code: "5000",
        name: "GASTOS OPERATIVOS",
        description: "Gastos necesarios para la operación diaria del parque",
        level: 1,
        parentId: null,
        accountingCode: "5000",
        sortOrder: 1
      },
      {
        code: "6000",
        name: "GASTOS DE CAPITAL",
        description: "Inversiones en infraestructura y equipamiento",
        level: 1,
        parentId: null,
        accountingCode: "6000",
        sortOrder: 2
      },
      
      // NIVEL 2 - Subcategorías de Gastos Operativos
      {
        code: "5010",
        name: "Personal y Nómina",
        description: "Sueldos, salarios y prestaciones del personal",
        level: 2,
        parentId: 1,
        accountingCode: "5010",
        sortOrder: 11
      },
      {
        code: "5020",
        name: "Mantenimiento y Servicios",
        description: "Mantenimiento de instalaciones y servicios básicos",
        level: 2,
        parentId: 1,
        accountingCode: "5020",
        sortOrder: 12
      },
      {
        code: "5030",
        name: "Seguridad",
        description: "Servicios de seguridad y vigilancia",
        level: 2,
        parentId: 1,
        accountingCode: "5030",
        sortOrder: 13
      },
      {
        code: "5040",
        name: "Gastos Administrativos",
        description: "Gastos de oficina, comunicaciones y administración",
        level: 2,
        parentId: 1,
        accountingCode: "5040",
        sortOrder: 14
      },
      
      // NIVEL 2 - Subcategorías de Gastos de Capital
      {
        code: "6010",
        name: "Infraestructura",
        description: "Construcción y mejoras de infraestructura",
        level: 2,
        parentId: 2,
        accountingCode: "6010",
        sortOrder: 21
      },
      {
        code: "6020",
        name: "Equipamiento",
        description: "Compra de equipos y mobiliario",
        level: 2,
        parentId: 2,
        accountingCode: "6020",
        sortOrder: 22
      }
    ];

    // Insertar categorías de egresos
    const insertedExpenseCategories = await db.insert(expenseCategories)
      .values(expenseData)
      .returning()
      .onConflictDoNothing();

    console.log(`Insertadas ${insertedExpenseCategories.length} categorías de egresos`);

    // Crear subcategorías específicas de egresos
    const expenseSubcatData = [
      // Personal y Nómina (5010)
      { categoryId: 3, name: "Sueldos Base", description: "Sueldos base del personal administrativo" },
      { categoryId: 3, name: "Prestaciones", description: "IMSS, INFONAVIT, aguinaldo, vacaciones" },
      { categoryId: 3, name: "Horas Extra", description: "Pagos por tiempo extra trabajado" },
      { categoryId: 3, name: "Capacitación", description: "Cursos y entrenamiento del personal" },
      
      // Mantenimiento (5020)
      { categoryId: 4, name: "Jardinería", description: "Mantenimiento de áreas verdes y jardines" },
      { categoryId: 4, name: "Limpieza", description: "Servicios de limpieza y recolección de basura" },
      { categoryId: 4, name: "Servicios Públicos", description: "Agua, luz, gas, internet" },
      { categoryId: 4, name: "Reparaciones", description: "Reparación de instalaciones y equipos" },
      
      // Seguridad (5030)
      { categoryId: 5, name: "Vigilancia", description: "Servicios de vigilancia y guardias" },
      { categoryId: 5, name: "Sistemas de Seguridad", description: "Cámaras, alarmas, controles de acceso" },
      { categoryId: 5, name: "Seguros", description: "Pólizas de seguro para instalaciones" },
      
      // Gastos Administrativos (5040)
      { categoryId: 6, name: "Material de Oficina", description: "Papelería, suministros de oficina" },
      { categoryId: 6, name: "Comunicaciones", description: "Teléfono, internet, correo" },
      { categoryId: 6, name: "Gastos Legales", description: "Servicios jurídicos y trámites" },
      { categoryId: 6, name: "Marketing", description: "Publicidad y promoción del parque" },
      
      // Infraestructura (6010)
      { categoryId: 7, name: "Obras Civiles", description: "Construcción de senderos, bancas, estructuras" },
      { categoryId: 7, name: "Instalaciones Deportivas", description: "Canchas, gimnasios al aire libre" },
      { categoryId: 7, name: "Áreas Recreativas", description: "Juegos infantiles, áreas de picnic" },
      
      // Equipamiento (6020)
      { categoryId: 8, name: "Herramientas", description: "Herramientas de jardinería y mantenimiento" },
      { categoryId: 8, name: "Mobiliario", description: "Bancas, mesas, basureros" },
      { categoryId: 8, name: "Tecnología", description: "Computadoras, software, equipos audiovisuales" }
    ];

    const insertedExpenseSubcategories = await db.insert(expenseSubcategories)
      .values(expenseSubcatData)
      .returning()
      .onConflictDoNothing();

    console.log(`Insertadas ${insertedExpenseSubcategories.length} subcategorías de egresos`);

    console.log("✅ Catálogo completo de ingresos y egresos creado exitosamente");
    
    return {
      incomeCategories: insertedIncomeCategories.length,
      incomeSubcategories: insertedIncomeSubcategories.length,
      expenseCategories: insertedExpenseCategories.length,
      expenseSubcategories: insertedExpenseSubcategories.length
    };

  } catch (error) {
    console.error("Error al crear el catálogo:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createCompleteCatalog()
    .then((result) => {
      console.log("Catálogo creado:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}