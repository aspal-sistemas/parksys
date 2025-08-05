/**
 * Rutas para la gestión de ubicaciones de concesiones
 */
import { Request, Response, Router } from "express";
import multer from "multer";
import { db } from "./db";
import { sql } from "drizzle-orm";
import path from "path";
import fs from "fs";

/**
 * Registra las rutas para el módulo de ubicaciones de concesiones
 * @param app Aplicación Express
 * @param apiRouter Router de la API
 * @param isAuthenticated Middleware de autenticación
 */
export function registerConcessionLocationsRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  console.log("Registrando rutas de ubicaciones de concesiones...");

  // Configuración para subida de archivos
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "public/uploads/locations");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'location-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  // Obtener todas las ubicaciones de concesiones
  apiRouter.get("/concession-locations", async (_req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT cl.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name,
          pz.name as zone_name
        FROM concession_locations cl
        LEFT JOIN concession_contracts cc ON cl.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        LEFT JOIN park_zones pz ON cl.park_zone_id = pz.id
        ORDER BY cl.created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener ubicaciones de concesiones:", error);
      res.status(500).json({ message: "Error al obtener ubicaciones de concesiones" });
    }
  });

  // Obtener ubicación de concesión por ID
  apiRouter.get("/concession-locations/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await db.execute(sql`
        SELECT cl.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name,
          pz.name as zone_name
        FROM concession_locations cl
        LEFT JOIN concession_contracts cc ON cl.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        LEFT JOIN park_zones pz ON cl.park_zone_id = pz.id
        WHERE cl.id = ${id}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Ubicación de concesión no encontrada" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener ubicación de concesión:", error);
      res.status(500).json({ message: "Error al obtener ubicación de concesión" });
    }
  });

  // Crear nueva ubicación de concesión
  apiRouter.post("/concession-locations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const {
        contractId,
        parkZoneId,
        latitude,
        longitude,
        areaSize,
        locationDescription,
        polygonCoordinates
      } = req.body;

      // Validar que existe el contrato
      const contractResult = await db.execute(sql`
        SELECT * FROM concession_contracts WHERE id = ${contractId}
      `);

      if (contractResult.rows.length === 0) {
        return res.status(404).json({ message: "Contrato de concesión no encontrado" });
      }

      // Crear la ubicación
      const result = await db.execute(sql`
        INSERT INTO concession_locations (
          contract_id, 
          park_zone_id, 
          latitude, 
          longitude, 
          area_size, 
          location_description, 
          polygon_coordinates,
          created_at,
          updated_at
        )
        VALUES (
          ${contractId}, 
          ${parkZoneId || null}, 
          ${latitude || null}, 
          ${longitude || null}, 
          ${areaSize}, 
          ${locationDescription || null}, 
          ${polygonCoordinates ? JSON.parse(polygonCoordinates) : null},
          NOW(),
          NOW()
        )
        RETURNING *
      `);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error al crear ubicación de concesión:", error);
      res.status(500).json({ message: "Error al crear ubicación de concesión" });
    }
  });

  // Actualizar ubicación de concesión
  apiRouter.put("/concession-locations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        contractId,
        parkZoneId,
        latitude,
        longitude,
        areaSize,
        locationDescription,
        polygonCoordinates
      } = req.body;

      // Verificar que la ubicación existe
      const locationResult = await db.execute(sql`
        SELECT * FROM concession_locations WHERE id = ${id}
      `);

      if (locationResult.rows.length === 0) {
        return res.status(404).json({ message: "Ubicación de concesión no encontrada" });
      }

      // Actualizar la ubicación
      const result = await db.execute(sql`
        UPDATE concession_locations
        SET
          contract_id = ${contractId},
          park_zone_id = ${parkZoneId || null},
          latitude = ${latitude || null},
          longitude = ${longitude || null},
          area_size = ${areaSize},
          location_description = ${locationDescription || null},
          polygon_coordinates = ${polygonCoordinates ? JSON.parse(polygonCoordinates) : null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al actualizar ubicación de concesión:", error);
      res.status(500).json({ message: "Error al actualizar ubicación de concesión" });
    }
  });

  // Eliminar ubicación de concesión
  apiRouter.delete("/concession-locations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verificar que la ubicación existe
      const locationResult = await db.execute(sql`
        SELECT * FROM concession_locations WHERE id = ${id}
      `);

      if (locationResult.rows.length === 0) {
        return res.status(404).json({ message: "Ubicación de concesión no encontrada" });
      }

      // Eliminar la ubicación
      await db.execute(sql`
        DELETE FROM concession_locations WHERE id = ${id}
      `);

      res.json({ message: "Ubicación de concesión eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar ubicación de concesión:", error);
      res.status(500).json({ message: "Error al eliminar ubicación de concesión" });
    }
  });

  // Obtener ubicaciones por contrato
  apiRouter.get("/concession-contracts/:contractId/locations", async (req: Request, res: Response) => {
    try {
      const { contractId } = req.params;
      
      const result = await db.execute(sql`
        SELECT cl.*, 
          cc.park_id,
          p.name as park_name,
          u.full_name as concessionaire_name,
          pz.name as zone_name
        FROM concession_locations cl
        LEFT JOIN concession_contracts cc ON cl.contract_id = cc.id
        LEFT JOIN parks p ON cc.park_id = p.id
        LEFT JOIN users u ON cc.concessionaire_id = u.id
        LEFT JOIN park_zones pz ON cl.park_zone_id = pz.id
        WHERE cl.contract_id = ${contractId}
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener ubicaciones de contrato:", error);
      res.status(500).json({ message: "Error al obtener ubicaciones de contrato" });
    }
  });

  // Obtener zonas de parques
  apiRouter.get("/park-zones", async (_req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT pz.*, p.name as park_name
        FROM park_zones pz
        LEFT JOIN parks p ON pz.park_id = p.id
        ORDER BY p.name, pz.name
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener zonas de parques:", error);
      res.status(500).json({ message: "Error al obtener zonas de parques" });
    }
  });

  // Crear zona de parque
  apiRouter.post("/park-zones", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const {
        parkId,
        name,
        description,
        polygonCoordinates
      } = req.body;

      // Validar que existe el parque
      const parkResult = await db.execute(sql`
        SELECT * FROM parks WHERE id = ${parkId}
      `);

      if (parkResult.rows.length === 0) {
        return res.status(404).json({ message: "Parque no encontrado" });
      }

      // Crear la zona
      const result = await db.execute(sql`
        INSERT INTO park_zones (
          park_id,
          name,
          description,
          polygon_coordinates,
          created_at,
          updated_at
        )
        VALUES (
          ${parkId},
          ${name},
          ${description || null},
          ${polygonCoordinates ? JSON.parse(polygonCoordinates) : null},
          NOW(),
          NOW()
        )
        RETURNING *
      `);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error al crear zona de parque:", error);
      res.status(500).json({ message: "Error al crear zona de parque" });
    }
  });

  // Obtener zonas de un parque específico
  apiRouter.get("/parks/:parkId/zones", async (req: Request, res: Response) => {
    try {
      const { parkId } = req.params;
      
      const result = await db.execute(sql`
        SELECT * FROM park_zones
        WHERE park_id = ${parkId}
        ORDER BY name
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener zonas del parque:", error);
      res.status(500).json({ message: "Error al obtener zonas del parque" });
    }
  });
}