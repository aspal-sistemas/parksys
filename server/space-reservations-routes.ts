/**
 * RUTAS API: SISTEMA DE RESERVAS DE ESPACIOS
 * ==========================================
 * 
 * Endpoints para gestionar espacios reservables y sus reservas
 */

import { Request, Response } from 'express';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export function registerSpaceReservationRoutes(app: any, apiRouter: any, isAuthenticated: any) {
  console.log("🎪 Registrando rutas del sistema de reservas de espacios...");

  // ===== ESPACIOS RESERVABLES =====

  // Obtener todos los espacios reservables
  apiRouter.get('/reservable-spaces', async (req: Request, res: Response) => {
    try {
      const { parkId, spaceType, isActive } = req.query;
      const { pool } = await import("./db");

      let query = `
        SELECT 
          rs.*,
          p.name as park_name,
          p.municipality_id
        FROM reservable_spaces rs
        JOIN parks p ON rs.park_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (parkId) {
        params.push(parkId);
        query += ` AND rs.park_id = $${params.length}`;
      }

      if (spaceType) {
        params.push(spaceType);
        query += ` AND rs.space_type = $${params.length}`;
      }

      if (isActive !== undefined) {
        params.push(isActive === 'true');
        query += ` AND rs.is_active = $${params.length}`;
      }

      query += ` ORDER BY p.name, rs.name`;

      const result = await pool.query(query, params);
      
      console.log(`🎪 Encontrados ${result.rows.length} espacios reservables`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching reservable spaces:', error);
      res.status(500).json({ error: 'Error al obtener espacios reservables' });
    }
  });

  // Obtener espacio reservable por ID
  apiRouter.get('/reservable-spaces/:id', async (req: Request, res: Response) => {
    try {
      const spaceId = parseInt(req.params.id);
      const { pool } = await import("./db");

      const query = `
        SELECT 
          rs.*,
          p.name as park_name,
          p.municipality_id
        FROM reservable_spaces rs
        JOIN parks p ON rs.park_id = p.id
        WHERE rs.id = $1
      `;

      const result = await pool.query(query, [spaceId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Espacio no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching space details:', error);
      res.status(500).json({ error: 'Error al obtener detalles del espacio' });
    }
  });

  // Crear nuevo espacio reservable
  apiRouter.post('/reservable-spaces', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import("./db");
      
      // Log para debugging
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      
      const {
        parkId,
        name,
        description,
        spaceType,
        capacity,
        hourlyRate,
        minimumHours,
        maximumHours,
        amenities,
        rules,
        requiresApproval,
        advanceBookingDays,
        coordinates
      } = req.body;
      
      console.log('🏞️ parkId recibido:', parkId, 'tipo:', typeof parkId);

      const query = `
        INSERT INTO reservable_spaces (
          park_id, name, description, space_type, capacity,
          hourly_rate, minimum_hours, maximum_hours, amenities,
          rules, requires_approval, advance_booking_days, coordinates
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const result = await pool.query(query, [
        parkId, name, description, spaceType, capacity,
        hourlyRate || 0, minimumHours || 1, maximumHours || 8,
        amenities, rules, requiresApproval || false,
        advanceBookingDays || 30, coordinates
      ]);

      console.log(`🎪 Espacio creado: ${name}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating reservable space:', error);
      res.status(500).json({ error: 'Error al crear espacio reservable' });
    }
  });

  // ===== RESERVAS =====

  // Obtener todas las reservas
  apiRouter.get('/space-reservations', async (req: Request, res: Response) => {
    try {
      const { spaceId, status, startDate, endDate } = req.query;
      const { pool } = await import("./db");

      let query = `
        SELECT 
          sr.*,
          rs.name as space_name,
          rs.space_type,
          p.name as park_name
        FROM space_reservations sr
        JOIN reservable_spaces rs ON sr.space_id = rs.id
        JOIN parks p ON rs.park_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (spaceId) {
        params.push(spaceId);
        query += ` AND sr.space_id = $${params.length}`;
      }

      if (status) {
        params.push(status);
        query += ` AND sr.status = $${params.length}`;
      }

      if (startDate) {
        params.push(startDate);
        query += ` AND sr.reservation_date >= $${params.length}`;
      }

      if (endDate) {
        params.push(endDate);
        query += ` AND sr.reservation_date <= $${params.length}`;
      }

      query += ` ORDER BY sr.reservation_date DESC, sr.start_time DESC`;

      const result = await pool.query(query, params);
      
      console.log(`📅 Encontradas ${result.rows.length} reservas`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ error: 'Error al obtener reservas' });
    }
  });

  // Crear nueva reserva
  apiRouter.post('/space-reservations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { pool } = await import("./db");
      const {
        spaceId,
        eventId,
        activityId,
        contactName,
        contactPhone,
        contactEmail,
        reservationDate,
        startTime,
        endTime,
        expectedAttendees,
        purpose,
        specialRequests,
        totalCost
      } = req.body;

      // Verificar disponibilidad
      const conflictQuery = `
        SELECT id FROM space_reservations
        WHERE space_id = $1 
        AND reservation_date = $2
        AND status NOT IN ('cancelled')
        AND (
          (start_time <= $3 AND end_time > $3) OR
          (start_time < $4 AND end_time >= $4) OR
          (start_time >= $3 AND end_time <= $4)
        )
      `;

      const conflictResult = await pool.query(conflictQuery, [
        spaceId, reservationDate, startTime, endTime
      ]);

      if (conflictResult.rows.length > 0) {
        return res.status(409).json({ 
          error: 'El espacio ya está reservado en ese horario' 
        });
      }

      const insertQuery = `
        INSERT INTO space_reservations (
          space_id, event_id, activity_id, reserved_by,
          contact_name, contact_phone, contact_email,
          reservation_date, start_time, end_time,
          expected_attendees, purpose, special_requests, total_cost
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        spaceId, eventId, activityId, req.user?.id || 1,
        contactName, contactPhone, contactEmail,
        reservationDate, startTime, endTime,
        expectedAttendees, purpose, specialRequests, totalCost || 0
      ]);

      console.log(`📅 Reserva creada: ${contactName} - ${reservationDate}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ error: 'Error al crear reserva' });
    }
  });

  // Actualizar estado de reserva
  apiRouter.put('/space-reservations/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const reservationId = parseInt(req.params.id);
      const { status, notes, approvedBy } = req.body;
      const { pool } = await import("./db");

      const query = `
        UPDATE space_reservations 
        SET 
          status = $2,
          notes = $3,
          approved_by = $4,
          approved_at = CASE WHEN $2 = 'confirmed' THEN NOW() ELSE approved_at END,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [
        reservationId, status, notes, approvedBy
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      console.log(`📅 Reserva actualizada: ${reservationId} → ${status}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating reservation:', error);
      res.status(500).json({ error: 'Error al actualizar reserva' });
    }
  });

  // Cancelar reserva
  apiRouter.delete('/space-reservations/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const reservationId = parseInt(req.params.id);
      const { cancellationReason } = req.body;
      const { pool } = await import("./db");

      const query = `
        UPDATE space_reservations 
        SET 
          status = 'cancelled',
          cancellation_reason = $2,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [reservationId, cancellationReason]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      console.log(`❌ Reserva cancelada: ${reservationId}`);
      res.json({ message: 'Reserva cancelada correctamente' });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Error al cancelar reserva' });
    }
  });

  // Verificar disponibilidad de espacio
  apiRouter.get('/spaces/:id/availability', async (req: Request, res: Response) => {
    try {
      const spaceId = parseInt(req.params.id);
      const { date } = req.query;
      const { pool } = await import("./db");

      const query = `
        SELECT 
          start_time,
          end_time,
          status,
          contact_name
        FROM space_reservations
        WHERE space_id = $1 
        AND reservation_date = $2
        AND status NOT IN ('cancelled')
        ORDER BY start_time
      `;

      const result = await pool.query(query, [spaceId, date]);
      
      console.log(`⏰ Verificando disponibilidad espacio ${spaceId} - ${date}`);
      res.json({
        date,
        reservations: result.rows,
        isAvailable: result.rows.length === 0
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: 'Error al verificar disponibilidad' });
    }
  });

  // Estadísticas de reservas
  apiRouter.get('/reservations-stats', async (req: Request, res: Response) => {
    try {
      const { pool } = await import("./db");

      const query = `
        SELECT 
          COUNT(*) as total,
          status,
          rs.space_type
        FROM space_reservations sr
        JOIN reservable_spaces rs ON sr.space_id = rs.id
        GROUP BY status, rs.space_type
        ORDER BY status, rs.space_type
      `;

      const result = await pool.query(query);

      const stats = {
        total: 0,
        byStatus: {},
        bySpaceType: {}
      };

      result.rows.forEach((row: any) => {
        const count = parseInt(row.total);
        stats.total += count;
        
        if (row.status) {
          stats.byStatus[row.status] = (stats.byStatus[row.status] || 0) + count;
        }
        
        if (row.space_type) {
          stats.bySpaceType[row.space_type] = (stats.bySpaceType[row.space_type] || 0) + count;
        }
      });

      console.log(`📊 Estadísticas de reservas: ${stats.total} total`);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching reservations stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });

  console.log("✅ Rutas del sistema de reservas de espacios registradas correctamente");
}