import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, hasMunicipalityAccess, hasParkAccess } from "./middleware/auth";
import { db, pool } from "./db";
import { sql, eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import { videoRouter } from "./video_routes";
import { registerVolunteerRoutes } from "./volunteerRoutes";
import { 
  uploadParkFile, 
  handleMulterErrors, 
  generateImportTemplate, 
  processImportFile 
} from "./api/parksImport";
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
  
  // Registramos las rutas del módulo de voluntariado
  registerVolunteerRoutes(app, apiRouter, null, isAuthenticated);
  
  app.use('/api', apiRouter);

  // Get all parks with option to filter
  apiRouter.get("/parks", async (req: Request, res: Response) => {
    try {
      const municipalityId = req.query.municipalityId ? Number(req.query.municipalityId) : undefined;
      const parkType = req.query.parkType ? String(req.query.parkType) : undefined;
      const postalCode = req.query.postalCode ? String(req.query.postalCode) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      
      // Parse amenities from query (comma-separated list of IDs)
      let amenities: number[] | undefined;
      if (req.query.amenities) {
        amenities = String(req.query.amenities).split(',').map(id => Number(id));
      }
      
      const parks = await storage.getExtendedParks({
        municipalityId,
        parkType,
        postalCode,
        amenities,
        search,
        includeDeleted: false // Asegurarnos de excluir parques eliminados
      });
      
      res.json(parks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching parks" });
    }
  });

  // Get a specific park by ID with all related data

  
  apiRouter.get("/parks/:id", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const park = await storage.getExtendedPark(parkId);
      
      if (!park) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      res.json(park);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park" });
    }
  });

  // Create a new park (admin/municipality only)
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
      
      const newPark = await storage.createPark(parkData);
      res.status(201).json(newPark);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error creating park" });
    }
  });
  
  // Import parks from Excel/CSV
  apiRouter.post("/parks/import", isAuthenticated, hasMunicipalityAccess(), uploadParkFile, handleMulterErrors, processImportFile);

  // Ruta normal para actualizar un parque (con verificación de permisos)
  apiRouter.put("/parks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      
      // Impedir que se modifique el municipalityId del parque
      if (req.body.municipalityId !== undefined) {
        const park = await storage.getPark(parkId);
        if (park && park.municipalityId !== req.body.municipalityId) {
          return res.status(403).json({ 
            message: "No se permite cambiar el municipio de un parque existente" 
          });
        }
      }
      
      // Partial validation is fine for updates
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
          area, parkType, openingHours, contactPhone, contactEmail,
          administrator, conservationStatus, regulationUrl, foundationYear, videoUrl
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
        if (parkType !== undefined) fieldsToUpdate.park_type = parkType;
        if (openingHours !== undefined) fieldsToUpdate.opening_hours = openingHours;
        if (contactPhone !== undefined) fieldsToUpdate.contact_phone = contactPhone;
        if (contactEmail !== undefined) fieldsToUpdate.contact_email = contactEmail;
        if (administrator !== undefined) fieldsToUpdate.administrator = administrator;
        if (conservationStatus !== undefined) fieldsToUpdate.conservation_status = conservationStatus;
        if (regulationUrl !== undefined) fieldsToUpdate.regulation_url = regulationUrl;
        if (foundationYear !== undefined) fieldsToUpdate.foundation_year = foundationYear;
        if (videoUrl !== undefined) fieldsToUpdate.video_url = videoUrl;
        
        // Agregamos la fecha de actualización
        fieldsToUpdate.updated_at = new Date();
        
        // Construimos el SQL para la actualización
        if (Object.keys(fieldsToUpdate).length > 0) {
          // Actualizamos el parque directamente
          const result = await db.update(schema.parks)
            .set(fieldsToUpdate)
            .where(eq(schema.parks.id, parkId))
            .returning();
          
          if (result.length > 0) {
            console.log("Parque actualizado con éxito (SQL directo):", result[0]);
            res.json(result[0]);
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
  apiRouter.delete("/parks/:id", isAuthenticated, hasParkAccess, async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const result = await storage.deletePark(parkId);
      
      if (!result) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting park" });
    }
  });

  // Get all amenities
  apiRouter.get("/amenities", async (_req: Request, res: Response) => {
    try {
      const amenities = await storage.getAmenities();
      res.json(amenities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching amenities" });
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
      
      const newAmenity = await storage.createAmenity(data);
      res.status(201).json(newAmenity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating amenity" });
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
      
      const updatedAmenity = await storage.updateAmenity(id, data);
      
      if (!updatedAmenity) {
        return res.status(404).json({ message: "Amenidad no encontrada" });
      }
      
      res.json(updatedAmenity);
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
      // Verificar que el usuario sea administrador
      if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Solo administradores pueden gestionar amenidades" });
      }
      
      const id = Number(req.params.id);
      
      // Verificar si la amenidad está siendo utilizada por algún parque
      const inUse = await storage.isAmenityInUse(id);
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

  // Get amenities for a specific park
  apiRouter.get("/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const amenities = await storage.getParkAmenities(parkId);
      res.json(amenities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park amenities" });
    }
  });

  // Add an amenity to a park (admin/municipality only)
  apiRouter.post("/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const amenityId = Number(req.body.amenityId);
      
      const data = insertParkAmenitySchema.parse({ parkId, amenityId });
      const result = await storage.addAmenityToPark(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding amenity to park" });
    }
  });

  // Remove an amenity from a park (admin/municipality only)
  apiRouter.delete("/parks/:parkId/amenities/:amenityId", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const amenityId = Number(req.params.amenityId);
      
      const result = await storage.removeAmenityFromPark(parkId, amenityId);
      
      if (!result) {
        return res.status(404).json({ message: "Amenity not found for this park" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing amenity from park" });
    }
  });

  // Get images for a specific park
  apiRouter.get("/parks/:id/images", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const images = await storage.getParkImages(parkId);
      res.json(images);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park images" });
    }
  });

  // Add an image to a park (admin/municipality only)
  apiRouter.post("/parks/:id/images", isAuthenticated, hasParkAccess, (req: Request, res: Response, next: Function) => {
    // Importar los módulos necesarios usando import dinámico
    import('./api/imageUpload').then(({ uploadParkImage, handleImageUploadErrors, uploadParkImageHandler }) => {
      // Aplicar manejo de errores
      uploadParkImage(req, res, (err: any) => {
        if (err) {
          return handleImageUploadErrors(err, req, res, next);
        }
        
        // Si no hay errores, procesar la imagen
        return uploadParkImageHandler(req, res);
      });
    }).catch(error => {
      console.error("Error al cargar módulo de carga de imágenes:", error);
      res.status(500).json({ error: "Error interno al procesar la solicitud de carga de imágenes" });
    });
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

  // Public API feature for connecting with other municipal applications
  // This creates endpoints that other municipal apps can use
  const publicRouter = express.Router();
  app.use('/public-api', publicRouter);
  
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
  
  // Get amenities for a specific park - for external applications
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
  
  return httpServer;
}
