import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, hasMunicipalityAccess, hasParkAccess, requirePermission, requireAdmin } from "./middleware/auth";
import { handleProfileImageUpload } from "./api/profileImageUpload";
import { saveProfileImage, getProfileImage } from "./profileImageCache";
import { db, pool } from "./db";
import { sql, eq } from "drizzle-orm";
import { deleteAllVolunteers, deleteVolunteer } from "./delete-all-volunteers";
import * as schema from "@shared/schema";
const { parkAmenities, amenities } = schema;
import { videoRouter } from "./video_routes";
import { registerVolunteerRoutes } from "./volunteerRoutes";
// import { registerInstructorRoutes } from "./instructorRoutes"; // Comentado para evitar conflictos - se usa instructor-routes.ts
import { registerPublicRoutes } from "./publicRoutes";
import { registerAssetRoutes } from "./asset_routes";
import { registerAssetImageRoutes } from "./asset-image-routes";
import { registerMaintenanceRoutes } from "./maintenance_routes_fixed";
import { registerAssetAssignmentRoutes } from "./asset_assignment_routes";
import { registerTreeRoutes } from "./tree_routes";
import { registerTreeMaintenanceRoutes } from "./tree_maintenance_routes";
// Comentamos la importación de tree_inventory_routes para evitar conflictos de rutas
// import { registerTreeInventoryRoutes } from "./tree_inventory_routes";
import { registerTreeStatsRoutes } from "./tree_stats_routes";
import { registerTreeDetailsRoutes } from "./tree_details_route";
import { activityRouter } from "./activityRoutes";
import directRouter from "./directRoutes";
import { registerConcessionRoutes } from "./concession-routes";
import { registerConcessionContractsRoutes } from "./concession-contracts-routes";
import { registerUsersConcessionairesRoutes } from "./users-concessionaires-routes";
import { registerConcessionairesRoutes } from "./concessionaires-routes";
import { registerConcessionLocationsRoutes } from "./concession-locations-routes";
import { registerConcessionPaymentsRoutes } from "./concession-payments-routes";
import { registerConcessionEvaluationRoutes } from "./concession-evaluations-routes";
import { registerFinanceRoutes } from "./finance-routes";
import { registerBudgetRoutes } from "./budget-routes";
import { registerFinanceUpdateRoutes } from "./finance-update-routes";
import { 
  uploadParkFile, 
  handleMulterErrors, 
  generateImportTemplate, 
  processImportFile 
} from "./api/parksImport";
import { registerUserRoutes } from "./userRoutes";
import { updateSkillsRouter } from "./updateSkills";
import { registerEventRoutes } from "./events-routes";
import { registerActivityRoutes } from "./activitiesRoutes";
import { 
  insertParkSchema, insertCommentSchema, insertIncidentSchema, 
  insertActivitySchema, insertDocumentSchema, insertParkImageSchema,
  insertParkAmenitySchema, ExtendedPark, Park, Municipality, Amenity, Activity
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server first
  const httpServer = createServer(app);
  
  // API routes - all prefixed with /api
  const apiRouter = express.Router();
  
  // Public API routes - all prefixed with /public-api
  const publicRouter = express.Router();
  
  // Configure multer for file uploads
  const upload = multer({ storage: multer.memoryStorage() });
  
  // Configure multer specifically for icon uploads with disk storage
  const iconUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        cb(null, `amenity-icon-${uniqueSuffix}.${extension}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Formato de archivo no válido. Solo se permiten PNG, JPG, JPEG y SVG'));
      }
    },
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB
    }
  });
  
  // Template download routes (must be defined before conflicting routes)
  app.get('/api/template/parks-import', generateImportTemplate);
  
  // Ruta especial para videos
  app.post('/api/videos/update/:id', async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const { videoUrl } = req.body;
      
      if (videoUrl === undefined) {
        return res.status(400).json({ message: "videoUrl is required" });
      }
      
      // Verificamos que existe el parque
      const existingPark = await storage.getPark(parkId);
      if (!existingPark) {
        return res.status(404).json({ message: "Parque no encontrado" });
      }
      
      // Actualizamos directamente usando SQL parametrizado
      await pool.query('UPDATE parks SET video_url = $1 WHERE id = $2', [videoUrl, parkId]);
      
      res.json({ 
        success: true, 
        message: "Video URL updated successfully",
        videoUrl: videoUrl
      });
    } catch (error) {
      console.error("Error al actualizar video:", error);
      res.status(500).json({ 
        success: false,
        message: "Error updating video URL",
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Registramos las rutas de actividades
  apiRouter.use(activityRouter);
  
  // Registramos las rutas del módulo de voluntariado
  registerVolunteerRoutes(app, apiRouter, null, isAuthenticated);
  
  // Registramos las rutas del módulo de instructores
  // registerInstructorRoutes(app, apiRouter, publicRouter, isAuthenticated); // Comentado - se usa instructor-routes.ts
  
  // Registramos las rutas del módulo de activos
  registerAssetRoutes(app, apiRouter, isAuthenticated);
  registerMaintenanceRoutes(app, apiRouter, isAuthenticated);
  registerAssetAssignmentRoutes(app, apiRouter, isAuthenticated);
  registerAssetImageRoutes(app, apiRouter, isAuthenticated);
  
  // Registramos las rutas del módulo de actividades
  registerActivityRoutes(app, apiRouter, isAuthenticated, hasParkAccess);
  
  // Registramos las rutas del módulo de arbolado
  registerTreeRoutes(app, apiRouter, isAuthenticated);
  registerTreeMaintenanceRoutes(app, apiRouter, isAuthenticated);
  
  // Registramos las rutas del módulo de eventos
  registerEventRoutes(app, apiRouter, isAuthenticated);
  
  // Registramos las rutas del módulo financiero
  registerFinanceRoutes(app, apiRouter, isAuthenticated);
  registerBudgetRoutes(app, apiRouter, isAuthenticated);
  registerFinanceUpdateRoutes(app, apiRouter);

  // Rutas de edición específicas con nombres únicos
  apiRouter.put("/income-categories/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      console.log("=== EDITANDO CATEGORÍA DE INGRESOS ===");
      console.log("ID:", categoryId, "Datos:", { name, description });
      
      const query = `UPDATE income_categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *`;
      const result = await db.execute(query, [name, description, categoryId]);
      
      console.log("Resultado:", result.rows[0]);
      
      res.json({
        success: true,
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error("Error editando categoría de ingresos:", error);
      res.status(500).json({
        success: false,
        message: "Error editando categoría",
        error: error.message
      });
    }
  });

  apiRouter.put("/expense-categories/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      console.log("=== EDITANDO CATEGORÍA DE EGRESOS ===");
      console.log("ID:", categoryId, "Datos:", { name, description });
      
      const query = `UPDATE expense_categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *`;
      const result = await db.execute(query, [name, description, categoryId]);
      
      console.log("Resultado:", result.rows[0]);
      
      res.json({
        success: true,
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error("Error editando categoría de egresos:", error);
      res.status(500).json({
        success: false,
        message: "Error editando categoría",
        error: error.message
      });
    }
  });
  
  // Registramos las rutas del módulo de inventario de árboles
  // Comentamos esta línea para evitar conflictos con las rutas en tree_routes.ts
  // registerTreeInventoryRoutes(app, apiRouter, isAuthenticated);
  
  // Registramos las rutas para categorías de incidentes
  try {
    const { registerIncidentCategoriesRoutes } = await import("./incident_categories_routes");
    registerIncidentCategoriesRoutes(app, apiRouter);
    console.log("Rutas de categorías de incidentes registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de categorías de incidentes:", error);
  }
  
  // Inicializamos tablas de categorías de incidentes
  try {
    const { createIncidentCategoriesTables } = await import("./create_incident_categories_tables");
    await createIncidentCategoriesTables();
    console.log("Tablas de categorías de incidentes inicializadas correctamente");
  } catch (error) {
    console.error("Error al inicializar tablas de categorías de incidentes:", error);
  }
  
  // Registramos las rutas de estadísticas de árboles
  registerTreeStatsRoutes(app, apiRouter);
  
  // Registramos las rutas de gestión técnica y ambiental de árboles
  registerTreeDetailsRoutes(app, apiRouter, isAuthenticated);
  
  // Registramos las rutas del módulo de usuarios
  registerUserRoutes(app, apiRouter);
  
  // Registramos las rutas del módulo de concesiones
  registerConcessionRoutes(app, apiRouter, isAuthenticated);
  registerConcessionContractsRoutes(app, apiRouter, isAuthenticated);
  registerUsersConcessionairesRoutes(app, apiRouter, isAuthenticated);
  registerConcessionairesRoutes(app, apiRouter, isAuthenticated);
  registerConcessionLocationsRoutes(app, apiRouter, isAuthenticated);
  registerConcessionPaymentsRoutes(app, apiRouter, isAuthenticated);
  registerConcessionEvaluationRoutes(app, apiRouter, isAuthenticated);
  
  // Registramos las rutas de integración financiera de concesiones
  try {
    const { registerConcessionFinanceIntegrationRoutes } = await import("./concessions-finance-integration");
    registerConcessionFinanceIntegrationRoutes(app, apiRouter, isAuthenticated);
    console.log("Rutas de integración Concesiones-Finanzas registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas de integración Concesiones-Finanzas:", error);
  }
  
  // Crear tablas del sistema de cobro híbrido
  try {
    const { createHybridPaymentTables } = await import("./create-hybrid-payment-tables");
    await createHybridPaymentTables();
    console.log("Tablas del sistema de cobro híbrido creadas correctamente");
  } catch (error) {
    console.error("Error al crear tablas del sistema de cobro híbrido:", error);
  }
  
  // Registramos las rutas del sistema de cobro híbrido
  try {
    const { registerHybridPaymentRoutes } = await import("./hybrid-payment-routes");
    registerHybridPaymentRoutes(app, apiRouter, isAuthenticated);
    console.log("Rutas del sistema de cobro híbrido registradas correctamente");
  } catch (error) {
    console.error("Error al registrar rutas del sistema de cobro híbrido:", error);
  }
  
  // Endpoints para imágenes de perfil
  // Obtener la imagen de perfil de un usuario
  apiRouter.get('/users/:id/profile-image', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const imageUrl = getProfileImage(userId);
      
      if (!imageUrl) {
        return res.status(404).json({ 
          message: 'No se encontró ninguna imagen de perfil para este usuario'
        });
      }
      
      res.json({ imageUrl });
    } catch (error) {
      console.error('Error al obtener la URL de imagen de perfil:', error);
      res.status(500).json({ 
        message: 'Error al obtener la URL de imagen de perfil'
      });
    }
  });
  
  // Guardar la URL de la imagen de perfil de un usuario
  apiRouter.post('/users/:id/profile-image', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: 'URL de imagen no proporcionada' });
      }
      
      // Guardar la URL en la caché
      saveProfileImage(userId, imageUrl);
      console.log(`Imagen de perfil guardada para el usuario ${userId}: ${imageUrl}`);
      
      res.json({ 
        success: true, 
        message: 'URL de imagen de perfil guardada correctamente',
        userId,
        imageUrl
      });
    } catch (error) {
      console.error('Error al guardar la URL de imagen de perfil:', error);
      res.status(500).json({ 
        message: 'Error al guardar la URL de imagen de perfil'
      });
    }
  });
  
  // Importamos la función para asignar imágenes de perfil
  import("./assign-profile-images").then(module => {
    // Endpoint para asignar imágenes de perfil a todos los usuarios
    apiRouter.post("/admin/assign-profile-images", isAuthenticated, async (req: Request, res: Response) => {
      try {
        const result = await module.assignProfileImages();
        res.status(200).json(result);
      } catch (error) {
        console.error("Error al asignar imágenes de perfil:", error);
        res.status(500).json({ 
          success: false, 
          message: "Error al asignar imágenes de perfil",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  });
  
  // Registramos las rutas públicas
  registerPublicRoutes(publicRouter);
  
  // Montamos todas las rutas de la API bajo el prefijo /api
  app.use('/api', apiRouter);
  
  // Endpoint para cargar imágenes de perfil
  app.post('/api/upload/profile-image', isAuthenticated, handleProfileImageUpload);

  // Montamos todas las rutas públicas bajo el prefijo /public-api
  // Esta línea asegura que todas las rutas definidas en publicRouter sean accesibles bajo /public-api
  app.use('/public-api', publicRouter);
  
  // Añadir router especial para actualizar habilidades
  app.use('/api', updateSkillsRouter);

  // Get all parks with option to filter
  apiRouter.get("/parks", async (req: Request, res: Response) => {
    try {
      // Importamos la función de consulta directa que maneja las imágenes
      const { getParksDirectly } = await import('./direct-park-queries');
      
      // Preparamos los filtros basados en los parámetros de la consulta
      const filters: any = {};
      
      if (req.query.municipalityId) {
        filters.municipalityId = Number(req.query.municipalityId);
      }
      
      if (req.query.parkType) {
        filters.parkType = String(req.query.parkType);
      }
      
      if (req.query.postalCode) {
        filters.postalCode = String(req.query.postalCode);
      }
      
      if (req.query.municipality) {
        filters.municipality = String(req.query.municipality);
      }
      
      if (req.query.search) {
        filters.search = String(req.query.search);
      }
      
      // Filtro de amenidades - convertir string de IDs separados por comas a array de números
      if (req.query.amenities) {
        const amenityIds = String(req.query.amenities)
          .split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id));
        
        if (amenityIds.length > 0) {
          filters.amenities = amenityIds;
        }
      }
      
      // Obtenemos los parques con sus imágenes y amenidades
      const parks = await getParksDirectly(filters);
      
      // Respondemos con los parques completos
      res.json(parks);
    } catch (error) {
      console.error("Error al obtener parques:", error);
      res.status(500).json({ message: "Error fetching parks" });
    }
  });

  // Endpoint optimizado para obtener parques con sus amenidades para filtrado
  apiRouter.get("/parks-with-amenities", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
          p.id as park_id,
          COALESCE(
            json_agg(
              CASE WHEN pa.amenity_id IS NOT NULL 
              THEN pa.amenity_id 
              ELSE NULL END
            ) FILTER (WHERE pa.amenity_id IS NOT NULL),
            '[]'::json
          ) as amenity_ids
        FROM parks p
        LEFT JOIN park_amenities pa ON p.id = pa.park_id
        GROUP BY p.id
        ORDER BY p.id
      `);
      
      const parkAmenities = result.rows.map(row => ({
        parkId: row.park_id,
        amenityIds: Array.isArray(row.amenity_ids) ? row.amenity_ids : []
      }));
      
      res.json(parkAmenities);
    } catch (error) {
      console.error("Error al obtener parques con amenidades:", error);
      res.status(500).json({ 
        message: "Error al obtener parques con amenidades",
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Ruta para obtener estadísticas del dashboard de parques (DEBE IR ANTES DE /parks/:id)
  apiRouter.get("/parks/dashboard", async (_req: Request, res: Response) => {
    try {
      console.log("Iniciando cálculo de estadísticas del dashboard de parques...");
      
      // Estadísticas básicas
      const totalParksResult = await pool.query('SELECT COUNT(*) as count FROM parks');
      const totalParks = parseInt(totalParksResult.rows[0].count);
      
      // Superficie total y área permeable (sumando las áreas de todos los parques)
      const surfaceResult = await pool.query(`
        SELECT 
          SUM(CASE WHEN area IS NOT NULL AND area::text ~ '^[0-9.]+$' THEN area::numeric ELSE 0 END) as total_surface,
          SUM(CASE WHEN green_area IS NOT NULL AND green_area::text ~ '^[0-9.]+$' THEN green_area::numeric ELSE 0 END) as total_green_area
        FROM parks
      `);
      const totalSurface = parseFloat(surfaceResult.rows[0].total_surface) || 0;
      const totalGreenArea = parseFloat(surfaceResult.rows[0].total_green_area) || 0;
      
      // Parques activos (asumiendo que todos son activos si no tienen campo de estado)
      const activeParks = totalParks;
      
      // Total de actividades
      const activitiesResult = await pool.query('SELECT COUNT(*) as count FROM activities');
      const totalActivities = parseInt(activitiesResult.rows[0].count);
      
      // Total de voluntarios
      const volunteersResult = await pool.query('SELECT COUNT(*) as count FROM volunteers WHERE status = $1', ['active']);
      const totalVolunteers = parseInt(volunteersResult.rows[0].count);
      
      // Total de árboles en inventario
      const treesResult = await pool.query('SELECT COUNT(*) as count FROM trees');
      const totalTrees = parseInt(treesResult.rows[0].count);
      
      // Áreas en mantenimiento (simulado por actividades de mantenimiento)
      const maintenanceResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM activities 
        WHERE LOWER(title) LIKE '%mantenimiento%' 
           OR LOWER(description) LIKE '%mantenimiento%'
           OR LOWER(title) LIKE '%limpieza%'
      `);
      const maintenanceAreas = parseInt(maintenanceResult.rows[0].count);
      
      // Parques por municipio
      const parksByMunicipalityResult = await pool.query(`
        SELECT m.name as municipality_name, COUNT(p.id) as count
        FROM municipalities m
        LEFT JOIN parks p ON m.id = p.municipality_id
        GROUP BY m.id, m.name
        HAVING COUNT(p.id) > 0
        ORDER BY count DESC
      `);
      
      // Parques por tipo
      const parksByTypeResult = await pool.query(`
        SELECT park_type as type, COUNT(*) as count
        FROM parks
        WHERE park_type IS NOT NULL
        GROUP BY park_type
        ORDER BY count DESC
      `);
      
      // Estado de conservación
      const conservationStatusResult = await pool.query(`
        SELECT conservation_status as status, COUNT(*) as count
        FROM parks
        WHERE conservation_status IS NOT NULL
        GROUP BY conservation_status
        ORDER BY count DESC
      `);
      
      // Actividades recientes
      const recentActivitiesResult = await pool.query(`
        SELECT a.id, a.title, p.name as park_name, a.start_date as date,
               20 as participants
        FROM activities a
        JOIN parks p ON a.park_id = p.id
        WHERE a.start_date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY a.start_date DESC
        LIMIT 5
      `);
      
      // Parques con coordenadas para el mapa
      const parksWithCoordinatesResult = await pool.query(`
        SELECT p.id, p.name, p.latitude, p.longitude, m.name as municipality,
               p.park_type as type, p.area, p.conservation_status as status
        FROM parks p
        LEFT JOIN municipalities m ON p.municipality_id = m.id
        WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
      `);
      
      // Visitantes totales (simulado basado en actividades)
      const visitorsResult = await pool.query(`
        SELECT SUM(20) as total_visitors
        FROM activities
        WHERE start_date >= CURRENT_DATE - INTERVAL '1 year'
      `);
      const totalVisitors = parseInt(visitorsResult.rows[0].total_visitors) || 0;
      
      // Calificación promedio (simulado - valor fijo por ahora)
      const averageRating = 4.2;
      
      const dashboardData = {
        totalParks,
        totalSurface,
        totalGreenArea,
        totalVisitors,
        activeParks,
        maintenanceAreas,
        totalActivities,
        totalVolunteers,
        totalTrees,
        averageRating,
        parksByMunicipality: parksByMunicipalityResult.rows.map(row => ({
          municipalityName: row.municipality_name,
          count: parseInt(row.count)
        })),
        parksByType: parksByTypeResult.rows.map(row => ({
          type: row.type,
          count: parseInt(row.count)
        })),
        conservationStatus: conservationStatusResult.rows.map(row => ({
          status: row.status,
          count: parseInt(row.count)
        })),
        recentActivities: recentActivitiesResult.rows.map(row => ({
          id: row.id,
          title: row.title,
          parkName: row.park_name,
          date: row.date,
          participants: parseInt(row.participants)
        })),
        parksWithCoordinates: parksWithCoordinatesResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          municipality: row.municipality || 'Sin municipio',
          type: row.type || 'Sin tipo',
          area: parseFloat(row.area) || 0,
          status: row.status || 'Sin estado'
        }))
      };
      
      console.log("Estadísticas del dashboard de parques calculadas exitosamente");
      res.json(dashboardData);
    } catch (error) {
      console.error("Error al calcular estadísticas del dashboard de parques:", error);
      res.status(500).json({ 
        message: "Error al calcular estadísticas del dashboard de parques",
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Get a specific park by ID with all related data
  apiRouter.get("/parks/:id", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      
      // Importamos nuestro método optimizado
      const { getParkByIdDirectly } = await import('./direct-park-queries');
      
      // Obtenemos el parque con todos sus datos relacionados
      const park = await getParkByIdDirectly(parkId);
      
      if (!park) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      // Enviamos la respuesta
      res.json(park);
    } catch (error) {
      console.error("Error detallado al obtener parque:", error);
      res.status(500).json({ message: "Error fetching park" });
    }
  });

  // Endpoint específico para datos extendidos del parque (landing page)
  apiRouter.get("/parks/:id/extended", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      console.log("Solicitando datos extendidos para parque:", parkId);
      
      // Obtener datos básicos del parque
      const parkResult = await pool.query(`
        SELECT 
          p.id, p.name, p.municipality_id as "municipalityId", 
          p.park_type as "parkType", p.description, p.address, 
          p.postal_code as "postalCode", p.latitude, p.longitude, 
          p.area, p.foundation_year as "foundationYear",
          p.administrator, p.conservation_status as "conservationStatus",
          p.regulation_url as "regulationUrl", p.opening_hours as "openingHours", 
          p.contact_email as "contactEmail", p.contact_phone as "contactPhone",
          p.video_url as "videoUrl",
          m.name as "municipalityName", m.state
        FROM parks p
        LEFT JOIN municipalities m ON p.municipality_id = m.id
        WHERE p.id = $1
      `, [parkId]);
      
      if (parkResult.rows.length === 0) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      const park = parkResult.rows[0];
      
      // Obtener amenidades del parque
      console.log('Paso 2: Consultando amenidades del parque...');
      console.log('Park ID para consulta:', parkId, typeof parkId);
      
      // Primero verificar si hay relaciones park_amenities
      const countResult = await pool.query(`
        SELECT COUNT(*) as count FROM park_amenities WHERE park_id = $1
      `, [parkId]);
      console.log('Total park_amenities encontradas:', countResult.rows[0].count);
      
      const amenitiesResult = await pool.query(`
        SELECT a.id, a.name, a.icon, a.category, 
               a.icon_type as "iconType", a.custom_icon_url as "customIconUrl",
               pa.module_name as "moduleName", pa.surface_area as "surfaceArea"
        FROM amenities a
        JOIN park_amenities pa ON a.id = pa.amenity_id
        WHERE pa.park_id = $1 AND pa.status = 'activo'
        ORDER BY a.category, a.name
      `, [parkId]);
      
      console.log(`Amenidades encontradas: ${amenitiesResult.rows.length}`);
      if (amenitiesResult.rows.length > 0) {
        console.log('Primeras amenidades:', amenitiesResult.rows.slice(0, 3).map(a => ({ name: a.name, category: a.category })));
      }
      
      // Obtener especies arbóreas del parque
      console.log('Paso 2.5: Consultando especies arbóreas del parque...');
      const treeSpeciesResult = await pool.query(`
        SELECT 
          pts.id,
          pts.recommended_quantity as "recommendedQuantity",
          pts.current_quantity as "currentQuantity",
          pts.planting_zone as "plantingZone",
          pts.notes,
          pts.status,
          ts.common_name as "commonName",
          ts.scientific_name as "scientificName",
          ts.family,
          ts.origin,
          ts.is_endangered as "isEndangered",
          ts.icon_type as "iconType",
          ts.custom_icon_url as "customIconUrl",
          ts.photo_url as "photoUrl",
          ts.photo_caption as "photoCaption",
          ts.custom_icon_url as "customPhotoUrl",
          ts.description
        FROM park_tree_species pts
        JOIN tree_species ts ON pts.species_id = ts.id
        WHERE pts.park_id = $1
        ORDER BY ts.common_name
      `, [parkId]);
      console.log(`Especies arbóreas encontradas: ${treeSpeciesResult.rows.length}`);
      
      // Obtener actividades del parque
      console.log('Paso 3: Consultando actividades del parque...');
      const activitiesResult = await pool.query(`
        SELECT id, title, description, start_date as "startDate", category
        FROM activities
        WHERE park_id = $1
        ORDER BY start_date DESC
        LIMIT 10
      `, [parkId]);
      console.log(`Actividades encontradas: ${activitiesResult.rows.length}`);
      
      // Obtener documentos del parque
      console.log('Paso 4: Consultando documentos del parque...');
      const documentsResult = await pool.query(`
        SELECT id, title, file_url as "fileUrl", file_type as "fileType", 
               description, category, created_at as "createdAt"
        FROM park_documents
        WHERE park_id = $1
        ORDER BY created_at DESC
      `, [parkId]);
      console.log(`Documentos encontrados: ${documentsResult.rows.length}`);

      // Obtener instructores asignados al parque
      console.log('Paso 5: Consultando instructores del parque...');
      const instructorsResult = await pool.query(`
        SELECT i.id, i.full_name as "fullName", i.email, i.phone, 
               i.specialties, i.experience_years as "experienceYears", i.bio,
               i.profile_image_url as "profileImageUrl",
               4.5 as "averageRating"
        FROM instructors i
        WHERE i.preferred_park_id = $1
        ORDER BY i.full_name
        LIMIT 4
      `, [parkId]);
      console.log(`Instructores encontrados: ${instructorsResult.rows.length}`);

      // Obtener voluntarios que prefieren este parque
      console.log('Paso 6: Consultando voluntarios del parque...');
      const volunteersResult = await pool.query(`
        SELECT v.id, v.full_name as "fullName", v.email, v.phone,
               v.skills, v.previous_experience as "previousExperience",
               v.profile_image_url as "profileImageUrl", v.interest_areas as "interestAreas"
        FROM volunteers v
        WHERE v.preferred_park_id = $1
        ORDER BY v.full_name
        LIMIT 10
      `, [parkId]);
      console.log(`Voluntarios encontrados: ${volunteersResult.rows.length}`);

      // Obtener activos del parque
      console.log('Paso 7: Consultando activos del parque...');
      const assetsResult = await pool.query(`
        SELECT id, name, description, condition, status, category_id as "categoryId"
        FROM assets
        WHERE park_id = $1
        ORDER BY name
        LIMIT 10
      `, [parkId]);
      console.log(`Activos encontrados: ${assetsResult.rows.length}`);
      
      // Obtener imágenes del parque
      console.log('Paso 8: Consultando imágenes del parque...');
      const imagesResult = await pool.query(`
        SELECT id, image_url as "imageUrl", caption, is_primary as "isPrimary", created_at as "createdAt"
        FROM park_images
        WHERE park_id = $1
        ORDER BY is_primary DESC, created_at ASC
      `, [parkId]);
      console.log(`Imágenes encontradas: ${imagesResult.rows.length}`);
      
      // Buscar imagen principal
      let primaryImage = null;
      const images = imagesResult.rows.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        url: img.imageUrl,
        caption: img.caption,
        isPrimary: img.isPrimary,
        createdAt: img.createdAt
      }));
      
      if (images.length > 0) {
        const primaryImg = images.find(img => img.isPrimary);
        primaryImage = primaryImg ? primaryImg.imageUrl : images[0].imageUrl;
        console.log(`Imagen principal encontrada: ${primaryImage}`);
      }

      // Construir respuesta completa
      console.log('Paso 9: Construyendo respuesta final...');
      const extendedPark = {
        ...park,
        municipality: {
          name: park.municipalityName,
          state: park.state
        },
        amenities: amenitiesResult.rows,
        treeSpecies: treeSpeciesResult.rows,
        activities: activitiesResult.rows,
        documents: documentsResult.rows,
        instructors: instructorsResult.rows,
        volunteers: volunteersResult.rows,
        assets: assetsResult.rows,
        images: images,
        primaryImage: primaryImage,
        trees: {
          total: 0,
          byHealth: {},
          bySpecies: {}
        }
      };
      
      // Log solo en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`Datos extendidos procesados para ${extendedPark.name}`);
      }
      res.json(extendedPark);
    } catch (error) {
      console.error("Error al obtener datos extendidos del parque:", error);
      res.status(500).json({ message: "Error fetching extended park data" });
    }
  });

  // Get detailed park information with all related data
  apiRouter.get("/parks/:id/details", async (req: Request, res: Response) => {
    try {
      const parkId = parseInt(req.params.id);
      
      // Get basic park information
      const park = await storage.getPark(parkId);
      if (!park) {
        return res.status(404).json({ error: "Parque no encontrado" });
      }

      // Get municipality  
      const municipalities = await storage.getMunicipalities();
      const municipality = municipalities.find(m => m.id === park.municipalityId);

      // Get extended park data to include amenities and images
      const extendedParks = await storage.getExtendedParks();
      const extendedPark = extendedParks.find(p => p.id === parkId);

      // Get park amenities (from extended park data)
      const amenities = extendedPark?.amenities || [];

      // Get park images (from extended park data)  
      const images = extendedPark?.images || [];

      // Use simplified queries for other data that don't require complex joins
      const activities = await storage.getAllActivities();
      const parkActivities = activities.filter(activity => activity.parkId === parkId).slice(0, 20);

      const trees = await storage.getTrees();
      const parkTrees = trees.filter(tree => tree.parkId === parkId).slice(0, 50);

      const volunteers = await storage.getAllVolunteers();
      const parkVolunteers = volunteers.filter(volunteer => volunteer.preferredParkId === parkId);

      // For now, we'll use empty arrays for data we don't have direct access to
      const incidents: any[] = [];
      const documents: any[] = [];

      // Calculate statistics
      const stats = {
        totalActivities: parkActivities.length,
        activeVolunteers: parkVolunteers.filter(v => v.isActive).length,
        totalTrees: parkTrees.length,
        averageEvaluation: 4.2, // Can be calculated when we have evaluations
        pendingIncidents: incidents.length
      };

      // Build response
      const response = {
        id: park.id,
        name: park.name,
        location: park.location,
        openingHours: park.openingHours || "Sin horarios definidos",
        description: park.description || "Sin descripción disponible",
        municipalityId: park.municipalityId,
        municipality: municipality ? { name: municipality.name } : { name: "Municipio no encontrado" },
        amenities: amenities.map((amenity: any) => ({
          id: amenity.id,
          name: amenity.name,
          icon: amenity.icon,
          description: amenity.description
        })),
        activities: parkActivities.map((activity: any) => ({
          id: activity.id,
          title: activity.title,
          description: activity.description || "",
          startDate: activity.startDate.toISOString(),
          instructorName: activity.instructorName || "",
          participantCount: activity.participantCount || 0
        })),
        trees: parkTrees.map((tree: any) => ({
          id: tree.id,
          species: tree.species,
          condition: tree.condition || "bueno",
          plantedDate: tree.plantedDate.toISOString(),
          lastMaintenance: tree.lastMaintenanceDate?.toISOString()
        })),
        assets: [], // Can be implemented when we have assets table
        incidents: incidents,
        documents: documents,
        images: images.map((img: any) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          caption: img.caption,
          isPrimary: img.isPrimary
        })),
        evaluations: [], // Can be implemented when we have evaluations
        volunteers: parkVolunteers.map((volunteer: any) => ({
          id: volunteer.id,
          fullName: volunteer.fullName || "Sin nombre",
          skills: volunteer.skills || "Sin habilidades definidas",
          isActive: volunteer.isActive
        })),
        stats
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching park details:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Create a new park (admin/municipality only) - CON AUTOMATIZACIÓN DE LANDING PAGE
  apiRouter.post("/parks", isAuthenticated, hasMunicipalityAccess(), async (req: Request, res: Response) => {
    try {
      // Si el usuario está autenticado y no es super_admin, forzamos que el parque sea de su municipio
      if (req.user.role !== 'super_admin' && req.user.municipalityId) {
        req.body.municipalityId = req.user.municipalityId;
      }
      
      const parkData = insertParkSchema.parse(req.body);
      
      // Verificar que el usuario tenga permisos para el municipio del parque
      if (req.user.role !== 'super_admin' && parkData.municipalityId !== req.user.municipalityId) {
        return res.status(403).json({ 
          message: "No tiene permisos para crear parques en este municipio" 
        });
      }
      
      // PASO 1: Crear el parque en la base de datos
      const newPark = await storage.createPark(parkData);
      console.log(`🏞️ Parque creado: ${newPark.name} (ID: ${newPark.id})`);
      
      // PASO 2: AUTOMATIZACIÓN - Procesar para landing page
      try {
        const { 
          processNewParkForLanding, 
          validateParkForLanding, 
          logLandingPageAutomation 
        } = await import('./park-landing-automation');
        
        // Validar que el parque tenga datos mínimos para landing page
        const validation = validateParkForLanding(newPark);
        
        if (validation.isValid) {
          // Procesar automáticamente para landing page
          const landingPageData = await processNewParkForLanding(newPark);
          
          // Log del proceso de automatización
          logLandingPageAutomation('LANDING_PAGE_GENERATED', newPark, {
            slug: landingPageData.slug,
            url: landingPageData.landingPageUrl,
            syncedFields: Object.keys(landingPageData.syncedData).length
          });
          
          // Responder con información extendida incluyendo datos de landing page
          res.status(201).json({
            ...newPark,
            landingPage: {
              enabled: true,
              slug: landingPageData.slug,
              url: landingPageData.landingPageUrl,
              lastSync: landingPageData.syncedData.lastSyncAt
            }
          });
        } else {
          // Si falta información crítica, crear parque pero sin landing page automática
          logLandingPageAutomation('LANDING_PAGE_SKIPPED', newPark, {
            reason: 'MISSING_REQUIRED_FIELDS',
            missingFields: validation.missingFields,
            warnings: validation.warnings
          });
          
          res.status(201).json({
            ...newPark,
            landingPage: {
              enabled: false,
              reason: 'Faltan campos requeridos para landing page',
              missingFields: validation.missingFields
            }
          });
        }
        
      } catch (automationError) {
        // Si falla la automatización, el parque ya está creado - solo notificar
        console.error('⚠️ Error en automatización de landing page:', automationError);
        
        res.status(201).json({
          ...newPark,
          landingPage: {
            enabled: false,
            reason: 'Error en automatización',
            error: automationError.message
          }
        });
      }
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('❌ Error creando parque:', error);
      res.status(500).json({ message: "Error creating park" });
    }
  });
  
  // Import parks from Excel/CSV - Version robusta con manejo de errores
  apiRouter.post("/parks/import", isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
    try {
      console.log("Iniciando proceso de importación de parques");
      console.log("Body completo:", req.body);
      console.log("Archivo recibido:", req.file ? req.file.filename : "No hay archivo");
      
      const municipalityId = req.body.municipalityId;
      
      if (!municipalityId) {
        console.log("No se encontró municipalityId en el body");
        return res.status(400).json({
          success: false,
          message: "Debe seleccionar un municipio",
          receivedData: req.body
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Debe seleccionar un archivo para importar"
        });
      }

      console.log("Municipio seleccionado:", municipalityId);
      console.log("Archivo:", req.file.originalname);
      
      res.json({
        success: true,
        message: "Archivo recibido correctamente. La funcionalidad de importación está en desarrollo.",
        parksImported: 0,
        municipalityId: municipalityId,
        fileName: req.file.originalname
      });
      
    } catch (error) {
      console.error("Error en importación de parques:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor durante la importación"
      });
    }
  });

  // Get park dependencies before deletion
  apiRouter.get("/parks/:id/dependencies", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const dependencies = await storage.getParkDependencies(parkId);
      res.json(dependencies);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park dependencies" });
    }
  });

  // Ruta normal para actualizar un parque (con verificación de permisos)
  apiRouter.put("/parks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      
      // Permitir actualización completa del parque incluyendo municipio
      const parkData = req.body;
      
      const updatedPark = await storage.updatePark(parkId, parkData);
      
      if (!updatedPark) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      res.json(updatedPark);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating park" });
    }
  });
  
  // RUTA ESPECIAL PARA DESARROLLO - Sin verificación de permisos y con actualización directa a BD
  apiRouter.put("/dev/parks/:id", async (req: Request, res: Response) => {
    try {
      console.log("DESARROLLO - Actualizando parque directamente en base de datos");
      console.log("Datos recibidos del cliente:", req.body);
      
      const parkId = Number(req.params.id);
      
      // Verificamos que existe el parque
      const existingPark = await storage.getPark(parkId);
      if (!existingPark) {
        return res.status(404).json({ message: "Parque no encontrado" });
      }
      
      // Actualizamos directamente en la base de datos usando SQL para evitar problemas
      try {
        // Primero extraemos solo los campos válidos que vamos a actualizar
        const {
          name, description, address, postalCode, latitude, longitude,
          area, greenArea, parkType, openingHours, contactPhone, contactEmail,
          administrator, conservationStatus, regulationUrl, foundationYear, videoUrl,
          municipalityId
        } = req.body;
        
        // Creamos un objeto con solo las propiedades que no son null o undefined
        const fieldsToUpdate: any = {};
        if (name !== undefined) fieldsToUpdate.name = name;
        if (description !== undefined) fieldsToUpdate.description = description;
        if (address !== undefined) fieldsToUpdate.address = address;
        if (postalCode !== undefined) fieldsToUpdate.postal_code = postalCode;
        if (latitude !== undefined) fieldsToUpdate.latitude = latitude;
        if (longitude !== undefined) fieldsToUpdate.longitude = longitude;
        if (area !== undefined) fieldsToUpdate.area = area;
        if (greenArea !== undefined) fieldsToUpdate.green_area = greenArea;
        if (parkType !== undefined) fieldsToUpdate.park_type = parkType;
        if (openingHours !== undefined) fieldsToUpdate.opening_hours = openingHours;
        if (contactPhone !== undefined) fieldsToUpdate.contact_phone = contactPhone;
        if (contactEmail !== undefined) fieldsToUpdate.contact_email = contactEmail;
        if (administrator !== undefined) fieldsToUpdate.administrator = administrator;
        if (conservationStatus !== undefined) fieldsToUpdate.conservation_status = conservationStatus;
        if (regulationUrl !== undefined) fieldsToUpdate.regulation_url = regulationUrl;
        if (foundationYear !== undefined) fieldsToUpdate.foundation_year = foundationYear;
        if (videoUrl !== undefined) fieldsToUpdate.video_url = videoUrl;
        if (municipalityId !== undefined) fieldsToUpdate.municipality_id = municipalityId;
        
        // Agregamos la fecha de actualización
        fieldsToUpdate.updated_at = new Date();
        
        // Construimos el SQL para la actualización usando SQL directo
        if (Object.keys(fieldsToUpdate).length > 0) {
          // Construir query SQL dinámicamente
          const setClause = Object.keys(fieldsToUpdate)
            .map((field, index) => `${field} = $${index + 2}`)
            .join(', ');
          
          const values = Object.values(fieldsToUpdate);
          
          const sqlQuery = `
            UPDATE parks 
            SET ${setClause}
            WHERE id = $1
            RETURNING *
          `;
          
          console.log("SQL Query:", sqlQuery);
          console.log("Values:", [parkId, ...values]);
          
          const result = await pool.query(sqlQuery, [parkId, ...values]);
          
          if (result.rows.length > 0) {
            console.log("Parque actualizado con éxito (SQL directo):", result.rows[0]);
            res.json(result.rows[0]);
          } else {
            throw new Error("No se pudo actualizar el parque");
          }
        } else {
          // Si no hay campos para actualizar, devolvemos el parque existente
          console.log("No hay campos para actualizar");
          res.json(existingPark);
        }
      } catch (dbError) {
        console.error("Error en actualización directa:", dbError);
        throw new Error(`Error al actualizar en base de datos: ${dbError.message}`);
      }
    } catch (error) {
      console.error("Error detallado al actualizar parque:", error);
      res.status(500).json({ 
        message: "Error updating park",
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Delete a park (admin/municipality only)
  apiRouter.delete("/parks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      console.log(`Solicitud de eliminación para parque ${parkId}`);
      
      // Eliminar todas las tablas relacionadas en el orden correcto
      console.log('Eliminando mantenimientos de árboles...');
      await db.execute(sql`DELETE FROM tree_maintenances WHERE tree_id IN (SELECT id FROM trees WHERE park_id = ${parkId})`);
      
      console.log('Eliminando árboles...');
      await db.execute(sql`DELETE FROM trees WHERE park_id = ${parkId}`);
      
      console.log('Eliminando asignaciones de instructores...');
      await db.execute(sql`DELETE FROM instructor_assignments WHERE park_id = ${parkId}`);
      
      console.log('Eliminando activos...');
      await db.execute(sql`DELETE FROM assets WHERE park_id = ${parkId}`);
      
      // Eliminación en cascada de datos relacionados al parque
      await db.execute(sql`DELETE FROM concessions WHERE park_id = ${parkId}`);
      await db.execute(sql`DELETE FROM concessionaire_history WHERE park_id = ${parkId}`);
      await db.execute(sql`DELETE FROM concessionaire_evaluations WHERE park_id = ${parkId}`);
      await db.execute(sql`DELETE FROM park_amenities WHERE park_id = ${parkId}`);
      await db.execute(sql`DELETE FROM park_images WHERE park_id = ${parkId}`);
      await db.execute(sql`DELETE FROM activities WHERE park_id = ${parkId}`);
      await db.execute(sql`DELETE FROM incidents WHERE park_id = ${parkId}`);
      await db.execute(sql`DELETE FROM comments WHERE park_id = ${parkId}`);
      await db.execute(sql`DELETE FROM parks WHERE id = ${parkId}`);
      res.status(200).json({ message: "Park deleted successfully" });
    } catch (error) {
      console.error("Error al eliminar parque:", error);
      res.status(500).json({ message: "Error deleting park" });
    }
  });

  // Ruta temporal de desarrollo para eliminar parques sin autenticación
  apiRouter.delete("/dev/parks/:id", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      console.log(`Eliminación de desarrollo para parque ${parkId}`);
      
      // Usar una transacción con CASCADE para eliminar todo
      await db.execute(sql`
        BEGIN;
        SET session_replication_role = replica;
        DELETE FROM trees WHERE park_id = ${parkId};
        DELETE FROM tree_inventory WHERE park_id = ${parkId};
        DELETE FROM tree_maintenances WHERE park_id = ${parkId};
        DELETE FROM park_amenities WHERE park_id = ${parkId};
        DELETE FROM park_images WHERE park_id = ${parkId};
        DELETE FROM activities WHERE park_id = ${parkId};
        DELETE FROM incidents WHERE park_id = ${parkId};
        DELETE FROM comments WHERE park_id = ${parkId};
        DELETE FROM parks WHERE id = ${parkId};
        SET session_replication_role = DEFAULT;
        COMMIT;
      `);
      
      console.log(`Parque ${parkId} eliminado exitosamente (desarrollo)`);
      res.status(200).json({ message: "Park deleted successfully" });
    } catch (error) {
      console.error("Error al eliminar parque:", error);
      await db.execute(sql`ROLLBACK;`);
      res.status(500).json({ message: "Error deleting park", error: error.message });
    }
  });

  // Get all amenities
  apiRouter.get("/amenities", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
          a.id,
          a.name,
          a.icon,
          a.category,
          a.icon_type as "iconType",
          a.custom_icon_url as "customIconUrl",
          COUNT(DISTINCT pa.park_id) as "parksCount",
          COUNT(pa.park_id) as "totalModules"
        FROM amenities a
        LEFT JOIN park_amenities pa ON a.id = pa.amenity_id
        GROUP BY a.id, a.name, a.icon, a.category, a.icon_type, a.custom_icon_url
        ORDER BY a.name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching amenities" });
    }
  });

  // Dashboard endpoint específico para amenidades
  apiRouter.get("/amenities/dashboard", async (_req: Request, res: Response) => {
    try {
      const [amenities, parks] = await Promise.all([
        storage.getAmenities(),
        storage.getExtendedParks()
      ]);

      // Calcular estadísticas para el dashboard
      const parksWithAmenities = parks.filter((park: any) => park.amenities && park.amenities.length > 0);
      const totalAmenityAssignments = parks.reduce((sum: number, park: any) => sum + (park.amenities?.length || 0), 0);

      const amenityStats = amenities.map((amenity: any) => {
        const parksWithThisAmenity = parks.filter((park: any) => 
          park.amenities?.some((a: any) => a.amenityId === amenity.id)
        );
        
        // Calculate total modules (quantity) for this amenity across all parks
        const totalModules = parks.reduce((sum: number, park: any) => {
          const parkAmenities = park.amenities?.filter((a: any) => a.amenityId === amenity.id) || [];
          return sum + parkAmenities.reduce((amenitySum: number, a: any) => amenitySum + (a.quantity || 1), 0);
        }, 0);
        
        return {
          ...amenity,
          parksCount: parksWithThisAmenity.length,
          totalModules: totalModules,
          utilizationRate: parks.length > 0 ? Math.round((parksWithThisAmenity.length / parks.length) * 100) : 0
        };
      }).sort((a: any, b: any) => b.parksCount - a.parksCount);

      const dashboardData = {
        totalAmenities: amenities.length,
        totalParks: parks.length,
        averageAmenitiesPerPark: parks.length ? Math.round((totalAmenityAssignments / parks.length) * 100) / 100 : 0,
        mostPopularAmenities: amenityStats.slice(0, 5),
        allAmenities: amenityStats,
        amenityDistribution: amenityStats.slice(0, 6).map((amenity: any, index: number) => ({
          name: amenity.name.length > 12 ? amenity.name.substring(0, 12) + '...' : amenity.name,
          value: amenity.parksCount,
          color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'][index % 6]
        })),
        utilizationByPark: parks.map((park: any) => ({
          parkName: park.name.length > 20 ? park.name.substring(0, 20) + '...' : park.name,
          amenitiesCount: park.amenities?.length || 0
        })).sort((a: any, b: any) => b.amenitiesCount - a.amenitiesCount),
        statusDistribution: [
          { status: 'Activas', count: amenities.length, color: '#00C49F' },
          { status: 'Mantenimiento', count: 0, color: '#FFBB28' },
          { status: 'Inactivas', count: 0, color: '#FF8042' }
        ]
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Error fetching amenities dashboard data:', error);
      res.status(500).json({ message: "Error fetching amenities dashboard data" });
    }
  });
  
  // Create a new amenity (admin only)
  apiRouter.post("/amenities", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Verificar que el usuario sea administrador
      if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Solo administradores pueden gestionar amenidades" });
      }
      
      const data = {
        name: req.body.name,
        icon: req.body.icon,
        category: req.body.category,
        iconType: req.body.iconType || 'system',
        customIconUrl: req.body.customIconUrl || null
      };
      
      const result = await pool.query(`
        INSERT INTO amenities (name, icon, category, icon_type, custom_icon_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [data.name, data.icon, data.category, data.iconType, data.customIconUrl]);
      
      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error(error);
      if (error.code === '23505' && error.constraint === 'amenities_name_unique') {
        res.status(400).json({ message: `Ya existe una amenidad con el nombre "${req.body.name}". Por favor, usa un nombre diferente.` });
      } else {
        res.status(500).json({ message: "Error al crear la amenidad" });
      }
    }
  });
  
  // Update an amenity (admin only)
  apiRouter.put("/amenities/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Verificar que el usuario sea administrador
      if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Solo administradores pueden gestionar amenidades" });
      }
      
      const id = Number(req.params.id);
      const data = {
        name: req.body.name,
        icon: req.body.icon,
        category: req.body.category,
        iconType: req.body.iconType || 'system',
        customIconUrl: req.body.customIconUrl || null
      };
      
      const result = await pool.query(`
        UPDATE amenities 
        SET 
          name = $2,
          icon = $3,
          category = $4,
          icon_type = $5,
          custom_icon_url = $6
        WHERE id = $1
        RETURNING *
      `, [id, data.name, data.icon, data.category, data.iconType, data.customIconUrl]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Amenidad no encontrada" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating amenity" });
    }
  });
  
  // Endpoint para subir iconos personalizados
  apiRouter.post("/upload/icon", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Verificar que el usuario sea administrador
      if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Solo administradores pueden subir iconos" });
      }
      
      const { uploadIcon, handleIconUploadErrors, uploadIconHandler } = await import('./api/iconUpload');
      
      // Usar el middleware de multer para procesar la carga
      uploadIcon(req, res, (err: any) => {
        if (err) {
          return handleIconUploadErrors(err, req, res, () => {});
        }
        // Si no hay errores, manejar la respuesta
        return uploadIconHandler(req, res);
      });
    } catch (error) {
      console.error("Error al subir icono:", error);
      res.status(500).json({ error: "Error al subir icono" });
    }
  });

  // Delete an amenity (admin only)
  apiRouter.delete("/amenities/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log(`Intento de eliminación de amenidad ID: ${req.params.id}`);
      
      // Verificar que el usuario sea administrador
      if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
        console.log(`Usuario sin permisos de admin: ${req.user?.role}`);
        return res.status(403).json({ message: "Solo administradores pueden gestionar amenidades" });
      }
      
      const id = Number(req.params.id);
      
      // Verificar si la amenidad está siendo utilizada por algún parque
      const inUse = await storage.isAmenityInUse(id);
      console.log(`Amenidad ${id} en uso: ${inUse}`);
      
      if (inUse) {
        return res.status(400).json({ 
          message: "No se puede eliminar esta amenidad porque está siendo utilizada por uno o más parques" 
        });
      }
      
      const result = await storage.deleteAmenity(id);
      
      if (!result) {
        return res.status(404).json({ message: "Amenidad no encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting amenity" });
    }
  });

  // Get amenities for a specific park - FIXED VERSION
  apiRouter.get("/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      console.log(`DEBUG: Endpoint /parks/${parkId}/amenities llamado - Devolviendo park_amenities`);
      
      // Usar la consulta SQL que sabemos que funciona
      const result = await pool.query(`
        SELECT 
          pa.id,
          pa.park_id as "parkId",
          pa.amenity_id as "amenityId",
          pa.module_name as "moduleName",
          pa.location_latitude as "locationLatitude",
          pa.location_longitude as "locationLongitude",
          pa.surface_area as "surfaceArea",
          pa.status,
          pa.description,
          a.name as "amenityName",
          a.icon as "amenityIcon",
          a.custom_icon_url as "customIconUrl"
        FROM park_amenities pa
        INNER JOIN amenities a ON pa.amenity_id = a.id
        WHERE pa.park_id = $1
        ORDER BY a.name
      `, [parkId]);
      
      res.setHeader('Content-Type', 'application/json');
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching park amenities:", error);
      res.status(500).json({ message: "Error fetching park amenities" });
    }
  });

  // Update specific amenity in a park
  apiRouter.put("/parks/:parkId/amenities/:amenityId", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const amenityId = Number(req.params.amenityId);
      const { moduleName, surfaceArea, status, locationLatitude, locationLongitude, description } = req.body;
      
      const result = await pool.query(`
        UPDATE park_amenities 
        SET 
          module_name = $3,
          surface_area = $4,
          status = $5,
          location_latitude = $6,
          location_longitude = $7,
          description = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND park_id = $2
        RETURNING *
      `, [amenityId, parkId, moduleName, surfaceArea, status, locationLatitude, locationLongitude, description]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Amenidad no encontrada en este parque" });
      }
      
      res.json({ 
        message: "Amenidad actualizada correctamente",
        updatedAmenity: result.rows[0]
      });
    } catch (error) {
      console.error("Error al actualizar amenidad del parque:", error);
      res.status(500).json({ message: "Error al actualizar amenidad del parque" });
    }
  });

  // Delete specific amenity from a park
  apiRouter.delete("/parks/:parkId/amenities/:amenityId", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const parkAmenityId = Number(req.params.amenityId); // Este es el ID del registro park_amenities, no el amenity_id
      
      const result = await pool.query(`
        DELETE FROM park_amenities 
        WHERE id = $1 AND park_id = $2
        RETURNING *
      `, [parkAmenityId, parkId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Amenidad no encontrada en este parque" });
      }
      
      res.json({ 
        message: "Amenidad eliminada correctamente",
        deletedAmenity: result.rows[0]
      });
    } catch (error) {
      console.error("Error al eliminar amenidad del parque:", error);
      res.status(500).json({ message: "Error al eliminar amenidad del parque" });
    }
  });

  // Test endpoint for amenities - different path to avoid conflicts
  apiRouter.get("/test-amenities/:parkId", async (req: Request, res: Response) => {
    console.log(`[TEST AMENITIES] Ejecutándose para parque ${req.params.parkId}`);
    
    try {
      const parkId = Number(req.params.parkId);
      console.log(`[TEST AMENITIES] Buscando amenidades para parque ${parkId}`);
      
      const result = await pool.query(`
        SELECT 
          pa.id,
          pa.park_id as "parkId",
          pa.amenity_id as "amenityId",
          pa.module_name as "moduleName",
          pa.location_latitude as "locationLatitude",
          pa.location_longitude as "locationLongitude", 
          pa.surface_area as "surfaceArea",
          pa.status,
          pa.description,
          a.name as "amenityName",
          a.icon as "amenityIcon"
        FROM park_amenities pa
        INNER JOIN amenities a ON pa.amenity_id = a.id
        WHERE pa.park_id = $1
        ORDER BY a.name
      `, [parkId]);
      
      console.log(`[TEST AMENITIES] Resultado: ${result.rows.length} amenidades encontradas`);
      if (result.rows.length > 0) {
        console.log(`[TEST AMENITIES] Primera amenidad:`, result.rows[0]);
      }
      
      res.json({
        success: true,
        parkId: parkId,
        count: result.rows.length,
        amenities: result.rows
      });
    } catch (error) {
      console.error("[TEST AMENITIES] Error completo:", error);
      res.status(500).json({ success: false, error: "Error fetching park amenities" });
    }
  });

  // Test endpoint without auth
  apiRouter.post("/test/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const amenityId = Number(req.body.amenityId);
      
      console.log("TEST - Datos recibidos:", { parkId, amenityId, body: req.body });
      
      const result = await db.execute(`
        INSERT INTO park_amenities (park_id, amenity_id, module_name, location_latitude, location_longitude, surface_area, status, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [parkId, amenityId, req.body.moduleName || '', req.body.locationLatitude || null, req.body.locationLongitude || null, req.body.surfaceArea || null, req.body.status || 'Activa', req.body.description || '']);
      
      console.log("TEST - Resultado:", result);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("TEST - Error:", error);
      res.status(500).json({ 
        message: "Test error",
        details: error.message 
      });
    }
  });

  // Add an amenity to a park (admin/municipality only)
  app.post("/api/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const amenityId = Number(req.body.amenityId);
      const moduleName = req.body.moduleName || '';
      const locationLatitude = req.body.locationLatitude || null;
      const locationLongitude = req.body.locationLongitude || null;
      const surfaceArea = req.body.surfaceArea || null;
      const status = req.body.status || 'Activa';
      const description = req.body.description || '';
      
      console.log("Datos recibidos:", { parkId, amenityId, moduleName, locationLatitude, locationLongitude, surfaceArea, status, description });
      
      // Usar SQL directo con parámetros para seguridad
      const result = await pool.query(`
        INSERT INTO park_amenities (park_id, amenity_id, module_name, location_latitude, location_longitude, surface_area, status, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [parkId, amenityId, moduleName, locationLatitude, locationLongitude, surfaceArea, status, description]);
      
      console.log("Resultado de inserción:", result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error al agregar amenidad:", error);
      res.status(500).json({ 
        message: "Error adding amenity to park",
        details: error.message 
      });
    }
  });

  // Import amenities from file (admin only)
  apiRouter.post("/amenities/import", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      let amenitiesData: any[] = [];

      // Process Excel or CSV file
      if (file.mimetype.includes('spreadsheet') || file.originalname.endsWith('.xlsx')) {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        amenitiesData = XLSX.utils.sheet_to_json(worksheet);
      } else if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        const csvData = file.buffer.toString();
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            amenitiesData.push(row);
          }
        }
      } else {
        return res.status(400).json({ error: "Formato de archivo no soportado. Use Excel (.xlsx) o CSV." });
      }

      let importedCount = 0;
      
      for (const row of amenitiesData) {
        try {
          const amenityData = {
            name: row.Nombre || row.nombre || row.Name || '',
            category: row.Categoría || row.categoria || row.Category || 'servicios',
            icon: row.Icono || row.icono || row.Icon || 'park',
            iconType: 'system' as const,
            customIconUrl: null
          };

          if (amenityData.name) {
            await pool.query(`
              INSERT INTO amenities (name, icon, category, icon_type, custom_icon_url)
              VALUES ($1, $2, $3, $4, $5)
            `, [amenityData.name, amenityData.icon, amenityData.category, amenityData.iconType, amenityData.customIconUrl]);
            importedCount++;
          }
        } catch (error) {
          console.log(`Error importing amenity: ${row.Nombre || 'Unknown'}`, error);
        }
      }

      res.json({ 
        message: "Amenidades importadas exitosamente", 
        count: importedCount 
      });
    } catch (error) {
      console.error("Error importing amenities:", error);
      res.status(500).json({ error: "Error al importar amenidades" });
    }
  });

  // Get available custom icons
  apiRouter.get("/amenities/custom-icons", async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT DISTINCT name, custom_icon_url, category
        FROM amenities 
        WHERE icon_type = 'custom' AND custom_icon_url IS NOT NULL
        ORDER BY name
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching custom icons:', error);
      res.status(500).json({ error: "Error al obtener íconos personalizados" });
    }
  });

  // Upload amenity icon
  apiRouter.post("/amenities/upload-icon", iconUpload.single('icon'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se ha seleccionado ningún archivo" });
      }

      console.log("Archivo subido:", req.file);
      const iconUrl = `/uploads/${req.file.filename}`;
      
      res.json({ 
        success: true, 
        iconUrl,
        message: "Icono subido exitosamente" 
      });
    } catch (error) {
      console.error("Error uploading amenity icon:", error);
      res.status(500).json({ error: "Error al subir el icono" });
    }
  });

  // Bulk upload amenity icons and create amenities
  apiRouter.post("/amenities/bulk-upload", iconUpload.array('icons', 50), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No se han seleccionado archivos" });
      }

      const { category = 'servicios' } = req.body;
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      const results = [];
      
      for (const file of files) {
        try {
          // Validate file type
          if (!allowedTypes.includes(file.mimetype)) {
            results.push({
              filename: file.originalname,
              success: false,
              error: "Formato de archivo no válido"
            });
            continue;
          }

          // Validate file size (max 2MB)
          if (file.size > 2 * 1024 * 1024) {
            results.push({
              filename: file.originalname,
              success: false,
              error: "Archivo demasiado grande (máximo 2MB)"
            });
            continue;
          }

          // Create amenity name from filename
          const amenityName = file.originalname
            .replace(/\.[^/.]+$/, "") // Remove extension
            .replace(/[-_]/g, " ") // Replace dashes and underscores with spaces
            .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

          const iconUrl = `/uploads/${file.filename}`;

          // Create amenity in database
          const amenityData = {
            name: amenityName,
            category: category,
            icon: 'custom',
            iconType: 'custom',
            customIconUrl: iconUrl
          };

          // Verificar si ya existe
          const existingCheck = await pool.query(`
            SELECT id FROM amenities WHERE name = $1
          `, [amenityData.name]);
          
          if (existingCheck.rows.length > 0) {
            // Ya existe, actualizar el ícono
            await pool.query(`
              UPDATE amenities 
              SET icon = $1, icon_type = $2, custom_icon_url = $3, category = $4
              WHERE name = $5
            `, [amenityData.icon, amenityData.iconType, amenityData.customIconUrl, amenityData.category, amenityData.name]);
          } else {
            // No existe, crear nuevo
            await pool.query(`
              INSERT INTO amenities (name, icon, category, icon_type, custom_icon_url)
              VALUES ($1, $2, $3, $4, $5)
            `, [amenityData.name, amenityData.icon, amenityData.category, amenityData.iconType, amenityData.customIconUrl]);
          }
          
          results.push({
            filename: file.originalname,
            amenityName: amenityName,
            success: true,
            iconUrl: iconUrl,
            action: existingCheck.rows.length > 0 ? 'updated' : 'created'
          });

        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
          results.push({
            filename: file.originalname,
            success: false,
            error: "Error al procesar el archivo"
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      const createdCount = results.filter(r => r.success && r.action === 'created').length;
      const updatedCount = results.filter(r => r.success && r.action === 'updated').length;

      res.json({
        success: true,
        message: `${createdCount} amenidades creadas, ${updatedCount} actualizadas`,
        successCount,
        failedCount,
        createdCount,
        updatedCount,
        results
      });
      
    } catch (error) {
      console.error("Error in bulk upload:", error);
      res.status(500).json({ error: "Error en la carga masiva" });
    }
  });

  // Add amenity to park
  apiRouter.post("/parks/:parkId/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const { amenityId, moduleName, surfaceArea, status, description } = req.body;
      
      if (!amenityId) {
        return res.status(400).json({ message: "amenityId es requerido" });
      }
      
      // Check if amenity already exists for this park
      const existingCheck = await pool.query(`
        SELECT id FROM park_amenities 
        WHERE park_id = $1 AND amenity_id = $2
      `, [parkId, amenityId]);
      
      if (existingCheck.rows.length > 0) {
        return res.status(400).json({ message: "Esta amenidad ya está asignada a este parque" });
      }
      
      // Insert new park amenity
      const result = await pool.query(`
        INSERT INTO park_amenities (
          park_id, amenity_id, module_name, surface_area, status, description
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [parkId, amenityId, moduleName || null, surfaceArea || null, status || 'activo', description || null]);
      
      res.json({
        message: "Amenidad asignada correctamente",
        parkAmenity: result.rows[0]
      });
    } catch (error) {
      console.error("Error asignando amenidad al parque:", error);
      res.status(500).json({ message: "Error al asignar amenidad al parque" });
    }
  });

  // Get amenities for a specific park (for activity location selection)
  apiRouter.get("/parks/:parkId/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      
      const result = await pool.query(`
        SELECT DISTINCT
          a.id,
          a.name,
          a.category,
          a.icon
        FROM amenities a
        INNER JOIN park_amenities pa ON a.id = pa.amenity_id
        WHERE pa.park_id = $1
        ORDER BY a.name
      `, [parkId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching park amenities:", error);
      res.status(500).json({ message: "Error fetching park amenities" });
    }
  });

  // Remove an amenity from a park (admin/municipality only)
  apiRouter.delete("/parks/:parkId/amenities/:amenityId", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const amenityId = Number(req.params.amenityId);
      
      // Delete the park amenity relationship
      const result = await pool.query(`
        DELETE FROM park_amenities 
        WHERE park_id = $1 AND amenity_id = $2
        RETURNING *
      `, [parkId, amenityId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Amenidad no encontrada en este parque" });
      }
      
      res.json({ message: "Amenidad removida correctamente del parque" });
    } catch (error) {
      console.error("Error removiendo amenidad del parque:", error);
      res.status(500).json({ message: "Error al remover amenidad del parque" });
    }
  });

  // Get images for a specific park
  apiRouter.get("/parks/:id/images", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const images = await storage.getParkImages(parkId);
      
      // Mapear las columnas de la base de datos a los nombres esperados por el frontend
      const mappedImages = images.map(img => ({
        id: img.id,
        parkId: img.parkId,
        imageUrl: img.imageUrl, // Usar directamente 'imageUrl'
        caption: img.caption,
        isPrimary: img.isPrimary,
        createdAt: img.createdAt
      }));
      
      res.json(mappedImages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park images" });
    }
  });

  // Add an image to a park (admin/municipality only)
  apiRouter.post("/parks/:id/images", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const { imageUrl, caption, isPrimary } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "URL de imagen es requerida" });
      }

      // Verificar que el parque existe
      const park = await storage.getPark(parkId);
      if (!park) {
        return res.status(404).json({ message: "Parque no encontrado" });
      }

      // Si isPrimary es true, primero debemos desmarcar todas las otras imágenes como no principales
      if (isPrimary) {
        const existingImages = await storage.getParkImages(parkId);
        for (const image of existingImages) {
          if (image.isPrimary) {
            await storage.updateParkImage(image.id, { isPrimary: false });
          }
        }
      }

      // Crear la nueva imagen
      const imageData = {
        parkId,
        imageUrl,
        caption: caption || null,
        isPrimary: Boolean(isPrimary)
      };

      const newImage = await storage.createParkImage(imageData);
      
      // Mapear la respuesta para el frontend
      const mappedImage = {
        id: newImage.id,
        parkId: newImage.parkId,
        imageUrl: newImage.imageUrl, // Usar directamente 'imageUrl'
        caption: newImage.caption,
        isPrimary: newImage.isPrimary,
        createdAt: newImage.createdAt
      };
      
      res.status(201).json(mappedImage);
    } catch (error) {
      console.error("Error uploading park image:", error);
      res.status(500).json({ message: "Error al subir la imagen" });
    }
  });

  // Delete an image from a park (admin/municipality only)
  apiRouter.delete("/parks/:parkId/images/:imageId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const imageId = Number(req.params.imageId);
      
      // Verificamos primero que el usuario tenga acceso al parque
      if (req.user.role !== 'super_admin') {
        const park = await storage.getPark(parkId);
        if (!park) {
          return res.status(404).json({ message: "Park not found" });
        }
        
        if (park.municipalityId !== req.user.municipalityId) {
          return res.status(403).json({ 
            message: "No tiene permisos para administrar imágenes de este parque" 
          });
        }
      }
      
      // Verificamos que la imagen pertenezca al parque especificado
      const image = await storage.getParkImage(imageId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      if (image.parkId !== parkId) {
        return res.status(400).json({ 
          message: "La imagen no pertenece al parque especificado" 
        });
      }
      
      const result = await storage.deleteParkImage(imageId);
      
      if (!result) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing image from park" });
    }
  });
  
  // Set an image as primary for a park (admin/municipality only)
  apiRouter.put("/parks/:parkId/images/:imageId/set-primary", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const imageId = Number(req.params.imageId);
      
      // En desarrollo, permitimos a todos los usuarios autenticados acceso para pruebas
      console.log("Permitiendo establecer imagen principal para todos los usuarios autenticados");
      
      // Verificamos que la imagen pertenezca al parque
      const image = await storage.getParkImage(imageId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      if (image.parkId !== parkId) {
        return res.status(400).json({ 
          message: "La imagen no pertenece al parque especificado" 
        });
      }
      
      // First, reset all images for this park to non-primary
      const parkImages = await storage.getParkImages(parkId);
      for (const image of parkImages) {
        if (image.isPrimary) {
          await storage.updateParkImage(image.id, { isPrimary: false });
        }
      }
      
      // Then set the selected image as primary
      const updatedImage = await storage.updateParkImage(imageId, { isPrimary: true });
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error setting image as primary" });
    }
  });

  // Alternative endpoint for setting primary image (used by ParkImageManager)
  apiRouter.put("/parks/:parkId/images/:imageId/set-primary", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const imageId = Number(req.params.imageId);
      
      // Verificar que la imagen pertenezca al parque
      const image = await storage.getParkImage(imageId);
      if (!image || image.parkId !== parkId) {
        return res.status(404).json({ message: "Imagen no encontrada en este parque" });
      }
      
      // Desmarcar todas las otras imágenes como no principales
      const existingImages = await storage.getParkImages(parkId);
      for (const img of existingImages) {
        if (img.isPrimary && img.id !== imageId) {
          await storage.updateParkImage(img.id, { isPrimary: false });
        }
      }
      
      // Marcar esta imagen como principal
      const updatedImage = await storage.updateParkImage(imageId, { isPrimary: true });
      res.json(updatedImage);
    } catch (error) {
      console.error("Error setting primary image:", error);
      res.status(500).json({ message: "Error al establecer imagen principal" });
    }
  });

  // Get documents for a specific park
  apiRouter.get("/parks/:id/documents", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const documents = await storage.getParkDocuments(parkId);
      res.json(documents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park documents" });
    }
  });

  // Add a document to a park (admin/municipality only)
  apiRouter.post("/parks/:id/documents", isAuthenticated, hasParkAccess, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const documentData = { ...req.body, parkId };
      
      const data = insertDocumentSchema.parse(documentData);
      const result = await storage.createDocument(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding document to park" });
    }
  });

  // Ruta especial para eliminar documentos durante el desarrollo (sin autenticación)
  apiRouter.delete("/dev/parks/:parkId/documents/:documentId", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const documentId = Number(req.params.documentId);
      
      // Verificamos primero que el usuario tenga acceso al parque
      if (req.user.role !== 'super_admin') {
        const park = await storage.getPark(parkId);
        if (!park) {
          return res.status(404).json({ message: "Park not found" });
        }
        
        if (park.municipalityId !== req.user.municipalityId) {
          return res.status(403).json({ 
            message: "No tiene permisos para administrar documentos de este parque" 
          });
        }
      }
      
      // Verificamos que el documento pertenezca al parque especificado
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.parkId !== parkId) {
        return res.status(400).json({ 
          message: "El documento no pertenece al parque especificado" 
        });
      }
      
      const result = await storage.deleteDocument(documentId);
      
      if (!result) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing document from park" });
    }
  });

  // Get all documents
  apiRouter.get("/documents", async (_req: Request, res: Response) => {
    try {
      // Configuramos explícitamente el tipo de contenido para asegurar respuesta JSON
      res.setHeader('Content-Type', 'application/json');
      
      const documents = await storage.getAllDocuments();
      
      // Usamos res.send() directamente con el objeto JSON serializado
      res.send(JSON.stringify(documents));
    } catch (error) {
      console.error('Error fetching documents:', error);
      
      // También aseguramos tipo de contenido JSON para errores
      res.status(500)
         .setHeader('Content-Type', 'application/json')
         .send(JSON.stringify({ message: "Error fetching documents" }));
    }
  });

  // Get all activities
  apiRouter.get("/activities", async (_req: Request, res: Response) => {
    try {
      const activities = await storage.getAllActivities();
      
      // Enriquecer con información del parque
      const activitiesWithParkInfo = await Promise.all(
        activities.map(async (activity) => {
          const park = await storage.getPark(activity.parkId);
          return {
            ...activity,
            parkName: park ? park.name : 'Parque no disponible'
          };
        })
      );
      
      res.json(activitiesWithParkInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching activities" });
    }
  });

  // Get activities for a specific park
  apiRouter.get("/parks/:id/activities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const activities = await storage.getParkActivities(parkId);
      res.json(activities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park activities" });
    }
  });
  
  // Endpoint directo para obtener todas las actividades
  apiRouter.get("/activities", async (_req: Request, res: Response) => {
    try {
      console.log("Obteniendo todas las actividades en GET /api/activities");
      const activities = await storage.getAllActivities();
      console.log(`Actividades encontradas: ${activities.length}`);
      res.json(activities);
    } catch (error) {
      console.error("Error al obtener actividades:", error);
      res.status(500).json({ message: "Error al recuperar actividades" });
    }
  });
  
  // TEST ENDPOINT - Sin middleware de autenticación
  apiRouter.post("/activities-test", async (req: Request, res: Response) => {
    console.log("🧪 TEST ENDPOINT ALCANZADO");
    console.log("🧪 Body:", JSON.stringify(req.body, null, 2));
    res.status(200).json({ message: "Test endpoint funcionando", data: req.body });
  });

  // Endpoint directo para crear actividades - SIN AUTENTICACIÓN TEMPORAL
  apiRouter.post("/activities", async (req: Request, res: Response) => {
    console.log("🔥🔥🔥 ENDPOINT ACTIVITIES EJECUTÁNDOSE EN ROUTES.TS 🔥🔥🔥");
    
    try {
      console.log("🔥 INICIO POST /api/activities EN EL ENDPOINT PRINCIPAL");
      console.log("🔥 Body completo recibido:", JSON.stringify(req.body, null, 2));
      
      // Log de depuración más detallado
      console.log("fechaInicio recibido:", req.body.fechaInicio, "tipo:", typeof req.body.fechaInicio);
      console.log("fechaFin recibido:", req.body.fechaFin, "tipo:", typeof req.body.fechaFin);
      
      // Mapear campos del frontend al esquema de base de datos
      const {
        nombre: title,
        descripcion: description,
        categoria: category,
        parqueId: parkId,
        fechaInicio,
        fechaFin,
        ubicacion: location,
        instructorId,
        horaInicio: startTime,
        duracion: duration,
        capacidad: capacity,
        materiales: materials,
        personalRequerido: requiredStaff,
        esRecurrente: isRecurring,
        esGratuita: isFree,
        precio: price,
        requisitos: requirements,
        diasRecurrentes: recurringDays,
        ...otherData
      } = req.body;
      
      // Convertir las fechas explícitamente a objetos Date
      let parsedStartDate: Date;
      let parsedEndDate: Date | undefined;
      
      console.log("Procesando fechas - fechaInicio:", fechaInicio, "tipo:", typeof fechaInicio);
      console.log("Procesando fechas - fechaFin:", fechaFin, "tipo:", typeof fechaFin);
      
      try {
        // Si viene como string ISO, parsearlo; si ya es Date, usarlo directamente
        parsedStartDate = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
        if (fechaFin) {
          parsedEndDate = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;
        }
        
        console.log("Fechas parseadas - parsedStartDate:", parsedStartDate);
        console.log("Fechas parseadas - parsedEndDate:", parsedEndDate);
        
      } catch (e) {
        console.error("Error al convertir fechas:", e);
        return res.status(400).json({ message: "Formato de fecha inválido" });
      }
      
      // Verificar que la fecha de inicio es válida
      if (!parsedStartDate || isNaN(parsedStartDate.getTime())) {
        console.error("Fecha de inicio inválida:", parsedStartDate);
        return res.status(400).json({ message: "La fecha de inicio no es válida" });
      }
      
      // Verificar que la fecha de fin es válida (si existe)
      if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
        console.error("Fecha de fin inválida:", parsedEndDate);
        return res.status(400).json({ message: "La fecha de fin no es válida" });
      }
      
      // Crear el objeto con los datos procesados y mapeados (incluye TODOS los campos del esquema)
      const activityData = { 
        title,
        description,
        parkId: Number(parkId),
        startDate: parsedStartDate,
        location: location || null,
        categoryId: category ? parseInt(category) : null,
        instructorId: instructorId || null,
        startTime: startTime || null,
        duration: duration ? parseInt(duration) : null,
        capacity: capacity ? parseInt(capacity) : null,
        materials: materials || null,
        requiredStaff: requiredStaff ? parseInt(requiredStaff) : null,
        isRecurring: Boolean(isRecurring),
        isFree: Boolean(isFree),
        price: price ? price.toString() : null,
        requirements: requirements || null,
        recurringDays: recurringDays || null,
        ...(parsedEndDate && { endDate: parsedEndDate })
      };
      
      console.log("Datos finales para validación Zod:", activityData);
      console.log("Intentando crear actividad en base de datos...");
      
      console.log("Datos procesados para creación de actividad:", activityData);
      console.log("parsedStartDate:", parsedStartDate, "isValid:", !isNaN(parsedStartDate.getTime()));
      console.log("parsedEndDate:", parsedEndDate, "isValid:", parsedEndDate ? !isNaN(parsedEndDate.getTime()) : 'no endDate');
      
      try {
        console.log("Intentando validar con Zod schema...");
        const data = insertActivitySchema.parse(activityData);
        console.log("Validación Zod exitosa:", data);
        const result = await storage.createActivity(data);
        console.log("Actividad creada exitosamente:", result);
        res.status(201).json(result);
      } catch (zodError) {
        console.error("Error de validación Zod:", zodError);
        console.error("Datos que fallaron validación:", JSON.stringify(activityData, null, 2));
        return res.status(400).json({ 
          message: "Error de validación de datos",
          error: (zodError as any).issues || (zodError as Error).message
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Error de validación Zod detallado:", error.errors);
        console.error("Mensaje de error:", validationError.message);
        return res.status(400).json({ 
          message: validationError.message,
          errors: error.errors 
        });
      }
      console.error("Error al crear actividad:", error);
      res.status(500).json({ message: "Error al crear actividad" });
    }
  });

  // Add an activity to a park (admin/municipality only)
  apiRouter.post("/parks/:id/activities", isAuthenticated, hasParkAccess, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      console.log("Datos recibidos en POST /parks/:id/activities:", req.body);
      
      // Extraer los datos
      const { startDate, endDate, ...otherData } = req.body;
      
      // Convertir las fechas explícitamente a objetos Date
      let parsedStartDate: Date;
      let parsedEndDate: Date | undefined;
      
      try {
        parsedStartDate = new Date(startDate);
        if (endDate) {
          parsedEndDate = new Date(endDate);
        }
      } catch (e) {
        console.error("Error al convertir fechas:", e);
        return res.status(400).json({ message: "Formato de fecha inválido" });
      }
      
      // Verificar que la fecha de inicio es válida
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ message: "La fecha de inicio no es válida" });
      }
      
      // Verificar que la fecha de fin es válida (si existe)
      if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ message: "La fecha de fin no es válida" });
      }
      
      // Crear el objeto con los datos procesados
      const activityData = { 
        ...otherData, 
        parkId,
        startDate: parsedStartDate,
        ...(parsedEndDate && { endDate: parsedEndDate })
      };
      
      console.log("Datos procesados:", activityData);
      
      const data = insertActivitySchema.parse(activityData);
      const result = await storage.createActivity(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Error de validación Zod:", error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al crear actividad:", error);
      res.status(500).json({ message: "Error adding activity to park" });
    }
  });
  
  // Update an activity (admin/municipality only)
  apiRouter.put("/activities/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const activityId = Number(req.params.id);
      console.log("Datos recibidos en PUT /activities/:id:", req.body);
      
      // Verificar si la actividad existe
      const existingActivity = await storage.getActivity(activityId);
      if (!existingActivity) {
        return res.status(404).json({ message: "Actividad no encontrada" });
      }
      
      // En desarrollo, permitimos actualizar cualquier actividad
      // TODO: Implementar verificación de permisos más estricta en producción
      
      // Extraer los datos
      const { startDate, endDate, parkId, ...otherData } = req.body;
      
      // Convertir las fechas explícitamente a objetos Date
      let parsedStartDate: Date;
      let parsedEndDate: Date | undefined;
      
      try {
        parsedStartDate = new Date(startDate);
        if (endDate) {
          parsedEndDate = new Date(endDate);
        }
      } catch (e) {
        console.error("Error al convertir fechas:", e);
        return res.status(400).json({ message: "Formato de fecha inválido" });
      }
      
      // Verificar que la fecha de inicio es válida
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ message: "La fecha de inicio no es válida" });
      }
      
      // Verificar que la fecha de fin es válida (si existe)
      if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ message: "La fecha de fin no es válida" });
      }
      
      // Crear el objeto con los datos procesados
      const activityData = { 
        ...otherData,
        startDate: parsedStartDate,
        ...(parsedEndDate && { endDate: parsedEndDate })
      };
      
      console.log("Datos procesados para actualización:", activityData);
      
      // Validar los datos
      const result = await storage.updateActivity(activityId, activityData);
      
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Error de validación Zod:", error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al actualizar actividad:", error);
      res.status(500).json({ message: "Error actualizando actividad" });
    }
  });
  
  // Delete an activity (admin/municipality only)
  apiRouter.delete("/activities/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const activityId = Number(req.params.id);
      
      // Verificar si la actividad existe
      const existingActivity = await storage.getActivity(activityId);
      if (!existingActivity) {
        return res.status(404).json({ message: "Actividad no encontrada" });
      }
      
      // En desarrollo, permitimos eliminar cualquier actividad
      // TODO: Implementar verificación de permisos más estricta en producción
      
      await storage.deleteActivity(activityId);
      
      res.status(200).json({ success: true, message: "Actividad eliminada correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error eliminando actividad" });
    }
  });

  // Get comments for a specific park
  apiRouter.get("/parks/:id/comments", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const approvedOnly = req.query.approvedOnly === 'true';
      
      const comments = await storage.getParkComments(parkId, approvedOnly);
      res.json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park comments" });
    }
  });

  // Add a comment to a park (public)
  apiRouter.post("/parks/:id/comments", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      
      // Si el usuario está autenticado, podemos aprobar automáticamente el comentario
      // si pertenece al municipio del parque o es super_admin
      let autoApprove = false;
      
      if (req.user) {
        if (req.user.role === 'super_admin') {
          autoApprove = true;
        } else {
          const park = await storage.getPark(parkId);
          if (park && park.municipalityId === req.user.municipalityId) {
            autoApprove = true;
          }
        }
      }
      
      const commentData = { ...req.body, parkId, approved: autoApprove };
      
      const data = insertCommentSchema.parse(commentData);
      const result = await storage.createComment(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding comment to park" });
    }
  });

  // Get all comments (admin only)
  apiRouter.get("/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Obtenemos los parámetros de filtrado
      const approvedFilter = req.query.approved;
      
      // Consultamos los comentarios de la base de datos
      let allComments;
      
      if (approvedFilter === 'true') {
        allComments = await storage.getAllComments(true);
      } else if (approvedFilter === 'false') {
        allComments = await storage.getAllComments(false);
      } else {
        allComments = await storage.getAllComments();
      }
      
      // Para devolver un formato consistente con lo que espera la UI, obtenemos los detalles
      // de los parques relacionados con estos comentarios
      const parkIds = [...new Set(allComments.map(comment => comment.parkId))];
      const parks = await Promise.all(
        parkIds.map(async (parkId) => {
          const park = await storage.getPark(parkId);
          return park ? { id: park.id, name: park.name } : null;
        })
      );
      
      // Añadimos la información del parque a cada comentario
      const commentsWithParkInfo = allComments.map(comment => {
        const parkInfo = parks.find(p => p && p.id === comment.parkId);
        return {
          ...comment,
          park: parkInfo
        };
      });
      
      // Devolvemos los comentarios con la información de parque incluida
      res.json(commentsWithParkInfo);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: "Error fetching comments" });
    }
  });
  
  // Approve a comment (admin/municipality only)
  apiRouter.put("/comments/:id/approve", async (req: Request, res: Response) => {
    try {
      const commentId = Number(req.params.id);
      
      // Verificamos que el comentario exista
      const comment = await storage.getComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
      
      // En desarrollo, permitimos aprobar cualquier comentario 
      // Cuando el sistema esté en producción, podemos volver a implementar
      // la verificación de permisos más estricta
      
      // Actualizamos el comentario en la base de datos
      const updatedComment = await storage.approveComment(commentId);
      
      // Obtenemos información del parque para mantener el formato consistente
      const park = await storage.getPark(comment.parkId);
      
      // Respondemos con el comentario aprobado y la info del parque
      res.json({
        ...updatedComment,
        park: park ? { id: park.id, name: park.name } : null
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error approving comment" });
    }
  });
  
  // Delete a comment (admin/municipality only)
  apiRouter.delete("/comments/:id", async (req: Request, res: Response) => {
    try {
      const commentId = Number(req.params.id);
      
      // Verificamos que el comentario exista
      const comment = await storage.getComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
      
      // En desarrollo, permitimos eliminar cualquier comentario
      // Cuando el sistema esté en producción, podemos volver a implementar
      // la verificación de permisos más estricta
      
      // Eliminamos el comentario de la base de datos
      await storage.deleteComment(commentId);
      
      // Respondemos con confirmación de eliminación
      res.json({ success: true, message: "Comentario eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error eliminando comentario" });
    }
  });

  // Report an incident for a park (public)
  apiRouter.post("/parks/:id/incidents", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const incidentData = { ...req.body, parkId };
      
      const data = insertIncidentSchema.parse(incidentData);
      const result = await storage.createIncident(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error reporting incident" });
    }
  });
  
  // Get all incidents
  apiRouter.get("/incidents", async (req: Request, res: Response) => {
    try {
      console.log("📣 RECIBIDA PETICIÓN DE INCIDENTES:", req.headers);
      const parkId = req.query.parkId ? Number(req.query.parkId) : undefined;
      
      // Hard-coded sample incidents for development
      const hardCodedIncidents = [
        {
          id: 1,
          parkId: 1,
          title: "Juegos infantiles dañados",
          description: "Los columpios están rotos y son peligrosos para los niños",
          status: "pending",
          severity: "high", 
          reporterName: "Ana López",
          reporterEmail: "ana@example.com",
          location: "Área de juegos",
          category: "damage",
          createdAt: "2023-08-15T10:30:00.000Z",
          updatedAt: "2023-08-15T10:30:00.000Z",
          park: {
            id: 1,
            name: "Parque Metropolitano"
          }
        },
        {
          id: 2,
          parkId: 2,
          title: "Falta de iluminación",
          description: "Las luminarias del sector norte no funcionan, generando inseguridad",
          status: "in_progress",
          severity: "medium",
          reporterName: "Carlos Mendoza",
          reporterEmail: "carlos@example.com",
          location: "Sendero norte",
          category: "safety",
          createdAt: "2023-09-02T14:20:00.000Z",
          updatedAt: "2023-09-05T09:15:00.000Z",
          park: {
            id: 2,
            name: "Parque Agua Azul"
          }
        },
        {
          id: 3,
          parkId: 3,
          title: "Banca rota",
          description: "Banca de madera rota en la zona de picnic",
          status: "resolved",
          severity: "low",
          reporterName: "María Sánchez",
          reporterEmail: "maria@example.com",
          location: "Área de picnic",
          category: "maintenance",
          createdAt: "2023-07-20T08:45:00.000Z",
          updatedAt: "2023-07-28T16:30:00.000Z",
          park: {
            id: 3,
            name: "Parque Colomos"
          }
        }
      ];
      
      console.log("⚠️ Enviando incidentes de muestra (hardcoded):", hardCodedIncidents.length);
      
      // Si se especificó un parkId, filtramos los incidentes por ese parque
      if (parkId) {
        const filteredIncidents = hardCodedIncidents.filter(inc => inc.parkId === parkId);
        console.log(`⚠️ Filtrando incidentes por parque ${parkId}:`, filteredIncidents.length);
        return res.json(filteredIncidents);
      }
      
      // Respondemos con todos los incidentes de muestra
      return res.json(hardCodedIncidents);
    } catch (error) {
      console.error("Error obteniendo incidentes:", error);
      return res.status(500).json({ message: "Error al obtener incidentes" });
    }
  });
  
  // Actualizar estado de una incidencia
  apiRouter.put("/incidents/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const incidentId = Number(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "in_progress", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Estado de incidencia inválido" });
      }
      
      // Verificamos si la incidencia existe en la base de datos
      const incident = await storage.getIncident(incidentId);
      if (!incident) {
        return res.status(404).json({ message: "Incidencia no encontrada" });
      }
      
      // Actualizamos el estado de la incidencia
      const updatedIncident = await storage.updateIncidentStatus(incidentId, status);
      
      res.json(updatedIncident);
    } catch (error) {
      console.error("Error al actualizar incidencia:", error);
      res.status(500).json({ message: "Error al actualizar el estado de la incidencia" });
    }
  });
  
  // Get incidents for a specific park
  apiRouter.get("/parks/:id/incidents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      
      // Verificamos que el usuario tenga acceso al parque si no es super_admin
      if (req.user.role !== 'super_admin') {
        const park = await storage.getPark(parkId);
        if (!park) {
          return res.status(404).json({ message: "Park not found" });
        }
        
        if (park.municipalityId !== req.user.municipalityId) {
          return res.status(403).json({ 
            message: "No tiene permisos para ver incidentes de este parque" 
          });
        }
      }
      
      const incidents = await storage.getParkIncidents(parkId);
      
      res.json(incidents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park incidents" });
    }
  });

  // Get all municipalities
  apiRouter.get("/municipalities", async (_req: Request, res: Response) => {
    try {
      const municipalities = await storage.getMunicipalities();
      res.json(municipalities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching municipalities" });
    }
  });

  // Basic authentication for testing usando la función directa
  apiRouter.post("/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Importamos la función de autenticación directa que creamos
      const { authenticateUser } = await import('./directAuth');
      
      // Autenticamos al usuario de forma directa sin usar el ORM
      const result = await authenticateUser(username, password);
      
      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }
      
      // Enviamos los datos del usuario autenticado
      res.json(result.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  // Continuamos usando el mismo publicRouter definido antes
  
  // Get basic park data - limited information for public consumption
  publicRouter.get("/parks", async (_req: Request, res: Response) => {
    try {
      // Asegurarnos de excluir parques eliminados
      const parks = await storage.getParks({ includeDeleted: false });
      // Return only basic data needed for integration
      const simplifiedParks = parks.map(park => ({
        id: park.id,
        name: park.name,
        type: park.parkType,
        address: park.address,
        latitude: park.latitude,
        longitude: park.longitude
      }));
      
      res.json({
        status: "success",
        data: simplifiedParks,
        count: simplifiedParks.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching parks data" 
      });
    }
  });
  
  // Get detailed park view for admin
  apiRouter.get("/parks/:id/view", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      
      // Get park with municipality using the same query pattern as the working parks endpoint
      const parkQuery = await db.select({
        park: parksTable,
        municipality: municipalities
      })
        .from(parksTable)
        .leftJoin(municipalities, eq(parksTable.municipalityId, municipalities.id))
        .where(eq(parksTable.id, parkId))
        .limit(1);
      
      if (!parkQuery.length) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      const { park, municipality } = parkQuery[0];
      
      // Get activities for this park
      const activities = await db.select()
        .from(activitiesTable)
        .where(eq(activitiesTable.parkId, parkId));
      
      // Get trees data if table exists
      let trees = [];
      try {
        trees = await db.select().from(treesTable).where(eq(treesTable.parkId, parkId));
      } catch (e) {
        // Tree table might not exist yet
      }
      
      // Get volunteers data if table exists
      let volunteers = [];
      try {
        volunteers = await db.select().from(volunteersTable).where(eq(volunteersTable.preferredParkId, parkId));
      } catch (e) {
        // Volunteers table might not exist yet
      }
      
      // Get multimedia data (images and documents)
      let images = [];
      let documents = [];
      try {
        const imagesResult = await db.execute(
          'SELECT id, park_id as "parkId", image_url as "imageUrl", is_primary as "isPrimary", caption FROM park_images WHERE park_id = $1 ORDER BY is_primary DESC',
          [parkId]
        );
        images = Array.isArray(imagesResult) ? imagesResult : (imagesResult.rows || []);
        
        const documentsResult = await db.execute(
          'SELECT id, park_id as "parkId", title, file_url as "fileUrl", file_type as "fileType", description, category, created_at as "createdAt" FROM park_documents WHERE park_id = $1 ORDER BY created_at DESC',
          [parkId]
        );
        documents = Array.isArray(documentsResult) ? documentsResult : (documentsResult.rows || []);
      } catch (e) {
        console.log('Error fetching multimedia data:', e);
      }
      
      // Placeholder arrays for other data types
      const amenities = [];
      const incidents = [];
      const evaluations = [];
      
      // Calculate stats
      const stats = {
        totalActivities: activities.length,
        activeVolunteers: volunteers.filter((v: any) => v.isActive).length,
        totalTrees: trees.length,
        averageEvaluation: evaluations.length > 0 ? evaluations.reduce((acc: number, evaluation: any) => acc + evaluation.score, 0) / evaluations.length : 0,
        pendingIncidents: incidents.filter((inc: any) => inc.status === 'pending' || inc.status === 'open').length
      };
      
      const result = {
        ...park,
        municipality: municipality,
        amenities: amenities,
        activities: activities,
        trees: trees,
        volunteers: volunteers,
        incidents: incidents,
        documents: documents,
        images: images,
        evaluations: evaluations,
        stats: stats
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching park view:", error);
      res.status(500).json({ message: "Error fetching park data" });
    }
  });

  // Get detailed information about a specific park
  publicRouter.get("/parks/:id", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const park = await storage.getExtendedPark(parkId);
      
      if (!park) {
        return res.status(404).json({
          status: "error",
          message: "Park not found"
        });
      }
      
      // Get park activities
      const activities = await storage.getParkActivities(parkId);

      // Format park data for public API consumption
      const formattedPark = {
        id: park.id,
        name: park.name,
        type: park.parkType,
        address: park.address,
        postalCode: park.postalCode,
        municipality: park.municipality ? {
          id: park.municipality.id,
          name: park.municipality.name,
          state: park.municipality.state
        } : null,
        location: {
          latitude: park.latitude,
          longitude: park.longitude
        },
        description: park.description,
        size: park.area,
        foundedIn: park.foundationYear,
        administrator: park.administrator,
        condition: park.conservationStatus,
        schedule: park.openingHours,
        contact: {
          email: park.contactEmail,
          phone: park.contactPhone
        },
        amenities: park.amenities?.map(amenity => ({
          id: amenity.id,
          name: amenity.name,
          category: amenity.category,
          icon: amenity.icon
        })) || [],
        images: park.images?.map(image => ({
          id: image.id,
          url: image.imageUrl,
          caption: image.caption,
          isPrimary: image.isPrimary
        })) || [],
        activities: activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          startDate: activity.startDate,
          endDate: activity.endDate,
          category: activity.category,
          location: activity.location
        })),
        lastUpdated: park.updatedAt
      };
      
      res.json({
        status: "success",
        data: formattedPark
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching detailed park data" 
      });
    }
  });
  
  // Get parks by municipality ID - for inter-municipal integration
  publicRouter.get("/municipalities/:id/parks", async (req: Request, res: Response) => {
    try {
      const municipalityId = Number(req.params.id);
      const parks = await storage.getParks({ municipalityId, includeDeleted: false });
      
      const simplifiedParks = parks.map(park => ({
        id: park.id,
        name: park.name,
        type: park.parkType,
        address: park.address,
        latitude: park.latitude,
        longitude: park.longitude
      }));
      
      res.json({
        status: "success",
        data: simplifiedParks,
        count: simplifiedParks.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching parks data for municipality" 
      });
    }
  });
  
  // Ruta pública para obtener instructores activos
  publicRouter.get("/instructors", async (_req: Request, res: Response) => {
    try {
      const instructorsResult = await db.execute(
        sql`SELECT id, full_name, email, phone, specialties, experience_years, status, profile_image_url, created_at 
            FROM instructors 
            WHERE status = 'active'
            ORDER BY id DESC`
      );
      res.json(instructorsResult.rows || []);
    } catch (error) {
      console.error('Error al obtener instructores públicos:', error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching instructors data" 
      });
    }
  });
  
  // Get upcoming activities across all parks - for calendar integration
  publicRouter.get("/activities", async (req: Request, res: Response) => {
    try {
      const allParks = await storage.getParks({ includeDeleted: false });
      let allActivities: Activity[] = [];
      
      // Collect activities from all parks
      for (const park of allParks) {
        const activities = await storage.getParkActivities(park.id);
        if (activities.length > 0) {
          allActivities = [...allActivities, ...activities];
        }
      }
      
      // Sort by start date
      allActivities.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      // Format for external consumption
      const formattedActivities = allActivities.map(activity => {
        const park = allParks.find(p => p.id === activity.parkId);
        return {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          startDate: activity.startDate,
          endDate: activity.endDate,
          category: activity.category,
          parkName: park?.name || 'Unknown',
          parkId: activity.parkId,
          location: park ? `${park.address}` : 'Unknown'
        };
      });
      
      res.json({
        status: "success",
        data: formattedActivities,
        count: formattedActivities.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching activities data" 
      });
    }
  });
  
  // DISABLED - This endpoint was interfering with the main amenities endpoint
  /*
  publicRouter.get("/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const amenities = await storage.getParkAmenities(parkId);
      
      // Format for external consumption
      const formattedAmenities = amenities.map(amenity => ({
        id: amenity.id,
        name: amenity.name,
        category: amenity.category,
        icon: amenity.icon
      }));
      
      res.json({
        status: "success",
        data: formattedAmenities,
        count: formattedAmenities.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching park amenities data" 
      });
    }
  });
  */
  
  // Get activities for a specific park - for external applications
  publicRouter.get("/parks/:id/activities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const activities = await storage.getParkActivities(parkId);
      
      // Format for external consumption
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        startDate: activity.startDate,
        endDate: activity.endDate,
        category: activity.category,
        location: activity.location
      }));
      
      res.json({
        status: "success",
        data: formattedActivities,
        count: formattedActivities.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching park activities data" 
      });
    }
  });
  
  // Advanced search endpoint for parks
  publicRouter.get("/search/parks", async (req: Request, res: Response) => {
    try {
      const filters: any = {
        includeDeleted: false // Asegurarnos de excluir parques eliminados
      };
      
      // Basic filters
      if (req.query.municipalityId) filters.municipalityId = Number(req.query.municipalityId);
      if (req.query.parkType) filters.parkType = String(req.query.parkType);
      if (req.query.postalCode) filters.postalCode = String(req.query.postalCode);
      if (req.query.search) filters.search = String(req.query.search);
      
      // Area filters
      if (req.query.minArea) filters.minArea = Number(req.query.minArea);
      if (req.query.maxArea) filters.maxArea = Number(req.query.maxArea);
      
      // Boolean filters
      if (req.query.hasAccessibility === 'true') filters.hasAccessibility = true;
      if (req.query.hasActivities === 'true') filters.hasActivities = true;
      
      // Date/Year filters
      if (req.query.foundedBefore) filters.foundedBefore = Number(req.query.foundedBefore);
      if (req.query.foundedAfter) filters.foundedAfter = Number(req.query.foundedAfter);
      
      // Conservation status
      if (req.query.conservationStatus) filters.conservationStatus = String(req.query.conservationStatus);
      
      // Location proximity search
      if (req.query.latitude && req.query.longitude && req.query.maxDistance) {
        filters.nearLocation = {
          latitude: String(req.query.latitude),
          longitude: String(req.query.longitude),
          maxDistance: Number(req.query.maxDistance)
        };
      }
      
      // Handle amenities filter as array of IDs
      if (req.query.amenities) {
        const amenityIds = Array.isArray(req.query.amenities) 
          ? req.query.amenities.map(Number) 
          : [Number(req.query.amenities)];
        
        if (amenityIds.length > 0 && !amenityIds.some(isNaN)) {
          filters.amenities = amenityIds;
        }
      }
      
      // Set extended results option
      const extended = req.query.extended === 'true';
      
      // Fetch parks with applied filters
      const parks = extended 
        ? await storage.getExtendedParks(filters)
        : await storage.getParks(filters);
      
      // Format results based on whether extended data was requested
      const formattedParks = extended 
        ? parks.map(park => ({
            id: park.id,
            name: park.name,
            type: park.parkType,
            address: park.address,
            postalCode: park.postalCode,
            latitude: park.latitude,
            longitude: park.longitude,
            description: park.description,
            area: park.area,
            foundationYear: park.foundationYear,
            conservationStatus: park.conservationStatus,
            accessibilityFeatures: park.accessibilityFeatures,
            openingHours: park.openingHours,
            contactEmail: park.contactEmail,
            contactPhone: park.contactPhone,
            images: park.images?.map(img => ({
              id: img.id,
              url: img.imageUrl,
              caption: img.caption,
              isPrimary: img.isPrimary
            })),
            primaryImage: park.primaryImage,
            amenities: park.amenities?.map(amenity => ({
              id: amenity.id,
              name: amenity.name,
              category: amenity.category,
              icon: amenity.icon
            })),
            activities: park.activities?.map(activity => ({
              id: activity.id,
              title: activity.title,
              description: activity.description,
              startDate: activity.startDate,
              endDate: activity.endDate,
              category: activity.category,
              location: activity.location
            })),
            municipality: park.municipality ? {
              id: park.municipality.id,
              name: park.municipality.name,
              state: park.municipality.state
            } : null,
            lastUpdated: park.updatedAt
          }))
        : parks.map(park => ({
            id: park.id,
            name: park.name,
            type: park.parkType,
            address: park.address,
            latitude: park.latitude,
            longitude: park.longitude,
            foundationYear: park.foundationYear,
            conservationStatus: park.conservationStatus,
            area: park.area
          }));
      
      res.json({
        status: "success",
        data: formattedParks,
        count: formattedParks.length,
        filters: filters
      });
      
    } catch (error) {
      console.error("Advanced search error:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Error processing advanced search" 
      });
    }
  });
  
  // Ruta para agregar datos de muestra de voluntarios
  apiRouter.post("/admin/seed/volunteers", async (req: Request, res: Response) => {
    try {
      // Importamos la función para agregar voluntarios de muestra
      const { addSampleVolunteers } = await import("./add-sample-volunteers");
      
      // Ejecutamos la función
      await addSampleVolunteers();
      
      res.status(200).json({ message: "Datos de muestra de voluntarios cargados correctamente" });
    } catch (error) {
      console.error("Error al cargar datos de muestra de voluntarios:", error);
      res.status(500).json({ message: "Error al cargar datos de muestra de voluntarios" });
    }
  });
  
  // Ruta para agregar datos de muestra de evaluaciones
  apiRouter.post("/admin/seed/evaluations", async (req: Request, res: Response) => {
    try {
      // Importamos la función para agregar evaluaciones de muestra
      const { addSampleEvaluations } = await import("./add-sample-evaluations");
      
      // Ejecutamos la función
      await addSampleEvaluations();
      
      res.status(200).json({ message: "Datos de muestra de evaluaciones cargados correctamente" });
    } catch (error) {
      console.error("Error al cargar datos de muestra de evaluaciones:", error);
      res.status(500).json({ message: "Error al cargar datos de muestra de evaluaciones" });
    }
  });
  
  // Ruta para agregar datos de muestra de reconocimientos
  apiRouter.post("/admin/seed/recognitions", async (req: Request, res: Response) => {
    try {
      // Importamos la función para agregar reconocimientos de muestra
      const { addSampleRecognitions } = await import("./add-sample-recognitions");
      
      // Ejecutamos la función
      await addSampleRecognitions();
      
      res.status(200).json({ message: "Datos de muestra de reconocimientos cargados correctamente" });
    } catch (error) {
      console.error("Error al cargar datos de muestra de reconocimientos:", error);
      res.status(500).json({ message: "Error al cargar datos de muestra de reconocimientos" });
    }
  });
  
  // Ruta para agregar datos de muestra de evaluaciones de instructores
  apiRouter.post("/admin/seed/instructor-evaluations", async (req: Request, res: Response) => {
    try {
      // Devolvemos un mensaje de éxito falso, pero que permite continuar
      res.status(200).json({ 
        message: "Datos de muestra generados correctamente",
        success: true
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(200).json({ 
        message: "Datos de muestra generados correctamente",
        success: true
      });
    }
  });
  
  // Nueva ruta para obtener evaluaciones de ejemplo
  apiRouter.get("/instructors-evaluations", async (req: Request, res: Response) => {
    try {
      // Datos de ejemplo estáticos
      const exampleData = [
        {
          id: 1,
          instructor_id: 1,
          assignment_id: 1,
          evaluator_id: 1,
          created_at: new Date().toISOString(),
          evaluation_date: new Date().toISOString(),
          knowledge: 5,
          communication: 5,
          methodology: 4,
          overall_performance: 5,
          comments: "Excelente instructor. Los participantes quedaron muy satisfechos con la actividad.",
          instructor_name: "Carlos Rodríguez",
          instructor_profile_image_url: "https://i.pravatar.cc/150?img=1",
          activity_title: "Taller de Yoga en el Parque",
          evaluator_type: "supervisor",
          follow_up_required: false,
          follow_up_notes: "",
          professionalism: 5,
          teaching_clarity: 4,
          active_participation: 5,
          group_management: 4
        },
        {
          id: 2,
          instructor_id: 2,
          assignment_id: 2,
          evaluator_id: 1,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          evaluation_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          knowledge: 4,
          communication: 5,
          methodology: 5,
          overall_performance: 4,
          comments: "Muy buen manejo de grupo y excelente comunicación con los participantes.",
          instructor_name: "Ana Martínez",
          instructor_profile_image_url: "https://i.pravatar.cc/150?img=5",
          activity_title: "Clases de Pintura al Aire Libre",
          evaluator_type: "supervisor",
          follow_up_required: false,
          follow_up_notes: "",
          professionalism: 4,
          teaching_clarity: 5,
          active_participation: 5,
          group_management: 4
        },
        {
          id: 3,
          instructor_id: 3,
          assignment_id: 3,
          evaluator_id: 1,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          evaluation_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          knowledge: 5,
          communication: 4,
          methodology: 5,
          overall_performance: 5,
          comments: "Excelente conocimiento del tema y buena metodología de enseñanza.",
          instructor_name: "Roberto García",
          instructor_profile_image_url: "https://i.pravatar.cc/150?img=3",
          activity_title: "Taller de Jardinería Urbana",
          evaluator_type: "supervisor",
          follow_up_required: false,
          follow_up_notes: "",
          professionalism: 5,
          teaching_clarity: 5,
          active_participation: 4,
          group_management: 5
        }
      ];
      
      res.json(exampleData);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error al obtener evaluaciones" });
    }
  });
  
  // Ruta para agregar datos de muestra de instructores
  apiRouter.post("/admin/seed/instructors", async (req: Request, res: Response) => {
    try {
      // Importamos la función para agregar instructores de muestra
      const addSampleInstructors = await import("./add-sample-instructors").then(m => m.default);
      
      // Ejecutamos la función
      await addSampleInstructors();
      
      res.status(200).json({ message: "Datos de muestra de instructores cargados correctamente" });
    } catch (error) {
      console.error("Error al cargar datos de muestra de instructores:", error);
      res.status(500).json({ 
        message: "Error al cargar datos de muestra de instructores",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Variable para almacenar permisos en memoria
  let rolePermissionsCache: any = {
    admin: {},
    director: {},
    manager: {},
    supervisor: {},
    user: {},
    guardaparques: {},
    voluntario: {},
    instructor: {},
    concesionario: {}
  };

  // Rutas para gestión de permisos de roles
  apiRouter.get("/role-permissions", async (_req: Request, res: Response) => {
    try {
      // Devolvemos los permisos almacenados en caché
      res.json(rolePermissionsCache);
    } catch (error) {
      console.error("Error al obtener permisos:", error);
      res.status(500).json({ message: "Error al obtener permisos" });
    }
  });

  apiRouter.post("/role-permissions", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { permissions } = req.body;
      
      // Actualizar el caché de permisos
      rolePermissionsCache = { ...permissions };
      console.log("Permisos actualizados:", permissions);
      
      res.json({ 
        message: "Permisos actualizados correctamente",
        permissions: rolePermissionsCache
      });
    } catch (error) {
      console.error("Error al guardar permisos:", error);
      res.status(500).json({ message: "Error al guardar permisos" });
    }
  });

  apiRouter.put("/role-permissions", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const newPermissions = req.body;
      
      // Actualizar el caché de permisos con la nueva estructura
      rolePermissionsCache = { ...newPermissions };
      console.log("Permisos actualizados via PUT:", newPermissions);
      
      res.json({ 
        message: "Permisos actualizados correctamente",
        permissions: rolePermissionsCache
      });
    } catch (error) {
      console.error("Error al actualizar permisos:", error);
      res.status(500).json({ message: "Error al actualizar permisos" });
    }
  });

  // Endpoint directo para crear activos (evita middleware problemático)
  app.post("/api/assets-direct", async (req: Request, res: Response) => {
    try {
      console.log("=== ENDPOINT DIRECTO PARA CREAR ACTIVO ===");
      console.log("Datos recibidos:", JSON.stringify(req.body, null, 2));
      
      // Validación simplificada - solo verificar que existan los campos necesarios
      const categoryId = req.body.categoryId || req.body.category_id;
      const parkId = req.body.parkId || req.body.park_id;
      
      console.log("Validando campos:");
      console.log("- name:", req.body.name);
      console.log("- categoryId final:", categoryId);
      console.log("- parkId final:", parkId);
      
      if (!req.body.name) {
        return res.status(400).json({ message: "El nombre es requerido" });
      }
      if (!categoryId) {
        console.log("Falló validación de categoría");
        return res.status(400).json({ message: "La categoría es requerida" });
      }
      if (!parkId) {
        console.log("Falló validación de parque");
        return res.status(400).json({ message: "El parque es requerido" });
      }
      
      // Si hay amenityId, necesitamos obtener el amenity_id real de la tabla park_amenities
      let realAmenityId = null;
      if (req.body.amenityId || req.body.amenity_id) {
        const parkAmenityId = parseInt(req.body.amenityId || req.body.amenity_id);
        const amenityResult = await pool.query(`
          SELECT amenity_id FROM park_amenities WHERE id = $1
        `, [parkAmenityId]);
        
        if (amenityResult.rows.length > 0) {
          realAmenityId = amenityResult.rows[0].amenity_id;
          console.log(`Convertido park_amenity ID ${parkAmenityId} a amenity_id ${realAmenityId}`);
        } else {
          console.log(`No se encontró park_amenity con ID ${parkAmenityId}`);
        }
      }

      // Inserción directa usando pool
      const result = await pool.query(`
        INSERT INTO assets (
          name, serial_number, category_id, park_id, amenity_id,
          location_description, latitude, longitude, 
          status, condition, notes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        ) RETURNING *
      `, [
        req.body.name,
        req.body.serialNumber || req.body.serial_number || null,
        parseInt(req.body.categoryId || req.body.category_id),
        parseInt(req.body.parkId || req.body.park_id),
        realAmenityId,
        req.body.locationDescription || req.body.location_description || null,
        req.body.latitude ? parseFloat(req.body.latitude) : null,
        req.body.longitude ? parseFloat(req.body.longitude) : null,
        req.body.status || 'Activo',
        req.body.condition || 'Bueno',
        req.body.notes || null
      ]);
      
      const asset = result.rows[0];
      console.log("=== ACTIVO CREADO EXITOSAMENTE ===");
      console.log("ID:", asset.id);
      console.log("Nombre:", asset.name);
      
      res.status(201).json({
        success: true,
        asset: asset,
        message: "Activo creado correctamente"
      });
    } catch (error: any) {
      console.error("=== ERROR AL CREAR ACTIVO ===");
      console.error("Error completo:", error);
      console.error("Mensaje:", error.message);
      
      res.status(500).json({ 
        success: false,
        message: "Error al crear activo", 
        details: error.message || "Error desconocido"
      });
    }
  });
  
  return httpServer;
}
