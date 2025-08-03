import { Express } from "express";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { db } from "./db";
import { reservableSpaces, spaceReservations, parks, spaceImages, spaceDocuments } from "../shared/schema";
import { insertSpaceImageSchema, insertSpaceDocumentSchema } from "../shared/schema";
import { ObjectStorageService } from "./objectStorage";

export function registerReservableSpacesRoutes(app: Express) {
  
  // Obtener todos los espacios reservables con información del parque
  app.get("/api/reservable-spaces", async (req, res) => {
    try {
      const spaces = await db
        .select({
          id: reservableSpaces.id,
          name: reservableSpaces.name,
          description: reservableSpaces.description,
          spaceType: reservableSpaces.spaceType,
          capacity: reservableSpaces.capacity,
          hourlyRate: reservableSpaces.hourlyRate,
          minimumHours: reservableSpaces.minimumHours,
          maximumHours: reservableSpaces.maximumHours,
          amenities: reservableSpaces.amenities,
          rules: reservableSpaces.rules,
          isActive: reservableSpaces.isActive,
          requiresApproval: reservableSpaces.requiresApproval,
          advanceBookingDays: reservableSpaces.advanceBookingDays,
          images: reservableSpaces.images,
          coordinates: reservableSpaces.coordinates,
          parkId: reservableSpaces.parkId,
          parkName: parks.name,
          createdAt: reservableSpaces.createdAt,
          updatedAt: reservableSpaces.updatedAt
        })
        .from(reservableSpaces)
        .leftJoin(parks, eq(reservableSpaces.parkId, parks.id))
        .where(eq(reservableSpaces.isActive, true))
        .orderBy(reservableSpaces.name);

      console.log(`🎪 Encontrados ${spaces.length} espacios reservables`);
      res.json(spaces);
    } catch (error) {
      console.error("Error al obtener espacios reservables:", error);
      res.status(500).json({ error: "Error al obtener espacios reservables" });
    }
  });

  // Obtener un espacio reservable específico (dos rutas para compatibilidad)
  const getSpaceById = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      
      const space = await db
        .select({
          id: reservableSpaces.id,
          name: reservableSpaces.name,
          description: reservableSpaces.description,
          spaceType: reservableSpaces.spaceType,
          capacity: reservableSpaces.capacity,
          hourlyRate: reservableSpaces.hourlyRate,
          minimumHours: reservableSpaces.minimumHours,
          maximumHours: reservableSpaces.maximumHours,
          amenities: reservableSpaces.amenities,
          rules: reservableSpaces.rules,
          isActive: reservableSpaces.isActive,
          requiresApproval: reservableSpaces.requiresApproval,
          advanceBookingDays: reservableSpaces.advanceBookingDays,
          images: reservableSpaces.images,
          coordinates: reservableSpaces.coordinates,
          parkId: reservableSpaces.parkId,
          parkName: parks.name,
          createdAt: reservableSpaces.createdAt,
          updatedAt: reservableSpaces.updatedAt
        })
        .from(reservableSpaces)
        .leftJoin(parks, eq(reservableSpaces.parkId, parks.id))
        .where(eq(reservableSpaces.id, parseInt(id)))
        .limit(1);

      if (space.length === 0) {
        return res.status(404).json({ error: "Espacio no encontrado" });
      }

      console.log(`🏛️ Espacio encontrado: ${space[0].name}`);
      res.json(space[0]);
    } catch (error) {
      console.error("Error al obtener detalles del espacio:", error);
      res.status(500).json({ error: "Error al obtener detalles del espacio" });
    }
  };

  // Registrar ambas rutas para compatibilidad
  app.get("/api/reservable-spaces/:id", getSpaceById);
  app.get("/api/spaces/:id", getSpaceById);

  // Obtener reservas existentes para un espacio específico
  app.get("/api/space-reservations/space/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const reservations = await db
        .select()
        .from(spaceReservations)
        .where(eq(spaceReservations.spaceId, parseInt(id)))
        .orderBy(desc(spaceReservations.createdAt));

      console.log(`📅 Encontradas ${reservations.length} reservas para espacio ${id}`);
      res.json(reservations);
    } catch (error) {
      console.error("Error al obtener reservas del espacio:", error);
      res.status(500).json({ error: "Error al obtener reservas del espacio" });
    }
  });

  // Obtener estadísticas de reservas para un espacio
  app.get("/api/space-reservations/stats/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const stats = await db
        .select({
          totalReservations: count(),
          confirmedReservations: sql<number>`SUM(CASE WHEN ${spaceReservations.status} = 'confirmed' THEN 1 ELSE 0 END)`,
          pendingReservations: sql<number>`SUM(CASE WHEN ${spaceReservations.status} = 'pending' THEN 1 ELSE 0 END)`,
          cancelledReservations: sql<number>`SUM(CASE WHEN ${spaceReservations.status} = 'cancelled' THEN 1 ELSE 0 END)`
        })
        .from(spaceReservations)
        .where(eq(spaceReservations.spaceId, parseInt(id)))
        .groupBy(spaceReservations.spaceId);

      const result = stats.length > 0 ? stats[0] : {
        totalReservations: 0,
        confirmedReservations: 0,
        pendingReservations: 0,
        cancelledReservations: 0
      };

      console.log(`📊 Estadísticas para espacio ${id}:`, result);
      res.json(result);
    } catch (error) {
      console.error("Error al obtener estadísticas del espacio:", error);
      res.status(500).json({ error: "Error al obtener estadísticas del espacio" });
    }
  });

  // Crear una nueva reserva de espacio
  app.post("/api/space-reservations/spaces/:id/reserve", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        customerName,
        customerEmail,
        customerPhone,
        reservationDate,
        startTime,
        endTime,
        specialRequests
      } = req.body;

      // Validar campos requeridos
      if (!customerName || !customerEmail || !customerPhone || !reservationDate || !startTime || !endTime) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
      }

      // Obtener información del espacio
      const space = await db
        .select()
        .from(reservableSpaces)
        .where(eq(reservableSpaces.id, parseInt(id)))
        .limit(1);

      if (space.length === 0) {
        return res.status(404).json({ error: "Espacio no encontrado" });
      }

      // Calcular duración y costo
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      const totalHours = endHour - startHour;
      const hourlyRate = parseFloat(space[0].hourlyRate);
      const totalCost = totalHours * hourlyRate;

      // Validar disponibilidad del horario
      const existingReservations = await db
        .select()
        .from(spaceReservations)
        .where(
          and(
            eq(spaceReservations.spaceId, parseInt(id)),
            eq(spaceReservations.reservationDate, reservationDate),
            sql`${spaceReservations.status} != 'cancelled'`
          )
        );

      const isTimeSlotAvailable = !existingReservations.some(reservation => 
        (startTime >= reservation.startTime && startTime < reservation.endTime) ||
        (endTime > reservation.startTime && endTime <= reservation.endTime) ||
        (startTime <= reservation.startTime && endTime >= reservation.endTime)
      );

      if (!isTimeSlotAvailable) {
        return res.status(400).json({ error: "El horario seleccionado no está disponible" });
      }

      // Crear la reserva - usando el esquema correcto de la base de datos
      const newReservation = await db
        .insert(spaceReservations)
        .values({
          spaceId: parseInt(id),
          reservedBy: 1, // TODO: usar usuario autenticado cuando esté disponible
          contactName: customerName,
          contactEmail: customerEmail,
          contactPhone: customerPhone,
          reservationDate,
          startTime,
          endTime,
          expectedAttendees: null,
          purpose: specialRequests || 'Reserva general de espacio',
          specialRequests: specialRequests || null,
          totalCost: totalCost.toString(),
          depositPaid: "0.00",
          status: space[0].requiresApproval ? 'pending' : 'confirmed'
        })
        .returning();

      console.log(`✅ Reserva creada para espacio ${space[0].name}: ${customerName} (${reservationDate} ${startTime}-${endTime})`);

      // TODO: Enviar email de confirmación
      // await sendSpaceReservationConfirmationEmail(newReservation[0], space[0]);

      res.status(201).json({
        success: true,
        reservation: newReservation[0],
        message: space[0].requiresApproval 
          ? "Reserva creada exitosamente. Está pendiente de aprobación."
          : "Reserva confirmada exitosamente."
      });

    } catch (error) {
      console.error("Error al crear reserva:", error);
      res.status(500).json({ error: "Error al crear la reserva" });
    }
  });

  // Actualizar un espacio reservable
  app.put("/api/reservable-spaces/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log(`🔧 Actualizando espacio ${id} con datos:`, updateData);

      // Validar que el espacio existe
      const existingSpace = await db
        .select()
        .from(reservableSpaces)
        .where(eq(reservableSpaces.id, parseInt(id)))
        .limit(1);

      if (existingSpace.length === 0) {
        return res.status(404).json({ error: "Espacio no encontrado" });
      }

      // Actualizar el espacio
      const updatedSpace = await db
        .update(reservableSpaces)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(reservableSpaces.id, parseInt(id)))
        .returning();

      console.log(`✅ Espacio ${id} actualizado exitosamente`);

      res.json({
        success: true,
        space: updatedSpace[0],
        message: "Espacio actualizado exitosamente"
      });

    } catch (error) {
      console.error("Error al actualizar espacio:", error);
      res.status(500).json({ error: "Error al actualizar el espacio" });
    }
  });

  // Ruta para obtener URL de subida de imagen/documento
  app.post("/api/spaces/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error al obtener URL de subida:", error);
      res.status(500).json({ error: "Error al obtener URL de subida" });
    }
  });

  // Ruta para guardar imagen después de la subida
  app.post("/api/spaces/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl, caption, isPrimary } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl es requerido" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(imageUrl);

      // Si es imagen principal, quitar la marca de las demás
      if (isPrimary) {
        await db
          .update(spaceImages)
          .set({ isPrimary: false })
          .where(eq(spaceImages.spaceId, parseInt(id)));
      }

      const newImage = await db
        .insert(spaceImages)
        .values({
          spaceId: parseInt(id),
          imageUrl: normalizedPath,
          caption: caption || null,
          isPrimary: isPrimary || false,
        })
        .returning();

      res.json({
        success: true,
        image: newImage[0],
        message: "Imagen guardada exitosamente"
      });

    } catch (error) {
      console.error("Error al guardar imagen:", error);
      res.status(500).json({ error: "Error al guardar la imagen" });
    }
  });

  // Ruta para guardar documento después de la subida
  app.post("/api/spaces/:id/documents", async (req, res) => {
    try {
      const { id } = req.params;
      const { documentUrl, title, description, fileSize } = req.body;

      if (!documentUrl || !title) {
        return res.status(400).json({ error: "documentUrl y title son requeridos" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(documentUrl);

      const newDocument = await db
        .insert(spaceDocuments)
        .values({
          spaceId: parseInt(id),
          documentUrl: normalizedPath,
          title,
          description: description || null,
          fileSize: fileSize || null,
        })
        .returning();

      res.json({
        success: true,
        document: newDocument[0],
        message: "Documento guardado exitosamente"
      });

    } catch (error) {
      console.error("Error al guardar documento:", error);
      res.status(500).json({ error: "Error al guardar el documento" });
    }
  });

  // Ruta para obtener imágenes de un espacio
  app.get("/api/spaces/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      
      const images = await db
        .select()
        .from(spaceImages)
        .where(eq(spaceImages.spaceId, parseInt(id)))
        .orderBy(desc(spaceImages.isPrimary), desc(spaceImages.createdAt));

      res.json(images);
    } catch (error) {
      console.error("Error al obtener imágenes:", error);
      res.status(500).json({ error: "Error al obtener las imágenes" });
    }
  });

  // Ruta para obtener documentos de un espacio
  app.get("/api/spaces/:id/documents", async (req, res) => {
    try {
      const { id } = req.params;
      
      const documents = await db
        .select()
        .from(spaceDocuments)
        .where(eq(spaceDocuments.spaceId, parseInt(id)))
        .orderBy(desc(spaceDocuments.createdAt));

      res.json(documents);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
      res.status(500).json({ error: "Error al obtener los documentos" });
    }
  });

  // Ruta para eliminar una imagen
  app.delete("/api/spaces/images/:imageId", async (req, res) => {
    try {
      const { imageId } = req.params;
      
      await db
        .delete(spaceImages)
        .where(eq(spaceImages.id, parseInt(imageId)));

      res.json({
        success: true,
        message: "Imagen eliminada exitosamente"
      });
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      res.status(500).json({ error: "Error al eliminar la imagen" });
    }
  });

  // Ruta para eliminar un documento
  app.delete("/api/spaces/documents/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      
      await db
        .delete(spaceDocuments)
        .where(eq(spaceDocuments.id, parseInt(documentId)));

      res.json({
        success: true,
        message: "Documento eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      res.status(500).json({ error: "Error al eliminar el documento" });
    }
  });

  // Rutas para object storage uploads
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Error al obtener URL de subida" });
    }
  });

  // Ruta para agregar imagen a espacio después de upload
  app.post("/api/spaces/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl, caption, isPrimary } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "URL de imagen es requerida" });
      }

      // Si es imagen principal, desmarcar otras como principales
      if (isPrimary) {
        await db
          .update(spaceImages)
          .set({ isPrimary: false })
          .where(eq(spaceImages.spaceId, parseInt(id)));
      }

      const imageData = {
        spaceId: parseInt(id),
        imageUrl,
        caption: caption || null,
        isPrimary: isPrimary || false,
        createdAt: new Date().toISOString()
      };

      const result = await db
        .insert(spaceImages)
        .values(imageData)
        .returning();

      res.json({ 
        success: true, 
        message: "Imagen agregada exitosamente",
        image: result[0]
      });
    } catch (error) {
      console.error("Error al agregar imagen:", error);
      res.status(500).json({ error: "Error al agregar la imagen" });
    }
  });

  // Ruta para agregar documento a espacio después de upload
  app.post("/api/spaces/:id/documents", async (req, res) => {
    try {
      const { id } = req.params;
      const { documentUrl, title, description, fileSize } = req.body;

      if (!documentUrl) {
        return res.status(400).json({ error: "URL de documento es requerida" });
      }

      if (!title) {
        return res.status(400).json({ error: "Título es requerido" });
      }

      const documentData = {
        spaceId: parseInt(id),
        documentUrl,
        title,
        description: description || null,
        fileSize: fileSize || null,
        createdAt: new Date().toISOString()
      };

      const result = await db
        .insert(spaceDocuments)
        .values(documentData)
        .returning();

      res.json({ 
        success: true, 
        message: "Documento agregado exitosamente",
        document: result[0]
      });
    } catch (error) {
      console.error("Error al agregar documento:", error);
      res.status(500).json({ error: "Error al agregar el documento" });
    }
  });
}