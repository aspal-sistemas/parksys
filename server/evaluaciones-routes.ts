import express from 'express';
import { db } from './db';
import { 
  universalEvaluations, 
  evaluationCriteria, 
  evaluationResponses,
  evaluationCriteriaAssignments,
  parkEvaluations,
  parks,
  instructorEvaluations,
  instructors,
  volunteerEvaluations,
  volunteers,
  activities,
  concessionaireProfiles
} from '../shared/schema';
import { eq, desc, sql, count, avg, and } from 'drizzle-orm';

const router = express.Router();

// Estadísticas generales del sistema de evaluaciones
router.get('/api/evaluations/stats', async (req, res) => {
  try {
    // Obtener estadísticas de parques
    const parkStats = await db
      .select({
        total: count(),
        avgRating: avg(parkEvaluations.overallRating)
      })
      .from(parkEvaluations);

    // Obtener estadísticas de instructores
    const instructorStats = await db
      .select({
        total: count(),
        avgRating: avg(instructorEvaluations.overallRating)
      })
      .from(instructorEvaluations);

    // Obtener estadísticas de voluntarios
    const volunteerStats = await db
      .select({
        total: count(),
        avgRating: avg(volunteerEvaluations.overallRating)
      })
      .from(volunteerEvaluations);

    // Obtener estadísticas de evaluaciones universales (actividades, concesionarios, eventos)
    const universalStats = await db
      .select({
        entityType: universalEvaluations.entityType,
        total: count(),
        avgRating: avg(universalEvaluations.overallRating)
      })
      .from(universalEvaluations)
      .groupBy(universalEvaluations.entityType);

    // Compilar estadísticas
    const stats = {
      parks: {
        total: parkStats[0]?.total || 0,
        averageRating: parseFloat(parkStats[0]?.avgRating?.toString() || '0')
      },
      instructors: {
        total: instructorStats[0]?.total || 0,
        averageRating: parseFloat(instructorStats[0]?.avgRating?.toString() || '0')
      },
      volunteers: {
        total: volunteerStats[0]?.total || 0,
        averageRating: parseFloat(volunteerStats[0]?.avgRating?.toString() || '0')
      },
      activities: {
        total: 0,
        averageRating: 0
      },
      concessionaires: {
        total: 0,
        averageRating: 0
      },
      events: {
        total: 0,
        averageRating: 0
      }
    };

    // Procesar estadísticas universales
    universalStats.forEach((stat: any) => {
      const entityType = stat.entityType as string;
      if (entityType === 'activity') {
        stats.activities.total = stat.total;
        stats.activities.averageRating = parseFloat(stat.avgRating?.toString() || '0');
      } else if (entityType === 'concessionaire') {
        stats.concessionaires.total = stat.total;
        stats.concessionaires.averageRating = parseFloat(stat.avgRating?.toString() || '0');
      } else if (entityType === 'event') {
        stats.events.total = stat.total;
        stats.events.averageRating = parseFloat(stat.avgRating?.toString() || '0');
      }
    });

    const totals = {
      totalEvaluations: stats.parks.total + stats.instructors.total + stats.volunteers.total + 
                       stats.activities.total + stats.concessionaires.total + stats.events.total,
      averageOverallRating: ((stats.parks.averageRating + stats.instructors.averageRating + 
                             stats.volunteers.averageRating + stats.activities.averageRating + 
                             stats.concessionaires.averageRating + stats.events.averageRating) / 6).toFixed(1)
    };

    res.json({
      ...stats,
      ...totals,
      categories: [
        { name: 'Parques', value: 'parks', count: stats.parks.total },
        { name: 'Instructores', value: 'instructors', count: stats.instructors.total },
        { name: 'Voluntarios', value: 'volunteers', count: stats.volunteers.total },
        { name: 'Actividades', value: 'activities', count: stats.activities.total },
        { name: 'Concesionarios', value: 'concessionaires', count: stats.concessionaires.total },
        { name: 'Eventos', value: 'events', count: stats.events.total }
      ]
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de evaluaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de parques
router.get('/api/evaluations/parks', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: parkEvaluations.id,
        parkName: parks.name,
        evaluatorName: parkEvaluations.evaluatorName,
        overallRating: parkEvaluations.overallRating,
        status: parkEvaluations.status,
        createdAt: parkEvaluations.createdAt
      })
      .from(parkEvaluations)
      .leftJoin(parks, eq(parkEvaluations.parkId, parks.id))
      .orderBy(desc(parkEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de parques:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de instructores
router.get('/api/evaluations/instructors', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: instructorEvaluations.id,
        instructorName: sql`${instructors.firstName} || ' ' || ${instructors.lastName}`,
        evaluatorName: instructorEvaluations.evaluatorName,
        overallRating: instructorEvaluations.overallRating,
        status: instructorEvaluations.status,
        createdAt: instructorEvaluations.createdAt
      })
      .from(instructorEvaluations)
      .leftJoin(instructors, eq(instructorEvaluations.instructorId, instructors.id))
      .orderBy(desc(instructorEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de instructores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de voluntarios
router.get('/api/evaluations/volunteers', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: volunteerEvaluations.id,
        volunteerName: sql`${volunteers.firstName} || ' ' || ${volunteers.lastName}`,
        evaluatorName: volunteerEvaluations.evaluatorName,
        overallRating: volunteerEvaluations.overallRating,
        status: volunteerEvaluations.status,
        createdAt: volunteerEvaluations.createdAt
      })
      .from(volunteerEvaluations)
      .leftJoin(volunteers, eq(volunteerEvaluations.volunteerId, volunteers.id))
      .orderBy(desc(volunteerEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de voluntarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de actividades
router.get('/api/evaluations/activities', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: universalEvaluations.id,
        activityName: activities.title,
        evaluatorName: universalEvaluations.evaluatorName,
        overallRating: universalEvaluations.overallRating,
        status: universalEvaluations.status,
        createdAt: universalEvaluations.createdAt
      })
      .from(universalEvaluations)
      .leftJoin(activities, eq(universalEvaluations.entityId, activities.id))
      .where(eq(universalEvaluations.entityType, 'activity'))
      .orderBy(desc(universalEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de actividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de concesionarios
router.get('/api/evaluations/concessionaires', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: universalEvaluations.id,
        concessionaireName: concessionaireProfiles.businessName,
        evaluatorName: universalEvaluations.evaluatorName,
        overallRating: universalEvaluations.overallRating,
        status: universalEvaluations.status,
        createdAt: universalEvaluations.createdAt
      })
      .from(universalEvaluations)
      .leftJoin(concessionaireProfiles, eq(universalEvaluations.entityId, concessionaireProfiles.id))
      .where(eq(universalEvaluations.entityType, 'concessionaire'))
      .orderBy(desc(universalEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de concesionarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evaluaciones de eventos
router.get('/api/evaluations/events', async (req, res) => {
  try {
    const evaluations = await db
      .select({
        id: universalEvaluations.id,
        eventName: sql`'Evento ID: ' || ${universalEvaluations.entityId}`,
        evaluatorName: universalEvaluations.evaluatorName,
        overallRating: universalEvaluations.overallRating,
        status: universalEvaluations.status,
        createdAt: universalEvaluations.createdAt
      })
      .from(universalEvaluations)
      .where(eq(universalEvaluations.entityType, 'event'))
      .orderBy(desc(universalEvaluations.createdAt));

    res.json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones de eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener criterios de evaluación
router.get('/api/evaluations/criteria', async (req, res) => {
  try {
    const criteria = await db
      .select()
      .from(evaluationCriteria)
      .where(eq(evaluationCriteria.isActive, true))
      .orderBy(evaluationCriteria.sortOrder, evaluationCriteria.name);

    res.json(criteria);
  } catch (error) {
    console.error('Error al obtener criterios de evaluación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener criterios por tipo de entidad
router.get('/api/evaluations/criteria/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;
    
    const criteria = await db
      .select({
        id: evaluationCriteria.id,
        name: evaluationCriteria.name,
        label: evaluationCriteria.label,
        description: evaluationCriteria.description,
        fieldType: evaluationCriteria.fieldType,
        minValue: evaluationCriteria.minValue,
        maxValue: evaluationCriteria.maxValue,
        isRequired: evaluationCriteriaAssignments.isRequired,
        sortOrder: evaluationCriteriaAssignments.sortOrder
      })
      .from(evaluationCriteria)
      .innerJoin(evaluationCriteriaAssignments, eq(evaluationCriteria.id, evaluationCriteriaAssignments.criteriaId))
      .where(
        and(
          eq(evaluationCriteriaAssignments.entityType, entityType as any),
          eq(evaluationCriteria.isActive, true),
          eq(evaluationCriteriaAssignments.isActive, true)
        )
      )
      .orderBy(evaluationCriteriaAssignments.sortOrder, evaluationCriteria.name);

    res.json(criteria);
  } catch (error) {
    console.error('Error al obtener criterios por tipo de entidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;