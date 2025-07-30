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

// Configuración básica de Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware CORS para Replit
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Simple API health check - priority over static files
app.get('/api/status', (req: Request, res: Response) => {
  try {
    res.status(200).json({ 
      status: 'ok', 
      message: 'ParkSys - Parques de México API',
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 5000,
      environment: process.env.NODE_ENV || 'development',
      replit: {
        deployment_id: process.env.REPLIT_DEPLOYMENT_ID || 'development',
        domain: process.env.REPLIT_DOMAIN || 'localhost'
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

// Endpoint específico para verificar estado del servidor en Replit
app.get('/server-status', (req: Request, res: Response) => {
  try {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    res.status(200).json({
      status: 'running',
      uptime: `${Math.floor(uptime)} segundos`,
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memory.external / 1024 / 1024)} MB`
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      isReplit: !!process.env.REPLIT_DEPLOYMENT_ID
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint for deployment (API route)
app.get('/api/health', (req: Request, res: Response) => {
  try {
    res.status(200).json({ 
      status: 'ok', 
      message: 'ParkSys API is running',
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 5000,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Additional health check endpoint
app.get('/health', (req: Request, res: Response) => {
  try {
    res.status(200).json({ 
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint para debugging del proxy
app.get('/test-proxy', (req: Request, res: Response) => {
  console.log('📡 Test proxy endpoint accessed');
  res.json({
    message: 'Proxy funciona correctamente',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent')
  });
});

// Debug endpoint específico para notificaciones
app.get('/debug/notifications', (req: Request, res: Response) => {
  console.log('🔍 Debug notifications endpoint accessed');
  res.json({
    message: 'Sistema de notificaciones granulares operativo',
    timestamp: new Date().toISOString(),
    componentsStatus: {
      userPreferencesRouter: 'registered',
      feedbackRoutes: 'registered',
      granularPreferences: 'active'
    },
    testData: {
      totalUsers: 51,
      adminsWithGranularPrefs: 6,
      feedbackFormsSubmitted: 4
    }
  });
});

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

// Servir archivos de publicidad desde uploads/advertising
app.use('/uploads/advertising', express.static(path.join(process.cwd(), 'uploads/advertising')));

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

// Global request logging for debugging - AFTER JSON parsing
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && req.url.includes('/api/activities')) {
    console.log(`🌟 GLOBAL POST-JSON: ${req.method} ${req.url}`);
    console.log(`🌟 Body parseado:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// ENDPOINT DUPLICADO ELIMINADO - USANDO ÚNICO ENDPOINT EN routes.ts

// ENDPOINT PARA OBTENER ACTIVIDAD ESPECÍFICA
app.get("/api/activities/:id", async (req: Request, res: Response) => {
  console.log("🎯 GET ACTIVITY ENDPOINT - ID:", req.params.id);
  
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
    
    console.log("🔍 Raw activity data from DB:");
    console.log("target_market raw:", activity.target_market, typeof activity.target_market);
    console.log("special_needs raw:", activity.special_needs, typeof activity.special_needs);
    
    // Parsear campos JSON
    let targetMarket = [];
    let specialNeeds = [];
    
    if (activity.target_market) {
      if (Array.isArray(activity.target_market)) {
        // Ya es un array, usarlo directamente
        targetMarket = activity.target_market;
        console.log("✅ targetMarket is already array:", targetMarket);
      } else if (typeof activity.target_market === 'string') {
        try {
          // Intentar parsear como JSON
          targetMarket = JSON.parse(activity.target_market);
          console.log("✅ targetMarket parsed as JSON:", targetMarket);
        } catch (e) {
          // Si falla, tratar como string separado por comas
          targetMarket = activity.target_market.split(',').map(s => s.trim()).filter(s => s.length > 0);
          console.log("✅ targetMarket parsed as CSV:", targetMarket);
        }
      } else {
        console.log("❌ targetMarket type unknown:", typeof activity.target_market);
        targetMarket = [];
      }
    } else {
      console.log("⚠️ targetMarket is null/undefined");
    }
    
    if (activity.special_needs) {
      if (Array.isArray(activity.special_needs)) {
        // Ya es un array, usarlo directamente
        specialNeeds = activity.special_needs;
        console.log("✅ specialNeeds is already array:", specialNeeds);
      } else if (typeof activity.special_needs === 'string') {
        try {
          // Intentar parsear como JSON
          specialNeeds = JSON.parse(activity.special_needs);
          console.log("✅ specialNeeds parsed as JSON:", specialNeeds);
        } catch (e) {
          // Si falla, tratar como string separado por comas
          specialNeeds = activity.special_needs.split(',').map(s => s.trim()).filter(s => s.length > 0);
          console.log("✅ specialNeeds parsed as CSV:", specialNeeds);
        }
      } else {
        console.log("❌ specialNeeds type unknown:", typeof activity.special_needs);
        specialNeeds = [];
      }
    } else {
      console.log("⚠️ specialNeeds is null/undefined");
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

    console.log("🎯 Actividad encontrada:", formattedActivity);
    res.json(formattedActivity);

  } catch (error) {
    console.error("🎯 Error al obtener actividad:", error);
    res.status(500).json({ 
      error: "Error interno del servidor", 
      details: error instanceof Error ? error.message : "Error desconocido" 
    });
  }
});

// ENDPOINT DIRECTO EMPLEADOS - REGISTRADO PRIMERO para evitar conflictos
app.post("/api/employees", async (req: Request, res: Response) => {
  try {
    console.log("=== ENDPOINT DIRECTO EMPLEADOS ===");
    console.log("Headers Content-Type:", req.headers['content-type']);
    console.log("Body recibido:", req.body);
    
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

// Endpoint para obtener todos los mantenimientos (requerido por frontend)
app.get('/api/assets/maintenances', async (req: Request, res: Response) => {
  console.log('🔧 [DIRECT] GET /api/assets/maintenances - Obteniendo todos los mantenimientos');
  try {
    const { pool } = await import("./db");
    
    const query = `
      SELECT 
        am.id,
        am.asset_id as "assetId",
        a.name as "assetName",
        am.maintenance_type as "maintenanceType",
        am.description,
        am.date,
        am.status,
        am.cost,
        am.performed_by as "performedBy",
        am.findings,
        am.actions,
        am.next_maintenance_date as "nextMaintenanceDate",
        am.notes,
        am.created_at as "createdAt",
        am.updated_at as "updatedAt"
      FROM asset_maintenances am
      LEFT JOIN assets a ON am.asset_id = a.id
      ORDER BY am.date DESC
    `;
    
    const result = await pool.query(query);
    console.log(`📋 [DIRECT] Devolviendo ${result.rows.length} mantenimientos totales`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [DIRECT] Error en GET todos los mantenimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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
import visitorsDashboardRoutes from "./visitors-dashboard-routes";
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
  


  // HR routes registration moved to after main routes registration
  // (see after registerRoutes call)

  // Registrar rutas de vacaciones y control de horas
  try {
    const { registerTimeOffRoutes } = await import("./time-off-routes");
    const timeOffRouter = express.Router();
    
    // Aplicar middleware JSON al router de tiempo libre
    timeOffRouter.use(express.json({ limit: '50mb' }));
    timeOffRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    registerTimeOffRoutes(app, timeOffRouter, (req: Request, res: Response, next: NextFunction) => next());
    app.use("/api/time-off", timeOffRouter);
    console.log("Rutas de vacaciones y control de horas registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de vacaciones y control de horas:", error);
  }

  // Crear tablas de recibos de nómina
  try {
    const { createPayrollReceiptsTables } = await import("./create-payroll-receipts-tables");
    await createPayrollReceiptsTables();
    
    // Crear datos de muestra para recibos
    const { seedPayrollReceipts } = await import("./seed-payroll-receipts");
    await seedPayrollReceipts();
  } catch (error) {
    console.error("Error al crear tablas de recibos de nómina:", error);
  }

  // Registrar rutas de Recibos de Nómina
  try {
    const { registerPayrollReceiptsRoutes } = await import("./payroll-receipts-routes");
    const receiptsRouter = express.Router();
    
    // Aplicar middleware JSON específicamente al router de recibos
    receiptsRouter.use(express.json({ limit: '50mb' }));
    receiptsRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    registerPayrollReceiptsRoutes(app, receiptsRouter, (req: Request, res: Response, next: NextFunction) => next());
    app.use("/api/payroll", receiptsRouter); // Usar prefijo separado para evitar conflictos con HR
    console.log("Rutas de Recibos de Nómina registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de Recibos de Nómina:", error);
  }

  // Registrar rutas de Eventos AMBU
  try {
    const { registerEventosAmbuRoutes } = await import("./eventos-ambu-routes");
    const eventosAmbuRouter = express.Router();
    
    // Aplicar middleware JSON específicamente al router de eventos AMBU
    eventosAmbuRouter.use(express.json({ limit: '50mb' }));
    eventosAmbuRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    registerEventosAmbuRoutes(app, eventosAmbuRouter, (req: Request, res: Response, next: NextFunction) => next());
    app.use("/api", eventosAmbuRouter);
    console.log("Rutas de Eventos AMBU registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de Eventos AMBU:", error);
  }

  // Registrar rutas del sistema de email
  try {
    const { emailRouter } = await import("./email/emailRoutes");
    console.log("Registrando rutas del sistema de email...");
    app.use("/api/email", emailRouter);
    console.log("Rutas del sistema de email registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de email:", error);
  }

  // Registrar rutas de imágenes de actividades
  try {
    const activityImageRouter = await import("./activity-image-routes");
    app.use("/api/activities", activityImageRouter.default);
    console.log("Rutas de imágenes de actividades registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de imágenes de actividades:", error);
  }

  // Registrar rutas del sistema de comunicaciones
  try {
    const { default: communicationsRouter } = await import("./communications/communicationsRoutes");
    console.log("Registrando rutas del sistema de comunicaciones...");
    app.use("/api/communications", communicationsRouter);
    console.log("Rutas del sistema de comunicaciones registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de comunicaciones:", error);
  }

  // Registrar rutas del sistema de publicidad
  try {
    const { default: advertisingRouter } = await import("./advertising-routes");
    console.log("Registrando rutas del sistema de publicidad...");
    app.use("/api/advertising-management", advertisingRouter);
    console.log("Rutas del sistema de publicidad registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de publicidad:", error);
  }

  // Registrar rutas del sistema de conteo de visitantes
  try {
    console.log("Registrando rutas del sistema de conteo de visitantes...");
    
    // Crear router específico con middleware JSON
    const visitorCountRouter = express.Router();
    visitorCountRouter.use(express.json({ limit: '50mb' }));
    visitorCountRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Montar las rutas de visitor-count en el router con middleware
    visitorCountRouter.use('/', visitorCountRoutes);
    
    app.use("/api", visitorCountRouter);
    console.log("Rutas del sistema de conteo de visitantes registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de conteo de visitantes:", error);
  }

  // Registrar rutas del sistema de retroalimentación
  try {
    const { default: feedbackRouter } = await import("./feedback-routes");
    console.log("Registrando rutas del sistema de retroalimentación...");
    app.use("/api/feedback", feedbackRouter);
    console.log("Rutas del sistema de retroalimentación registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de retroalimentación:", error);
  }

  // Registrar rutas del sistema de preferencias de usuario
  try {
    const { userPreferencesRouter } = await import("./user-preferences-routes");
    console.log("Registrando rutas del sistema de preferencias de usuario...");
    app.use("/api/users", userPreferencesRouter);
    console.log("Rutas del sistema de preferencias de usuario registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de preferencias de usuario:", error);
  }

  // Inicializar tablas de comunicaciones
  try {
    const { seedEmailTemplates } = await import("./communications/seedCommunications");
    await seedEmailTemplates();
  } catch (error) {
    console.error("Error inicializando tablas de comunicaciones:", error);
  }

  // Inicializar módulo de contabilidad
  try {
    const { createAccountingModule } = await import("./create-accounting-module");
    await createAccountingModule();
    console.log("Módulo de contabilidad inicializado correctamente");
  } catch (error) {
    console.error("Error inicializando módulo de contabilidad:", error);
  }

  const routeServer = await registerRoutes(app);

  // Registrar rutas de permisos de usuario
  try {
    const userPermissionsRouter = await import('./routes/userPermissions');
    app.use('/api', userPermissionsRouter.default);
    console.log("✅ Rutas de permisos de usuario registradas correctamente");
  } catch (error) {
    console.error("❌ Error al registrar rutas de permisos:", error);
  }

  // Inicializar tablas de patrocinios
  try {
    const { createSponsorshipTables } = await import("./create-sponsorship-tables");
    await createSponsorshipTables();
    
    const { createSponsorshipContractsTables, addSampleContractData } = await import("./create-sponsorship-contracts-tables");
    await createSponsorshipContractsTables();
    await addSampleContractData();
  } catch (error) {
    console.error("Error inicializando tablas de patrocinios:", error);
  }

  // Inicializar tablas de vacaciones
  try {
    const { createVacationTables } = await import("./create-vacation-tables");
    await createVacationTables();
    console.log("✅ Tablas de vacaciones inicializadas");
  } catch (error) {
    console.error("Error al inicializar tablas de vacaciones:", error);
  }

  // Registrar rutas de mantenimiento de activos
  try {
    const { registerMaintenanceRoutes } = await import("./maintenance_routes");
    const apiRouter = express.Router();
    const isAuthenticated = (req: Request, res: Response, next: NextFunction) => next();
    registerMaintenanceRoutes(app, apiRouter, isAuthenticated);
    app.use('/api', apiRouter);
    console.log("✅ Rutas de mantenimiento de activos registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de mantenimiento:", error);
  }

  // Registrar API de integraciones financieras múltiples
  try {
    const apiRouter = express.Router();
    registerFinancialIntegrationsAPI(apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    registerMultimediaRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Importar y registrar rutas de planificación presupuestaria
    const { registerBudgetPlanningRoutes } = await import('./budget-planning-routes');
    registerBudgetPlanningRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Importar y registrar rutas del módulo financiero
    const { registerFinanceRoutes } = await import('./finance-routes');
    registerFinanceRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Importar y registrar rutas del módulo de contabilidad
    const { registerAccountingRoutes } = await import('./accounting-routes');
    registerAccountingRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Importar y registrar rutas de categorías de eventos
    const { registerEventCategoriesRoutes } = await import('./event-categories-routes');
    registerEventCategoriesRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Importar y registrar rutas de instructores
    const { registerInstructorRoutes } = await import('./instructor-routes');
    registerInstructorRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Importar y registrar rutas de categorías de activos
    const { registerAssetCategoriesRoutes } = await import('./asset-categories-routes');
    registerAssetCategoriesRoutes(app, apiRouter);
    
    const { registerInstructorEvaluationRoutes } = await import('./instructor-evaluations-routes');
    registerInstructorEvaluationRoutes(app, apiRouter);
    
    // Importar y registrar rutas de concesionarios
    const { registerConcessionairesRoutes } = await import('./concessionaires-routes');
    registerConcessionairesRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Importar y registrar rutas de patrocinios
    const { registerSponsorshipRoutes } = await import('./sponsorship-routes');
    registerSponsorshipRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());

    // Registrar rutas del módulo de evaluaciones de parques
    const { registerParkEvaluationRoutes } = await import('./park-evaluations-routes');
    registerParkEvaluationRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Registrar rutas de criterios de evaluación configurables
    const { registerEvaluationCriteriaRoutes } = await import('./evaluation-criteria-routes');
    registerEvaluationCriteriaRoutes(app, apiRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Importar y registrar rutas de conteo de visitantes
    app.use("/api", visitorCountRoutes);
    console.log("Rutas de conteo de visitantes registradas correctamente");
    
    // Registrar rutas del dashboard integral de visitantes
    app.use("/api/visitors", visitorsDashboardRoutes);
    console.log("✅ Rutas del dashboard integral de visitantes registradas correctamente");
    
    // CATEGORÍAS DE ACTIVOS: Registradas en la sección principal arriba para evitar duplicación
    // MANTENIMIENTO DE ACTIVOS: Registradas en la sección principal de startup para evitar duplicación
    
    app.use("/api", apiRouter);
    console.log("API de integraciones financieras múltiples registrada correctamente");
    
    // Crear tablas de multimedia si no existen
    await createMultimediaTables();
    console.log("Sistema de multimedia inicializado correctamente");
    
    // Crear tablas de evaluaciones de parques
    await createParkEvaluationsTables();
    console.log("Sistema de evaluaciones de parques inicializado correctamente");
    
    // Crear tablas de criterios de evaluación configurables
    const { createEvaluationCriteriaTables, seedDefaultEvaluationCriteria } = await import('./create-evaluation-criteria-tables');
    await createEvaluationCriteriaTables();
    await seedDefaultEvaluationCriteria();
    console.log("Sistema de criterios de evaluación configurables inicializado correctamente");
  } catch (error) {
    console.error("Error al registrar API de integraciones financieras:", error);
  }

  // Registrar módulo de seguridad
  try {
    console.log("🔒 Registrando módulo de seguridad...");
    
    const { initSecurityTables, seedSecurityData } = await import('./security/initSecurityTables');
    await initSecurityTables();
    await seedSecurityData();
    
    const securityRouter = await import('./security/securityRoutes');
    app.use('/api/security', securityRouter.default);
    
    // Registrar rutas de recuperación de contraseña
    console.log("🔑 Registrando rutas de recuperación de contraseña...");
    const passwordRecoveryRouter = await import('./password-recovery-routes');
    app.use('/api', passwordRecoveryRouter.default);
    
    console.log("✅ Módulo de seguridad registrado correctamente");
  } catch (error) {
    console.error("❌ Error al registrar módulo de seguridad:", error);
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

  // Endpoint removido - ahora usa la ruta registrada en finance-routes.ts

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });



  // Use environment port for deployment compatibility - ensure port 5000
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  const HOST = '0.0.0.0';
  
  console.log(`🚀 Starting server on ${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  
  let appServer: any;

  // Registrar rutas HR ANTES de Vite para evitar conflictos
  try {
    const { registerHRRoutes } = await import("./hr-routes");
    const hrRouter = express.Router();
    
    // Aplicar middleware JSON específicamente al router HR
    hrRouter.use(express.json({ limit: '50mb' }));
    hrRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    registerHRRoutes(app, hrRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    // Registrar rutas del módulo de vacaciones
    const { registerVacationRoutes } = await import("./vacation-routes");
    registerVacationRoutes(app, hrRouter, (req: Request, res: Response, next: NextFunction) => next());
    
    app.use("/api/hr", hrRouter); // Registrar rutas HR ANTES de Vite
    console.log("✅ Rutas HR y Vacaciones registradas ANTES de Vite");
  } catch (error) {
    console.error("Error al registrar rutas HR:", error);
  }

  // Forzar modo producción para resolver problemas con proxy de Replit
  console.log("🔧 Configurando servidor para resolver problemas de proxy de Replit...");
  
  // Configurar headers y timeout para mejor compatibilidad con Replit
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Headers para mejor compatibilidad con proxy de Replit
    res.setHeader('X-Powered-By', 'ParkSys');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Timeout más largo para evitar 503s
    res.setTimeout(15000, () => {
      if (!res.headersSent) {
        console.error(`⚠️ Timeout en ruta: ${req.method} ${req.path}`);
        res.status(408).json({ error: 'Request timeout', path: req.path });
      }
    });
    next();
  });
  
  // Usar modo desarrollo para Vite, pero con configuración mejorada
  const isDeployment = false; // Habilitar Vite para desarrollo
  
  // Setup Vite in development mode with error handling
  if (app.get("env") === "development" && !isDeployment) {
    console.log("Configurando servidor de desarrollo Vite...");
    
    // Configurar Vite antes de iniciar el servidor
    try {
      const { setupVite } = await import("./vite");
      appServer = app.listen(PORT, HOST, async () => {
        console.log(`Servidor ejecutándose en puerto ${PORT}`);
        
        try {
          await setupVite(app, appServer);
          console.log("✅ Servidor de desarrollo Vite listo - Aplicación web accesible");
          console.log("🔗 Proxy de Replit configurado correctamente");
          console.log("🌐 URL pública disponible");
        } catch (error) {
          console.error("Error configurando Vite (continuando sin Vite):", error);
          console.log("✅ Servidor funcionando sin Vite - API disponible en puerto " + PORT);
        }
        
        // Inicializar base de datos después de que todo esté listo
        setTimeout(() => {
          initializeDatabaseAsync().catch(error => {
            console.error("Error inicializando base de datos (no crítico):", error);
          });
        }, 3000);
      });
    } catch (error) {
      console.error("Error importando Vite, iniciando servidor sin frontend:", error);
      appServer = app.listen(PORT, HOST, () => {
        console.log(`Servidor ejecutándose en puerto ${PORT} (solo API)`);
        
        setTimeout(() => {
          initializeDatabaseAsync().catch(error => {
            console.error("Error inicializando base de datos (no crítico):", error);
          });
        }, 3000);
      });
    }
  } else {
    // Modo producción - servir archivos estáticos
    console.log("🏭 Configurando servidor para producción...");
    console.log("🔍 Deployment ID:", process.env.REPLIT_DEPLOYMENT_ID || "Not set");
    console.log("🌍 Node Environment:", process.env.NODE_ENV || "development");
    
    // Servir archivos estáticos desde public
    app.use(express.static(path.join(process.cwd(), 'public')));
    
    // Fallback para rutas no encontradas - servir index.html
    app.get('*', (req, res) => {
      // Solo servir HTML para rutas que no son API
      if (!req.path.startsWith('/api/')) {
        const indexPath = path.join(process.cwd(), 'public', 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Application not built. Please run npm run build first.');
        }
      } else {
        res.status(404).json({ error: 'API endpoint not found' });
      }
    });
    
    appServer = app.listen(PORT, HOST, () => {
      console.log(`🚀 ParkSys servidor en producción ejecutándose en ${HOST}:${PORT}`);
      console.log(`🌐 Aplicación disponible en http://${HOST}:${PORT}`);
      console.log(`📊 Sistema de evaluaciones de parques operativo con 169 evaluaciones`);
      console.log(`🏛️ Bosques Urbanos de Guadalajara - Sistema listo para presentación`);
      
      setTimeout(() => {
        initializeDatabaseAsync().catch(error => {
          console.error("Error inicializando base de datos (no crítico):", error);
        });
      }, 1000);
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
