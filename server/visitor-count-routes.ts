import { Router } from 'express';
import express from 'express';
import { db } from './db';
import { visitorCounts, parks, insertVisitorCountSchema } from '@shared/schema';
import { eq, sql, desc, and, gte, lte, sum } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Aplicar middleware JSON específicamente a este router
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Usar el schema de inserción desde shared/schema.ts con modificaciones para campos opcionales
const createVisitorCountSchema = insertVisitorCountSchema.extend({
  dayType: z.string().optional(),
  weather: z.string().optional(),
  notes: z.string().optional()
});

// Obtener todos los registros de visitantes con filtros
router.get('/visitor-counts', async (req, res) => {
  try {
    const { parkId, startDate, endDate, limit = 1000, offset = 0 } = req.query;
    
    let query = db
      .select({
        id: visitorCounts.id,
        parkId: visitorCounts.parkId,
        parkName: parks.name,
        date: visitorCounts.date,
        adults: visitorCounts.adults,
        children: visitorCounts.children,
        seniors: visitorCounts.seniors,
        pets: visitorCounts.pets,
        groups: visitorCounts.groups,
        totalVisitors: sql<number>`${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors}`,
        countingMethod: visitorCounts.countingMethod,
        dayType: visitorCounts.dayType,
        weather: visitorCounts.weather,
        notes: visitorCounts.notes,
        createdAt: visitorCounts.createdAt
      })
      .from(visitorCounts)
      .leftJoin(parks, eq(visitorCounts.parkId, parks.id))
      .orderBy(desc(visitorCounts.date))
      .limit(Number(limit))
      .offset(Number(offset));

    // Aplicar filtros
    const conditions = [];
    if (parkId) {
      conditions.push(eq(visitorCounts.parkId, Number(parkId)));
    }
    if (startDate) {
      conditions.push(gte(visitorCounts.date, startDate as string));
    }
    if (endDate) {
      conditions.push(lte(visitorCounts.date, endDate as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;
    
    // Obtener total de registros para paginación
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(visitorCounts);
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const [{ count }] = await countQuery;

    res.json({
      data: results,
      pagination: {
        total: count,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < count
      }
    });
  } catch (error) {
    console.error('Error obteniendo registros de visitantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo registro de visitantes
router.post('/visitor-counts', async (req, res) => {
  try {
    console.log('📥 Datos recibidos en el backend:', req.body);
    console.log('📋 Estructura del body:', Object.keys(req.body));
    console.log('📋 Tipos de datos:', Object.entries(req.body).map(([key, value]) => `${key}: ${typeof value}`));
    
    const validatedData = createVisitorCountSchema.parse(req.body);
    console.log('✅ Datos validados:', validatedData);
    
    const [newRecord] = await db
      .insert(visitorCounts)
      .values({
        parkId: validatedData.parkId,
        date: validatedData.date,
        adults: validatedData.adults,
        children: validatedData.children,
        seniors: validatedData.seniors,
        pets: validatedData.pets,
        groups: validatedData.groups,
        countingMethod: validatedData.countingMethod,
        dayType: validatedData.dayType || null,
        weather: validatedData.weather || null,
        notes: validatedData.notes,
        registeredBy: validatedData.registeredBy
      })
      .returning();

    console.log('✅ Registro creado exitosamente:', newRecord);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('❌ Error creando registro de visitantes:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Obtener estadísticas de visitantes por parque
router.get('/visitor-stats/:parkId', async (req, res) => {
  try {
    const { parkId } = req.params;
    const { year, month } = req.query;
    
    const currentDate = new Date();
    const targetYear = year ? Number(year) : currentDate.getFullYear();
    const targetMonth = month ? Number(month) : currentDate.getMonth() + 1;
    
    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];
    
    const monthlyStats = await db
      .select({
        totalVisitors: sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors})`,
        totalAdults: sql<number>`SUM(${visitorCounts.adults})`,
        totalChildren: sql<number>`SUM(${visitorCounts.children})`,
        totalSeniors: sql<number>`SUM(${visitorCounts.seniors})`,
        totalPets: sql<number>`SUM(${visitorCounts.pets})`,
        totalGroups: sql<number>`SUM(${visitorCounts.groups})`,
        avgDailyVisitors: sql<number>`AVG(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors})`,
        totalDays: sql<number>`COUNT(*)`,
        peakDay: sql<string>`MAX(${visitorCounts.date})`,
        peakVisitors: sql<number>`MAX(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors} + ${visitorCounts.pets} + ${visitorCounts.groups})`
      })
      .from(visitorCounts)
      .where(
        and(
          eq(visitorCounts.parkId, Number(parkId)),
          gte(visitorCounts.date, startDate),
          lte(visitorCounts.date, endDate)
        )
      );

    const yearlyStats = await db
      .select({
        totalVisitors: sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.groups})`,
        avgMonthlyVisitors: sql<number>`AVG(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.groups})`,
        totalDays: sql<number>`COUNT(*)`
      })
      .from(visitorCounts)
      .where(
        and(
          eq(visitorCounts.parkId, Number(parkId)),
          gte(visitorCounts.date, `${targetYear}-01-01`),
          lte(visitorCounts.date, `${targetYear}-12-31`)
        )
      );

    res.json({
      monthly: monthlyStats[0] || {},
      yearly: yearlyStats[0] || {},
      period: { year: targetYear, month: targetMonth }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de visitantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener resumen global de visitantes para dashboard
router.get('/visitor-summary', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Visitantes totales del año actual
    const yearlyTotal = await db
      .select({
        totalVisitors: sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.groups})`
      })
      .from(visitorCounts)
      .where(
        and(
          gte(visitorCounts.date, `${currentYear}-01-01`),
          lte(visitorCounts.date, `${currentYear}-12-31`)
        )
      );

    // Visitantes del mes actual
    const monthlyTotal = await db
      .select({
        totalVisitors: sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.groups})`
      })
      .from(visitorCounts)
      .where(
        and(
          gte(visitorCounts.date, `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`),
          lte(visitorCounts.date, new Date(currentYear, currentMonth, 0).toISOString().split('T')[0])
        )
      );

    // Top 5 parques con más visitantes
    const topParks = await db
      .select({
        parkId: visitorCounts.parkId,
        parkName: parks.name,
        totalVisitors: sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.groups})`
      })
      .from(visitorCounts)
      .leftJoin(parks, eq(visitorCounts.parkId, parks.id))
      .where(
        and(
          gte(visitorCounts.date, `${currentYear}-01-01`),
          lte(visitorCounts.date, `${currentYear}-12-31`)
        )
      )
      .groupBy(visitorCounts.parkId, parks.name)
      .orderBy(desc(sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.groups})`))
      .limit(5);

    res.json({
      yearly: yearlyTotal[0]?.totalVisitors || 0,
      monthly: monthlyTotal[0]?.totalVisitors || 0,
      topParks: topParks || [],
      period: { year: currentYear, month: currentMonth }
    });
  } catch (error) {
    console.error('Error obteniendo resumen de visitantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar registro de visitantes
router.put('/visitor-counts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = createVisitorCountSchema.partial().parse(req.body);
    
    const [updatedRecord] = await db
      .update(visitorCounts)
      .set(validatedData)
      .where(eq(visitorCounts.id, Number(id)))
      .returning();

    if (!updatedRecord) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json(updatedRecord);
  } catch (error) {
    console.error('Error actualizando registro de visitantes:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Eliminar registro de visitantes
router.delete('/visitor-counts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedRecord] = await db
      .delete(visitorCounts)
      .where(eq(visitorCounts.id, Number(id)))
      .returning();

    if (!deletedRecord) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando registro de visitantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;