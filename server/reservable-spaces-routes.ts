import { Express } from "express";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { db } from "./db";
import { reservableSpaces, spaceReservations, parks } from "../shared/schema";

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

  // Obtener un espacio reservable específico
  app.get("/api/reservable-spaces/:id", async (req, res) => {
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
  });

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
}