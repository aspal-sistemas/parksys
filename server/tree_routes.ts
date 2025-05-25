/**
 * Rutas para el módulo de Arbolado
 */
import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  treeSpecies, 
  trees, 
  treeMaintenances, 
  parks,
  insertTreeSpeciesSchema,
  insertTreeSchema,
  insertTreeMaintenanceSchema
} from "@shared/schema";
import { eq, desc, and, like, or, gte, lte, isNull } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { sql } from 'drizzle-orm';
import { getTreeInventory } from './tree_inventory_raw';
// No necesitamos importar nada de tree_details_route aquí

/**
 * Registra las rutas relacionadas con el módulo de arbolado
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerTreeRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Rutas de mantenimiento por árbol
  apiRouter.get("/trees/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const treeId = Number(req.params.id);
      
      if (isNaN(treeId)) {
        return res.status(400).json({ error: "ID de árbol inválido" });
      }
      
      // Verificar que el árbol existe
      const treeExists = await db.select({ id: trees.id }).from(trees).where(eq(trees.id, treeId));
      
      if (treeExists.length === 0) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }

      // Obtener registros de mantenimiento para este árbol
      const maintenanceRecords = await db.select().from(treeMaintenances)
        .where(eq(treeMaintenances.tree_id, treeId))
        .orderBy(desc(treeMaintenances.maintenance_date));
      
      res.json({ data: maintenanceRecords });
    } catch (error) {
      console.error("Error al obtener registros de mantenimiento:", error);
      res.status(500).json({ error: "Error al obtener registros de mantenimiento" });
    }
  });
  
  // Crear nuevo registro de mantenimiento para un árbol
  apiRouter.post("/trees/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const treeId = Number(req.params.id);
      
      if (isNaN(treeId)) {
        return res.status(400).json({ error: "ID de árbol inválido" });
      }
      
      // Verificar que el árbol existe
      const treeExists = await db.select({ id: trees.id }).from(trees).where(eq(trees.id, treeId));
      
      if (treeExists.length === 0) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }
      
      // Validar datos de entrada
      const validatedData = insertTreeMaintenanceSchema.parse({
        ...req.body,
        tree_id: treeId
      });
      
      // Insertar registro de mantenimiento
      const [newMaintenance] = await db.insert(treeMaintenances)
        .values(validatedData)
        .returning();
      
      res.status(201).json({ data: newMaintenance });
    } catch (error) {
      console.error("Error al crear registro de mantenimiento:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: "Datos de mantenimiento inválidos", 
          details: validationError.message 
        });
      }
      
      res.status(500).json({ error: "Error al crear registro de mantenimiento" });
    }
  });
  // Endpoint para cargar árboles de muestra en el inventario
  apiRouter.post("/trees/seed", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      // Consultar los parques existentes
      const parks = await db.execute(sql`SELECT id, name FROM parks`);
      if (!parks || !parks.rows || parks.rows.length === 0) {
        return res.status(400).json({ message: "No hay parques disponibles para asignar árboles" });
      }
      
      // Consultar las especies existentes
      const species = await db.execute(sql`SELECT id, common_name FROM tree_species`);
      if (!species || !species.rows || species.rows.length === 0) {
        return res.status(400).json({ message: "No hay especies de árboles disponibles" });
      }
      
      console.log(`Encontrados ${parks.rows.length} parques y ${species.rows.length} especies para crear árboles`);
      
      // Valores posibles para condición y estado
      const healthStatuses = ['Bueno', 'Regular', 'Malo', 'Crítico'];
      const conditions = ['Excelente', 'Bueno', 'Regular', 'Deteriorado', 'Crítico'];
      
      // Contador de árboles insertados
      let insertedCount = 0;
      
      // Insertar 50 árboles
      for (let i = 0; i < 50; i++) {
        try {
          // Seleccionar un parque aleatorio
          const randomParkIndex = Math.floor(Math.random() * parks.rows.length);
          const park = parks.rows[randomParkIndex];
          
          // Seleccionar una especie aleatoria
          const randomSpeciesIndex = Math.floor(Math.random() * species.rows.length);
          const specie = species.rows[randomSpeciesIndex];
          
          // Generar coordenadas (latitud/longitud)
          const latitude = 20.65 + (Math.random() * 0.05);
          const longitude = -103.35 + (Math.random() * 0.05);
          
          // Generar altura y diámetro aleatorios
          const height = parseFloat((Math.random() * 15 + 1).toFixed(2)); // Entre 1 y 16 metros
          const trunkDiameter = parseFloat((Math.random() * 80 + 5).toFixed(2)); // Entre 5 y 85 cm
          
          // Seleccionar estado de salud y condición aleatorios
          const healthStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
          const condition = conditions[Math.floor(Math.random() * conditions.length)];
          
          // Generar fecha de plantación aleatoria (entre 1 y 20 años atrás)
          const plantingDate = new Date();
          const yearsAgo = Math.floor(Math.random() * 20) + 1;
          plantingDate.setFullYear(plantingDate.getFullYear() - yearsAgo);
          
          // Descripción de ubicación
          const locations = [
            'Cerca de la entrada principal', 
            'En el área de juegos', 
            'Junto al lago', 
            'En el área de picnic', 
            'En el perímetro norte', 
            'En el perímetro sur', 
            'En el jardín central', 
            'Junto a la ciclovía',
            'Cerca del área deportiva',
            'En la zona de descanso'
          ];
          const locationDescription = locations[Math.floor(Math.random() * locations.length)];
          
          // Notas y observaciones
          const notesList = [
            'Árbol en buen estado general',
            'Presenta algunas ramas secas que requieren poda',
            'Ha sido tratado recientemente contra plagas',
            'Es un ejemplar notable por su tamaño',
            'Ha sobrevivido a condiciones climáticas extremas',
            'Requiere evaluación detallada próximamente',
            'Plantado durante campaña de reforestación municipal',
            'Provee sombra a un área de descanso',
            'Es parte de un grupo de árboles de la misma especie',
            'Es un árbol joven con buen desarrollo'
          ];
          const notes = notesList[Math.floor(Math.random() * notesList.length)];
          
          // Ejecutar la inserción directa en la base de datos
          await db.execute(sql`
            INSERT INTO trees (
              species_id, park_id, latitude, longitude, 
              height, trunk_diameter, planting_date, 
              location_description, notes, condition, health_status,
              created_at, updated_at
            ) 
            VALUES (
              ${specie.id}, ${park.id}, ${latitude}, ${longitude},
              ${height}, ${trunkDiameter}, ${plantingDate},
              ${locationDescription}, ${notes}, ${condition},
              ${healthStatus}, NOW(), NOW()
            )
          `);
          
          insertedCount++;
        } catch (error) {
          console.error(`Error al insertar árbol #${i+1}:`, error);
        }
      }
      
      console.log(`¡Carga completada! Se insertaron ${insertedCount} árboles en el inventario.`);
      return res.json({ 
        success: true, 
        message: `Se han agregado ${insertedCount} árboles al inventario.`,
        count: insertedCount
      });
      
    } catch (error) {
      console.error('Error en el proceso de carga de árboles:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Error al cargar árboles de muestra" 
      });
    }
  });
  
  // Usar la implementación de inventario adaptada a la estructura real de la tabla
  apiRouter.get("/trees", getTreeInventory);
  
  // Endpoint para obtener los mantenimientos de un árbol específico
  apiRouter.get("/trees/:id/maintenances", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar que el árbol existe
      const treeResult = await db.execute(sql`
        SELECT * FROM trees WHERE id = ${Number(id)}
      `);
      
      if (!treeResult.rows || treeResult.rows.length === 0) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }
      
      // Obtener los mantenimientos
      const maintenancesResult = await db.execute(sql`
        SELECT * FROM tree_maintenances 
        WHERE tree_id = ${Number(id)}
        ORDER BY maintenance_date DESC
      `);
      
      // Formatear los resultados
      const maintenances = maintenancesResult.rows.map(m => ({
        id: m.id,
        treeId: m.tree_id,
        maintenanceType: m.maintenance_type,
        maintenanceDate: m.maintenance_date,
        performedBy: m.performed_by,
        performedByName: m.full_name || m.username || 'Usuario',
        notes: m.notes,
        createdAt: m.created_at,
        updatedAt: m.updated_at
      }));
      
      res.json({ data: maintenances });
    } catch (error) {
      console.error("Error fetching tree maintenances:", error);
      res.status(500).json({ error: "Error al obtener mantenimientos del árbol" });
    }
  });
  
  // Endpoint para crear un nuevo mantenimiento
  apiRouter.post("/trees/:id/maintenances", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { maintenanceType, maintenanceDate, performedBy, notes } = req.body;
      
      if (!maintenanceType || !maintenanceDate) {
        return res.status(400).json({ error: "Tipo de mantenimiento y fecha son obligatorios" });
      }
      
      // Verificar que el árbol existe
      const treeResult = await db.execute(sql`
        SELECT * FROM trees WHERE id = ${Number(id)}
      `);
      
      if (!treeResult.rows || treeResult.rows.length === 0) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }
      
      // Insertar el nuevo mantenimiento
      const result = await db.execute(sql`
        INSERT INTO tree_maintenances (
          tree_id, 
          maintenance_type, 
          maintenance_date, 
          performed_by, 
          notes, 
          created_at, 
          updated_at
        ) 
        VALUES (
          ${Number(id)}, 
          ${maintenanceType}, 
          ${maintenanceDate}, 
          ${performedBy || null}, 
          ${notes || null}, 
          NOW(), 
          NOW()
        )
        RETURNING *
      `);
      
      // Actualizar la fecha del último mantenimiento en el árbol
      await db.execute(sql`
        UPDATE trees 
        SET last_maintenance_date = ${maintenanceDate}
        WHERE id = ${Number(id)}
      `);
      
      // Formatear el resultado
      const maintenance = result.rows[0];
      const formattedMaintenance = {
        id: maintenance.id,
        treeId: maintenance.tree_id,
        maintenanceType: maintenance.maintenance_type,
        maintenanceDate: maintenance.maintenance_date,
        performedBy: maintenance.performed_by,
        notes: maintenance.notes,
        createdAt: maintenance.created_at,
        updatedAt: maintenance.updated_at
      };
      
      res.status(201).json({ data: formattedMaintenance });
    } catch (error) {
      console.error("Error creating tree maintenance:", error);
      res.status(500).json({ error: "Error al crear mantenimiento del árbol" });
    }
  });
  
  // Ruta para obtener detalles de un árbol específico
  apiRouter.get("/trees/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Obtener el árbol usando SQL directo
      const treeResult = await db.execute(sql`
        SELECT * FROM trees WHERE id = ${Number(id)}
      `);
      
      if (!treeResult.rows || treeResult.rows.length === 0) {
        return res.status(404).json({ error: "Árbol no encontrado" });
      }
      
      const tree = treeResult.rows[0];
      
      // Obtener la especie del árbol
      const speciesResult = await db.execute(sql`
        SELECT * FROM tree_species WHERE id = ${tree.species_id}
      `);
      
      // Obtener el parque del árbol
      const parkResult = await db.execute(sql`
        SELECT id, name FROM parks WHERE id = ${tree.park_id}
      `);
      
      // Obtener los mantenimientos del árbol
      const maintenancesResult = await db.execute(sql`
        SELECT tm.*, u.username, u.full_name 
        FROM tree_maintenances tm
        LEFT JOIN users u ON tm.performed_by = u.id
        WHERE tm.tree_id = ${parseInt(tree.id)}
        ORDER BY tm.maintenance_date DESC
      `);
      
      // Formatear el resultado
      const treeDetails = {
        id: tree.id,
        code: `ARB-${tree.id.toString().padStart(5, '0')}`,
        speciesId: tree.species_id,
        parkId: tree.park_id,
        speciesName: speciesResult.rows[0]?.common_name || 'Desconocida',
        scientificName: speciesResult.rows[0]?.scientific_name || '',
        parkName: parkResult.rows[0]?.name || 'Desconocido',
        latitude: tree.latitude,
        longitude: tree.longitude,
        height: tree.height,
        diameter: tree.trunk_diameter,
        healthStatus: tree.health_status || 'No evaluado',
        condition: tree.condition,
        locationDescription: tree.location_description,
        plantingDate: tree.planting_date,
        notes: tree.notes,
        maintenances: maintenancesResult.rows || []
      };
      
      res.json({ data: treeDetails });
    } catch (error) {
      console.error("Error fetching tree details:", error);
      res.status(500).json({ error: "Error al obtener detalles del árbol" });
    }
  });
  
  // Desactivar la ruta en tree_inventory_routes.ts que causa conflicto
  // Ya estamos usando getTreeDetails que es una implementación compatible con la estructura real
  
  // Obtener todas las especies de árboles
  apiRouter.get("/tree-species", async (req: Request, res: Response) => {
    try {
      // Ejecutar una consulta directa para obtener las especies
      const result = await db.execute(sql`
        SELECT * FROM tree_species
        ORDER BY common_name ASC
      `);
      
      res.json({
        data: result.rows
      });
    } catch (error) {
      console.error("Error al obtener especies de árboles:", error);
      res.status(500).json({ message: "Error al obtener especies de árboles" });
    }
  });

  // Obtener una especie de árbol por ID
  apiRouter.get("/tree-species/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const result = await db.execute(sql`
        SELECT * FROM tree_species
        WHERE id = ${id}
      `);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: "Especie de árbol no encontrada" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener especie de árbol:", error);
      res.status(500).json({ message: "Error al obtener especie de árbol" });
    }
  });

  // Crear nueva especie de árbol (requiere autenticación)
  apiRouter.post("/tree-species", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { commonName, scientificName, family, origin, imageUrl, description, 
              benefits, careRequirements, lifespan, growthRate, canopyShape } = req.body;
      
      // Validación básica de datos
      if (!commonName || !scientificName) {
        return res.status(400).json({ 
          message: "El nombre común y científico son obligatorios" 
        });
      }
      
      // Insertar la nueva especie
      const result = await db.execute(sql`
        INSERT INTO tree_species (
          common_name, scientific_name, family, origin, image_url, 
          description, benefits, care_requirements, lifespan, growth_rate, 
          canopy_shape, created_at, updated_at
        ) 
        VALUES (
          ${commonName}, ${scientificName}, ${family || null}, ${origin || null}, 
          ${imageUrl || null}, ${description || null}, ${benefits || null}, 
          ${careRequirements || null}, ${lifespan || null}, ${growthRate || null}, 
          ${canopyShape || null}, NOW(), NOW()
        )
        RETURNING *
      `);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error al crear especie de árbol:", error);
      res.status(500).json({ message: "Error al crear especie de árbol" });
    }
  });

  // Actualizar especie de árbol (requiere autenticación)
  apiRouter.put("/tree-species/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { commonName, scientificName, family, origin, imageUrl, description, 
              benefits, careRequirements, lifespan, growthRate, canopyShape } = req.body;
      
      // Validación básica de datos
      if (!commonName || !scientificName) {
        return res.status(400).json({ 
          message: "El nombre común y científico son obligatorios" 
        });
      }
      
      // Actualizar la especie
      const result = await db.execute(sql`
        UPDATE tree_species
        SET 
          common_name = ${commonName},
          scientific_name = ${scientificName},
          family = ${family || null},
          origin = ${origin || null},
          image_url = ${imageUrl || null},
          description = ${description || null},
          benefits = ${benefits || null},
          care_requirements = ${careRequirements || null},
          lifespan = ${lifespan || null},
          growth_rate = ${growthRate || null},
          canopy_shape = ${canopyShape || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: "Especie de árbol no encontrada" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al actualizar especie de árbol:", error);
      res.status(500).json({ message: "Error al actualizar especie de árbol" });
    }
  });

  // Eliminar especie de árbol (requiere autenticación)
  apiRouter.delete("/tree-species/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Verificar si la especie tiene árboles asociados
      const treeCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM trees
        WHERE species_id = ${id}
      `);
      
      if (treeCount.rows[0]?.count > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar la especie porque tiene árboles asociados" 
        });
      }
      
      // Eliminar la especie
      const result = await db.execute(sql`
        DELETE FROM tree_species
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: "Especie de árbol no encontrada" });
      }
      
      res.json({ message: "Especie de árbol eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar especie de árbol:", error);
      res.status(500).json({ message: "Error al eliminar especie de árbol" });
    }
  });

  // Obtener árboles por parque
  apiRouter.get("/parks/:id/trees", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      
      // Verificar que el parque existe
      const parkResult = await db.execute(sql`
        SELECT * FROM parks WHERE id = ${parkId}
      `);
      
      if (!parkResult.rows || parkResult.rows.length === 0) {
        return res.status(404).json({ message: "Parque no encontrado" });
      }
      
      // Obtener árboles del parque con información de especies
      const result = await db.execute(sql`
        SELECT 
          t.*, 
          s.common_name, s.scientific_name, s.family, s.origin,
          s.image_url as species_image
        FROM 
          trees t
          LEFT JOIN tree_species s ON t.species_id = s.id
        WHERE 
          t.park_id = ${parkId}
        ORDER BY
          t.id DESC
      `);
      
      // Formatear los resultados
      const formattedTrees = result.rows.map(tree => ({
        id: tree.id,
        // Crear un código generado a partir del ID
        code: `ARB-${tree.id.toString().padStart(5, '0')}`,
        speciesId: tree.species_id,
        parkId: tree.park_id,
        latitude: tree.latitude,
        longitude: tree.longitude,
        plantingDate: tree.planting_date,
        height: tree.height,
        diameter: tree.trunk_diameter,
        healthStatus: tree.health_status,
        condition: tree.condition,
        locationDescription: tree.location_description,
        lastMaintenanceDate: tree.last_maintenance_date,
        notes: tree.notes,
        createdAt: tree.created_at,
        updatedAt: tree.updated_at,
        species: {
          id: tree.species_id,
          commonName: tree.common_name,
          scientificName: tree.scientific_name,
          family: tree.family,
          origin: tree.origin,
          imageUrl: tree.species_image
        }
      }));
      
      res.json(formattedTrees);
    } catch (error) {
      console.error("Error al obtener árboles del parque:", error);
      res.status(500).json({ message: "Error al obtener árboles del parque" });
    }
  });

  // Obtener estadísticas para el dashboard
  apiRouter.get("/trees-stats", async (req: Request, res: Response) => {
    try {
      // Contar árboles por estado de salud
      const healthStats = await db.execute(sql`
        SELECT health_status, COUNT(*) as count
        FROM trees
        GROUP BY health_status
        ORDER BY count DESC
      `);
      
      // Contar árboles por especie
      const speciesStats = await db.execute(sql`
        SELECT s.common_name, COUNT(t.id) as count
        FROM trees t
        JOIN tree_species s ON t.species_id = s.id
        GROUP BY s.common_name
        ORDER BY count DESC
        LIMIT 10
      `);
      
      // Contar árboles por parque
      const parkStats = await db.execute(sql`
        SELECT p.name, COUNT(t.id) as count
        FROM trees t
        JOIN parks p ON t.park_id = p.id
        GROUP BY p.name
        ORDER BY count DESC
        LIMIT 10
      `);
      
      // Contar mantenimientos recientes (último mes)
      const recentMaintenances = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM tree_maintenances
        WHERE created_at >= NOW() - INTERVAL '1 month'
      `);
      
      // Contar árboles que necesitan mantenimiento
      const needMaintenance = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM trees
        WHERE 
          health_status IN ('Malo', 'Crítico')
          OR last_maintenance_date IS NULL
          OR last_maintenance_date < NOW() - INTERVAL '1 year'
      `);
      
      res.json({
        healthStatus: healthStats.rows,
        bySpecies: speciesStats.rows,
        byPark: parkStats.rows,
        recentMaintenances: recentMaintenances.rows[0]?.count || 0,
        needMaintenance: needMaintenance.rows[0]?.count || 0
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de árboles:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de árboles" });
    }
  });
}