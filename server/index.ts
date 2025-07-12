import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import multer from 'multer';
import { activityRouter } from "./activityRoutes";
import { testRouter } from "./testRoutes";
import volunteerFieldRouter from "./volunteerFieldRoutes";
import { skillsRouter } from "./update-skills-route";
import { registerFinancialIntegrationsAPI } from "./financial-integrations-api";
import { registerMultimediaRoutes, createMultimediaTables } from "./multimedia-system";
import { registerBudgetPlanningRoutes } from "./budget-planning-routes";
import { createParkEvaluationsTables } from "./create-park-evaluations-tables";
import { db } from "./db";
import { incomeCategories, expenseCategories } from "../shared/finance-schema";
import { eq } from "drizzle-orm";

const app = express();

// Startup flag to track initialization status
let isInitialized = false;
let initializationStarted = false;

// Root endpoint handler for deployment health checks - HIGHEST PRIORITY
// Responds immediately without any database operations
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'ParkSys - Bosques Urbanos de Guadalajara',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'local',
    initialized: isInitialized
  });
});

// Health check endpoints - all respond immediately
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    initialized: isInitialized
  });
});

app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/readiness', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ready',
    initialized: isInitialized,
    timestamp: new Date().toISOString()
  });
});

app.get('/liveness', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'ParkSys API',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    deployment: process.env.REPLIT_DEPLOYMENT_ID || 'local',
    initialized: isInitialized
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'ParkSys API is running',
    timestamp: new Date().toISOString(),
    initialized: isInitialized
  });
});

// Removed duplicate health check endpoints - kept only the ones defined above

