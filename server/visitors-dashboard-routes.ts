import { Router } from 'express';
import { db } from './db';
import { visitorCounts, parks, parkEvaluations, parkFeedback } from '../shared/schema';
import { sql, eq, and, gte, lte, desc, asc } from 'drizzle-orm';

const router = Router();

// Obtener métricas del dashboard integral
router.get('/dashboard-metrics', async (req, res) => {
  try {
    const { park, dateRange } = req.query;
    const currentDate = new Date();
    const startDate = new Date();
    
    // Calcular fecha de inicio basada en el rango
    switch (dateRange) {
      case '7':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '30':
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case '90':
        startDate.setDate(currentDate.getDate() - 90);
        break;
      case '365':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(currentDate.getDate() - 30);
    }

    const dateFilter = startDate.toISOString().split('T')[0];
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    console.log('🔍 [DASHBOARD METRICS] Consultando métricas:', {
      park,
      dateRange,
      dateFilter,
      currentMonthStart: currentMonthStart.toISOString().split('T')[0],
      lastMonthStart: lastMonthStart.toISOString().split('T')[0]
    });

    // Condiciones de filtro
    const visitorConditions = [gte(visitorCounts.date, dateFilter)];
    const evaluationConditions = [gte(parkEvaluations.createdAt, dateFilter)];
    const feedbackConditions = [gte(parkFeedback.createdAt, dateFilter)];

    if (park && park !== 'all') {
      const parkId = parseInt(park as string);
      visitorConditions.push(eq(visitorCounts.parkId, parkId));
      evaluationConditions.push(eq(parkEvaluations.parkId, parkId));
      feedbackConditions.push(eq(parkFeedback.parkId, parkId));
    }

    // Métricas de visitantes
    const visitorMetrics = await db
      .select({
        total: sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors})`,
        totalRecords: sql<number>`COUNT(*)`,
        uniqueParks: sql<number>`COUNT(DISTINCT ${visitorCounts.parkId})`
      })
      .from(visitorCounts)
      .where(and(...visitorConditions));

    const visitorThisMonth = await db
      .select({
        total: sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors})`
      })
      .from(visitorCounts)
      .where(and(
        gte(visitorCounts.date, currentMonthStart.toISOString().split('T')[0]),
        ...(park && park !== 'all' ? [eq(visitorCounts.parkId, parseInt(park as string))] : [])
      ));

    const visitorLastMonth = await db
      .select({
        total: sql<number>`SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors})`
      })
      .from(visitorCounts)
      .where(and(
        gte(visitorCounts.date, lastMonthStart.toISOString().split('T')[0]),
        lte(visitorCounts.date, lastMonthEnd.toISOString().split('T')[0]),
        ...(park && park !== 'all' ? [eq(visitorCounts.parkId, parseInt(park as string))] : [])
      ));

    // Métricas de evaluaciones
    const evaluationMetrics = await db
      .select({
        total: sql<number>`COUNT(*)`,
        averageRating: sql<number>`ROUND(AVG(${parkEvaluations.overallRating}), 2)`,
        recommendationRate: sql<number>`ROUND(AVG(CASE WHEN ${parkEvaluations.wouldRecommend} = true THEN 100 ELSE 0 END), 2)`,
        avgCleanliness: sql<number>`ROUND(AVG(${parkEvaluations.cleanliness}), 2)`,
        avgSafety: sql<number>`ROUND(AVG(${parkEvaluations.safety}), 2)`,
        avgMaintenance: sql<number>`ROUND(AVG(${parkEvaluations.maintenance}), 2)`,
        avgAccessibility: sql<number>`ROUND(AVG(${parkEvaluations.accessibility}), 2)`,
        avgAmenities: sql<number>`ROUND(AVG(${parkEvaluations.amenities}), 2)`,
        avgActivities: sql<number>`ROUND(AVG(${parkEvaluations.activities}), 2)`,
        avgStaff: sql<number>`ROUND(AVG(${parkEvaluations.staff}), 2)`,
        avgNaturalBeauty: sql<number>`ROUND(AVG(${parkEvaluations.naturalBeauty}), 2)`
      })
      .from(parkEvaluations)
      .where(and(...evaluationConditions));

    const evaluationThisMonth = await db
      .select({
        total: sql<number>`COUNT(*)`
      })
      .from(parkEvaluations)
      .where(and(
        gte(parkEvaluations.createdAt, currentMonthStart.toISOString()),
        ...(park && park !== 'all' ? [eq(parkEvaluations.parkId, parseInt(park as string))] : [])
      ));

    const evaluationLastMonth = await db
      .select({
        total: sql<number>`COUNT(*)`
      })
      .from(parkEvaluations)
      .where(and(
        gte(parkEvaluations.createdAt, lastMonthStart.toISOString()),
        lte(parkEvaluations.createdAt, lastMonthEnd.toISOString()),
        ...(park && park !== 'all' ? [eq(parkEvaluations.parkId, parseInt(park as string))] : [])
      ));

    // Métricas de retroalimentación
    const feedbackMetrics = await db
      .select({
        total: sql<number>`COUNT(*)`,
        pending: sql<number>`SUM(CASE WHEN ${feedback.status} = 'pending' THEN 1 ELSE 0 END)`,
        resolved: sql<number>`SUM(CASE WHEN ${feedback.status} = 'resolved' THEN 1 ELSE 0 END)`,
        shareCount: sql<number>`SUM(CASE WHEN ${feedback.formType} = 'share' THEN 1 ELSE 0 END)`,
        problemCount: sql<number>`SUM(CASE WHEN ${feedback.formType} = 'report_problem' THEN 1 ELSE 0 END)`,
        improvementCount: sql<number>`SUM(CASE WHEN ${feedback.formType} = 'suggest_improvement' THEN 1 ELSE 0 END)`,
        eventCount: sql<number>`SUM(CASE WHEN ${feedback.formType} = 'propose_event' THEN 1 ELSE 0 END)`
      })
      .from(parkFeedback)
      .where(and(...feedbackConditions));

    const feedbackThisMonth = await db
      .select({
        total: sql<number>`COUNT(*)`
      })
      .from(parkFeedback)
      .where(and(
        gte(parkFeedback.createdAt, currentMonthStart.toISOString()),
        ...(park && park !== 'all' ? [eq(parkFeedback.parkId, parseInt(park as string))] : [])
      ));

    const feedbackLastMonth = await db
      .select({
        total: sql<number>`COUNT(*)`
      })
      .from(parkFeedback)
      .where(and(
        gte(parkFeedback.createdAt, lastMonthStart.toISOString()),
        lte(parkFeedback.createdAt, lastMonthEnd.toISOString()),
        ...(park && park !== 'all' ? [eq(parkFeedback.parkId, parseInt(park as string))] : [])
      ));

    // Calcular métricas finales
    const totalVisitors = visitorMetrics[0]?.total || 0;
    const totalRecords = visitorMetrics[0]?.totalRecords || 0;
    const avgDaily = totalRecords > 0 ? Math.round(totalVisitors / totalRecords) : 0;

    const evaluationTotal = evaluationMetrics[0]?.total || 0;
    const feedbackTotal = feedbackMetrics[0]?.total || 0;
    const feedbackResolved = feedbackMetrics[0]?.resolved || 0;
    const resolutionRate = feedbackTotal > 0 ? (feedbackResolved / feedbackTotal) * 100 : 0;

    const metrics = {
      visitors: {
        total: totalVisitors,
        thisMonth: visitorThisMonth[0]?.total || 0,
        lastMonth: visitorLastMonth[0]?.total || 0,
        avgDaily: avgDaily,
        uniqueParks: visitorMetrics[0]?.uniqueParks || 0,
        totalRecords: totalRecords
      },
      evaluations: {
        total: evaluationTotal,
        averageRating: evaluationMetrics[0]?.averageRating || 0,
        thisMonth: evaluationThisMonth[0]?.total || 0,
        lastMonth: evaluationLastMonth[0]?.total || 0,
        recommendationRate: evaluationMetrics[0]?.recommendationRate || 0,
        categoryAverages: {
          cleanliness: evaluationMetrics[0]?.avgCleanliness || 0,
          safety: evaluationMetrics[0]?.avgSafety || 0,
          maintenance: evaluationMetrics[0]?.avgMaintenance || 0,
          accessibility: evaluationMetrics[0]?.avgAccessibility || 0,
          amenities: evaluationMetrics[0]?.avgAmenities || 0,
          activities: evaluationMetrics[0]?.avgActivities || 0,
          staff: evaluationMetrics[0]?.avgStaff || 0,
          naturalBeauty: evaluationMetrics[0]?.avgNaturalBeauty || 0
        }
      },
      feedback: {
        total: feedbackTotal,
        pending: feedbackMetrics[0]?.pending || 0,
        resolved: feedbackResolved,
        thisMonth: feedbackThisMonth[0]?.total || 0,
        lastMonth: feedbackLastMonth[0]?.total || 0,
        byType: {
          share: feedbackMetrics[0]?.shareCount || 0,
          report_problem: feedbackMetrics[0]?.problemCount || 0,
          suggest_improvement: feedbackMetrics[0]?.improvementCount || 0,
          propose_event: feedbackMetrics[0]?.eventCount || 0
        },
        resolutionRate: resolutionRate
      }
    };

    console.log('✅ [DASHBOARD METRICS] Métricas calculadas:', metrics);

    res.json({ metrics });
  } catch (error) {
    console.error('❌ Error obteniendo métricas del dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener rendimiento por parques
router.get('/parks-performance', async (req, res) => {
  try {
    const { park, dateRange } = req.query;
    const currentDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '30':
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case '90':
        startDate.setDate(currentDate.getDate() - 90);
        break;
      case '365':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(currentDate.getDate() - 30);
    }

    const dateFilter = startDate.toISOString().split('T')[0];

    // Obtener datos de rendimiento por parque
    let parkQuery = db
      .select({
        parkId: parks.id,
        parkName: parks.name,
        visitors: sql<number>`COALESCE(SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors}), 0)`,
        evaluations: sql<number>`COUNT(DISTINCT ${parkEvaluations.id})`,
        avgRating: sql<number>`COALESCE(AVG(${parkEvaluations.overallRating}), 0)`,
        feedback: sql<number>`COUNT(DISTINCT ${feedback.id})`,
        pendingFeedback: sql<number>`SUM(CASE WHEN ${feedback.status} = 'pending' THEN 1 ELSE 0 END)`
      })
      .from(parks)
      .leftJoin(visitorCounts, and(
        eq(parks.id, visitorCounts.parkId),
        gte(visitorCounts.date, dateFilter)
      ))
      .leftJoin(parkEvaluations, and(
        eq(parks.id, parkEvaluations.parkId),
        gte(parkEvaluations.createdAt, dateFilter)
      ))
      .leftJoin(feedback, and(
        eq(parks.id, parkFeedback.parkId),
        gte(parkFeedback.createdAt, dateFilter)
      ))
      .groupBy(parks.id, parks.name)
      .orderBy(desc(sql<number>`COALESCE(SUM(${visitorCounts.adults} + ${visitorCounts.children} + ${visitorCounts.seniors}), 0)`));

    if (park && park !== 'all') {
      parkQuery = parkQuery.where(eq(parks.id, parseInt(park as string)));
    }

    const parksData = await parkQuery;

    console.log('🏞️ [PARKS PERFORMANCE] Datos obtenidos:', parksData.length);

    res.json({ parks: parksData });
  } catch (error) {
    console.error('❌ Error obteniendo rendimiento por parques:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener datos de tendencias
router.get('/trends', async (req, res) => {
  try {
    const { park, dateRange } = req.query;
    const currentDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '30':
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case '90':
        startDate.setDate(currentDate.getDate() - 90);
        break;
      case '365':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(currentDate.getDate() - 30);
    }

    const dateFilter = startDate.toISOString().split('T')[0];

    // Condiciones de filtro ya definidas arriba
    const visitorConditions = [gte(visitorCounts.date, dateFilter)];
    const evaluationConditions = [gte(parkEvaluations.createdAt, dateFilter)];
    const feedbackConditions = [gte(parkFeedback.createdAt, dateFilter)];

    if (park && park !== 'all') {
      const parkId = parseInt(park as string);
      visitorConditions.push(eq(visitorCounts.parkId, parkId));
      evaluationConditions.push(eq(parkEvaluations.parkId, parkId));
      feedbackConditions.push(eq(parkFeedback.parkId, parkId));
    }

    // Obtener datos usando Drizzle ORM
    const visitorData = await db.select({
      date: visitorCounts.date,
      visitors: sql<number>`sum(${visitorCounts.count})::int`
    })
    .from(visitorCounts)
    .where(and(...visitorConditions))
    .groupBy(visitorCounts.date)
    .orderBy(asc(visitorCounts.date));

    const evaluationData = await db.select({
      date: sql<string>`${parkEvaluations.createdAt}::date`,
      evaluations: sql<number>`count(*)::int`
    })
    .from(parkEvaluations)
    .where(and(...evaluationConditions))
    .groupBy(sql`${parkEvaluations.createdAt}::date`)
    .orderBy(sql`${parkEvaluations.createdAt}::date`);

    const feedbackData = await db.select({
      date: sql<string>`${parkFeedback.createdAt}::date`,
      feedback: sql<number>`count(*)::int`
    })
    .from(parkFeedback)
    .where(and(...feedbackConditions))
    .groupBy(sql`${parkFeedback.createdAt}::date`)
    .orderBy(sql`${parkFeedback.createdAt}::date`);

    // Combinar datos por fecha
    const trendsMap = new Map();
    
    visitorData.forEach(row => {
      const dateStr = row.date;
      if (!trendsMap.has(dateStr)) {
        trendsMap.set(dateStr, { date: dateStr, visitors: 0, evaluations: 0, feedback: 0 });
      }
      trendsMap.get(dateStr).visitors = row.visitors;
    });

    evaluationData.forEach(row => {
      const dateStr = row.date;
      if (!trendsMap.has(dateStr)) {
        trendsMap.set(dateStr, { date: dateStr, visitors: 0, evaluations: 0, feedback: 0 });
      }
      trendsMap.get(dateStr).evaluations = row.evaluations;
    });

    feedbackData.forEach(row => {
      const dateStr = row.date;
      if (!trendsMap.has(dateStr)) {
        trendsMap.set(dateStr, { date: dateStr, visitors: 0, evaluations: 0, feedback: 0 });
      }
      trendsMap.get(dateStr).feedback = row.feedback;
    });

    const trends = Array.from(trendsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    console.log('📊 [TRENDS] Datos de tendencias obtenidos:', trends.length);

    res.json({ trends });
  } catch (error) {
    console.error('❌ Error obteniendo datos de tendencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;