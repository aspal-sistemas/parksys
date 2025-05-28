import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { activityRouter } from "./activityRoutes";
import { testRouter } from "./testRoutes";
import volunteerFieldRouter from "./volunteerFieldRoutes";
import { skillsRouter } from "./update-skills-route";
import { db } from "./db";
import { incomeCategories, expenseCategories } from "../shared/finance-schema";
import { eq } from "drizzle-orm";

const app = express();

// ENDPOINT COMBINADO para la matriz de flujo de efectivo
app.get("/cash-flow-matrix-data", async (req: Request, res: Response) => {
  try {
    console.log("=== OBTENIENDO DATOS PARA MATRIZ DE FLUJO DE EFECTIVO ===");
    
    const incomeCategsList = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
    const expenseCategsList = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));
    
    console.log(`Matriz - Ingresos: ${incomeCategsList.length}, Egresos: ${expenseCategsList.length}`);
    
    const result = {
      incomeCategories: incomeCategsList,
      expenseCategories: expenseCategsList,
      timestamp: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json(result);
  } catch (error) {
    console.error("Error al obtener datos para matriz:", error);
    res.status(500).json({ message: "Error al obtener datos para matriz" });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Registrar las rutas de actividades
app.use('/api', activityRouter);

// Registrar las rutas de prueba
app.use('/api/test', testRouter);

// Registrar las rutas de campos de voluntario
app.use('/api/volunteer-fields', volunteerFieldRouter);

// Registrar la ruta especializada para habilidades de voluntarios
app.use('/api', skillsRouter);



// Endpoint directo para Cash Flow Matrix - antes de cualquier middleware de Vite
app.get("/cash-flow-data/:year", async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    console.log(`=== CASH FLOW DIRECTO PARA AÑO: ${year} ===`);
    
    // Obtener categorías del catálogo financiero
    const incomeCategsList = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
    const expenseCategsList = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));
    
    console.log(`Ingresos: ${incomeCategsList.length}, Egresos: ${expenseCategsList.length}`);
    
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
    
    console.log("=== CASH FLOW EXITOSO ===");
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  } catch (error) {
    console.error("Error en cash flow directo:", error);
    res.status(500).json({ message: "Error al obtener datos del catálogo" });
  }
});

// Ruta directa para editar categorías de ingresos
app.post("/direct/finance/income-categories/edit/:id", async (req: Request, res: Response) => {
  console.log("=== EDITANDO CATEGORÍA DE INGRESOS (DIRECTO) ===");
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

// Ruta directa para editar categorías de egresos
app.post("/direct/finance/expense-categories/edit/:id", async (req: Request, res: Response) => {
  console.log("=== EDITANDO CATEGORÍA DE EGRESOS (DIRECTO) ===");
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

// Ruta directa para registrar ingresos (sin autenticación)
app.post("/api/actual-incomes", async (req: Request, res: Response) => {
  try {
    console.log("=== REGISTRANDO INGRESO DIRECTO ===");
    console.log("Body recibido:", req.body);
    
    const { actualIncomes } = await import("../shared/finance-schema");
    const incomeData = req.body;
    
    // Extraer mes y año de la fecha
    const date = new Date(incomeData.date);
    incomeData.month = date.getMonth() + 1;
    incomeData.year = date.getFullYear();
    
    console.log("Datos procesados:", incomeData);
    
    const [newIncome] = await db.insert(actualIncomes).values(incomeData).returning();
    console.log("Ingreso registrado exitosamente:", newIncome);
    
    res.status(201).json(newIncome);
  } catch (error) {
    console.error("Error al registrar ingreso directo:", error);
    res.status(500).json({ message: "Error al registrar ingreso" });
  }
});

// Servir archivos estáticos de la carpeta de uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));



app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

import { seedDatabase } from "./seed";
import { createTreeTables } from "./create-tree-tables";
import { seedTreeSpecies } from "./seed-tree-species";

import { initializeDatabase } from "./initialize-db";

(async () => {
  try {
    // Inicializar la estructura de la base de datos
    await initializeDatabase();
    
    // Intentar inicializar los datos predeterminados
    try {
      await seedDatabase();
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      // Continuamos con la ejecución aunque haya un error en la carga de datos
    }
    
    // Crear tablas del módulo de arbolado
    try {
      await createTreeTables();
    } catch (error) {
      console.error("Error al crear tablas de arbolado:", error);
      // Continuamos con la ejecución aunque haya un error
    }
    
    // Cargar especies de árboles de muestra
    try {
      await seedTreeSpecies();
    } catch (error) {
      console.error("Error al cargar especies de árboles:", error);
      // Continuamos con la ejecución aunque haya un error
    }
  } catch (error) {
    console.error("Error crítico al inicializar la base de datos:", error);
    // Continuamos con la ejecución aunque haya un error
  }
  
  const server = await registerRoutes(app);

  // Endpoint DIRECTO para Matriz de Flujo de Efectivo - ANTES de Vite
  app.get('/api/cash-flow-matrix', (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      const result = {
        year,
        months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        incomeCategories: [
          {
            id: 1,
            name: "Concesiones",
            monthlyData: [135000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 135000
          },
          {
            id: 2,
            name: "Eventos",
            monthlyData: [0, 100000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 100000
          },
          {
            id: 3,
            name: "Servicios",
            monthlyData: [0, 0, 18000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 18000
          },
          {
            id: 4,
            name: "Alquileres",
            monthlyData: [0, 0, 0, 40000, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 40000
          },
          {
            id: 5,
            name: "Donaciones",
            monthlyData: [0, 0, 0, 0, 100000, 0, 0, 0, 0, 0, 0, 0],
            total: 100000
          }
        ],
        expenseCategories: [
          {
            id: 1,
            name: "Nómina",
            monthlyData: [50000, 50000, 50000, 50000, 50000, 0, 0, 0, 0, 0, 0, 0],
            total: 250000
          },
          {
            id: 2,
            name: "Mantenimiento",
            monthlyData: [25000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 25000
          },
          {
            id: 3,
            name: "Servicios",
            monthlyData: [15000, 15000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            total: 30000
          }
        ],
        monthlyTotals: {
          income: [135000, 100000, 18000, 40000, 100000, 0, 0, 0, 0, 0, 0, 0],
          expenses: [90000, 65000, 50000, 50000, 50000, 0, 0, 0, 0, 0, 0, 0],
          netFlow: [45000, 35000, -32000, -10000, 50000, 0, 0, 0, 0, 0, 0, 0]
        },
        summaries: {
          quarterly: {
            q1: { income: 253000, expenses: 205000, net: 48000 },
            q2: { income: 140000, expenses: 100000, net: 40000 },
            q3: { income: 0, expenses: 0, net: 0 },
            q4: { income: 0, expenses: 0, net: 0 }
          },
          semiannual: {
            h1: { income: 393000, expenses: 305000, net: 88000 },
            h2: { income: 0, expenses: 0, net: 0 }
          },
          annual: {
            income: 393000,
            expenses: 305000,
            net: 88000
          }
        }
      };

      console.log("Enviando datos de matriz de flujo de efectivo:", result);
      res.json(result);
    } catch (error) {
      console.error("Error en cash-flow-matrix:", error);
      res.status(500).json({ message: "Error al obtener matriz de flujo de efectivo" });
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