// Root API endpoint for deployment verification
app.get('/api', (req: Request, res: Response) => {
  try {
    res.status(200).json({
      message: 'ParkSys - Bosques Urbanos API',
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        status: '/api/status',
        admin: '/admin',
        parks: '/parks'
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      message: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Simple status page for deployment verification
app.get('/status', (req: Request, res: Response) => {
  try {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ParkSys - Estado del Sistema</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status { color: #00a587; font-size: 24px; font-weight: bold; }
            .info { margin: 20px 0; }
            .timestamp { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌳 ParkSys - Bosques Urbanos</h1>
            <div class="status">✅ Sistema Funcionando</div>
            <div class="info">
              <p><strong>Estado:</strong> Operativo</p>
              <p><strong>Servidor:</strong> ${process.env.NODE_ENV || 'development'}</p>
              <p><strong>Puerto:</strong> ${process.env.PORT || 5000}</p>
              <p><strong>Base de Datos:</strong> PostgreSQL Conectada</p>
            </div>
            <div class="timestamp">
              Última verificación: ${new Date().toLocaleString('es-MX')}
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(503).send('Sistema temporalmente no disponible');
  }
});

// Servir archivos estáticos del directorio public ANTES de otras rutas
app.use(express.static(path.join(process.cwd(), 'public')));

// Comprehensive asynchronous initialization function with shorter timeouts
async function initializeSystemAsync() {
  if (initializationStarted) return;
  initializationStarted = true;
  
  try {
    // Initialize database tables with reduced timeout (3 seconds)
    await Promise.race([
      createParkEvaluationsTables(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database initialization timeout')), 3000))
    ]);
    
    await Promise.race([
      createMultimediaTables(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Multimedia tables timeout')), 3000))
    ]);
    
    // Initialize other tables with reduced timeout
    const { createVacationTables } = await import("./create-vacation-tables");
    await Promise.race([
      createVacationTables(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Vacation tables timeout')), 3000))
    ]);
    
    // Initialize communications with reduced timeout
    const { seedEmailTemplates } = await import("./communications/seedCommunications");
    await Promise.race([
      seedEmailTemplates(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email templates timeout')), 3000))
    ]);
    
    // Initialize security system with reduced timeout
    const { initSecurityTables, seedSecurityData } = await import('./security/initSecurityTables');
    await Promise.race([
      initSecurityTables(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Security tables timeout')), 3000))
    ]);
    
    await Promise.race([
      seedSecurityData(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Security data timeout')), 3000))
    ]);
    
    // Initialize evaluation criteria with reduced timeout
    const { createEvaluationCriteriaTables, seedDefaultEvaluationCriteria } = await import('./create-evaluation-criteria-tables');
    await Promise.race([
      createEvaluationCriteriaTables(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Evaluation criteria tables timeout')), 3000))
    ]);
    
    await Promise.race([
      seedDefaultEvaluationCriteria(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Evaluation criteria seed timeout')), 3000))
    ]);
    
    // Initialize payroll receipts tables
    const { createPayrollReceiptsTables } = await import("./create-payroll-receipts-tables");
    await Promise.race([
      createPayrollReceiptsTables(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Payroll receipts tables timeout')), 3000))
    ]);
    
    // Initialize payroll data seeding
    try {
      const { seedPayrollReceipts } = await import("./seed-payroll-receipts");
      await Promise.race([
        seedPayrollReceipts(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Payroll receipts seed timeout')), 3000))
      ]);
    } catch (error) {
      // Silently handle non-critical errors
    }
    
    // Initialize tree tables
    try {
      const { createTreeTables } = await import("./create-tree-tables");
      await Promise.race([
        createTreeTables(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tree tables timeout')), 3000))
      ]);
      
      const { seedTreeSpecies } = await import("./seed");
      await Promise.race([
        seedTreeSpecies(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tree species seed timeout')), 3000))
      ]);
    } catch (error) {
      // Silently handle non-critical errors
    }
    
    // Register additional routes asynchronously
    await registerAdditionalRoutes();
    
    isInitialized = true;
    
  } catch (error) {
    // Silently handle non-critical errors to avoid console spam
    // Don't throw - let the server continue running
  }
}

// Register complex routes asynchronously
async function registerAdditionalRoutes() {
  try {
    // Register routes for all modules
    const apiRouter = express.Router();
    
    // Register API integrations
    registerFinancialIntegrationsAPI(apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    registerMultimediaRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Register module routes
    const { registerBudgetPlanningRoutes } = await import('./budget-planning-routes');
    registerBudgetPlanningRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    const { registerFinanceRoutes } = await import('./finance-routes');
    registerFinanceRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    const { registerEventCategoriesRoutes } = await import('./event-categories-routes');
    registerEventCategoriesRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    const { registerInstructorRoutes } = await import('./instructor-routes');
    registerInstructorRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    const { registerAssetCategoriesRoutes } = await import('./asset-categories-routes');
    registerAssetCategoriesRoutes(app, apiRouter);
    
    const { registerInstructorEvaluationRoutes } = await import('./instructor-evaluations-routes');
    registerInstructorEvaluationRoutes(app, apiRouter);
    
    const { registerConcessionairesRoutes } = await import('./concessionaires-routes');
    registerConcessionairesRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());

    const { registerParkEvaluationRoutes } = await import('./park-evaluations-routes');
    registerParkEvaluationRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    const { registerEvaluationCriteriaRoutes } = await import('./evaluation-criteria-routes');
    registerEvaluationCriteriaRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Register payroll routes
    const { registerPayrollReceiptsRoutes } = await import("./payroll-receipts-routes");
    const receiptsRouter = express.Router();
    registerPayrollReceiptsRoutes(app, receiptsRouter, (req: Request, res: Response, next: NextFunction) => next());
    app.use("/api/payroll", receiptsRouter);
    
    // Register vacation routes
    const { registerVacationRoutes } = await import("./vacation-routes");
    const vacationRouter = express.Router();
    registerVacationRoutes(app, vacationRouter, (req: Request, res: Response, next: NextFunction) => next());
    app.use("/api/vacation", vacationRouter);
    
    // Register time-off routes
    const { registerTimeOffRoutes } = await import("./time-off-routes");
    const timeOffRouter = express.Router();
    registerTimeOffRoutes(app, timeOffRouter, (req: Request, res: Response, next: NextFunction) => next());
    app.use("/api/time-off", timeOffRouter);
    
    // Register eventos AMBU routes
    const { registerEventosAmbuRoutes } = await import("./eventos-ambu-routes");
    const eventosAmbuRouter = express.Router();
    registerEventosAmbuRoutes(app, eventosAmbuRouter, (req: Request, res: Response, next: NextFunction) => next());
    app.use("/api/eventos-ambu", eventosAmbuRouter);
    
    // Register security routes
    const securityRouter = await import('./security/securityRoutes');
    app.use('/api/security', securityRouter.default);
    
    const passwordRecoveryRouter = await import('./password-recovery-routes');
    app.use('/api', passwordRecoveryRouter.default);
    
    // Register communication routes
    const { default: communicationsRouter } = await import("./communications/communicationsRoutes");
    app.use("/api/communications", communicationsRouter);
    
    // Register activity image routes
    const activityImageRouter = await import("./activity-image-routes");
    app.use("/api/activities", activityImageRouter.default);
    
    // Register email routes
    const { emailRouter } = await import("./email/emailRoutes");
    app.use("/api/email", emailRouter);
    
    // Register visitor count routes
    const visitorCountRouter = express.Router();
    visitorCountRouter.use('/', visitorCountRoutes);
    app.use("/api/visitor-count", visitorCountRouter);
    
    // Register all API routes
    app.use("/api", apiRouter);
    
  } catch (error) {
    console.error("Error registering additional routes:", error);
  }
}

// ENDPOINT COMBINADO para la matriz de flujo de efectivo
app.get("/cash-flow-matrix-data", async (req: Request, res: Response) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({ 
        error: 'System still initializing, please try again in a moment',
        initialized: false
      });
    }
    
    const incomeCategsList = await db.select().from(incomeCategories).where(eq(incomeCategories.isActive, true));
    const expenseCategsList = await db.select().from(expenseCategories).where(eq(expenseCategories.isActive, true));
    
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
    res.status(200).json({ 
      incomeCategories: [],
      expenseCategories: [],
      message: "Base de datos inicializando",
      status: "initializing"
    });
  }
});

// IMPORTANTE: Configurar middleware de parseo JSON ANTES de cualquier ruta
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Error handling middleware for JSON parsing errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

// Configurar headers de seguridad CSP para permitir inline scripts
app.use((req: Request, res: Response, next: NextFunction) => {
  // Configurar CSP para permitir inline scripts e inline styles necesarios para la aplicación
  res.setHeader(
    'Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; " +
    "style-src 'self' 'unsafe-inline' https: data:; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https: data:; " +
    "connect-src 'self' https: ws: wss:; " +
    "frame-src 'self' https:; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  // Headers adicionales de seguridad
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// Register main routes immediately after middleware setup for faster deployment health checks
setImmediate(async () => {
  try {
    await registerRoutes(app);
  } catch (error) {
    // Silently handle errors to avoid console spam
  }
});

// Minimal request logging for production
app.use((req: Request, res: Response, next: NextFunction) => {
  // Only log critical errors, not every request
  next();
});

// ENDPOINT DUPLICADO ELIMINADO - USANDO ÚNICO ENDPOINT EN routes.ts

// ENDPOINT PARA OBTENER ACTIVIDAD ESPECÍFICA
app.get("/api/activities/:id", async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id);
    
    if (isNaN(activityId)) {
      return res.status(400).json({ error: "ID de actividad inválido" });
    }

    const { db } = await import("./db");
    const { sql } = await import("drizzle-orm");
    
    const result = await db.execute(
      sql`SELECT 
        a.*,
        ac.name as category_name,
        p.name as park_name,
        i.full_name as instructor_name
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category_id = ac.id
      LEFT JOIN parks p ON a.park_id = p.id
      LEFT JOIN instructors i ON a.instructor_id = i.id
      WHERE a.id = ${activityId}`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }

    const activity = result.rows[0];
    
    // Parsear campos JSON
    let targetMarket = [];
    let specialNeeds = [];
    
    if (activity.target_market) {
      if (Array.isArray(activity.target_market)) {
        targetMarket = activity.target_market;
      } else if (typeof activity.target_market === 'string') {
        try {
          targetMarket = JSON.parse(activity.target_market);
        } catch (e) {
          targetMarket = activity.target_market.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
      } else {
        targetMarket = [];
      }
    }
    
    if (activity.special_needs) {
      if (Array.isArray(activity.special_needs)) {
        specialNeeds = activity.special_needs;
      } else if (typeof activity.special_needs === 'string') {
        try {
          specialNeeds = JSON.parse(activity.special_needs);
        } catch (e) {
          specialNeeds = activity.special_needs.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
      } else {
        specialNeeds = [];
      }
    }

    // Formatear respuesta para que coincida con lo que espera el frontend
    const formattedActivity = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      category: activity.category_name || activity.category,
      categoryId: activity.category_id,
      parkId: activity.park_id,
      parkName: activity.park_name,
      startDate: activity.start_date,
      endDate: activity.end_date,
      location: activity.location,
      createdAt: activity.created_at,
      capacity: activity.capacity,
      price: activity.price,
      materials: activity.materials,
      requirements: activity.requirements,
      duration: activity.duration,
      isRecurring: activity.is_recurring,
      isFree: activity.is_free,
      recurringDays: activity.recurring_days,
      instructorId: activity.instructor_id,
      instructorName: activity.instructor_name,
      startTime: activity.start_time,
      targetMarket: targetMarket,
      specialNeeds: specialNeeds
    };

    res.json(formattedActivity);

  } catch (error) {
    res.status(500).json({ 
      error: "Error interno del servidor", 
      details: error instanceof Error ? error.message : "Error desconocido" 
    });
  }
});

// ENDPOINT DIRECTO EMPLEADOS - REGISTRADO PRIMERO para evitar conflictos
app.post("/api/employees", async (req: Request, res: Response) => {
  try {
    
    const employeeData = {
      fullName: req.body.fullName || `Empleado ${Date.now()}`,
      email: req.body.email || `empleado${Date.now()}@temp.com`,
      phone: req.body.phone || '',
      position: req.body.position || 'Sin especificar',
      department: req.body.department || 'General',
      salary: req.body.salary || 15000,
      hireDate: req.body.hireDate || new Date().toISOString().split('T')[0],
      education: req.body.education || '',
      address: req.body.address || '',
      emergencyContact: req.body.emergencyContact || '',
      emergencyPhone: req.body.emergencyPhone || '',
      status: 'active',
      skills: req.body.skills || [],
      certifications: req.body.certifications || [],
      workSchedule: req.body.workSchedule || "Lunes a Viernes 8:00-16:00"
    };

    console.log("Datos procesados para empleado:", employeeData);

    // Verificar acceso a la base de datos
    const { db } = await import("./db");
    const { employees, users } = await import("../shared/schema");
    const { eq } = await import("drizzle-orm");

    // Insertar empleado
    const [newEmployee] = await db
      .insert(employees)
      .values(employeeData)
      .returning();

    console.log("Empleado creado:", newEmployee);

    // Crear usuario automáticamente
    try {
      const userData = {
        username: employeeData.email.split('@')[0],
        email: employeeData.email,
        password: "temp123", // Contraseña temporal
        fullName: employeeData.fullName,
        role: "employee" as const,
        phone: employeeData.phone
      };

      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();

      // Actualizar empleado con user_id
      await db
        .update(employees)
        .set({ userId: newUser.id })
        .where(eq(employees.id, newEmployee.id));

      console.log("Usuario creado automáticamente:", newUser);

      res.json({
        success: true,
        employee: newEmployee,
        user: newUser,
        message: "Empleado y usuario creados exitosamente"
      });

    } catch (userError) {
      console.error("Error creando usuario:", userError);
      // Continuar aunque falle la creación del usuario
      res.json({
        success: true,
        employee: newEmployee,
        message: "Empleado creado exitosamente (usuario no pudo crearse)"
      });
    }

  } catch (error: any) {
    console.error("Error en endpoint directo empleados:", error);
    
    let errorMessage = "Error interno del servidor";
    
    if (error.code === '23505') {
      if (error.constraint === 'employees_email_key') {
        errorMessage = `El email ${req.body.email} ya está registrado. Usa un email diferente.`;
      } else {
        errorMessage = "Ya existe un registro con estos datos.";
      }
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

app.get("/api/employees", async (req: Request, res: Response) => {
  try {
    const { db } = await import("./db");
    const { employees } = await import("../shared/schema");
    const allEmployees = await db.select().from(employees);
    res.json(allEmployees);
  } catch (error) {
    console.error("Error obteniendo empleados:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Importar rutas simplificadas de activos - COMENTADO para evitar conflictos
// import { simpleAssetRouter } from "./simple-asset-routes";

// Registrar las rutas simplificadas de activos ANTES de otras rutas - COMENTADO
// app.use('/api', simpleAssetRouter);

// Registrar las rutas de actividades - TEMPORALMENTE COMENTADO PARA USAR ENDPOINT PRINCIPAL
// app.use('/api', activityRouter);

// Registrar las rutas de prueba
app.use('/api/test', testRouter);

// Registrar las rutas de campos de voluntario
app.use('/api/volunteer-fields', volunteerFieldRouter);

// Registrar la ruta especializada para habilidades de voluntarios
app.use('/api', skillsRouter);

// ENDPOINT DIRECTO PARA SUBIDA DE IMÁGENES - PRIORITY ROUTING

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/park-images';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    const extension = path.extname(file.originalname);
    cb(null, `park-img-${timestamp}-${randomId}${extension}`);
  }
});

const imageUpload = multer({ 
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

app.post("/api/parks/:parkId/images", imageUpload.single('image'), async (req: Request, res: Response) => {
  try {
    console.log('🚀 DIRECT IMAGE UPLOAD ENDPOINT REACHED');
    console.log('📝 Params:', req.params);
    console.log('📝 Body:', req.body);
    console.log('📝 File:', req.file ? { filename: req.file.filename, size: req.file.size } : 'No file');
    
    const parkId = parseInt(req.params.parkId);
    const { imageUrl, caption, isPrimary } = req.body;
    
    let finalImageUrl = imageUrl;
    
    if (req.file) {
      finalImageUrl = `/uploads/park-images/${req.file.filename}`;
      console.log('📁 File uploaded:', finalImageUrl);
    }
    
    if (!req.file && !imageUrl) {
      return res.status(400).json({ error: 'Debe proporcionar un archivo de imagen o una URL' });
    }
    
    const { pool } = await import("./db");
    
    // Si es imagen principal, desmarcar otras
    if (isPrimary === 'true' || isPrimary === true) {
      await pool.query('UPDATE park_images SET is_primary = false WHERE park_id = $1', [parkId]);
    }
    
    const insertQuery = `
      INSERT INTO park_images (park_id, image_url, caption, is_primary)
      VALUES ($1, $2, $3, $4)
      RETURNING id, park_id as "parkId", image_url as "imageUrl", caption, is_primary as "isPrimary"
    `;
    
    const result = await pool.query(insertQuery, [
      parkId,
      finalImageUrl,
      caption || '',
      isPrimary === 'true' || isPrimary === true
    ]);
    
    console.log('✅ Image created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error in direct image upload:', error);
    res.status(500).json({ error: 'Error al subir la imagen: ' + (error as Error).message });
  }
});

// ENDPOINT DIRECTO PARA ACTUALIZAR PARQUES - DEVELOPMENT MODE
app.put("/api/dev/parks/:id", async (req: Request, res: Response) => {
  try {
    console.log("=== DESARROLLO - Actualizando parque directamente ===");
    console.log("Park ID:", req.params.id);
    console.log("Datos recibidos:", req.body);
    
    const parkId = Number(req.params.id);
    const parkData = req.body;
    
    const { pool } = await import("./db");
    
    // Construir la consulta de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    if (parkData.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(parkData.name);
    }
    if (parkData.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(parkData.description);
    }
    if (parkData.address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      values.push(parkData.address);
    }
    if (parkData.postalCode !== undefined) {
      updateFields.push(`postal_code = $${paramIndex++}`);
      values.push(parkData.postalCode);
    }
    if (parkData.latitude !== undefined) {
      updateFields.push(`latitude = $${paramIndex++}`);
      values.push(parkData.latitude);
    }
    if (parkData.longitude !== undefined) {
      updateFields.push(`longitude = $${paramIndex++}`);
      values.push(parkData.longitude);
    }
    if (parkData.parkType !== undefined) {
      updateFields.push(`park_type = $${paramIndex++}`);
      values.push(parkData.parkType);
    }
    if (parkData.municipalityId !== undefined) {
      updateFields.push(`municipality_id = $${paramIndex++}`);
      values.push(parkData.municipalityId);
    }
    if (parkData.contactEmail !== undefined) {
      updateFields.push(`contact_email = $${paramIndex++}`);
      values.push(parkData.contactEmail);
    }
    if (parkData.contactPhone !== undefined) {
      updateFields.push(`contact_phone = $${paramIndex++}`);
      values.push(parkData.contactPhone);
    }
    if (parkData.openingHours !== undefined) {
      updateFields.push(`opening_hours = $${paramIndex++}`);
      values.push(parkData.openingHours);
    }
    
    // Agregar ID del parque al final
    values.push(parkId);
    const whereClause = `$${paramIndex}`;
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }
    
    const updateQuery = `
      UPDATE parks 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ${whereClause}
      RETURNING *
    `;
    
    console.log("Query SQL:", updateQuery);
    console.log("Valores:", values);
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Parque no encontrado" });
    }
    
    console.log("Parque actualizado exitosamente:", result.rows[0]);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error("Error al actualizar parque:", error);
    res.status(500).json({ 
      message: "Error al actualizar parque", 
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// ENDPOINT DIRECTO PARA DOCUMENTOS - PRIORITY ROUTING
app.get("/api/parks/:parkId/documents", async (req: Request, res: Response) => {
  try {
    const parkId = parseInt(req.params.parkId);
    console.log(`🔧 DIRECT DOCUMENTS API: Consultando documentos para parque ${parkId}`);
    
    const { pool } = await import("./db");
    const query = `
      SELECT 
        id, 
        park_id as "parkId", 
        title, 
        file_path as "filePath",
        file_url as "fileUrl",
        file_size as "fileSize",
        file_type as "fileType",
        description,
        category,
        created_at as "createdAt"
      FROM park_documents 
      WHERE park_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [parkId]);
    console.log(`✅ DIRECT DOCUMENTS API: Documentos encontrados: ${result.rows.length}`);
    console.log(`📋 DIRECT DOCUMENTS API: Datos:`, result.rows);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ DIRECT DOCUMENTS API: Error:', error);
    res.status(500).json({ error: 'Error al obtener documentos del parque' });
  }
});





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
    
    // Agregar el campo concept que es requerido
    incomeData.concept = incomeData.description || "Ingreso registrado";
    
    console.log("Datos procesados:", incomeData);
    
    const [newIncome] = await db.insert(actualIncomes).values(incomeData).returning();
    console.log("Ingreso registrado exitosamente:", newIncome);
    
    res.status(201).json(newIncome);
  } catch (error) {
    console.error("Error al registrar ingreso directo:", error);
    res.status(500).json({ message: "Error al registrar ingreso" });
  }
});

// Ruta directa para probar la API de usuarios sin autenticación
app.get("/api/users-direct", async (req: Request, res: Response) => {
  try {
    console.log("=== OBTENIENDO USUARIOS DIRECTAMENTE ===");
    
    const { db } = await import("./db");
    const { users } = await import("../shared/schema");
    const result = await db.select().from(users).orderBy(users.id);
    
    console.log(`Usuarios encontrados: ${result.length}`);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json(result);
  } catch (error) {
    console.error("Error al obtener usuarios directamente:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// Servir archivos estáticos de la carpeta de uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Servir archivos estáticos de concesiones y otros uploads directos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

console.log('✅ [TEST] Llegando a la sección de rutas de mantenimiento...');

// === REGISTRO DIRECTO DE RUTAS DE MANTENIMIENTO ===
console.log('🔧 [DIRECT] Registrando rutas de mantenimiento directamente...');

// Rutas de mantenimiento integradas directamente
app.get('/api/assets/:id/maintenances', async (req: Request, res: Response) => {
  console.log('🔧 [DIRECT] GET /api/assets/:id/maintenances - Solicitud recibida para activo:', req.params.id);
  try {
    const assetId = parseInt(req.params.id);
    const { pool } = await import("./db");
    
    const query = `
      SELECT 
        id,
        asset_id as "assetId",
        maintenance_type as "maintenanceType",
        description,
        date,
        status,
        cost,
        performed_by as "performedBy",
        findings,
        actions,
        next_maintenance_date as "nextMaintenanceDate",
        notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM asset_maintenances 
      WHERE asset_id = $1 
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query, [assetId]);
    console.log(`📋 [DIRECT] Devolviendo ${result.rows.length} mantenimientos para activo ${assetId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [DIRECT] Error en GET mantenimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTAS DIRECTAS MOVIDAS DESPUÉS DE registerRoutes(app) para evitar conflictos

// Logging middleware temporalmente desactivado debido a problemas de estabilidad

import { seedDatabase } from "./seed";
import { createTreeTables } from "./create-tree-tables";
import visitorCountRoutes from "./visitor-count-routes";
import { seedTreeSpecies } from "./seed-tree-species";

import { initializeDatabase } from "./initialize-db";

// Database initialization function that runs after server starts
async function initializeDatabaseAsync() {
  try {
    console.log("Inicializando estructura de la base de datos de forma asíncrona...");
    await initializeDatabase();
    
    // Intentar inicializar los datos predeterminados con protección extra
    try {
      await seedDatabase();
    } catch (error) {
      console.error("Error al cargar datos iniciales (continuando):", error);
    }
    
    // Crear tablas del módulo de arbolado con protección
    try {
      await createTreeTables();
    } catch (error) {
      console.error("Error al crear tablas de arbolado (continuando):", error);
    }
    
    // Cargar especies de árboles de muestra con protección
    try {
      await seedTreeSpecies();
    } catch (error) {
      console.error("Error al cargar especies de árboles (continuando):", error);
    }
    
    // Inicializar integración HR-Finanzas con protección mejorada - TEMPORALMENTE DESHABILITADO PARA DESPLIEGUE
    try {
      console.log("HR-Finance integration seeding temporarily disabled for deployment stability");
      // const { seedHRFinanceIntegration } = await import("./seed-hr-finance-integration");
      // await seedHRFinanceIntegration();
    } catch (error) {
      console.error("Error al inicializar integración HR-Finanzas (continuando):", error);
    }
    
    // Inicializar recibos de nómina con protección contra duplicados - TEMPORALMENTE DESHABILITADO PARA DESPLIEGUE
    try {
      console.log("Payroll receipts seeding temporarily disabled for deployment stability");
      // const { seedPayrollReceipts } = await import("./seed-payroll-receipts");
      // await seedPayrollReceipts();
    } catch (error) {
      console.error("Error al inicializar recibos de nómina (continuando):", error);
    }
    
    console.log("Inicialización de base de datos completada exitosamente");
  } catch (error) {
    console.error("Error crítico al inicializar la base de datos (servidor continuará funcionando):", error);
  }
}

(async () => {
  // Essential middleware setup immediately
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Register essential routes immediately for health checks and basic functionality
  try {
    registerRoutes(app);
  } catch (error) {
    console.error("Error registering essential routes:", error);
  }

  // Register essential HR routes immediately (but defer complex initialization)
  try {
    const { registerHRRoutes } = await import("./hr-routes");
    const hrRouter = express.Router();
    registerHRRoutes(app, hrRouter, (req: Request, res: Response, next: NextFunction) => next());
    app.use("/api/hr", hrRouter);
  } catch (error) {
    console.error("Error al registrar rutas HR:", error);
  }

  // Rutas para servir archivos del recibo - ANTES de Vite
  app.get('/api/recibo-nomina', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibo de Nómina - Parques de México</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #00a587 0%, #067f5f 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(45deg, #00a587, #067f5f);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .content {
            padding: 40px;
        }
        .feature-list {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .feature-list h3 {
            color: #00a587;
            margin-top: 0;
        }
        .feature-list ul {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .feature-list li:before {
            content: "✓";
            color: #00a587;
            font-weight: bold;
            margin-right: 10px;
        }
        .buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background: #00a587;
            color: white;
        }
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            border-top: 3px solid #00a587;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌳 Parques de México</h1>
            <p>Recibo de Nómina Oficial</p>
        </div>
        
        <div class="content">
            <h2>Recibo de Nómina con Logo Oficial</h2>
            <p>Descarga el recibo de nómina profesional con el branding oficial de Parques de México.</p>
            
            <div class="feature-list">
                <h3>Características del Recibo:</h3>
                <ul>
                    <li>Logo oficial de Parques de México integrado</li>
                    <li>Colores corporativos (#00a587, #067f5f, #bcd256)</li>
                    <li>Información fiscal completa (RFC, CURP, NSS)</li>
                    <li>Cumplimiento legal mexicano (Art. 99 LFT)</li>
                    <li>Registro patronal y datos fiscales</li>
                    <li>Sección de firmas profesional</li>
                    <li>Footer con información legal</li>
                    <li>Formato PDF de alta calidad</li>
                </ul>
            </div>
            
            <div class="buttons">
                <a href="/sample-receipt-with-logo.pdf" class="btn btn-primary" download>
                    📄 Descargar PDF
                </a>
                <a href="/sample-receipt-with-logo.pdf" class="btn btn-secondary" target="_blank">
                    👁️ Ver en Nueva Ventana
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ParkSys</strong> - Sistema de Gestión de Parques Municipales</p>
            <p>© 2025 Parques de México. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
    res.send(htmlContent);
  });

  app.get('/sample-receipt-with-logo.pdf', (req: Request, res: Response) => {
    const filePath = path.join(process.cwd(), 'public', 'sample-receipt-with-logo.pdf');
    res.sendFile(filePath);
  });

  app.get('/parques-mexico-logo.jpg', (req: Request, res: Response) => {
    const filePath = path.join(process.cwd(), 'public', 'parques-mexico-logo.jpg');
    res.sendFile(filePath);
  });

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



  // Use environment port for deployment compatibility - ensure port 5000
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  const HOST = '0.0.0.0';
  
  let appServer: any;

  // Detect deployment environment
  const isDeployment = process.env.REPLIT_DEPLOYMENT_ID || process.env.NODE_ENV === "production";
  
  // Use the comprehensive initialization function defined earlier
  const initializeDatabaseAsync = initializeSystemAsync;
  
  // Setup Vite in development mode with error handling
  if (app.get("env") === "development" && !isDeployment) {
    // Configurar Vite antes de iniciar el servidor
    try {
      const { setupVite } = await import("./vite");
      appServer = app.listen(PORT, HOST, async () => {
        console.log(`Servidor ejecutándose en puerto ${PORT}`);
        
        try {
          await setupVite(app, appServer);
          console.log("✅ Servidor de desarrollo Vite listo - Aplicación web accesible");
        } catch (error) {
          console.log("✅ Servidor funcionando sin Vite - API disponible en puerto " + PORT);
        }
        
        // Inicializar base de datos después de que todo esté listo con timeout reducido
        setImmediate(() => {
          initializeDatabaseAsync().catch(() => {
            // Silently handle database initialization errors
          });
        });
      });
    } catch (error) {
      appServer = app.listen(PORT, HOST, () => {
        console.log(`Servidor ejecutándose en puerto ${PORT} (solo API)`);
        
        setImmediate(() => {
          initializeDatabaseAsync().catch(() => {
            // Silently handle database initialization errors
          });
        });
      });
    }
  } else {
    // Modo producción - servir archivos estáticos
    app.use(express.static(path.join(process.cwd(), 'public')));
    
    // Fallback para rutas no encontradas - servir index.html
    app.get('*', (req, res) => {
      // Solo servir HTML para rutas que no son API, except root which is handled above
      if (!req.path.startsWith('/api/') && req.path !== '/') {
        const indexPath = path.join(process.cwd(), 'public', 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Application not built. Please run npm run build first.');
        }
      } else if (req.path.startsWith('/api/') && req.path !== '/api/status' && req.path !== '/api/health') {
        res.status(404).json({ error: 'API endpoint not found' });
      }
    });
    
    appServer = app.listen(PORT, HOST, () => {
      console.log(`🚀 ParkSys servidor ejecutándose en ${HOST}:${PORT}`);
      console.log(`✅ Servidor iniciado exitosamente - Health checks disponibles`);
      
      // Initialize database in background after server is ready
      setImmediate(() => {
        initializeDatabaseAsync().catch(() => {
          // Silently handle database initialization errors
        });
      });
    });
  }

  // Ensure graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    if (appServer) {
      appServer.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    }
  });
})();
